// Incasso di un pagamento PayPal, uguale per le due strade da cui può arrivare:
// - il cliente torna sul sito dopo aver approvato (GET /api/pagamento/paypal)
// - PayPal manda l'avviso automatico (POST /api/pagamento/paypal-notifica), anche se il cliente ha chiuso la pagina.
// Non ci si fida mai del contenuto dell'avviso: l'ordine si incassa e si rilegge da PayPal con le nostre chiavi.
import { esegui } from './db.js';
import { prenotazioneDaCodice, confermaPagamento } from './prenotazioni.js';
import { confermaBuono } from './buoni.js';
import { riattivaSeLibero } from './motore.js';
import { catturaPaypal } from './pagamenti.js';
import { adessoISO, traMinutiISO } from './util.js';

// p = riga della prenotazione. Restituisce 'confermata' | 'gia-pagata' | 'scaduta' | 'non-pagata' | 'non-paypal'.
export async function incassaPrenotazionePaypal(contesto, p, ordine, chi = 'paypal') {
  const { env } = contesto;
  if (p.stato === 'confermata' && p.pagato > 0) return 'gia-pagata';
  if (p.metodo !== 'paypal' || !ordine || p.pagamento_rif !== ordine) return 'non-paypal';
  // Prenotazione in attesa: il posto è ancora tenuto? Se il tempo è scaduto si riprende solo se nessuno l'ha occupato.
  if (p.stato !== 'confermata' && !(p.stato === 'in_attesa' && p.scade_il > adessoISO())) {
    const ok = !p.codice_reso && await riattivaSeLibero(env.DB, p, 'in_attesa', { scade_il: traMinutiISO(10) });
    if (!ok) {
      await esegui(env.DB, "UPDATE prenotazioni SET stato = 'scaduta', aggiornata_il = :ora WHERE id = :id AND stato = 'in_attesa'", { ora: adessoISO(), id: p.id });
      return 'scaduta';
    }
  }
  const incasso = await catturaPaypal(env, ordine, p.codice);
  if (!incasso.pagato) return 'non-pagata';
  const aggiornata = await prenotazioneDaCodice(env.DB, p.codice, p.token);
  await confermaPagamento(contesto, aggiornata, { importo: incasso.importo, rif: ordine, chi });
  return 'confermata';
}

// b = riga del buono regalo. Restituisce 'confermato' | 'gia-attivo' | 'non-pagato' | 'non-paypal'.
export async function incassaBuonoPaypal(contesto, b, ordine, chi = 'paypal') {
  if (b.stato === 'attivo') return 'gia-attivo';
  if (b.metodo !== 'paypal' || !ordine || b.pagamento_rif !== ordine) return 'non-paypal';
  const incasso = await catturaPaypal(contesto.env, ordine, b.codice);
  if (!incasso.pagato) return 'non-pagato';
  await confermaBuono(contesto, b, { importo: incasso.importo, rif: ordine, chi });
  return 'confermato';
}
