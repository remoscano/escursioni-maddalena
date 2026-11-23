// Indirizzi delle pagine della prenotazione in ogni lingua (23 novembre 2026). Li usano le pagine, i menu delle
// lingue (src/data/<lingua>/menu.js) e il server (ritorno dal pagamento, link nelle email).
// prenota = scelta e pagamento; esito = pagina del cliente con il biglietto; paga = link di pagamento;
// condizioni (+ condizioniTxt, la copia da scaricare); buono = buono regalo (+ buonoEsito); recesso = recesso dai buoni.
export const percorsiPrenota = {
  it: {
    prenota: '/prenota/', esito: '/prenota/esito/', paga: '/prenota/paga/',
    condizioni: '/condizioni/', condizioniTxt: '/condizioni.txt',
    buono: '/buono-regalo/', buonoEsito: '/buono-regalo/esito/', recesso: '/recesso/',
  },
  en: {
    prenota: '/en/book/', esito: '/en/book/booking/', paga: '/en/book/pay/',
    condizioni: '/en/booking-terms/', condizioniTxt: '/en/booking-terms.txt',
    buono: '/en/gift-voucher/', buonoEsito: '/en/gift-voucher/voucher/', recesso: '/en/withdrawal/',
  },
  es: {
    prenota: '/es/reservar/', esito: '/es/reservar/reserva/', paga: '/es/reservar/pagar/',
    condizioni: '/es/condiciones/', condizioniTxt: '/es/condiciones.txt',
    buono: '/es/bono-regalo/', buonoEsito: '/es/bono-regalo/bono/', recesso: '/es/desistimiento/',
  },
  fr: {
    prenota: '/fr/reserver/', esito: '/fr/reserver/reservation/', paga: '/fr/reserver/payer/',
    condizioni: '/fr/conditions/', condizioniTxt: '/fr/conditions.txt',
    buono: '/fr/bon-cadeau/', buonoEsito: '/fr/bon-cadeau/bon/', recesso: '/fr/retractation/',
  },
  de: {
    prenota: '/de/buchen/', esito: '/de/buchen/buchung/', paga: '/de/buchen/bezahlen/',
    condizioni: '/de/buchungsbedingungen/', condizioniTxt: '/de/buchungsbedingungen.txt',
    buono: '/de/gutschein/', buonoEsito: '/de/gutschein/gutschein/', recesso: '/de/widerruf/',
  },
};
export const lingueValide = Object.keys(percorsiPrenota);
// Lingua sicura: quella chiesta se esiste, altrimenti italiano.
export const linguaValida = (l) => (lingueValide.includes(l) ? l : 'it');
export const percorsoDi = (lingua, pagina) => percorsiPrenota[linguaValida(lingua)][pagina];
