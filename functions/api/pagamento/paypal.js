// GET /api/pagamento/paypal?codice=...&t=...&token=ORDINE[&tipo=buono] → ritorno da PayPal: si incassa e si conferma.
import { esegui } from '../../_lib/db.js';
import { prenotazioneDaCodice, confermaPagamento } from '../../_lib/prenotazioni.js';
import { buonoDaCodice, confermaBuono } from '../../_lib/buoni.js';
import { riattivaSeLibero } from '../../_lib/motore.js';
import { catturaPaypal } from '../../_lib/pagamenti.js';
import { adessoISO, traMinutiISO } from '../../_lib/util.js';

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
    if (b.stato === 'attivo' || b.metodo !== 'paypal' || !ordine || b.pagamento_rif !== ordine) return Response.redirect(esito, 303);
    const incasso = await catturaPaypal(env, ordine, b.codice);
    if (incasso.pagato) { await confermaBuono(contesto, b, { importo: incasso.importo, rif: ordine, chi: 'paypal' }); return Response.redirect(esito, 303); }
    return Response.redirect(`${esito}&non_pagato=1`, 303);
  }

  const esito = `${url.origin}/prenota/esito/?${q}`;
  const p = await prenotazioneDaCodice(env.DB, codice, t);
  if (!p) return Response.redirect(`${url.origin}/prenota/esito/?errore=1`, 303);
  const giaPagata = p.stato === 'confermata' && p.pagato > 0;
  if (giaPagata || p.metodo !== 'paypal' || !ordine || p.pagamento_rif !== ordine) return Response.redirect(esito, 303);

  // Prenotazione in attesa: il posto è ancora tenuto? Se il tempo è scaduto si riprende solo se nessuno l'ha occupato.
  if (p.stato !== 'confermata' && !(p.stato === 'in_attesa' && p.scade_il > adessoISO())) {
    const ok = !p.codice_reso && await riattivaSeLibero(env.DB, p, 'in_attesa', { scade_il: traMinutiISO(10) });
    if (!ok) {
      await esegui(env.DB, "UPDATE prenotazioni SET stato = 'scaduta', aggiornata_il = :ora WHERE id = :id AND stato = 'in_attesa'", { ora: adessoISO(), id: p.id });
      return Response.redirect(`${esito}&scaduta=1`, 303);
    }
  }
  const incasso = await catturaPaypal(env, ordine, p.codice);
  if (incasso.pagato) {
    const aggiornata = await prenotazioneDaCodice(env.DB, codice, t);
    await confermaPagamento(contesto, aggiornata, { importo: incasso.importo, rif: ordine, chi: 'paypal' });
    return Response.redirect(esito, 303);
  }
  return Response.redirect(`${esito}&non_pagato=1`, 303);
}
