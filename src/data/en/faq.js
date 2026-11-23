// English version of src/data/faq.js. Same ids, so pages pick the same questions in both languages.
// Answers describe booking on WhatsApp; with online booking on, src/data/faq-online.js changes some of them.
// Prices come from the single price list (src/data/prenotazioni.js), never typed by hand.
import { cifra } from '../formato.js';

import { prezzoDa, offerte, regole } from '../prenotazioni.js';
import { sito } from './sito.js';
import { faqConOnline } from '../faq-online.js';

const p7 = prezzoDa('tour-7-isole'), pM = prezzoDa('mezza-giornata'), pT = prezzoDa('tramonto'), pP = prezzoDa('tour-privato'), pC = prezzoDa('corsica');
const palauMattina = offerte['tour-7-isole'].turni[0].orariImbarco.palau.split('–')[0].trim();
const minimo = offerte['tour-7-isole'].minimo;

const gruppi = [
  {
    gruppo: 'Booking and payment',
    domande: [
      {
        id: 'prenotare',
        domanda: 'How do I book?',
        risposta: `With a WhatsApp message: on the Enquiry page choose the tour, day, number of people and where you board, and the message is ready to send. We reply with availability and the meeting time. ${sito.pagamentoLink.testo}`,
      },
      {
        id: 'pagare',
        domanda: 'How do I pay?',
        risposta: `${sito.pagamentoLink.testo} On private tours fuel is extra: ${sito.carburante}.`,
      },
      {
        id: 'prezzi',
        domanda: 'How much does a boat tour in La Maddalena cost?',
        risposta: `On group tours: half-day tour from €${cifra(pM.adulto, 'en')} per person, the island tour (7 Islands Tour) from €${cifra(p7.adulto, 'en')}, sunset aperitivo from €${cifra(pT.adulto, 'en')}. Children up to 10 pay a reduced price (from €${cifra(pM.bambino, 'en')} on the half day). A private RIB with skipper costs from €${cifra(pP.barca, 'en')} (Corsica from €${cifra(pC.barca, 'en')}), with fuel extra. Prices vary with the time of the season.`,
      },
      {
        id: 'palau',
        domanda: 'Can I board in Palau?',
        risposta: `Yes. On group tours the RIB leaves from the port of La Maddalena and picks up guests boarding in Palau: at ${palauMattina} in the morning, and on the way back it drops you there before returning to La Maddalena. It's an extra service for those who can't or don't want to get to La Maddalena. On private tours (private boat tour and Corsica) the RIB can pick you up directly in Palau. The price is the same.`,
      },
      {
        id: 'cancellare',
        domanda: 'Can I cancel my booking?',
        risposta: `Yes: if you cancel at least ${regole.cancellazioneGratisOre} hours before, you get a full refund. Just message us on WhatsApp. After that, no refund is given.`,
      },
      {
        id: 'minimo',
        domanda: "What if the minimum number of people isn't reached?",
        risposta: `Group tours run with at least ${minimo} people. If they aren't reached by the evening before, we offer you another date or another tour, or a full refund.`,
      },
      {
        id: 'anticipo',
        domanda: 'How far ahead should I book?',
        risposta: 'As early as possible: places are limited, especially from late July and throughout August.',
      },
    ],
  },
  {
    gruppo: 'Weather and cancellations',
    domande: [
      {
        id: 'maestrale',
        domanda: 'What if the mistral is blowing?',
        risposta: "The route adapts to the wind, choosing the most sheltered coves. If the sea doesn't allow it, we let you know on WhatsApp.",
        regola: 'maltempo',
        mancante: 'Your rule: refund or change of date',
      },
    ],
  },
  {
    gruppo: 'On board',
    domande: [
      {
        id: 'pranzo',
        domanda: 'Is lunch served on board? Is it included in the 7 Islands Tour?',
        risposta: `No, lunch is not on board and not included: you have free time for lunch in La Maddalena. ${sito.pranzo7.testo}`,
      },
      {
        id: 'bambini',
        domanda: 'Can children come?',
        risposta: '',
        regola: 'bambini',
        mancante: 'Minimum age, life jackets for children, child price',
      },
      {
        id: 'animali',
        domanda: 'Can I bring my dog?',
        risposta: '',
        regola: 'animali',
        mancante: 'Your rule on pets on board',
      },
      {
        id: 'portare',
        domanda: 'What should I bring?',
        risposta:
          'Swimsuit, towel and a change of clothes, sunscreen, hat and sunglasses. If you want to snorkel, bring a mask and snorkel: for hygiene reasons we don\'t provide them, though we keep a few on board. For children, if you like, a life jacket in their size. Drinks are on us: on the 7 Islands Tour two canned drinks each and water, with mirto and sweets at the end; on the half day water and soft drinks; on the Sunset and private tours prosecco and a sharing board. Other food is up to you: each tour lists it under "Included" and "Not included". And above all, bring the wish to have fun and enjoy an unforgettable day.',
      },
    ],
  },
  {
    gruppo: 'National Park',
    domande: [
      {
        id: 'spiaggia-rosa',
        domanda: 'Can I swim at the Pink Beach?',
        risposta:
          'No. To protect it the Park forbids landing and swimming: we admire it from the sea, just before the stop at Porto della Madonna.',
      },
      {
        id: 'ticket',
        domanda: 'Is the National Park fee included?',
        risposta: '',
        regola: 'ticketParco',
        mancante: 'Included or extra? How much?',
      },
    ],
  },
];

// Con la prenotazione online accesa cambiano alcune risposte, come in italiano (src/data/faq-online.js).
export const faq = faqConOnline('en', gruppi, sito.regole.pagamento);
