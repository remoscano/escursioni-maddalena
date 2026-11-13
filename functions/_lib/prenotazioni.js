// Operazioni sulle prenotazioni condivise da più API: lettura, conferma dopo il pagamento, email.

import { offerte, turnoDi, regole, imbarchiPrenotazione, gommoni, testoCarburante, testoRitrovo, orarioDi, oreAllaPartenza } from '../../src/data/prenotazioni.js';
import { escursioni } from '../../src/data/escursioni.js';
import { sito } from '../../src/data/sito.js';
import { condizioniInTesto } from '../../src/data/condizioni.js';
import { prima, esegui, registra } from './db.js';
import { riattivaSeLibero } from './motore.js';
import { avviaPagamento } from './pagamenti.js';
import { extraDi } from './offerte.js';
import { dataLeggibile, euroDaCent, ugualeSicuro } from './util.js';

export const titoloEscursione = (slug) => escursioni.find((e) => e.slug === slug)?.titolo ?? slug;
export const nomeImbarco = (id) => imbarchiPrenotazione.find((i) => i.id === id)?.nome ?? id;
export const nomeGommone = (id) => gommoni.find((g) => g.id === id)?.nome ?? id;

export async function prenotazioneDaCodice(db, codice, token) {
  if (typeof codice !== 'string' || typeof token !== 'string' || codice.length > 20 || token.length > 64) return null;
  const p = await prima(db, 'SELECT * FROM prenotazioni WHERE codice = :c', { c: codice });
  if (!p || !ugualeSicuro(p.token, token)) return null;
  return p;
}

export function descrizioneBreve(p) {
  const t = turnoDi(p.escursione, p.turno);
  return `${titoloEscursione(p.escursione)} · ${t?.nome ?? p.turno} · ${dataLeggibile(p.data)} · ${p.codice}`;
}

// Quanto resta da pagare (centesimi): totale meno buono regalo meno quanto già pagato.
export const daPagare = (p) => Math.max(0, p.totale - (p.buono || 0) - (p.pagato || 0));

// Il cliente può annullare da solo con rimborso automatico? Solo prenotazioni pagate sul sito, fino a 48 ore prima.
export function annullabileDalCliente(p) {
  if (p.stato !== 'confermata' || p.checkin_il) return false;
  if (!['sumup', 'paypal', 'prova', 'buono'].includes(p.metodo)) return false;
  const t = turnoDi(p.escursione, p.turno);
  return oreAllaPartenza(p.data, orarioDi(t, p.data, p.imbarco)) >= regole.cancellazioneGratisOre;
}

// Link di pagamento mandato dalla gestione: si può pagare online se la prenotazione è stata creata dalla gestione
// e aspetta il pagamento, oppure è confermata ma non ancora pagata (per esempio presa al telefono).
export const daGestione = (p) => String(p.creata_da || '').startsWith('gestione:');
export function pagabileConLink(p) {
  if (!daGestione(p) || daPagare(p) <= 0) return false;
  if (p.stato === 'in_attesa') return p.scade_il > new Date().toISOString();
  return p.stato === 'confermata' && !(p.pagato > 0);
}

