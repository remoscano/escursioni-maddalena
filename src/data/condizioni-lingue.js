// Condizioni di prenotazione tradotte (23 novembre 2026): stessa struttura e stessi dati di src/data/condizioni.js,
// che resta il testo di riferimento (Remo: "l'italiano resta il testo che vale"). Se cambia un punto in italiano,
// va cambiato anche qui, in tutte e quattro le lingue. Traduzioni di Claude, senza rilettura di un madrelingua né di un legale.
// Ogni lingua è una funzione che riceve i dati già pronti (c) e restituisce le sezioni; `false` = sezione o punto
// che vale solo con la prenotazione online accesa.

export const condizioniTradotte = {
  en: (c) => [
    {
      titolo: 'Translation',
      paragrafi: [['This is a translation provided for your convenience. The contract is concluded in Italian and, if the two texts differ, the Italian booking terms prevail.']],
    },
    {
      titolo: 'Who organises the tours',
      paragrafi: [
        ['The tours are organised by ', c.v('ragioneSociale', 'Company name'), ', registered office ', c.v('indirizzo', 'address'), ', VAT number ', c.v('partitaIva', 'number'), ', REA registration ', c.v('rea', 'number'), '.'],
        ['Contacts: WhatsApp and phone ', c.v('telefono', 'number'), ', email ', c.v('email', 'email'), '.'],
      ],
    },
    {
      titolo: 'The tours',
      punti: [
        [`Group tours (${c.nomiGruppo}): you book seats for the people in your group, on board with other guests, up to ${c.postiMassimi} people on the RIB${c.postiSunset ? ` (${c.postiSunset} on the Sunset)` : ''}.`],
        [`Private (${c.nomiEsclusiva}): the RIB is private for your group, up to ${c.postiMassimi} people. Depending on how many you are, we assign the ${c.piuPiccolo}-seat RIB or a ${c.postiMassimi}-seat one. The price is per RIB, not per person.`],
        [`Departure from La Maddalena, with pick-up in Palau for those boarding there, or from Cannigione. A dedicated RIB leaves from Cannigione, only for ${c.nomiCannigione}.`],
        ["A skipper is always with you: we don't rent out RIBs without a skipper."],
        ['Times, programme and what is included are on the page of each tour and in the summary before you pay.'],
      ],
    },
    c.online ? {
      titolo: 'How to book online',
      punti: [
        ['Choose tour, day, time, number of people and boarding point, then enter your name, email and phone.'],
        ['Before paying you see the summary with the total: you can change any choice by going back to the previous steps.'],
        [`Tick the booking terms box and choose how to pay. While you pay, the seats are held for you for ${c.minutiPerPagare} minutes.`],
        ["The booking is confirmed when the payment goes through: you immediately see the booking code and receive an email with the summary and a copy of these terms. Keep the code: you'll need it when you board."],
        [`${c.chiusura} ${c.dopoChiusura}`],
        ["The contract is concluded in Italian. We keep your booking: you can see it again from the link in the confirmation email, which is also your ticket with the QR code to show when you board."],
        ['If you book by phone or WhatsApp we can send you a link to pay online: the seats are held until the time stated in the link, then they become available again.'],
        ["If the day you want is full you can join the waiting list: if a seat comes free we let you know by email, but the seat isn't reserved until you book and pay."],
      ],
    } : {
      titolo: 'How to book',
      punti: [
        ['Message us on WhatsApp, call us or send us an email (also from the Enquiry page of the site) with tour, day, number of people and boarding point.'],
        ['We reply with availability, the total price and the meeting time. If it suits you, we send you a link to pay online: on the link page you see the summary with the total before paying.'],
        ['The seats are held for you until the time stated in the link, then they become available again.'],
        ["The booking is confirmed, and the contract concluded, when the payment goes through. We send you the confirmation with the booking code and a copy of these terms, to keep. You'll need the code when you board."],
        ['The contract is concluded in Italian.'],
      ],
    },
    {
      titolo: 'Prices and payment',
      punti: [
        [c.online
          ? 'Prices are in euros and include VAT. They change with the season: the one for your date is shown in the calendar and in the summary.'
          : 'Prices are in euros and include VAT. They change with the season: we tell you the one for your date with the availability, and you see it in the summary of the link before paying.'],
        [c.online
          ? 'You pay in full when you book, by card (through SumUp) or with PayPal, on their secure pages. There are no extra charges for the payment method.'
          : 'You pay in full with the link we send you, by card (through SumUp) or with PayPal, on their secure pages. There are no extra charges for the payment method.'],
        [`Children up to ${c.bambiniFinoA} pay the child price.`],
        ['On private tours fuel is not included in the price and is paid separately: ', c.carburante, '.'],
        ['The National Park fee is included in the price.'],
        ['There may be offers (for example for early bookings or groups) and different prices at weekends: you see them in the summary before paying. Offers and discount codes cannot be combined: the better one applies.'],
        c.online && ['You can add paid extras, when available: the price is in the summary and is paid together with the booking.'],
      ],
    },
    {
      titolo: 'Minimum number on group tours',
      paragrafi: [[`Group tours run with at least ${c.minimo} paying guests. If the minimum isn't reached by the evening before, we let you know and you choose: another date, another tour or a full refund.`]],
    },
    {
      titolo: 'If you cancel',
      punti: [
        [c.online
          ? `Up to ${c.ore} hours before departure: full refund. You can cancel yourself from the booking page (the link is in the confirmation email): the refund starts immediately and automatically. Or message us on WhatsApp or by email with the booking code.`
          : `Up to ${c.ore} hours before departure: full refund. Message us on WhatsApp or by email with the booking code: the refund goes back to the same method you paid with.`],
        ["After that, or if you don't show up for boarding, the amount is not refundable."],
        ['For tours booked for a specific date, the law does not provide the 14-day right of withdrawal (Italian Consumer Code, art. 59(1)(n)): the rules above apply.'],
        ['The refund goes back to the same method you paid with.' + (c.online ? ' The part paid with a gift voucher goes back on the voucher.' : '')],
      ],
    },
    {
      titolo: 'Bad weather and if we cancel',
      paragrafi: [
        ['Safety comes first: the skipper decides whether and where it is possible to sail. The itinerary can change depending on wind and sea, choosing the most sheltered coves.'],
        ['If the sea or wind make it impossible to go out, or if we have to cancel for another reason (for example a breakdown), you choose: a full refund or another date. We send you a link: choose a day and time with seats available, at the same price you paid, or the refund, which starts automatically.'],
        ['To protect it, the National Park forbids landing and swimming at the Pink Beach of Budelli: you admire it from the sea.'],
      ],
    },
    {
      titolo: 'Corsica',
      paragrafi: [["We enter France: every participant, children included, must have a valid ID for travel abroad (identity card valid for travel or passport). Anyone without one cannot board, and this gives no right to a refund."]],
    },
    {
      titolo: 'On board',
      punti: [
        [`Meet at the pier ${c.anticipo} minutes before departure from that pier. On group tours the RIB leaves from La Maddalena and picks up in Palau half an hour later: for the morning, meet at ${c.ritrovoMaddalena} in La Maddalena and at ${c.ritrovoPalau} in Palau. We confirm the time with a message before the tour. The tour can't wait for latecomers.`],
        ['Follow the instructions of the skipper, who is responsible for safety on board.'],
        ['Minors take part accompanied by an adult.'],
        ['Pets are not allowed on board.'],
        ['Children of any age are welcome. The life jackets on board are adult size: for children you can bring their own.'],
      ],
    },
    {
      titolo: 'Partner accommodation and other platforms',
      paragrafi: [
        ['If you book through your hotel or accommodation, or from their link, the contract is with us and these terms apply. The accommodation receives a commission from us: the price for you does not change.'],
        ['If you booked on another platform (for example GetYourGuide or Viator), that platform\'s terms apply to payment and cancellation.'],
      ],
    },
    c.online && {
      titolo: 'Gift vouchers',
      punti: [
        [`The gift voucher is valid for ${c.validitaMesi} months from purchase, on all tours bookable online. The expiry date is written on the voucher.`],
        ["You use it by entering the code in the booking summary. If the tour costs more, the difference is paid by card or PayPal; if it costs less, what is left stays on the voucher for another booking."],
        [`The voucher cannot be exchanged for cash. If you change your mind before using it, within 14 days of purchase you can withdraw without giving reasons (Italian Consumer Code, art. 52): from the "Withdraw from the contract here" page of the site (${c.recesso}), or by writing to us. We cancel the voucher, email you the receipt and refund you in full within 14 days, to the same payment method.`],
        ['If a booking paid with the voucher is cancelled with a right to a refund, the voucher part goes back on the voucher.'],
      ],
    },
    {
      titolo: 'Complaints, law and jurisdiction',
      paragrafi: [
        ['For any problem write to us at ', c.v('email', 'email'), ' or on WhatsApp ', c.v('telefono', 'number'), ': we reply as soon as possible.'],
        ['The contract is governed by Italian law. If you book as a consumer, the more favourable protections of the law of the country where you live still apply, and any dispute falls under the court of the place where you live.'],
      ],
    },
  ],

  es: (c) => [
    {
      titolo: 'Traducción',
      paragrafi: [['Esta es una traducción para tu comodidad. El contrato se celebra en italiano y, si los dos textos no coinciden, prevalecen las condiciones de reserva en italiano.']],
    },
    {
      titolo: 'Quién organiza',
      paragrafi: [
        ['Las excursiones las organiza ', c.v('ragioneSociale', 'Razón social'), ', con sede en ', c.v('indirizzo', 'dirección'), ', NIF-IVA ', c.v('partitaIva', 'número'), ', inscripción REA ', c.v('rea', 'número'), '.'],
        ['Contacto: WhatsApp y teléfono ', c.v('telefono', 'número'), ', email ', c.v('email', 'email'), '.'],
      ],
    },
    {
      titolo: 'Las excursiones',
      punti: [
        [`Salidas en grupo (${c.nomiGruppo}): reservas las plazas para las personas de tu grupo, a bordo con otros huéspedes, hasta ${c.postiMassimi} personas en la neumática${c.postiSunset ? ` (${c.postiSunset} en el Sunset)` : ''}.`],
        [`En exclusiva (${c.nomiEsclusiva}): la neumática es en exclusiva para tu grupo, hasta ${c.postiMassimi} personas. Según cuántos seáis, os asignamos la neumática de ${c.piuPiccolo} plazas o una de ${c.postiMassimi}. El precio es por neumática, no por persona.`],
        [`Salida desde La Maddalena, con recogida en Palau para quien embarca allí, o desde Cannigione. Desde Cannigione sale una neumática dedicada, solo para ${c.nomiCannigione}.`],
        ['Contigo siempre está el patrón: no alquilamos neumáticas sin patrón.'],
        ['Horarios, programa y qué está incluido están en la página de cada excursión y en el resumen antes de pagar.'],
      ],
    },
    c.online ? {
      titolo: 'Cómo se reserva online',
      punti: [
        ['Elige excursión, día, hora, número de personas y punto de embarque, y escribe nombre, email y teléfono.'],
        ['Antes de pagar ves el resumen con el total: puedes cambiar cualquier elección volviendo a los pasos anteriores.'],
        [`Marca la casilla de las condiciones y elige cómo pagar. Mientras pagas, las plazas se guardan para ti durante ${c.minutiPerPagare} minutos.`],
        ['La reserva queda confirmada cuando el pago se completa: ves enseguida el código de reserva y recibes un email con el resumen y una copia de estas condiciones. Guarda el código: te hace falta para embarcar.'],
        [`${c.chiusura} ${c.dopoChiusura}`],
        ['El contrato se celebra en italiano. Conservamos tu reserva: puedes volver a verla desde el enlace del email de confirmación, que es también tu billete con el código QR para enseñar al embarcar.'],
        ['Si reservas por teléfono o WhatsApp podemos enviarte un enlace para pagar online: las plazas se guardan hasta la hora indicada en el enlace y después vuelven a estar disponibles.'],
        ['Si el día que quieres está completo puedes apuntarte a la lista de espera: si queda una plaza libre te avisamos por email, pero la plaza no está reservada hasta que reservas y pagas.'],
      ],
    } : {
      titolo: 'Cómo se reserva',
      punti: [
        ['Escríbenos por WhatsApp, llámanos o envíanos un email (también desde la página Solicitud de la web) con excursión, día, número de personas y punto de embarque.'],
        ['Te respondemos con la disponibilidad, el precio total y la hora de encuentro. Si te va bien, te enviamos un enlace para pagar online: en la página del enlace ves el resumen con el total antes de pagar.'],
        ['Las plazas se guardan para ti hasta la hora indicada en el enlace y después vuelven a estar disponibles.'],
        ['La reserva queda confirmada, y el contrato celebrado, cuando el pago se completa. Te enviamos la confirmación con el código de reserva y una copia de estas condiciones, para que la guardes. El código te hace falta para embarcar.'],
        ['El contrato se celebra en italiano.'],
      ],
    },
    {
      titolo: 'Precios y pago',
      punti: [
        [c.online
          ? 'Los precios están en euros e incluyen el IVA. Cambian según la temporada: el de tu fecha lo ves en el calendario y en el resumen.'
          : 'Los precios están en euros e incluyen el IVA. Cambian según la temporada: el de tu fecha te lo decimos con la disponibilidad y lo ves en el resumen del enlace, antes de pagar.'],
        [c.online
          ? 'Se paga todo en el momento de reservar, con tarjeta (a través de SumUp) o con PayPal, en sus páginas seguras. No hay costes adicionales por el método de pago.'
          : 'Se paga todo con el enlace que te enviamos, con tarjeta (a través de SumUp) o con PayPal, en sus páginas seguras. No hay costes adicionales por el método de pago.'],
        [`Hasta los ${c.bambiniFinoA} años hay precio reducido.`],
        ['En las excursiones en exclusiva el combustible no está incluido en el precio y se paga aparte: ', c.carburante, '.'],
        ['La tasa del Parque Nacional está incluida en el precio.'],
        ['Puede haber promociones (por ejemplo para quien reserva antes o para grupos) y precios distintos el fin de semana: los ves en el resumen antes de pagar. Promociones y códigos de descuento no se suman: vale el que más te conviene.'],
        c.online && ['Puedes añadir extras de pago, cuando los hay: el precio está en el resumen y se paga junto con la reserva.'],
      ],
    },
    {
      titolo: 'Número mínimo en las salidas en grupo',
      paragrafi: [[`Las salidas en grupo se hacen con al menos ${c.minimo} personas que pagan. Si la tarde anterior no se alcanza el mínimo te avisamos y eliges tú: otra fecha, otra excursión o el reembolso completo.`]],
    },
    {
      titolo: 'Si cancelas tú',
      punti: [
        [c.online
          ? `Hasta ${c.ore} horas antes de la salida: reembolso completo. Puedes cancelar tú mismo desde la página de la reserva (el enlace está en el email de confirmación): el reembolso sale enseguida, de forma automática. O escríbenos por WhatsApp o email con el código de reserva.`
          : `Hasta ${c.ore} horas antes de la salida: reembolso completo. Escríbenos por WhatsApp o email con el código de reserva: el reembolso llega en el mismo método con el que pagaste.`],
        ['Después, o si no te presentas al embarque, el importe no es reembolsable.'],
        ['Para las excursiones reservadas para una fecha concreta la ley no prevé el derecho de desistimiento de 14 días (Código del consumo italiano, art. 59, apartado 1, letra n): valen las reglas de arriba.'],
        ['El reembolso llega en el mismo método con el que pagaste.' + (c.online ? ' La parte pagada con un bono regalo vuelve al bono.' : '')],
      ],
    },
    {
      titolo: 'Mal tiempo y si cancelamos nosotros',
      paragrafi: [
        ['La seguridad es lo primero: es el patrón quien decide si se puede navegar y dónde. El itinerario puede cambiar según el viento y el mar, eligiendo las calas más resguardadas.'],
        ['Si el mar o el viento no permiten salir, o si tenemos que cancelar por otro motivo (por ejemplo una avería), eliges tú: reembolso completo u otra fecha. Te enviamos un enlace: eliges día y hora entre los que tienen plazas libres, al mismo precio que pagaste, o el reembolso, que sale de forma automática.'],
        ['Para protegerla, el Parque prohíbe desembarcar y bañarse en la Playa Rosa de Budelli: se admira desde el mar.'],
      ],
    },
    {
      titolo: 'Córcega',
      paragrafi: [['Se entra en Francia: cada participante, niños incluidos, debe tener un documento válido para viajar al extranjero (documento de identidad válido para viajar o pasaporte). Quien no lo tenga no puede embarcar, y esto no da derecho a reembolso.']],
    },
    {
      titolo: 'A bordo',
      punti: [
        [`El encuentro en el muelle es ${c.anticipo} minutos antes de la salida desde ese muelle. En las salidas en grupo la neumática sale de La Maddalena y pasa por Palau media hora después: por la mañana, encuentro a las ${c.ritrovoMaddalena} en La Maddalena y a las ${c.ritrovoPalau} en Palau. Te confirmamos la hora con un mensaje antes de la salida. La excursión no puede esperar a quien llega tarde.`],
        ['Sigue las indicaciones del patrón, responsable de la seguridad a bordo.'],
        ['Los menores participan acompañados por un adulto.'],
        ['No se admiten animales a bordo.'],
        ['Los niños son bienvenidos a cualquier edad. Los chalecos salvavidas a bordo son de talla adulta: para los niños puedes traer los suyos.'],
      ],
    },
    {
      titolo: 'Alojamientos colaboradores y otras plataformas',
      paragrafi: [
        ['Si reservas a través de tu hotel o alojamiento, o desde su enlace, el contrato es con nosotros y valen estas condiciones. El alojamiento recibe de nosotros una comisión: para ti el precio no cambia.'],
        ['Si has reservado en otra plataforma (por ejemplo GetYourGuide o Viator), para pago y cancelación valen las condiciones de esa plataforma.'],
      ],
    },
    c.online && {
      titolo: 'Bonos regalo',
      punti: [
        [`El bono regalo es válido ${c.validitaMesi} meses desde la compra, en todas las excursiones que se reservan online. La fecha de caducidad está escrita en el bono.`],
        ['Se usa escribiendo el código en el resumen de la reserva. Si la excursión cuesta más, la diferencia se paga con tarjeta o PayPal; si cuesta menos, lo que sobra se queda en el bono para otra reserva.'],
        [`El bono no se cambia por dinero. Si cambias de idea antes de usarlo, en los 14 días siguientes a la compra puedes desistir sin dar explicaciones (Código del consumo italiano, art. 52): desde la página "Desiste del contrato aquí" de la web (${c.recesso}) o escribiéndonos. Anulamos el bono, te enviamos el recibo por email y te devolvemos todo en un plazo de 14 días, en el mismo método de pago.`],
        ['Si una reserva pagada con el bono se cancela con derecho a reembolso, la parte del bono vuelve al bono.'],
      ],
    },
    {
      titolo: 'Reclamaciones, ley y tribunal competente',
      paragrafi: [
        ['Para cualquier problema escríbenos a ', c.v('email', 'email'), ' o por WhatsApp al ', c.v('telefono', 'número'), ': respondemos lo antes posible.'],
        ['El contrato se rige por la ley italiana. Si reservas como consumidor, siguen valiendo las protecciones más favorables de la ley del país en el que vives, y para cualquier litigio es competente el tribunal del lugar donde resides.'],
      ],
    },
  ],

  fr: (c) => [
    {
      titolo: 'Traduction',
      paragrafi: [["Ceci est une traduction fournie pour votre commodité. Le contrat est conclu en italien et, en cas de différence entre les deux textes, les conditions de réservation en italien prévalent."]],
    },
    {
      titolo: 'Qui organise',
      paragrafi: [
        ['Les excursions sont organisées par ', c.v('ragioneSociale', 'Raison sociale'), ', dont le siège est à ', c.v('indirizzo', 'adresse'), ', n° TVA ', c.v('partitaIva', 'numéro'), ', inscription REA ', c.v('rea', 'numéro'), '.'],
        ['Contacts : WhatsApp et téléphone ', c.v('telefono', 'numéro'), ', e-mail ', c.v('email', 'e-mail'), '.'],
      ],
    },
    {
      titolo: 'Les excursions',
      punti: [
        [`Sorties en groupe (${c.nomiGruppo}) : vous réservez les places pour les personnes de votre groupe, à bord avec d'autres clients, jusqu'à ${c.postiMassimi} personnes sur le semi-rigide${c.postiSunset ? ` (${c.postiSunset} pour le Sunset)` : ''}.`],
        [`Privatisé (${c.nomiEsclusiva}) : le semi-rigide est privatisé pour votre groupe, jusqu'à ${c.postiMassimi} personnes. Selon votre nombre, nous vous attribuons le semi-rigide de ${c.piuPiccolo} places ou un de ${c.postiMassimi}. Le prix est par semi-rigide, pas par personne.`],
        [`Départ de La Maddalena, avec passage à Palau pour ceux qui embarquent là-bas, ou de Cannigione. Un semi-rigide dédié part de Cannigione, uniquement pour ${c.nomiCannigione}.`],
        ["Un skipper est toujours avec vous : nous ne louons pas de semi-rigides sans skipper."],
        ['Horaires, programme et ce qui est compris figurent sur la page de chaque excursion et dans le récapitulatif avant le paiement.'],
      ],
    },
    c.online ? {
      titolo: 'Comment réserver en ligne',
      punti: [
        ["Choisissez l'excursion, le jour, l'horaire, le nombre de personnes et le point d'embarquement, puis saisissez nom, e-mail et téléphone."],
        ['Avant de payer, vous voyez le récapitulatif avec le total : vous pouvez modifier chaque choix en revenant aux étapes précédentes.'],
        [`Cochez la case des conditions et choisissez comment payer. Pendant le paiement, les places vous sont réservées pendant ${c.minutiPerPagare} minutes.`],
        ["La réservation est confirmée quand le paiement aboutit : vous voyez tout de suite le code de réservation et recevez un e-mail avec le récapitulatif et une copie de ces conditions. Gardez le code : il vous servira à l'embarquement."],
        [`${c.chiusura} ${c.dopoChiusura}`],
        ["Le contrat est conclu en italien. Nous conservons votre réservation : vous pouvez la revoir depuis le lien de l'e-mail de confirmation, qui est aussi votre billet avec le code QR à montrer à l'embarquement."],
        ["Si vous réservez par téléphone ou WhatsApp, nous pouvons vous envoyer un lien pour payer en ligne : les places sont gardées jusqu'à l'heure indiquée dans le lien, puis redeviennent disponibles."],
        ["Si le jour souhaité est complet, vous pouvez vous inscrire sur la liste d'attente : si une place se libère, nous vous prévenons par e-mail, mais la place n'est pas réservée tant que vous n'avez pas réservé et payé."],
      ],
    } : {
      titolo: 'Comment réserver',
      punti: [
        ["Écrivez-nous sur WhatsApp, appelez-nous ou envoyez-nous un e-mail (aussi depuis la page Demande du site) avec l'excursion, le jour, le nombre de personnes et le point d'embarquement."],
        ["Nous vous répondons avec la disponibilité, le prix total et l'heure de rendez-vous. Si cela vous convient, nous vous envoyons un lien pour payer en ligne : sur la page du lien, vous voyez le récapitulatif avec le total avant de payer."],
        ["Les places vous sont gardées jusqu'à l'heure indiquée dans le lien, puis redeviennent disponibles."],
        ["La réservation est confirmée, et le contrat conclu, quand le paiement aboutit. Nous vous envoyons la confirmation avec le code de réservation et une copie de ces conditions, à conserver. Le code vous servira à l'embarquement."],
        ['Le contrat est conclu en italien.'],
      ],
    },
    {
      titolo: 'Prix et paiement',
      punti: [
        [c.online
          ? 'Les prix sont en euros, TVA comprise. Ils varient selon la période : celui de votre date est indiqué dans le calendrier et dans le récapitulatif.'
          : 'Les prix sont en euros, TVA comprise. Ils varient selon la période : nous vous indiquons celui de votre date avec la disponibilité, et vous le voyez dans le récapitulatif du lien avant de payer.'],
        [c.online
          ? 'Vous payez la totalité au moment de la réservation, par carte (via SumUp) ou avec PayPal, sur leurs pages sécurisées. Il n\'y a pas de frais supplémentaires selon le moyen de paiement.'
          : 'Vous payez la totalité avec le lien que nous vous envoyons, par carte (via SumUp) ou avec PayPal, sur leurs pages sécurisées. Il n\'y a pas de frais supplémentaires selon le moyen de paiement.'],
        [`Jusqu'à ${c.bambiniFinoA} ans, tarif réduit.`],
        ["Pour les excursions privatisées, le carburant n'est pas compris dans le prix et se paie à part : ", c.carburante, '.'],
        ["Le droit d'entrée du Parc national est compris dans le prix."],
        ["Il peut y avoir des promotions (par exemple pour les réservations anticipées ou les groupes) et des prix différents le week-end : vous les voyez dans le récapitulatif avant de payer. Promotions et codes promo ne se cumulent pas : c'est le plus avantageux qui s'applique."],
        c.online && ['Vous pouvez ajouter des suppléments payants, quand il y en a : le prix figure dans le récapitulatif et se paie avec la réservation.'],
      ],
    },
    {
      titolo: 'Nombre minimum pour les sorties en groupe',
      paragrafi: [[`Les sorties en groupe ont lieu avec au moins ${c.minimo} personnes payantes. Si le minimum n'est pas atteint la veille au soir, nous vous prévenons et vous choisissez : une autre date, une autre excursion ou le remboursement intégral.`]],
    },
    {
      titolo: 'Si vous annulez',
      punti: [
        [c.online
          ? `Jusqu'à ${c.ore} heures avant le départ : remboursement intégral. Vous pouvez annuler vous-même depuis la page de la réservation (le lien est dans l'e-mail de confirmation) : le remboursement part tout de suite, automatiquement. Ou écrivez-nous sur WhatsApp ou par e-mail avec le code de réservation.`
          : `Jusqu'à ${c.ore} heures avant le départ : remboursement intégral. Écrivez-nous sur WhatsApp ou par e-mail avec le code de réservation : le remboursement arrive sur le moyen de paiement utilisé.`],
        ["Ensuite, ou si vous ne vous présentez pas à l'embarquement, le montant n'est pas remboursable."],
        ["Pour les excursions réservées à une date précise, la loi ne prévoit pas le droit de rétractation de 14 jours (Code de la consommation italien, art. 59, al. 1, lettre n) : les règles ci-dessus s'appliquent."],
        ['Le remboursement arrive sur le moyen de paiement utilisé.' + (c.online ? ' La partie payée avec un bon cadeau revient sur le bon.' : '')],
      ],
    },
    {
      titolo: 'Mauvais temps et annulation de notre part',
      paragrafi: [
        ["La sécurité passe avant tout : c'est le skipper qui décide si l'on peut naviguer et où. L'itinéraire peut changer selon le vent et la mer, en choisissant les criques les plus abritées."],
        ["Si la mer ou le vent ne permettent pas de sortir, ou si nous devons annuler pour une autre raison (par exemple une panne), vous choisissez : remboursement intégral ou une autre date. Nous vous envoyons un lien : choisissez un jour et un horaire avec des places libres, au même prix que celui payé, ou le remboursement, qui part automatiquement."],
        ['Pour la protéger, le Parc interdit de débarquer et de se baigner à la Plage Rose de Budelli : on l\'admire depuis la mer.'],
      ],
    },
    {
      titolo: 'Corse',
      paragrafi: [["On entre en France : chaque participant, enfants compris, doit avoir une pièce d'identité valable pour l'étranger (carte d'identité valable pour voyager ou passeport). Sans elle, on ne peut pas embarquer, et cela ne donne pas droit à un remboursement."]],
    },
    {
      titolo: 'À bord',
      punti: [
        [`Le rendez-vous au quai est ${c.anticipo} minutes avant le départ de ce quai. Pour les sorties en groupe, le semi-rigide part de La Maddalena et passe à Palau une demi-heure plus tard : le matin, rendez-vous à ${c.ritrovoMaddalena} à La Maddalena et à ${c.ritrovoPalau} à Palau. Nous vous confirmons l'horaire par un message avant la sortie. La sortie ne peut pas attendre les retardataires.`],
        ['Suivez les indications du skipper, responsable de la sécurité à bord.'],
        ['Les mineurs participent accompagnés par un adulte.'],
        ['Les animaux ne sont pas admis à bord.'],
        ["Les enfants sont les bienvenus à tout âge. Les gilets de sauvetage à bord sont en taille adulte : pour les enfants, vous pouvez apporter les leurs."],
      ],
    },
    {
      titolo: 'Hébergements partenaires et autres plateformes',
      paragrafi: [
        ["Si vous réservez par votre hôtel ou votre hébergement, ou depuis leur lien, le contrat est conclu avec nous et ces conditions s'appliquent. L'hébergement reçoit de notre part une commission : pour vous, le prix ne change pas."],
        ["Si vous avez réservé sur une autre plateforme (par exemple GetYourGuide ou Viator), les conditions de cette plateforme s'appliquent au paiement et à l'annulation."],
      ],
    },
    c.online && {
      titolo: 'Bons cadeaux',
      punti: [
        [`Le bon cadeau est valable ${c.validitaMesi} mois à partir de l'achat, sur toutes les excursions réservables en ligne. La date d'expiration est écrite sur le bon.`],
        ["On l'utilise en saisissant le code dans le récapitulatif de la réservation. Si l'excursion coûte plus, la différence se paie par carte ou PayPal ; si elle coûte moins, le reste demeure sur le bon pour une autre réservation."],
        [`Le bon n'est pas convertible en argent. Si vous changez d'avis avant de l'utiliser, dans les 14 jours suivant l'achat vous pouvez vous rétracter sans donner de motif (Code de la consommation italien, art. 52) : depuis la page « Se rétracter du contrat ici » du site (${c.recesso}), ou en nous écrivant. Nous annulons le bon, vous envoyons le reçu par e-mail et vous remboursons intégralement sous 14 jours, sur le même moyen de paiement.`],
        ['Si une réservation payée avec le bon est annulée avec droit au remboursement, la partie du bon revient sur le bon.'],
      ],
    },
    {
      titolo: 'Réclamations, loi applicable et tribunal compétent',
      paragrafi: [
        ['Pour tout problème, écrivez-nous à ', c.v('email', 'e-mail'), ' ou sur WhatsApp au ', c.v('telefono', 'numéro'), ' : nous répondons au plus vite.'],
        ["Le contrat est régi par la loi italienne. Si vous réservez en tant que consommateur, les protections plus favorables de la loi du pays où vous vivez restent applicables, et tout litige relève du tribunal du lieu de votre résidence."],
      ],
    },
  ],

  de: (c) => [
    {
      titolo: 'Übersetzung',
      paragrafi: [['Dies ist eine Übersetzung zu Ihrer Information. Der Vertrag wird auf Italienisch geschlossen; weichen die beiden Texte voneinander ab, gelten die italienischen Buchungsbedingungen.']],
    },
    {
      titolo: 'Veranstalter',
      paragrafi: [
        ['Die Ausflüge werden veranstaltet von ', c.v('ragioneSociale', 'Firmenname'), ', Sitz ', c.v('indirizzo', 'Adresse'), ', USt-IdNr. ', c.v('partitaIva', 'Nummer'), ', REA-Eintragung ', c.v('rea', 'Nummer'), '.'],
        ['Kontakt: WhatsApp und Telefon ', c.v('telefono', 'Nummer'), ', E-Mail ', c.v('email', 'E-Mail'), '.'],
      ],
    },
    {
      titolo: 'Die Ausflüge',
      punti: [
        [`Gruppenausflüge (${c.nomiGruppo}): Sie buchen Plätze für die Personen Ihrer Gruppe, an Bord mit anderen Gästen, bis zu ${c.postiMassimi} Personen pro Boot${c.postiSunset ? ` (${c.postiSunset} beim Sunset)` : ''}.`],
        [`Exklusiv (${c.nomiEsclusiva}): Das Boot gehört exklusiv Ihrer Gruppe, bis zu ${c.postiMassimi} Personen. Je nach Personenzahl bekommen Sie das Boot mit ${c.piuPiccolo} Plätzen oder eines mit ${c.postiMassimi}. Der Preis gilt pro Boot, nicht pro Person.`],
        [`Abfahrt in La Maddalena, mit Zustieg in Palau für alle, die dort einsteigen, oder in Cannigione. Ab Cannigione fährt ein eigenes Boot, nur für ${c.nomiCannigione}.`],
        ['Ein Skipper ist immer dabei: Wir vermieten keine Boote ohne Skipper.'],
        ['Uhrzeiten, Programm und Leistungen stehen auf der Seite jedes Ausflugs und in der Übersicht vor dem Bezahlen.'],
      ],
    },
    c.online ? {
      titolo: 'So buchen Sie online',
      punti: [
        ['Wählen Sie Ausflug, Tag, Uhrzeit, Personenzahl und Einstieg und geben Sie Name, E-Mail und Telefon ein.'],
        ['Vor dem Bezahlen sehen Sie die Übersicht mit dem Gesamtpreis: Jede Auswahl können Sie in den vorherigen Schritten ändern.'],
        [`Bestätigen Sie die Buchungsbedingungen und wählen Sie die Zahlungsart. Während Sie bezahlen, werden die Plätze ${c.minutiPerPagare} Minuten für Sie reserviert.`],
        ['Die Buchung ist bestätigt, sobald die Zahlung erfolgreich ist: Sie sehen sofort den Buchungscode und erhalten eine E-Mail mit der Übersicht und einer Kopie dieser Bedingungen. Bewahren Sie den Code auf: Sie brauchen ihn beim Einsteigen.'],
        [`${c.chiusura} ${c.dopoChiusura}`],
        ['Der Vertrag wird auf Italienisch geschlossen. Wir speichern Ihre Buchung: Sie können sie über den Link in der Bestätigungs-E-Mail wieder aufrufen, der zugleich Ihr Ticket mit dem QR-Code für den Einstieg ist.'],
        ['Wenn Sie telefonisch oder über WhatsApp buchen, können wir Ihnen einen Link zum Online-Bezahlen schicken: Die Plätze bleiben bis zu der im Link genannten Uhrzeit reserviert und werden danach wieder frei.'],
        ['Ist Ihr Wunschtag ausgebucht, können Sie sich auf die Warteliste setzen: Wird ein Platz frei, benachrichtigen wir Sie per E-Mail, der Platz ist aber erst reserviert, wenn Sie buchen und bezahlen.'],
      ],
    } : {
      titolo: 'So buchen Sie',
      punti: [
        ['Schreiben Sie uns auf WhatsApp, rufen Sie an oder schicken Sie eine E-Mail (auch über die Seite Anfrage der Website) mit Ausflug, Tag, Personenzahl und Einstieg.'],
        ['Wir antworten mit der Verfügbarkeit, dem Gesamtpreis und der Uhrzeit des Treffpunkts. Passt es Ihnen, schicken wir Ihnen einen Link zum Online-Bezahlen: Auf der Seite des Links sehen Sie vor dem Bezahlen die Übersicht mit dem Gesamtpreis.'],
        ['Die Plätze bleiben bis zu der im Link genannten Uhrzeit für Sie reserviert und werden danach wieder frei.'],
        ['Die Buchung ist bestätigt und der Vertrag geschlossen, sobald die Zahlung erfolgreich ist. Wir schicken Ihnen die Bestätigung mit dem Buchungscode und eine Kopie dieser Bedingungen zum Aufbewahren. Den Code brauchen Sie beim Einsteigen.'],
        ['Der Vertrag wird auf Italienisch geschlossen.'],
      ],
    },
    {
      titolo: 'Preise und Bezahlung',
      punti: [
        [c.online
          ? 'Die Preise verstehen sich in Euro inklusive Mehrwertsteuer. Sie ändern sich je nach Saison: Den Preis für Ihr Datum sehen Sie im Kalender und in der Übersicht.'
          : 'Die Preise verstehen sich in Euro inklusive Mehrwertsteuer. Sie ändern sich je nach Saison: Den Preis für Ihr Datum nennen wir Ihnen mit der Verfügbarkeit, und Sie sehen ihn vor dem Bezahlen in der Übersicht des Links.'],
        [c.online
          ? 'Sie bezahlen alles bei der Buchung, mit Karte (über SumUp) oder mit PayPal, auf deren sicheren Seiten. Für die Zahlungsart fallen keine zusätzlichen Kosten an.'
          : 'Sie bezahlen alles über den Link, den wir Ihnen schicken, mit Karte (über SumUp) oder mit PayPal, auf deren sicheren Seiten. Für die Zahlungsart fallen keine zusätzlichen Kosten an.'],
        [`Bis ${c.bambiniFinoA} Jahre gilt der ermäßigte Preis.`],
        ['Bei exklusiven Ausflügen ist der Treibstoff nicht im Preis enthalten und wird separat bezahlt: ', c.carburante, '.'],
        ['Die Nationalparkgebühr ist im Preis enthalten.'],
        ['Es kann Angebote geben (zum Beispiel für Frühbucher oder Gruppen) und andere Preise am Wochenende: Sie sehen sie vor dem Bezahlen in der Übersicht. Angebote und Rabattcodes sind nicht kombinierbar: Es gilt das günstigere.'],
        c.online && ['Sie können kostenpflichtige Extras hinzufügen, wenn es welche gibt: Der Preis steht in der Übersicht und wird mit der Buchung bezahlt.'],
      ],
    },
    {
      titolo: 'Mindestteilnehmerzahl bei Gruppenausflügen',
      paragrafi: [[`Gruppenausflüge finden ab ${c.minimo} zahlenden Personen statt. Wird die Mindestzahl am Vorabend nicht erreicht, benachrichtigen wir Sie und Sie entscheiden: ein anderer Termin, ein anderer Ausflug oder die volle Rückerstattung.`]],
    },
    {
      titolo: 'Wenn Sie stornieren',
      punti: [
        [c.online
          ? `Bis ${c.ore} Stunden vor der Abfahrt: volle Rückerstattung. Sie können selbst auf der Seite der Buchung stornieren (der Link steht in der Bestätigungs-E-Mail): Die Rückerstattung wird sofort und automatisch veranlasst. Oder schreiben Sie uns auf WhatsApp oder per E-Mail mit dem Buchungscode.`
          : `Bis ${c.ore} Stunden vor der Abfahrt: volle Rückerstattung. Schreiben Sie uns auf WhatsApp oder per E-Mail mit dem Buchungscode: Die Rückerstattung erfolgt auf dieselbe Zahlungsart, mit der Sie bezahlt haben.`],
        ['Danach oder wenn Sie nicht zum Einstieg erscheinen, wird der Betrag nicht erstattet.'],
        ['Für Ausflüge, die für ein bestimmtes Datum gebucht sind, sieht das Gesetz kein 14-tägiges Widerrufsrecht vor (italienisches Verbrauchergesetzbuch, Art. 59 Abs. 1 Buchst. n): Es gelten die obigen Regeln.'],
        ['Die Rückerstattung erfolgt auf dieselbe Zahlungsart, mit der Sie bezahlt haben.' + (c.online ? ' Der mit einem Geschenkgutschein bezahlte Teil geht auf den Gutschein zurück.' : '')],
      ],
    },
    {
      titolo: 'Schlechtes Wetter und Absage durch uns',
      paragrafi: [
        ['Sicherheit geht vor: Der Skipper entscheidet, ob und wo gefahren werden kann. Die Route kann sich je nach Wind und Meer ändern, mit den geschütztesten Buchten.'],
        ['Lassen Meer oder Wind keine Ausfahrt zu oder müssen wir aus einem anderen Grund absagen (zum Beispiel wegen einer Panne), entscheiden Sie: volle Rückerstattung oder ein anderer Termin. Wir schicken Ihnen einen Link: Wählen Sie Tag und Uhrzeit mit freien Plätzen zum selben Preis, den Sie bezahlt haben, oder die Rückerstattung, die automatisch veranlasst wird.'],
        ['Zu seinem Schutz verbietet der Nationalpark am Rosa Strand von Budelli das Anlegen und Baden: Man bewundert ihn vom Meer aus.'],
      ],
    },
    {
      titolo: 'Korsika',
      paragrafi: [['Es geht nach Frankreich: Jeder Teilnehmer, auch Kinder, braucht ein gültiges Ausweisdokument für das Ausland (Personalausweis oder Reisepass). Wer keines hat, kann nicht einsteigen; daraus entsteht kein Anspruch auf Rückerstattung.']],
    },
    {
      titolo: 'An Bord',
      punti: [
        [`Treffpunkt am Anleger ist ${c.anticipo} Minuten vor der Abfahrt von diesem Anleger. Bei Gruppenausflügen startet das Boot in La Maddalena und hält eine halbe Stunde später in Palau: Am Vormittag ist der Treffpunkt um ${c.ritrovoMaddalena} Uhr in La Maddalena und um ${c.ritrovoPalau} Uhr in Palau. Wir bestätigen Ihnen die Uhrzeit vor der Ausfahrt mit einer Nachricht. Die Ausfahrt kann nicht auf Verspätete warten.`],
        ['Folgen Sie den Anweisungen des Skippers, der für die Sicherheit an Bord verantwortlich ist.'],
        ['Minderjährige nehmen in Begleitung eines Erwachsenen teil.'],
        ['Tiere sind an Bord nicht erlaubt.'],
        ['Kinder jeden Alters sind willkommen. Die Schwimmwesten an Bord sind in Erwachsenengröße: Für Kinder können Sie eigene mitbringen.'],
      ],
    },
    {
      titolo: 'Partnerunterkünfte und andere Plattformen',
      paragrafi: [
        ['Buchen Sie über Ihr Hotel oder Ihre Unterkunft oder über deren Link, kommt der Vertrag mit uns zustande und es gelten diese Bedingungen. Die Unterkunft erhält von uns eine Provision: Für Sie ändert sich der Preis nicht.'],
        ['Haben Sie über eine andere Plattform gebucht (zum Beispiel GetYourGuide oder Viator), gelten für Bezahlung und Stornierung die Bedingungen dieser Plattform.'],
      ],
    },
    c.online && {
      titolo: 'Geschenkgutscheine',
      punti: [
        [`Der Geschenkgutschein gilt ${c.validitaMesi} Monate ab Kauf für alle online buchbaren Ausflüge. Das Ablaufdatum steht auf dem Gutschein.`],
        ['Sie lösen ihn ein, indem Sie den Code in der Übersicht der Buchung eingeben. Kostet der Ausflug mehr, wird die Differenz mit Karte oder PayPal bezahlt; kostet er weniger, bleibt der Rest für eine andere Buchung auf dem Gutschein.'],
        [`Der Gutschein kann nicht in Geld umgetauscht werden. Wenn Sie es sich vor dem Einlösen anders überlegen, können Sie innerhalb von 14 Tagen nach dem Kauf ohne Angabe von Gründen widerrufen (italienisches Verbrauchergesetzbuch, Art. 52): über die Seite „Vertrag hier widerrufen" der Website (${c.recesso}) oder indem Sie uns schreiben. Wir stornieren den Gutschein, schicken Ihnen die Bestätigung per E-Mail und erstatten Ihnen den vollen Betrag innerhalb von 14 Tagen auf dieselbe Zahlungsart.`],
        ['Wird eine mit dem Gutschein bezahlte Buchung mit Anspruch auf Rückerstattung storniert, geht der Gutscheinanteil auf den Gutschein zurück.'],
      ],
    },
    {
      titolo: 'Beschwerden, anwendbares Recht und Gerichtsstand',
      paragrafi: [
        ['Bei Problemen schreiben Sie uns an ', c.v('email', 'E-Mail'), ' oder auf WhatsApp unter ', c.v('telefono', 'Nummer'), ': Wir antworten so schnell wie möglich.'],
        ['Der Vertrag unterliegt italienischem Recht. Buchen Sie als Verbraucher, gelten weiterhin die günstigeren Schutzvorschriften des Landes, in dem Sie leben, und für Streitigkeiten ist das Gericht an Ihrem Wohnsitz zuständig.'],
      ],
    },
  ],
};

