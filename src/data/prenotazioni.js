// Prenotazioni online: gommoni, turni, prezzi e regole.
// Il sito e il sistema di prenotazione leggono tutto da qui: per cambiare un prezzo basta cambiarlo
// in questo file e pubblicare. Prezzi in euro, IVA inclusa.
//
// Ogni turno ha il suo listino: ogni riga vale tra due date mese-giorno ('05-01' = 1 maggio).
// - gruppo:    adulto = prezzo intero a persona (da 11 anni), bambino = ridotto (da 0 a 10 anni). Nessuna gratuità (Remo, 11 novembre 2026)
// - esclusiva: barca  = prezzo del gommone solo per il gruppo
//
// Listini dal cliente (8 novembre 2026):
// - giornata intera e mezza giornata, a persona e in esclusiva;
// - tramonto, "Sunset": listino suo, da 100 € a persona (gruppo, minimo 6 e massimo 10 persone) e da 700 a 800 € in esclusiva
//   (Remo, 13 novembre 2026); periodi e ridotti proposti da Claude, confermati da Remo il 13 novembre 2026
// - Corsica: solo in esclusiva, stesso prezzo delle altre giornate intere in esclusiva;
// - a tutte le esclusive si aggiunge il carburante.
// Tutti e tre i gommoni si possono prenotare in esclusiva (quello da 6 posti fa solo esclusive).

export const regole = {
  // false = i bottoni "Prenota" tornano alla richiesta su WhatsApp (utile finché i conti di pagamento non sono attivi)
  attive: true,
  stagione: { dal: '2027-05-01', al: '2027-10-31' },
  // Online si prenota fino alle 20 del giorno prima; per l'ultimo minuto si scrive su WhatsApp.
  chiusuraOnline: { giorniPrima: 1, ora: '20:00' },
  // Ritrovo al molo: quanti minuti prima della partenza, per imbarco (Remo, 13 novembre 2026:
  // alle 9 a Palau e alle 9:15 a La Maddalena per le uscite delle 9:30).
  anticipoRitrovo: { maddalena: 15, palau: 30, cannigione: 15 },
  // Per quanti minuti i posti restano tenuti da parte mentre il cliente paga.
  minutiPerPagare: 30,
  // Rimborso completo se il cliente annulla almeno 48 ore prima.
  cancellazioneGratisOre: 48,
  // Provvigione delle strutture partner, in percentuale sul lordo pagato dal cliente.
  provvigioneStrutture: 20, // Remo, 11 novembre 2026 (prima era 15)
  // Fasce d'età: da 0 a 10 anni ridotto, da 11 anni intero. Nessuno viaggia gratis (Remo, 11 novembre 2026).
  eta: { bambiniFinoA: 10 },
  // Esclusive: il carburante si paga a parte. La legge chiede di dire prima come si calcola e quando si paga
  // (es. 'a consumo, si paga a bordo a fine uscita'). Finché è vuoto, sul sito e nelle email compare un segnaposto.
  carburante: 'a consumo, si paga a bordo a fine uscita',

  // ----- Proposte di Claude (13 novembre 2026), da far confermare a Remo -----
  // Link di pagamento mandati dalla gestione: per quante ore tengono i posti (scelta nel modulo).
  orePerPagareLink: [2, 12, 24, 48],
  // Email automatiche: il promemoria parte il giorno prima dalle 18; il grazie qualche ora dopo il rientro.
  promemoria: { ora: '18:00' },
  grazieOreDopo: 2,
  // Buoni regalo comprati online: importi proposti e validità.
  buoni: { importi: [50, 100, 150, 200, 300], minimo: 30, massimo: 2000, validitaMesi: 12 },
};

// Testo unico sul carburante delle esclusive (riepilogo, conferma, email, condizioni).
// "segnaposto" decide come mostrare il dato che manca: [testo] nelle email, riquadro rosa sul sito.
export const CARBURANTE_MANCA = 'come si calcola e quando si paga';
export const testoCarburante = (segnaposto = (e) => `[${e}]`) =>
  `Il carburante non è compreso e si paga a parte: ${regole.carburante || segnaposto(CARBURANTE_MANCA)}.`;

