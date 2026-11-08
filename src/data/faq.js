// Domande frequenti. "risposta" può contenere un segnaposto: se "mancante" è valorizzato,
// sul sito compare un segnaposto rosa al posto del dato ancora da inserire.
// "regola" collega la risposta a un campo di sito.regole: quando lo compili, il segnaposto sparisce.

export const faq = [
  {
    gruppo: 'Prenotazione e pagamento',
    domande: [
      {
        id: 'prenotare',
        domanda: 'Come si prenota?',
        risposta:
          "Con il modulo di richiesta: scegli escursione, posto singolo o esclusiva, data, persone e punto d'imbarco, e si apre WhatsApp con il messaggio già scritto. Ti rispondiamo con la disponibilità, l'orario di ritrovo e il molo.",
      },
      {
        id: 'pagare',
        domanda: 'Come si paga?',
        risposta: 'Nessun pagamento online.',
        regola: 'pagamento',
        mancante: 'Pagamento: a bordo, in contanti o con carta? Serve un acconto?',
      },
      {
        id: 'esclusiva',
        domanda: 'Possiamo avere il gommone solo per noi?',
        risposta:
          "Sì. Tutti e tre i gommoni si possono prenotare in esclusiva, per qualunque proposta, Corsica compresa: fino a 12 persone, o fino a 6 con il gommone privato. Nel modulo di richiesta scegli \"In esclusiva\".",
      },
      {
        id: 'minimo',
        domanda: 'Quante persone servono perché l\'uscita parta?',
        risposta: 'A posto singolo le uscite partono con almeno 6 persone, al massimo 12.',
        regola: 'minimoPersone',
        mancante: 'Cosa succede se non si arriva a 6: altra data, rimborso?',
      },
      {
        id: 'imbarco',
        domanda: 'Da dove si parte?',
        risposta:
          "Da La Maddalena. Se dormi in Gallura, su richiesta ti passiamo a prendere a Palau o a Cannigione: lì il ritrovo è un po' prima della partenza e l'orario esatto te lo scriviamo quando prenoti.",
      },
      {
        id: 'anticipo',
        domanda: 'Con quanto anticipo conviene scrivere?',
        risposta: '',
        mancante: 'Es. in luglio e agosto almeno qualche giorno prima',
      },
    ],
  },
  {
    gruppo: 'Meteo e cancellazioni',
    domande: [
      {
        id: 'maestrale',
        domanda: "E se c'è maestrale?",
        risposta:
          "L'itinerario si adatta al vento, scegliendo le cale più riparate. Se il mare non lo permette, l'uscita si sposta e ti avvisiamo su WhatsApp.",
        regola: 'maltempo',
        mancante: 'La vostra regola: rimborso o cambio data',
      },
    ],
  },
  {
    gruppo: 'A bordo',
    domande: [
      {
        id: 'pranzo',
        domanda: 'Il pranzo è incluso nel Tour delle 7 isole?',
        risposta: 'No. A La Maddalena c\'è tempo libero per pranzare dove preferisci, a carico dei partecipanti.',
      },
      {
        id: 'bambini',
        domanda: 'Possono venire i bambini?',
        risposta: '',
        regola: 'bambini',
        mancante: 'Età minima, giubbotti per bambini, prezzo ridotto',
      },
      {
        id: 'animali',
        domanda: 'Posso portare il cane?',
        risposta: '',
        regola: 'animali',
        mancante: 'La vostra regola sugli animali a bordo',
      },
      {
        id: 'portare',
        domanda: 'Cosa devo portare?',
        risposta:
          'Costume, telo e un cambio, crema solare, cappello e occhiali, acqua da bere e contanti o carta per il pranzo.',
      },
    ],
  },
  {
    gruppo: 'Parco Nazionale',
    domande: [
      {
        id: 'spiaggia-rosa',
        domanda: 'Si può fare il bagno alla Spiaggia Rosa?',
        risposta:
          'No. Per proteggerla il Parco vieta sbarco e bagno: la ammiriamo dal mare, poco prima della sosta a Porto della Madonna.',
      },
      {
        id: 'ticket',
        domanda: 'Il ticket del Parco è incluso?',
        risposta: '',
        regola: 'ticketParco',
        mancante: 'Incluso o da pagare? Quanto costa?',
      },
    ],
  },
];

export const tutteLeDomande = faq.flatMap((g) => g.domande);
export const domande = (ids) => ids.map((id) => tutteLeDomande.find((d) => d.id === id)).filter(Boolean);
