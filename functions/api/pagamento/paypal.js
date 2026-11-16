// GET /api/pagamento/paypal?codice=...&t=...&token=ORDINE[&tipo=buono] → ritorno da PayPal: si incassa e si conferma.
// Se il cliente chiude la pagina prima di tornare, ci pensa l'avviso automatico (paypal-notifica.js).
import { prenotazioneDaCodice } from '../../_lib/prenotazioni.js';
import { buonoDaCodice } from '../../_lib/buoni.js';
import { incassaPrenotazionePaypal, incassaBuonoPaypal } from '../../_lib/paypal.js';

export async function onRequestGet(contesto) {
  const { request, env } = contesto;
  const url = new URL(request.url);
  const codice = url.searchParams.get('codice');
  const t = url.searchParams.get('t');
  const ordine = url.searchParams.get('token');
  const q = `codice=${encodeURIComponent(codice || '')}&t=${encodeURIComponent(t || '')}`;

  if (url.searchParams.get('tipo') === 'buono') {
    const esito = `${url.origin}/buono-regalo/esito/?${q}`;
    const b = await buonoDaCodice(env.DB, codice, t);
    if (!b) return Response.redirect(`${url.origin}/buono-regalo/esito/?errore=1`, 303);
    const r = await incassaBuonoPaypal(contesto, b, ordine);
    return Response.redirect(r === 'non-pagato' ? `${esito}&non_pagato=1` : esito, 303);
  }

  const esito = `${url.origin}/prenota/esito/?${q}`;
  const p = await prenotazioneDaCodice(env.DB, codice, t);
  if (!p) return Response.redirect(`${url.origin}/prenota/esito/?errore=1`, 303);
  const r = await incassaPrenotazionePaypal(contesto, p, ordine);
  if (r === 'scaduta') return Response.redirect(`${esito}&scaduta=1`, 303);
  if (r === 'non-pagata') return Response.redirect(`${esito}&non_pagato=1`, 303);
  return Response.redirect(esito, 303);
}