// Minuti di anticipo del ritrovo per un imbarco ('palau' → 30).
export const anticipoDi = (imbarco) => regole.anticipoRitrovo[imbarco] ?? regole.anticipoRitrovo.maddalena;

// Ora di ritrovo al molo per un turno e un imbarco ('9:30 – 13:30', 'palau' → '9:00').
export function oraRitrovo(orario, imbarco = 'maddalena') {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(orario || '').trim());
  if (!m) return '';
  const minuti = Number(m[1]) * 60 + Number(m[2]) - anticipoDi(imbarco);
  return `${Math.floor(minuti / 60)}:${String(minuti % 60).padStart(2, '0')}`;
}
export const testoRitrovo = (orario, imbarco = 'maddalena') => {
  const ora = oraRitrovo(orario, imbarco);
  return ora ? `Ritrovo al molo alle ${ora}, ${anticipoDi(imbarco)} minuti prima della partenza: l'uscita non può aspettare chi arriva in ritardo.` : '';
};

// Frase unica su chiusura online e gruppi grandi (pagina Prenota, FAQ, condizioni, pagine escursione).
export const testoChiusuraOnline = `Online puoi prenotare fino alle ${regole.chiusuraOnline.ora} del giorno prima della partenza.`;

// I gommoni. "posti" conta tutte le persone a bordo, bambini compresi.
// "imbarchi" = da dove parte: chi si imbarca a Cannigione va solo sul gommone di Cannigione, e viceversa.
export const gommoni = [
  { id: 'gruppo-1', nome: 'Joker Clubman 28', tipo: 'gruppo', posti: 12, imbarchi: ['maddalena', 'palau'] },
  { id: 'gruppo-2', nome: 'BWA 30', tipo: 'gruppo', posti: 12, imbarchi: ['maddalena', 'palau'] },
  // Joker 35: il più grande, ma fa solo esclusive con massimo 6 persone (Remo, 8 novembre 2026).
  { id: 'esclusiva', nome: 'Joker 35', tipo: 'esclusiva', posti: 6, imbarchi: ['maddalena', 'palau'] },
  // Honda 9.50: parte da Cannigione e fa mezze giornate, tramonto ed esclusive, come gli altri (Remo, 8 novembre 2026).
  { id: 'cannigione', nome: 'Honda 9.50', tipo: 'gruppo', posti: 12, imbarchi: ['cannigione'] },
];

// Le esclusive possono usare tutti i gommoni: il sistema sceglie il più piccolo che basta,
// così i gommoni da 12 restano liberi per le uscite di gruppo finché possibile.
const tuttiIGommoni = gommoni.map((g) => g.id);

// Persone massime su un gommone: oltre si scrive su WhatsApp.
export const postiMassimi = Math.max(...gommoni.map((g) => g.posti));
export const testoDopoChiusura = `Dopo quell'ora, o per gruppi di più di ${postiMassimi} persone, scrivici su WhatsApp.`;

