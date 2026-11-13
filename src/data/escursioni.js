// Le cinque escursioni. Ogni voce genera la sua pagina in /escursioni/<slug>/
// con lo stesso modello della pagina "Tour delle 7 isole".
// I valori vuoti ('') diventano segnaposto rosa sul sito.

import { prezzoDa, offerte, gommoniPer, imbarchiPer, postiPer } from './prenotazioni.js';

// Prezzi "da" e posti arrivano da src/data/prenotazioni.js (listino unico per sito e prenotazioni).
const da = (slug) => prezzoDa(slug) ?? {};
// "Palau, La Maddalena o Cannigione": da dove parte un'escursione.
const daDove = (slug) => { const n = imbarchiPer(slug).map((i) => i.nome); return n.length > 1 ? `${n.slice(0, -1).join(', ')} o ${n.at(-1)}` : n[0]; };
const posti = (slug) => String(Math.max(...gommoniPer(slug).map((g) => postiPer(offerte[slug], g))));
// '05-01', '05-31' → 'Maggio'; '07-01', '08-31' → 'Luglio e agosto'.
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const nomeMesi = (dal, al) => {
  const [m1, m2] = [Number(dal.slice(0, 2)), Number(al.slice(0, 2))];
  const t = m1 === m2 ? MESI[m1 - 1] : `${MESI[m1 - 1]} e ${MESI[m2 - 1]}`;
  return t[0].toUpperCase() + t.slice(1);
};
// Partenza e rientro della Corsica, dall'orario del listino (es. '9:30 – 17:30').
const [partenzaCorsica, rientroCorsica] = offerte['corsica-lavezzi-bonifacio'].turni[0].orario.split('–').map((x) => x.trim());

