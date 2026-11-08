// POST /api/prenota: tiene da parte i posti e avvia il pagamento. Risponde con l'indirizzo della pagina di pagamento.
import { prima, esegui } from '../_lib/db.js';
import { creaPrenotazione } from '../_lib/crea.js';
import { pulisciScadute } from '../_lib/motore.js';
import { avviaPagamento, metodiDisponibili } from '../_lib/pagamenti.js';
import { descrizioneBreve } from '../_lib/prenotazioni.js';
import { utenteCollegato } from '../_lib/accessi.js';
import { Errore, json, leggiJson, controllaOrigine, sha256, indirizzoIp, adessoISO } from '../_lib/util.js';

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  controllaOrigine(request);
  const b = await leggiJson(request);
  const metodo = String(b.metodo || '');
  if (!metodiDisponibili(env).includes(metodo)) throw new Errore(400, 'Scegli come pagare.');
  if (b.accetto !== true) throw new Errore(400, 'Per prenotare devi accettare le condizioni di prenotazione.');

  const utente = await utenteCollegato(env.DB, request);
  const ipHash = (await sha256(`ip|${indirizzoIp(request)}`)).slice(0, 32);
  if (utente?.ruolo !== 'partner') {
    const r = await prima(env.DB, "SELECT COUNT(*) AS n FROM prenotazioni WHERE ip_hash = :h AND stato = 'in_attesa' AND scade_il > :ora", { h: ipHash, ora: adessoISO() });
    if ((r?.n ?? 0) >= 5) throw new Errore(429, 'Hai già delle prenotazioni in attesa di pagamento: completale oppure aspetta qualche minuto.');
  }
  contesto.waitUntil(pulisciScadute(env.DB));

  const p = await creaPrenotazione(contesto, { ...b, metodo }, { modo: 'online', utente, ipHash });
  const origine = new URL(request.url).origin;
  const q = `codice=${encodeURIComponent(p.codice)}&t=${encodeURIComponent(p.token)}`;
  const url = {
    esito: `${origine}/prenota/esito/?${q}`,
    ritornoPaypal: `${origine}/api/pagamento/paypal?${q}`,
    annullaPaypal: `${origine}/prenota/esito/?${q}&annullato=1`,
    notificaSumup: `${origine}/api/pagamento/sumup`,
    prova: `${origine}/prenota/prova/?${q}`,
  };
  try {
    const pagamento = await avviaPagamento(env, metodo, { codice: p.codice, totale: p.totale, descrizione: descrizioneBreve(p), scadeIl: p.scade_il }, url);
    await esegui(env.DB, 'UPDATE prenotazioni SET pagamento_rif = :r WHERE id = :id', { r: pagamento.rif, id: p.id });
    return json({ codice: p.codice, redirect: pagamento.redirect });
  } catch (e) {
    // Il pagamento non parte: i posti tornano liberi subito.
    await esegui(env.DB, "UPDATE prenotazioni SET stato = 'annullata', aggiornata_il = :ora WHERE id = :id", { ora: adessoISO(), id: p.id });
    throw e;
  }
}
