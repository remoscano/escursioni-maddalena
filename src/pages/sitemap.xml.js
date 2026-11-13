// Mappa del sito per Google: solo le pagine pubbliche (niente aree riservate, esiti, pagamenti).
import { sito } from '../data/sito.js';
import { escursioni } from '../data/escursioni.js';

const pagine = ['/', '/escursioni/', ...escursioni.map((e) => `/escursioni/${e.slug}/`), '/prenota/', '/buono-regalo/', '/gommone/',
  '/info-utili/', '/domande-frequenti/', '/contatti/', '/richiesta/', '/condizioni/', '/privacy/', '/cookie/'];

export function GET() {
  const base = sito.url.replace(/\/$/, '');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pagine.map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
