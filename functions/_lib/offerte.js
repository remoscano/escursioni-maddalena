// Regole di prezzo, codici sconto, buoni regalo ed extra: lettura dal database e uso nelle prenotazioni.

import { tutte, prima, esegui, istruzione } from './db.js';
import { Errore, adessoISO } from './util.js';

// Una prenotazione occupa posti (e quindi extra) se è confermata o se aspetta il pagamento e non è scaduta.
const ATTIVA = `(p.stato IN ('confermata', 'da_verificare') OR (p.stato = 'in_attesa' AND p.scade_il > :ora))`;

export async function regoleAttive(db) {
  const righe = await tutte(db, 'SELECT id, nome, tipo, soglia, percentuale, escursioni, dal, al FROM regole_prezzo WHERE attiva = 1 ORDER BY id', {});
  return righe.map((r) => ({ ...r, attiva: true }));
}

// Catalogo degli extra per un'escursione in una data, con quanti se ne possono ancora vendere.
export async function catalogoExtra(db, slug, data) {
  const righe = await tutte(db, `SELECT e.id, e.nome, e.descrizione, e.prezzo, e.modo, e.max_giorno, e.escursioni,
      (SELECT COALESCE(SUM(x.quantita), 0) FROM prenotazioni_extra x JOIN prenotazioni p ON p.id = x.prenotazione_id
       WHERE x.extra_id = e.id AND p.data = :data AND ${ATTIVA}) AS venduti
    FROM extra e WHERE e.attivo = 1 ORDER BY e.ordine, e.id`, { data: data || '', ora: adessoISO() });
  return righe
    .filter((e) => !e.escursioni || e.escursioni.split(',').includes(slug))
    .map((e) => ({
      id: e.id, nome: e.nome, descrizione: e.descrizione, prezzo: e.prezzo / 100, modo: e.modo, escursioni: e.escursioni,
      rimanenti: e.max_giorno === null ? null : Math.max(0, e.max_giorno - e.venduti),
    }));
}

// Codice sconto o buono regalo, nella forma usata dal calcolo del prezzo (importi in euro).
export function vistaCodice(c) {
  if (!c) return null;
  return {
    id: c.id, codice: c.codice, tipo: c.tipo,
    valore: c.tipo === 'percentuale' ? c.valore : c.valore / 100,
    saldo: c.saldo / 100,
    escursioni: c.escursioni, dal: c.dal, al: c.al,
    esaurito: c.tipo !== 'buono' && c.usi_max !== null && c.usati >= c.usi_max,
  };
}

export async function trovaCodice(db, codice) {
  const c = String(codice || '').trim().toUpperCase().slice(0, 30);
  if (!c) return null;
  return prima(db, "SELECT * FROM codici_sconto WHERE codice = :c AND stato = 'attivo'", { c });
}

// Dopo l'inserimento della prenotazione si "prende" il codice: un uso in più, o la parte di buono usata.
// Se nel frattempo il codice è finito, la prenotazione si annulla e si avvisa il cliente.
export async function riservaCodice(db, prenId, codiceId, buonoCent) {
  const r = buonoCent > 0
    ? await esegui(db, "UPDATE codici_sconto SET saldo = saldo - :b WHERE id = :id AND stato = 'attivo' AND saldo >= :b", { b: buonoCent, id: codiceId })
    : await esegui(db, "UPDATE codici_sconto SET usati = usati + 1 WHERE id = :id AND stato = 'attivo' AND (usi_max IS NULL OR usati < usi_max)", { id: codiceId });
  if (r.meta?.changes === 1) return;
  await esegui(db, "UPDATE prenotazioni SET stato = 'annullata', codice_reso = 1, aggiornata_il = :ora WHERE id = :id", { ora: adessoISO(), id: prenId });
  throw new Errore(409, buonoCent > 0 ? 'Il buono regalo è appena stato usato: controlla il saldo e riprova.' : 'Il codice sconto è appena finito: riprova senza codice.');
}

// Istruzioni per restituire il codice di una prenotazione che si annulla (una sola volta: codice_reso).
// Da eseguire in un batch, così vanno insieme.
export function istruzioniRestituzione(db, prenId) {
  return [
    istruzione(db, `UPDATE codici_sconto SET
        saldo = saldo + CASE WHEN tipo = 'buono' THEN (SELECT buono FROM prenotazioni WHERE id = :id) ELSE 0 END,
        usati = MAX(0, usati - CASE WHEN tipo != 'buono' THEN 1 ELSE 0 END)
      WHERE id = (SELECT codice_id FROM prenotazioni WHERE id = :id AND codice_id IS NOT NULL AND codice_reso = 0)`, { id: prenId }),
    istruzione(db, 'UPDATE prenotazioni SET codice_reso = 1 WHERE id = :id AND codice_id IS NOT NULL', { id: prenId }),
  ];
}
export const restituisciCodice = (db, prenId) => db.batch(istruzioniRestituzione(db, prenId));

export async function salvaExtra(db, prenId, scelti) {
  if (!scelti?.length) return;
  await db.batch(scelti.map((e) => istruzione(db,
    'INSERT INTO prenotazioni_extra (prenotazione_id, extra_id, nome, quantita, prezzo, totale) VALUES (:p, :e, :n, :q, :pr, :t)',
    { p: prenId, e: e.id, n: e.nome, q: e.quantita, pr: Math.round(e.prezzo * 100), t: Math.round(e.totale * 100) })));
}

export async function extraDi(db, prenId) {
  return (await tutte(db, 'SELECT nome, quantita, totale FROM prenotazioni_extra WHERE prenotazione_id = :id ORDER BY id', { id: prenId }))
    .map((e) => ({ nome: e.nome, quantita: e.quantita, totale: e.totale / 100 }));
}

// Campagna (volantino) valida?
export async function campagnaValida(db, codice) {
  const c = String(codice || '').trim().toUpperCase().slice(0, 30);
  if (!c) return null;
  const r = await prima(db, 'SELECT codice FROM campagne WHERE codice = :c AND attiva = 1', { c });
  return r?.codice ?? null;
}
