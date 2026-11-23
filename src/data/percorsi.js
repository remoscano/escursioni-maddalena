// Indirizzi delle pagine della prenotazione in ogni lingua (23 novembre 2026). Li usano le pagine, i menu delle
// lingue (src/data/<lingua>/menu.js) e il server (ritorno dal pagamento, link nelle email).
export const percorsiPrenota = {
  it: { prenota: '/prenota/', esito: '/prenota/esito/', paga: '/prenota/paga/' },
  en: { prenota: '/en/book/', esito: '/en/book/booking/', paga: '/en/book/pay/' },
  es: { prenota: '/es/reservar/', esito: '/es/reservar/reserva/', paga: '/es/reservar/pagar/' },
  fr: { prenota: '/fr/reserver/', esito: '/fr/reserver/reservation/', paga: '/fr/reserver/payer/' },
  de: { prenota: '/de/buchen/', esito: '/de/buchen/buchung/', paga: '/de/buchen/bezahlen/' },
};
export const lingueValide = Object.keys(percorsiPrenota);
// Lingua sicura: quella chiesta se esiste, altrimenti italiano.
export const linguaValida = (l) => (lingueValide.includes(l) ? l : 'it');
export const percorsoDi = (lingua, pagina) => percorsiPrenota[linguaValida(lingua)][pagina];
