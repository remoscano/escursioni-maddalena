// Pagine dei punti di partenza (16 novembre 2026): /escursioni-la-maddalena-da-palau/ e /escursioni-la-maddalena-da-cannigione/.
// Nate dalle ricerche su Google: "escursioni la maddalena da palau" e simili valgono più di 2.000 ricerche al mese.
// Orari, prezzi e moli arrivano da prenotazioni.js e sito.js: qui non si scrivono a mano.

import { offerte, gommoni } from './prenotazioni.js';
import { escursioni } from './escursioni.js';
import { sito } from './sito.js';

const breve = (o) => String(o).replace(' – ', '–');

// Escursioni che partono da un imbarco, con gli orari di quell'imbarco.
function escursioniDa(imbarco) {
  return escursioni
    .filter((e) => offerte[e.slug]?.imbarchi.includes(imbarco))
    .map((e) => {
      const turni = offerte[e.slug].turni.map((t) => {
        const orario = imbarco === 'maddalena' ? t.orario : t.orariImbarco?.[imbarco];
        return { nome: t.nome, orario: t.indicativo ? 'partenza tra le 18:30 e le 19:00' : orario ? breve(orario) : '' };
      });
      return { e, turni };
    });
}

const prezzoMinimo = (lista) => Math.min(...lista.filter((x) => !x.e.prezzoGommone).map((x) => Number(x.e.prezzoAdulti)));

const daPalau = escursioniDa('palau');
const daCannigione = escursioniDa('cannigione');
const honda = gommoni.find((g) => g.imbarchi.includes('cannigione') && g.imbarchi.length === 1);
const hondaFlotta = sito.flotta.find((f) => f.id === honda?.id);

export const pagineImbarco = [
  {
    id: 'palau',
    imbarco: 'Palau', // valore del modulo WhatsApp
    href: '/escursioni-la-maddalena-da-palau/',
    titoloSeo: 'Escursioni La Maddalena da Palau: gite in barca e prezzi',
    titoloPagina: 'Escursioni La Maddalena da Palau',
    // Palau è un passaggio: il gommone parte da La Maddalena e passa a prendere chi sale qui (Remo, 18 novembre 2026).
    titoloElenco: 'Partenza da La Maddalena, passaggio a Palau: orari e prezzi',
    titoloDomande: 'Passaggio a Palau: le domande',
    titoloRichiesta: 'Sali a bordo a Palau: scegli la data',
    briciola: 'Passaggio a Palau',
    descrizioneSeo: `Escursioni La Maddalena da Palau: il gommone parte da La Maddalena e passa a prenderti a Palau. Giro delle isole, mezza giornata, tramonto, Corsica. Da ${prezzoMinimo(daPalau)} €.`,
    breve: "Il gommone parte da La Maddalena e alle 11:00 passa a prenderti a Palau: comodo se arrivi da Olbia o dormi in Gallura.",
    intro: "Le escursioni in gommone con skipper partono dal porto di La Maddalena. Per chi non vuole o non può arrivare fin lì, il gommone passa a prendere i clienti a Palau: al mattino alle 11:00, e al ritorno ti riaccompagna a Palau prima di rientrare a La Maddalena.",
    perche: {
      titolo: 'Perché salire a bordo a Palau',
      punti: [
        "Arrivi da fuori, per esempio da Olbia? Con la partenza alle 11:00 non devi alzarti presto e hai il tempo di parcheggiare.",
        'Niente traghetto per La Maddalena: sali a bordo direttamente a Palau.',
        'Stesse escursioni e stessi prezzi di chi sale a bordo a La Maddalena.',
        `Ritrovo 15 minuti prima: alle ${sito.imbarchi.palau.ritrovo} per le uscite del mattino. L'orario esatto te lo confermiamo con un messaggio.`,
      ],
    },
    molo: sito.imbarchi.palau,
    escursioni: daPalau,
    nota: 'Nelle uscite di gruppo il gommone parte da La Maddalena e passa da Palau. In esclusiva (tour privato e Corsica) il gommone parte da La Maddalena oppure viene a prenderti direttamente a Palau.',
    faq: ['palau', 'prezzi', 'pranzo', 'maestrale', 'pagare', 'cancellare', 'minimo', 'bambini'],
  },
  {
    id: 'cannigione',
    imbarco: 'Cannigione',
    href: '/escursioni-la-maddalena-da-cannigione/',
    titoloSeo: 'Escursioni La Maddalena da Cannigione: gite in barca e prezzi',
    titoloPagina: 'Escursioni La Maddalena da Cannigione',
    titoloElenco: 'Escursioni in barca da Cannigione: orari e prezzi',
    titoloDomande: 'Escursioni da Cannigione: le domande',
    titoloRichiesta: 'Escursione da Cannigione: scegli la data',
    briciola: 'Da Cannigione',
    descrizioneSeo: `Escursioni in barca da Cannigione all'arcipelago di La Maddalena: mezza giornata, aperitivo al tramonto e gommone con skipper, dal Pontile La Sciumara. Da ${prezzoMinimo(daCannigione)} €.`,
    breve: `Da Cannigione parte un gommone tutto suo, l'${hondaFlotta?.modello ?? ''}: mezza giornata, aperitivo al tramonto e tour privato.`,
    intro: `Escursioni in barca da Cannigione all'arcipelago di La Maddalena, in gommone con skipper. Da Cannigione parte un gommone dedicato, l'${hondaFlotta?.modello ?? ''}: fino a ${honda?.posti ?? ''} persone, con l'ombra a bordo e un motore da ${(hondaFlotta?.motori ?? '').replace(/^1 motore Honda da /, '')} che arriva nell'arcipelago senza perdere tempo.`,
    perche: {
      titolo: 'Partire da Cannigione',
      punti: [
        `Mezza giornata la mattina (${breve(offerte['mezza-giornata'].turni[0].orariImbarco.cannigione)}) o il pomeriggio (${breve(offerte['mezza-giornata'].turni[1].orariImbarco.cannigione)}).`,
        'Stessi prezzi delle partenze da La Maddalena.',
        "Da Cannigione non partono il Tour delle 7 isole (il giro delle isole) né l'escursione in Corsica: per queste si parte da La Maddalena, con passaggio a Palau.",
        `Ritrovo 15 minuti prima: alle ${sito.imbarchi.cannigione.ritrovo} per le uscite del mattino. L'orario esatto te lo confermiamo con un messaggio.`,
      ],
    },
    molo: sito.imbarchi.cannigione,
    escursioni: daCannigione,
    nota: '',
    faq: ['prezzi', 'maestrale', 'pagare', 'cancellare', 'minimo', 'bambini'],
  },
];
