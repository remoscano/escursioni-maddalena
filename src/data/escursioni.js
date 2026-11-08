// Le quattro escursioni. Ogni voce genera la sua pagina in /escursioni/<slug>/
// con lo stesso modello della pagina "Tour delle 7 isole".
// I valori vuoti ('') diventano segnaposto rosa sul sito.

import { prezzoDa, offerte, gommoniPer } from './prenotazioni.js';

// Prezzi "da" e posti arrivano da src/data/prenotazioni.js (listino unico per sito e prenotazioni).
const da = (slug) => prezzoDa(slug) ?? {};
const posti = (slug) => String(Math.max(...gommoniPer(slug).map((g) => g.posti)));
// Partenza e rientro della Corsica, dall'orario del listino (es. '9:30 – 17:30').
const [partenzaCorsica, rientroCorsica] = offerte['corsica-lavezzi-bonifacio'].turni[0].orario.split('–').map((x) => x.trim());

export const escursioni = [
  {
    slug: 'tour-7-isole',
    titolo: 'Tour delle 7 isole',
    titoloPagina: 'Tour delle 7 isole in maxi gommone',
    inEvidenza: true,
    etichette: ['Giornata intera', '7 soste', 'Pranzo libero a La Maddalena'],
    breve:
      'La Maddalena, Santo Stefano, Caprera, Spargi, Budelli, Razzoli e Santa Maria in una giornata, con la Spiaggia Rosa vista dal mare.',
    intro:
      'Una giornata intera tra La Maddalena, Santo Stefano, Caprera, Spargi, Budelli, Razzoli e Santa Maria, con la Spiaggia Rosa vista dal mare.',
    durata: 'Giornata intera',
    orari: offerte['tour-7-isole'].turni[0].orario,
    ore: '8',
    oraRientro: '17:30',
    prezzoAdulti: String(da('tour-7-isole').adulto),
    prezzoBambini: String(da('tour-7-isole').bambino),
    postiMax: posti('tour-7-isole'),
    fatti: ['Imbarco a Palau o La Maddalena', 'Pranzo libero a La Maddalena', 'Spiaggia Rosa dal mare'],
    foto: {
      copertina: "Cala Corsara dall'alto, con il gommone all'ancora",
      galleria: [
        "Porto della Madonna dall'alto, il gommone tra le tre isole",
        'La Spiaggia Rosa dal gommone',
        'Ospiti in acqua a Cala Garibaldi',
        'Il centro di La Maddalena a pranzo',
        'Cala Corsara, sabbia e graniti',
      ],
    },
    mappa: true,
    numeri: [
      { etichetta: 'Isole', valore: '7' },
      { etichetta: 'Soste', valore: '7 + 1 dal mare' },
    ],
    programma: [
      { tipo: 'imbarco', titolo: 'Ritrovo a Palau', testo: 'Primo imbarco al porto di Palau.', moloDi: 'palau' },
      { tipo: 'sosta', n: '1', titolo: 'Porto di La Maddalena', luogo: 'Secondo imbarco', testo: "Sale a bordo chi dorme sull'isola, poi rotta verso sud." },
      { tipo: 'sosta', n: '2', titolo: 'Cala Villa Marina', luogo: 'Santo Stefano · bagno', testo: 'Una cala riparata dal maestrale sulla costa sud di Santo Stefano: il primo tuffo della giornata.' },
      { tipo: 'sosta', n: '3', titolo: 'Cala Garibaldi', luogo: 'Caprera · bagno', testo: "Sabbia dorata, rocce chiare e macchia mediterranea sulla costa nord-ovest di Caprera, l'isola di Garibaldi." },
      { tipo: 'sosta', n: '4', titolo: 'Pranzo a La Maddalena', luogo: 'Pranzo libero', testo: 'Tempo libero nel centro storico per pranzare dove preferisci, a carico dei partecipanti.' },
      { tipo: 'sosta', n: '5', titolo: 'Cala Corsara', luogo: 'Spargi · bagno', testo: 'Quattro spiaggette di sabbia bianca finissima tra graniti modellati da vento e mare. Si arriva solo dal mare.' },
      { tipo: 'vista', titolo: 'Spiaggia Rosa', luogo: 'Budelli · senza sosta', testo: 'Passaggio lento davanti alla spiaggia. Per proteggerla il Parco vieta sbarco e bagno: la si ammira dal mare.' },
      { tipo: 'sosta', n: '6', titolo: 'Manto della Madonna', luogo: 'Porto della Madonna · bagno', testo: "Lo specchio d'acqua chiuso tra Budelli, Razzoli e Santa Maria, riparato dalle correnti: l'effetto è quello di una piscina naturale." },
      { tipo: 'sosta', n: '7', titolo: 'Lagunetta della Madonna', luogo: 'Ultimo bagno', testo: '', mancante: 'Una riga sulla Lagunetta: dove si trova e cosa la rende speciale' },
      { tipo: 'rientro', titolo: 'Rientro a La Maddalena e Palau', testo: 'Si scende dove si è saliti.' },
    ],
    incluso: ['Skipper per tutta la giornata', 'Carburante', 'Ticket del Parco'],
    inclusoMancante: 'Da confermare: maschere, acqua a bordo',
    nonIncluso: ['Pranzo a La Maddalena'],
    nonInclusoMancante: 'Altro da segnalare',
    note: [],
  },
  {
    slug: 'corsica-lavezzi-bonifacio',
    titolo: 'Corsica: Lavezzi e Bonifacio',
    titoloPagina: 'Corsica in maxi gommone: Lavezzi e Bonifacio',
    etichette: ['Solo il vostro gruppo', 'Bocche di Bonifacio', "Documento per l'espatrio"],
    breve: 'Il gommone solo per voi, una giornata intera oltre le Bocche di Bonifacio: le isole Lavezzi e le bianche falesie di Bonifacio.',
    intro:
      'Una giornata intera con il gommone solo per il vostro gruppo: si attraversano le Bocche di Bonifacio per raggiungere la Corsica, le acque trasparenti delle isole Lavezzi e le falesie bianche su cui è costruita Bonifacio.',
    durata: 'Giornata intera',
    orari: offerte['corsica-lavezzi-bonifacio'].turni[0].orario,
    ore: '8',
    prezzoAdulti: String(da('corsica-lavezzi-bonifacio').barca),
    prezzoBambini: null,
    prezzoGommone: true,
    postiMax: posti('corsica-lavezzi-bonifacio'),
    fatti: ['Gommone in esclusiva', 'Imbarco a Palau o La Maddalena', "Serve un documento valido per l'espatrio"],
    foto: {
      copertina: 'Le falesie di Bonifacio viste dal mare',
      galleria: [
        'Le falesie di Bonifacio dal gommone',
        'Le isole Lavezzi, acqua e granito',
        'Ospiti in acqua alle Lavezzi',
        'Il porto di Bonifacio',
        'La traversata delle Bocche',
      ],
    },
    mappa: false,
    numeri: [],
    programma: [
      { tipo: 'imbarco', ora: partenzaCorsica, titolo: 'Ritrovo dove preferite', luogo: 'Palau o La Maddalena', testo: 'Si parte dal porto che scegliete.' },
      { tipo: 'sosta', n: '1', titolo: 'Traversata delle Bocche di Bonifacio', luogo: 'Verso la Corsica', testo: '', mancante: 'Durata della traversata e cosa si vede' },
      { tipo: 'sosta', n: '2', titolo: 'Isole Lavezzi', luogo: 'Bagno', testo: '', mancante: 'Dove si fa il bagno e quanto dura la sosta' },
      { tipo: 'sosta', n: '3', titolo: 'Bonifacio', luogo: 'Falesie e porto', testo: '', mancante: 'Giro sotto le falesie, sosta in paese, pranzo' },
      { tipo: 'rientro', ora: rientroCorsica, titolo: 'Rientro', testo: 'Si scende dove si è saliti.' },
    ],
    incluso: ['Il gommone e lo skipper solo per il vostro gruppo', 'Ticket del Parco'],
    inclusoMancante: 'Da confermare',
    nonIncluso: ['Carburante: a consumo, si paga a bordo a fine uscita'],
    nonInclusoMancante: 'Pranzo? Tasse di sbarco?',
    note: [
      "Si entra in Francia: ognuno deve avere con sé carta d'identità valida per l'espatrio o passaporto, anche i bambini.",
      'La traversata dipende dal mare nelle Bocche: con vento forte l\'uscita può essere spostata.',
    ],
  },
  {
    slug: 'tramonto-mezza-giornata',
    titolo: 'Tramonto o mezza giornata',
    titoloPagina: 'Tramonto o mezza giornata in maxi gommone',
    etichette: ['Mezza giornata', 'Tramonto'],
    breve: "Qualche ora tra le cale più vicine, oppure l'uscita che rientra con il sole basso sul mare.",
    intro:
      "Per chi ha poco tempo o vuole vedere l'arcipelago con la luce più bella: qualche ora tra le cale più vicine, al mattino, al pomeriggio o fino al tramonto.",
    durata: 'Mezza giornata',
    orari: '9:30–13:30 · 14:00–18:00 · tramonto 18:00–20:30',
    ore: '4',
    prezzoAdulti: String(da('tramonto-mezza-giornata').adulto),
    prezzoBambini: String(da('tramonto-mezza-giornata').bambino),
    postiMax: posti('tramonto-mezza-giornata'),
    fatti: ['Imbarco a Palau o La Maddalena', 'Mattina, pomeriggio o tramonto'],
    foto: {
      copertina: 'Il gommone controluce al tramonto',
      galleria: [
        'Il gommone al tramonto tra le isole',
        'Tuffo in una cala vicina',
        'Il cielo arancione sul mare',
        'Ospiti a prua con la luce della sera',
        "Una cala di Caprera o Santo Stefano",
      ],
    },
    mappa: false,
    numeri: [],
    programma: [
      { tipo: 'imbarco', titolo: 'Ritrovo a Palau o a La Maddalena', testo: 'Mattina 9:30–13:30, pomeriggio 14:00–18:00, tramonto 18:00–20:30 con aperitivo.' },
      { tipo: 'sosta', n: '1', titolo: 'Prima cala', luogo: 'Bagno', testo: '', mancante: 'Quali cale si visitano di solito' },
      { tipo: 'sosta', n: '2', titolo: 'Seconda cala', luogo: 'Bagno', testo: '', mancante: 'Quali cale si visitano di solito' },
      { tipo: 'vista', titolo: 'Il tramonto dal mare', luogo: 'Solo uscita del tramonto', testo: '', mancante: 'Dove vi fermate a guardare il tramonto' },
      { tipo: 'rientro', titolo: 'Rientro', testo: 'Si scende dove si è saliti.' },
    ],
    incluso: ['Skipper', 'Carburante', 'Ticket del Parco', 'Aperitivo a bordo nell\'uscita al tramonto'],
    inclusoMancante: "Da confermare: cos'altro è incluso",
    nonIncluso: [],
    nonInclusoMancante: 'Altro da segnalare',
    note: [],
  },
  {
    slug: 'tour-privato',
    titolo: 'Tour privato in esclusiva',
    titoloPagina: 'Tour privato in maxi gommone',
    etichette: ['Solo il vostro gruppo', 'Su misura'],
    breve: 'Il gommone solo per voi, famiglie, amici o aziende, con itinerario e orari da concordare.',
    intro:
      "Il maxi gommone solo per il vostro gruppo: famiglie, amici, aziende o un'occasione speciale. Itinerario, orari e soste si decidono insieme allo skipper.",
    durata: 'Mezza giornata, giornata o tramonto',
    orari: 'mezza giornata, giornata intera o tramonto',
    ore: '',
    prezzoAdulti: String(da('tour-privato').barca),
    prezzoBambini: null,
    prezzoGommone: true,
    postiMax: posti('tour-privato'),
    fatti: ['Imbarco a Palau o La Maddalena', 'Itinerario su misura'],
    foto: {
      copertina: 'Una famiglia a bordo, tuffo dalla prua',
      galleria: [
        'Un gruppo di amici a bordo',
        'Tuffo dalla prua',
        'Il gommone in una cala solo per voi',
        'Aperitivo a bordo',
        'Bambini con maschera e boccaglio',
      ],
    },
    mappa: false,
    numeri: [],
    programma: [
      { tipo: 'imbarco', titolo: 'Ritrovo dove preferite', luogo: 'Palau o La Maddalena', testo: "Orario da concordare." },
      { tipo: 'sosta', n: '1', titolo: 'Le soste che scegliete voi', luogo: 'Su misura', testo: "Il giro delle 7 isole o solo le cale più tranquille: lo skipper vi propone l'itinerario in base al vento del giorno. Per la Corsica c'è l'escursione dedicata, anche quella solo per voi." },
      { tipo: 'rientro', titolo: 'Rientro', testo: 'Quando volete, entro la durata concordata.' },
    ],
    incluso: ['Il gommone e lo skipper solo per il vostro gruppo', 'Ticket del Parco'],
    inclusoMancante: 'Da confermare',
    nonIncluso: ['Carburante: a consumo, si paga a bordo a fine uscita'],
    nonInclusoMancante: 'Altro da segnalare',
    note: [],
  },
];

export const trovaEscursione = (slug) => escursioni.find((e) => e.slug === slug);