// Dati della prenotazione da mostrare al cliente (niente dati interni).
export function vistaCliente(p) {
  const t = turnoDi(p.escursione, p.turno);
  const offerta = offerte[p.escursione];
  return {
    turnoId: p.turno,
    persone: p.adulti + p.bambini + p.neonati,
    pagato: p.pagato / 100,
    daPagare: daPagare(p) / 100,
    buono: (p.buono || 0) / 100,
    listino: p.listino === null || p.listino === undefined ? null : p.listino / 100,
    sconto: (p.sconto || 0) / 100,
    scontoNota: p.sconto_nota,
    extraTotale: (p.extra_totale || 0) / 100,
    rimborsato: (p.rimborsato || 0) / 100,
    rimborso: p.rimborso,
    recupero: p.recupero,
    dataOriginale: p.data_originale,
    dataOriginaleLeggibile: p.data_originale ? dataLeggibile(p.data_originale) : null,
    checkin: Boolean(p.checkin_il),
    annullabile: annullabileDalCliente(p),
    // Link di pagamento: si può pagare online (prenotazione in attesa dalla gestione o confermata ancora da pagare)
    pagabile: pagabileConLink(p),
    codice: p.codice,
    escursione: titoloEscursione(p.escursione),
    slug: p.escursione,
    turno: t?.nome ?? p.turno,
    data: p.data,
    dataLeggibile: dataLeggibile(p.data),
    orario: orarioDi(t, p.data, p.imbarco),
    orarioIndicativo: Boolean(t?.indicativo),
    carburanteEscluso: Boolean(offerta?.carburanteEscluso),
    imbarco: nomeImbarco(p.imbarco),
    imbarcoId: p.imbarco,
    adulti: p.adulti,
    bambini: p.bambini,
    neonati: p.neonati,
    privato: offerta?.tipo === 'esclusiva',
    minimo: offerta?.minimo ?? null,
    documento: Boolean(offerta?.documento || t?.documento),
    totale: p.totale / 100,
    stato: p.stato,
    metodo: p.metodo,
    nome: p.nome,
    scadeIl: p.scade_il,
    cancellazioneGratisOre: regole.cancellazioneGratisOre,
  };
}

// Conferma una prenotazione dopo un pagamento verificato. Restituisce lo stato finale.
export async function confermaPagamento(contesto, p, { importo, rif, chi }) {
  const db = contesto.env.DB;
  const dovuto = daPagare(p);
  if (p.stato === 'confermata') {
    // Prenotazione già confermata e ancora da pagare (link di pagamento dalla gestione): si registra il pagamento.
    if (p.pagato > 0) return 'confermata';
    await esegui(db, 'UPDATE prenotazioni SET pagato = :i, pagamento_rif = :rif, aggiornata_il = :ora WHERE id = :id AND pagato = 0', { i: importo, rif, ora: new Date().toISOString(), id: p.id });
    await registra(db, chi, importo < dovuto ? 'pagamento-importo-diverso' : 'pagamento-confermato', { codice: p.codice, importo, dovuto, rif });
    const aggiornata = await prima(db, 'SELECT * FROM prenotazioni WHERE id = :id', { id: p.id });
    contesto.waitUntil?.(inviaEmailConferma(contesto.env, aggiornata, new URL(contesto.request.url).origin));
    return 'confermata';
  }
  if (importo < dovuto) {
    await esegui(db, "UPDATE prenotazioni SET stato = 'da_verificare', pagato = :i, aggiornata_il = :ora WHERE id = :id", { i: importo, ora: new Date().toISOString(), id: p.id });
    await registra(db, chi, 'pagamento-importo-diverso', { codice: p.codice, importo, totale: p.totale });
    return 'da_verificare';
  }
  const ora = new Date().toISOString();
  let stato = 'confermata';
  const r = await esegui(db, `UPDATE prenotazioni SET stato = 'confermata', pagato = :i, pagamento_rif = :rif, aggiornata_il = :ora
                              WHERE id = :id AND stato = 'in_attesa' AND scade_il > :ora`, { i: importo, rif, ora, id: p.id });
  if (r.meta?.changes !== 1) {
    // Pagamento arrivato dopo la scadenza: si conferma solo se il posto è ancora libero
    // e se lo sconto o il buono usati non sono già tornati disponibili.
    const ok = !p.codice_reso && await riattivaSeLibero(db, p, 'confermata', { pagato: importo, pagamento_rif: rif });
    if (!ok) {
      stato = 'da_verificare';
      await esegui(db, "UPDATE prenotazioni SET stato = 'da_verificare', pagato = :i, pagamento_rif = :rif, aggiornata_il = :ora WHERE id = :id AND stato != 'confermata'", { i: importo, rif, ora, id: p.id });
    }
  }
  await registra(db, chi, stato === 'confermata' ? 'pagamento-confermato' : 'pagamento-senza-posto', { codice: p.codice, importo, rif });
  // Pagata: l'impronta dell'indirizzo internet non serve più.
  await esegui(db, 'UPDATE prenotazioni SET ip_hash = NULL WHERE id = :id', { id: p.id });
  const aggiornata = await prima(db, 'SELECT * FROM prenotazioni WHERE id = :id', { id: p.id });
  contesto.waitUntil?.(inviaEmailConferma(contesto.env, aggiornata, new URL(contesto.request.url).origin));
  return aggiornata.stato;
}

