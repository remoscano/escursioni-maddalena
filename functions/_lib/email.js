// Email ai clienti oltre alla conferma: maltempo (rinvio o rimborso), link di pagamento, annullamento,
// promemoria del giorno prima, grazie dopo l'uscita, lista d'attesa, buono regalo.
// Partono solo se le email sono attive (RESEND_API_KEY ed EMAIL_MITTENTE). Testo semplice, senza immagini né tracciamenti.

import { testoRitrovo } from '../../src/data/prenotazioni.js';
import { sito } from '../../src/data/sito.js';
import { inviaEmail, vistaCliente, linkPrenotazione, daPagare } from './prenotazioni.js';
import { dataLeggibile, euroDaCent } from './util.js';

const firma = () => [
  '',
  sito.contatti.telefonoVisibile ? `Per qualsiasi cosa scrivici su WhatsApp: ${sito.contatti.telefonoVisibile}` : null,
  sito.nome,
].filter((r) => r !== null);

const persone = (v) => [
  v.adulti && `${v.adulti} ${v.adulti === 1 ? 'adulto' : 'adulti'}`,
  (v.bambini + v.neonati) && `${v.bambini + v.neonati} ${v.bambini + v.neonati === 1 ? 'bambino' : 'bambini'}`,
].filter(Boolean).join(', ');

const testa = (v) => [`Codice: ${v.codice}`, `${v.escursione} · ${v.turno}`, `Data: ${v.dataLeggibile}`, `Imbarco: ${v.imbarco}`, `Persone: ${persone(v)}`];

// Uscita annullata da noi (maltempo o altro motivo): il cliente sceglie rinvio o rimborso dal link.
export async function inviaEmailRecupero(env, p, origine, motivo) {
  const v = vistaCliente(p);
  const testo = [
    `Ciao ${p.nome},`,
    `purtroppo dobbiamo annullare l'uscita del ${v.dataLeggibile}${motivo ? `: ${motivo}` : ' per le condizioni del mare'}.`,
    '',
    ...testa(v),
    '',
    "Scegli tu cosa preferire, da qui (bastano due clic):",
    linkPrenotazione(origine, p),
    '',
    `- Un'altra data: scegli giorno e orario tra quelli con posti liberi. Il prezzo resta quello che hai pagato.`,
    `- Il rimborso completo: ${euroDaCent(p.pagato + (p.buono || 0))} €, sullo stesso metodo con cui hai pagato${p.buono ? ' (la parte pagata con il buono regalo torna sul buono)' : ''}.`,
    '',
    'Ci dispiace: in mare la sicurezza viene prima di tutto.',
    ...firma(),
  ];
  return inviaEmail(env, { a: p.email, oggetto: `Uscita annullata: scegli rinvio o rimborso · ${p.codice}`, testo: testo.join('\n') });
}

// Prenotazione presa dalla gestione: il cliente paga online dal link.
export async function inviaEmailLinkPagamento(env, p, origine) {
  const v = vistaCliente(p);
  const scade = p.stato === 'in_attesa' && p.scade_il
    ? new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(p.scade_il))
    : null;
  const testo = [
    `Ciao ${p.nome},`,
    p.stato === 'in_attesa' ? 'ti teniamo da parte i posti: per confermare la prenotazione paga online da questo link.' : 'ecco il link per pagare la tua prenotazione online.',
    '',
    ...testa(v),
    `Da pagare: ${euroDaCent(daPagare(p))} € (IVA inclusa)`,
    '',
    `Paga con carta o PayPal: ${origine}/prenota/paga/?codice=${encodeURIComponent(p.codice)}&t=${encodeURIComponent(p.token)}`,
    scade ? `I posti restano tenuti fino a ${scade}: dopo tornano disponibili.` : null,
    ...firma(),
  ].filter((r) => r !== null);
  return inviaEmail(env, { a: p.email, oggetto: `Paga la prenotazione ${p.codice} · ${v.escursione}`, testo: testo.join('\n') });
}

// Prenotazione annullata (dal cliente o da noi) con l'esito del rimborso.
export async function inviaEmailAnnullata(env, p, { rimborsoFatto, importo, buonoReso }) {
  const v = vistaCliente(p);
  const testo = [
    `Ciao ${p.nome},`,
    `la prenotazione ${p.codice} è annullata.`,
    '',
    ...testa(v),
    '',
    importo > 0 && rimborsoFatto ? `Rimborso: ${euroDaCent(importo)} €, sullo stesso metodo con cui hai pagato. Di solito arriva in pochi giorni lavorativi, a seconda della banca.` : null,
    importo > 0 && !rimborsoFatto ? `Rimborso: ${euroDaCent(importo)} €. Lo facciamo noi a breve, sullo stesso metodo con cui hai pagato.` : null,
    buonoReso > 0 ? `I ${euroDaCent(buonoReso)} € pagati con il buono regalo sono tornati sul buono: puoi usarlo per un'altra prenotazione.` : null,
    ...firma(),
  ].filter((r) => r !== null);
  return inviaEmail(env, { a: p.email, oggetto: `Prenotazione annullata · ${p.codice}`, testo: testo.join('\n') });
}

