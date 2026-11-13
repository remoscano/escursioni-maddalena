// Annullamenti, rimborsi e rinvii: dalla gestione, dal cliente, per maltempo.

import { prima, esegui, registra } from './db.js';
import { rimborsa } from './pagamenti.js';
import { restituisciCodice } from './offerte.js';
import { spostaPrenotazione } from './motore.js';
import { inviaEmailConferma, linkPrenotazione } from './prenotazioni.js';
import { inviaEmailRecupero, inviaEmailAnnullata } from './email.js';
import { avvisaListaAttesa } from './attesa.js';
import { Errore, adessoISO } from './util.js';

// Si è liberato un posto: chi è in lista d'attesa viene avvisato subito (se le email sono attive).
const liberato = (contesto) => contesto.waitUntil?.(avvisaListaAttesa(contesto.env, contesto.env.SITO_URL || new URL(contesto.request.url).origin).catch((e) => console.error('Lista d\'attesa', e)));

export const PAGATA_SUL_SITO = ['sumup', 'paypal', 'prova'];
const rileggi = (db, id) => prima(db, 'SELECT * FROM prenotazioni WHERE id = :id', { id });
const origineDi = (contesto) => new URL(contesto.request.url).origin;

// Rimborsa una prenotazione pagata sul sito. importo in centesimi (di solito tutto quello pagato).
// Restituisce { ok, rif } oppure { ok: false, errore } e segna il rimborso come "da fare".
export async function eseguiRimborso(contesto, p, importo, chi) {
  const db = contesto.env.DB;
  const rimborsabile = (p.pagato || 0) - (p.rimborsato || 0);
  if (!(importo > 0) || importo > rimborsabile) throw new Errore(400, `Si possono rimborsare al massimo ${(rimborsabile / 100).toFixed(2).replace('.', ',')} €.`);
  if (!PAGATA_SUL_SITO.includes(p.metodo)) throw new Errore(400, 'Questa prenotazione non è stata pagata sul sito: il rimborso va fatto a mano o sulla piattaforma.');
  const ora = adessoISO();
  try {
    const { rif } = await rimborsa(contesto.env, p, importo, Math.round((p.rimborsato || 0) / 100) + 1);
    await esegui(db, "UPDATE prenotazioni SET rimborsato = rimborsato + :i, rimborso = 'fatto', rimborso_rif = :rif, aggiornata_il = :ora WHERE id = :id",
      { i: importo, rif, ora, id: p.id });
    await registra(db, chi, 'rimborso', { codice: p.codice, importo, rif });
    return { ok: true, rif };
  } catch (e) {
    await esegui(db, "UPDATE prenotazioni SET rimborso = 'da_fare', aggiornata_il = :ora WHERE id = :id", { ora, id: p.id });
    await registra(db, chi, 'rimborso-non-riuscito', { codice: p.codice, importo, errore: String(e?.message || e).slice(0, 200) });
    return { ok: false, errore: e instanceof Errore ? e.message : 'Rimborso non riuscito: fallo dal pannello di SumUp o PayPal.' };
  }
}

