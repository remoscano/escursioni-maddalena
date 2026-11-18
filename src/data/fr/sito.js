// Francese: solo i TESTI di src/data/sito.js. Numeri, telefono, email, moli e link arrivano dal file italiano.
// Se cambia un testo italiano in sito.js, va cambiato anche qui. I valori vuoti ('') diventano segnaposto rosa.
import { sito as it } from '../sito.js';
import { sitoTradotto } from '../traduzioni.js';

const testi = {
  contatti: { orariRisposta: 'tous les jours de 7h30 à 22h30, du 1er mai au 31 octobre' },
  imbarchi: { palau: { parcheggio: '' } }, // dove parcheggiare a Palau: da tradurre quando arriva il testo italiano
  partenze: {
    breve: 'La Maddalena (passage à Palau) et Cannigione',
    frase: 'départ de La Maddalena, avec passage à Palau, et de Cannigione',
    seo: 'de La Maddalena (passage à Palau) et Cannigione',
  },
  gommone: {
    descrizione: "Des semi-rigides grands et stables, avec le skipper toujours à bord : vous rejoignez les plus belles criques sans effort et profitez de la mer en toute sécurité. De l'ombre à bord et 12 personnes au maximum : l'espace idéal pour les familles avec enfants et les groupes d'amis.",
  },
  pranzo7: {
    breve: 'Déjeuner libre à La Maddalena',
    testo: `Nous arrivons au port de La Maddalena avant ${it.pranzo7.arrivo}, pour trouver une table et déjeuner tranquillement : nous repartons à ${it.pranzo7.ripartenza}. Si vous le souhaitez, notre skipper, né à La Maddalena, vous accompagne chez ses amis restaurateurs partenaires, qui servent la cuisine typique de l'île à des tarifs transparents et honnêtes. Vous pouvez aussi apporter votre pique-nique.`,
    nonIncluso: 'Déjeuner : libre à La Maddalena, dans nos restaurants partenaires (tarifs transparents et honnêtes) ou pique-nique',
  },
  tagliere: 'Planche de saucisse et fromage sardes, ou brochettes de fruits',
  pagamentoLink: {
    breve: 'Vous payez après la confirmation, avec le lien que nous vous envoyons',
    testo: 'Dès que nous confirmons la disponibilité sur WhatsApp, nous vous envoyons un lien pour payer en ligne, par carte (SumUp) ou avec PayPal.',
  },
  carburante: 'selon la consommation. Au départ nous vous montrons le réservoir plein ; au retour nous calculons ensemble les litres consommés, que vous payez à bord à la fin de la sortie',
  notaOrariEsclusiva: "Les horaires sont indicatifs : si besoin, demandez-nous une petite modification au moment de réserver.",
  skipper: { nome: '', descrizione: '' },
  cosaPortare: [
    'Maillot de bain, serviette et vêtements de rechange',
    'Crème solaire, chapeau et lunettes de soleil',
    "L'envie de vous amuser et de passer une journée inoubliable",
  ],
  regole: {
    maltempo: "Si la mer ou le vent ne sont pas sûrs, nous annulons et vous choisissez : remboursement intégral ou une autre date.",
    ticketParco: 'Oui, il est inclus dans le prix de toutes les excursions.',
    pagamento: 'En ligne au moment de la réservation, par carte ou PayPal. Pour les sorties privatisées, le carburant est en supplément.',
    bambini: "Oui, à tout âge. Jusqu'à 10 ans ils paient le tarif réduit. À bord, les gilets de sauvetage sont obligatoires mais ils sont en taille adulte : pour plus de tranquillité, apportez un gilet à la taille de vos enfants.",
    animali: 'Non, les animaux ne sont pas admis à bord.',
  },
};

const flotta = {
  'gruppo-1': { motori: '2 moteurs Suzuki de 200 ch', dotazioni: 'toilettes, T-top', descrizione: "Le semi-rigide de nos sorties en groupe : 8,5 mètres, un grand bain de soleil à l'avant et une banquette en U à l'arrière, où l'on est à l'aise même à douze. L'ombre du T-top et des toilettes à bord." },
  'gruppo-2': { motori: '2 moteurs Mercury de 250 ch', dotazioni: 'toilettes, cabine, T-top', descrizione: "Plus spacieux, avec cabine et toilettes sous le pont : pratique pour se changer tranquillement après la baignade. À l'avant, le bain de soleil ; le T-top fait de l'ombre pendant la navigation." },
  esclusiva: { motori: '2 moteurs Suzuki de 300 ch', dotazioni: 'cabine, toilettes, ombre', descrizione: "Le plus grand de la flotte, plus de 10 mètres, réservé aux sorties privatisées de 6 personnes au maximum : de la place pour tous. Cabine avec lit double, toilettes séparées et un bain de soleil à l'avant où plus de quatre personnes s'allongent." },
  cannigione: { motori: '1 moteur Honda de 350 ch', dotazioni: 'T-top', descrizione: "Le semi-rigide des départs de Cannigione, avec un moteur Honda de 350 ch : il rejoint l'archipel sans perdre de temps. Jusqu'à 12 personnes, avec de l'ombre à bord." },
};

export const sito = sitoTradotto(testi, flotta);
