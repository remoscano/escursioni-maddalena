// Check-in all'imbarco (skipper e gestione).
// GET  /api/imbarco?codice=EM-XXXXXX → dati della prenotazione per il controllo (dal QR del biglietto)
// POST /api/imbarco { codice, annulla? } → segna (o toglie) l'imbarco
import { turnoDi, orarioDi } from '../../src/data/prenotazioni.js';
import { prima, esegui, registra } from '../_lib/db.js';
import { richiedi } from '../_lib/accessi.js';
import { titoloEscursione, nomeImbarco, nomeGommone, daPagare } from '../_lib/prenotazioni.js';
import { extraDi } from '../_lib/offerte.js';
import { Errore, json, leggiJson, controllaOrigine, oraRoma, dataLeggibile } from '../_lib/util.js';

const pulisci = (c) => String(c || '').trim().toUpperCase().replace(/\s+/g, '').replace(/^EM(?!-)/, 'EM-').slice(0, 20);

async function vista(db, p, utente) {
  const oggi = oraRoma().data;
  const t = turnoDi(p.escursione, p.turno);
  return {
    codice: p.codice, nome: p.nome, telefono: p.telefono,
    escursione: titoloEscursione(p.escursione), turno: t?.nome ?? p.turno, orario: orarioDi(t, p.data, p.imbarco),
    data: p.data, dataLeggibile: dataLeggibile(p.data), oggi: p.data === oggi,
    imbarco: nomeImbarco(p.imbarco), gommone: nomeGommone(p.barca),
    adulti: p.adulti, bambini: p.bambini + p.neonati, persone: p.adulti + p.bambini + p.neonati,
    stato: p.stato, pagata: daPagare(p) === 0, daPagare: daPagare(p) / 100, canale: p.canale,
    note: p.note, extra: await extraDi(db, p.id), checkin: p.checkin_il,
    // Lo skipper fa il check-in solo il giorno dell'uscita.
    puoImbarcare: p.stato === 'confermata' && (p.data === oggi || utente.ruolo === 'gestione'),
  };
}

export async function onRequestGet({ request, env }) {
  const utente = await richiedi(env.DB, request, ['skipper', 'gestione']);
  const codice = pulisci(new URL(request.url).searchParams.get('codice'));
  const p = await prima(env.DB, 'SELECT * FROM prenotazioni WHERE codice = :c', { c: codice });
  if (!p) throw new Errore(404, `Nessuna prenotazione con il codice ${codice}.`);
  if (utente.ruolo === 'skipper' && p.data !== oraRoma().data) {
    throw new Errore(409, `La prenotazione ${p.codice} è per ${dataLeggibile(p.data)}, non per oggi.`);
  }
  return json(await vista(env.DB, p, utente));
}

export async function onRequestPost({ request, env }) {
  controllaOrigine(request);
  const utente = await richiedi(env.DB, request, ['skipper', 'gestione']);
  const b = await leggiJson(request, 1000);
  const p = await prima(env.DB, 'SELECT * FROM prenotazioni WHERE codice = :c', { c: pulisci(b.codice) });
  if (!p) throw new Errore(404, 'Prenotazione non trovata.');
  const v = await vista(env.DB, p, utente);
  if (!v.puoImbarcare) throw new Errore(409, p.stato !== 'confermata' ? 'Questa prenotazione non è confermata: chiama l\'ufficio.' : 'Il check-in si fa solo il giorno dell\'uscita.');
  const chi = `${utente.ruolo}:${utente.id}`;
  if (b.annulla === true) await esegui(env.DB, 'UPDATE prenotazioni SET checkin_il = NULL, checkin_da = NULL WHERE id = :id', { id: p.id });
  else await esegui(env.DB, 'UPDATE prenotazioni SET checkin_il = COALESCE(checkin_il, :ora), checkin_da = COALESCE(checkin_da, :chi) WHERE id = :id', { ora: new Date().toISOString(), chi, id: p.id });
  await registra(env.DB, chi, b.annulla === true ? 'checkin-tolto' : 'checkin', { codice: p.codice });
  return json(await vista(env.DB, await prima(env.DB, 'SELECT * FROM prenotazioni WHERE id = :id', { id: p.id }), utente));
}
