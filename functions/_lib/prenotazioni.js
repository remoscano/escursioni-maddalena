// Operazioni sulle prenotazioni condivise da più API: lettura, conferma dopo il pagamento, email.

import { offerte, turnoDi, regole, imbarchiPrenotazione, gommoni, oraRitrovo, anticipoDi, orarioDi, oreAllaPartenza } from '../../src/data/prenotazioni.js';
import { escursioni } from '../../src/data/escursioni.js';
import { sito } from '../../src/data/sito.js';
import { condizioniInTesto } from '../../src/data/condizioni.js';
import { prima, esegui, registra } from './db.js';
import { riattivaSeLibero } from './motore.js';
import { avviaPagamento } from './pagamenti.js';
import { extraDi } from './offerte.js';
import { dataLeggibile, euroDaCent, ugualeSicuro } from './util.js';
import { percorsoDi, linguaValida } from '../../src/data/percorsi.js';
import { pacchetti } from '../../src/data/lingua.js';
import { testiPrenotaDi, nomeTurno } from '../../src/data/prenota-testi.js';
import { testiEmailDi } from '../../src/data/email-testi.js';

export const titoloEscursione = (slug) => escursioni.find((e) => e.slug === slug)?.titolo ?? slug;

// Per il cliente (sua pagina e sue email): escursione, turno e data nella sua lingua. La gestione resta in italiano.
export const titoloIn = (slug, lingua) => pacchetti[linguaValida(lingua)]?.trovaEscursione(slug)?.titolo ?? titoloEscursione(slug);
export const turnoIn = (slug, turnoId, lingua) => { const t = turnoDi(slug, turnoId); return t ? nomeTurno(testiPrenotaDi(lingua), slug, t) : turnoId; };
const formatiData = {};
export const dataIn = (s, lingua) => {
  const l = linguaValida(lingua);
  if (l === 'it') return dataLeggibile(s);
  formatiData[l] ??= new Intl.DateTimeFormat(testiPrenotaDi(l).locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return formatiData[l].format(new Date(`${s}T12:00:00Z`));
};
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
  const lingua = linguaValida(p.lingua);
  return {
    lingua,
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
    dataOriginaleLeggibile: p.data_originale ? dataIn(p.data_originale, lingua) : null,
    checkin: Boolean(p.checkin_il),
    annullabile: annullabileDalCliente(p),
    // Link di pagamento: si può pagare online (prenotazione in attesa dalla gestione o confermata ancora da pagare)
    pagabile: pagabileConLink(p),
    codice: p.codice,
    escursione: titoloIn(p.escursione, lingua),
    slug: p.escursione,
    turno: turnoIn(p.escursione, p.turno, lingua),
    data: p.data,
    dataLeggibile: dataIn(p.data, lingua),
    orario: orarioDi(t, p.data, p.imbarco),
    orarioIndicativo: Boolean(t?.indicativo),
    carburanteEscluso: Boolean(offerta?.carburanteEscluso),
    // Come si paga il carburante delle esclusive, nella lingua del cliente ('' = dato mancante).
    carburante: lingua === 'it' ? regole.carburante : pacchetti[lingua].sito.carburante,
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
    // Già confermata da un'altra strada (ritorno del cliente e avviso automatico arrivati insieme): niente da fare.
    const ora2 = await prima(db, 'SELECT stato, pagato, pagamento_rif FROM prenotazioni WHERE id = :id', { id: p.id });
    if (ora2?.stato === 'confermata' && ora2.pagato > 0 && ora2.pagamento_rif === rif) return 'confermata';
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
    esito: `${origine}${percorsoDi(p.lingua, 'esito')}?${q}`,
    ritornoPaypal: `${origine}/api/pagamento/paypal?${q}`,
    annullaPaypal: `${origine}${percorsoDi(p.lingua, 'esito')}?${q}&annullato=1`,
    notificaSumup: `${origine}/api/pagamento/sumup`,
    prova: `${origine}/prenota/prova/?${q}&ritorno=${encodeURIComponent(percorsoDi(p.lingua, 'esito'))}`,
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

export const linkPrenotazione = (origine, p) => `${origine}${percorsoDi(p.lingua, 'esito')}?codice=${encodeURIComponent(p.codice)}&t=${encodeURIComponent(p.token)}`;

// Righe con il prezzo: sconto, extra, buono regalo, pagato.
// Righe del prezzo per le email del cliente, nella sua lingua (la nota dello sconto resta come è salvata).
export async function righePrezzo(db, p) {
  const extra = db ? await extraDi(db, p.id) : [];
  const M = testiEmailDi(linguaValida(p.lingua)).prezzo;
  const T = testiPrenotaDi(linguaValida(p.lingua));
  const soldi = (cent) => T.euro(Math.round(cent) / 100);
  return [
    p.sconto_nota && p.sconto ? `${p.sconto > 0 ? M.sconto : M.maggiorazione}: ${p.sconto_nota} (${p.sconto > 0 ? '−' : '+'}${soldi(Math.abs(p.sconto))})` : null,
    ...extra.map((e) => `${M.extra}: ${e.nome}${e.quantita > 1 ? ` × ${e.quantita}` : ''} (${soldi(e.totale * 100)})`),
    M.totale(soldi(p.totale)),
    p.buono ? M.buono(soldi(p.buono)) : null,
    p.pagato ? M.pagato(p.metodo, soldi(p.pagato)) : null,
    daPagare(p) > 0 ? M.daPagare(soldi(daPagare(p))) : null,
  ].filter(Boolean);
}

export async function inviaEmailConferma(env, p, origine) {
  const v = vistaCliente(p);
  const lingua = linguaValida(p.lingua);
  const M = testiEmailDi(lingua);
  const T = testiPrenotaDi(lingua);
  const persone = T.persone(v.adulti, v.bambini + v.neonati);
  const ritrovo = (() => { const ora = oraRitrovo(v.orario, v.imbarcoId); return ora ? T.info.ritrovo(ora, anticipoDi(v.imbarcoId)) : null; })();
  const link = linkPrenotazione(origine, p);
  const prezzo = await righePrezzo(env.DB, p);
  const { azienda } = sito;
  // null = riga che non serve per questa prenotazione; '' = riga vuota tra un blocco e l'altro.
  const righe = [
    M.ciao(p.nome),
    p.stato === 'confermata' ? M.conferma.confermata : M.conferma.ricevuto,
    '',
    `${M.codice}: ${p.codice}`,
    // "Gommone in esclusiva" quando il nome dell'escursione non lo dice già (il tour privato lo dice in ogni lingua).
    `${v.escursione} · ${v.turno}${v.privato && p.escursione !== 'tour-privato' && !/esclusiva/i.test(v.escursione) ? M.esclusiva : ''}`,
    `${M.data}: ${v.dataLeggibile}`,
    `${M.imbarco}: ${v.imbarco}`,
    v.orario ? `${M.orario}: ${v.orario}${v.orarioIndicativo ? M.indicativo : ''}` : M.orarioDopo,
    ritrovo,
    `${M.persone}: ${persone}`,
    ...prezzo,
    v.carburanteEscluso && v.carburante ? T.info.carburante(v.carburante) : null,
    '',
    v.documento ? M.conferma.documento : null,
    !v.privato && v.minimo ? T.info.minimo(v.minimo) : null,
    M.conferma.cancellazione(v.cancellazioneGratisOre),
    '',
    M.conferma.biglietto(link),
    v.annullabile ? M.conferma.annullabile(v.cancellazioneGratisOre) : null,
    sito.contatti.telefonoVisibile ? M.whatsapp(sito.contatti.telefonoVisibile) : null,
    '',
    `${azienda.ragioneSociale || sito.nome}${azienda.indirizzo ? ` · ${azienda.indirizzo}` : ''}${azienda.partitaIva ? ` · P. IVA ${azienda.partitaIva}` : ''}`,
    '',
    '----------',
    M.conferma.condizioni,
    '',
    condizioniInTesto(lingua),
  ].filter((r) => r !== null);
  await inviaEmail(env, { a: p.email, oggetto: M.conferma.oggetto(p.codice, v.escursione), testo: righe.join('\n') });
  if (sito.contatti.email) {
    await inviaEmail(env, {
      a: sito.contatti.email,
      oggetto: `Nuova prenotazione ${p.codice} · ${titoloEscursione(p.escursione)} · ${dataLeggibile(p.data)}`,
      testo: [[p.nome, p.telefono, p.email].filter(Boolean).join(' · '), `${titoloEscursione(p.escursione)} · ${turnoDi(p.escursione, p.turno)?.nome ?? p.turno} · ${dataLeggibile(p.data)}`, `Imbarco: ${v.imbarco}`, `Persone: ${testiPrenotaDi('it').persone(v.adulti, v.bambini + v.neonati)}`, lingua !== 'it' ? `Lingua del cliente: ${lingua.toUpperCase()}` : '', `Totale: ${euroDaCent(p.totale)} € · pagato ${euroDaCent(p.pagato)} € (${p.metodo})${p.buono ? ` · buono ${euroDaCent(p.buono)} €` : ''}${p.sconto_nota ? ` · ${p.sconto_nota}` : ''}`, p.campagna ? `Volantino: ${p.campagna}` : '', `Gommone: ${nomeGommone(p.barca)}`, `Canale: ${p.canale}`, p.note ? `Note: ${p.note}` : ''].filter(Boolean).join('\n'),
    });
  }
}
