// Pagamenti: SumUp (carta, pagina ospitata da SumUp) e PayPal (pagina PayPal).
// Il cliente viene mandato alla pagina del gestore del pagamento e l'esito si verifica sempre dal server:
// sul sito non viene caricato nessuno script di terze parti.
//
// Credenziali (da inserire in Cloudflare Pages → Impostazioni → Variabili, come "segrete"):
//   SUMUP_API_KEY, SUMUP_MERCHANT_CODE
//   PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_AMBIENTE ('live' oppure 'sandbox' per le prove)
//   PAGAMENTI_PROVA = '1' solo nell'anteprima: aggiunge un pagamento simulato per provare tutto il percorso.

import { Errore } from './util.js';

export function metodiDisponibili(env) {
  const metodi = [];
  if (env.SUMUP_API_KEY && env.SUMUP_MERCHANT_CODE) metodi.push('sumup');
  if (env.PAYPAL_CLIENT_ID && env.PAYPAL_SECRET) metodi.push('paypal');
  if (env.PAGAMENTI_PROVA === '1') metodi.push('prova');
  return metodi;
}

const euro = (cent) => (Math.round(cent) / 100).toFixed(2);
const basePaypal = (env) => (env.PAYPAL_AMBIENTE === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com');

async function tokenPaypal(env) {
  const r = await fetch(`${basePaypal(env)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new Error(`PayPal: accesso non riuscito (${r.status})`);
  return (await r.json()).access_token;
}

// Crea il pagamento e restituisce { rif, redirect }.
// p = { codice, totale (centesimi), descrizione, scadeIl, tentativo? }, url = { esito, ritornoPaypal, annullaPaypal, notificaSumup, prova }
export async function avviaPagamento(env, metodo, p, url) {
  if (metodo === 'prova') {
    if (env.PAGAMENTI_PROVA !== '1') throw new Errore(400, 'Metodo di pagamento non disponibile.');
    return { rif: `prova-${p.codice}`, redirect: url.prova };
  }

  if (metodo === 'sumup') {
    const r = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.SUMUP_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkout_reference: p.tentativo ? `${p.codice}-${p.tentativo}` : p.codice,
        amount: Number(euro(p.totale)),
        currency: 'EUR',
        merchant_code: env.SUMUP_MERCHANT_CODE,
        description: p.descrizione.slice(0, 120),
        redirect_url: url.esito,
        return_url: url.notificaSumup,
        valid_until: p.scadeIl,
        hosted_checkout: { enabled: true },
      }),
    });
    const dati = await r.json().catch(() => ({}));
    if (!r.ok || !dati.id || !dati.hosted_checkout_url) {
      console.error('SumUp checkout non creato', r.status, JSON.stringify(dati).slice(0, 500));
      throw new Errore(502, 'Il pagamento con carta non è disponibile in questo momento. Riprova o scegli PayPal.');
    }
    return { rif: dati.id, redirect: dati.hosted_checkout_url };
  }

  if (metodo === 'paypal') {
    const token = await tokenPaypal(env);
    const r = await fetch(`${basePaypal(env)}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': `${p.codice}-ordine${p.tentativo ? `-${p.tentativo}` : ''}` },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: p.codice,
          custom_id: p.codice,
          description: p.descrizione.slice(0, 127),
          amount: { currency_code: 'EUR', value: euro(p.totale) },
        }],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: 'Escursioni La Maddalena',
              locale: 'it-IT',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW',
              return_url: url.ritornoPaypal,
              cancel_url: url.annullaPaypal,
            },
          },
        },
      }),
    });
    const dati = await r.json().catch(() => ({}));
    const link = (dati.links || []).find((l) => l.rel === 'payer-action' || l.rel === 'approve');
    if (!r.ok || !dati.id || !link) {
      console.error('PayPal ordine non creato', r.status, JSON.stringify(dati).slice(0, 500));
      throw new Errore(502, 'PayPal non è disponibile in questo momento. Riprova o paga con carta.');
    }
    return { rif: dati.id, redirect: link.href };
  }

  throw new Errore(400, 'Metodo di pagamento non disponibile.');
}