// Listini usati da più turni.
const giornataPersona = [
  { dal: '05-01', al: '06-30', adulto: 100, bambino: 90 },
  { dal: '07-01', al: '07-31', adulto: 125, bambino: 115 },
  { dal: '08-01', al: '08-31', adulto: 135, bambino: 125 },
  { dal: '09-01', al: '09-30', adulto: 125, bambino: 115 },
  { dal: '10-01', al: '10-31', adulto: 100, bambino: 90 },
];
const mezzaPersona = [
  { dal: '05-01', al: '06-30', adulto: 65, bambino: 60 },
  { dal: '07-01', al: '08-31', adulto: 75, bambino: 70 },
  { dal: '09-01', al: '10-31', adulto: 65, bambino: 60 },
];
// Sunset, aperitivo al tramonto. Remo: "100 € a persona" (11 novembre 2026), in esclusiva "700 – 800 € a seconda del periodo"
// (13 novembre 2026). Periodi e ridotti proposti da Claude (ridotto 10 € in meno), confermati da Remo il 13 novembre 2026.
const tramontoPersona = [
  { dal: '05-01', al: '06-30', adulto: 100, bambino: 90 },
  { dal: '07-01', al: '07-31', adulto: 110, bambino: 100 },
  { dal: '08-01', al: '08-31', adulto: 120, bambino: 110 },
  { dal: '09-01', al: '09-30', adulto: 110, bambino: 100 },
  { dal: '10-01', al: '10-31', adulto: 100, bambino: 90 },
];
const tramontoEsclusiva = [
  { dal: '05-01', al: '06-30', barca: 700 },
  { dal: '07-01', al: '07-31', barca: 750 },
  { dal: '08-01', al: '08-31', barca: 800 },
  { dal: '09-01', al: '09-30', barca: 750 },
  { dal: '10-01', al: '10-31', barca: 700 },
];
// Orari del tramonto: seguono la luce, quindi cambiano nei mesi e sono indicativi (proposti da Claude, confermati da Remo il 13 novembre 2026).
const orariTramonto = [
  { dal: '05-01', al: '05-31', orario: '18:30 – 21:00' },
  { dal: '06-01', al: '06-30', orario: '19:00 – 21:30' },
  { dal: '07-01', al: '08-31', orario: '18:30 – 21:00' },
  { dal: '09-01', al: '09-30', orario: '18:00 – 20:30' },
  { dal: '10-01', al: '10-31', orario: '17:30 – 20:00' },
];
const giornataEsclusiva = [
  { dal: '05-01', al: '06-30', barca: 1200 },
  { dal: '07-01', al: '07-31', barca: 1500 },
  { dal: '08-01', al: '08-31', barca: 1620 },
  { dal: '09-01', al: '09-30', barca: 1500 },
  { dal: '10-01', al: '10-31', barca: 1200 },
];
const mezzaEsclusiva = [
  { dal: '05-01', al: '06-30', barca: 780 },
  { dal: '07-01', al: '08-31', barca: 900 },
  { dal: '09-01', al: '10-31', barca: 780 },
];

// Ogni turno occupa uno o più blocchi della giornata (mattina, pomeriggio, sera):
// un gommone non può fare due uscite diverse nello stesso blocco.
// - la giornata intera occupa anche la sera (chi fa la giornata non esce al tramonto)
// - il pomeriggio finisce alle 18:00, quando parte il tramonto: occupa anche la sera
// "orario" vuoto = sul sito compare un segnaposto finché non viene confermato.
export const offerte = {
  'tour-7-isole': {
    tipo: 'gruppo',
    minimo: 6,
    imbarchi: ['maddalena', 'palau'],
    turni: [
      { id: 'giornata', nome: 'Giornata intera', orario: '9:30 – 17:30', blocchi: ['mattina', 'pomeriggio', 'sera'], prezzi: giornataPersona },
    ],
  },
  // Corsica: solo in esclusiva, giornata intera con gli orari e i prezzi delle altre giornate in esclusiva.
  'corsica-lavezzi-bonifacio': {
    tipo: 'esclusiva',
    carburanteEscluso: true,
    documento: true,
    imbarchi: ['maddalena', 'palau'],
    gommoni: tuttiIGommoni,
    turni: [
      { id: 'giornata', nome: 'Giornata intera', orario: '9:30 – 17:30', blocchi: ['mattina', 'pomeriggio', 'sera'], prezzi: giornataEsclusiva },
    ],
  },
  // Mezza giornata e tramonto sono due attività diverse, con due pagine (Remo, 11 novembre 2026).
  'mezza-giornata': {
    tipo: 'gruppo',
    minimo: 6,
    imbarchi: ['maddalena', 'palau', 'cannigione'],
    turni: [
      { id: 'mattina', nome: 'Mezza giornata, mattina', orario: '9:30 – 13:30', blocchi: ['mattina'], prezzi: mezzaPersona },
      { id: 'pomeriggio', nome: 'Mezza giornata, pomeriggio', orario: '14:00 – 18:00', blocchi: ['pomeriggio', 'sera'], prezzi: mezzaPersona },
    ],
  },
  tramonto: {
    tipo: 'gruppo',
    minimo: 6,
    // Al Sunset di gruppo al massimo 10 persone per gommone (Remo, 13 novembre 2026).
    postiMax: 10,
    imbarchi: ['maddalena', 'palau', 'cannigione'],
    turni: [
      { id: 'tramonto', nome: 'Sunset, aperitivo al tramonto', orario: '18:30 – 21:00', orari: orariTramonto, indicativo: true, blocchi: ['sera'], prezzi: tramontoPersona },
    ],
  },
  'tour-privato': {
    tipo: 'esclusiva',
    carburanteEscluso: true,
    imbarchi: ['maddalena', 'palau', 'cannigione'],
    gommoni: tuttiIGommoni,
    turni: [
      { id: 'mattina', nome: 'Mezza giornata, mattina', orario: '9:30 – 13:30', blocchi: ['mattina'], prezzi: mezzaEsclusiva },
      { id: 'pomeriggio', nome: 'Mezza giornata, pomeriggio', orario: '14:00 – 18:00', blocchi: ['pomeriggio', 'sera'], prezzi: mezzaEsclusiva },
      { id: 'tramonto', nome: 'Sunset, aperitivo al tramonto', orario: '18:30 – 21:00', orari: orariTramonto, indicativo: true, blocchi: ['sera'], prezzi: tramontoEsclusiva },
      { id: 'giornata', nome: 'Giornata intera', orario: '9:30 – 17:30', blocchi: ['mattina', 'pomeriggio', 'sera'], prezzi: giornataEsclusiva },
    ],
  },
};

