import { percorsiPrenota } from '../percorsi.js';
// Francese: menu e indirizzi delle pagine tradotte (pagina italiana → pagina francese).
export const menu = [
  { href: '/fr/excursions-en-bateau/', testo: 'Excursions' },
  { href: '/fr/excursions-en-bateau/tour-archipel-la-maddalena-en-bateau/', testo: 'Tour des 7 îles' },
  { href: '/fr/nos-bateaux/', testo: 'Nos bateaux' },
  { href: '/fr/infos-pratiques/', testo: 'Infos pratiques' },
  { href: '/fr/faq/', testo: 'Questions' },
  { href: '/fr/contact/', testo: 'Contact' },
];

export const pagine = {
  '/': '/fr/',
  '/escursioni/': '/fr/excursions-en-bateau/',
  '/gommone/': '/fr/nos-bateaux/',
  '/info-utili/': '/fr/infos-pratiques/',
  '/domande-frequenti/': '/fr/faq/',
  '/contatti/': '/fr/contact/',
  '/richiesta/': '/fr/demande/',
  '/privacy/': '/fr/confidentialite/',
  '/cookie/': '/fr/cookies/',
  '/prenota/': percorsiPrenota.fr.prenota,
  '/condizioni/': percorsiPrenota.fr.condizioni,
  '/buono-regalo/': percorsiPrenota.fr.buono,
  '/recesso/': percorsiPrenota.fr.recesso,
};