export const escursioni = [
  {
    slug: 'tour-7-isole',
    titolo: 'Tour delle 7 isole',
    titoloPagina: 'Tour delle 7 isole in maxi gommone',
    inEvidenza: true,
    etichette: ['Giornata intera', '7 isole', 'Pranzo libero a La Maddalena'],
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
      copertina: "Spargi dall'alto, con il gommone all'ancora",
      galleria: [
        "Porto della Madonna dall'alto, il gommone tra le tre isole",
        'La Spiaggia Rosa dal gommone',
        'Ospiti in acqua a Caprera',
        'Il centro di La Maddalena a pranzo',
        'Spargi, sabbia e graniti',
      ],
    },
    mappa: true,
    numeri: [
      { etichetta: 'Isole', valore: '7' },
    ],
    programma: [
      { tipo: 'imbarco', titolo: 'Partenza da La Maddalena', testo: 'Si parte dal porto di La Maddalena.', moloDi: 'maddalena' },
      { tipo: 'imbarco', titolo: 'Passaggio a Palau', luogo: 'Per chi si imbarca a Palau', testo: 'Il gommone passa a prendere chi parte da Palau, poi rotta verso Santo Stefano.', moloDi: 'palau' },
      // Solo le isole, senza i nomi delle cale: dove fermarsi lo decide lo skipper col meteo (Remo, 13 novembre 2026).
      { tipo: 'percorso', titolo: 'Le cale le sceglie lo skipper', testo: 'Il giro tocca sette isole. In quale cala fermarsi lo decide lo skipper la mattina stessa, in base al vento e al mare del giorno.' },
      { tipo: 'sosta', n: '1', titolo: 'Santo Stefano', luogo: 'Bagno', testo: "A pochi minuti da La Maddalena: il primo tuffo della giornata, nella cala più riparata del momento." },
      { tipo: 'sosta', n: '2', titolo: 'Caprera', luogo: 'Bagno', testo: "L'isola di Garibaldi: graniti chiari, macchia mediterranea e acqua trasparente." },
      { tipo: 'sosta', n: '3', titolo: 'La Maddalena', luogo: 'Pranzo libero', testo: "Tempo libero nel centro storico. Se vuoi, lo skipper ti accompagna in un ristorante tipico convenzionato, per un pranzo sardo a prezzo agevolato. Oppure porta il pranzo al sacco." },
      { tipo: 'sosta', n: '4', titolo: 'Spargi', luogo: 'Bagno', testo: 'Sabbia bianca tra graniti modellati da vento e mare. Si arriva solo dal mare.' },
      { tipo: 'vista', titolo: 'Budelli e la Spiaggia Rosa', luogo: 'Senza sosta', testo: 'Passaggio lento davanti alla spiaggia. Per proteggerla il Parco vieta sbarco e bagno: la si ammira dal mare.' },
      { tipo: 'sosta', n: '5', titolo: 'Razzoli e Santa Maria', luogo: 'Porto della Madonna · bagno', testo: "Lo specchio d'acqua chiuso tra Budelli, Razzoli e Santa Maria, riparato dalle correnti: l'effetto è quello di una piscina naturale. L'ultimo tuffo prima di rientrare." },
      { tipo: 'rientro', titolo: 'Rientro a La Maddalena e Palau', testo: 'Si scende dove si è saliti.' },
    ],
    incluso: ['Skipper per tutta la giornata', 'Carburante', 'Ticket del Parco'],
    inclusoMancante: null,
    nonIncluso: ['Pranzo: libero a La Maddalena, anche in un ristorante convenzionato a prezzo agevolato, oppure al sacco', 'Altro cibo e bevande a bordo', 'Maschere e boccagli: per igiene portali tu (a bordo ne teniamo qualcuno)'],
    nonInclusoMancante: null,
    note: [],
    // Ristoranti convenzionati a La Maddalena, senza nomi (Remo, 13 novembre 2026): la sezione mostra le foto dei piatti.
    pranzo: {
      titolo: 'Il pranzo a La Maddalena',
      testo: "A metà giornata ci fermiamo a La Maddalena. Se vuoi, lo skipper ti accompagna in uno dei ristoranti tipici con cui abbiamo una convenzione: cucina sarda, a prezzo agevolato per chi è in gita con noi. Se preferisci, puoi portare il pranzo al sacco o girare il centro per conto tuo.",
      foto: [
        'Un piatto di pesce del ristorante convenzionato',
        'Un primo della cucina sarda',
        'Un antipasto di terra sardo',
        'La tavola apparecchiata nel centro di La Maddalena',
      ],
    },
  },
  {
    slug: 'mezza-giornata',
    titolo: 'Mezza giornata',
    titoloPagina: 'Mezza giornata in maxi gommone',
    etichette: ['Mattina o pomeriggio', 'Caprera o isole del nord'],
    breve: 'Quattro ore su uno dei due giri: Caprera, oppure Spargi, la Spiaggia Rosa e Porto della Madonna. Lo skipper sceglie in base al vento.',
    intro:
      "Per chi ha poco tempo ma non vuole rinunciare al mare dell'arcipelago: quattro ore, al mattino o al pomeriggio, su uno dei due giri. Caprera, oppure le isole del nord.",
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
        'Tuffo a Cala Garibaldi',
        'Spargi dal mare',
        'La Spiaggia Rosa dal gommone',
        'Porto della Madonna, acqua turchese',
      ],
    },
    mappa: 'mezza',
    numeri: [],
    programma: [
      { tipo: 'imbarco', titolo: `Partenza da ${daDove('mezza-giornata')}`, testo: "Mattina 9:30–13:30 o pomeriggio 14:00–18:00. Si parte da La Maddalena; a Palau il gommone passa a prendere chi si imbarca lì. Da Cannigione parte l'Honda 9.50." },
      // Due giri distinti, mai insieme: in mezza giornata non c'è tempo (Remo, 13 novembre 2026). Sceglie lo skipper col meteo.
      { tipo: 'percorso', titolo: 'Un giro su due, scelto col vento', testo: "In quattro ore non si fanno Caprera e le isole del nord insieme: si starebbe sempre in navigazione. Lo skipper sceglie uno dei due giri la mattina stessa, in base al vento e al mare." },
      { tipo: 'percorso', titolo: 'Giro 1 · Caprera', testo: "Tutta la mezza giornata intorno a Caprera, l'isola di Garibaldi." },
      { tipo: 'sosta', n: '1', titolo: 'Cala Garibaldi / Cala Serena', luogo: 'Caprera · bagno', testo: "Di solito ci fermiamo a Cala Garibaldi; se il vento non è quello giusto, a Cala Serena." },
      { tipo: 'sosta', n: '2', titolo: 'Cala Coticcio', luogo: 'Caprera · bagno', testo: "La chiamano Tahiti: acqua trasparente tra le rocce di granito." },
      { tipo: 'percorso', titolo: 'Giro 2 · Isole del nord', testo: "Spargi, Budelli e Porto della Madonna, poi rientro diretto: per stare nei tempi, niente sosta a Santo Stefano." },
      { tipo: 'sosta', n: '1', titolo: 'Spargi', luogo: 'Bagno', testo: "Sabbia bianca e acqua turchese, raggiungibili solo dal mare." },
      { tipo: 'vista', titolo: 'Budelli e la Spiaggia Rosa', luogo: 'Senza sosta', testo: 'Passaggio lento davanti alla spiaggia. Per proteggerla il Parco vieta sbarco e bagno: la si ammira dal mare.' },
      { tipo: 'sosta', n: '2', titolo: 'Porto della Madonna', luogo: 'Razzoli e Santa Maria · bagno', testo: "Lo specchio d'acqua tra Budelli, Razzoli e Santa Maria, riparato dalle correnti: una piscina naturale." },
      { tipo: 'rientro', titolo: 'Rientro diretto', testo: 'Si scende dove si è saliti.' },
    ],
    incluso: ['Skipper', 'Carburante', 'Ticket del Parco'],
    inclusoMancante: null,
    nonIncluso: ['Cibo e bevande', 'Maschere e boccagli: per igiene portali tu (a bordo ne teniamo qualcuno)'],
    nonInclusoMancante: null,
    note: [],
  },
  {
    // Sunset, aperitivo al tramonto: dati di Remo dell'11 e del 13 novembre 2026.
    slug: 'tramonto',
    titolo: 'Sunset, aperitivo al tramonto',
    nomeBreve: 'Sunset', // negli elenchi con altre escursioni
    titoloPagina: 'Sunset: aperitivo al tramonto in maxi gommone',
    etichette: ['Aperitivo a bordo', `Massimo ${posti('tramonto')} persone`],
    breve: "L'aperitivo in gommone al tramonto: prosecco, un tagliere e una sosta in acqua calma a Santo Stefano.",
    intro:
      "Il Sunset è un aperitivo in gommone: si brinda con il prosecco, si assaggia qualcosa e ci si ferma in acqua bassa e riparata mentre il sole scende sulle isole.",
    durata: 'Due ore e mezza',
    orari: 'verso il tramonto, orario indicativo',
    ore: '2,5',
    durataTesto: '2 ore e mezza',
    prezzoAdulti: String(da('tramonto').adulto),
    prezzoBambini: String(da('tramonto').bambino),
    postiMax: posti('tramonto'),
    fatti: [`Imbarco a ${daDove('tramonto')}`, 'Aperitivo a bordo'],
    foto: {
      copertina: 'Il gommone controluce al tramonto',
      galleria: [
        'Il brindisi con il prosecco a bordo',
        'Il tagliere di salumi e formaggi e gli spiedini di frutta',
        'Il cielo arancione sul mare',
        'Il gommone fermo in una baia, con la luce della sera',
        'Il rientro in porto con le prime luci',
      ],
    },
    mappa: false,
    // Orari del mese, dal listino (src/data/prenotazioni.js): sono indicativi.
    numeri: offerte.tramonto.turni[0].orari.map((o) => ({ etichetta: `Orario ${nomeMesi(o.dal, o.al).toLowerCase()}`, valore: o.orario.replace(' – ', '–') })),
    programma: [
      { tipo: 'imbarco', titolo: `Partenza da ${daDove('tramonto')}`, testo: "Ti consigliamo La Maddalena: al rientro è già buio e la strada più corta rende il ritorno più breve e sicuro. A Palau il gommone passa a prendere chi si imbarca lì; da Cannigione parte l'Honda 9.50." },
      { tipo: 'percorso', titolo: 'La sosta, scelta in base al vento', testo: "Nelle uscite di gruppo la sosta la sceglie il comandante, quasi sempre in base al vento: niente trasferimenti lunghi, niente mare mosso né spruzzi." },
      { tipo: 'sosta', n: '1', titolo: 'Il Pesce / Cala Villamarina', luogo: 'Santo Stefano · aperitivo', testo: "Di solito ci fermiamo al Pesce, a Santo Stefano, proprio di fronte al pontile dei gommoni: tre minuti di navigazione, spiaggia, acqua bassa e riparo dal vento. In alternativa, Cala Villamarina." },
      { tipo: 'rientro', titolo: 'Rientro con le luci della sera', testo: 'Si scende dove si è saliti.' },
    ],
    incluso: [
      'Skipper',
      'Carburante',
      'Ticket del Parco',
      'Da bere, dal frigo di bordo: prosecco, birra, Coca-Cola e acqua',
      'Da mangiare: tagliere di salumi e formaggi (o solo formaggi) con spiedini di frutta fresca',
    ],
    inclusoMancante: null,
    nonIncluso: ['Cena', 'Maschere e boccagli: per igiene portali tu (a bordo ne teniamo qualcuno)'],
    nonInclusoMancante: null,
    note: [
      'Gli orari sono indicativi: seguono la luce del tramonto, che cambia da un mese all\'altro.',
      `Al Sunset di gruppo siete al massimo ${posti('tramonto')} persone. Con il tour privato il gommone è solo vostro: potete allungare fino a Spargi o Budelli, o chiedere il tramonto a Porto della Madonna o a Caprera, se il meteo lo permette (carburante a parte).`,
    ],
  },
  {
    slug: 'tour-privato',
    titolo: 'Tour privato in esclusiva',
    titoloPagina: 'Tour privato in maxi gommone',
    etichette: ['Esclusiva', 'Su misura'],
    breve: 'Il gommone solo per voi, famiglie, amici o aziende, con itinerario e orari da concordare.',
    intro:
      "Il maxi gommone solo per il vostro gruppo: famiglie, amici, aziende o un'occasione speciale. Itinerario, orari e soste si decidono insieme allo skipper.",
    durata: 'Mezza giornata, giornata o Sunset',
    orari: 'da concordare',
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
    titoloPagina: 'Corsica in maxi gommone: isola Piana, Lavezzi e Cavallo',
    etichette: ['Esclusiva', 'Giornata intera'],
    breve: "Gommone in esclusiva, giornata intera con visita all'isola Piana, Lavezzi e isola di Cavallo.",
    intro:
      "Una giornata intera con il gommone solo per il vostro gruppo: si attraversa il mare verso la Corsica per scoprire l'isola Piana, le acque trasparenti delle isole Lavezzi e l'isola di Cavallo.",
    durata: 'Giornata intera',
    orari: offerte['corsica-lavezzi-bonifacio'].turni[0].orario,
    ore: '8',
    prezzoAdulti: String(da('corsica-lavezzi-bonifacio').barca),
    prezzoBambini: null,
    prezzoGommone: true,
    postiMax: posti('corsica-lavezzi-bonifacio'),
    fatti: ['Gommone in esclusiva', `Imbarco a ${daDove('corsica-lavezzi-bonifacio')}`, "Serve un documento valido per l'espatrio"],
    foto: {
      copertina: 'Le isole Lavezzi viste dal mare, con il gommone all\'ancora',
      galleria: [
        "L'isola Piana dal gommone",
        'Le isole Lavezzi, acqua e granito',
        'Ospiti in acqua alle Lavezzi',
        "L'isola di Cavallo dal mare",
        'La traversata verso la Corsica',
      ],
    },
    mappa: false,
    numeri: [],
    programma: [
      { tipo: 'imbarco', ora: partenzaCorsica, titolo: 'Partenza da La Maddalena', luogo: 'O passaggio a Palau', testo: 'Si parte da La Maddalena; se preferite, il gommone passa a prendervi a Palau.' },
      // Testi delle soste scritti da Claude su richiesta di Remo (13 novembre 2026): solo cose note dei luoghi, niente tempi di sosta.
      { tipo: 'sosta', n: '1', titolo: 'Isola Piana', luogo: 'Bocche di Bonifacio · bagno', testo: "Il primo assaggio di Corsica, appena attraversate le Bocche: un isolotto basso con acqua bassa e trasparente, dove fermarsi per il primo bagno." },
      { tipo: 'sosta', n: '2', titolo: 'Isole Lavezzi', luogo: 'Riserva naturale · bagno', testo: "Il cuore della riserva naturale delle Bocche di Bonifacio: graniti levigati dal vento, calette e acqua turchese. Lo skipper sceglie la cala più riparata del giorno." },
      { tipo: 'sosta', n: '3', titolo: 'Isola di Cavallo', luogo: 'Dal mare · bagno', testo: "Accanto alle Lavezzi, tra ville nascoste nella macchia e piccoli approdi: la si costeggia e ci si ferma per un ultimo tuffo prima della traversata di ritorno." },
      { tipo: 'rientro', ora: rientroCorsica, titolo: 'Rientro', testo: 'Si scende dove si è saliti.' },
    ],
    incluso: ['Il gommone e lo skipper solo per il vostro gruppo', 'Bevande a bordo', 'Ticket del Parco', 'Eventuali tasse di sbarco'],
    inclusoMancante: null,
    nonIncluso: ['Carburante: a consumo, si paga a bordo a fine uscita', 'Pranzo: libero, ti suggeriamo dove mangiare oppure porta il pranzo al sacco', 'Maschere e boccagli: per igiene portali tu (a bordo ne teniamo qualcuno)'],
    nonInclusoMancante: null,
    note: [
      "Si entra in Francia: ognuno deve avere con sé carta d'identità valida per l'espatrio o passaporto, anche i bambini.",
      'La traversata dipende dal mare: con vento forte l\'uscita può essere spostata.',
    ],
  },
];

export const trovaEscursione = (slug) => escursioni.find((e) => e.slug === slug);
