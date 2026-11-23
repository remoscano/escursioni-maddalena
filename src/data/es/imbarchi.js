// Spagnolo: pagine dei punti di partenza (Palau, Cannigione). Orari, prezzi e moli dal listino e da sito.js.
import { cifra } from '../formato.js';
import { regole } from '../prenotazioni.js';
import { escursioni } from './escursioni.js';
import { sito } from './sito.js';
import { breve, escursioniDaImbarco, prezzoMinimo, honda, palauMattina, mezzaMattina, mezzaPomeriggio } from '../traduzioni.js';

const nomiTurni = { giornata: 'Día completo', mattina: 'Mañana', pomeriggio: 'Tarde', tramonto: 'Al atardecer' };
const nomiTurniPrivato = { giornata: 'Día completo', mattina: 'Medio día, mañana', pomeriggio: 'Medio día, tarde', tramonto: 'Sunset, aperitivo al atardecer' };
const escursioniDa = (imbarco) => escursioniDaImbarco(escursioni, imbarco, nomiTurni, nomiTurniPrivato, 'salida entre las 18:30 y las 19:00');
const daPalau = escursioniDa('palau');
const daCannigione = escursioniDa('cannigione');
const hondaFlotta = sito.flotta.find((f) => f.id === honda?.id);

export const pagineImbarco = [
  {
    id: 'palau',
    imbarco: 'Palau',
    href: '/es/excursiones-la-maddalena-desde-palau/',
    titoloSeo: 'Excursiones La Maddalena desde Palau: barco y precios',
    titoloPagina: 'Excursiones La Maddalena desde Palau',
    titoloElenco: 'Salida desde La Maddalena, recogida en Palau: horarios y precios',
    titoloDomande: 'Recogida en Palau: preguntas',
    titoloRichiesta: 'Embarca en Palau: elige la fecha',
    briciola: 'Recogida en Palau',
    descrizioneSeo: `Excursiones La Maddalena con recogida en Palau: la neumática sale de La Maddalena y te recoge en Palau. Vuelta a las islas, medio día, atardecer, Córcega. Desde ${cifra(prezzoMinimo(daPalau), 'es')} €.`,
    breve: `La neumática sale de La Maddalena y a las ${palauMattina} te recoge en Palau: cómodo si llegas desde Olbia o te alojas en Gallura.`,
    intro: `Las excursiones en neumática con patrón salen del puerto de La Maddalena. Para quien no quiere o no puede llegar hasta allí, la neumática recoge a los clientes en Palau: por la mañana a las ${palauMattina}, y a la vuelta te deja en Palau antes de regresar a La Maddalena.`,
    perche: {
      titolo: 'Por qué embarcar en Palau',
      punti: [
        `¿Llegas desde fuera, por ejemplo desde Olbia? Con la recogida a las ${palauMattina} no tienes que madrugar y tienes tiempo para aparcar.`,
        'Sin ferry a La Maddalena: embarcas directamente en Palau.',
        'Mismas excursiones y mismos precios que embarcando en La Maddalena.',
        `Encuentro ${regole.anticipoRitrovo.palau} minutos antes: a las ${sito.imbarchi.palau.ritrovo} en las salidas de la mañana. La hora exacta te la confirmamos con un mensaje.`,
      ],
    },
    molo: sito.imbarchi.palau,
    escursioni: daPalau,
    nota: 'En las salidas en grupo la neumática sale de La Maddalena y pasa por Palau. En exclusiva (tour privado y Córcega) la neumática sale de La Maddalena o te recoge directamente en Palau.',
    faq: ['palau', 'prezzi', 'pranzo', 'maestrale', 'pagare', 'cancellare', 'minimo', 'bambini'],
  },
  {
    id: 'cannigione',
    imbarco: 'Cannigione',
    href: '/es/excursiones-la-maddalena-desde-cannigione/',
    titoloSeo: 'Excursiones La Maddalena desde Cannigione: precios',
    titoloPagina: 'Excursiones La Maddalena desde Cannigione',
    titoloElenco: 'Excursiones en barco desde Cannigione: horarios y precios',
    titoloDomande: 'Excursiones desde Cannigione: preguntas',
    titoloRichiesta: 'Excursión desde Cannigione: elige la fecha',
    briciola: 'Desde Cannigione',
    descrizioneSeo: `Excursiones en barco desde Cannigione al archipiélago de La Maddalena: medio día, aperitivo al atardecer y neumática con patrón, Desde ${cifra(prezzoMinimo(daCannigione), 'es')} €.`,
    breve: `Desde Cannigione sale una neumática propia, la ${hondaFlotta?.modello ?? ''}: medio día, aperitivo al atardecer y tour privado.`,
    intro: `Excursiones en barco desde Cannigione al archipiélago de La Maddalena, en neumática con patrón. Desde Cannigione sale una neumática dedicada, la ${hondaFlotta?.modello ?? ''}: hasta ${honda?.posti ?? ''} personas, con sombra a bordo y ${(hondaFlotta?.motori ?? '').replace(/^1 /, 'un ')} que llega al archipiélago sin perder tiempo.`,
    perche: {
      titolo: 'Salir desde Cannigione',
      punti: [
        `Medio día por la mañana (${breve(mezzaMattina.orariImbarco.cannigione)}) o por la tarde (${breve(mezzaPomeriggio.orariImbarco.cannigione)}).`,
        'Mismos precios que las salidas desde La Maddalena.',
        'Desde Cannigione no salen el Tour de las 7 islas (la vuelta a las islas) ni la excursión a Córcega: para estas se sale desde La Maddalena, con recogida en Palau.',
        `Encuentro ${regole.anticipoRitrovo.cannigione} minutos antes: a las ${sito.imbarchi.cannigione.ritrovo} en las salidas de la mañana. La hora exacta te la confirmamos con un mensaje.`,
      ],
    },
    molo: sito.imbarchi.cannigione,
    escursioni: daCannigione,
    nota: '',
    faq: ['prezzi', 'maestrale', 'pagare', 'cancellare', 'minimo', 'bambini'],
  },
];
