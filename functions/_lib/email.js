// Email ai clienti oltre alla conferma: maltempo (rinvio o rimborso), link di pagamento, annullamento,
// promemoria del giorno prima, grazie dopo l'uscita, lista d'attesa, buono regalo.
// Partono solo se le email sono attive (RESEND_API_KEY ed EMAIL_MITTENTE). Testo semplice, senza immagini né tracciamenti.

import { oraRitrovo, anticipoDi, offerte } from '../../src/data/prenotazioni.js';
import { sito } from '../../src/data/sito.js';
import { testiEmailDi } from '../../src/data/email-testi.js';
import { testiPrenotaDi } from '../../src/data/prenota-testi.js';
import { linguaValida, percorsoDi } from '../../src/data/percorsi.js';
import { pacchetti } from '../../src/data/lingua.js';
import { inviaEmail, vistaCliente, linkPrenotazione, daPagare, dataIn } from './prenotazioni.js';
import { dataLeggibile } from './util.js';

// Testi, importi e persone nella lingua del cliente (src/data/email-testi.js; l'italiano è il testo di riferimento).
export const linguaEmail = (l) => {
  const lingua = linguaValida(l);
  const T = testiPrenotaDi(lingua);
  return {
    lingua, M: testiEmailDi(lingua), T,
    soldi: (cent) => T.euro(Math.round(cent) / 100),
    ritrovo: (orario, imbarco) => { const ora = oraRitrovo(orario, imbarco); return ora ? T.info.ritrovo(ora, anticipoDi(imbarco)) : ''; },
  };
};

export const firma = (M) => [
  '',
  sito.contatti.telefonoVisibile ? M.whatsapp(sito.contatti.telefonoVisibile) : null,
  sito.nome,
].filter((r) => r !== null);

const testa = (v, M, T) => [`${M.codice}: ${v.codice}`, `${v.escursione} · ${v.turno}`, `${M.data}: ${v.dataLeggibile}`, `${M.imbarco}: ${v.imbarco}`, `${M.persone}: ${T.persone(v.adulti, v.bambini + v.neonati)}`];

// Uscita annullata da noi (maltempo o altro motivo): il cliente sceglie rinvio o rimborso dal link.
export async function inviaEmailRecupero(env, p, origine, motivo) {
  const v = vistaCliente(p);
  const { M, T, soldi, lingua } = linguaEmail(p.lingua);
  // La gestione salva "Uscita annullata: motivo": al cliente basta il motivo. Il motivo è scritto in italiano
  // dall'ufficio: nelle altre lingue si dice solo che è per le condizioni del mare.
  motivo = lingua === 'it' ? String(motivo || '').replace(/^Uscita annullata:?\s*/i, '') : '';
  const testo = [
    M.ciao(p.nome),
    M.recupero.annullata(v.dataLeggibile, motivo),
    '',
    ...testa(v, M, T),
    '',
    M.recupero.scegli,
    linkPrenotazione(origine, p),
    '',
    M.recupero.altraData,
    M.recupero.rimborso(soldi(p.pagato + (p.buono || 0)), p.buono),
    '',
    M.recupero.dispiace,
    ...firma(M),
  ];
  return inviaEmail(env, { a: p.email, oggetto: M.recupero.oggetto(p.codice), testo: testo.join('\n') });
}

