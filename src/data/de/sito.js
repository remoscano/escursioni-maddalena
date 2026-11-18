// Tedesco: solo i TESTI di src/data/sito.js. Numeri, telefono, email, moli e link arrivano dal file italiano.
// Se cambia un testo italiano in sito.js, va cambiato anche qui. I valori vuoti ('') diventano segnaposto rosa.
import { sito as it } from '../sito.js';
import { sitoTradotto } from '../traduzioni.js';

const testi = {
  contatti: { orariRisposta: 'täglich von 7:30 bis 22:30 Uhr, vom 1. Mai bis 31. Oktober' },
  imbarchi: { palau: { parcheggio: '' } }, // dove parcheggiare a Palau: da tradurre quando arriva il testo italiano
  partenze: {
    breve: 'La Maddalena (Zustieg in Palau) und Cannigione',
    frase: 'Abfahrt ab La Maddalena, mit Zustieg in Palau, und ab Cannigione',
    seo: 'ab La Maddalena (Zustieg in Palau) und Cannigione',
  },
  gommone: {
    descrizione: 'Große, stabile Schlauchboote, immer mit Skipper an Bord: Sie erreichen die schönsten Buchten ganz bequem und genießen das Meer in Sicherheit. Schatten an Bord und höchstens 12 Personen: genau der richtige Platz für Familien mit Kindern und Freundesgruppen.',
  },
  pranzo7: {
    breve: 'Freie Mittagspause in La Maddalena',
    testo: `Wir sind spätestens um ${it.pranzo7.arrivo} Uhr im Hafen von La Maddalena, so finden Sie einen Tisch und essen in Ruhe: Um ${it.pranzo7.ripartenza} Uhr geht es weiter. Wenn Sie möchten, begleitet Sie unser Skipper, ein echter Maddalener, in die Restaurants seiner Freunde, die mit uns zusammenarbeiten: typische Küche der Insel zu transparenten und fairen Preisen. Oder Sie bringen Ihr eigenes Picknick mit.`,
    nonIncluso: 'Mittagessen: frei in La Maddalena, in unseren Partnerrestaurants (transparente und faire Preise) oder Picknick',
  },
  tagliere: 'Brettchen mit sardischer Wurst und Käse oder Obstspieße',
  pagamentoLink: {
    breve: 'Sie zahlen nach der Bestätigung, mit dem Link, den wir Ihnen schicken',
    testo: 'Sobald wir die Verfügbarkeit auf WhatsApp bestätigen, schicken wir Ihnen einen Link zur Online-Zahlung, per Karte (SumUp) oder mit PayPal.',
  },
  carburante: 'nach Verbrauch. Bei der Abfahrt zeigen wir Ihnen den vollen Tank; bei der Rückkehr berechnen wir gemeinsam die verbrauchten Liter, die Sie am Ende der Fahrt an Bord bezahlen',
  notaOrariEsclusiva: 'Die Zeiten sind Richtwerte: Wenn nötig, fragen Sie bei der Buchung nach einer kleinen Änderung.',
  skipper: { nome: '', descrizione: '' },
  cosaPortare: [
    'Badesachen, Handtuch und Wechselkleidung',
    'Sonnencreme, Hut und Sonnenbrille',
    'Lust auf Spaß und einen unvergesslichen Tag',
  ],
  regole: {
    maltempo: 'Wenn Meer oder Wind nicht sicher sind, sagen wir die Fahrt ab und Sie wählen: volle Rückerstattung oder ein anderes Datum.',
    ticketParco: 'Ja, sie ist im Preis aller Ausflüge enthalten.',
    pagamento: 'Online bei der Buchung, per Karte oder PayPal. Bei Privattouren wird der Treibstoff extra berechnet.',
    bambini: 'Ja, in jedem Alter. Bis 10 Jahre gilt der ermäßigte Preis. Schwimmwesten sind an Bord Pflicht, aber in Erwachsenengröße: Wenn Sie ganz sicher sein wollen, bringen Sie eine Schwimmweste in der Größe Ihrer Kinder mit.',
    animali: 'Nein, Tiere sind an Bord nicht erlaubt.',
  },
};

const flotta = {
  'gruppo-1': { motori: '2 Suzuki-Motoren mit je 200 PS', dotazioni: 'Toilette, T-Top', descrizione: 'Das Boot für unsere Gruppenausflüge: 8,5 Meter, eine große Liegefläche am Bug und ein U-Sofa am Heck, wo man auch zu zwölft bequem sitzt. Schatten unter dem T-Top und Toilette an Bord.' },
  'gruppo-2': { motori: '2 Mercury-Motoren mit je 250 PS', dotazioni: 'Toilette, Kabine, T-Top', descrizione: 'Geräumiger, mit Kabine und Toilette unter Deck: praktisch, um sich nach dem Baden in Ruhe umzuziehen. Am Bug die Liegefläche, das T-Top spendet während der Fahrt Schatten.' },
  esclusiva: { motori: '2 Suzuki-Motoren mit je 300 PS', dotazioni: 'Kabine, Toilette, Schatten', descrizione: 'Das größte Boot der Flotte, über 10 Meter, reserviert für Privattouren mit höchstens 6 Personen: Platz für alle. Kabine mit Doppelbett, separate Toilette und eine Liegefläche am Bug, auf der mehr als vier Personen liegen können.' },
  cannigione: { motori: '1 Honda-Motor mit 350 PS', dotazioni: 'T-Top', descrizione: 'Das Boot für Abfahrten ab Cannigione, mit einem Honda-Motor mit 350 PS: Es erreicht den Archipel ohne Zeitverlust. Bis zu 12 Personen, mit Schatten an Bord.' },
};

export const sito = sitoTradotto(testi, flotta);
