// Tedesco: pagine dei punti di partenza (Palau, Cannigione). Orari, prezzi e moli dal listino e da sito.js.
import { regole } from '../prenotazioni.js';
import { escursioni } from './escursioni.js';
import { sito } from './sito.js';
import { breve, escursioniDaImbarco, prezzoMinimo, honda, palauMattina, mezzaMattina, mezzaPomeriggio } from '../traduzioni.js';

const nomiTurni = { giornata: 'Ganzer Tag', mattina: 'Vormittag', pomeriggio: 'Nachmittag', tramonto: 'Bei Sonnenuntergang' };
const nomiTurniPrivato = { giornata: 'Ganzer Tag', mattina: 'Halber Tag, Vormittag', pomeriggio: 'Halber Tag, Nachmittag', tramonto: 'Sunset, Aperitif bei Sonnenuntergang' };
const escursioniDa = (imbarco) => escursioniDaImbarco(escursioni, imbarco, nomiTurni, nomiTurniPrivato, 'Abfahrt zwischen 18:30 und 19:00 Uhr');
const daPalau = escursioniDa('palau');
const daCannigione = escursioniDa('cannigione');
const hondaFlotta = sito.flotta.find((f) => f.id === honda?.id);

export const pagineImbarco = [
  {
    id: 'palau',
    imbarco: 'Palau',
    href: '/de/bootstouren-la-maddalena-ab-palau/',
    titoloSeo: 'Bootstouren La Maddalena ab Palau: Ausflüge und Preise',
    titoloPagina: 'Bootstouren La Maddalena ab Palau',
    titoloElenco: 'Abfahrt in La Maddalena, Zustieg in Palau: Zeiten und Preise',
    titoloDomande: 'Zustieg in Palau: Fragen',
    titoloRichiesta: 'In Palau einsteigen: Datum wählen',
    briciola: 'Zustieg in Palau',
    descrizioneSeo: `Bootstouren La Maddalena mit Zustieg in Palau: Start in La Maddalena, wir holen Sie in Palau ab. Inselrundfahrt, Halbtagestour, Sonnenuntergang, Korsika. Ab ${prezzoMinimo(daPalau)} €.`,
    breve: `Das Boot startet in La Maddalena und holt Sie um ${palauMattina} Uhr in Palau ab: praktisch, wenn Sie aus Olbia kommen oder in der Gallura wohnen.`,
    intro: `Unsere Bootstouren mit Skipper starten im Hafen von La Maddalena. Für alle, die nicht dorthin kommen können oder wollen, holt das Boot die Gäste in Palau ab: morgens um ${palauMattina} Uhr, und auf dem Rückweg bringt es Sie nach Palau, bevor es nach La Maddalena zurückfährt.`,
    perche: {
      titolo: 'Warum in Palau einsteigen',
      punti: [
        `Sie kommen von weiter her, zum Beispiel aus Olbia? Mit dem Zustieg um ${palauMattina} Uhr müssen Sie nicht früh aufstehen und haben Zeit zum Parken.`,
        'Keine Fähre nach La Maddalena: Sie steigen direkt in Palau ein.',
        'Dieselben Ausflüge und dieselben Preise wie beim Einstieg in La Maddalena.',
        `Treffpunkt ${regole.anticipoRitrovo.palau} Minuten vorher: um ${sito.imbarchi.palau.ritrovo} Uhr bei den Vormittagsausflügen. Die genaue Uhrzeit bestätigen wir Ihnen per Nachricht.`,
      ],
    },
    molo: sito.imbarchi.palau,
    escursioni: daPalau,
    nota: 'Bei Gruppenausflügen startet das Boot in La Maddalena und hält in Palau. Bei Privattouren (private Bootstour und Korsika) startet das Boot in La Maddalena oder holt Sie direkt in Palau ab.',
    faq: ['palau', 'prezzi', 'pranzo', 'maestrale', 'pagare', 'cancellare', 'minimo', 'bambini'],
  },
  {
    id: 'cannigione',
    imbarco: 'Cannigione',
    href: '/de/bootstouren-la-maddalena-ab-cannigione/',
    titoloSeo: 'Bootstouren La Maddalena ab Cannigione: Preise',
    titoloPagina: 'Bootstouren La Maddalena ab Cannigione',
    titoloElenco: 'Bootsausflüge ab Cannigione: Zeiten und Preise',
    titoloDomande: 'Ausflüge ab Cannigione: Fragen',
    titoloRichiesta: 'Ausflug ab Cannigione: Datum wählen',
    briciola: 'Ab Cannigione',
    descrizioneSeo: `Bootsausflüge ab Cannigione in den La-Maddalena-Archipel: Halbtagestour, Aperitif bei Sonnenuntergang und Boot mit Skipper, ab dem Pontile La Sciumara. Ab ${prezzoMinimo(daCannigione)} €.`,
    breve: `Ab Cannigione fährt ein eigenes Boot, die ${hondaFlotta?.modello ?? ''}: Halbtagestour, Aperitif bei Sonnenuntergang und Privattour.`,
    intro: `Bootsausflüge ab Cannigione in den La-Maddalena-Archipel, im Schlauchboot mit Skipper. Ab Cannigione fährt ein eigenes Boot, die ${hondaFlotta?.modello ?? ''}: bis zu ${honda?.posti ?? ''} Personen, mit Schatten an Bord und ${(hondaFlotta?.motori ?? '').replace(/^1 /, 'einem ').replace('Honda-Motor', 'Honda-Motor')}, der den Archipel ohne Zeitverlust erreicht.`,
    perche: {
      titolo: 'Ab Cannigione starten',
      punti: [
        `Halbtagestour am Vormittag (${breve(mezzaMattina.orariImbarco.cannigione)}) oder am Nachmittag (${breve(mezzaPomeriggio.orariImbarco.cannigione)}).`,
        'Dieselben Preise wie bei Abfahrten ab La Maddalena.',
        'Die 7-Inseln-Tour (Inselrundfahrt) und der Korsika-Ausflug starten nicht in Cannigione: Dafür geht es ab La Maddalena los, mit Zustieg in Palau.',
        `Treffpunkt ${regole.anticipoRitrovo.cannigione} Minuten vorher: um ${sito.imbarchi.cannigione.ritrovo} Uhr bei den Vormittagsausflügen. Die genaue Uhrzeit bestätigen wir Ihnen per Nachricht.`,
      ],
    },
    molo: sito.imbarchi.cannigione,
    escursioni: daCannigione,
    nota: '',
    faq: ['prezzi', 'maestrale', 'pagare', 'cancellare', 'minimo', 'bambini'],
  },
];
