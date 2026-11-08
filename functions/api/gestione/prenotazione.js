// POST /api/gestione/prenotazione { id, azione, motivo? }
//   annulla   → annullata (se era pagata online: rimborso da fare)
//   rimborsata → rimborso fatto
//   conferma  → una prenotazione "da verificare" diventa confermata
import { prima, esegui, registra } from '../../_lib/db.js';
import { richiedi } from '../../_lib/accessi.js';
import { Errore, json, leggiJson, controllaOrigine, testo } from '../../_lib/util.js';

export async function onRequestPost({ request, env }) {
  controllaOrigine(request);
  const u = await richiedi(env.DB, request, 'gestione');
  const b = await leggiJson(request, 4000);
  const p = await prima(env.DB, 'SELECT * FROM prenotazioni WHERE id = :id', { id: Number(b.id) || 0 });
  if (!p) throw new Errore(404, 'Prenotazione non trovata.');
  const ora = new Date().toISOString();
  const motivo = testo(b.motivo, { campo: 'motivo', massimo: 200 });
  if (b.azione === 'annulla') {
    if (!['confermata', 'da_verificare', 'in_attesa'].includes(p.stato)) throw new Errore(409, 'Questa prenotazione non si può annullare.');
    const rimborso = p.pagato > 0 && ['sumup', 'paypal', 'prova'].includes(p.metodo) ? 'da_fare' : null;
    const note = motivo ? `${p.note ? `${p.note}\n` : ''}Annullata: ${motivo}` : p.note;
    await esegui(env.DB, "UPDATE prenotazioni SET stato = 'annullata', rimborso = :r, note = :n, aggiornata_il = :ora WHERE id = :id", { r: rimborso, n: note, ora, id: p.id });
  } else if (b.azione === 'rimborsata') {
    await esegui(env.DB, "UPDATE prenotazioni SET rimborso = 'fatto', aggiornata_il = :ora WHERE id = :id", { ora, id: p.id });
  } else if (b.azione === 'conferma') {
    if (p.stato !== 'da_verificare') throw new Errore(409, 'Solo le prenotazioni da verificare si confermano a mano.');
    await esegui(env.DB, "UPDATE prenotazioni SET stato = 'confermata', aggiornata_il = :ora WHERE id = :id", { ora, id: p.id });
  } else {
    throw new Errore(400, 'Azione non valida.');
  }
  await registra(env.DB, `gestione:${u.id}`, `prenotazione-${b.azione}`, { codice: p.codice, motivo });
  return json({ ok: true });
}
