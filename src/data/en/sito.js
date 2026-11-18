// English version of src/data/sito.js: only the TEXTS are here. Numbers, phone, email, moorings and links
// come from the Italian file, so they are written once (rule of 16 November 2026).
// When an Italian text in sito.js changes, change it here too. Empty values ('') show a pink placeholder.

import { sito as it } from '../sito.js';
import { sitoTradotto } from '../traduzioni.js';

const testi = {
  contatti: {
    orariRisposta: 'every day from 7:30 am to 10:30 pm, from 1 May to 31 October',
  },
  imbarchi: {
    // Where to park in Palau: still to be provided by the client. When the Italian text arrives
    // (sito.imbarchi.palau.parcheggio), write the English version here.
    palau: { parcheggio: '' },
  },
  // La Maddalena is the main port; Palau is a pick-up only, never before La Maddalena (Remo, 18 November 2026).
  partenze: {
    breve: 'La Maddalena (pick-up in Palau) and Cannigione',
    frase: 'departing from La Maddalena, with a pick-up in Palau, and from Cannigione',
    seo: 'from La Maddalena (pick-up in Palau) and Cannigione',
  },
  gommone: {
    descrizione: 'Large, stable RIBs with the skipper always on board: you reach the most beautiful coves without effort and enjoy the sea safely. Shade on board and no more than 12 people: just the right space for families with children and groups of friends.',
  },
  // Lunch on the 7 Islands Tour: one text, used everywhere (see pranzo7 in sito.js).
  pranzo7: {
    breve: 'Free time for lunch in La Maddalena',
    testo: `We reach the port of La Maddalena by ${it.pranzo7.arrivo}, so you find a table and eat at your own pace: we set off again at ${it.pranzo7.ripartenza}. If you like, our skipper, born and raised in La Maddalena, takes you to his friends' restaurants that work with us, serving local food at fair, transparent prices. Or bring a packed lunch.`,
    nonIncluso: 'Lunch: free time in La Maddalena, at our partner restaurants (fair, transparent prices) or a packed lunch',
  },
  tagliere: 'A sharing board with Sardinian sausage and cheese, or fruit skewers',
  pagamentoLink: {
    breve: 'You pay after we confirm, with the link we send you',
    testo: 'Once we confirm availability on WhatsApp, we send you a link to pay online by card (SumUp) or with PayPal.',
  },
  // Fuel on private tours: English version of regole.carburante in src/data/prenotazioni.js.
  carburante: 'metered. When we leave we show you the full tank; back in port we work out together the litres used, which you pay on board at the end of the tour',
  notaOrariEsclusiva: 'Times are approximate: if you need, ask us for a small change when you book.',
  skipper: { nome: '', descrizione: '' },
  cosaPortare: [
    'Swimsuit, towel and a change of clothes',
    'Sunscreen, hat and sunglasses',
    'The wish to have fun and enjoy an unforgettable day',
  ],
  regole: {
    maltempo: "If the sea or wind isn't safe, we cancel and you choose: a full refund or another date.",
    ticketParco: 'Yes, it is included in the price of every tour.',
    pagamento: 'Online when you book, by card or PayPal. On private tours fuel is extra.',
    bambini: 'Yes, at any age. Up to 10 years old they pay the child price. Life jackets are compulsory on board, but ours are adult size: for extra peace of mind, bring a life jacket in the right size for your children.',
    animali: 'No, pets are not allowed on board.',
  },
};

// The four RIBs: model and engines stay the same, description and equipment in English.
const flottaEn = {
  'gruppo-1': { motori: 'Twin Suzuki 200 hp engines', dotazioni: 'toilet, T-top', descrizione: 'The RIB for our group tours: 8.5 metres, a large sunbed at the bow and a U-shaped sofa at the stern, comfortable even for twelve. Shade from the T-top and a toilet on board.' },
  'gruppo-2': { motori: 'Twin Mercury 250 hp engines', dotazioni: 'toilet, cabin, T-top', descrizione: 'More spacious, with a cabin and toilet below deck: handy for changing calmly after a swim. A sunbed at the bow, and the T-top gives shade while cruising.' },
  esclusiva: { motori: 'Twin Suzuki 300 hp engines', dotazioni: 'cabin, toilet, shade', descrizione: 'The largest in the fleet, over 10 metres, kept for private tours with no more than 6 people: room for everyone. Cabin with a double bed, separate toilet and a bow sunbed where more than four can stretch out.' },
  cannigione: { motori: 'Single Honda 350 hp engine', dotazioni: 'T-top', descrizione: 'The RIB for departures from Cannigione, with a 350 hp Honda engine: it reaches the archipelago without wasting time. Up to 12 people, with shade on board.' },
};
export const sito = sitoTradotto(testi, flottaEn);

export const recensioni = [];
