// Le escursioni. Ogni voce genera la sua pagina in /escursioni/<slug>/
// con lo stesso modello della pagina "Tour delle 7 isole".
// I valori vuoti ('') diventano segnaposto rosa sul sito.
//
// formule: 'posto' = si prenota il singolo posto, 'esclusiva' = il gommone solo per il gruppo.
// prezzoAdulti / prezzoBambini = prezzo del posto singolo (null se l'escursione è solo in esclusiva).
// prezzoEsclusiva = prezzo del gommone in esclusiva ('su richiesta' se si preventiva caso per caso).
// Quali gommoni fanno l'escursione a posto singolo si decide in gommoni.js.

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
    orari: '', // es. '9:00 – 17:30'
    ore: '', // es. '8'
    oraRientro: '', // es. '17:30'
    formule: ['posto', 'esclusiva'],
    prezzoAdulti: '',
    prezzoBambini: '',
    prezzoEsclusiva: '',
    postiMin: 6,
    postiMax: 12,
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
    incluso: ['Skipper per tutta la giornata'],
    inclusoMancante: 'Da confermare: carburante, ticket del Parco, maschere, acqua a bordo',
    nonIncluso: ['Pranzo a La Maddalena'],
    nonInclusoMancante: 'Altro da segnalare',
    note: [],
  },
  {
    slug: 'mezza-giornata',
    titolo: 'Mezza giornata',
    titoloPagina: 'Mezza giornata in maxi gommone',
    etichette: ['Mezza giornata', 'Due rotte'],
    breve: "Qualche ora tra le cale dell'arcipelago, su una delle due rotte scelte dallo skipper.",
    intro:
      "Per chi ha poco tempo ma non vuole rinunciare al mare dell'arcipelago: qualche ora di bagni e cale, su una delle due rotte della mezza giornata.",
    durata: 'Mezza giornata',
    orari: '', // es. 'mattina 9:30 – 13:00 · pomeriggio 14:30 – 18:00'
    ore: '',
    formule: ['posto', 'esclusiva'],
    prezzoAdulti: '',
    prezzoBambini: '',
    prezzoEsclusiva: '',
    postiMin: 6,
    postiMax: 12,
    fatti: ['Imbarco a Palau o La Maddalena'],
    foto: {
      copertina: 'Il gommone in una cala vicina, acqua turchese',
      galleria: [
        'Il gommone in una cala vicina',
        'Tuffo in una cala di Santo Stefano o Caprera',
        'Ospiti a prua',
        'Maschera e boccaglio sugli scogli',
        'Il gommone in navigazione',
      ],
    },
    mappa: false,
    // Mappa delle due rotte: finché non c'è il file, compare un segnaposto.
    mappaRotte: 'Mappa delle due rotte della mezza giornata, gialla e rossa',
    numeri: [{ etichetta: 'Rotte', valore: '2' }],
    programma: [
      { tipo: 'imbarco', titolo: 'Ritrovo a Palau o a La Maddalena', testo: '', mancante: 'Orari delle uscite: mattina e/o pomeriggio' },
      { tipo: 'sosta', n: '1', titolo: 'Rotta gialla', luogo: 'Prima rotta', testo: '', mancante: 'Le soste della rotta gialla' },
      { tipo: 'sosta', n: '2', titolo: 'Rotta rossa', luogo: 'Seconda rotta', testo: '', mancante: 'Le soste della rotta rossa' },
      { tipo: 'rientro', titolo: 'Rientro', testo: 'Si scende dove si è saliti.' },
    ],
    notaProgramma: 'Lo skipper sceglie la rotta in base a vento e mare del giorno.',
    incluso: ['Skipper'],
    inclusoMancante: 'Da confermare: carburante, ticket del Parco, maschere, acqua a bordo',
    nonIncluso: [],
    nonInclusoMancante: 'Altro da segnalare',
    note: [],
  },
  {
    slug: 'aperitivo-tramonto',
    titolo: 'Aperitivo al tramonto',
    titoloPagina: 'Aperitivo al tramonto in maxi gommone',
    etichette: ['Tramonto', 'Aperitivo a bordo'],
    breve: "L'uscita della sera: il sole che scende sul mare dell'arcipelago e un aperitivo a bordo.",
    intro:
      "L'arcipelago con la luce più bella: si esce nel tardo pomeriggio e si guarda il sole scendere sul mare con un aperitivo a bordo.",
    durata: '',
    orari: '',
    ore: '',
    formule: ['posto', 'esclusiva'],
    prezzoAdulti: '',
    prezzoBambini: '',
    prezzoEsclusiva: '',
    postiMin: 6,
    postiMax: 12,
    fatti: ['Imbarco a Palau o La Maddalena', 'Aperitivo a bordo'],
    foto: {
      copertina: 'Il gommone controluce al tramonto',
      galleria: [
        'Il gommone al tramonto tra le isole',
        "L'aperitivo a bordo",
        'Il cielo arancione sul mare',
        'Ospiti a prua con la luce della sera',
        'Il rientro con le luci del porto',
      ],
    },
    mappa: false,
    numeri: [],
    programma: [
      { tipo: 'imbarco', titolo: 'Ritrovo a Palau o a La Maddalena', testo: '', mancante: 'Orario di partenza (cambia con la stagione?)' },
      { tipo: 'sosta', n: '1', titolo: 'Giro tra le isole', luogo: 'Prima del tramonto', testo: '', mancante: 'Dove andate, c\'è un bagno?' },
      { tipo: 'vista', titolo: 'Il tramonto dal mare', luogo: 'Aperitivo a bordo', testo: '', mancante: 'Dove vi fermate a guardare il tramonto' },
      { tipo: 'rientro', titolo: 'Rientro', testo: 'Si scende dove si è saliti.' },
    ],
    incluso: ['Skipper', 'Aperitivo a bordo'],
    inclusoMancante: "Cosa c'è nell'aperitivo: bevande, stuzzichini, analcolici per i bambini?",
    nonIncluso: [],
    nonInclusoMancante: 'Altro da segnalare',
    note: [],
  },
  {
    slug: 'corsica-lavezzi-bonifacio',
    titolo: 'Corsica: Lavezzi e Bonifacio',
    titoloPagina: 'Corsica in maxi gommone: Lavezzi e Bonifacio',
    etichette: ['Solo in esclusiva', 'Bocche di Bonifacio', "Documento per l'espatrio"],
    breve: 'Si attraversano le Bocche di Bonifacio fino alle isole Lavezzi e alle bianche falesie di Bonifacio.',
    intro:
      'Si attraversano le Bocche di Bonifacio per raggiungere la Corsica: le acque trasparenti delle isole Lavezzi e le falesie bianche su cui è costruita Bonifacio.',
    durata: '',
    orari: '',
    ore: '',
    formule: ['esclusiva'],
    prezzoAdulti: null,
    prezzoBambini: null,
    prezzoEsclusiva: '',
    fatti: ['Imbarco a Palau o La Maddalena', "Serve un documento valido per l'espatrio"],
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
      { tipo: 'imbarco', titolo: 'Ritrovo a Palau', testo: 'Primo imbarco al porto di Palau.', moloDi: 'palau' },
      { tipo: 'sosta', n: '1', titolo: 'Porto di La Maddalena', luogo: 'Secondo imbarco', testo: "Sale a bordo chi dorme sull'isola." },
      { tipo: 'sosta', n: '2', titolo: 'Traversata delle Bocche di Bonifacio', luogo: 'Verso la Corsica', testo: '', mancante: 'Durata della traversata e cosa si vede' },
      { tipo: 'sosta', n: '3', titolo: 'Isole Lavezzi', luogo: 'Bagno', testo: '', mancante: 'Dove si fa il bagno e quanto dura la sosta' },
      { tipo: 'sosta', n: '4', titolo: 'Bonifacio', luogo: 'Falesie e porto', testo: '', mancante: 'Giro sotto le falesie, sosta in paese, pranzo' },
      { tipo: 'rientro', titolo: 'Rientro a La Maddalena e Palau', testo: 'Si scende dove si è saliti.' },
    ],
    incluso: ['Skipper per tutta la giornata'],
    inclusoMancante: 'Da confermare',
    nonIncluso: [],
    nonInclusoMancante: 'Pranzo? Tasse di sbarco?',
    note: [
      "Si entra in Francia: ognuno deve avere con sé carta d'identità valida per l'espatrio o passaporto, anche i bambini.",
      'La traversata dipende dal mare nelle Bocche: con vento forte l\'uscita può essere spostata.',
    ],
  },
  {
    slug: 'tour-privato',
    titolo: 'Tour privato in esclusiva',
    titoloPagina: 'Tour privato in maxi gommone',
    etichette: ['Solo il vostro gruppo', 'Su misura'],
    breve: 'Uno dei tre gommoni solo per voi, famiglie, amici o aziende, con itinerario e orari da concordare.',
    intro:
      "Un gommone solo per il vostro gruppo: famiglie, amici, aziende o un'occasione speciale. Fino a 12 persone, oppure il gommone privato per gruppi fino a 6. Itinerario, orari e soste si decidono insieme allo skipper.",
    durata: 'Da concordare',
    orari: 'da concordare',
    ore: '',
    formule: ['esclusiva'],
    prezzoAdulti: null,
    prezzoBambini: null,
    prezzoEsclusiva: 'su richiesta',
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
      { tipo: 'sosta', n: '1', titolo: 'Le soste che scegliete voi', luogo: 'Su misura', testo: "Il giro delle 7 isole, la mezza giornata, il tramonto, la Corsica o solo le cale più tranquille: lo skipper vi propone l'itinerario in base al vento del giorno." },
      { tipo: 'rientro', titolo: 'Rientro', testo: 'Quando volete, entro la durata concordata.' },
    ],
    incluso: ['Il gommone e lo skipper solo per il vostro gruppo'],
    inclusoMancante: 'Da confermare',
    nonIncluso: [],
    nonInclusoMancante: 'Altro da segnalare',
    note: [],
  },
];

export const trovaEscursione = (slug) => escursioni.find((e) => e.slug === slug);
export const soloEsclusiva = (e) => !e.formule.includes('posto');
