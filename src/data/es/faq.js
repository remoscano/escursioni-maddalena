// Spagnolo: domande frequenti (stessi id dell'italiano). La prenotazione online per ora è solo in italiano:
// qui si spiega la prenotazione su WhatsApp. Prezzi dal listino unico.
import { cifra } from '../formato.js';
import { prezzoDa, regole } from '../prenotazioni.js';
import { palauMattina, minimoGruppo } from '../traduzioni.js';
import { sito } from './sito.js';
import { faqConOnline } from '../faq-online.js';

const p7 = prezzoDa('tour-7-isole'), pM = prezzoDa('mezza-giornata'), pT = prezzoDa('tramonto'), pP = prezzoDa('tour-privato'), pC = prezzoDa('corsica');

const gruppi = [
  {
    gruppo: 'Reserva y pago',
    domande: [
      { id: 'prenotare', domanda: '¿Cómo se reserva?', risposta: `Con un mensaje de WhatsApp: en la página Solicitud eliges excursión, día, número de personas y punto de embarque, y el mensaje ya está listo para enviar. Te respondemos con la disponibilidad y la hora de encuentro. ${sito.pagamentoLink.testo}` },
      { id: 'pagare', domanda: '¿Cómo se paga?', risposta: `${sito.pagamentoLink.testo} En las excursiones privadas el combustible se paga aparte: ${sito.carburante}.` },
      { id: 'prezzi', domanda: '¿Cuánto cuesta una excursión en La Maddalena?', risposta: `En las salidas en grupo: excursión de medio día desde ${cifra(pM.adulto, 'es')} € por persona, la vuelta a las islas (Tour de las 7 islas) desde ${cifra(p7.adulto, 'es')} €, aperitivo al atardecer desde ${cifra(pT.adulto, 'es')} €. Hasta los 10 años hay tarifa reducida (desde ${cifra(pM.bambino, 'es')} € en el medio día). La neumática con patrón en exclusiva cuesta desde ${cifra(pP.barca, 'es')} € (Córcega desde ${cifra(pC.barca, 'es')} €), con el combustible aparte. Los precios cambian según el periodo de la temporada.` },
      { id: 'palau', domanda: '¿Se puede embarcar en Palau?', risposta: `Sí. En las salidas en grupo la neumática sale del puerto de La Maddalena y recoge a quien embarca en Palau: por la mañana a las ${palauMattina}, y a la vuelta te deja allí antes de regresar a La Maddalena. Es un servicio extra para quien no quiere o no puede llegar a La Maddalena. En exclusiva (tour privado y Córcega) la neumática puede recogerte directamente en Palau. El precio es el mismo.` },
      { id: 'cancellare', domanda: '¿Puedo cancelar la reserva?', risposta: `Sí: si cancelas al menos ${regole.cancellazioneGratisOre} horas antes, te devolvemos el importe completo. Escríbenos por WhatsApp. Después no hay reembolso.` },
      { id: 'minimo', domanda: '¿Y si no se llega al número mínimo?', risposta: `Las salidas en grupo se hacen con al menos ${minimoGruppo} personas. Si la tarde anterior no se alcanzan, te proponemos otra fecha u otro tour, o te devolvemos el importe completo.` },
      { id: 'anticipo', domanda: '¿Con cuánta antelación conviene reservar?', risposta: 'Cuanto antes: las plazas son pocas, sobre todo desde finales de julio y durante todo agosto.' },
    ],
  },
  {
    gruppo: 'Tiempo y cancelaciones',
    domande: [
      { id: 'maestrale', domanda: '¿Y si sopla el mistral?', risposta: 'La ruta se adapta al viento, eligiendo las calas más resguardadas. Si el mar no lo permite, te avisamos por WhatsApp.', regola: 'maltempo', mancante: 'Vuestra regla: reembolso o cambio de fecha' },
    ],
  },
  {
    gruppo: 'A bordo',
    domande: [
      { id: 'pranzo', domanda: '¿La comida es a bordo? ¿Está incluida en el Tour de las 7 islas?', risposta: `No, la comida no es a bordo ni está incluida: es libre, en La Maddalena. ${sito.pranzo7.testo}` },
      { id: 'bambini', domanda: '¿Pueden venir niños?', risposta: '', regola: 'bambini', mancante: 'Edad mínima, chalecos para niños, tarifa reducida' },
      { id: 'animali', domanda: '¿Puedo llevar a mi perro?', risposta: '', regola: 'animali', mancante: 'Vuestra regla sobre animales a bordo' },
      { id: 'portare', domanda: '¿Qué tengo que llevar?', risposta: 'Bañador, toalla y ropa de recambio, crema solar, gorra y gafas de sol. Si quieres hacer snorkel, trae gafas y tubo: por higiene no los damos, aunque a bordo tenemos algunos. Para los niños, si quieres, un chaleco salvavidas de su talla. La bebida corre de nuestra cuenta: en el Tour de las 7 islas dos bebidas en lata por persona y agua, con mirto y dulces al final; en el medio día agua y refrescos; en el Sunset y en las excursiones privadas prosecco y tabla. El resto de la comida corre de tu cuenta: cada excursión lo indica en las listas "Incluido" y "No incluido". Y sobre todo, trae ganas de divertirte y pasar un día inolvidable.' },
    ],
  },
  {
    gruppo: 'Parque Nacional',
    domande: [
      { id: 'spiaggia-rosa', domanda: '¿Se puede uno bañar en la Playa Rosa?', risposta: 'No. Para protegerla, el Parque prohíbe desembarcar y bañarse: la admiramos desde el mar, poco antes de la parada en Porto della Madonna.' },
      { id: 'ticket', domanda: '¿Está incluida la tasa del Parque?', risposta: '', regola: 'ticketParco', mancante: '¿Incluida o aparte? ¿Cuánto cuesta?' },
    ],
  },
];

// Con la prenotazione online accesa cambiano alcune risposte, come in italiano (src/data/faq-online.js).
export const faq = faqConOnline('es', gruppi, sito.regole.pagamento);
