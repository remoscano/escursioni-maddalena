// Le cinque escursioni. Ogni voce genera la sua pagina in /escursioni/<slug>/
// con lo stesso modello della pagina "Tour delle 7 isole".
// I valori vuoti ('') diventano segnaposto rosa sul sito.

import { prezzoDa, offerte, gommoniPer, imbarchiPer } from './prenotazioni.js';

// Prezzi "da" e posti arrivano da src/data/prenotazioni.js (listino unico per sito e prenotazioni).
const da = (slug) => prezzoDa(slug) ?? {};
// "Palau, La Maddalena o Cannigione": da dove parte un'escursione.
const daDove = (slug) => { const n = imbarchiPer(slug).map((i) => i.nome); return n.length > 1 ? `${n.slice(0, -1).join(', ')} o ${n.at(-1)}` : n[0]; };
const posti = (slug) => String(Math.max(...gommoniPer(slug).map((g) => g.posti)));
// Partenza e rientro della Corsica, dall'orario del listino (es. '9:30 – 17:30').
const [partenzaCorsica, rientroCorsica] = offerte['corsica-lavezzi-bonifacio'].turni[0].orario.split('–').map((x) => x.trim());

export const escursioni = [
  {
    slug: 'tour-7-isole',
    titolo: 'Tour delle 7 isole',
    titoloPagina: 'Tour delle 7 isole in maxi gommone',
    inEvidenza: true,
    etichette: ['Giornata intera', '6 soste', 'Pranzo libero a La Maddalena'],
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
    fatti: [`Imbarco a ${daDove('tour-7-isole')}`, 'Pranzo libero a La Maddalena', 'Spiaggia Rosa dal mare'],
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
      { etichetta: 'Soste', valore: '6 + 1 dal mare' },
    ],
    programma: [
      { tipo: 'imbarco', titolo: 'Partenza da La Maddalena', testo: 'Si parte dal porto di La Maddalena.', moloDi: 'maddalena' },
      { tipo: 'imbarco', titolo: 'Passaggio a Palau', luogo: 'Per chi si imbarca a Palau', testo: 'Il gommone passa a prendere chi parte da Palau, poi rotta verso Santo Stefano.', moloDi: 'palau' },
      { tipo: 'sosta', n: '1', titolo: 'Cala Villa Marina', luogo: 'Santo Stefano · bagno', testo: 'Una cala riparata dal maestrale sulla costa sud di Santo Stefano: il primo tuffo della giornata.' },
      { tipo: 'sosta', n: '2', titolo: 'Cala Garibaldi', luogo: 'Caprera · bagno', testo: "Sabbia dorata, rocce chiare e macchia mediterranea sulla costa nord-ovest di Caprera, l'isola di Garibaldi." },
      { tipo: 'sosta', n: '3', titolo: 'Pranzo a La Maddalena', luogo: 'Pranzo libero', testo: 'Tempo libero nel centro storico: ti suggeriamo noi dove mangiare, oppure porta il pranzo al sacco.' },
      { tipo: 'sosta', n: '4', titolo: 'Cala Corsara', luogo: 'Spargi · bagno', testo: 'Quattro spiaggette di sabbia bianca finissima tra graniti modellati da vento e mare. Si arriva solo dal mare.' },
      { tipo: 'vista', titolo: 'Spiaggia Rosa', luogo: 'Budelli · senza sosta', testo: 'Passaggio lento davanti alla spiaggia. Per proteggerla il Parco vieta sbarco e bagno: la si ammira dal mare.' },
      { tipo: 'sosta', n: '5', titolo: 'Manto della Madonna', luogo: 'Porto della Madonna · bagno', testo: "Lo specchio d'acqua chiuso tra Budelli, Razzoli e Santa Maria, riparato dalle correnti: l'effetto è quello di una piscina naturale." },
      { tipo: 'sosta', n: '6', titolo: 'Lagunetta della Madonna', luogo: 'Ultimo bagno', testo: "Acqua bassa e calma, a due passi dal Porto della Madonna: l'ultimo tuffo della giornata, prima di rientrare." },
      { tipo: 'rientro', titolo: 'Rientro a La Maddalena e Palau', testo: 'Si scende dove si è saliti.' },
    ],
    incluso: ['Skipper per tutta la giornata', 'Carburante', 'Ticket del Parco'],
    inclusoMancante: null,
    nonIncluso: ['Pranzo: libero, ti suggeriamo dove mangiare a La Maddalena oppure porta il pranzo al sacco', 'Cibo e bevande', 'Maschere e boccagli: per igiene portali tu (a bordo ne teniamo qualcuno)'],
    nonInclusoMancante: null,
    note: [],
  },
  {
    slug: 'mezza-giornata',
    titolo: 'Mezza giornata',
    titoloPagina: 'Mezza giornata in maxi gommone',
    etichette: ['Mattina o pomeriggio', '3 soste'],
    breve: 'Quattro ore tra le cale più belle: il giro di Caprera, oppure Spargi e La Maddalena quando soffia il maestrale.',
    intro:
      "Per chi ha poco tempo ma non vuole rinunciare al mare dell'arcipelago: quattro ore, al mattino o al pomeriggio, con tre soste.",
    durata: 'Mezza giornata',
    orari: offerte['mezza-giornata'].turni.map((t) => t.orario.replace(' – ', '–')).join(' · '),
    ore: '4',
    prezzoAdulti: String(da('mezza-giornata').adulto),
    prezzoBambini: String(da('mezza-giornata').bambino),
    postiMax: posti('mezza-giornata'),
    fatti: [`Imbarco a ${daDove('mezza-giornata')}`, 'Mattina o pomeriggio'],
    foto: {
      copertina: "Cala Coticcio, il gommone all'ancora nell'acqua trasparente",
      galleria: [
        'Il gommone lungo la costa di Caprera',
        'Tuffo a Cala Napoletana',
        'I Giardinelli dal mare',
        'Cala Corsara a Spargi',
        'Il porto di Cala Gavetta',
      ],
    },
    mappa: 'mezza',
    numeri: [],
    programma: [
      { tipo: 'imbarco', titolo: `Partenza da ${daDove('mezza-giornata')}`, testo: "Mattina 9:30–13:30 o pomeriggio 14:00–18:00. Si parte da La Maddalena; a Palau il gommone passa a prendere chi si imbarca lì. Da Cannigione parte l'Honda 9.50, con lo stesso giro." },
      // Due percorsi dalla mappa del cliente (11 novembre 2026).
      { tipo: 'percorso', titolo: 'Il giro di Caprera', testo: "Il giro completo di Caprera, tra calette selvagge, acqua cristallina e graniti modellati dal vento." },
      { tipo: 'sosta', n: '1', titolo: 'Cala Coticcio', luogo: 'Caprera · bagno', testo: "La chiamano Tahiti: acqua trasparente tra le rocce di granito." },
      { tipo: 'sosta', n: '2', titolo: 'Cala Napoletana', luogo: 'Caprera · bagno', testo: "Una caletta sul lato nord di Caprera." },
      { tipo: 'sosta', n: '3', titolo: 'I Giardinelli', luogo: 'Tra La Maddalena e Caprera · bagno', testo: "L'ultimo tuffo prima del rientro." },
      { tipo: 'percorso', titolo: 'Con il maestrale: Spargi e La Maddalena', testo: "Quando il maestrale supera i 15 nodi si va sul lato riparato dell'arcipelago." },
      { tipo: 'sosta', n: '1', titolo: 'Cala Corsara', luogo: 'Spargi · bagno', testo: "Le acque turchesi di Spargi." },
      { tipo: 'sosta', n: '2', titolo: 'Cala Gavetta', luogo: 'La Maddalena · passeggiata', testo: "Breve sosta nel porto di La Maddalena, per due passi nella vivace Cala Gavetta." },
      { tipo: 'sosta', n: '3', titolo: 'I Giardinelli', luogo: 'Bagno', testo: "L'ultimo tuffo prima del rientro." },
      { tipo: 'rientro', titolo: 'Rientro', testo: 'Si scende dove si è saliti.' },
    ],
    incluso: ['Skipper', 'Carburante', 'Ticket del Parco'],
    inclusoMancante: null,
    nonIncluso: ['Cibo e bevande', 'Maschere e boccagli: per igiene portali tu (a bordo ne teniamo qualcuno)'],
    nonInclusoMancante: null,
    note: [],
  },
  {
    slug: 'tramonto',
    titolo: 'Tramonto con aperitivo',
    titoloPagina: 'Tramonto in maxi gommone con aperitivo',
    etichette: ['Sera', 'Aperitivo a bordo'],
    breve: "Due ore e mezza in mare con il sole che scende sulle isole, e l'aperitivo a bordo.",
    intro:
      "L'arcipelago con la luce più bella: si esce verso sera, si guarda il sole scendere dal mare e si brinda con l'aperitivo a bordo.",
    durata: 'Due ore e mezza',
    orari: offerte.tramonto.turni[0].orario.replace(' – ', '–'),
    ore: '2,5',
    durataTesto: '2 ore e mezza',
    prezzoAdulti: String(da('tramonto').adulto),
    prezzoBambini: String(da('tramonto').bambino),
    postiMax: posti('tramonto'),
    fatti: [`Imbarco a ${daDove('tramonto')}`, 'Aperitivo a bordo'],
    foto: {
      copertina: 'Il gommone controluce al tramonto',
      galleria: [
        'Il gommone al tramonto tra le isole',
        "L'aperitivo a bordo",
        'Il cielo arancione sul mare',
        'Ospiti a prua con la luce della sera',
        'Il rientro in porto con le prime luci',
      ],
    },
    mappa: false,
    numeri: [],
    programma: [
      { tipo: 'imbarco', titolo: `Partenza da ${daDove('tramonto')}`, testo: "Alle 18:00. Si parte da La Maddalena; a Palau il gommone passa a prendere chi si imbarca lì. Da Cannigione parte l'Honda 9.50." },
      { tipo: 'vista', titolo: 'Il tramonto dal mare', luogo: 'Con aperitivo a bordo', testo: '', mancante: 'Percorso del tramonto e dove vi fermate a guardarlo' },
      { tipo: 'rientro', titolo: 'Rientro alle 20:30', testo: 'Si scende dove si è saliti.' },
    ],
    incluso: ['Skipper', 'Carburante', 'Ticket del Parco', 'Aperitivo a bordo'],
    inclusoMancante: null,
    nonIncluso: ['Cena', 'Maschere e boccagli: per igiene portali tu (a bordo ne teniamo qualcuno)'],
    nonInclusoMancante: null,
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
    durataTesto: 'Da 2 ore e mezza a 8 ore',
    prezzoAdulti: String(da('tour-privato').barca),
    prezzoBambini: null,
    prezzoGommone: true,
    postiMax: posti('tour-privato'),
    fatti: [`Imbarco a ${daDove('tour-privato')}`, 'Itinerario su misura'],
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
      { tipo: 'imbarco', titolo: 'Partenza da La Maddalena', luogo: 'O passaggio a Palau, oppure da Cannigione', testo: "Orario da concordare." },
      { tipo: 'sosta', n: '1', titolo: 'Le soste che scegliete voi', luogo: 'Su misura', testo: "Il giro delle 7 isole o solo le cale più tranquille: lo skipper vi propone l'itinerario in base al vento del giorno. Per la Corsica c'è l'escursione dedicata, anche quella solo per voi." },
      { tipo: 'rientro', titolo: 'Rientro', testo: 'Quando volete, entro la durata concordata.' },
    ],
    incluso: ['Il gommone e lo skipper solo per il vostro gruppo', 'Bevande a bordo', 'Ticket del Parco'],
    inclusoMancante: null,
    nonIncluso: ['Carburante: a consumo, si paga a bordo a fine uscita', 'Cibo', 'Maschere e boccagli: per igiene portali tu (a bordo ne teniamo qualcuno)'],
    nonInclusoMancante: null,
    note: [],
  },
  {
    slug: 'corsica-lavezzi-bonifacio',
    titolo: 'Corsica',
    titoloPagina: 'Corsica in maxi gommone: Lavezzi e Bonifacio',
    etichette: ['Solo il vostro gruppo', 'Bocche di Bonifacio', "Documento per l'espatrio"],
    breve: "Gommone in esclusiva, giornata intera con visita all'isola Piana, Lavezzi e isola di Cavallo.",
    intro:
      "Una giornata intera con il gommone solo per il vostro gruppo: si attraversano le Bocche di Bonifacio per raggiungere la Corsica, le acque trasparenti delle isole Lavezzi, l'isola di Cavallo e le falesie bianche su cui è costruita Bonifacio.",
    durata: 'Giornata intera',
    orari: offerte['corsica-lavezzi-bonifacio'].turni[0].orario,
    ore: '8',
    prezzoAdulti: String(da('corsica-lavezzi-bonifacio').barca),
    prezzoBambini: null,
    prezzoGommone: true,
    postiMax: posti('corsica-lavezzi-bonifacio'),
    fatti: ['Gommone in esclusiva', `Imbarco a ${daDove('corsica-lavezzi-bonifacio')}`, "Serve un documento valido per l'espatrio"],
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
      { tipo: 'imbarco', ora: partenzaCorsica, titolo: 'Partenza da La Maddalena', luogo: 'O passaggio a Palau', testo: 'Si parte da La Maddalena; se preferite, il gommone passa a prendervi a Palau.' },
      { tipo: 'sosta', n: '1', titolo: 'Traversata delle Bocche di Bonifacio', luogo: 'Verso la Corsica', testo: '', mancante: 'Durata della traversata e cosa si vede' },
      { tipo: 'sosta', n: '2', titolo: 'Isole Lavezzi', luogo: 'Bagno', testo: '', mancante: 'Dove si fa il bagno e quanto dura la sosta' },
      { tipo: 'sosta', n: '3', titolo: 'Isola di Cavallo', luogo: 'Corsica', testo: '', mancante: 'Cosa si fa a Cavallo: bagno, giro intorno all\'isola' },
      { tipo: 'sosta', n: '4', titolo: 'Bonifacio', luogo: 'Falesie e porto', testo: '', mancante: 'Giro sotto le falesie, sosta in paese, pranzo' },
      { tipo: 'rientro', ora: rientroCorsica, titolo: 'Rientro', testo: 'Si scende dove si è saliti.' },
    ],
    incluso: ['Il gommone e lo skipper solo per il vostro gruppo', 'Bevande a bordo', 'Ticket del Parco', 'Eventuali tasse di sbarco'],
    inclusoMancante: null,
    nonIncluso: ['Carburante: a consumo, si paga a bordo a fine uscita', 'Pranzo: libero, ti suggeriamo dove mangiare oppure porta il pranzo al sacco', 'Maschere e boccagli: per igiene portali tu (a bordo ne teniamo qualcuno)'],
    nonInclusoMancante: null,
    note: [
      "Si entra in Francia: ognuno deve avere con sé carta d'identità valida per l'espatrio o passaporto, anche i bambini.",
      'La traversata dipende dal mare nelle Bocche: con vento forte l\'uscita può essere spostata.',
    ],
  },
];

export const trovaEscursione = (slug) => escursioni.find((e) => e.slug === slug);
