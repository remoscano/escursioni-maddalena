// GET /api/codice?codice=... → codice sconto o buono regalo (per il riepilogo della prenotazione).
import { trovaCodice, vistaCodice } from '../_lib/offerte.js';
import { Errore, json } from '../_lib/util.js';

export async function onRequestGet({ request, env }) {
  const c = await trovaCodice(env.DB, new URL(request.url).searchParams.get('codice'));
  if (!c) throw new Errore(404, 'Codice non valido.');
  return json(vistaCodice(c));
}
