// Lingue del sito (inglese dal 18 novembre 2026, poi tedesco e francese).
// La lingua di una pagina si capisce dall'indirizzo: /en/... = inglese, il resto = italiano.
// Ogni lingua ha gli stessi "pacchetti" di dati: sito, escursioni, domande, imbarchi, menu e i testi delle pagine.
// L'italiano sta in src/data/, ogni altra lingua nella sua cartella (src/data/en/): stessi nomi, stesse chiavi.
//
// Per aggiungere una lingua: copiare src/data/en/ in src/data/<codice>/, tradurre, aggiungerla qui sotto in "pacchetti",
// creare le pagine in src/pages/<codice>/ (come quelle di src/pages/en/) e gli indirizzi in "indirizzi".

import { sito } from './sito.js';
import { escursioni } from './escursioni.js';
import { faq } from './faq.js';
import { menu } from './menu.js';
import { pagineImbarco } from './imbarchi.js';
import { testi } from './testi.js';
import { regole } from './prenotazioni.js';

import { sito as sitoEn } from './en/sito.js';
import { escursioni as escursioniEn } from './en/escursioni.js';
import { faq as faqEn } from './en/faq.js';
import { menu as menuEn } from './en/menu.js';
import { pagineImbarco as pagineImbarcoEn } from './en/imbarchi.js';
import { testi as testiEn } from './en/testi.js';

// Indirizzi delle pagine tradotte: pagina italiana → pagina inglese.
// Le pagine che mancano qui (prenotazione, buono regalo, condizioni, aree riservate) esistono solo in italiano.
const indirizziEn = {
  '/': '/en/',
  '/escursioni/': '/en/boat-tours/',
  '/gommone/': '/en/boats/',
  '/info-utili/': '/en/useful-info/',
  '/domande-frequenti/': '/en/faq/',
  '/contatti/': '/en/contact/',
  '/richiesta/': '/en/enquiry/',
  '/privacy/': '/en/privacy/',
  '/cookie/': '/en/cookies/',
};
for (const e of escursioni) {
  indirizziEn[`/escursioni/${e.indirizzo}/`] = `/en/boat-tours/${escursioniEn.find((x) => x.slug === e.slug).indirizzo}/`;
}
for (const p of pagineImbarco) indirizziEn[p.href] = pagineImbarcoEn.find((x) => x.id === p.id).href;

function pacchetto(lingua, d, indirizzi) {
  const trova = (slug) => d.escursioni.find((e) => e.slug === slug);
  const tutte = d.faq.flatMap((g) => g.domande);
  return {
    lingua,
    ...d,
    trovaEscursione: trova,
    urlEscursione: (slug) => link(`/escursioni/${escursioni.find((e) => e.slug === slug)?.indirizzo ?? slug}/`),
    tutteLeDomande: tutte,
    domande: (ids) => ids.map((id) => tutte.find((x) => x.id === id)).filter(Boolean),
    // Indirizzo di una pagina in questa lingua (se non è tradotta resta quella italiana).
    link,
    // La prenotazione online esiste solo in italiano: nelle altre lingue i bottoni portano alla richiesta su WhatsApp.
    prenotaOnline: regole.attive && lingua === 'it',
  };
  function link(percorso) {
    const [p, resto = ''] = percorso.split(/(?=[?#])/);
    return (indirizzi?.[p] ?? p) + resto;
  }
}

export const pacchetti = {
  it: pacchetto('it', { sito, escursioni, faq, menu, pagineImbarco, testi }, null),
  en: pacchetto('en', { sito: sitoEn, escursioni: escursioniEn, faq: faqEn, menu: menuEn, pagineImbarco: pagineImbarcoEn, testi: testiEn }, indirizziEn),
};

// Lingue del sito, nell'ordine del menu a tendina (sigla, nome, home). Quando arriva una lingua nuova
// (spagnolo, francese, tedesco) si aggiunge qui e compare da sola nel menu, in testata e nel piè di pagina.
export const lingueSito = [
  { codice: 'it', sigla: 'IT', nome: 'Italiano', home: '/' },
  { codice: 'en', sigla: 'EN', nome: 'English', home: '/en/' },
];

// Indirizzo di questa pagina in ogni lingua: la stessa pagina se è tradotta, altrimenti la home di quella lingua.
export function indirizziLingue(percorso) {
  const v = versioni(percorso);
  return lingueSito.map((l) => ({ ...l, href: v?.[l.codice] ?? l.home }));
}

export const linguaDi = (url) => (/^\/en(\/|$)/.test(url.pathname) ? 'en' : 'it');

// Nelle pagine e nei componenti: const L = datiLingua(Astro.url);
export const datiLingua = (url) => pacchetti[linguaDi(url)];

// Versioni della stessa pagina nelle altre lingue (per hreflang e per il link "English" / "Italiano").
const enDaIt = indirizziEn;
const itDaEn = Object.fromEntries(Object.entries(indirizziEn).map(([it, en]) => [en, it]));
export function versioni(percorso) {
  if (enDaIt[percorso]) return { it: percorso, en: enDaIt[percorso] };
  if (itDaEn[percorso]) return { it: itDaEn[percorso], en: percorso };
  return null;
}
export const tuttiGliIndirizziEn = Object.values(indirizziEn);
