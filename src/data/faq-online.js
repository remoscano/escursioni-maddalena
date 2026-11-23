// Domande frequenti delle altre lingue con la prenotazione online accesa (23 novembre 2026): come in italiano
// (src/data/faq.js, `online`), cambiano le risposte su come si prenota, si paga e si annulla, e si aggiungono
// buono regalo e lista d'attesa. Con la prenotazione spenta restano le risposte su WhatsApp di ogni faq.js.
import { regole, postiMassimi } from './prenotazioni.js';
import { testiPrenotaDi } from './prenota-testi.js';

const chiusura = (l) => {
  const P = testiPrenotaDi(l).pagina;
  return `${P.chiusura(regole.chiusuraOnline.ora)} ${P.dopo(postiMassimi)} ${P.scrivici}.`;
};
const ore = regole.cancellazioneGratisOre;

const testi = {
  en: {
    prenotare: () => `Online, from the Book page: choose tour, day and time, see the seats available straight away and pay by card or PayPal. You get a booking code to show when you board. ${chiusura('en')}`,
    cancellare: `Yes: if you cancel at least ${ore} hours before, you get a full refund. You can do it yourself from the booking page (the link is in the confirmation email): the refund starts straight away. Or message us on WhatsApp with the booking code. After that, no refund is given.`,
    buono: ['Can I give a tour as a gift?', 'Yes, with a gift voucher: buy it online on the Gift voucher page, choose the amount and receive it by email straight away, to print or forward. Whoever receives it chooses tour, day and time and enters the code when booking.'],
    attesa: ['The day I want is full: what can I do?', "Join the waiting list from the Book page: if a seat comes free we'll email you, and you book if you want to."],
  },
  es: {
    prenotare: () => `Online, desde la página Reservar: elige excursión, día y hora, ves enseguida las plazas libres y pagas con tarjeta o PayPal. Recibes el código de reserva para enseñar al embarcar. ${chiusura('es')}`,
    cancellare: `Sí: si cancelas al menos ${ore} horas antes, te devolvemos todo. Puedes hacerlo tú mismo desde la página de la reserva (el enlace está en el email de confirmación): el reembolso sale enseguida. O escríbenos por WhatsApp con el código de reserva. Después, no hay reembolso.`,
    buono: ['¿Se puede regalar una excursión?', 'Sí, con el bono regalo: lo compras online en la página Bono regalo, eliges el importe y lo recibes enseguida por email, para imprimir o reenviar. Quien lo recibe elige excursión, día y hora y escribe el código al reservar.'],
    attesa: ['El día que quiero está completo: ¿qué puedo hacer?', 'Apúntate a la lista de espera desde la página Reservar: si queda una plaza libre te escribimos por email y reservas tú, si quieres.'],
  },
  fr: {
    prenotare: () => `En ligne, depuis la page Réserver : choisissez l'excursion, le jour et l'horaire, voyez tout de suite les places libres et payez par carte ou PayPal. Vous recevez un code de réservation à montrer à l'embarquement. ${chiusura('fr')}`,
    cancellare: `Oui : si vous annulez au moins ${ore} heures avant, nous vous remboursons intégralement. Vous pouvez le faire vous-même depuis la page de la réservation (le lien est dans l'e-mail de confirmation) : le remboursement part tout de suite. Ou écrivez-nous sur WhatsApp avec le code de réservation. Ensuite, il n'y a pas de remboursement.`,
    buono: ['Peut-on offrir une excursion ?', "Oui, avec le bon cadeau : achetez-le en ligne sur la page Bon cadeau, choisissez le montant et recevez-le tout de suite par e-mail, à imprimer ou à transférer. La personne qui le reçoit choisit l'excursion, le jour et l'horaire et saisit le code en réservant."],
    attesa: ['Le jour souhaité est complet : que faire ?', "Inscrivez-vous sur la liste d'attente depuis la page Réserver : si une place se libère, nous vous écrivons par e-mail et vous réservez si vous le souhaitez."],
  },
  de: {
    prenotare: () => `Online auf der Seite Buchen: Wählen Sie Ausflug, Tag und Uhrzeit, sehen Sie sofort die freien Plätze und bezahlen Sie mit Karte oder PayPal. Sie erhalten einen Buchungscode für den Einstieg. ${chiusura('de')}`,
    cancellare: `Ja: Wenn Sie mindestens ${ore} Stunden vorher stornieren, erstatten wir Ihnen den vollen Betrag. Sie können das selbst auf der Seite der Buchung tun (der Link steht in der Bestätigungs-E-Mail): Die Rückerstattung wird sofort veranlasst. Oder schreiben Sie uns auf WhatsApp mit dem Buchungscode. Danach gibt es keine Rückerstattung.`,
    buono: ['Kann man einen Ausflug verschenken?', 'Ja, mit dem Geschenkgutschein: Kaufen Sie ihn online auf der Seite Geschenkgutschein, wählen Sie den Betrag und erhalten Sie ihn sofort per E-Mail, zum Ausdrucken oder Weiterleiten. Wer ihn bekommt, wählt Ausflug, Tag und Uhrzeit und gibt beim Buchen den Code ein.'],
    attesa: ['Mein Wunschtag ist ausgebucht: Was kann ich tun?', 'Setzen Sie sich auf der Seite Buchen auf die Warteliste: Wird ein Platz frei, schreiben wir Ihnen eine E-Mail und Sie buchen, wenn Sie möchten.'],
  },
};

// Le domande di una lingua, con le risposte "online" se la prenotazione è accesa. `pagamento` = sito.regole.pagamento.
export function faqConOnline(lingua, gruppi, pagamento) {
  const t = testi[lingua];
  if (!regole.attive || !t) return gruppi;
  const risposte = { prenotare: t.prenotare(), pagare: pagamento, cancellare: t.cancellare };
  return gruppi.map((g, i) => ({
    ...g,
    domande: [
      ...g.domande.map((d) => (risposte[d.id] ? { ...d, risposta: risposte[d.id], regola: undefined, mancante: undefined } : d)),
      ...(i === 0 ? [{ id: 'buono', domanda: t.buono[0], risposta: t.buono[1] }, { id: 'attesa', domanda: t.attesa[0], risposta: t.attesa[1] }] : []),
    ],
  }));
}
