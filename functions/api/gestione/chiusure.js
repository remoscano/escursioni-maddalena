// GET    /api/gestione/chiusure?dal=&al=           → chiusure nel periodo
// POST   { azione: 'chiudi', data, barca, blocchi, motivo }                       → chiude un gommone (o tutti: barca '*')
// POST   { azione: 'annulla-uscita', data, barca, escursione, turno, motivo }     → maltempo: annulla l'uscita e chiude il gommone
// DELETE /api/gestione/chiusure?id=                → riapre
import { gommoni, turnoDi } from '../../../src/data/prenotazioni.js';
import { tutte, esegui, istruzione, registra } from '../../_lib/db.js';
import { richiedi } from '../../_lib/accessi.js';
import { Errore, json, leggiJson, controllaOrigine, dataValida, testo } from '../../_lib/util.js';

const BLOCCHI = ['mattina', 'pomeriggio', 'sera'];

export async function onRequestGet({ request, env }) {
  await richiedi(env.DB, request, 'gestione');
  const u = new URL(request.url).searchParams;
  if (!dataValida(u.get('dal')) || !dataValida(u.get('al'))) throw new Errore(400, 'Periodo non valido.');
  return json({ chiusure: await tutte(env.DB, 'SELECT * FROM blocchi WHERE data BETWEEN :dal AND :al ORDER BY data, barca, blocco', { dal: u.get('dal'), al: u.get('al') }) });
}

export async function onRequestPost({ request, env }) {
  controllaOrigine(request);
  const u = await richiedi(env.DB, request, 'gestione');
  const b = await leggiJson(request, 4000);
  if (!dataValida(b.data)) throw new Errore(400, 'Data non valida.');
  const barca = b.barca === '*' ? '*' : gommoni.find((g) => g.id === b.barca)?.id;
  if (!barca) throw new Errore(400, 'Gommone non valido.');
  const motivo = testo(b.motivo, { campo: 'motivo', massimo: 200 }) || null;
  const chi = `gestione:${u.id}`;

  let blocchi;
  let annullate = [];
  if (b.azione === 'chiudi') {
    blocchi = Array.isArray(b.blocchi) ? b.blocchi.filter((x) => BLOCCHI.includes(x)) : [];
    if (!blocchi.length) throw new Errore(400, 'Scegli almeno mattina, pomeriggio o sera.');
  } else if (b.azione === 'annulla-uscita') {
    const t = turnoDi(b.escursione, b.turno);
    if (!t || barca === '*') throw new Errore(400, 'Uscita non valida.');
    blocchi = t.blocchi;
    annullate = await tutte(env.DB, `SELECT id, codice, nome, telefono, email, pagato, metodo FROM prenotazioni
                                     WHERE data = :data AND barca = :barca AND escursione = :e AND turno = :t AND stato IN ('confermata', 'da_verificare', 'in_attesa')`,
      { data: b.data, barca, e: b.escursione, t: b.turno });
  } else {
    throw new Errore(400, 'Azione non valida.');
  }

  const ora = new Date().toISOString();
  const istruzioni = blocchi.map((bl) => istruzione(env.DB,
    'INSERT OR IGNORE INTO blocchi (data, barca, blocco, motivo, creato_da) VALUES (:data, :barca, :blocco, :motivo, :chi)',
    { data: b.data, barca, blocco: bl, motivo, chi }));
  for (const p of annullate) {
    const rimborso = p.pagato > 0 && ['sumup', 'paypal', 'prova'].includes(p.metodo) ? 'da_fare' : null;
    istruzioni.push(istruzione(env.DB, "UPDATE prenotazioni SET stato = 'annullata', rimborso = :r, note = COALESCE(note || char(10), '') || :n, aggiornata_il = :ora WHERE id = :id",
      { r: rimborso, n: `Uscita annullata${motivo ? `: ${motivo}` : ''}`, ora, id: p.id }));
  }
  await env.DB.batch(istruzioni);
  await registra(env.DB, chi, b.azione, { data: b.data, barca, blocchi, motivo, annullate: annullate.map((p) => p.codice) });
  return json({ ok: true, annullate: annullate.map(({ codice, nome, telefono, email }) => ({ codice, nome, telefono, email })) });
}

export async function onRequestDelete({ request, env }) {
  controllaOrigine(request);
  const u = await richiedi(env.DB, request, 'gestione');
  const id = Number(new URL(request.url).searchParams.get('id')) || 0;
  await esegui(env.DB, 'DELETE FROM blocchi WHERE id = :id', { id });
  await registra(env.DB, `gestione:${u.id}`, 'riapri', { id });
  return json({ ok: true });
}
