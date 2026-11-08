// POST /api/pagamento/prova { codice, t, esito: 'ok' | 'ko' } → pagamento simulato, solo nell'anteprima (PAGAMENTI_PROVA = '1').
import { esegui } from '../../_lib/db.js';
import { prenotazioneDaCodice, confermaPagamento } from '../../_lib/prenotazioni.js';
import { Errore, json, leggiJson, controllaOrigine, adessoISO } from '../../_lib/util.js';

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  if (env.PAGAMENTI_PROVA !== '1') throw new Errore(404, 'Non disponibile.');
  controllaOrigine(request);
  const b = await leggiJson(request);
  const p = await prenotazioneDaCodice(env.DB, b.codice, b.t);
  if (!p || p.metodo !== 'prova') throw new Errore(404, 'Prenotazione non trovata.');
  if (b.esito === 'ok') {
    const stato = await confermaPagamento(contesto, p, { importo: p.totale, rif: `prova-${p.codice}`, chi: 'prova' });
    return json({ stato });
  }
  await esegui(env.DB, "UPDATE prenotazioni SET stato = 'annullata', aggiornata_il = :ora WHERE id = :id AND stato = 'in_attesa'", { ora: adessoISO(), id: p.id });
  return json({ stato: 'annullata' });
}
