// Le cinque escursioni. Ogni voce genera la sua pagina in /escursioni/<slug>/
// con lo stesso modello della pagina "Tour delle 7 isole".
// I valori vuoti ('') diventano segnaposto rosa sul sito.

import { prezzoDa, offerte, gommoniPer, imbarchiPer, postiPer } from './prenotazioni.js';
import { sito } from './sito.js';

const pranzo7 = sito.pranzo7; // testo unico del pranzo del Tour delle 7 isole

// Prezzi "da" e posti arrivano da src/data/prenotazioni.js (listino unico per sito e prenotazioni).
const da = (slug) => prezzoDa(slug) ?? {};
// "Palau, La Maddalena o Cannigione": da dove parte un'escursione.
const daDove = (slug) => { const n = imbarchiPer(slug).map((i) => i.nome); return n.length > 1 ? `${n.slice(0, -1).join(', ')} o ${n.at(-1)}` : n[0]; };
const posti = (slug) => String(Math.max(...gommoniPer(slug).map((g) => postiPer(offerte[slug], g))));
// Orari dal listino: '9:00 – 13:00' → ['9:00', '13:00']; per Palau e Cannigione valgono gli orariImbarco del turno.
const ore = (o) => String(o).split('–').map((x) => x.trim());
const breveOrario = (o) => String(o).replace(' – ', '–');
const turno7 = offerte['tour-7-isole'].turni[0];
const [mattina, pomeriggio] = offerte['mezza-giornata'].turni;
// Partenza e rientro della Corsica, dall'orario del listino (es. '9:30 – 17:30').
const [partenzaCorsica, rientroCorsica] = offerte['corsica'].turni[0].orario.split('–').map((x) => x.trim());

