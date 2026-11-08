// GET /api/disponibilita?escursione=tour-7-isole&mese=2027-06[&partner=CODICE]
// Calendario del mese con lo stato di ogni giorno e di ogni turno.
import { offerte, regole } from '../../src/data/prenotazioni.js';
import { prima } from '../_lib/db.js';
import { calendarioMese, pulisciScadute } from '../_lib/motore.js';
import { metodiDisponibili } from '../_lib/pagamenti.js';
import { utenteCollegato } from '../_lib/accessi.js';
import { Errore, json } from '../_lib/util.js';

export async function onRequestGet(contesto) {
  const { request, env } = contesto;
  contesto.waitUntil?.(pulisciScadute(env.DB).catch((e) => console.error('Pulizia non riuscita', e)));
  const url = new URL(request.url);
  const slug = url.searchParams.get('escursione') || '';
  const mese = url.searchParams.get('mese') || '';
  if (!offerte[slug]) throw new Errore(400, 'Escursione non valida.');
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mese)) throw new Errore(400, 'Mese non valido.');
  const utente = await utenteCollegato(env.DB, request);
  const gestione = url.searchParams.get('gestione') === '1' && utente?.ruolo === 'gestione';
  // Imbarco: Palau e La Maddalena usano gli stessi gommoni, Cannigione il suo.
  const imbarco = url.searchParams.get('imbarco') || 'palau';
  if (!offerte[slug].imbarchi.includes(imbarco)) throw new Errore(400, 'Da questo imbarco l\'escursione non parte.');
  const giorni = await calendarioMese(env.DB, slug, mese, { gestione, imbarco });
  let partner = null;
  if (utente?.ruolo === 'partner') partner = { nome: utente.partner_nome, collegato: true };
  else if (url.searchParams.get('partner')) {
    const p = await prima(env.DB, 'SELECT nome FROM partner WHERE codice = :c AND attivo = 1', { c: url.searchParams.get('partner').toUpperCase().slice(0, 20) });
    if (p) partner = { nome: p.nome, collegato: false };
  }
  return json({ escursione: slug, mese, imbarco, giorni, stagione: regole.stagione, pagamenti: metodiDisponibili(env), partner });
}
