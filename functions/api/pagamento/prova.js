// POST /api/pagamento/prova { codice, t, esito: 'ok' | 'ko', tipo? } → pagamento simulato, solo nell'anteprima (PAGAMENTI_PROVA = '1').
import { esegui } from '../../_lib/db.js';
import { prenotazioneDaCodice, confermaPagamento, daPagare, daGestione } from '../../_lib/prenotazioni.js';
import { buonoDaCodice, confermaBuono } from '../../_lib/buoni.js';
import { restituisciCodice } from '../../_lib/offerte.js';
import { Errore, json, leggiJson, controllaOrigine, adessoISO } from '../../_lib/util.js';

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  if (env.PAGAMENTI_PROVA !== '1') throw new Errore(404, 'Non disponibile.');
  controllaOrigine(request);
  const b = await leggiJson(request);
  if (b.tipo === 'buono') {
    const buono = await buonoDaCodice(env.DB, b.codice, b.t);
    if (!buono || buono.metodo !== 'prova') throw new Errore(404, 'Buono non trovato.');
    if (b.esito === 'ok') return json({ stato: await confermaBuono(contesto, buono, { importo: buono.valore, rif: `prova-${buono.codice}`, chi: 'prova' }) });
    await esegui(env.DB, "UPDATE codici_sconto SET stato = 'annullato' WHERE id = :id AND stato = 'in_attesa'", { id: buono.id });
    return json({ stato: 'annullato' });
  }
  const p = await prenotazioneDaCodice(env.DB, b.codice, b.t);
  if (!p || p.metodo !== 'prova') throw new Errore(404, 'Prenotazione non trovata.');
  if (b.esito === 'ok') {
    const stato = await confermaPagamento(contesto, p, { importo: daPagare(p), rif: `prova-${p.codice}`, chi: 'prova' });
    return json({ stato });
  }
  // Pagamento non riuscito: le prenotazioni del sito si liberano, quelle col link della gestione restano tenute fino alla scadenza.
  if (p.stato === 'in_attesa' && !daGestione(p)) {
    const r = await esegui(env.DB, "UPDATE prenotazioni SET stato = 'annullata', aggiornata_il = :ora WHERE id = :id AND stato = 'in_attesa'", { ora: adessoISO(), id: p.id });
    if (r.meta?.changes === 1) await restituisciCodice(env.DB, p.id);
  }
  return json({ stato: 'annullata' });
}
