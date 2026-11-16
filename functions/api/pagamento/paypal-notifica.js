// POST /api/pagamento/paypal-notifica → avviso automatico di PayPal (webhook), come per SumUp.
// Serve quando il cliente approva il pagamento ma chiude la pagina prima di tornare sul sito.
// Eventi da attivare nell'app PayPal: CHECKOUT.ORDER.APPROVED e PAYMENT.CAPTURE.COMPLETED.
// Non ci si fida del contenuto: si prende solo il numero dell'ordine, poi si incassa e si rilegge da PayPal.
import { prima } from '../../_lib/db.js';
import { incassaPrenotazionePaypal, incassaBuonoPaypal } from '../../_lib/paypal.js';
import { json } from '../../_lib/util.js';

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  const evento = await request.json().catch(() => ({}));
  const tipo = String(evento.event_type || '');
  const risorsa = evento.resource || {};
  // CHECKOUT.ORDER.* → l'ordine è la risorsa; PAYMENT.CAPTURE.* → il numero dell'ordine è tra i dati collegati.
  const ordine = String((tipo.startsWith('CHECKOUT.ORDER.') ? risorsa.id : risorsa.supplementary_data?.related_ids?.order_id) || '').slice(0, 64);
  if (!ordine || !env.PAYPAL_CLIENT_ID || !env.PAYPAL_SECRET) return json({ ok: true });
  try {
    const p = await prima(env.DB, "SELECT * FROM prenotazioni WHERE pagamento_rif = :r AND metodo = 'paypal'", { r: ordine });
    if (p) { await incassaPrenotazionePaypal(contesto, p, ordine, 'paypal-notifica'); return json({ ok: true }); }
    const b = await prima(env.DB, "SELECT * FROM codici_sconto WHERE pagamento_rif = :r AND metodo = 'paypal' AND tipo = 'buono'", { r: ordine });
    if (b) await incassaBuonoPaypal(contesto, b, ordine, 'paypal-notifica');
  } catch (e) {
    // Risposta di errore: PayPal riprova più tardi.
    console.error('Avviso PayPal non gestito', String(e).slice(0, 300));
    return json({ ok: false }, 500);
  }
  return json({ ok: true });
}