// Prenotazione presa dalla gestione: il cliente paga online dal link.
export async function inviaEmailLinkPagamento(env, p, origine) {
  const v = vistaCliente(p);
  const { M, T, soldi } = linguaEmail(p.lingua);
  const scade = p.stato === 'in_attesa' && p.scade_il
    ? new Intl.DateTimeFormat(T.locale, { timeZone: 'Europe/Rome', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(p.scade_il))
    : null;
  const testo = [
    M.ciao(p.nome),
    p.stato === 'in_attesa' ? M.link.tenuti : M.link.ecco,
    '',
    ...testa(v, M, T),
    M.link.daPagare(soldi(daPagare(p))),
    '',
    M.link.paga(`${origine}${percorsoDi(p.lingua, 'paga')}?codice=${encodeURIComponent(p.codice)}&t=${encodeURIComponent(p.token)}`),
    scade ? M.link.scade(scade) : null,
    ...firma(M),
  ].filter((r) => r !== null);
  return inviaEmail(env, { a: p.email, oggetto: M.link.oggetto(p.codice, v.escursione), testo: testo.join('\n') });
}

// Prenotazione annullata (dal cliente o da noi) con l'esito del rimborso.
export async function inviaEmailAnnullata(env, p, { rimborsoFatto, importo, buonoReso }) {
  const v = vistaCliente(p);
  const { M, T, soldi } = linguaEmail(p.lingua);
  const testo = [
    M.ciao(p.nome),
    M.annullata.annullata(p.codice),
    '',
    ...testa(v, M, T),
    '',
    importo > 0 && rimborsoFatto ? M.annullata.rimborsoFatto(soldi(importo)) : null,
    importo > 0 && !rimborsoFatto ? M.annullata.rimborsoDaFare(soldi(importo)) : null,
    buonoReso > 0 ? M.annullata.buonoReso(soldi(buonoReso)) : null,
    ...firma(M),
  ].filter((r) => r !== null);
  return inviaEmail(env, { a: p.email, oggetto: M.annullata.oggetto(p.codice), testo: testo.join('\n') });
}

// Promemoria del giorno prima.
export async function inviaEmailPromemoria(env, p, origine) {
  const v = vistaCliente(p);
  const { M, T, soldi, ritrovo, lingua } = linguaEmail(p.lingua);
  const imbarco = sito.imbarchi[p.imbarco];
  // Stessa lista "Cosa portare" del sito (sito.cosaPortare), nella lingua del cliente: da bere lo diamo noi (Remo, 13 novembre 2026).
  const cosaPortare = pacchetti[lingua].sito.cosaPortare;
  const testo = [
    M.ciao(p.nome),
    M.promemoria.domani,
    '',
    ...testa(v, M, T),
    v.orario ? `${M.orario}: ${v.orario}${v.orarioIndicativo ? M.indicativo : ''}` : null,
    ritrovo(v.orario, p.imbarco) || null,
    imbarco?.molo ? M.promemoria.dove(imbarco.molo, imbarco.mappa) : null,
    p.imbarco === 'palau' && offerte[p.escursione]?.tipo === 'gruppo' ? M.promemoria.palau : null,
    '',
    v.documento ? M.conferma.documento : null,
    M.promemoria.cosaPortare(cosaPortare.map((x) => x.charAt(0).toLowerCase() + x.slice(1)).join('; ')),
    M.promemoria.biglietto(linkPrenotazione(origine, p)),
    daPagare(p) > 0 ? M.promemoria.daPagare(soldi(daPagare(p))) : null,
    '',
    M.promemoria.mare,
    ...firma(M),
  ].filter((r) => r !== null);
  return inviaEmail(env, { a: p.email, oggetto: M.promemoria.oggetto(v.escursione, p.codice), testo: testo.join('\n') });
}

// Grazie dopo l'uscita, con il link per lasciare una recensione su Google (se c'è).
export async function inviaEmailGrazie(env, p) {
  const v = vistaCliente(p);
  const { M } = linguaEmail(p.lingua);
  const testo = [
    M.ciao(p.nome),
    M.grazie.grazie(v.escursione),
    '',
    sito.recensioniGoogle ? M.grazie.recensione : null,
    sito.recensioniGoogle ? sito.recensioniGoogle : null,
    sito.recensioniGoogle ? '' : null,
    M.grazie.male,
    '',
    M.grazie.basta,
    ...firma(M),
  ].filter((r) => r !== null);
  return inviaEmail(env, { a: p.email, oggetto: M.grazie.oggetto(sito.nome), testo: testo.join('\n') });
}

// Lista d'attesa: si è liberato un posto. titolo e nomeTurno arrivano già nella lingua del cliente.
export async function inviaEmailAttesa(env, a, origine, titolo, nomeTurno) {
  const { M } = linguaEmail(a.lingua);
  const link = `${origine}${percorsoDi(a.lingua, 'prenota')}?escursione=${encodeURIComponent(a.escursione)}&imbarco=${encodeURIComponent(a.imbarco)}&data=${encodeURIComponent(a.data)}`;
  const testo = [
    M.ciao(a.nome),
    M.attesa.liberato(titolo, nomeTurno, dataIn(a.data, a.lingua), a.posti),
    '',
    M.attesa.prenota(link),
    '',
    M.attesa.unico,
    ...firma(M),
  ];
  return inviaEmail(env, { a: a.email, oggetto: M.attesa.oggetto(titolo), testo: testo.join('\n') });
}

// Buono regalo comprato online, nella lingua di chi l'ha comprato. Avviso all'ufficio in italiano.
export async function inviaEmailBuono(env, b, origine) {
  const { M, soldi } = linguaEmail(b.lingua);
  const testo = [
    M.ciao(b.acquirente),
    M.buono.grazie,
    '',
    `${M.codice}: ${b.codice}`,
    `${M.buono.valore}: ${soldi(b.valore)}`,
    b.destinatario ? `${M.buono.per}: ${b.destinatario}` : null,
    b.messaggio ? `${M.buono.messaggio}: ${b.messaggio}` : null,
    b.al ? M.buono.valido(dataIn(b.al, b.lingua)) : null,
    '',
    M.buono.stampa(`${origine}${percorsoDi(b.lingua, 'buonoEsito')}?codice=${encodeURIComponent(b.codice)}&t=${encodeURIComponent(b.token)}`),
    M.buono.usa(`${origine}${percorsoDi(b.lingua, 'prenota')}`),
    ...firma(M),
  ].filter((r) => r !== null);
  await inviaEmail(env, { a: b.email, oggetto: M.buono.oggetto(sito.nome), testo: testo.join('\n') });
  if (sito.contatti.email) {
    const it = linguaEmail('it');
    await inviaEmail(env, { a: sito.contatti.email, oggetto: `Buono regalo venduto ${b.codice} · ${it.soldi(b.valore)}`, testo: `${[b.acquirente, b.email, b.telefono].filter(Boolean).join(' · ')}\nValore: ${it.soldi(b.valore)} (${b.metodo})` });
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
