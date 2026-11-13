// POST /api/automatico → lavori a orari fissi, chiamati ogni ora dal programma "automatico" (cartella automatico/)
// oppure a mano dalla gestione. Serve la chiave AUTOMATICO_CHIAVE (o l'accesso di gestione).
//  - pulizia delle prenotazioni non pagate
//  - promemoria del giorno prima (dalle 18)
//  - grazie dopo l'uscita, con il link per la recensione
//  - avvisi di maltempo non partiti
//  - lista d'attesa: avvisa chi ha un posto libero; cancella le richieste passate
import { regole, turnoDi, orarioDi, oreAllaPartenza } from '../../src/data/prenotazioni.js';
import { tutte, esegui, registra } from '../_lib/db.js';
import { utenteCollegato } from '../_lib/accessi.js';
import { pulisciScadute } from '../_lib/motore.js';
import { emailAttive } from '../_lib/prenotazioni.js';
import { inviaEmailPromemoria, inviaEmailGrazie, inviaEmailRecupero } from '../_lib/email.js';
import { avvisaListaAttesa, pulisciListaAttesa } from '../_lib/attesa.js';
import { Errore, json, oraRoma, aggiungiGiorni, ugualeSicuro, adessoISO, controllaOrigine } from '../_lib/util.js';

// Fine dell'uscita: secondo orario del turno ('9:30 – 13:30' → 13:30).
const fine = (t, data) => (orarioDi(t, data).split('–')[1] || '').trim() || '18:00';

export async function lavoriAutomatici(env, origine) {
  const db = env.DB;
  const esito = { promemoria: 0, grazie: 0, avvisiMaltempo: 0, listaAttesa: 0, email: emailAttive(env) };
  await pulisciScadute(db);
  await pulisciListaAttesa(db);
  // Buoni non pagati da più di un giorno: si cancellano.
  await esegui(db, "DELETE FROM codici_sconto WHERE tipo = 'buono' AND stato IN ('in_attesa', 'annullato') AND pagato = 0 AND creato_da = 'cliente' AND scade_il < :ieri",
    { ieri: new Date(Date.now() - 86400000).toISOString() });
  if (!esito.email) return esito;

  const roma = oraRoma();
  const ora = adessoISO();
  // Promemoria: il giorno prima dalle 18 in poi.
  if (roma.ora >= regole.promemoria.ora) {
    const domani = aggiungiGiorni(roma.data, 1);
    const righe = await tutte(db, "SELECT * FROM prenotazioni WHERE data = :d AND stato = 'confermata' AND promemoria_il IS NULL AND email IS NOT NULL LIMIT 100", { d: domani });
    for (const p of righe) {
      if (await inviaEmailPromemoria(env, p, origine)) { await esegui(db, 'UPDATE prenotazioni SET promemoria_il = :ora WHERE id = :id', { ora, id: p.id }); esito.promemoria++; }
    }
  }
  // Grazie: qualche ora dopo il rientro (solo uscite degli ultimi due giorni).
  const passate = await tutte(db, "SELECT * FROM prenotazioni WHERE data BETWEEN :da AND :oggi AND stato = 'confermata' AND grazie_il IS NULL AND email IS NOT NULL LIMIT 200",
    { da: aggiungiGiorni(roma.data, -2), oggi: roma.data });
  for (const p of passate) {
    const t = turnoDi(p.escursione, p.turno);
    if (-oreAllaPartenza(p.data, fine(t, p.data)) < regole.grazieOreDopo) continue;
    if (await inviaEmailGrazie(env, p)) { await esegui(db, 'UPDATE prenotazioni SET grazie_il = :ora WHERE id = :id', { ora, id: p.id }); esito.grazie++; }
  }
  // Maltempo: avvisi con la scelta rinvio/rimborso che non erano partiti.
  const daAvvisare = await tutte(db, "SELECT * FROM prenotazioni WHERE stato = 'annullata' AND recupero = 'proposto' AND avviso_il IS NULL AND email IS NOT NULL LIMIT 50", {});
  for (const p of daAvvisare) {
    if (await inviaEmailRecupero(env, p, origine, '')) { await esegui(db, 'UPDATE prenotazioni SET avviso_il = :ora WHERE id = :id', { ora, id: p.id }); esito.avvisiMaltempo++; }
  }
  esito.listaAttesa = (await avvisaListaAttesa(env, origine)).length;
  return esito;
}

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  const chiave = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const conChiave = Boolean(env.AUTOMATICO_CHIAVE) && ugualeSicuro(chiave, env.AUTOMATICO_CHIAVE);
  if (!conChiave) {
    controllaOrigine(request);
    const u = await utenteCollegato(env.DB, request);
    if (u?.ruolo !== 'gestione') throw new Errore(401, 'Chiave non valida.');
  }
  // Indirizzo del sito per i link nelle email: quello vero, anche se la chiamata arriva da un altro indirizzo.
  const origine = env.SITO_URL || new URL(request.url).origin;
  const esito = await lavoriAutomatici(env, origine);
  if (esito.promemoria || esito.grazie || esito.avvisiMaltempo || esito.listaAttesa) await registra(env.DB, conChiave ? 'automatico' : 'gestione', 'lavori-automatici', esito);
  return json({ ok: true, ...esito });
}
