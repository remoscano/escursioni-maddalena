// Il cuore delle prenotazioni: quanti posti ci sono, su quale gommone va una prenotazione,
// e inserimento "a prova di doppia prenotazione" (il controllo e l'inserimento avvengono in un'unica istruzione).

import { offerte, gommoni, regole, turnoDi, inStagione, gommoniPer } from '../../src/data/prenotazioni.js';
import { tutte, esegui, istruzione } from './db.js';
import { oraRoma, aggiungiGiorni } from './util.js';

// Una prenotazione occupa posti se è confermata o se è in attesa di pagamento e non è scaduta.
const ATTIVA = `(p.stato IN ('confermata', 'da_verificare') OR (p.stato = 'in_attesa' AND p.scade_il > :ora))`;

const lista = (s) => String(s || '').split(',').filter(Boolean);
const siSovrappongono = (a, b) => a.some((x) => b.includes(x));

// Carica prenotazioni attive e chiusure tra due date, raggruppate per giorno.
export async function caricaGiorni(db, dal, al, ora) {
  const [pren, chiusure] = await Promise.all([
    tutte(db, `SELECT p.id, p.data, p.barca, p.escursione, p.turno, p.blocchi, p.posti, p.paganti
               FROM prenotazioni p WHERE p.data BETWEEN :dal AND :al AND ${ATTIVA}`, { dal, al, ora }),
    tutte(db, 'SELECT id, data, barca, blocco, motivo FROM blocchi WHERE data BETWEEN :dal AND :al', { dal, al }),
  ]);
  const giorni = new Map();
  const giorno = (d) => {
    if (!giorni.has(d)) giorni.set(d, { pren: [], chiusure: [] });
    return giorni.get(d);
  };
  for (const p of pren) giorno(p.data).pren.push(p);
  for (const c of chiusure) giorno(c.data).chiusure.push(c);
  return { giorno: (d) => giorni.get(d) ?? { pren: [], chiusure: [] } };
}

// Situazione di un gommone per un turno richiesto, in un giorno.
export function analizzaGommone(gommone, giorno, slug, turno, escludiId = null) {
  const chiuso = giorno.chiusure.some((c) => (c.barca === gommone.id || c.barca === '*') && turno.blocchi.includes(c.blocco));
  if (chiuso) return { libero: false, motivo: 'chiuso', occupati: 0, paganti: 0, liberi: 0 };
  let occupati = 0;
  let paganti = 0;
  let conflitto = false;
  for (const p of giorno.pren) {
    if (p.barca !== gommone.id || p.id === escludiId) continue;
    if (!siSovrappongono(lista(p.blocchi), turno.blocchi)) continue;
    if (p.escursione === slug && p.turno === turno.id) { occupati += p.posti; paganti += p.paganti; }
    else conflitto = true;
  }
  if (conflitto) return { libero: false, motivo: 'occupato', occupati, paganti, liberi: 0 };
  return { libero: true, motivo: null, occupati, paganti, liberi: gommone.posti - occupati };
}

// Disponibilità di un turno in un giorno. "candidati" = gommoni su cui provare a inserire, in ordine.
export function situazioneTurno(slug, turnoId, giorno, postiRichiesti = 1, escludiId = null) {
  const offerta = offerte[slug];
  const turno = turnoDi(slug, turnoId);
  const adatti = gommoniPer(slug);
  const stati = adatti.map((g) => ({ gommone: g, ...analizzaGommone(g, giorno, slug, turno, escludiId) }));

  if (offerta.tipo === 'esclusiva') {
    // In esclusiva il gommone dev'essere vuoto; si sceglie il più piccolo che basta.
    const liberi = stati.filter((s) => s.libero && s.occupati === 0).sort((a, b) => a.gommone.posti - b.gommone.posti);
    return {
      disponibile: liberi.length > 0,
      maxPersone: Math.max(0, ...liberi.map((s) => s.gommone.posti)),
      candidati: liberi.filter((s) => s.gommone.posti >= postiRichiesti).map((s) => s.gommone.id),
      stati,
    };
  }

  // Gruppo: prima le uscite già aperte (le più piene, per arrivare prima al minimo), poi i gommoni vuoti.
  const aperte = stati.filter((s) => s.libero && s.occupati > 0 && s.liberi > 0).sort((a, b) => b.paganti - a.paganti || a.liberi - b.liberi);
  const vuoti = stati.filter((s) => s.libero && s.occupati === 0);
  const maxPersone = Math.max(0, ...aperte.map((s) => s.liberi), ...vuoti.map((s) => s.gommone.posti));
  const migliore = stati.filter((s) => s.occupati > 0 && s.libero).sort((a, b) => b.paganti - a.paganti)[0];
  const paganti = migliore ? migliore.paganti : 0;
  return {
    disponibile: maxPersone > 0,
    maxPersone,
    confermata: paganti >= offerta.minimo,
    mancano: Math.max(0, offerta.minimo - paganti),
    candidati: [...aperte.filter((s) => s.liberi >= postiRichiesti), ...vuoti.filter((s) => s.gommone.posti >= postiRichiesti)].map((s) => s.gommone.id),
    stati,
  };
}