// Piattaforme e canali da cui la persona dedicata inserisce a mano le prenotazioni.
export const canaliEsterni = [
  'GetYourGuide', 'Viator', 'Musement', 'Civitatis', 'Tiqets', 'Klook', 'Airbnb Esperienze',
  'Click&Boat', 'SamBoat', 'Nautal', 'Telefono o WhatsApp', 'Al molo', 'Altro',
];

export const imbarchiPrenotazione = [
  // La Maddalena è il porto principale; Palau è un punto di raccolta: il gommone passa a prendere i clienti (Remo, 11 novembre 2026).
  { id: 'maddalena', nome: 'La Maddalena' },
  { id: 'palau', nome: 'Palau' },
  { id: 'cannigione', nome: 'Cannigione' },
];

// ---------- Calcoli usati sia dal sito sia dal server ----------

export const offertaDi = (slug) => offerte[slug] ?? null;
export const turnoDi = (slug, turno) => offerte[slug]?.turni.find((t) => t.id === turno) ?? null;

// Orario di un turno in una certa data: alcuni turni (il tramonto) cambiano orario nei mesi.
export function orarioDi(turno, data) {
  if (!turno) return '';
  const riga = data && turno.orari ? rigaPrezzo(turno.orari, data) : null;
  return riga?.orario ?? turno.orario ?? '';
}

// Posti prenotabili su un gommone per un'offerta di gruppo (alcune uscite hanno un tetto più basso del gommone).
export const postiPer = (offerta, gommone) => Math.min(gommone.posti, offerta?.tipo === 'gruppo' && offerta.postiMax ? offerta.postiMax : gommone.posti);

// Punti d'imbarco da cui parte un'offerta.
export const imbarchiPer = (slug) => imbarchiPrenotazione.filter((i) => offerte[slug]?.imbarchi.includes(i.id));

// Gommoni che può usare un'offerta (da un certo imbarco, se indicato).
export function gommoniPer(slug, imbarco = null) {
  const o = offerte[slug];
  if (!o) return [];
  const base = o.gommoni ? gommoni.filter((g) => o.gommoni.includes(g.id)) : gommoni.filter((g) => g.tipo === o.tipo);
  const da = imbarco ? [imbarco] : o.imbarchi;
  return base.filter((g) => g.imbarchi.some((i) => da.includes(i)));
}

