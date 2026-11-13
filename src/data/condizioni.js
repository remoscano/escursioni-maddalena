// Condizioni di prenotazione: un'unica fonte per la pagina /condizioni/ e per l'email di conferma.
// La legge chiede di mandare al cliente, dopo l'acquisto, la conferma con tutte le condizioni su un
// "supporto durevole" (art. 51, comma 7, del Codice del consumo): l'email la contiene per intero.
//
// Ogni paragrafo è una lista di pezzi: testo, oppure { manca: 'etichetta' } per un dato non ancora fornito
// (sul sito diventa un segnaposto rosa, nell'email "[etichetta]"). Si compila in sito.js e prenotazioni.js.
//
// Controllate sulle norme l'8 novembre 2026: Codice del consumo (artt. 33, 49, 51, 59, 62, 66-bis),
// D.Lgs. 70/2003 (artt. 7, 12, 13). Non sono un parere legale.

import { sito } from './sito.js';
import { escursioni } from './escursioni.js';
import {
  regole, offerte, gommoni, postiMassimi, testoChiusuraOnline, testoDopoChiusura, CARBURANTE_MANCA,
} from './prenotazioni.js';

const { azienda, contatti } = sito;
const v = (valore, etichetta) => (valore === undefined || valore === null || String(valore).trim() === '' ? { manca: etichetta } : String(valore));

const nomiDa = (imbarco) => escursioni.filter((e) => offerte[e.slug]?.imbarchi.includes(imbarco)).map((e) => e.titolo).join(' e ');
const nomi = (tipo) => escursioni.filter((e) => offerte[e.slug]?.tipo === tipo).map((e) => e.titolo).join(', ');
const minimo = Math.min(...Object.values(offerte).filter((o) => o.tipo === 'gruppo').map((o) => o.minimo));
const piuPiccolo = Math.min(...gommoni.map((g) => g.posti));
const { bambiniFinoA } = regole.eta;

export const aggiornamento = '11 novembre 2026';

