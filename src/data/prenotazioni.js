// Prenotazioni online: gommoni, turni, prezzi e regole.
// Il sito e il sistema di prenotazione leggono tutto da qui: per cambiare un prezzo basta cambiarlo
// in questo file e pubblicare. Prezzi in euro, IVA inclusa.
//
// Ogni turno ha il suo listino: ogni riga vale tra due date mese-giorno ('05-01' = 1 maggio).
// - gruppo:    adulto = prezzo intero a persona, bambino = ridotto (4–10 anni); 0–3 anni gratis
// - esclusiva: barca  = prezzo del gommone solo per il gruppo
//
// Listini dal cliente (8 novembre 2026):
// - giornata intera e mezza giornata, a persona e in esclusiva;
// - tramonto: stesso prezzo della mezza giornata;
// - Corsica: solo in esclusiva, stesso prezzo delle altre giornate intere in esclusiva;
// - a tutte le esclusive si aggiunge il carburante.
// Tutti e tre i gommoni si possono prenotare in esclusiva (quello da 6 posti fa solo esclusive).

export const regole = {
  // false = i bottoni "Prenota" tornano alla richiesta su WhatsApp (utile finché i conti di pagamento non sono attivi)
  attive: true,
  stagione: { dal: '2027-05-01', al: '2027-10-31' },
  // Online si prenota fino alle 20 del giorno prima; per l'ultimo minuto si scrive su WhatsApp.
  chiusuraOnline: { giorniPrima: 1, ora: '20:00' },
  // Per quanti minuti i posti restano tenuti da parte mentre il cliente paga.
  minutiPerPagare: 30,
  // Rimborso completo se il cliente annulla almeno 48 ore prima.
  cancellazioneGratisOre: 48,
  // Provvigione delle strutture partner, in percentuale sul lordo pagato dal cliente.
  provvigioneStrutture: 15,
  // Fasce d'età: 0–3 gratis, 4–10 ridotto, da 11 anni intero.
  eta: { neonatiFinoA: 3, bambiniFinoA: 10 },
  // Esclusive: il carburante si paga a parte. La legge chiede di dire prima come si calcola e quando si paga
  // (es. 'a consumo, si paga a bordo a fine uscita'). Finché è vuoto, sul sito e nelle email compare un segnaposto.
  carburante: '',
};

// Testo unico sul carburante delle esclusive (riepilogo, conferma, email, condizioni).
// "segnaposto" decide come mostrare il dato che manca: [testo] nelle email, riquadro rosa sul sito.
export const CARBURANTE_MANCA = 'come si calcola e quando si paga';
export const testoCarburante = (segnaposto = (e) => `[${e}]`) =>
  `Il carburante non è compreso e si paga a parte: ${regole.carburante || segnaposto(CARBURANTE_MANCA)}.`;

// Frase unica su chiusura online e gruppi grandi (pagina Prenota, FAQ, condizioni, pagine escursione).
export const testoChiusuraOnline = `Online puoi prenotare fino alle ${regole.chiusuraOnline.ora} del giorno prima della partenza.`;

