// Spese di bordo degli skipper: carburante (litri ed euro), bevande, cibo, altro.
// Un giorno è "da compilare" per uno skipper se quel giorno ha imbarcato almeno un cliente (check-in) e non ha ancora
// scritto nessun rendiconto. Così non riceve avvisi per i giorni in cui non ha lavorato.

import { regole, gommoni } from '../../src/data/prenotazioni.js';
import { tutte } from './db.js';
import { oraRoma, aggiungiGiorni } from './util.js';

export const chiDi = (u) => `${u.ruolo}:${u.id}`;
export const gommoniSpese = () => gommoni.map((g) => ({ id: g.id, nome: g.nome }));

export const vistaRendiconto = (r) => ({
  id: r.id, data: r.data, barca: r.barca, gommone: gommoni.find((g) => g.id === r.barca)?.nome ?? r.barca,
  litri: r.litri, carburante: r.carburante / 100, bevande: r.bevande / 100, cibo: r.cibo / 100, altro: r.altro / 100,
  totale: (r.carburante + r.bevande + r.cibo + r.altro) / 100, note: r.note,
  nessunaSpesa: r.carburante + r.bevande + r.cibo + r.altro === 0 && !r.litri,
  skipper: r.skipper_nome ?? undefined, aggiornatoIl: r.aggiornato_il || r.creato_il,
});

// Giorni lavorati (con check-in) tra due date, con il gommone più usato quel giorno.
export async function giorniLavorati(db, utente, dal, al) {
  const righe = await tutte(db, `SELECT data, barca, COUNT(*) AS n FROM prenotazioni
                                 WHERE checkin_da = :chi AND data BETWEEN :dal AND :al GROUP BY data, barca ORDER BY data, n DESC`, { chi: chiDi(utente), dal, al });
  const giorni = new Map();
  for (const r of righe) if (!giorni.has(r.data)) giorni.set(r.data, r.barca);
  return giorni;
}

// Giorni lavorati negli ultimi 30 giorni (oggi compreso) senza nessun rendiconto.
export async function giorniMancanti(db, utente) {
  const oggi = oraRoma().data;
  const dal = aggiungiGiorni(oggi, -regole.spese.giorniModifica);
  const lavorati = await giorniLavorati(db, utente, dal, oggi);
  const fatti = new Set((await tutte(db, 'SELECT DISTINCT data FROM rendiconti WHERE utente_id = :u AND data BETWEEN :dal AND :oggi', { u: utente.id, dal, oggi })).map((r) => r.data));
  return [...lavorati.keys()].filter((d) => !fatti.has(d));
}