// Avvia il pagamento online di una prenotazione (quanto resta da pagare). Restituisce l'indirizzo della pagina di pagamento.
export async function pagamentoPrenotazione(contesto, p, metodo, tentativo = null) {
  const origine = new URL(contesto.request.url).origin;
  const q = `codice=${encodeURIComponent(p.codice)}&t=${encodeURIComponent(p.token)}`;
  const url = {
    esito: `${origine}/prenota/esito/?${q}`,
    ritornoPaypal: `${origine}/api/pagamento/paypal?${q}`,
    annullaPaypal: `${origine}/prenota/esito/?${q}&annullato=1`,
    notificaSumup: `${origine}/api/pagamento/sumup`,
    prova: `${origine}/prenota/prova/?${q}`,
  };
  const pagamento = await avviaPagamento(contesto.env, metodo, {
    codice: p.codice, totale: daPagare(p), descrizione: descrizioneBreve(p), tentativo,
    // SumUp: il pagamento vale finché i posti sono tenuti (per le prenotazioni già confermate, un'ora).
    scadeIl: p.stato === 'in_attesa' ? p.scade_il : new Date(Date.now() + 3600000).toISOString(),
  }, url);
  await esegui(contesto.env.DB, 'UPDATE prenotazioni SET pagamento_rif = :r, metodo = :m WHERE id = :id', { r: pagamento.rif, m: metodo, id: p.id });
  return pagamento.redirect;
}

// ---------- Email ----------
// Funzionano quando ci sono RESEND_API_KEY ed EMAIL_MITTENTE (es. "Escursioni La Maddalena <prenotazioni@dominio.it>").
// Serve il dominio collegato. Prima di aprire le prenotazioni vere sono necessarie: la legge chiede di mandare
// al cliente la conferma con le condizioni su un supporto durevole (art. 51, comma 7, Codice del consumo).

export const emailAttive = (env) => Boolean(env.RESEND_API_KEY && env.EMAIL_MITTENTE);

export async function inviaEmail(env, { a, oggetto, testo }) {
  if (!env.RESEND_API_KEY || !env.EMAIL_MITTENTE || !a) return false;
  try {
    // RESEND_API_URL serve solo alle prove automatiche in locale (le email arrivano a un finto server).
    const r = await fetch(env.RESEND_API_URL || 'https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.EMAIL_MITTENTE, to: [a], subject: oggetto, text: testo, reply_to: sito.contatti.email || undefined }),
    });
    if (!r.ok) console.error('Email non inviata', r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error('Email non inviata', e);
    return false;
  }
}

export const linkPrenotazione = (origine, p) => `${origine}/prenota/esito/?codice=${encodeURIComponent(p.codice)}&t=${encodeURIComponent(p.token)}`;

// Righe con il prezzo: sconto, extra, buono regalo, pagato.
export async function righePrezzo(db, p) {
  const extra = db ? await extraDi(db, p.id) : [];
  return [
    p.sconto_nota && p.sconto ? `${p.sconto > 0 ? 'Sconto' : 'Maggiorazione'}: ${p.sconto_nota} (${p.sconto > 0 ? '−' : '+'}${euroDaCent(Math.abs(p.sconto))} €)` : null,
    ...extra.map((e) => `Extra: ${e.nome}${e.quantita > 1 ? ` × ${e.quantita}` : ''} (${euroDaCent(e.totale * 100)} €)`),
    `Totale: ${euroDaCent(p.totale)} € (IVA inclusa)`,
    p.buono ? `Pagato con buono regalo: ${euroDaCent(p.buono)} €` : null,
    p.pagato ? `Pagato ${p.metodo === 'paypal' ? 'con PayPal' : p.metodo === 'sumup' ? 'con carta' : ''}: ${euroDaCent(p.pagato)} €`.replace('Pagato :', 'Pagato:') : null,
    daPagare(p) > 0 ? `Da pagare: ${euroDaCent(daPagare(p))} €` : null,
  ].filter(Boolean);
}

