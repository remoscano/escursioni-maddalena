// Testo del file delle condizioni da scaricare o mandare su WhatsApp, in una lingua.
import { condizioniInTesto } from './condizioni.js';
import { paginaCondizioni } from './condizioni-lingue.js';
import { sito } from './sito.js';

export const testoCondizioni = (lingua) => `${(paginaCondizioni[lingua] ?? paginaCondizioni.it).file} - ${sito.nome.toUpperCase()}\n\n${condizioniInTesto(lingua)}\n`;
