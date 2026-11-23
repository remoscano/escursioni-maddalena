// Lingue del sito: italiano, inglese (18 novembre 2026), spagnolo, francese e tedesco.
// La lingua di una pagina si capisce dall'indirizzo: /en/, /es/, /fr/, /de/; il resto è italiano.
// Ogni lingua ha gli stessi "pacchetti" di dati: sito, escursioni, domande, imbarchi, menu (con gli indirizzi delle
// pagine) e testi. L'italiano sta in src/data/, ogni altra lingua nella sua cartella (src/data/en/ ...): stessi nomi,
// stesse chiavi. Le pagine tradotte nascono tutte da src/pages/[...traduzione].astro.
//
// Per aggiungere una lingua: copiare src/data/en/ in src/data/<codice>/, tradurre, aggiungerla qui sotto in
// "lingueSito" e "datiPerLingua" (import compresi), la sua privacy e i cookie in src/viste/legali/ e la 404 in astro.config.mjs.

import { sito } from './sito.js';
import { escursioni } from './escursioni.js';
import { faq } from './faq.js';
import { menu } from './menu.js';
import { pagineImbarco } from './imbarchi.js';
import { testi } from './testi.js';
import { regole } from './prenotazioni.js';

import * as en from './en/index.js';
import * as es from './es/index.js';
import * as fr from './fr/index.js';
import * as de from './de/index.js';

// Lingue del sito, nell'ordine del menu a tendina (sigla, nome nella sua lingua, home).
export const lingueSito = [
  { codice: 'it', sigla: 'IT', nome: 'Italiano', home: '/' },
  { codice: 'en', sigla: 'EN', nome: 'English', home: '/en/' },
  { codice: 'es', sigla: 'ES', nome: 'Español', home: '/es/' },
  { codice: 'fr', sigla: 'FR', nome: 'Français', home: '/fr/' },
  { codice: 'de', sigla: 'DE', nome: 'Deutsch', home: '/de/' },
];

// Lingue in cui si prenota e si paga online (dal 23 novembre 2026, ramo prenotazione-lingue).
export const lingueConPrenotazione = ['it', 'en', 'es', 'fr', 'de'];

const datiPerLingua = {
  it: { sito, escursioni, faq, menu, pagineImbarco, testi, pagine: null },
  en, es, fr, de,
};

// Indirizzi delle pagine tradotte di una lingua: pagina italiana → pagina tradotta.
// Le pagine che non ci sono (prenotazione, buono regalo, condizioni, aree riservate) esistono solo in italiano.
function indirizziDi(d) {
  const m = { ...d.pagine };
  for (const e of escursioni) m[`/escursioni/${e.indirizzo}/`] = `${d.pagine['/escursioni/']}${d.escursioni.find((x) => x.slug === e.slug).indirizzo}/`;
  for (const p of pagineImbarco) m[p.href] = d.pagineImbarco.find((x) => x.id === p.id).href;
  return m;
}
const codici = lingueSito.map((l) => l.codice).filter((c) => c !== 'it');
export const indirizzi = Object.fromEntries(codici.map((c) => [c, indirizziDi(datiPerLingua[c])]));

function pacchetto(lingua, d, mappa) {
  const tutte = d.faq.flatMap((g) => g.domande);
  const link = (percorso) => {
    const [p, resto = ''] = percorso.split(/(?=[?#])/);
    return (mappa?.[p] ?? p) + resto;
  };
  return {
    lingua,
    ...d,
    trovaEscursione: (slug) => d.escursioni.find((e) => e.slug === slug),
    urlEscursione: (slug) => link(`/escursioni/${escursioni.find((e) => e.slug === slug)?.indirizzo ?? slug}/`),
    tutteLeDomande: tutte,
    domande: (ids) => ids.map((id) => tutte.find((x) => x.id === id)).filter(Boolean),
    // Indirizzo di una pagina in questa lingua (se non è tradotta resta quella italiana).
    link,
    // Prenotazione online in questa lingua (lingueConPrenotazione, sotto); altrimenti i bottoni portano a WhatsApp.
    prenotaOnline: regole.attive && lingueConPrenotazione.includes(lingua),
  };
}

export const pacchetti = Object.fromEntries(lingueSito.map((l) => [l.codice, pacchetto(l.codice, datiPerLingua[l.codice], indirizzi[l.codice])]));

export const linguaDi = (url) => codici.find((c) => url.pathname === `/${c}` || url.pathname.startsWith(`/${c}/`)) ?? 'it';

// Nelle pagine e nei componenti: const L = datiLingua(Astro.url);
export const datiLingua = (url) => pacchetti[linguaDi(url)];

// Gruppi di versioni della stessa pagina: { it: '/gommone/', en: '/en/boats/', es: ... }.
const gruppi = Object.keys(indirizzi.en).map((it) => ({ it, ...Object.fromEntries(codici.map((c) => [c, indirizzi[c][it]])) }));
const gruppoDi = new Map(gruppi.flatMap((g) => Object.values(g).map((p) => [p, g])));

// Versioni della stessa pagina in tutte le lingue (per hreflang e per il menu delle lingue), oppure null.
export const versioni = (percorso) => gruppoDi.get(percorso) ?? null;

// Tutte le pagine tradotte, con la lingua e la pagina italiana da cui nascono (per src/pages/[...traduzione].astro).
export const pagineTradotte = gruppi.flatMap((g) => codici.map((c) => ({ lingua: c, percorso: g[c], it: g.it })));

// Indirizzo di questa pagina in ogni lingua: la stessa pagina se è tradotta, altrimenti la home di quella lingua.
export function indirizziLingue(percorso) {
  const v = versioni(percorso);
  return lingueSito.map((l) => ({ ...l, href: v?.[l.codice] ?? l.home }));
}