export async function inviaEmailConferma(env, p, origine) {
  const v = vistaCliente(p);
  const persone = [
    v.adulti && `${v.adulti} ${v.adulti === 1 ? 'adulto' : 'adulti'}`,
    (v.bambini + v.neonati) && `${v.bambini + v.neonati} ${v.bambini + v.neonati === 1 ? 'bambino' : 'bambini'}`,
  ].filter(Boolean).join(', ');
  const link = linkPrenotazione(origine, p);
  const prezzo = await righePrezzo(env.DB, p);
  const { azienda } = sito;
  // null = riga che non serve per questa prenotazione; '' = riga vuota tra un blocco e l'altro.
  const righe = [
    `Ciao ${p.nome},`,
    p.stato === 'confermata' ? 'la tua prenotazione è confermata.' : 'abbiamo ricevuto il tuo pagamento: ti contattiamo a breve per confermare il posto.',
    '',
    `Codice: ${p.codice}`,
    `${v.escursione} · ${v.turno}${v.privato ? ' · gommone solo per voi' : ''}`,
    `Data: ${v.dataLeggibile}`,
    `Imbarco: ${v.imbarco}`,
    v.orario ? `Orario: ${v.orario}${v.orarioIndicativo ? ' (indicativo: segue la luce del tramonto)' : ''}` : 'Orario: te lo confermiamo noi',
    testoRitrovo(v.orario, v.imbarcoId) || null,
    `Persone: ${persone}`,
    ...prezzo,
    v.carburanteEscluso ? testoCarburante() : null,
    '',
    v.documento ? "Si va in Corsica: porta un documento valido per l'espatrio per ogni persona, anche per i bambini." : null,
    !v.privato && v.minimo ? `L'uscita parte con almeno ${v.minimo} persone paganti: se non si raggiungono ti proponiamo un'altra data o ti rimborsiamo per intero.` : null,
    `Cancellazione gratuita fino a ${v.cancellazioneGratisOre} ore prima. Con mare o vento non sicuri annulliamo noi e scegli tu: rimborso completo o nuova data.`,
    '',
    `Il tuo biglietto, con il codice QR da mostrare all'imbarco: ${link}`,
    v.annullabile ? `Da quella pagina puoi anche annullare fino a ${v.cancellazioneGratisOre} ore prima: il rimborso è automatico.` : null,
    sito.contatti.telefonoVisibile ? `Per qualsiasi cosa scrivici su WhatsApp: ${sito.contatti.telefonoVisibile}` : null,
    '',
    `${azienda.ragioneSociale || sito.nome}${azienda.indirizzo ? ` · ${azienda.indirizzo}` : ''}${azienda.partitaIva ? ` · P. IVA ${azienda.partitaIva}` : ''}`,
    '',
    '----------',
    'CONDIZIONI DI PRENOTAZIONE (la tua copia)',
    '',
    condizioniInTesto(),
  ].filter((r) => r !== null);
  await inviaEmail(env, { a: p.email, oggetto: `Prenotazione ${p.codice} · ${v.escursione}`, testo: righe.join('\n') });
  if (sito.contatti.email) {
    await inviaEmail(env, {
      a: sito.contatti.email,
      oggetto: `Nuova prenotazione ${p.codice} · ${v.escursione} · ${v.dataLeggibile}`,
      testo: [`${p.nome} · ${p.telefono || ''} · ${p.email || ''}`, `${v.escursione} · ${v.turno} · ${v.dataLeggibile}`, `Imbarco: ${v.imbarco}`, `Persone: ${persone}`, `Totale: ${euroDaCent(p.totale)} € · pagato ${euroDaCent(p.pagato)} € (${p.metodo})${p.buono ? ` · buono ${euroDaCent(p.buono)} €` : ''}${p.sconto_nota ? ` · ${p.sconto_nota}` : ''}`, p.campagna ? `Volantino: ${p.campagna}` : '', `Gommone: ${nomeGommone(p.barca)}`, `Canale: ${p.canale}`, p.note ? `Note: ${p.note}` : ''].filter(Boolean).join('\n'),
    });
  }
}