// Riga di listino valida per una data 'AAAA-MM-GG'.
export function rigaPrezzo(righe, data) {
  const md = String(data).slice(5, 10);
  return (righe ?? []).find((r) => md >= r.dal && md <= r.al) ?? null;
}

export const inStagione = (data) => data >= regole.stagione.dal && data <= regole.stagione.al;

// Prezzo "da" da mostrare sul sito (il più basso della stagione, tra tutti i turni o solo tra quelli indicati).
export function prezzoDa(slug, soloTurni) {
  const o = offerte[slug];
  if (!o) return null;
  const turni = soloTurni ? o.turni.filter((t) => soloTurni.includes(t.id)) : o.turni;
  const righe = turni.flatMap((t) => t.prezzi);
  if (o.tipo === 'esclusiva') return { barca: Math.min(...righe.map((r) => r.barca)) };
  const piuEconomica = righe.reduce((a, b) => (b.adulto < a.adulto ? b : a));
  return { adulto: piuEconomica.adulto, bambino: piuEconomica.bambino };
}

// ---------- Regole di prezzo, codici sconto, extra e buoni regalo ----------
// Le regole (promozioni, weekend), i codici e gli extra si creano dalla gestione: qui c'è solo il calcolo,
// uguale sul sito e sul server (il server ricalcola sempre tutto).

const arrotonda = (n) => Math.round(n * 100) / 100;
const listaDi = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

// Data e ora di Roma (funziona nel browser e sul server).
export function adessoRoma(adesso = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(adesso).map((x) => [x.type, x.value]));
  return { data: `${p.year}-${p.month}-${p.day}`, ora: `${p.hour}:${p.minute}` };
}

// Ore che mancano alla partenza di un turno (ora di Roma).
export function oreAllaPartenza(data, orario, adesso = new Date()) {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(orario || '').trim()) || [null, '9', '30'];
  const [a, me, g] = data.split('-').map(Number);
  const ipotesi = Date.UTC(a, me - 1, g, Number(m[1]), Number(m[2]));
  // Ora di Roma = UTC + 1 o + 2: si controlla quale delle due dà l'orario giusto.
  for (const scarto of [2, 1]) {
    const istante = new Date(ipotesi - scarto * 3600000);
    if (adessoRoma(istante).ora === `${String(m[1]).padStart(2, '0')}:${m[2]}`) return (istante - adesso) / 3600000;
  }
  return (ipotesi - 3600000 - adesso) / 3600000;
}

const giorniTra = (da, a) => Math.round((Date.parse(`${a}T12:00:00Z`) - Date.parse(`${da}T12:00:00Z`)) / 86400000);
const valePer = (r, slug, data) => (!r.escursioni || listaDi(r.escursioni).includes(slug)) && (!r.dal || data >= r.dal) && (!r.al || data <= r.al);
const eWeekend = (data) => [0, 6].includes(new Date(`${data}T12:00:00Z`).getUTCDay());

// Una regola di prezzo vale per questa prenotazione?
export function regolaValida(r, { slug, data, orario, persone, adesso = new Date() }) {
  if (!r || r.attiva === false || r.attiva === 0 || !valePer(r, slug, data)) return false;
  if (r.tipo === 'weekend') return eWeekend(data);
  if (r.tipo === 'anticipo') return giorniTra(adessoRoma(adesso).data, data) >= Number(r.soglia);
  if (r.tipo === 'ultimo-minuto') { const ore = oreAllaPartenza(data, orario, adesso); return ore >= 0 && ore <= Number(r.soglia); }
  if (r.tipo === 'gruppo') return persone >= Number(r.soglia);
  return false;
}

export const NOMI_REGOLE = {
  anticipo: 'Prenotazione anticipata',
  'ultimo-minuto': 'Ultimo minuto',
  gruppo: 'Sconto gruppo',
  weekend: 'Weekend',
};

