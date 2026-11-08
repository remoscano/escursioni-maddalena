// Tutte le API: errori in formato leggibile e niente cache.
import { json, rispostaErrore } from '../_lib/util.js';

export async function onRequest(contesto) {
  try {
    if (!contesto.env.DB) return json({ errore: 'Prenotazioni non ancora attive: il database non è collegato.' }, 503);
    return await contesto.next();
  } catch (e) {
    return rispostaErrore(e);
  }
}
