// Operazioni sulle prenotazioni condivise da più API: lettura, conferma dopo il pagamento, email.

import { offerte, turnoDi, regole, imbarchiPrenotazione, gommoni } from '../../src/data/prenotazioni.js';
import { escursioni } from '../../src/data/escursioni.js';
import { sito } from '../../src/data/sito.js';
import { prima, esegui, registra } from './db.js';
import { riattivaSeLibero } from './motore.js';
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

// Dati della prenotazione da mostrare al cliente (niente dati interni).
export function vistaCliente(p) {
  const t = turnoDi(p.escursione, p.turno);
  const offerta = offerte[p.escursione];
  return {
    codice: p.codice,
    escursione: titoloEscursione(p.escursione),
    slug: p.escursione,
    turno: t?.nome ?? p.turno,
    data: p.data,
    dataLeggibile: dataLeggibile(p.data),
    orario: t?.orario || '',
    carburanteEscluso: Boolean(offerta?.carburanteEscluso),
    imbarco: nomeImbarco(p.imbarco),
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
  if (p.stato === 'confermata') return 'confermata';
  if (importo < p.totale) {
    await esegui(db, "UPDATE prenotazioni SET stato = 'da_verificare', pagato = :i, aggiornata_il = :ora WHERE id = :id", { i: importo, ora: new Date().toISOString(), id: p.id });
    await registra(db, chi, 'pagamento-importo-diverso', { codice: p.codice, importo, totale: p.totale });
    return 'da_verificare';
  }
  const ora = new Date().toISOString();
  let stato = 'confermata';
  const r = await esegui(db, `UPDATE prenotazioni SET stato = 'confermata', pagato = :i, pagamento_rif = :rif, aggiornata_il = :ora
                              WHERE id = :id AND stato = 'in_attesa' AND scade_il > :ora`, { i: importo, rif, ora, id: p.id });
  if (r.meta?.changes !== 1) {
    // Pagamento arrivato dopo la scadenza: si conferma solo se il posto è ancora libero.
    const ok = await riattivaSeLibero(db, p, 'confermata', { pagato: importo, pagamento_rif: rif });
    if (!ok) {
      stato = 'da_verificare';
      await esegui(db, "UPDATE prenotazioni SET stato = 'da_verificare', pagato = :i, pagamento_rif = :rif, aggiornata_il = :ora WHERE id = :id AND stato != 'confermata'", { i: importo, rif, ora, id: p.id });
    }
  }
  await registra(db, chi, stato === 'confermata' ? 'pagamento-confermato' : 'pagamento-senza-posto', { codice: p.codice, importo, rif });
  const aggiornata = await prima(db, 'SELECT * FROM prenotazioni WHERE id = :id', { id: p.id });
  contesto.waitUntil?.(inviaEmailConferma(contesto.env, aggiornata, new URL(contesto.request.url).origin));
  return aggiornata.stato;
}

// ---------- Email (facoltative) ----------
// Funzionano quando ci sono RESEND_API_KEY ed EMAIL_MITTENTE (es. "Escursioni Maddalena <prenotazioni@dominio.it>").
// Serve il dominio collegato: finché manca, la conferma si vede a schermo e nella gestione.

export async function inviaEmail(env, { a, oggetto, testo }) {
  if (!env.RESEND_API_KEY || !env.EMAIL_MITTENTE || !a) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
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

export async function inviaEmailConferma(env, p, origine) {
  const v = vistaCliente(p);
  const persone = [
    v.adulti && `${v.adulti} ${v.adulti === 1 ? 'adulto' : 'adulti'}`,
    v.bambini && `${v.bambini} ${v.bambini === 1 ? 'bambino' : 'bambini'}`,
    v.neonati && `${v.neonati} ${v.neonati === 1 ? 'neonato' : 'neonati'}`,
  ].filter(Boolean).join(', ');
  const link = `${origine}/prenota/esito/?codice=${encodeURIComponent(p.codice)}&t=${encodeURIComponent(p.token)}`;
  const righe = [
    `Ciao ${p.nome},`,
    p.stato === 'confermata' ? 'la tua prenotazione è confermata.' : 'abbiamo ricevuto il tuo pagamento: ti contattiamo a breve per confermare il posto.',
    '',
    `Codice: ${p.codice}`,
    `${v.escursione} · ${v.turno}`,
    `Data: ${v.dataLeggibile}`,
    `Imbarco: ${v.imbarco}`,
    v.orario ? `Orario: ${v.orario}` : 'Orario: te lo confermiamo noi',
    `Persone: ${persone}`,
    `Totale pagato: ${euroDaCent(p.pagato || p.totale)} €`,
    v.carburanteEscluso ? 'Il carburante non è compreso e si paga a parte.' : '',
    '',
    v.documento ? 'Si va in Corsica: porta un documento valido per l’espatrio per ogni persona, anche per i bambini.' : '',
    !v.privato && v.minimo ? `L’uscita parte con almeno ${v.minimo} persone: se non si raggiungono ti proponiamo un’altra data o ti rimborsiamo per intero.` : '',
    `Cancellazione gratuita fino a ${v.cancellazioneGratisOre} ore prima. Con mare o vento non sicuri annulliamo noi e scegli tu: rimborso completo o nuova data.`,
    '',
    `La tua prenotazione: ${link}`,
    sito.contatti.telefonoVisibile ? `Per qualsiasi cosa scrivici su WhatsApp: ${sito.contatti.telefonoVisibile}` : '',
    '',
    sito.nome,
  ].filter((r) => r !== '');
  await inviaEmail(env, { a: p.email, oggetto: `Prenotazione ${p.codice} · ${v.escursione}`, testo: righe.join('\n') });
  if (sito.contatti.email) {
    await inviaEmail(env, {
      a: sito.contatti.email,
      oggetto: `Nuova prenotazione ${p.codice} · ${v.escursione} · ${v.dataLeggibile}`,
      testo: [`${p.nome} · ${p.telefono || ''} · ${p.email || ''}`, `${v.escursione} · ${v.turno} · ${v.dataLeggibile}`, `Imbarco: ${v.imbarco}`, `Persone: ${persone}`, `Totale: ${euroDaCent(p.pagato || p.totale)} € (${p.metodo})`, `Gommone: ${nomeGommone(p.barca)}`, `Canale: ${p.canale}`, p.note ? `Note: ${p.note}` : ''].filter(Boolean).join('\n'),
    });
  }
}
