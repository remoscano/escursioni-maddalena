// Le condizioni in un file di testo (/condizioni.txt), stesso contenuto della pagina /condizioni/.
// Serve alle prenotazioni su WhatsApp: la legge chiede di dare al cliente la conferma con le condizioni su un
// "supporto durevole" (art. 51, comma 7, del Codice del consumo). Un link alla pagina non basta; un file che il
// cliente riceve e conserva sì: l'ufficio lo manda come documento su WhatsApp con la conferma.
// Le altre lingue: src/pages/[lingua]/[file].txt.js (/en/booking-terms.txt ...).
import { testoCondizioni } from '../data/condizioni-file.js';

export function GET() {
  return new Response(testoCondizioni('it'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
