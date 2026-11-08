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
          "Online, dalla pagina Prenota: scegli escursione, giorno e orario, vedi subito i posti liberi e paghi con carta o PayPal. Ricevi il codice di prenotazione da mostrare all'imbarco. Per domande, per domani o per gruppi oltre 12 persone scrivici su WhatsApp.",
      },
      {
        id: 'pagare',
        domanda: 'Come si paga?',
        risposta: '',
        regola: 'pagamento',
        mancante: 'Pagamento: a bordo, in contanti o con carta? Serve un acconto?',
      },
      {
        id: 'cancellare',
        domanda: 'Posso annullare la prenotazione?',
        risposta:
          "Sì: se annulli almeno 48 ore prima ti rimborsiamo per intero. Scrivici su WhatsApp con il codice di prenotazione. Dopo, il rimborso non è previsto.",
      },
      {
        id: 'minimo',
        domanda: 'E se non si arriva al numero minimo?',
        risposta:
          "Le uscite di gruppo partono con almeno 6 persone. Se la sera prima non si raggiungono, ti proponiamo un'altra data o un altro tour, oppure ti rimborsiamo per intero.",
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
          "L'itinerario si adatta al vento, scegliendo le cale più riparate. Se il mare non lo permette ti avvisiamo su WhatsApp.",
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