// Si può ancora prenotare online questa data? (stagione e chiusura alle 20 del giorno prima)
export function prenotabileOnline(data, adesso = new Date()) {
  if (!inStagione(data)) return { ok: false, motivo: 'fuori-stagione' };
  const roma = oraRoma(adesso);
  const ultimoGiorno = aggiungiGiorni(data, -regole.chiusuraOnline.giorniPrima);
  if (roma.data > ultimoGiorno) return { ok: false, motivo: 'chiuso' };
  if (roma.data === ultimoGiorno && roma.ora >= regole.chiusuraOnline.ora) return { ok: false, motivo: 'chiuso' };
  return { ok: true };
}

// Il gestore può inserire prenotazioni anche per oggi (es. dalle altre piattaforme), ma non nel passato.
export function prenotabileGestione(data, adesso = new Date()) {
  if (!inStagione(data)) return { ok: false, motivo: 'fuori-stagione' };
  if (data < oraRoma(adesso).data) return { ok: false, motivo: 'passato' };
  return { ok: true };
}

// Condizioni SQL che impediscono la doppia prenotazione su un gommone.
function condizioniPosto(turno, escludiSe = false) {
  const sovrapposizione = turno.blocchi.map((b) => `p.blocchi LIKE '%,${b},%'`).join(' OR ');
  const blocchi = turno.blocchi.map((b) => `'${b}'`).join(', ');
  const escludi = escludiSe ? 'AND p.id != :id' : '';
  return `
    NOT EXISTS (SELECT 1 FROM blocchi c WHERE c.data = :data AND (c.barca = :barca OR c.barca = '*') AND c.blocco IN (${blocchi}))
    AND NOT EXISTS (SELECT 1 FROM prenotazioni p WHERE p.data = :data AND p.barca = :barca AND ${ATTIVA} ${escludi}
                    AND (${sovrapposizione}) AND NOT (p.escursione = :escursione AND p.turno = :turno))
    AND (SELECT COALESCE(SUM(p.posti), 0) FROM prenotazioni p WHERE p.data = :data AND p.barca = :barca
         AND p.escursione = :escursione AND p.turno = :turno AND ${ATTIVA} ${escludi}) + :posti <= :capienza`;
}

const COLONNE = [
  'codice', 'token', 'escursione', 'turno', 'data', 'barca', 'blocchi', 'adulti', 'bambini', 'neonati', 'posti', 'paganti',
  'imbarco', 'nome', 'email', 'telefono', 'note', 'totale', 'pagato', 'provvigione', 'stato', 'canale', 'partner_id', 'metodo',
  'rif_esterno', 'ip_hash', 'scade_il', 'creata_da',
];