// Annulla una prenotazione.
// modo: 'rimborso' (rimborso automatico di quanto pagato sul sito) | 'proposta' (il cliente sceglie rinvio o rimborso)
//       | 'senza-rimborso' | 'manuale' (rimborso da fare a mano: altre piattaforme, contanti)
export async function annullaPrenotazione(contesto, p, { modo, motivo = '', chi, avvisa = true }) {
  const db = contesto.env.DB;
  if (!['confermata', 'da_verificare', 'in_attesa'].includes(p.stato)) throw new Errore(409, 'Questa prenotazione non si può annullare.');
  const ora = adessoISO();
  const nota = motivo ? `${p.note ? `${p.note}\n` : ''}Annullata: ${motivo}` : p.note;
  const pagataSulSito = p.pagato > 0 && PAGATA_SUL_SITO.includes(p.metodo);

  if (modo === 'proposta') {
    // Il codice sconto e il buono restano legati alla prenotazione finché il cliente non sceglie.
    await esegui(db, "UPDATE prenotazioni SET stato = 'annullata', recupero = 'proposto', rimborso = NULL, note = :n, aggiornata_il = :ora WHERE id = :id",
      { n: nota, ora, id: p.id });
    await registra(db, chi, 'prenotazione-annullata-proposta', { codice: p.codice, motivo });
    liberato(contesto);
    const agg = await rileggi(db, p.id);
    if (avvisa && agg.email) {
      const inviata = await inviaEmailRecupero(contesto.env, agg, origineDi(contesto), motivo);
      if (inviata) { await esegui(db, 'UPDATE prenotazioni SET avviso_il = :ora WHERE id = :id', { ora, id: p.id }); agg.avviso_il = ora; }
    }
    return { prenotazione: agg, link: linkPrenotazione(origineDi(contesto), agg) };
  }

  const rimborso = p.pagato > 0 && (modo === 'manuale' || (modo === 'rimborso' && !pagataSulSito)) ? 'da_fare' : null;
  await esegui(db, "UPDATE prenotazioni SET stato = 'annullata', rimborso = :r, recupero = CASE WHEN recupero = 'proposto' THEN 'rimborso' ELSE recupero END, note = :n, aggiornata_il = :ora WHERE id = :id",
    { r: rimborso, n: nota, ora, id: p.id });
  await restituisciCodice(db, p.id);
  await registra(db, chi, 'prenotazione-annullata', { codice: p.codice, motivo, modo });
  liberato(contesto);
  let esito = { ok: true };
  const daRimborsare = (p.pagato || 0) - (p.rimborsato || 0);
  if (modo === 'rimborso' && pagataSulSito && daRimborsare > 0) esito = await eseguiRimborso(contesto, await rileggi(db, p.id), daRimborsare, chi);
  const agg = await rileggi(db, p.id);
  if (avvisa && agg.email && p.stato !== 'in_attesa') {
    contesto.waitUntil?.(inviaEmailAnnullata(contesto.env, agg, {
      rimborsoFatto: esito.ok && modo === 'rimborso' && pagataSulSito,
      importo: modo === 'rimborso' || modo === 'manuale' ? daRimborsare : 0,
      buonoReso: p.buono || 0,
    }));
  }
  return { prenotazione: agg, rimborso: esito };
}

// Il cliente ha scelto dopo l'annullamento per maltempo.
export async function sceltaRecupero(contesto, p, { scelta, data, turno }) {
  if (p.stato !== 'annullata' || p.recupero !== 'proposto') throw new Errore(409, 'La scelta per questa prenotazione è già stata fatta.');
  const db = contesto.env.DB;
  if (scelta === 'rinvio') {
    await spostaPrenotazione(db, p, data, turno, { stato: 'confermata', recupero: 'rinviata' });
    await registra(db, 'cliente', 'rinvio-scelto', { codice: p.codice, da: p.data, a: data, turno });
    const agg = await rileggi(db, p.id);
    contesto.waitUntil?.(inviaEmailConferma(contesto.env, agg, origineDi(contesto)));
    return agg;
  }
  if (scelta === 'rimborso') {
    const db2 = contesto.env.DB;
    const pagataSulSito = p.pagato > 0 && PAGATA_SUL_SITO.includes(p.metodo);
    await esegui(db2, "UPDATE prenotazioni SET recupero = 'rimborso', rimborso = :r, aggiornata_il = :ora WHERE id = :id",
      { r: p.pagato > 0 && !pagataSulSito ? 'da_fare' : null, ora: adessoISO(), id: p.id });
    await restituisciCodice(db2, p.id);
    await registra(db2, 'cliente', 'rimborso-scelto', { codice: p.codice });
    let esito = { ok: true };
    const daRimborsare = (p.pagato || 0) - (p.rimborsato || 0);
    if (pagataSulSito && daRimborsare > 0) esito = await eseguiRimborso(contesto, await rileggi(db2, p.id), daRimborsare, 'cliente');
    const agg = await rileggi(db2, p.id);
    if (agg.email) contesto.waitUntil?.(inviaEmailAnnullata(contesto.env, agg, { rimborsoFatto: esito.ok && pagataSulSito, importo: daRimborsare, buonoReso: p.buono || 0 }));
    return agg;
  }
  throw new Errore(400, 'Scelta non valida.');
}
