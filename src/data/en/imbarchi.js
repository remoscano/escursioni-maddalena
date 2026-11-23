// English version of src/data/imbarchi.js: the departure pages (Palau, Cannigione).
// Times, prices and moorings come from prenotazioni.js and sito.js: never typed by hand here.
import { cifra } from '../formato.js';

import { regole } from '../prenotazioni.js';
import { escursioni } from './escursioni.js';
import { sito } from './sito.js';
import { breve, escursioniDaImbarco, prezzoMinimo, honda, palauMattina, mezzaMattina, mezzaPomeriggio } from '../traduzioni.js';

// Names of the time slots (the Italian ones are in prenotazioni.js, "nome" of each turno).
const nomiTurni = { giornata: 'Full day', mattina: 'Morning', pomeriggio: 'Afternoon', tramonto: 'At sunset' };
const nomiTurniPrivato = { giornata: 'Full day', mattina: 'Half day, morning', pomeriggio: 'Half day, afternoon', tramonto: 'Sunset aperitivo' };
const escursioniDa = (imbarco) => escursioniDaImbarco(escursioni, imbarco, nomiTurni, nomiTurniPrivato, 'departure between 6:30 and 7 pm');
const daPalau = escursioniDa('palau');
const daCannigione = escursioniDa('cannigione');
const hondaFlotta = sito.flotta.find((f) => f.id === honda?.id);

export const pagineImbarco = [
  {
    id: 'palau',
    imbarco: 'Palau',
    href: '/en/la-maddalena-boat-tours-from-palau/',
    titoloSeo: 'La Maddalena Boat Tours from Palau: Trips and Prices',
    titoloPagina: 'La Maddalena boat tours from Palau',
    titoloElenco: 'Departure from La Maddalena, pick-up in Palau: times and prices',
    titoloDomande: 'Pick-up in Palau: questions',
    titoloRichiesta: 'Board in Palau: choose your date',
    briciola: 'Pick-up in Palau',
    descrizioneSeo: `La Maddalena boat tours with pick-up in Palau: the RIB leaves La Maddalena and collects you in Palau. Island tour, half day, sunset, Corsica. From €${cifra(prezzoMinimo(daPalau), 'en')}.`,
    breve: `The RIB leaves La Maddalena and picks you up in Palau at ${palauMattina}: handy if you're coming from Olbia or staying in Gallura.`,
    intro: `Our boat tours with skipper leave from the port of La Maddalena. For guests who can't or don't want to get there, the RIB picks people up in Palau: at ${palauMattina} in the morning, and on the way back it drops you in Palau before returning to La Maddalena.`,
    perche: {
      titolo: 'Why board in Palau',
      punti: [
        `Coming from further away, for example from Olbia? With the pick-up at ${palauMattina} you don't need to get up early and you have time to park.`,
        'No ferry to La Maddalena: you board directly in Palau.',
        'Same tours and same prices as boarding in La Maddalena.',
        `Meet ${regole.anticipoRitrovo.palau} minutes before: at ${sito.imbarchi.palau.ritrovo} for morning tours. We confirm the exact time by message.`,
      ],
    },
    molo: sito.imbarchi.palau,
    escursioni: daPalau,
    nota: 'On group tours the RIB leaves La Maddalena and stops in Palau. On private tours (private boat tour and Corsica) the RIB leaves La Maddalena or picks you up directly in Palau.',
    faq: ['palau', 'prezzi', 'pranzo', 'maestrale', 'pagare', 'cancellare', 'minimo', 'bambini'],
  },
  {
    id: 'cannigione',
    imbarco: 'Cannigione',
    href: '/en/la-maddalena-boat-tours-from-cannigione/',
    titoloSeo: 'La Maddalena Boat Tours from Cannigione: Prices',
    titoloPagina: 'La Maddalena boat tours from Cannigione',
    titoloElenco: 'Boat tours from Cannigione: times and prices',
    titoloDomande: 'Tours from Cannigione: questions',
    titoloRichiesta: 'Tour from Cannigione: choose your date',
    briciola: 'From Cannigione',
    descrizioneSeo: `Boat tours from Cannigione to the La Maddalena archipelago: half day, sunset aperitivo and private RIB with skipper, from Pontile La Sciumara. From €${cifra(prezzoMinimo(daCannigione), 'en')}.`,
    breve: `Cannigione has its own RIB, the ${hondaFlotta?.modello ?? ''}: half day, sunset aperitivo and private tour.`,
    intro: `Boat tours from Cannigione to the La Maddalena archipelago, on a RIB with skipper. A dedicated RIB leaves from Cannigione, the ${hondaFlotta?.modello ?? ''}: up to ${honda?.posti ?? ''} people, with shade on board and ${(hondaFlotta?.motori ?? '').replace(/^Single Honda /, 'a ')} that reaches the archipelago without wasting time.`,
    perche: {
      titolo: 'Leaving from Cannigione',
      punti: [
        `Half day in the morning (${breve(mezzaMattina.orariImbarco.cannigione)}) or afternoon (${breve(mezzaPomeriggio.orariImbarco.cannigione)}).`,
        'Same prices as departures from La Maddalena.',
        'The 7 Islands Tour (the island tour) and the Corsica trip do not leave from Cannigione: for these you leave from La Maddalena, with a pick-up in Palau.',
        `Meet ${regole.anticipoRitrovo.cannigione} minutes before: at ${sito.imbarchi.cannigione.ritrovo} for morning tours. We confirm the exact time by message.`,
      ],
    },
    molo: sito.imbarchi.cannigione,
    escursioni: daCannigione,
    nota: '',
    faq: ['prezzi', 'maestrale', 'pagare', 'cancellare', 'minimo', 'bambini'],
  },
];