// Promemoria del giorno prima.
export async function inviaEmailPromemoria(env, p, origine) {
  const v = vistaCliente(p);
  const imbarco = sito.imbarchi[p.imbarco];
  const testo = [
    `Ciao ${p.nome},`,
    `domani si va in mare! Ecco tutto quello che ti serve.`,
    '',
    ...testa(v),
    v.orario ? `Orario: ${v.orario}${v.orarioIndicativo ? ' (indicativo: segue la luce del tramonto)' : ''}` : null,
    testoRitrovo(v.orario, p.imbarco) || null,
    imbarco?.molo ? `Dove: ${imbarco.molo}${imbarco.mappa ? ` (mappa: ${imbarco.mappa})` : ''}` : null,
    p.imbarco === 'palau' ? "Si parte da La Maddalena: a Palau il gommone passa a prenderti." : null,
    '',
    v.documento ? "Si va in Corsica: porta un documento valido per l'espatrio per ogni persona, anche per i bambini." : null,
    'Porta costume, telo, crema solare, cappello e acqua. Cibo e bevande sono a carico tuo (nelle esclusive le bevande sono incluse).',
    `Il tuo biglietto con il codice QR da mostrare all'imbarco: ${linkPrenotazione(origine, p)}`,
    daPagare(p) > 0 ? `Da pagare all'imbarco: ${euroDaCent(daPagare(p))} €.` : null,
    '',
    "Se il mare non è sicuro ti scriviamo noi prima della partenza: scegli tu tra un'altra data e il rimborso.",
    ...firma(),
  ].filter((r) => r !== null);
  return inviaEmail(env, { a: p.email, oggetto: `Domani: ${v.escursione} · ${p.codice}`, testo: testo.join('\n') });
}

// Grazie dopo l'uscita, con il link per lasciare una recensione su Google (se c'è).
export async function inviaEmailGrazie(env, p) {
  const v = vistaCliente(p);
  const testo = [
    `Ciao ${p.nome},`,
    `grazie per essere uscito in mare con noi a ${v.escursione}. Speriamo che ti sia piaciuto!`,
    '',
    sito.recensioniGoogle ? 'Se hai un minuto, una recensione su Google ci aiuta tantissimo: altri viaggiatori ci trovano grazie a te.' : null,
    sito.recensioniGoogle ? sito.recensioniGoogle : null,
    sito.recensioniGoogle ? '' : null,
    "Se qualcosa non è andato come speravi, rispondi a questa email: leggiamo tutto.",
    '',
    'Non vuoi ricevere altre email come questa? Rispondi con "no grazie" e non te ne mandiamo più.',
    ...firma(),
  ].filter((r) => r !== null);
  return inviaEmail(env, { a: p.email, oggetto: `Grazie da ${sito.nome}`, testo: testo.join('\n') });
}

// Lista d'attesa: si è liberato un posto.
export async function inviaEmailAttesa(env, a, origine, titolo, nomeTurno) {
  const link = `${origine}/prenota/?escursione=${encodeURIComponent(a.escursione)}&imbarco=${encodeURIComponent(a.imbarco)}&data=${encodeURIComponent(a.data)}`;
  const testo = [
    `Ciao ${a.nome},`,
    `si è liberato un posto per ${titolo} · ${nomeTurno} del ${dataLeggibile(a.data)}, per ${a.posti} ${a.posti === 1 ? 'persona' : 'persone'}.`,
    '',
    `Prenota da qui prima che lo prenda qualcun altro: ${link}`,
    '',
    "Ti abbiamo scritto perché eri in lista d'attesa: è l'unico messaggio che ti mandiamo per questa data.",
    ...firma(),
  ];
  return inviaEmail(env, { a: a.email, oggetto: `Si è liberato un posto · ${titolo}`, testo: testo.join('\n') });
}

// Buono regalo comprato online.
export async function inviaEmailBuono(env, b, origine) {
  const testo = [
    `Ciao ${b.acquirente},`,
    'grazie! Ecco il tuo buono regalo.',
    '',
    `Codice: ${b.codice}`,
    `Valore: ${euroDaCent(b.valore)} €`,
    b.destinatario ? `Per: ${b.destinatario}` : null,
    b.messaggio ? `Messaggio: ${b.messaggio}` : null,
    b.al ? `Valido fino al ${dataLeggibile(b.al)}` : null,
    '',
    `Il buono da stampare o da inoltrare: ${origine}/buono-regalo/esito/?codice=${encodeURIComponent(b.codice)}&t=${encodeURIComponent(b.token)}`,
    `Per usarlo: si prenota su ${origine}/prenota/ e si scrive il codice nel riepilogo, prima di pagare. Se il buono non copre tutto, la differenza si paga con carta o PayPal; se avanza qualcosa, resta sul buono.`,
    ...firma(),
  ].filter((r) => r !== null);
  await inviaEmail(env, { a: b.email, oggetto: `Il tuo buono regalo ${sito.nome}`, testo: testo.join('\n') });
  if (sito.contatti.email) {
    await inviaEmail(env, { a: sito.contatti.email, oggetto: `Buono regalo venduto ${b.codice} · ${euroDaCent(b.valore)} €`, testo: `${b.acquirente} · ${b.email} · ${b.telefono || ''}\nValore: ${euroDaCent(b.valore)} € (${b.metodo})` });
  }
}


// Skipper: mancano le spese di bordo di uno o più giorni lavorati.
export async function inviaEmailSpese(env, utente, giorni, origine, momento) {
  const elenco = giorni.map((d) => `- ${dataLeggibile(d)}`);
  const testo = [
    `Ciao ${utente.nome},`,
    momento === 'sera' && giorni.length === 1
      ? "oggi hai imbarcato dei clienti ma non hai ancora scritto le spese di bordo (carburante, bevande, cibo)."
      : 'mancano ancora le spese di bordo di questi giorni:',
    ...(momento === 'sera' && giorni.length === 1 ? [] : elenco),
    '',
    `Le scrivi in un minuto da qui, nella scheda Spese: ${origine}/imbarco/#spese`,
    'Se non hai speso niente, tocca "Nessuna spesa".',
    '',
    sito.nome,
  ];
  return inviaEmail(env, { a: utente.email, oggetto: momento === 'sera' ? 'Spese di bordo di oggi' : 'Mancano le spese di bordo', testo: testo.join('\n') });
}
