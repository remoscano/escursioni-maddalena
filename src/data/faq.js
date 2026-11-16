// Domande frequenti. "risposta" può contenere un segnaposto: se "mancante" è valorizzato,
// sul sito compare un segnaposto rosa al posto del dato ancora da inserire.
// "regola" collega la risposta a un campo di sito.regole: quando lo compili, il segnaposto sparisce.

import { regole as regoleP, testoChiusuraOnline, testoDopoChiusura } from './prenotazioni.js';
import { sito } from './sito.js';

// Prenotazione online accesa o spenta (regole.attive): alcune risposte cambiano, buono regalo e lista d'attesa spariscono.
const online = regoleP.attive;

export const faq = [
  {
    gruppo: 'Prenotazione e pagamento',
    domande: [
      {
        id: 'prenotare',
        domanda: 'Come si prenota?',
        risposta: online
          ? `Online, dalla pagina Prenota: scegli escursione, giorno e orario, vedi subito i posti liberi e paghi con carta o PayPal. Ricevi il codice di prenotazione da mostrare all'imbarco. ${testoChiusuraOnline} ${testoDopoChiusura}`
          : `Con un messaggio WhatsApp: dalla pagina Richiesta scegli escursione, giorno, persone e punto d'imbarco, e il messaggio è già pronto da inviare. Ti rispondiamo con la disponibilità e l'orario di ritrovo. ${sito.pagamentoLink.testo}`,
      },
      {
        id: 'pagare',
        domanda: 'Come si paga?',
        // Senza prenotazione online: niente modo di pagare inventato, si spiega su WhatsApp (Remo, 16 novembre 2026).
        risposta: online ? '' : `${sito.pagamentoLink.testo} Nei tour in esclusiva il carburante è a parte e si paga a bordo, a consumo.`,
        regola: online ? 'pagamento' : undefined,
        mancante: online ? 'Pagamento: a bordo, in contanti o con carta? Serve un acconto?' : undefined,
      },
      {
        id: 'cancellare',
        domanda: 'Posso annullare la prenotazione?',
        risposta:
          online
            ? "Sì: se annulli almeno 48 ore prima ti rimborsiamo per intero. Puoi farlo da solo dalla pagina della prenotazione (il link è nell'email di conferma): il rimborso parte subito. Oppure scrivici su WhatsApp con il codice di prenotazione. Dopo, il rimborso non è previsto."
            : "Sì: se annulli almeno 48 ore prima ti rimborsiamo per intero. Scrivici su WhatsApp. Dopo, il rimborso non è previsto.",
      },
      {
        id: 'minimo',
        domanda: 'E se non si arriva al numero minimo?',
        risposta:
          "Le uscite di gruppo partono con almeno 6 persone. Se la sera prima non si raggiungono, ti proponiamo un'altra data o un altro tour, oppure ti rimborsiamo per intero.",
      },
      online && {
        id: 'buono',
        domanda: 'Si può regalare un\'escursione?',
        risposta: "Sì, con il buono regalo: lo compri online dalla pagina Buono regalo, scegli l'importo e lo ricevi subito per email, da stampare o inoltrare. Chi lo riceve sceglie escursione, giorno e orario e scrive il codice quando prenota.",
      },
      online && {
        id: 'attesa',
        domanda: 'Il giorno che voglio è pieno: cosa posso fare?',
        risposta: "Mettiti in lista d'attesa dalla pagina Prenota: se si libera un posto ti scriviamo per email e prenoti tu, se vuoi.",
      },
      {
        id: 'anticipo',
        domanda: 'Con quanto anticipo conviene prenotare?',
        risposta: "Prima possibile: i posti sono pochi, soprattutto da fine luglio e per tutto agosto.",
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
        risposta: `No, il pranzo è libero, a La Maddalena. ${sito.pranzo7.testo}`,
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
          "Costume, telo e un cambio, crema solare, cappello e occhiali. Se vuoi fare snorkeling porta maschera e boccaglio: per igiene non li forniamo, anche se a bordo ne teniamo qualcuno. Per i bambini, se vuoi, un giubbotto di salvataggio della loro misura. Da bere ci pensiamo noi: nel Tour delle 7 isole due bibite in lattina a testa e l'acqua, con mirto e dolcetti a fine giro; nella mezza giornata acqua e bibite; nel Sunset e nelle esclusive prosecco e tagliere. Il resto del cibo è a carico tuo: ogni escursione lo dice nelle liste \"Incluso\" e \"Non incluso\". E soprattutto porta la voglia di divertirti e passare una giornata indimenticabile.",
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

for (const g of faq) g.domande = g.domande.filter(Boolean);

export const tutteLeDomande = faq.flatMap((g) => g.domande);
export const domande = (ids) => ids.map((id) => tutteLeDomande.find((d) => d.id === id)).filter(Boolean);
