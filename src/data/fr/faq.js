// Francese: domande frequenti (stessi id dell'italiano). La prenotazione online per ora è solo in italiano:
// qui si spiega la prenotazione su WhatsApp. Prezzi dal listino unico.
import { prezzoDa, regole } from '../prenotazioni.js';
import { palauMattina, minimoGruppo } from '../traduzioni.js';
import { sito } from './sito.js';

const p7 = prezzoDa('tour-7-isole'), pM = prezzoDa('mezza-giornata'), pT = prezzoDa('tramonto'), pP = prezzoDa('tour-privato'), pC = prezzoDa('corsica');

export const faq = [
  {
    gruppo: 'Réservation et paiement',
    domande: [
      { id: 'prenotare', domanda: 'Comment réserver ?', risposta: `Par un message WhatsApp : sur la page Demande, choisissez l'excursion, le jour, le nombre de personnes et le lieu d'embarquement, et le message est prêt à envoyer. Nous vous répondons avec la disponibilité et l'heure du rendez-vous. ${sito.pagamentoLink.testo}` },
      { id: 'pagare', domanda: 'Comment payer ?', risposta: `${sito.pagamentoLink.testo} Pour les sorties privatisées, le carburant est en supplément : ${sito.carburante}.` },
      { id: 'prezzi', domanda: "Combien coûte une excursion à La Maddalena ?", risposta: `Pour les sorties en groupe : excursion à la demi-journée à partir de ${pM.adulto} € par personne, le tour des îles (Tour des 7 îles) à partir de ${p7.adulto} €, apéritif au coucher du soleil à partir de ${pT.adulto} €. Jusqu'à 10 ans, tarif réduit (à partir de ${pM.bambino} € pour la demi-journée). Le semi-rigide privatisé avec skipper coûte à partir de ${pP.barca} € (Corse à partir de ${pC.barca} €), carburant en supplément. Les prix varient selon la période de la saison.` },
      { id: 'palau', domanda: 'Peut-on embarquer à Palau ?', risposta: `Oui. Pour les sorties en groupe, le semi-rigide part du port de La Maddalena et passe prendre ceux qui embarquent à Palau : le matin à ${palauMattina}, et au retour il vous y dépose avant de rentrer à La Maddalena. C'est un service en plus pour ceux qui ne peuvent ou ne veulent pas venir jusqu'à La Maddalena. En sortie privatisée (sortie privée et Corse), le semi-rigide peut venir vous chercher directement à Palau. Le prix est le même.` },
      { id: 'cancellare', domanda: 'Puis-je annuler ma réservation ?', risposta: `Oui : si vous annulez au moins ${regole.cancellazioneGratisOre} heures avant, nous vous remboursons intégralement. Écrivez-nous sur WhatsApp. Ensuite, aucun remboursement n'est prévu.` },
      { id: 'minimo', domanda: "Et si le nombre minimum n'est pas atteint ?", risposta: `Les sorties en groupe partent avec au moins ${minimoGruppo} personnes. S'il n'est pas atteint la veille au soir, nous vous proposons une autre date ou une autre excursion, ou nous vous remboursons intégralement.` },
      { id: 'anticipo', domanda: "Combien de temps à l'avance faut-il réserver ?", risposta: "Le plus tôt possible : les places sont peu nombreuses, surtout à partir de fin juillet et pendant tout le mois d'août." },
    ],
  },
  {
    gruppo: 'Météo et annulations',
    domande: [
      { id: 'maestrale', domanda: 'Et si le mistral souffle ?', risposta: "L'itinéraire s'adapte au vent, en choisissant les criques les plus abritées. Si la mer ne le permet pas, nous vous prévenons sur WhatsApp.", regola: 'maltempo', mancante: 'Votre règle : remboursement ou changement de date' },
    ],
  },
  {
    gruppo: 'À bord',
    domande: [
      { id: 'pranzo', domanda: 'Le déjeuner est-il servi à bord ? Est-il inclus dans le Tour des 7 îles ?', risposta: `Non, le déjeuner n'est pas à bord et n'est pas inclus : il est libre, à La Maddalena. ${sito.pranzo7.testo}` },
      { id: 'bambini', domanda: 'Les enfants peuvent-ils venir ?', risposta: '', regola: 'bambini', mancante: 'Âge minimum, gilets pour enfants, tarif réduit' },
      { id: 'animali', domanda: 'Puis-je emmener mon chien ?', risposta: '', regola: 'animali', mancante: 'Votre règle sur les animaux à bord' },
      { id: 'portare', domanda: 'Que faut-il apporter ?', risposta: "Maillot de bain, serviette et vêtements de rechange, crème solaire, chapeau et lunettes de soleil. Si vous voulez faire du snorkeling, apportez masque et tuba : par hygiène nous n'en fournissons pas, même si nous en avons quelques-uns à bord. Pour les enfants, si vous le souhaitez, un gilet de sauvetage à leur taille. Les boissons, c'est nous : sur le Tour des 7 îles deux boissons en canette par personne et de l'eau, avec mirto et douceurs à la fin ; à la demi-journée eau et sodas ; au Sunset et en sortie privatisée prosecco et planche. Le reste de la nourriture est à votre charge : chaque excursion l'indique dans les listes « Inclus » et « Non inclus ». Et surtout, apportez l'envie de vous amuser et de passer une journée inoubliable." },
    ],
  },
  {
    gruppo: 'Parc national',
    domande: [
      { id: 'spiaggia-rosa', domanda: 'Peut-on se baigner à la Plage Rose ?', risposta: "Non. Pour la protéger, le Parc interdit d'y débarquer et de s'y baigner : nous l'admirons depuis la mer, juste avant l'arrêt à Porto della Madonna." },
      { id: 'ticket', domanda: "Le droit d'entrée du Parc est-il inclus ?", risposta: '', regola: 'ticketParco', mancante: 'Inclus ou en supplément ? Combien ?' },
    ],
  },
];