// Inserisce la prenotazione sul primo gommone libero tra i candidati. Restituisce { id, barca } o null se i posti sono finiti.
export async function inserisciPrenotazione(db, dati, candidati, ora) {
  const turno = turnoDi(dati.escursione, dati.turno);
  const esclusiva = offerte[dati.escursione].tipo === 'esclusiva';
  for (const barca of candidati) {
    const gommone = gommoni.find((g) => g.id === barca);
    // In esclusiva la prenotazione occupa tutto il gommone.
    const posti = esclusiva ? gommone.posti : dati.posti;
    const valori = { ...dati, posti, barca, blocchi: `,${turno.blocchi.join(',')},`, capienza: gommone.posti, ora };
    const sql = `INSERT INTO prenotazioni (${COLONNE.join(', ')})
                 SELECT ${COLONNE.map((c) => `:${c}`).join(', ')}
                 WHERE ${condizioniPosto(turno)}`;
    const r = await esegui(db, sql, valori);
    if (r.meta?.changes === 1) return { id: r.meta.last_row_id, barca };
  }
  return null;
}

// Rimette "in piedi" una prenotazione scaduta (es. il cliente ha pagato con qualche minuto di ritardo),
// solo se nel frattempo il posto non è stato preso da altri.
export async function riattivaSeLibero(db, pren, nuovoStato, campiExtra = {}) {
  const turno = turnoDi(pren.escursione, pren.turno);
  const gommone = gommoni.find((g) => g.id === pren.barca);
  const extra = Object.keys(campiExtra).map((k) => `, ${k} = :x_${k}`).join('');
  const valoriExtra = Object.fromEntries(Object.entries(campiExtra).map(([k, v]) => [`x_${k}`, v]));
  const r = await esegui(db, `UPDATE prenotazioni SET stato = :nuovo, aggiornata_il = :ora ${extra}
     WHERE id = :id AND stato IN ('in_attesa', 'scaduta') AND ${condizioniPosto(turno, true)}`, {
    ...valoriExtra, nuovo: nuovoStato, id: pren.id, data: pren.data, barca: pren.barca, escursione: pren.escursione,
    turno: pren.turno, posti: pren.posti, capienza: gommone.posti, ora: new Date().toISOString(),
  });
  return r.meta?.changes === 1;
}

// Calendario di un mese per un'escursione: stato di ogni giorno e di ogni turno.
export async function calendarioMese(db, slug, mese, { gestione = false } = {}) {
  const offerta = offerte[slug];
  const [anno, m] = mese.split('-').map(Number);
  const giorniNelMese = new Date(Date.UTC(anno, m, 0)).getUTCDate();
  const dal = `${mese}-01`;
  const al = `${mese}-${String(giorniNelMese).padStart(2, '0')}`;
  const ora = new Date().toISOString();
  const dati = await caricaGiorni(db, dal, al, ora);
  const giorni = {};
  for (let d = 1; d <= giorniNelMese; d++) {
    const data = `${mese}-${String(d).padStart(2, '0')}`;
    const ok = gestione ? prenotabileGestione(data) : prenotabileOnline(data);
    if (!ok.ok) { giorni[data] = { stato: 'chiuso', motivo: ok.motivo }; continue; }
    const turni = offerta.turni.map((t) => {
      const s = situazioneTurno(slug, t.id, dati.giorno(data));
      return { id: t.id, disponibile: s.disponibile, max: s.maxPersone, confermata: s.confermata ?? null, mancano: s.mancano ?? null };
    });
    const maxGiorno = Math.max(0, ...turni.map((t) => t.max));
    const stato = !turni.some((t) => t.disponibile) ? 'pieno' : offerta.tipo === 'gruppo' && maxGiorno <= 4 ? 'pochi' : 'libero';
    giorni[data] = { stato, turni };
  }
  return giorni;
}

// Le prenotazioni in attesa scadute diventano "scadute" (pulizia, non indispensabile per il calcolo dei posti)
// e l'impronta dell'indirizzo internet si cancella appena non serve più (lo promette l'informativa privacy).
export async function pulisciScadute(db) {
  const ora = new Date().toISOString();
  await esegui(db, `UPDATE prenotazioni SET stato = 'scaduta', aggiornata_il = :ora
                    WHERE stato = 'in_attesa' AND scade_il <= :limite`, {
    ora,
    // margine di 15 minuti: chi sta finendo di pagare non viene toccato
    limite: new Date(Date.now() - 15 * 60000).toISOString(),
  });
  await esegui(db, `UPDATE prenotazioni SET ip_hash = NULL
                    WHERE ip_hash IS NOT NULL AND (stato != 'in_attesa' OR scade_il <= :ora)`, { ora });
}

export { istruzione };
