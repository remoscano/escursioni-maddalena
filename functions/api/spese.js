// Spese di bordo, per lo skipper (e per la gestione, che può usare la stessa pagina).
// GET    /api/spese?mese=AAAA-MM → calendario del mese: giorni lavorati, rendiconti, giorni da compilare
// POST   /api/spese { data, barca, litri, carburante, bevande, cibo, altro, note } → salva (o corregge) il rendiconto di quel giorno e gommone
// DELETE /api/spese?id= → cancella un proprio rendiconto
import { regole, gommoni } from '../../src/data/prenotazioni.js';
import { tutte, prima, esegui, registra } from '../_lib/db.js';
import { richiedi } from '../_lib/accessi.js';
import { giorniLavorati, giorniMancanti, vistaRendiconto, gommoniSpese, chiDi } from '../_lib/spese.js';
import { Errore, json, leggiJson, controllaOrigine, dataValida, oraRoma, aggiungiGiorni, testoLungo } from '../_lib/util.js';

const limite = () => aggiungiGiorni(oraRoma().data, -regole.spese.giorniModifica);

function modificabile(utente, data) {
  const oggi = oraRoma().data;
  if (data > oggi) throw new Errore(400, 'Non puoi scrivere le spese di un giorno che deve ancora venire.');
  if (utente.ruolo === 'skipper' && data < limite()) throw new Errore(403, `Puoi correggere solo gli ultimi ${regole.spese.giorniModifica} giorni: per date più vecchie chiedi all'ufficio.`);
}

const euro = (v, campo) => {
  if (v === undefined || v === null || String(v).trim() === '') return 0;
  const n = Number(String(v).replace(',', '.'));
  if (!Number.isFinite(n) || n < 0 || n > 20000) throw new Errore(400, `Importo non valido: ${campo}.`);
  return Math.round(n * 100);
};

export async function onRequestGet({ request, env }) {
  const u = await richiedi(env.DB, request, ['skipper', 'gestione']);
  const mese = new URL(request.url).searchParams.get('mese') || oraRoma().data.slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mese)) throw new Errore(400, 'Mese non valido.');
  const [a, m] = mese.split('-').map(Number);
  const dal = `${mese}-01`;
  const al = `${mese}-${String(new Date(Date.UTC(a, m, 0)).getUTCDate()).padStart(2, '0')}`;
  const [lavorati, righe, mancanti] = await Promise.all([
    giorniLavorati(env.DB, u, dal, al),
    tutte(env.DB, 'SELECT * FROM rendiconti WHERE utente_id = :u AND data BETWEEN :dal AND :al ORDER BY data, barca', { u: u.id, dal, al }),
    giorniMancanti(env.DB, u),
  ]);
  const giorni = {};
  for (const [data, barca] of lavorati) giorni[data] = { lavorato: true, barca, rendiconti: [] };
  for (const r of righe) (giorni[r.data] ??= { lavorato: false, barca: null, rendiconti: [] }).rendiconti.push(vistaRendiconto(r));
  return json({ mese, oggi: oraRoma().data, limite: u.ruolo === 'skipper' ? limite() : null, giorni, mancanti, gommoni: gommoniSpese() });
}

export async function onRequestPost({ request, env }) {
  controllaOrigine(request);
  const u = await richiedi(env.DB, request, ['skipper', 'gestione']);
  const b = await leggiJson(request, 4000);
  if (!dataValida(b.data)) throw new Errore(400, 'Data non valida.');
  modificabile(u, b.data);
  if (!gommoni.some((g) => g.id === b.barca)) throw new Errore(400, 'Scegli il gommone.');
  const litri = b.litri === undefined || b.litri === null || String(b.litri).trim() === '' ? 0 : Number(String(b.litri).replace(',', '.'));
  if (!Number.isFinite(litri) || litri < 0 || litri > 5000) throw new Errore(400, 'Litri non validi.');
  const dati = {
    u: u.id, data: b.data, barca: b.barca, litri: Math.round(litri * 10) / 10,
    carburante: euro(b.carburante, 'carburante'), bevande: euro(b.bevande, 'bevande'), cibo: euro(b.cibo, 'cibo'), altro: euro(b.altro, 'altro'),
    note: testoLungo(b.note, 500) || null, ora: new Date().toISOString(),
  };
  if (dati.litri > 0 && dati.carburante === 0) throw new Errore(400, 'Hai scritto i litri: scrivi anche quanto hai speso per il carburante.');
  if (dati.carburante > 0 && dati.litri === 0) throw new Errore(400, 'Hai scritto quanto hai speso per il carburante: scrivi anche i litri.');
  if (dati.altro > 0 && !dati.note) throw new Errore(400, 'Per le spese "altro" scrivi nelle note di cosa si tratta.');
  await esegui(env.DB, `INSERT INTO rendiconti (utente_id, data, barca, litri, carburante, bevande, cibo, altro, note)
      VALUES (:u, :data, :barca, :litri, :carburante, :bevande, :cibo, :altro, :note)
      ON CONFLICT (utente_id, data, barca) DO UPDATE SET litri = :litri, carburante = :carburante, bevande = :bevande, cibo = :cibo,
        altro = :altro, note = :note, aggiornato_il = :ora`, dati);
  await registra(env.DB, chiDi(u), 'spese-salvate', { data: b.data, barca: b.barca });
  const r = await prima(env.DB, 'SELECT * FROM rendiconti WHERE utente_id = :u AND data = :data AND barca = :barca', dati);
  return json({ ok: true, rendiconto: vistaRendiconto(r), mancanti: await giorniMancanti(env.DB, u) });
}

export async function onRequestDelete({ request, env }) {
  controllaOrigine(request);
  const u = await richiedi(env.DB, request, ['skipper', 'gestione']);
  const id = Number(new URL(request.url).searchParams.get('id')) || 0;
  const r = await prima(env.DB, 'SELECT * FROM rendiconti WHERE id = :id', { id });
  if (!r || (u.ruolo !== 'gestione' && r.utente_id !== u.id)) throw new Errore(404, 'Spesa non trovata.');
  modificabile(u, r.data);
  await esegui(env.DB, 'DELETE FROM rendiconti WHERE id = :id', { id });
  await registra(env.DB, chiDi(u), 'spese-cancellate', { data: r.data, barca: r.barca, utente: r.utente_id });
  return json({ ok: true, mancanti: await giorniMancanti(env.DB, u) });
}