// I gommoni. "posti" conta tutte le persone a bordo, neonati compresi.
export const gommoni = [
  { id: 'gruppo-1', nome: 'Gommone 1', tipo: 'gruppo', posti: 12 },
  { id: 'gruppo-2', nome: 'Gommone 2', tipo: 'gruppo', posti: 12 },
  { id: 'esclusiva', nome: 'Gommone esclusiva', tipo: 'esclusiva', posti: 6 },
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
    turni: [
      { id: 'giornata', nome: 'Giornata intera', orario: '9:30 – 17:30', blocchi: ['mattina', 'pomeriggio', 'sera'], prezzi: giornataPersona },
    ],
  },
  // Corsica: solo in esclusiva, giornata intera con gli orari e i prezzi delle altre giornate in esclusiva.
  'corsica-lavezzi-bonifacio': {
    tipo: 'esclusiva',
    carburanteEscluso: true,
    documento: true,
    gommoni: tuttiIGommoni,
    turni: [
      { id: 'giornata', nome: 'Giornata intera', orario: '9:30 – 17:30', blocchi: ['mattina', 'pomeriggio', 'sera'], prezzi: giornataEsclusiva },
    ],
  },
  'tramonto-mezza-giornata': {
    tipo: 'gruppo',
    minimo: 6,
    turni: [
      { id: 'mattina', nome: 'Mezza giornata, mattina', orario: '9:30 – 13:30', blocchi: ['mattina'], prezzi: mezzaPersona },
      { id: 'pomeriggio', nome: 'Mezza giornata, pomeriggio', orario: '14:00 – 18:00', blocchi: ['pomeriggio', 'sera'], prezzi: mezzaPersona },
      { id: 'tramonto', nome: 'Tramonto con aperitivo', orario: '18:00 – 20:30', blocchi: ['sera'], prezzi: mezzaPersona },
    ],
  },
  'tour-privato': {
    tipo: 'esclusiva',
    carburanteEscluso: true,
    gommoni: tuttiIGommoni,
    turni: [
      { id: 'mattina', nome: 'Mezza giornata, mattina', orario: '9:30 – 13:30', blocchi: ['mattina'], prezzi: mezzaEsclusiva },
      { id: 'pomeriggio', nome: 'Mezza giornata, pomeriggio', orario: '14:00 – 18:00', blocchi: ['pomeriggio', 'sera'], prezzi: mezzaEsclusiva },
      { id: 'tramonto', nome: 'Tramonto con aperitivo', orario: '18:00 – 20:30', blocchi: ['sera'], prezzi: mezzaEsclusiva },
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
  { id: 'palau', nome: 'Palau' },
  { id: 'maddalena', nome: 'La Maddalena' },
];

// ---------- Calcoli usati sia dal sito sia dal server ----------

export const offertaDi = (slug) => offerte[slug] ?? null;
export const turnoDi = (slug, turno) => offerte[slug]?.turni.find((t) => t.id === turno) ?? null;

// Gommoni che può usare un'offerta.
export function gommoniPer(slug) {
  const o = offerte[slug];
  if (!o) return [];
  return o.gommoni ? gommoni.filter((g) => o.gommoni.includes(g.id)) : gommoni.filter((g) => g.tipo === o.tipo);
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

// Calcola persone, posti occupati e totale (in euro) di una prenotazione.
// Restituisce { errore } se qualcosa non va.
export function calcolaPrenotazione(slug, turnoId, data, persone) {
  const o = offerte[slug];
  const t = turnoDi(slug, turnoId);
  if (!o || !t) return { errore: 'Escursione o turno non validi.' };
  const adulti = Number(persone.adulti) || 0;
  const bambini = Number(persone.bambini) || 0;
  const neonati = Number(persone.neonati) || 0;
  if ([adulti, bambini, neonati].some((n) => !Number.isInteger(n) || n < 0 || n > 20)) return { errore: 'Numero di persone non valido.' };
  if (adulti < 1) return { errore: 'Serve almeno un adulto.' };
  const totPersone = adulti + bambini + neonati;
  const paganti = adulti + bambini;
  const riga = rigaPrezzo(t.prezzi, data);
  if (!riga) return { errore: 'Nessun prezzo per questa data.' };
  const capienza = Math.max(...gommoniPer(slug).map((g) => g.posti));

  if (o.tipo === 'esclusiva') {
    if (totPersone > capienza) return { errore: `In esclusiva il gommone porta al massimo ${capienza} persone, neonati compresi: per gruppi più grandi scrivici su WhatsApp.` };
    // "posti" viene poi portato alla capienza del gommone scelto: in esclusiva il gommone è tutto vostro.
    return {
      adulti, bambini, neonati, persone: totPersone, paganti, posti: totPersone, totale: riga.barca,
      righe: [{ testo: `${t.nome}, gommone solo per voi`, importo: riga.barca }],
      carburanteEscluso: Boolean(o.carburanteEscluso),
    };
  }

  if (totPersone > capienza) return { errore: `Su un gommone ci sono ${capienza} posti: per gruppi più grandi scrivici su WhatsApp.` };
  const righe = [];
  if (adulti) righe.push({ testo: `${adulti} × intero ${riga.adulto} €`, importo: adulti * riga.adulto });
  if (bambini) righe.push({ testo: `${bambini} × ridotto 4–10 anni ${riga.bambino} €`, importo: bambini * riga.bambino });
  if (neonati) righe.push({ testo: `${neonati} × 0–3 anni gratis`, importo: 0 });
  const totale = righe.reduce((s, r) => s + r.importo, 0);
  return { adulti, bambini, neonati, persone: totPersone, paganti, posti: totPersone, totale, righe, carburanteEscluso: false };
}
