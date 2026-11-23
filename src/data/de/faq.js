// Tedesco: domande frequenti (stessi id dell'italiano). La prenotazione online per ora è solo in italiano:
// qui si spiega la prenotazione su WhatsApp. Prezzi dal listino unico.
import { cifra } from '../formato.js';
import { prezzoDa, regole } from '../prenotazioni.js';
import { palauMattina, minimoGruppo } from '../traduzioni.js';
import { sito } from './sito.js';
import { faqConOnline } from '../faq-online.js';

const p7 = prezzoDa('tour-7-isole'), pM = prezzoDa('mezza-giornata'), pT = prezzoDa('tramonto'), pP = prezzoDa('tour-privato'), pC = prezzoDa('corsica');

const gruppi = [
  {
    gruppo: 'Buchung und Zahlung',
    domande: [
      { id: 'prenotare', domanda: 'Wie buche ich?', risposta: `Mit einer WhatsApp-Nachricht: Auf der Seite Anfrage wählen Sie Ausflug, Tag, Personenzahl und Einstiegsort, und die Nachricht ist fertig zum Senden. Wir antworten mit der Verfügbarkeit und der Treffpunktzeit. ${sito.pagamentoLink.testo}` },
      { id: 'pagare', domanda: 'Wie bezahle ich?', risposta: `${sito.pagamentoLink.testo} Bei Privattouren wird der Treibstoff extra berechnet: ${sito.carburante}.` },
      { id: 'prezzi', domanda: 'Was kostet ein Bootsausflug in La Maddalena?', risposta: `Bei Gruppenausflügen: Halbtagestour ab ${cifra(pM.adulto, 'de')} € pro Person, die Inselrundfahrt (7-Inseln-Tour) ab ${cifra(p7.adulto, 'de')} €, Aperitif bei Sonnenuntergang ab ${cifra(pT.adulto, 'de')} €. Bis 10 Jahre gilt ein ermäßigter Preis (ab ${cifra(pM.bambino, 'de')} € bei der Halbtagestour). Das exklusive Boot mit Skipper kostet ab ${cifra(pP.barca, 'de')} € (Korsika ab ${cifra(pC.barca, 'de')} €), Treibstoff extra. Die Preise ändern sich je nach Zeitraum der Saison.` },
      { id: 'palau', domanda: 'Kann ich in Palau einsteigen?', risposta: `Ja. Bei Gruppenausflügen startet das Boot im Hafen von La Maddalena und holt die Gäste in Palau ab: morgens um ${palauMattina} Uhr, und auf dem Rückweg bringt es Sie dorthin zurück, bevor es nach La Maddalena fährt. Das ist ein zusätzlicher Service für alle, die nicht nach La Maddalena kommen können oder wollen. Bei Privattouren (private Bootstour und Korsika) kann das Boot Sie direkt in Palau abholen. Der Preis ist derselbe.` },
      { id: 'cancellare', domanda: 'Kann ich meine Buchung stornieren?', risposta: `Ja: Wenn Sie mindestens ${regole.cancellazioneGratisOre} Stunden vorher stornieren, erstatten wir den vollen Betrag. Schreiben Sie uns auf WhatsApp. Danach ist keine Erstattung vorgesehen.` },
      { id: 'minimo', domanda: 'Und wenn die Mindestteilnehmerzahl nicht erreicht wird?', risposta: `Gruppenausflüge finden ab ${minimoGruppo} Personen statt. Wird diese Zahl am Vorabend nicht erreicht, schlagen wir Ihnen ein anderes Datum oder einen anderen Ausflug vor oder erstatten den vollen Betrag.` },
      { id: 'anticipo', domanda: 'Wie früh sollte ich buchen?', risposta: 'So früh wie möglich: Die Plätze sind begrenzt, vor allem ab Ende Juli und im ganzen August.' },
    ],
  },
  {
    gruppo: 'Wetter und Stornierung',
    domande: [
      { id: 'maestrale', domanda: 'Und wenn der Mistral weht?', risposta: 'Die Route passt sich dem Wind an und führt zu den geschütztesten Buchten. Wenn das Meer es nicht erlaubt, sagen wir Ihnen auf WhatsApp Bescheid.', regola: 'maltempo', mancante: 'Ihre Regel: Erstattung oder neues Datum' },
    ],
  },
  {
    gruppo: 'An Bord',
    domande: [
      { id: 'pranzo', domanda: 'Gibt es Mittagessen an Bord? Ist es in der 7-Inseln-Tour enthalten?', risposta: `Nein, das Mittagessen ist nicht an Bord und nicht enthalten: Es gibt eine freie Mittagspause in La Maddalena. ${sito.pranzo7.testo}` },
      { id: 'bambini', domanda: 'Können Kinder mitkommen?', risposta: '', regola: 'bambini', mancante: 'Mindestalter, Schwimmwesten für Kinder, ermäßigter Preis' },
      { id: 'animali', domanda: 'Darf ich meinen Hund mitbringen?', risposta: '', regola: 'animali', mancante: 'Ihre Regel zu Tieren an Bord' },
      { id: 'portare', domanda: 'Was soll ich mitbringen?', risposta: 'Badesachen, Handtuch und Wechselkleidung, Sonnencreme, Hut und Sonnenbrille. Wenn Sie schnorcheln möchten, bringen Sie Taucherbrille und Schnorchel mit: Aus hygienischen Gründen stellen wir keine zur Verfügung, ein paar haben wir aber an Bord. Für Kinder, wenn Sie möchten, eine Schwimmweste in ihrer Größe. Um die Getränke kümmern wir uns: bei der 7-Inseln-Tour zwei Dosengetränke pro Person und Wasser, mit Mirto und Gebäck zum Schluss; bei der Halbtagestour Wasser und Softdrinks; beim Sunset und bei Privattouren Prosecco und ein Brettchen. Weiteres Essen bringen Sie selbst mit: Jeder Ausflug zeigt es in den Listen „Inklusive“ und „Nicht inklusive“. Und vor allem: Bringen Sie Lust auf Spaß und einen unvergesslichen Tag mit.' },
    ],
  },
  {
    gruppo: 'Nationalpark',
    domande: [
      { id: 'spiaggia-rosa', domanda: 'Kann man am Rosa Strand baden?', risposta: 'Nein. Zu seinem Schutz verbietet der Nationalpark Anlanden und Baden: Wir bewundern ihn vom Meer aus, kurz vor dem Stopp in Porto della Madonna.' },
      { id: 'ticket', domanda: 'Ist die Nationalparkgebühr enthalten?', risposta: '', regola: 'ticketParco', mancante: 'Inklusive oder extra? Wie viel?' },
    ],
  },
];

// Con la prenotazione online accesa cambiano alcune risposte, come in italiano (src/data/faq-online.js).
export const faq = faqConOnline('de', gruppi, sito.regole.pagamento);
