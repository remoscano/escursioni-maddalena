// POST /api/prenota: tiene da parte i posti e avvia il pagamento. Risponde con l'indirizzo della pagina di pagamento
// (o della conferma, se il buono regalo copre tutto).
import { prima, esegui } from '../_lib/db.js';
import { creaPrenotazione } from '../_lib/crea.js';
import { pulisciScadute } from '../_lib/motore.js';
import { metodiDisponibili } from '../_lib/pagamenti.js';
import { pagamentoPrenotazione, inviaEmailConferma } from '../_lib/prenotazioni.js';
import { restituisciCodice } from '../_lib/offerte.js';
import { utenteCollegato } from '../_lib/accessi.js';
import { Errore, json, leggiJson, controllaOrigine, sha256, indirizzoIp, adessoISO } from '../_lib/util.js';

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  controllaOrigine(request);
  const b = await leggiJson(request);
  const metodo = String(b.metodo || '');
  // Con un buono che copre tutto non serve scegliere come pagare.
  if (metodo !== 'buono' && !metodiDisponibili(env).includes(metodo)) throw new Errore(400, 'Scegli come pagare.');
  if (b.accetto !== true) throw new Errore(400, 'Per prenotare devi accettare le condizioni di prenotazione.');

  const utente = await utenteCollegato(env.DB, request);
  const ipHash = (await sha256(`ip|${indirizzoIp(request)}`)).slice(0, 32);
  if (utente?.ruolo !== 'partner') {
    const r = await prima(env.DB, "SELECT COUNT(*) AS n FROM prenotazioni WHERE ip_hash = :h AND stato = 'in_attesa' AND scade_il > :ora", { h: ipHash, ora: adessoISO() });
    if ((r?.n ?? 0) >= 5) throw new Errore(429, 'Hai già delle prenotazioni in attesa di pagamento: completale oppure aspetta qualche minuto.');
  }
  contesto.waitUntil(pulisciScadute(env.DB));

  const p = await creaPrenotazione(contesto, { ...b, metodo: metodo === 'buono' ? null : metodo }, { modo: 'online', utente, ipHash });
  const origine = new URL(request.url).origin;
  const q = `codice=${encodeURIComponent(p.codice)}&t=${encodeURIComponent(p.token)}`;

  if (p.stato === 'confermata') {
    const conferma = await prima(env.DB, 'SELECT * FROM prenotazioni WHERE id = :id', { id: p.id });
    contesto.waitUntil(inviaEmailConferma(env, conferma, origine));
    return json({ codice: p.codice, redirect: `${origine}/prenota/esito/?${q}` });
  }
  if (metodo === 'buono') {
    // Il buono non basta: serve anche un pagamento. I posti tornano liberi.
    await esegui(env.DB, "UPDATE prenotazioni SET stato = 'annullata', aggiornata_il = :ora WHERE id = :id", { ora: adessoISO(), id: p.id });
    await restituisciCodice(env.DB, p.id);
    throw new Errore(400, 'Il buono non copre tutto il totale: scegli come pagare la differenza.');
  }
  try {
    const riga = await prima(env.DB, 'SELECT * FROM prenotazioni WHERE id = :id', { id: p.id });
    const redirect = await pagamentoPrenotazione(contesto, riga, metodo);
    return json({ codice: p.codice, redirect });
  } catch (e) {
    // Il pagamento non parte: i posti tornano liberi subito, e anche il codice sconto o il buono.
    await esegui(env.DB, "UPDATE prenotazioni SET stato = 'annullata', aggiornata_il = :ora WHERE id = :id", { ora: adessoISO(), id: p.id });
    await restituisciCodice(env.DB, p.id);
    throw e;
  }
}