// Testi della pagina delle condizioni (titolo, descrizione, avviso della bozza) e intestazione del file da scaricare.
export const paginaCondizioni = {
  it: { titolo: 'Condizioni di prenotazione', descrizione: 'Come funzionano prenotazione, pagamento, cancellazione e maltempo per le escursioni in barca di Escursioni La Maddalena.', occhiello: 'Prenotazioni', bozza: 'BOZZA: da completare con i dati in rosa prima della pubblicazione', file: 'CONDIZIONI DI PRENOTAZIONE' },
  en: { titolo: 'Booking terms', descrizione: 'How booking, payment, cancellation and bad weather work for the boat tours of Escursioni La Maddalena.', occhiello: 'Bookings', bozza: 'DRAFT: to be completed with the data in pink before publication', file: 'BOOKING TERMS' },
  es: { titolo: 'Condiciones de reserva', descrizione: 'Cómo funcionan reserva, pago, cancelación y mal tiempo en las excursiones en barco de Escursioni La Maddalena.', occhiello: 'Reservas', bozza: 'BORRADOR: completar con los datos en rosa antes de la publicación', file: 'CONDICIONES DE RESERVA' },
  fr: { titolo: 'Conditions de réservation', descrizione: 'Comment fonctionnent réservation, paiement, annulation et mauvais temps pour les excursions en bateau d\'Escursioni La Maddalena.', occhiello: 'Réservations', bozza: 'BROUILLON : à compléter avec les données en rose avant la publication', file: 'CONDITIONS DE RÉSERVATION' },
  de: { titolo: 'Buchungsbedingungen', descrizione: 'So funktionieren Buchung, Bezahlung, Stornierung und schlechtes Wetter bei den Bootsausflügen von Escursioni La Maddalena.', occhiello: 'Buchungen', bozza: 'ENTWURF: vor der Veröffentlichung mit den rosa markierten Daten vervollständigen', file: 'BUCHUNGSBEDINGUNGEN' },
};
