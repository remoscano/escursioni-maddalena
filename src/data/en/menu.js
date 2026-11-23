// English menu (same pages as src/data/menu.js).
export const menu = [
  { href: '/en/boat-tours/', testo: 'Boat tours' },
  { href: '/en/boat-tours/la-maddalena-archipelago-boat-tour/', testo: '7 Islands Tour' },
  { href: '/en/boats/', testo: 'Our boats' },
  { href: '/en/useful-info/', testo: 'Useful info' },
  { href: '/en/faq/', testo: 'FAQ' },
  { href: '/en/contact/', testo: 'Contact' },
];

// English addresses of the translated pages (Italian page → English page). Tour pages: catalogue + "indirizzo"
// in escursioni.js; departure pages: "href" in imbarchi.js.
export const pagine = {
  '/': '/en/',
  '/escursioni/': '/en/boat-tours/',
  '/gommone/': '/en/boats/',
  '/info-utili/': '/en/useful-info/',
  '/domande-frequenti/': '/en/faq/',
  '/contatti/': '/en/contact/',
  '/richiesta/': '/en/enquiry/',
  '/privacy/': '/en/privacy/',
  '/cookie/': '/en/cookies/',
  '/prenota/': '/en/book/',
};
