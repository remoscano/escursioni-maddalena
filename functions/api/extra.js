// GET /api/extra?escursione=...&data=AAAA-MM-GG → extra a pagamento disponibili per quel giorno.
import { offerte } from '../../src/data/prenotazioni.js';
import { catalogoExtra } from '../_lib/offerte.js';
import { Errore, json, dataValida } from '../_lib/util.js';

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url).searchParams;
  if (!offerte[u.get('escursione')] || !dataValida(u.get('data'))) throw new Errore(400, 'Escursione o data non valide.');
  return json({ extra: await catalogoExtra(env.DB, u.get('escursione'), u.get('data')) });
}