// Il codice sconto vale per questa prenotazione? Restituisce un messaggio se non vale.
export function erroreCodice(c, slug, data) {
  if (!c) return 'Codice non valido.';
  if (c.tipo === 'buono') {
    if (c.al && adessoRoma().data > c.al) return 'Questo buono regalo è scaduto.';
    if (!(c.saldo > 0)) return 'Questo buono regalo è già stato usato tutto.';
    return null;
  }
  if (c.escursioni && !listaDi(c.escursioni).includes(slug)) return 'Questo codice non vale per questa escursione.';
  if ((c.dal && data < c.dal) || (c.al && data > c.al)) return 'Questo codice non vale per questa data.';
  if (c.esaurito) return 'Questo codice è già stato usato il numero massimo di volte.';
  return null;
}

// Calcola persone, posti occupati e totale (in euro) di una prenotazione, con regole di prezzo, codice, extra e buono.
// opzioni: { regole: [...], codice: {...}, extra: [catalogo], extraScelti: { id: quantità }, adesso }
// Restituisce { errore } se qualcosa non va.
export function calcolaPrenotazione(slug, turnoId, data, persone, opzioni = {}) {
  const base = calcolaListino(slug, turnoId, data, persone);
  if (base.errore) return base;
  const { regole: rp = [], codice = null, extra = [], extraScelti = {}, adesso = new Date() } = opzioni;
  const turno = turnoDi(slug, turnoId);
  const ctx = { slug, data, orario: orarioDi(turno, data), persone: base.persone, adesso };
  const righe = [...base.righe];
  let prezzo = base.totale;

  // Weekend: percentuale in più sul listino.
  const weekend = rp.filter((r) => r.tipo === 'weekend' && regolaValida(r, ctx)).sort((a, b) => b.percentuale - a.percentuale)[0];
  if (weekend) {
    const piu = arrotonda((base.totale * weekend.percentuale) / 100);
    righe.push({ testo: `${weekend.nome || NOMI_REGOLE.weekend} +${weekend.percentuale}%`, importo: piu });
    prezzo = arrotonda(prezzo + piu);
  }

  // Sconti: si applica il migliore tra le promozioni e il codice sconto (non si sommano).
  const promo = rp.filter((r) => r.tipo !== 'weekend' && regolaValida(r, ctx))
    .map((r) => ({ nota: `${r.nome || NOMI_REGOLE[r.tipo]} −${r.percentuale}%`, importo: arrotonda((prezzo * r.percentuale) / 100) }))
    .sort((a, b) => b.importo - a.importo)[0];
  let scontoCodice = null;
  let codiceErrore = null;
  if (codice && codice.tipo !== 'buono') {
    codiceErrore = erroreCodice(codice, slug, data);
    if (!codiceErrore) {
      const importo = codice.tipo === 'percentuale' ? arrotonda((prezzo * codice.valore) / 100) : Math.min(prezzo, Number(codice.valore));
      scontoCodice = { nota: `Codice ${codice.codice}${codice.tipo === 'percentuale' ? ` −${codice.valore}%` : ''}`, importo };
    }
  }
  const migliore = [promo, scontoCodice].filter(Boolean).sort((a, b) => b.importo - a.importo)[0] || null;
  let codiceNonCumulabile = false;
  if (scontoCodice && promo && migliore === promo) { codiceErrore = 'Il codice non si somma alla promozione già applicata, che conviene di più.'; codiceNonCumulabile = true; }
  if (migliore) { righe.push({ testo: migliore.nota, importo: -migliore.importo }); prezzo = arrotonda(prezzo - migliore.importo); }

  // Extra a pagamento (non scontati).
  const scelti = [];
  for (const [id, q] of Object.entries(extraScelti || {})) {
    const quantita = Number(q) || 0;
    if (!quantita) continue;
    const e = extra.find((x) => String(x.id) === String(id));
    if (!e || (e.escursioni && !listaDi(e.escursioni).includes(slug))) return { errore: 'Extra non disponibile per questa escursione.' };
    const massimo = e.modo === 'persona' ? base.persone : 1;
    if (!Number.isInteger(quantita) || quantita < 0 || quantita > massimo) return { errore: `Quantità non valida per: ${e.nome}.` };
    if (e.rimanenti !== null && e.rimanenti !== undefined && quantita > e.rimanenti) return { errore: `${e.nome}: ne restano ${e.rimanenti} per questo giorno.` };
    const totaleExtra = arrotonda(quantita * e.prezzo);
    scelti.push({ id: e.id, nome: e.nome, quantita, prezzo: e.prezzo, totale: totaleExtra });
    righe.push({ testo: `${e.nome}${e.modo === 'persona' ? ` × ${quantita}` : ''}`, importo: totaleExtra });
  }
  const extraTotale = arrotonda(scelti.reduce((s, x) => s + x.totale, 0));
  const totale = arrotonda(prezzo + extraTotale);

  // Buono regalo: paga tutto o una parte del totale.
  let buono = 0;
  if (codice && codice.tipo === 'buono') {
    codiceErrore = erroreCodice(codice, slug, data);
    if (!codiceErrore) {
      buono = Math.min(totale, Number(codice.saldo));
      righe.push({ testo: `Buono regalo ${codice.codice}`, importo: -buono, buono: true });
    }
  }

  return {
    ...base,
    righe,
    listino: base.totale,
    totale,
    sconto: migliore ? migliore.importo : 0,
    scontoNota: migliore ? migliore.nota : null,
    maggiorazione: weekend ? arrotonda((base.totale * weekend.percentuale) / 100) : 0,
    usaCodice: Boolean((migliore && migliore === scontoCodice) || buono),
    codiceErrore,
    codiceNonCumulabile,
    extraScelti: scelti,
    extraTotale,
    buono,
    daPagare: arrotonda(totale - buono),
  };
}

