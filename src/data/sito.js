// Dati generali del sito.
// I valori vuoti ('') vengono mostrati sul sito come segnaposto rosa, es. [+39 numero].
// Basta compilarli qui e si aggiornano in tutte le pagine.

export const sito = {
  nome: 'Escursioni Maddalena',

  // Indirizzo definitivo del sito (serve per i link canonici).
  // Da cambiare quando si collega il dominio.
  url: 'https://escursioni-maddalena.pages.dev',

  // Finché è true, Google non indicizza il sito (ci sono ancora segnaposto).
  // Mettere false solo quando tutti i dati sono stati inseriti.
  inCostruzione: true,

  contatti: {
    // Solo cifre, con prefisso internazionale e senza "+": es. '393331234567'
    whatsapp: '',
    // Come va mostrato a video: es. '+39 333 123 4567'
    telefonoVisibile: '',
    email: '',
    orariRisposta: '', // es. 'tutti i giorni dalle 8 alle 21'
  },

  azienda: {
    ragioneSociale: '',
    partitaIva: '',
    indirizzo: '',
  },

  recensioniGoogle: '', // link alla scheda Google con le recensioni

  imbarchi: {
    palau: {
      nome: 'Palau',
      molo: '', // es. 'Porto turistico, banchina ...'
      ritrovo: '', // es. '9:00'
      parcheggio: '',
      mappa: '', // link Google Maps del punto di ritrovo
    },
    maddalena: {
      nome: 'La Maddalena',
      molo: '',
      ritrovo: '',
      mappa: '',
    },
  },

  gommone: {
    modello: '',
    lunghezza: '', // metri
    motori: '', // cv
    passeggeri: '', // numero massimo
    dotazioni: '', // es. 'tendalino, scaletta bagno, doccetta'
    descrizione: '',
  },

  skipper: {
    nome: '',
    descrizione: '', // anni di mare, lingue parlate
  },

  regole: {
    maltempo: '', // rimborso o cambio data
    ticketParco: '', // incluso o da pagare
    pagamento: '', // a bordo, contanti o carta?
    bambini: '', // età minima, giubbotti, prezzo ridotto
    animali: '',
  },
};

// Le recensioni vanno copiate da Google o TripAdvisor: solo recensioni vere.
export const recensioni = [
  // { testo: '...', autore: 'Nome, città', data: 'agosto 2026' },
];
