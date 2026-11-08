// Creazione di una prenotazione: dal sito (cliente o struttura) o dalla gestione (prenotazioni dalle altre piattaforme).

import { offerte, turnoDi, regole, imbarchiPrenotazione, canaliEsterni, calcolaPrenotazione } from '../../src/data/prenotazioni.js';
import { prima } from './db.js';
import { caricaGiorni, situazioneTurno, inserisciPrenotazione, prenotabileOnline, prenotabileGestione } from './motore.js';
import { Errore, testo, testoLungo, intero, email, telefono, dataValida, codicePrenotazione, tokenSicuro, adessoISO, traMinutiISO } from './util.js';

const MOTIVI = {
  'fuori-stagione': 'In questa data non ci sono uscite: la stagione va dal 1° maggio al 31 ottobre.',
  chiuso: 'Online si prenota fino alle 20 del giorno prima. Per domani o per oggi scrivici su WhatsApp.',
  passato: 'La data è già passata.',
};

// modo: 'online' (cliente o struttura collegata) | 'gestione'
export async function creaPrenotazione(contesto, b, { modo, utente = null, ipHash = null }) {
  const db = contesto.env.DB;
  const slug = testo(b.escursione, { campo: 'escursione', massimo: 60, obbligatorio: true });
  const turnoId = testo(b.turno, { campo: 'turno', massimo: 30, obbligatorio: true });
  const offerta = offerte[slug];
  const turno = turnoDi(slug, turnoId);
  if (!offerta || !turno) throw new Errore(400, 'Escursione o turno non validi.');
  if (!dataValida(b.data)) throw new Errore(400, 'Data non valida.');
  const ok = modo === 'gestione' ? prenotabileGestione(b.data) : prenotabileOnline(b.data);
  if (!ok.ok) throw new Errore(409, MOTIVI[ok.motivo] ?? 'Data non prenotabile.');

  const persone = {
    adulti: intero(b.adulti, { campo: 'adulti', min: 0, max: 20 }),
    bambini: intero(b.bambini ?? 0, { campo: 'bambini', min: 0, max: 20 }),
    neonati: intero(b.neonati ?? 0, { campo: 'neonati', min: 0, max: 20 }),
  };
  const calcolo = calcolaPrenotazione(slug, turnoId, b.data, persone);
  if (calcolo.errore) throw new Errore(400, calcolo.errore);
  if (!imbarchiPrenotazione.some((i) => i.id === b.imbarco)) throw new Errore(400, "Scegli il punto d'imbarco.");

  const nome = testo(b.nome, { campo: 'nome e cognome', massimo: 100, obbligatorio: true });
  const gestione = modo === 'gestione';
  const mail = email(b.email, !gestione);
  const tel = telefono(b.telefono, !gestione);
  const note = testoLungo(b.note, 1000);

  let totale = Math.round(calcolo.totale * 100);
  let partner = null;
  let canale = 'sito';
  let creataDa = 'cliente';
  let rifEsterno = null;
  let pagato = 0;

  if (gestione) {
    canale = testo(b.canale, { campo: 'canale', massimo: 40, obbligatorio: true });
    if (!canaliEsterni.includes(canale) && canale !== 'Struttura partner') throw new Errore(400, 'Canale non valido.');
    rifEsterno = testo(b.rifEsterno, { campo: 'codice della piattaforma', massimo: 80 }) || null;
    if (b.importo !== undefined && b.importo !== null && String(b.importo).trim() !== '') {
      const importo = Number(String(b.importo).replace(',', '.'));
      if (!Number.isFinite(importo) || importo < 0 || importo > 100000) throw new Errore(400, 'Importo non valido.');
      totale = Math.round(importo * 100);
    }
    if (b.pagato === true) pagato = totale;
    if (b.partnerId) {
      partner = await prima(db, 'SELECT id, provvigione_pct FROM partner WHERE id = :id AND attivo = 1', { id: Number(b.partnerId) });
      if (!partner) throw new Errore(400, 'Struttura non trovata.');
      canale = 'Struttura partner';
    }
    creataDa = `gestione:${utente.id}`;
  } else if (utente?.ruolo === 'partner') {
    partner = { id: utente.partner_id, provvigione_pct: utente.provvigione_pct };
    canale = 'struttura';
    creataDa = `partner:${utente.id}`;
  } else if (typeof b.partner === 'string' && b.partner.trim()) {
    partner = await prima(db, 'SELECT id, provvigione_pct FROM partner WHERE codice = :c AND attivo = 1', { c: b.partner.trim().toUpperCase().slice(0, 20) });
    if (partner) canale = 'link-struttura';
  }

  const pct = partner ? Number(partner.provvigione_pct ?? regole.provvigioneStrutture) : 0;
  const provvigione = partner ? Math.round((totale * pct) / 100) : 0;

  const ora = adessoISO();
  const giorni = await caricaGiorni(db, b.data, b.data, ora);
  const situazione = situazioneTurno(slug, turnoId, giorni.giorno(b.data), calcolo.posti);
  if (!situazione.candidati.length) {
    throw new Errore(409, situazione.disponibile
      ? `Su questo turno restano posti per massimo ${situazione.maxPersone} persone.`
      : 'Posti esauriti per questo turno: scegli un altro giorno o un altro turno.');
  }

  const dati = {
    codice: codicePrenotazione(),
    token: tokenSicuro(24),
    escursione: slug,
    turno: turnoId,
    data: b.data,
    adulti: calcolo.adulti,
    bambini: calcolo.bambini,
    neonati: calcolo.neonati,
    posti: calcolo.posti,
    paganti: calcolo.paganti,
    imbarco: b.imbarco,
    nome,
    email: mail || null,
    telefono: tel || null,
    note: note || null,
    totale,
    pagato,
    provvigione,
    stato: gestione ? 'confermata' : 'in_attesa',
    canale,
    partner_id: partner?.id ?? null,
    metodo: gestione ? 'esterno' : b.metodo,
    rif_esterno: rifEsterno,
    ip_hash: ipHash,
    scade_il: gestione ? null : traMinutiISO(regole.minutiPerPagare),
    creata_da: creataDa,
  };

  let inserita = null;
  for (let tentativo = 0; tentativo < 3; tentativo++) {
    try {
      inserita = await inserisciPrenotazione(db, dati, situazione.candidati, ora);
      break;
    } catch (e) {
      if (String(e?.message || e).includes('UNIQUE') && tentativo < 2) { dati.codice = codicePrenotazione(); continue; }
      throw e;
    }
  }
  if (!inserita) throw new Errore(409, 'Qualcuno ha appena preso gli ultimi posti: scegli un altro turno o un altro giorno.');
  return { ...dati, id: inserita.id, barca: inserita.barca };
}
