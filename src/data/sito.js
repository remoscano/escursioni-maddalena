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
    whatsapp: '393315055736',
    // Come va mostrato a video: es. '+39 333 123 4567'
    telefonoVisibile: '+39 331 505 5736',
    email: 'maddalena.escursioni@gmail.com',
    orariRisposta: 'tutti i giorni dalle 7:30 alle 22:30, dal 1° maggio al 31 ottobre',
  },

  // Dati obbligatori per legge sul sito e nelle condizioni (Codice del consumo art. 49, D.Lgs. 70/2003 art. 7).
  azienda: {
    ragioneSociale: '',
    partitaIva: '',
    indirizzo: '', // sede: via, numero, CAP, comune
    rea: '', // numero di iscrizione al Registro delle imprese / REA (es. 'SS-123456')
  },

  recensioniGoogle: '', // link alla scheda Google con le recensioni

  imbarchi: {
    palau: {
      nome: 'Palau',
      molo: '', // es. 'Porto turistico, banchina ...'
      ritrovo: '9:15', // uscite del mattino; in generale 15 minuti prima della partenza (regole.anticipoRitrovo)
      parcheggio: '',
      mappa: '', // link Google Maps del punto di ritrovo
    },
    // Cannigione: molo del quarto gommone (Honda 9.50): mezze giornate, tramonto ed esclusive.
    cannigione: {
      nome: 'Cannigione',
      molo: 'Pontile La Sciumara, Via Lungomare A. Doria 7, 07021 Cannigione (SS)',
      ritrovo: '9:15',
      mappa: 'https://share.google/pqI5W7O5CTVevSFsE',
    },
    maddalena: {
      nome: 'La Maddalena',
      molo: 'Il Porticciolo, Via Padule, 07024 La Maddalena', // molo principale, dove i gommoni passano la notte
      ritrovo: '9:15',
      mappa: 'https://maps.app.goo.gl/ipWyZCHfEdG4hvKQA',
    },
  },

  // I gommoni (Remo, 8 novembre 2026). "id" collega ogni gommone a quello del sistema di prenotazione
  // (src/data/prenotazioni.js), da cui arrivano i posti.
  flotta: [
    { id: 'gruppo-1', modello: 'Joker Clubman 28', motori: '2 motori Suzuki da 200 cv', dotazioni: 'bagno, T-top', descrizione: '' },
    { id: 'gruppo-2', modello: 'BWA 30', motori: '2 motori Mercury da 250 cv', dotazioni: 'bagno, cabina, T-top', descrizione: '' },
    { id: 'esclusiva', modello: 'Joker 35', motori: '2 motori Suzuki da 300 cv', dotazioni: 'cabina, bagno', descrizione: '' },
    { id: 'cannigione', modello: 'Honda 9.50', motori: '1 motore Honda da 350 cv', dotazioni: '', descrizione: '' },
  ],
  gommone: {
    // Scritta da Claude su richiesta di Remo (11 novembre 2026), solo con i dati della flotta già confermati.
    descrizione: "Gommoni grandi e stabili, con lo skipper sempre a bordo: arrivi nelle cale più belle senza fatica e ti godi il mare in sicurezza. Bagno a bordo sui gommoni che partono da La Maddalena, T-top per l'ombra su quelli di gruppo e al massimo 12 persone: lo spazio giusto per famiglie con bambini e gruppi di amici.", // due righe di presentazione della flotta
  },

  skipper: {
    nome: '',
    descrizione: '', // anni di mare, lingue parlate
  },

  regole: {
    maltempo: "Se mare o vento non sono sicuri annulliamo noi e scegli tu: rimborso completo o un'altra data.", // rimborso o cambio data
    ticketParco: 'Sì, è incluso nel prezzo di tutte le escursioni.',
    pagamento: 'Online al momento della prenotazione, con carta o PayPal. Nei tour in esclusiva il carburante è a parte.', // a bordo, contanti o carta?
    bambini: "Sì, a qualsiasi età. Fino a 10 anni pagano il ridotto, anche i più piccoli: nessuno viaggia gratis. A bordo i giubbotti di salvataggio sono obbligatori, ma sono in taglia da adulto: se vuoi stare più tranquillo, porta un giubbotto della misura giusta per i tuoi bambini.", // età minima, giubbotti, prezzo ridotto
    animali: 'No, gli animali non sono ammessi a bordo.',
  },
};

// Le recensioni vanno copiate da Google o TripAdvisor: solo recensioni vere.
export const recensioni = [
  // { testo: '...', autore: 'Nome, città', data: 'agosto 2026' },
];