export const escursioni = [
  {
    slug: 'tour-7-isole',
    titolo: 'Tour delle 7 isole',
    titoloPagina: 'Tour delle 7 isole in maxi gommone',
    inEvidenza: true,
    etichette: ['Giornata intera', '7 isole', pranzo7.breve],
    breve:
      'La Maddalena, Santo Stefano, Caprera, Spargi, Budelli, Razzoli e Santa Maria in una giornata, con la Spiaggia Rosa vista dal mare.',
    intro:
      'Una giornata intera tra La Maddalena, Santo Stefano, Caprera, Spargi, Budelli, Razzoli e Santa Maria, con la Spiaggia Rosa vista dal mare.',
    durata: 'Giornata intera',
    orari: `${breveOrario(turno7.orario)} (da Palau ${breveOrario(turno7.orariImbarco.palau)})`,
    durataTesto: '7 ore', // Remo, 16 novembre 2026: '7 ore', senza distinguere i porti
    partenze: `${ore(turno7.orario)[0]}, a Palau alle ${ore(turno7.orariImbarco.palau)[0]}`,
    oraRientro: `alle ${ore(turno7.orariImbarco.palau)[1]} a Palau e alle ${ore(turno7.orario)[1]} a La Maddalena`,
    prezzoAdulti: String(da('tour-7-isole').adulto),
    prezzoBambini: String(da('tour-7-isole').bambino),
    postiMax: posti('tour-7-isole'),
    fatti: [`Imbarco a ${daDove('tour-7-isole')}`, pranzo7.breve, 'Spiaggia Rosa dal mare'],
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
    // I tre riquadri: 7 isole, 7 soste, 7 ore (Remo, 16 novembre 2026).
    numeri: [
      { etichetta: 'Isole', valore: '7' },
      { etichetta: 'Soste', valore: '7' },
      { etichetta: 'Ore', valore: '7' },
    ],
    soloNumeri: true,
    programma: [
      { tipo: 'imbarco', ora: ore(turno7.orario)[0], titolo: 'Partenza da La Maddalena', testo: `Si parte alle ${ore(turno7.orario)[0]} dal porto di La Maddalena.`, moloDi: 'maddalena' },
      { tipo: 'imbarco', ora: ore(turno7.orariImbarco.palau)[0], titolo: 'Passaggio a Palau', luogo: 'Per chi si imbarca a Palau', testo: `Alle ${ore(turno7.orariImbarco.palau)[0]} il gommone passa a prendere chi parte da Palau, poi rotta verso Santo Stefano. Alla prima sosta si aprono le bibite.`, moloDi: 'palau' },
      // Sette tappe, una per isola (Remo, 16 novembre 2026). Al mattino Santo Stefano e Caprera: dove fare il bagno lo sceglie
      // lo skipper col meteo. Entro le 12:30 a La Maddalena per il pranzo, si riparte alle 14:00. Niente nomi di cale.
      { tipo: 'percorso', titolo: 'Sette isole, sette tappe', testo: 'Il giro tocca sette isole. Dove fermarsi e dove fare il bagno lo decide lo skipper, in base al vento e al mare del giorno.' },
      { tipo: 'sosta', n: '1', titolo: 'Santo Stefano', luogo: 'Mattina', testo: "A pochi minuti da La Maddalena: il primo tuffo della giornata, nella cala più riparata del momento." },
      { tipo: 'sosta', n: '2', titolo: 'Caprera', luogo: 'Mattina', testo: "L'isola di Garibaldi: graniti chiari, macchia mediterranea e acqua trasparente." },
      { tipo: 'sosta', n: '3', ora: pranzo7.arrivo, titolo: 'La Maddalena', luogo: 'Pranzo libero', testo: pranzo7.testo },
      { tipo: 'sosta', n: '4', ora: pranzo7.ripartenza, titolo: 'Spargi', luogo: 'Bagno', testo: "Sabbia bianca e acqua turchese, raggiungibili solo dal mare, tra rocce di granito modellate dal vento che sembrano sculture: il cane bulldog, la testa della strega, l'Italia in miniatura e la testa del leone." },
      { tipo: 'sosta', n: '5', rosa: true, titolo: 'Budelli e la Spiaggia Rosa', luogo: 'Sosta panoramica dal gommone', testo: "Ci fermiamo davanti alla spiaggia per ammirarne i colori e l'azzurro del fondale, che si trova solo qui. Da anni la Spiaggia Rosa è chiusa per proteggerla: il Parco vieta sbarco e bagno, e la si guarda dal mare." },
      { tipo: 'sosta', n: '6', titolo: 'Razzoli', luogo: 'Porto della Madonna · bagno', testo: "Lo specchio d'acqua tra Razzoli, Budelli e Santa Maria, riparato dalle correnti: una piscina naturale." },
      { tipo: 'sosta', n: '7', titolo: 'Santa Maria e la Lagunetta', luogo: 'Bagno · mirto e dolcetti', testo: "Uno dei pochi posti dove un gommone di queste dimensioni riesce ad arrivare: fondale basso, turchese e limpido, dove si cammina liberamente nell'acqua. Qui il nostro skipper serve il mirto con i dolcetti tipici." },
      { tipo: 'rientro', titolo: 'Fine del tour', testo: `Rientro dove sei salito: alle ${ore(turno7.orariImbarco.palau)[1]} a Palau, alle ${ore(turno7.orario)[1]} a La Maddalena.` },
    ],
    // Bevande, mirto e dolcetti solo nel Tour delle 7 isole; niente tagliere nelle uscite di gruppo (Remo, 13 novembre 2026).
    incluso: [
      'Skipper per tutta la giornata',
      'Carburante',
      'Ticket del Parco',
      'Due bibite in lattina a testa: acqua naturale o gassata, Coca-Cola, aranciata, tè al limone o alla pesca, birra',
      'Acqua in bottigliette da mezzo litro',
      'Mirto e dolcetti tipici alla Lagunetta di Santa Maria',
    ],
    inclusoMancante: null,
    nonIncluso: [pranzo7.nonIncluso, 'Altro cibo a bordo', 'Maschere e boccagli: per igiene portali tu (a bordo ne teniamo qualcuno)'],
    nonInclusoMancante: null,
    note: [],
    // Ristoranti convenzionati a La Maddalena, senza nomi (Remo, 13 novembre 2026): la sezione mostra le foto dei piatti.
    pranzo: {
      titolo: 'Il pranzo a La Maddalena',
      testo: pranzo7.testo,
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
    breve: 'Tre ore e mezza su uno dei due giri: Caprera, oppure Spargi, la Spiaggia Rosa e Porto della Madonna. Lo skipper sceglie in base al vento.',
    intro:
      "Per chi ha poco tempo ma non vuole rinunciare al mare dell'arcipelago: tre ore e mezza, al mattino o al pomeriggio, su uno dei due giri. Caprera, oppure le isole del nord.",
    durata: 'Mezza giornata',
    orari: `${breveOrario(mattina.orario)} · ${breveOrario(pomeriggio.orario)}`,
    ore: '3 e mezza', // Remo, 16 novembre 2026
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
      { tipo: 'imbarco', titolo: `Partenza da ${daDove('mezza-giornata')}`, testo: `Da La Maddalena mattina ${breveOrario(mattina.orario)} o pomeriggio ${breveOrario(pomeriggio.orario)}. A Palau il gommone passa mezz'ora dopo e ti riporta lì mezz'ora prima: ${breveOrario(mattina.orariImbarco.palau)} o ${breveOrario(pomeriggio.orariImbarco.palau)}. Da Cannigione parte l'Honda 9.50: ${breveOrario(mattina.orariImbarco.cannigione)} o ${breveOrario(pomeriggio.orariImbarco.cannigione)}.` },
      // Due giri distinti, mai insieme: in mezza giornata non c'è tempo (Remo, 13 novembre 2026). Sceglie lo skipper col meteo.
      { tipo: 'percorso', titolo: 'Un giro su due, scelto col vento', testo: "In tre ore e mezza non si fanno Caprera e le isole del nord insieme: si starebbe sempre in navigazione. Lo skipper sceglie uno dei due giri la mattina stessa, in base al vento e al mare." },
      { tipo: 'percorso', titolo: 'Giro 1 · Caprera', testo: "Tutta la mezza giornata intorno a Caprera, l'isola di Garibaldi." },
      { tipo: 'sosta', n: '1', titolo: 'Cala Garibaldi / Cala Serena', luogo: 'Caprera · bagno', testo: "Di solito ci fermiamo a Cala Garibaldi; se il vento non è quello giusto, a Cala Serena." },
      { tipo: 'sosta', n: '2', titolo: 'Cala Coticcio', luogo: 'Caprera · bagno', testo: "La chiamano Tahiti: acqua trasparente tra le rocce di granito." },
      { tipo: 'percorso', titolo: 'Giro 2 · Isole del nord', testo: "Spargi, Budelli e Porto della Madonna, poi rientro diretto: per stare nei tempi, niente sosta a Santo Stefano." },
      { tipo: 'sosta', n: '1', titolo: 'Spargi', luogo: 'Bagno', testo: "Sabbia bianca e acqua turchese, raggiungibili solo dal mare." },
      { tipo: 'vista', titolo: 'Budelli e la Spiaggia Rosa', luogo: 'Senza sosta', testo: 'Passaggio lento davanti alla spiaggia. Per proteggerla il Parco vieta sbarco e bagno: la si ammira dal mare.' },
      { tipo: 'sosta', n: '2', titolo: 'Porto della Madonna', luogo: 'Razzoli e Santa Maria · bagno', testo: "Lo specchio d'acqua tra Budelli, Razzoli e Santa Maria, riparato dalle correnti: una piscina naturale." },
      { tipo: 'rientro', titolo: 'Rientro diretto', testo: 'Si scende dove si è saliti.' },
    ],
    // Nella mezza giornata solo acqua e bibite (Remo, 13 novembre 2026).
    incluso: ['Skipper', 'Carburante', 'Ticket del Parco', 'Acqua e bibite in lattina'],
    inclusoMancante: null,
    nonIncluso: ['Cibo', 'Maschere e boccagli: per igiene portali tu (a bordo ne teniamo qualcuno)'],
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
    orari: 'partenza tra le 18:30 e le 19:00',
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
        'Il tagliere con salsiccia e formaggio e gli spiedini di frutta',
        'Il cielo arancione sul mare',
        'Il gommone fermo in una baia, con la luce della sera',
        'Il rientro in porto con le prime luci',
      ],
    },
    mappa: false,
    // Partenza sempre tra le 18:30 e le 19:00 (Remo, 13 novembre 2026).
    numeri: [{ etichetta: 'Partenza', valore: '18:30–19:00' }],
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
      'Da bere, dal frigo di bordo: prosecco per il brindisi (una bottiglia ogni 6 persone), birra, Coca-Cola e acqua',
      'Da mangiare: tagliere con salsiccia e formaggio, oppure spiedini di frutta o taralli e ciliege',
    ],
    inclusoMancante: null,
    nonIncluso: ['Cena', 'Altre bottiglie di prosecco, se le chiedete: si pagano a parte', 'Maschere e boccagli: per igiene portali tu (a bordo ne teniamo qualcuno)'],
    nonInclusoMancante: null,
    note: [
      "Si parte tra le 18:30 e le 19:00, dopo aver preparato il gommone: l'orario esatto te lo confermiamo con un messaggio.",
      `Al Sunset di gruppo siete al massimo ${posti('tramonto')} persone. Con il tour privato il gommone è in esclusiva: potete allungare fino a Spargi o Budelli, o chiedere il tramonto a Porto della Madonna o a Caprera, se il meteo lo permette (carburante a parte).`,
    ],
  },
  {
    slug: 'tour-privato',
    titolo: 'Tour privato in esclusiva',
    titoloPagina: 'Tour privato in maxi gommone',
    etichette: ['Esclusiva', 'Su misura'],
    breve: 'Il gommone in esclusiva per famiglie, amici o aziende, con l\'itinerario su misura.',
    intro:
      "Il maxi gommone in esclusiva per il tuo gruppo: famiglie, amici, aziende o un'occasione speciale. Itinerario e soste si decidono insieme allo skipper.",
    durata: 'Mezza giornata, giornata intera o Sunset',
    orari: 'da concordare', // niente orari ripetuti in testata: sono nel programma
    ore: '',
    durataTesto: 'Da 2 ore e mezza a 7 ore',
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
        'Il gommone in esclusiva in una cala tranquilla',
        'Aperitivo a bordo',
        'Bambini con maschera e boccaglio',
      ],
    },
    mappa: false,
    numeri: [],
    programma: [
      // In esclusiva si sale da un solo porto (Remo, 16 novembre 2026).
      { tipo: 'imbarco', titolo: 'Partenza da La Maddalena, Palau o Cannigione', luogo: 'Scegli tu da dove partire', testo: `Giornata intera ${breveOrario(offerte['tour-privato'].turni.find((t) => t.id === 'giornata').orario)} da La Maddalena, ${breveOrario(offerte['tour-privato'].turni.find((t) => t.id === 'giornata').orariImbarco.palau)} da Palau. Mezza giornata ${breveOrario(mattina.orario)} o ${breveOrario(pomeriggio.orario)} da La Maddalena, ${breveOrario(mattina.orariImbarco.palau)} o ${breveOrario(pomeriggio.orariImbarco.palau)} da Palau. Sunset tra le 18:30 e le 19:00. Da Cannigione parte l'Honda 9.50 con i suoi orari.` },
      { tipo: 'sosta', n: '1', titolo: 'Le soste che scegliete voi', luogo: 'Su misura', testo: "Il giro delle 7 isole o solo le cale più tranquille: lo skipper vi propone l'itinerario in base al vento del giorno. Per la Corsica c'è l'escursione dedicata, anche quella in esclusiva." },
      { tipo: 'rientro', titolo: 'Rientro', testo: 'Quando volete, entro la durata concordata.' },
    ],
    // Prosecco e tagliere in tutte le esclusive (Remo, 13 novembre 2026).
    incluso: ['Il gommone in esclusiva, con lo skipper', 'Bevande a bordo', 'Prosecco per il brindisi: una bottiglia ogni 6 persone', 'Tagliere con salsiccia e formaggio, oppure spiedini di frutta o taralli e ciliege', 'Ticket del Parco'],
    inclusoMancante: null,
    nonIncluso: ['Carburante: a consumo, si paga a bordo a fine uscita', 'Pranzo, nella giornata intera: al sacco oppure al ristorante, scegli tu', 'Altre bottiglie di prosecco, se le chiedete: si pagano a parte', 'Maschere e boccagli: per igiene portali tu (a bordo ne teniamo qualcuno)'],
    nonInclusoMancante: null,
    note: [sito.notaOrariEsclusiva],
  },
  {
    slug: 'corsica',
    titolo: 'Corsica',
    titoloPagina: 'Corsica in maxi gommone: isola Piana, Lavezzi e Cavallo',
    etichette: ['Esclusiva', 'Giornata intera'],
    breve: "Gommone in esclusiva, giornata intera con visita all'isola Piana, Lavezzi e isola di Cavallo.",
    intro:
      "Una giornata intera con il gommone in esclusiva: si attraversa il mare verso la Corsica per scoprire l'isola Piana, le acque trasparenti delle isole Lavezzi e l'isola di Cavallo.",
    durata: 'Giornata intera',
    orari: `${breveOrario(offerte['corsica'].turni[0].orario)} (da Palau ${breveOrario(offerte['corsica'].turni[0].orariImbarco.palau)})`,
    ore: '7',
    prezzoAdulti: String(da('corsica').barca),
    prezzoBambini: null,
    prezzoGommone: true,
    postiMax: posti('corsica'),
    fatti: ['Gommone in esclusiva', `Imbarco a ${daDove('corsica')}`, "Serve un documento valido per l'espatrio"],
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
      { tipo: 'imbarco', ora: partenzaCorsica, titolo: 'Partenza da La Maddalena o da Palau', luogo: 'Scegli tu da dove partire', testo: `Alle ${partenzaCorsica} da La Maddalena, oppure alle ${ore(offerte['corsica'].turni[0].orariImbarco.palau)[0]} da Palau.` },
      // Testi delle soste scritti da Claude su richiesta di Remo (13 novembre 2026): solo cose note dei luoghi, niente tempi di sosta.
      { tipo: 'sosta', n: '1', titolo: 'Isola Piana', luogo: 'Bocche di Bonifacio · bagno', testo: "Il primo assaggio di Corsica, appena attraversate le Bocche: un isolotto basso con acqua bassa e trasparente, dove fermarsi per il primo bagno." },
      { tipo: 'sosta', n: '2', titolo: 'Isole Lavezzi', luogo: 'Riserva naturale · bagno', testo: "Il cuore della riserva naturale delle Bocche di Bonifacio: graniti levigati dal vento, calette e acqua turchese. Lo skipper sceglie la cala più riparata del giorno." },
      { tipo: 'sosta', n: '3', titolo: 'Isola di Cavallo', luogo: 'Dal mare · bagno', testo: "Accanto alle Lavezzi, tra ville nascoste nella macchia e piccoli approdi: la si costeggia e ci si ferma per un ultimo tuffo prima della traversata di ritorno." },
      { tipo: 'rientro', titolo: 'Rientro', testo: `Si scende dove si è saliti: alle ${rientroCorsica} a La Maddalena, alle ${ore(offerte['corsica'].turni[0].orariImbarco.palau)[1]} a Palau.` },
    ],
    incluso: ['Il gommone in esclusiva, con lo skipper', 'Bevande a bordo', 'Prosecco per il brindisi: una bottiglia ogni 6 persone', 'Tagliere con salsiccia e formaggio, oppure spiedini di frutta o taralli e ciliege', 'Ticket del Parco', 'Eventuali tasse di sbarco'],
    inclusoMancante: null,
    nonIncluso: ['Carburante: a consumo, si paga a bordo a fine uscita', 'Pranzo: al sacco oppure al ristorante, scegli tu', 'Altre bottiglie di prosecco, se le chiedete: si pagano a parte', 'Maschere e boccagli: per igiene portali tu (a bordo ne teniamo qualcuno)'],
    nonInclusoMancante: null,
    note: [
      "Si entra in Francia: ognuno deve avere con sé carta d'identità valida per l'espatrio o passaporto, anche i bambini.",
      sito.notaOrariEsclusiva,
      'La traversata dipende dal mare: con vento forte l\'uscita può essere spostata.',
    ],
  },
];

export const trovaEscursione = (slug) => escursioni.find((e) => e.slug === slug);
