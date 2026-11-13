// Volantini e locandine: ogni campagna ha un codice e un QR (/v/CODICE) che porta alla prenotazione.
// GET  /api/gestione/campagne → elenco con visite, prenotazioni e incasso
// POST { azione: 'crea', nome, codice? } | { azione: 'attiva' | 'disattiva', id }
import { tutte, esegui, registra } from '../../_lib/db.js';
import { richiedi } from '../../_lib/accessi.js';
import { Errore, json, leggiJson, controllaOrigine, testo, codiceCasuale } from '../../_lib/util.js';

export async function onRequestGet({ request, env }) {
  await richiedi(env.DB, request, 'gestione');
  const righe = await tutte(env.DB, `SELECT c.*,
      (SELECT COUNT(*) FROM prenotazioni p WHERE p.campagna = c.codice AND p.stato = 'confermata') AS prenotazioni,
      (SELECT COALESCE(SUM(p.adulti + p.bambini + p.neonati), 0) FROM prenotazioni p WHERE p.campagna = c.codice AND p.stato = 'confermata') AS persone,
      (SELECT COALESCE(SUM(p.totale), 0) FROM prenotazioni p WHERE p.campagna = c.codice AND p.stato = 'confermata') AS incasso
    FROM campagne c ORDER BY c.attiva DESC, c.id DESC`, {});
  const origine = new URL(request.url).origin;
  return json({ campagne: righe.map((c) => ({ id: c.id, codice: c.codice, nome: c.nome, visite: c.visite, attiva: Boolean(c.attiva), creataIl: c.creata_il, prenotazioni: c.prenotazioni, persone: c.persone, incasso: c.incasso / 100, link: `${origine}/v/${c.codice}` })) });
}

export async function onRequestPost({ request, env }) {
  controllaOrigine(request);
  const u = await richiedi(env.DB, request, 'gestione');
  const b = await leggiJson(request, 1000);
  if (b.azione === 'crea') {
    const nome = testo(b.nome, { campo: 'nome', massimo: 80, obbligatorio: true });
    let codice = testo(b.codice, { campo: 'codice', massimo: 20 }).toUpperCase().replace(/\s+/g, '');
    if (codice && !/^[A-Z0-9-]{2,20}$/.test(codice)) throw new Errore(400, 'Il codice può avere solo lettere, numeri e trattini.');
    if (!codice) codice = codiceCasuale(5);
    try {
      await esegui(env.DB, 'INSERT INTO campagne (codice, nome) VALUES (:c, :n)', { c: codice, n: nome });
    } catch (e) {
      if (String(e?.message || e).includes('UNIQUE')) throw new Errore(409, 'Questo codice esiste già.');
      throw e;
    }
  } else if (['attiva', 'disattiva'].includes(b.azione)) {
    await esegui(env.DB, 'UPDATE campagne SET attiva = :a WHERE id = :id', { a: b.azione === 'attiva' ? 1 : 0, id: Number(b.id) || 0 });
  } else throw new Errore(400, 'Azione non valida.');
  await registra(env.DB, `gestione:${u.id}`, `campagna-${b.azione}`, { nome: b.nome, id: b.id });
  return json({ ok: true });
}
