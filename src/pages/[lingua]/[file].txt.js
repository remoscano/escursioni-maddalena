// Le condizioni in un file di testo nelle altre lingue: /en/booking-terms.txt, /es/condiciones.txt ...
// (indirizzi in src/data/percorsi.js). L'italiano è /condizioni.txt.
import { percorsiPrenota } from '../../data/percorsi.js';
import { testoCondizioni } from '../../data/condizioni-file.js';

export function getStaticPaths() {
  return Object.entries(percorsiPrenota).filter(([l]) => l !== 'it').map(([lingua, p]) => {
    const [, , nome] = p.condizioniTxt.match(/^\/([a-z]+)\/(.+)\.txt$/);
    return { params: { lingua, file: nome }, props: { lingua } };
  });
}

export function GET({ props }) {
  return new Response(testoCondizioni(props.lingua), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