// Solo listino: persone, posti e prezzo base.
function calcolaListino(slug, turnoId, data, persone) {
  const o = offerte[slug];
  const t = turnoDi(slug, turnoId);
  if (!o || !t) return { errore: 'Escursione o turno non validi.' };
  const adulti = Number(persone.adulti) || 0;
  // Niente più "neonati" (0–3 gratis): se arrivano da una versione vecchia, contano come bambini.
  const vecchiNeonati = Number(persone.neonati) || 0;
  const bambini = (Number(persone.bambini) || 0) + vecchiNeonati;
  const neonati = 0;
  if ([adulti, bambini, vecchiNeonati].some((n) => !Number.isInteger(n) || n < 0 || n > 20)) return { errore: 'Numero di persone non valido.' };
  if (adulti < 1) return { errore: 'Serve almeno un adulto.' };
  const totPersone = adulti + bambini;
  const paganti = totPersone;
  const riga = rigaPrezzo(t.prezzi, data);
  if (!riga) return { errore: 'Nessun prezzo per questa data.' };
  const capienza = Math.max(...gommoniPer(slug).map((g) => postiPer(o, g)));

  if (o.tipo === 'esclusiva') {
    if (totPersone > capienza) return { errore: `In esclusiva il gommone porta al massimo ${capienza} persone, bambini compresi: per gruppi più grandi scrivici su WhatsApp.` };
    // "posti" viene poi portato alla capienza del gommone scelto: in esclusiva il gommone è tutto vostro.
    return {
      adulti, bambini, neonati, persone: totPersone, paganti, posti: totPersone, totale: riga.barca,
      righe: [{ testo: `${t.nome}, gommone solo per voi`, importo: riga.barca }],
      carburanteEscluso: Boolean(o.carburanteEscluso),
    };
  }

  if (totPersone > capienza) return { errore: `Su questa uscita ci sono al massimo ${capienza} posti: per gruppi più grandi scrivici su WhatsApp.` };
  const righe = [];
  if (adulti) righe.push({ testo: `${adulti} × intero ${riga.adulto} €`, importo: adulti * riga.adulto });
  if (bambini) righe.push({ testo: `${bambini} × ridotto fino a ${regole.eta.bambiniFinoA} anni ${riga.bambino} €`, importo: bambini * riga.bambino });
  const totale = righe.reduce((s, r) => s + r.importo, 0);
  return { adulti, bambini, neonati, persone: totPersone, paganti, posti: totPersone, totale, righe, carburanteEscluso: false };
}
