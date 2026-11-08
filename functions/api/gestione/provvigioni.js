// GET  /api/gestione/provvigioni?dal=&al= → provvigioni per struttura in una quindicina (data dell'escursione)
// POST { partnerId, dal, al, note? }     → segna la quindicina come pagata
import { tutte, prima, esegui, registra } from '../../_lib/db.js';
import { richiedi } from '../../_lib/accessi.js';
import { quindicinaDi, quindicinePrecedenti } from '../../_lib/periodi.js';
import { Errore, json, leggiJson, controllaOrigine, dataValida, oraRoma, testo } from '../../_lib/util.js';

export async function onRequestGet({ request, env }) {
  await richiedi(env.DB, request, 'gestione');
  const u = new URL(request.url).searchParams;
  const oggi = oraRoma().data;
  const periodo = dataValida(u.get('dal')) ? quindicinaDi(u.get('dal')) : quindicinePrecedenti(oggi, 2)[1];
  const righe = await tutte(env.DB, `SELECT pa.id, pa.nome, pa.codice, pa.email,
      COUNT(p.id) AS numero, COALESCE(SUM(p.totale), 0) AS venduto, COALESCE(SUM(p.provvigione), 0) AS provvigione,
      l.importo AS pagato, l.pagata_il
    FROM partner pa
    LEFT JOIN prenotazioni p ON p.partner_id = pa.id AND p.stato = 'confermata' AND p.data BETWEEN :dal AND :al
    LEFT JOIN liquidazioni l ON l.partner_id = pa.id AND l.dal = :dal AND l.al = :al
    GROUP BY pa.id ORDER BY provvigione DESC, pa.nome`, periodo);
  return json({
    periodo,
    concluso: periodo.al < oggi,
    quindicine: quindicinePrecedenti(oggi, 14),
    strutture: righe.map((r) => ({
      id: r.id, nome: r.nome, codice: r.codice, email: r.email, numero: r.numero,
      venduto: r.venduto / 100, provvigione: r.provvigione / 100,
      pagato: r.pagato === null ? null : r.pagato / 100, pagataIl: r.pagata_il,
    })),
  });
}

export async function onRequestPost({ request, env }) {
  controllaOrigine(request);
  const u = await richiedi(env.DB, request, 'gestione');
  const b = await leggiJson(request, 2000);
  if (!dataValida(b.dal)) throw new Errore(400, 'Periodo non valido.');
  const periodo = quindicinaDi(b.dal);
  if (periodo.al >= oraRoma().data) throw new Errore(409, 'La quindicina non è ancora finita.');
  const partnerId = Number(b.partnerId) || 0;
  const somma = await prima(env.DB, `SELECT COALESCE(SUM(provvigione), 0) AS importo FROM prenotazioni
                                     WHERE partner_id = :p AND stato = 'confermata' AND data BETWEEN :dal AND :al`, { p: partnerId, ...periodo });
  if (!somma?.importo) throw new Errore(400, 'Nessuna provvigione da pagare in questa quindicina.');
  try {
    await esegui(env.DB, 'INSERT INTO liquidazioni (partner_id, dal, al, importo, pagata_il, note, creata_da) VALUES (:p, :dal, :al, :i, :ora, :n, :chi)', {
      p: partnerId, ...periodo, i: somma.importo, ora: new Date().toISOString(), n: testo(b.note, { campo: 'note', massimo: 200 }) || null, chi: `gestione:${u.id}`,
    });
  } catch (e) {
    if (String(e?.message || e).includes('UNIQUE')) throw new Errore(409, 'Questa quindicina risulta già pagata.');
    throw e;
  }
  await registra(env.DB, `gestione:${u.id}`, 'provvigione-pagata', { partnerId, ...periodo, importo: somma.importo });
  return json({ ok: true, importo: somma.importo / 100 });
}
