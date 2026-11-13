// POST /api/gestione/prenotazione { id, azione, ... }
//   annulla { modo: 'rimborso' | 'proposta' | 'manuale' | 'senza-rimborso', motivo? }
//       rimborso = rimborso automatico (pagata sul sito) · proposta = il cliente sceglie rinvio o rimborso
//       manuale = rimborso da fare a mano (altre piattaforme, contanti) · senza-rimborso
//   rimborsa { importo (euro) } → rimborso automatico, anche parziale, con SumUp o PayPal
//   rimborsata → rimborso fatto a mano
//   conferma   → una prenotazione "da verificare" diventa confermata
//   sposta { data, turno } → cambia giorno o orario (il prezzo resta quello)
//   link { invia? } → link di pagamento per il cliente (prenotazione da pagare)
//   link-cliente → link alla pagina del cliente (per esempio per scegliere dopo il maltempo)
//   rimborso-maltempo → dopo un'uscita annullata da noi, rimborso al posto del cliente
import { prima, esegui, registra } from '../../_lib/db.js';
import { richiedi } from '../../_lib/accessi.js';
import { spostaPrenotazione } from '../../_lib/motore.js';
import { annullaPrenotazione, eseguiRimborso, sceltaRecupero } from '../../_lib/recupero.js';
import { pagabileConLink, inviaEmailConferma, emailAttive, linkPrenotazione } from '../../_lib/prenotazioni.js';
import { inviaEmailLinkPagamento } from '../../_lib/email.js';
import { Errore, json, leggiJson, controllaOrigine, testo, dataValida } from '../../_lib/util.js';

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  controllaOrigine(request);
  const u = await richiedi(env.DB, request, 'gestione');
  const chi = `gestione:${u.id}`;
  const b = await leggiJson(request, 4000);
  const p = await prima(env.DB, 'SELECT * FROM prenotazioni WHERE id = :id', { id: Number(b.id) || 0 });
  if (!p) throw new Errore(404, 'Prenotazione non trovata.');
  const motivo = testo(b.motivo, { campo: 'motivo', massimo: 200 });
  const origine = new URL(request.url).origin;

  if (b.azione === 'annulla') {
    const modo = ['rimborso', 'proposta', 'manuale', 'senza-rimborso'].includes(b.modo) ? b.modo : 'rimborso';
    const r = await annullaPrenotazione(contesto, p, { modo, motivo, chi });
    return json({ ok: true, rimborso: r.rimborso ?? null, link: r.link ?? null, email: Boolean(r.prenotazione.avviso_il) });
  }

  if (b.azione === 'rimborsa') {
    const importo = Math.round(Number(String(b.importo ?? '').replace(',', '.')) * 100);
    const r = await eseguiRimborso(contesto, p, importo, chi);
    if (!r.ok) throw new Errore(502, r.errore);
    return json({ ok: true });
  }

  if (b.azione === 'rimborsata') {
    await esegui(env.DB, "UPDATE prenotazioni SET rimborso = 'fatto', rimborsato = MAX(rimborsato, pagato), aggiornata_il = :ora WHERE id = :id", { ora: new Date().toISOString(), id: p.id });
  } else if (b.azione === 'conferma') {
    if (p.stato !== 'da_verificare') throw new Errore(409, 'Solo le prenotazioni da verificare si confermano a mano.');
    await esegui(env.DB, "UPDATE prenotazioni SET stato = 'confermata', aggiornata_il = :ora WHERE id = :id", { ora: new Date().toISOString(), id: p.id });
  } else if (b.azione === 'sposta') {
    if (!dataValida(b.data) || typeof b.turno !== 'string') throw new Errore(400, 'Scegli giorno e orario.');
    const attiva = ['confermata', 'da_verificare'].includes(p.stato) || (p.stato === 'annullata' && p.recupero === 'proposto');
    if (!attiva) throw new Errore(409, 'Questa prenotazione non si può spostare.');
    const r = await spostaPrenotazione(env.DB, p, b.data, b.turno, {
      gestione: true, stato: p.stato === 'annullata' ? 'confermata' : p.stato, recupero: p.recupero === 'proposto' ? 'rinviata' : null,
    });
    await registra(env.DB, chi, 'prenotazione-spostata', { codice: p.codice, da: `${p.data} ${p.turno}`, a: `${b.data} ${b.turno}` });
    if (b.avvisa !== false) {
      const agg = await prima(env.DB, 'SELECT * FROM prenotazioni WHERE id = :id', { id: p.id });
      if (agg.email) contesto.waitUntil(inviaEmailConferma(env, agg, origine));
    }
    return json({ ok: true, barca: r.barca });
  } else if (b.azione === 'link-cliente') {
    // Link personale del cliente (la sua pagina della prenotazione), per mandarlo su WhatsApp.
    return json({ link: linkPrenotazione(origine, p) });
  } else if (b.azione === 'rimborso-maltempo') {
    // Uscita annullata da noi: la gestione sceglie il rimborso al posto del cliente.
    await sceltaRecupero(contesto, p, { scelta: 'rimborso' });
  } else if (b.azione === 'link') {
    if (!pagabileConLink(p)) throw new Errore(409, 'Questa prenotazione non ha niente da pagare online (o il link è scaduto).');
    const link = `${origine}/prenota/paga/?codice=${encodeURIComponent(p.codice)}&t=${encodeURIComponent(p.token)}`;
    let inviata = false;
    if (b.invia && p.email && emailAttive(env)) inviata = await inviaEmailLinkPagamento(env, p, origine);
    return json({ ok: true, link, inviata });
  } else {
    throw new Errore(400, 'Azione non valida.');
  }
  await registra(env.DB, chi, `prenotazione-${b.azione}`, { codice: p.codice, motivo });
  return json({ ok: true });
}
