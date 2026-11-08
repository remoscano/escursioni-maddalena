// I tre gommoni. Ogni voce genera la sua pagina in /gommoni/<slug>/.
// I valori vuoti ('') diventano segnaposto rosa sul sito.
//
// formule: 'posto' = si vende il singolo posto (gruppo misto)
//          'esclusiva' = il gommone solo per un gruppo
// escursioni: le uscite che il gommone fa a posto singolo (slug di escursioni.js).
// In esclusiva tutti e tre i gommoni possono fare tutte le proposte, Corsica compresa.

export const gommoni = [
  {
    slug: 'gommone-7-isole',
    nome: '', // nome o modello da mostrare, es. 'Joker Boat Clubman 30'
    nomeProvvisorio: 'Il gommone del Tour delle 7 isole',
    ruolo: 'Dedicato al Tour delle 7 isole, la giornata intera nell\'arcipelago.',
    postiMin: 6,
    postiMax: 12,
    formule: ['posto', 'esclusiva'],
    escursioni: ['tour-7-isole', 'aperitivo-tramonto'],
    notaEsclusiva: '',
    modello: '',
    lunghezza: '', // metri
    motori: '', // cv
    dotazioni: '', // es. 'tendalino, scaletta bagno, doccetta'
    descrizione: '',
    skipper: { nome: '', descrizione: '' },
    foto: {
      copertina: 'Il gommone del Tour delle 7 isole in navigazione',
      galleria: ['Il gommone di profilo, all\'ancora', 'Lo skipper al timone', 'Ospiti a prua', 'La scaletta per il bagno'],
    },
  },
  {
    slug: 'gommone-mezze-giornate',
    nome: '',
    nomeProvvisorio: 'Il gommone delle mezze giornate',
    ruolo: 'Dedicato alla mezza giornata intorno a Caprera e all\'aperitivo al tramonto. Parte da La Maddalena.',
    postiMin: 6,
    postiMax: 12,
    formule: ['posto', 'esclusiva'],
    escursioni: ['mezza-giornata', 'aperitivo-tramonto'],
    notaEsclusiva: 'In esclusiva può fare anche la giornata intera.',
    modello: '',
    lunghezza: '',
    motori: '',
    dotazioni: '',
    descrizione: '',
    skipper: { nome: '', descrizione: '' },
    foto: {
      copertina: 'Il gommone delle mezze giornate in una cala',
      galleria: ['Il gommone di profilo, all\'ancora', 'Lo skipper al timone', 'Tuffo dalla prua', 'Il gommone al tramonto'],
    },
  },
  {
    slug: 'gommone-privato',
    nome: '',
    nomeProvvisorio: 'Il gommone privato',
    ruolo: 'Solo in esclusiva, per gruppi fino a 6 persone.',
    postiMin: null,
    postiMax: 6,
    formule: ['esclusiva'],
    escursioni: [],
    notaEsclusiva: '',
    modello: '',
    lunghezza: '',
    motori: '',
    dotazioni: '',
    descrizione: '',
    skipper: { nome: '', descrizione: '' },
    foto: {
      copertina: 'Il gommone privato con una famiglia a bordo',
      galleria: ['Il gommone di profilo, all\'ancora', 'Lo skipper al timone', 'Una coppia a prua', 'Il gommone in una cala solo per voi'],
    },
  },
];

export const etichetteFormule = { posto: 'Posto singolo', esclusiva: 'In esclusiva' };
// Persone a bordo, es. 'Da 6 a 12 persone' o 'Fino a 6 persone'
export const personeGommone = (g) => (g.postiMin ? `Da ${g.postiMin} a ${g.postiMax} persone` : `Fino a ${g.postiMax} persone`);
// Capienza massima in esclusiva, tra tutti i gommoni
export const postiMaxEsclusiva = () => Math.max(...gommoni.map((g) => g.postiMax));
export const nomeGommone = (g) => g.nome || g.nomeProvvisorio;
export const trovaGommone = (slug) => gommoni.find((g) => g.slug === slug);
// Gommoni che fanno un'escursione a posto singolo
export const gommoniPer = (slugEscursione) => gommoni.filter((g) => g.escursioni.includes(slugEscursione));
