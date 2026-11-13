// Lista d'attesa: quando si libera un posto, si avvisa per email chi aspettava (in ordine di arrivo).

import { offerte, turnoDi } from '../../src/data/prenotazioni.js';
import { tutte, esegui } from './db.js';
import { caricaGiorni, situazioneTurno, prenotabileOnline } from './motore.js';
import { emailAttive, titoloEscursione } from './prenotazioni.js';
import { inviaEmailAttesa } from './email.js';
import { oraRoma } from './util.js';

// Per ogni richiesta in attesa: c'è posto adesso? Restituisce l'elenco con "libero" (true/false).
export async function situazioneAttesa(db, { soloInAttesa = true } = {}) {
  const oggi = oraRoma().data;
  const righe = await tutte(db, `SELECT * FROM lista_attesa WHERE data >= :oggi ${soloInAttesa ? "AND stato = 'attesa'" : ''} ORDER BY data, creata_il`, { oggi });
  const ora = new Date().toISOString();
  const giorniCache = new Map();
  const usati = new Map(); // posti già "promessi" a chi è stato avvisato prima nello stesso giro
  for (const a of righe) {
    a.libero = false;
    if (!offerte[a.escursione] || !turnoDi(a.escursione, a.turno) || !prenotabileOnline(a.data).ok) continue;
    if (!giorniCache.has(a.data)) giorniCache.set(a.data, (await caricaGiorni(db, a.data, a.data, ora)).giorno(a.data));
    const s = situazioneTurno(a.escursione, a.turno, giorniCache.get(a.data), a.posti, null, a.imbarco);
    const chiave = `${a.data}|${a.escursione}|${a.turno}|${a.imbarco}`;
    const promessi = usati.get(chiave) || 0;
    if (s.candidati.length && (offerte[a.escursione].tipo === 'esclusiva' ? promessi === 0 : s.maxPersone - promessi >= a.posti)) {
      a.libero = true;
      usati.set(chiave, promessi + (offerte[a.escursione].tipo === 'esclusiva' ? 99 : a.posti));
    }
  }
  return righe;
}

// Avvisa per email chi ha un posto libero. Senza email attive non fa niente (la gestione li vede e scrive su WhatsApp).
export async function avvisaListaAttesa(env, origine) {
  if (!emailAttive(env)) return [];
  const avvisati = [];
  for (const a of (await situazioneAttesa(env.DB)).filter((x) => x.libero && x.email)) {
    const ok = await inviaEmailAttesa(env, a, origine, titoloEscursione(a.escursione), turnoDi(a.escursione, a.turno)?.nome ?? a.turno);
    if (ok) {
      await esegui(env.DB, "UPDATE lista_attesa SET stato = 'avvisato', avvisata_il = :ora WHERE id = :id", { ora: new Date().toISOString(), id: a.id });
      avvisati.push(a.id);
    }
  }
  return avvisati;
}

// I dati della lista d'attesa si cancellano quando la data è passata (lo dice l'informativa privacy).
export const pulisciListaAttesa = (db) => esegui(db, 'DELETE FROM lista_attesa WHERE data < :oggi', { oggi: oraRoma().data });
