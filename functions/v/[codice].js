// /v/CODICE → QR di un volantino: conta la visita (solo un numero, nessun dato personale) e porta alla prenotazione.
import { prima, esegui } from '../_lib/db.js';

export async function onRequestGet({ params, request, env }) {
  const url = new URL(request.url);
  const codice = String(params.codice || '').toUpperCase().slice(0, 20);
  let destinazione = `${url.origin}/prenota/`;
  try {
    const c = env.DB ? await prima(env.DB, 'SELECT codice FROM campagne WHERE codice = :c AND attiva = 1', { c: codice }) : null;
    if (c) {
      await esegui(env.DB, 'UPDATE campagne SET visite = visite + 1 WHERE codice = :c', { c: c.codice });
      destinazione = `${url.origin}/prenota/?c=${encodeURIComponent(c.codice)}`;
    }
  } catch (e) {
    console.error('Volantino', e);
  }
  return Response.redirect(destinazione, 302);
}
