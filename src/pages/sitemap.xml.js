// Mappa del sito per Google: solo le pagine pubbliche (niente aree riservate, esiti, pagamenti).
// Le pagine tradotte hanno anche le versioni nelle altre lingue (hreflang), come nella testata delle pagine.
import { sito } from '../data/sito.js';
import { escursioni } from '../data/escursioni.js';
import { pagineImbarco } from '../data/imbarchi.js';
import { versioni, tuttiGliIndirizziEn } from '../data/lingua.js';

const pagine = ['/', '/escursioni/', ...escursioni.map((e) => `/escursioni/${e.indirizzo}/`), ...pagineImbarco.map((p) => p.href), '/prenota/', '/buono-regalo/', '/gommone/',
  '/info-utili/', '/domande-frequenti/', '/contatti/', '/richiesta/', '/condizioni/', '/privacy/', '/cookie/', ...tuttiGliIndirizziEn];

export function GET() {
  const base = sito.url.replace(/\/$/, '');
  const riga = (p) => {
    const v = versioni(p);
    const alternative = v
      ? ['it', 'en'].map((l) => `\n    <xhtml:link rel="alternate" hreflang="${l}" href="${base}${v[l]}"/>`).join('') +
        `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${base}${v.it}"/>\n  `
      : '';
    return `  <url><loc>${base}${p}</loc>${alternative}</url>`;
  };
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pagine.map(riga).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