// Incassa un ordine PayPal approvato dal cliente. Restituisce { pagato, importo (centesimi) }.
export async function catturaPaypal(env, ordineId, codice) {
  const token = await tokenPaypal(env);
  const r = await fetch(`${basePaypal(env)}/v2/checkout/orders/${encodeURIComponent(ordineId)}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': `${codice}-incasso` },
  });
  let dati = await r.json().catch(() => ({}));
  if (!r.ok) {
    // Già incassato (es. pagina ricaricata): si legge lo stato dell'ordine.
    const g = await fetch(`${basePaypal(env)}/v2/checkout/orders/${encodeURIComponent(ordineId)}`, { headers: { Authorization: `Bearer ${token}` } });
    dati = await g.json().catch(() => ({}));
  }
  const incasso = dati.purchase_units?.[0]?.payments?.captures?.[0];
  const pagato = dati.status === 'COMPLETED' && incasso?.status === 'COMPLETED';
  const importo = incasso ? Math.round(Number(incasso.amount?.value) * 100) : 0;
  const riferimento = dati.purchase_units?.[0]?.reference_id;
  return { pagato: pagato && (!riferimento || riferimento === codice), importo, stato: dati.status || 'sconosciuto' };
}

// Stato di un pagamento SumUp. Restituisce { pagato, importo (centesimi), stato }.
export async function statoSumup(env, checkoutId) {
  const r = await fetch(`https://api.sumup.com/v0.1/checkouts/${encodeURIComponent(checkoutId)}`, {
    headers: { Authorization: `Bearer ${env.SUMUP_API_KEY}` },
  });
  const dati = await r.json().catch(() => ({}));
  if (!r.ok) return { pagato: false, importo: 0, stato: `errore-${r.status}` };
  return { pagato: dati.status === 'PAID', importo: Math.round(Number(dati.amount) * 100), stato: dati.status, riferimento: dati.checkout_reference };
}

// ---------- Rimborsi ----------
// Rimborsa (in tutto o in parte) un pagamento fatto con SumUp o PayPal. Restituisce { rif } o lancia un errore leggibile.
// p = { metodo, pagamento_rif, codice }, importo in centesimi, n = numero del rimborso (per non farlo due volte)
export async function rimborsa(env, p, importo, n = 1) {
  if (!(importo > 0)) throw new Errore(400, 'Importo del rimborso non valido.');
  if (p.metodo === 'prova') {
    if (env.PAGAMENTI_PROVA !== '1') throw new Errore(400, 'Rimborso non disponibile.');
    return { rif: `prova-rimborso-${p.codice}-${n}` };
  }

  if (p.metodo === 'paypal') {
    if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_SECRET) throw new Errore(503, 'PayPal non è collegato: fai il rimborso dal sito di PayPal.');
    const token = await tokenPaypal(env);
    const o = await fetch(`${basePaypal(env)}/v2/checkout/orders/${encodeURIComponent(p.pagamento_rif)}`, { headers: { Authorization: `Bearer ${token}` } });
    const ordine = await o.json().catch(() => ({}));
    const incasso = ordine.purchase_units?.[0]?.payments?.captures?.find((c) => ['COMPLETED', 'PARTIALLY_REFUNDED'].includes(c.status));
    if (!incasso) throw new Errore(502, 'PayPal non trova il pagamento da rimborsare: controlla sul sito di PayPal.');
    const r = await fetch(`${basePaypal(env)}/v2/payments/captures/${encodeURIComponent(incasso.id)}/refund`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': `${p.codice}-rimborso-${n}` },
      body: JSON.stringify({ amount: { value: euro(importo), currency_code: 'EUR' }, note_to_payer: `Rimborso ${p.codice}` }),
    });
    const dati = await r.json().catch(() => ({}));
    if (!r.ok || !['COMPLETED', 'PENDING'].includes(dati.status)) {
      console.error('Rimborso PayPal non riuscito', r.status, JSON.stringify(dati).slice(0, 500));
      throw new Errore(502, 'PayPal non ha accettato il rimborso: fallo dal sito di PayPal e poi segnalo come fatto.');
    }
    return { rif: dati.id };
  }

  if (p.metodo === 'sumup') {
    if (!env.SUMUP_API_KEY) throw new Errore(503, 'SumUp non è collegato: fai il rimborso dal pannello di SumUp.');
    const c = await fetch(`https://api.sumup.com/v0.1/checkouts/${encodeURIComponent(p.pagamento_rif)}`, { headers: { Authorization: `Bearer ${env.SUMUP_API_KEY}` } });
    const checkout = await c.json().catch(() => ({}));
    const transazione = (checkout.transactions || []).find((t) => t.status === 'SUCCESSFUL') || (checkout.transactions || [])[0];
    if (!transazione?.id) throw new Errore(502, 'SumUp non trova il pagamento da rimborsare: controlla nel pannello di SumUp.');
    const r = await fetch(`https://api.sumup.com/v0.1/me/refund/${encodeURIComponent(transazione.id)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.SUMUP_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(euro(importo)) }),
    });
    if (!r.ok) {
      console.error('Rimborso SumUp non riuscito', r.status, (await r.text()).slice(0, 500));
      throw new Errore(502, 'SumUp non ha accettato il rimborso: fallo dal pannello di SumUp e poi segnalo come fatto.');
    }
    return { rif: `sumup-${transazione.id}-${n}` };
  }

  throw new Errore(400, 'Questa prenotazione non è stata pagata sul sito: il rimborso va fatto a mano (o sulla piattaforma).');
}
