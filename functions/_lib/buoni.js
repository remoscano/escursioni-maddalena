// Buoni regalo comprati online: si paga come una prenotazione, poi il codice vale come credito per prenotare.

import { regole } from '../../src/data/prenotazioni.js';
import { prima, esegui, registra } from './db.js';
import { avviaPagamento } from './pagamenti.js';
import { inviaEmailBuono } from './email.js';
import { Errore, testo, testoLungo, email, telefono, codiceCasuale, tokenSicuro, traMinutiISO, adessoISO, ugualeSicuro, oraRoma } from './util.js';

export const codiceBuono = () => `BR-${codiceCasuale(8)}`;

export async function buonoDaCodice(db, codice, token) {
  if (typeof codice !== 'string' || typeof token !== 'string' || codice.length > 20 || token.length > 64) return null;
  const b = await prima(db, "SELECT * FROM codici_sconto WHERE codice = :c AND tipo = 'buono'", { c: codice });
  if (!b || !b.token || !ugualeSicuro(b.token, token)) return null;
  return b;
}

export function vistaBuono(b) {
  return {
    codice: b.codice, valore: b.valore / 100, saldo: b.saldo / 100, al: b.al, stato: b.stato,
    scaduto: b.stato === 'in_attesa' && b.scade_il <= adessoISO(),
    acquirente: b.acquirente, destinatario: b.destinatario, messaggio: b.messaggio,
  };
}

// Scadenza: oggi + mesi di validità.
export function scadenzaBuono(mesi = regole.buoni.validitaMesi) {
  const d = new Date(`${oraRoma().data}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + mesi);
  return d.toISOString().slice(0, 10);
}

export async function creaBuono(db, b, { metodo, ipHash }) {
  const valore = Number(String(b.valore ?? '').replace(',', '.'));
  const { minimo, massimo } = regole.buoni;
  if (!Number.isFinite(valore) || valore < minimo || valore > massimo || Math.round(valore) !== valore) throw new Errore(400, `Scegli un importo tra ${minimo} e ${massimo} €, senza centesimi.`);
  const dati = {
    codice: codiceBuono(),
    token: tokenSicuro(24),
    valore: valore * 100,
    acquirente: testo(b.nome, { campo: 'nome e cognome', massimo: 100, obbligatorio: true }),
    email: email(b.email, true),
    telefono: telefono(b.telefono, false) || null,
    destinatario: testo(b.destinatario, { campo: 'a chi lo regali', massimo: 100 }) || null,
    messaggio: testoLungo(b.messaggio, 300) || null,
    metodo,
    ipHash,
    scade: traMinutiISO(regole.minutiPerPagare),
  };
  for (let i = 0; i < 3; i++) {
    try {
      const r = await esegui(db, `INSERT INTO codici_sconto (codice, tipo, valore, saldo, stato, token, acquirente, email, telefono, destinatario, messaggio, metodo, ip_hash, scade_il, creato_da)
        VALUES (:codice, 'buono', :valore, 0, 'in_attesa', :token, :acquirente, :email, :telefono, :destinatario, :messaggio, :metodo, :ipHash, :scade, 'cliente')`, dati);
      return { ...dati, id: r.meta.last_row_id };
    } catch (e) {
      if (String(e?.message || e).includes('UNIQUE') && i < 2) { dati.codice = codiceBuono(); continue; }
      throw e;
    }
  }
  throw new Errore(500, 'Buono non creato: riprova.');
}

export async function pagamentoBuono(contesto, b) {
  const origine = new URL(contesto.request.url).origin;
  const q = `codice=${encodeURIComponent(b.codice)}&t=${encodeURIComponent(b.token)}`;
  const pagamento = await avviaPagamento(contesto.env, b.metodo, {
    codice: b.codice, totale: b.valore, descrizione: `Buono regalo ${b.codice}`, scadeIl: b.scade,
  }, {
    esito: `${origine}/buono-regalo/esito/?${q}`,
    ritornoPaypal: `${origine}/api/pagamento/paypal?${q}&tipo=buono`,
    annullaPaypal: `${origine}/buono-regalo/esito/?${q}&annullato=1`,
    notificaSumup: `${origine}/api/pagamento/sumup`,
    prova: `${origine}/prenota/prova/?${q}&tipo=buono`,
  });
  await esegui(contesto.env.DB, 'UPDATE codici_sconto SET pagamento_rif = :r WHERE id = :id', { r: pagamento.rif, id: b.id });
  return pagamento.redirect;
}

// Pagamento verificato: il buono si attiva con il suo saldo e la scadenza.
export async function confermaBuono(contesto, b, { importo, rif, chi }) {
  const db = contesto.env.DB;
  if (b.stato === 'attivo') return 'attivo';
  if (importo < b.valore) {
    await registra(db, chi, 'buono-importo-diverso', { codice: b.codice, importo, valore: b.valore });
    await esegui(db, 'UPDATE codici_sconto SET pagato = :i, pagamento_rif = :rif WHERE id = :id', { i: importo, rif, id: b.id });
    return 'da_verificare';
  }
  const r = await esegui(db, `UPDATE codici_sconto SET stato = 'attivo', saldo = valore, pagato = :i, pagamento_rif = :rif, al = :al, ip_hash = NULL
                              WHERE id = :id AND stato = 'in_attesa'`, { i: importo, rif, al: scadenzaBuono(), id: b.id });
  if (r.meta?.changes === 1) {
    await registra(db, chi, 'buono-venduto', { codice: b.codice, importo });
    const agg = await prima(db, 'SELECT * FROM codici_sconto WHERE id = :id', { id: b.id });
    contesto.waitUntil?.(inviaEmailBuono(contesto.env, agg, new URL(contesto.request.url).origin));
  }
  return 'attivo';
}
