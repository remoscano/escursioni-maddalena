// POST /api/lista-attesa { escursione, turno, data, imbarco, adulti, bambini, nome, email, telefono, accetto }
// Il cliente chiede di essere avvisato se si libera un posto.
import { offerte, turnoDi, inStagione } from '../../src/data/prenotazioni.js';
import { prima, esegui } from '../_lib/db.js';
import { Errore, json, leggiJson, controllaOrigine, testo, email, telefono, intero, dataValida, tokenSicuro, oraRoma } from '../_lib/util.js';

export async function onRequestPost({ request, env }) {
  controllaOrigine(request);
  const b = await leggiJson(request, 4000);
  const o = offerte[b.escursione];
  if (!o || !turnoDi(b.escursione, b.turno)) throw new Errore(400, 'Escursione o orario non validi.');
  if (!dataValida(b.data) || !inStagione(b.data) || b.data <= oraRoma().data) throw new Errore(400, 'Scegli una data della stagione, da domani in poi.');
  if (!o.imbarchi.includes(b.imbarco)) throw new Errore(400, "Da questo imbarco l'escursione non parte.");
  if (b.accetto !== true) throw new Errore(400, "Per entrare in lista d'attesa accetta l'informativa privacy.");
  const adulti = intero(b.adulti, { campo: 'adulti', min: 1, max: 20 });
  const bambini = intero(b.bambini ?? 0, { campo: 'bambini', min: 0, max: 20 });
  const dati = {
    escursione: b.escursione, turno: b.turno, data: b.data, imbarco: b.imbarco, adulti, bambini, posti: adulti + bambini,
    nome: testo(b.nome, { campo: 'nome e cognome', massimo: 100, obbligatorio: true }),
    email: email(b.email, true), telefono: telefono(b.telefono, false) || null, token: tokenSicuro(16),
  };
  const gia = await prima(env.DB, "SELECT id FROM lista_attesa WHERE email = :email AND data = :data AND escursione = :escursione AND turno = :turno AND stato = 'attesa'", dati);
  if (gia) return json({ ok: true, gia: true });
  const n = await prima(env.DB, "SELECT COUNT(*) AS n FROM lista_attesa WHERE email = :email AND stato = 'attesa'", dati);
  if ((n?.n ?? 0) >= 5) throw new Errore(429, "Sei già in lista d'attesa per 5 uscite: è il massimo.");
  await esegui(env.DB, `INSERT INTO lista_attesa (escursione, turno, data, imbarco, adulti, bambini, posti, nome, email, telefono, token)
                        VALUES (:escursione, :turno, :data, :imbarco, :adulti, :bambini, :posti, :nome, :email, :telefono, :token)`, dati);
  return json({ ok: true });
}