export const condizioni = [
  {
    titolo: 'Chi organizza',
    paragrafi: [
      ['Le escursioni sono organizzate da ', v(azienda.ragioneSociale, 'Ragione sociale'), ', con sede in ', v(azienda.indirizzo, 'indirizzo'),
        ', P. IVA ', v(azienda.partitaIva, 'numero'), ', iscrizione REA ', v(azienda.rea, 'numero'), '.'],
      ['Contatti: WhatsApp e telefono ', v(contatti.telefonoVisibile, 'numero'), ', email ', v(contatti.email, 'email'), '.'],
    ],
  },
  {
    titolo: 'Le escursioni',
    punti: [
      [`Uscite di gruppo (${nomi('gruppo')}): prenoti i posti per le persone del tuo gruppo, a bordo con altri ospiti, fino a ${postiMassimi} persone sul gommone.`],
      [`In esclusiva (${nomi('esclusiva')}): il gommone è solo per il tuo gruppo, fino a ${postiMassimi} persone. In base a quante siete vi assegniamo il gommone da ${piuPiccolo} posti o uno da ${postiMassimi}. Il prezzo è per gommone, non a persona.`],
      [`Partenza da La Maddalena, con passaggio a Palau per chi si imbarca lì, oppure da Cannigione. Da Cannigione parte un gommone dedicato, solo per ${nomiDa('cannigione')}.`],
      ["Con te c'è sempre lo skipper: non noleggiamo gommoni senza skipper."],
      ['Orari, programma e cosa è compreso sono nella pagina di ogni escursione e nel riepilogo prima di pagare.'],
    ],
  },
  {
    titolo: 'Come si prenota online',
    punti: [
      ["Scegli escursione, giorno, orario, numero di persone e punto d'imbarco, poi inserisci nome, email e telefono."],
      ['Prima di pagare vedi il riepilogo con il totale: puoi correggere ogni scelta tornando ai passi precedenti.'],
      [`Spunta la casella delle condizioni e scegli come pagare. Mentre paghi, i posti restano tenuti per te per ${regole.minutiPerPagare} minuti.`],
      ["La prenotazione è confermata quando il pagamento va a buon fine: vedi subito il codice di prenotazione e ricevi un'email con il riepilogo e una copia di queste condizioni. Conserva il codice: ti serve all'imbarco."],
      [`${testoChiusuraOnline} ${testoDopoChiusura}`],
      ["Il contratto si conclude in italiano. Conserviamo la tua prenotazione: puoi rivederla dal link nell'email di conferma."],
    ],
  },
  {
    titolo: 'Prezzi e pagamento',
    punti: [
      ["I prezzi sono in euro e comprendono l'IVA. Cambiano in base al periodo: quello della tua data lo vedi nel calendario e nel riepilogo."],
      ['Si paga tutto al momento della prenotazione, con carta (tramite SumUp) o con PayPal, sulle loro pagine sicure. Non ci sono costi in più per il metodo di pagamento.'],
      [`Fino a ${bambiniFinoA} anni c'è il prezzo ridotto.`],
      ['Nelle escursioni in esclusiva il carburante non è compreso nel prezzo e si paga a parte: ', v(regole.carburante, CARBURANTE_MANCA), '.'],
      ['Il ticket del Parco Nazionale è compreso nel prezzo.'],
    ],
  },
  {
    titolo: 'Numero minimo nelle uscite di gruppo',
    paragrafi: [
      [`Le uscite di gruppo partono con almeno ${minimo} persone paganti. Se la sera prima il minimo non è raggiunto ti avvisiamo e scegli tu: un'altra data, un'altra escursione o il rimborso completo.`],
    ],
  },
  {
    titolo: 'Se annulli tu',
    punti: [
      [`Fino a ${regole.cancellazioneGratisOre} ore prima della partenza: rimborso completo. Scrivici su WhatsApp o per email con il codice di prenotazione.`],
      ["Dopo, o se non ti presenti all'imbarco, l'importo non è rimborsabile."],
      ['Per le escursioni prenotate per una data precisa la legge non prevede il diritto di recesso di 14 giorni (art. 59, comma 1, lettera n, del Codice del consumo): valgono le regole qui sopra.'],
      ['Il rimborso arriva sullo stesso metodo con cui hai pagato.'],
    ],
  },
  {
    titolo: 'Maltempo e se annulliamo noi',
    paragrafi: [
      ["La sicurezza viene prima di tutto: è lo skipper a decidere se e dove si può navigare. L'itinerario può cambiare in base a vento e mare, scegliendo le cale più riparate."],
      ["Se mare o vento non permettono di uscire, o se dobbiamo annullare per un altro motivo (per esempio un guasto), scegli tu: rimborso completo o un'altra data."],
      ['Per proteggerla, alla Spiaggia Rosa di Budelli il Parco vieta sbarco e bagno: si ammira dal mare.'],
    ],
  },
  {
    titolo: 'Corsica',
    paragrafi: [
      ["Si entra in Francia: ogni partecipante, bambini compresi, deve avere un documento valido per l'espatrio (carta d'identità valida per l'espatrio o passaporto). Chi non ce l'ha non può imbarcarsi, e questo non dà diritto a rimborsi."],
    ],
  },
  {
    titolo: 'A bordo',
    punti: [
      [`Il ritrovo al molo è ${regole.anticipoRitrovo.maddalena} minuti prima della partenza a La Maddalena e a Cannigione, ${regole.anticipoRitrovo.palau} minuti prima a Palau (per le uscite delle 9:30: alle 9:15 a La Maddalena e a Cannigione, alle 9:00 a Palau). L'uscita non può aspettare chi arriva in ritardo.`],
      ["Segui le indicazioni dello skipper, che è responsabile della sicurezza a bordo."],
      ['I minori partecipano accompagnati da un adulto.'],
      ['Gli animali non sono ammessi a bordo.'],
      ['I bambini sono benvenuti a qualsiasi età. I giubbotti di salvataggio a bordo sono in taglia da adulto: per i bambini puoi portare il loro.'],
    ],
  },
  {
    titolo: 'Strutture partner e altre piattaforme',
    paragrafi: [
      ['Se prenoti tramite il tuo hotel o la tua struttura, o dal loro link, il contratto è con noi e valgono queste condizioni. La struttura riceve da noi una provvigione: per te il prezzo non cambia.'],
      ["Se hai prenotato su un'altra piattaforma (per esempio GetYourGuide o Viator), per pagamento e cancellazione valgono le condizioni di quella piattaforma."],
    ],
  },
  {
    titolo: 'Reclami, legge e giudice competente',
    paragrafi: [
      ['Per qualsiasi problema scrivici a ', v(contatti.email, 'email'), ' o su WhatsApp ', v(contatti.telefonoVisibile, 'numero'), ': rispondiamo il prima possibile.'],
      ['Il contratto è regolato dalla legge italiana. Se prenoti come consumatore restano valide le tutele più favorevoli della legge del Paese in cui vivi, e per eventuali cause è competente il giudice del luogo in cui risiedi.'],
    ],
  },
];

// Versione in testo semplice, per l'email di conferma.
const riga = (pezzi) => pezzi.map((x) => (typeof x === 'string' ? x : `[${x.manca}]`)).join('');
export function condizioniInTesto() {
  return condizioni
    .map((s) => [s.titolo.toUpperCase(), ...(s.paragrafi ?? []).map(riga), ...(s.punti ?? []).map((p) => `- ${riga(p)}`)].join('\n'))
    .join('\n\n') + `\n\nUltimo aggiornamento: ${aggiornamento}`;
}
