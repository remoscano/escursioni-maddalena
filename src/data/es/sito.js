// Spagnolo: solo i TESTI di src/data/sito.js. Numeri, telefono, email, moli e link arrivano dal file italiano.
// Se cambia un testo italiano in sito.js, va cambiato anche qui. I valori vuoti ('') diventano segnaposto rosa.
import { sito as it } from '../sito.js';
import { sitoTradotto } from '../traduzioni.js';

const testi = {
  contatti: { orariRisposta: 'todos los días de 7:30 a 22:30, del 1 de mayo al 31 de octubre' },
  imbarchi: { palau: { parcheggio: '' } }, // dove parcheggiare a Palau: da tradurre quando arriva il testo italiano
  partenze: {
    breve: 'La Maddalena (recogida en Palau) y Cannigione',
    frase: 'salida desde La Maddalena, con recogida en Palau, y desde Cannigione',
    seo: 'desde La Maddalena (recogida en Palau) y Cannigione',
  },
  gommone: {
    descrizione: 'Neumáticas grandes y estables, con el patrón siempre a bordo: llegas a las calas más bonitas sin esfuerzo y disfrutas del mar con total seguridad. Sombra a bordo y como máximo 12 personas: el espacio justo para familias con niños y grupos de amigos.',
  },
  pranzo7: {
    breve: 'Comida libre en La Maddalena',
    testo: `Llegamos al puerto de La Maddalena antes de las ${it.pranzo7.arrivo}, así encuentras sitio y comes con calma: volvemos a salir a las ${it.pranzo7.ripartenza}. Si quieres, nuestro patrón, nacido en La Maddalena, te acompaña a los restaurantes de sus amigos que colaboran con nosotros, con cocina típica del lugar y precios transparentes y justos. Si lo prefieres, trae tu propia comida.`,
    nonIncluso: 'Comida: libre en La Maddalena, en nuestros restaurantes colaboradores (precios transparentes y justos) o comida para llevar',
  },
  tagliere: 'Tabla con embutido y queso sardos, o brochetas de fruta',
  pagamentoLink: {
    breve: 'Pagas después de la confirmación, con el enlace que te enviamos',
    testo: 'Cuando te confirmamos la disponibilidad por WhatsApp, te enviamos un enlace para pagar online, con tarjeta (SumUp) o con PayPal.',
  },
  carburante: 'según consumo. Al salir te mostramos el depósito lleno; al volver calculamos juntos los litros consumidos, que pagas a bordo al final de la excursión',
  notaOrariEsclusiva: 'Los horarios son orientativos: si lo necesitas, pídenos un pequeño cambio al reservar.',
  skipper: { nome: '', descrizione: '' },
  cosaPortare: [
    'Bañador, toalla y ropa de recambio',
    'Crema solar, gorra y gafas de sol',
    'Ganas de divertirte y pasar un día inolvidable',
  ],
  regole: {
    maltempo: 'Si el mar o el viento no son seguros, cancelamos nosotros y tú eliges: reembolso completo u otra fecha.',
    ticketParco: 'Sí, está incluida en el precio de todas las excursiones.',
    pagamento: 'Online al reservar, con tarjeta o PayPal. En las excursiones privadas el combustible se paga aparte.',
    bambini: 'Sí, de cualquier edad. Hasta los 10 años pagan la tarifa reducida. A bordo los chalecos salvavidas son obligatorios, pero son de talla adulta: para ir más tranquilo, trae un chaleco de la talla de tus hijos.',
    animali: 'No, no se admiten animales a bordo.',
  },
};

// Le quattro neumatiche: modello e motori restano uguali, descrizione e dotazioni tradotte.
const flotta = {
  'gruppo-1': { motori: '2 motores Suzuki de 200 CV', dotazioni: 'baño, T-top', descrizione: 'La neumática de nuestras excursiones en grupo: 8,5 metros, un gran solárium en proa y un sofá en U en popa, donde se va cómodo incluso siendo doce. Sombra del T-top y baño a bordo.' },
  'gruppo-2': { motori: '2 motores Mercury de 250 CV', dotazioni: 'baño, camarote, T-top', descrizione: 'Más amplia, con camarote y baño bajo cubierta: cómoda para cambiarse con calma después del baño. En proa está el solárium, y el T-top da sombra mientras se navega.' },
  esclusiva: { motori: '2 motores Suzuki de 300 CV', dotazioni: 'camarote, baño, sombra', descrizione: 'La más grande de la flota, más de 10 metros, reservada a las excursiones privadas con 6 personas como máximo: espacio para todos. Camarote con cama de matrimonio, baño separado y un solárium en proa donde caben más de cuatro.' },
  cannigione: { motori: '1 motor Honda de 350 CV', dotazioni: 'T-top', descrizione: 'La neumática de quien sale desde Cannigione, con un motor Honda de 350 CV: llega al archipiélago sin perder tiempo. Hasta 12 personas, con sombra a bordo.' },
};

export const sito = sitoTradotto(testi, flotta);
