// Francese: pagine dei punti di partenza (Palau, Cannigione). Orari, prezzi e moli dal listino e da sito.js.
import { cifra } from '../formato.js';
import { regole } from '../prenotazioni.js';
import { escursioni } from './escursioni.js';
import { sito } from './sito.js';
import { breve, escursioniDaImbarco, prezzoMinimo, honda, palauMattina, mezzaMattina, mezzaPomeriggio } from '../traduzioni.js';

const nomiTurni = { giornata: 'Journée entière', mattina: 'Matin', pomeriggio: 'Après-midi', tramonto: 'Au coucher du soleil' };
const nomiTurniPrivato = { giornata: 'Journée entière', mattina: 'Demi-journée, matin', pomeriggio: 'Demi-journée, après-midi', tramonto: 'Sunset, apéritif au coucher du soleil' };
const escursioniDa = (imbarco) => escursioniDaImbarco(escursioni, imbarco, nomiTurni, nomiTurniPrivato, 'départ entre 18h30 et 19h');
const daPalau = escursioniDa('palau');
const daCannigione = escursioniDa('cannigione');
const hondaFlotta = sito.flotta.find((f) => f.id === honda?.id);

export const pagineImbarco = [
  {
    id: 'palau',
    imbarco: 'Palau',
    href: '/fr/excursions-la-maddalena-depuis-palau/',
    titoloSeo: 'Excursions La Maddalena depuis Palau : bateau et prix',
    titoloPagina: 'Excursions La Maddalena depuis Palau',
    titoloElenco: 'Départ de La Maddalena, passage à Palau : horaires et prix',
    titoloDomande: 'Passage à Palau : les questions',
    titoloRichiesta: 'Embarquez à Palau : choisissez la date',
    briciola: 'Passage à Palau',
    descrizioneSeo: `Excursions La Maddalena avec passage à Palau : départ de La Maddalena, on vient vous chercher à Palau. Tour des îles, demi-journée, coucher de soleil, Corse. Dès ${cifra(prezzoMinimo(daPalau), 'fr')} €.`,
    breve: `Le semi-rigide part de La Maddalena et vient vous chercher à Palau à ${palauMattina} : pratique si vous arrivez d'Olbia ou logez en Gallura.`,
    intro: `Les excursions en semi-rigide avec skipper partent du port de La Maddalena. Pour ceux qui ne peuvent ou ne veulent pas y aller, le semi-rigide passe prendre les clients à Palau : le matin à ${palauMattina}, et au retour il vous ramène à Palau avant de rentrer à La Maddalena.`,
    perche: {
      titolo: 'Pourquoi embarquer à Palau',
      punti: [
        `Vous venez de plus loin, par exemple d'Olbia ? Avec le passage à ${palauMattina}, pas besoin de vous lever tôt et vous avez le temps de vous garer.`,
        'Pas de ferry pour La Maddalena : vous embarquez directement à Palau.',
        "Mêmes excursions et mêmes prix qu'en embarquant à La Maddalena.",
        `Rendez-vous ${regole.anticipoRitrovo.palau} minutes avant : à ${sito.imbarchi.palau.ritrovo} pour les sorties du matin. Nous vous confirmons l'heure exacte par message.`,
      ],
    },
    molo: sito.imbarchi.palau,
    escursioni: daPalau,
    nota: 'Pour les sorties en groupe, le semi-rigide part de La Maddalena et passe par Palau. En sortie privatisée (sortie privée et Corse), le semi-rigide part de La Maddalena ou vient vous chercher directement à Palau.',
    faq: ['palau', 'prezzi', 'pranzo', 'maestrale', 'pagare', 'cancellare', 'minimo', 'bambini'],
  },
  {
    id: 'cannigione',
    imbarco: 'Cannigione',
    href: '/fr/excursions-la-maddalena-depuis-cannigione/',
    titoloSeo: 'Excursions La Maddalena depuis Cannigione : prix',
    titoloPagina: 'Excursions La Maddalena depuis Cannigione',
    titoloElenco: 'Excursions en bateau depuis Cannigione : horaires et prix',
    titoloDomande: 'Excursions depuis Cannigione : les questions',
    titoloRichiesta: 'Excursion depuis Cannigione : choisissez la date',
    briciola: 'Depuis Cannigione',
    descrizioneSeo: `Excursions en bateau de Cannigione vers l'archipel de La Maddalena : demi-journée, apéritif au coucher du soleil et sortie privatisée avec skipper. Dès ${cifra(prezzoMinimo(daCannigione), 'fr')} €.`,
    breve: `De Cannigione part un semi-rigide dédié, le ${hondaFlotta?.modello ?? ''} : demi-journée, apéritif au coucher du soleil et sortie privatisée.`,
    intro: `Excursions en bateau de Cannigione vers l'archipel de La Maddalena, en semi-rigide avec skipper. De Cannigione part un semi-rigide dédié, le ${hondaFlotta?.modello ?? ''} : jusqu'à ${honda?.posti ?? ''} personnes, avec de l'ombre à bord et ${(hondaFlotta?.motori ?? '').replace(/^1 /, 'un ')} qui rejoint l'archipel sans perdre de temps.`,
    perche: {
      titolo: 'Partir de Cannigione',
      punti: [
        `Demi-journée le matin (${breve(mezzaMattina.orariImbarco.cannigione)}) ou l'après-midi (${breve(mezzaPomeriggio.orariImbarco.cannigione)}).`,
        'Mêmes prix que les départs de La Maddalena.',
        "Le Tour des 7 îles (le tour des îles) et l'excursion en Corse ne partent pas de Cannigione : pour ceux-ci, départ de La Maddalena, avec passage à Palau.",
        `Rendez-vous ${regole.anticipoRitrovo.cannigione} minutes avant : à ${sito.imbarchi.cannigione.ritrovo} pour les sorties du matin. Nous vous confirmons l'heure exacte par message.`,
      ],
    },
    molo: sito.imbarchi.cannigione,
    escursioni: daCannigione,
    nota: '',
    faq: ['prezzi', 'maestrale', 'pagare', 'cancellare', 'minimo', 'bambini'],
  },
];
