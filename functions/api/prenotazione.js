// GET  /api/prenotazione?codice=EM-XXXXXX&t=...  → stato della prenotazione (pagina del cliente)
// POST /api/prenotazione { codice, t, azione }
//   rinuncia → il cliente torna indietro dal pagamento: i posti si liberano
//   annulla  → il cliente annulla da solo (fino a 48 ore prima): rimborso automatico
//   rinvio { data, turno } | rimborso → scelta dopo un'uscita annullata da noi (maltempo)
import { esegui } from '../_lib/db.js';
import { prenotazioneDaCodice, vistaCliente, confermaPagamento, emailAttive, annullabileDalCliente, daGestione } from '../_lib/prenotazioni.js';
import { statoSumup } from '../_lib/pagamenti.js';
import { extraDi, restituisciCodice } from '../_lib/offerte.js';
import { annullaPrenotazione, sceltaRecupero } from '../_lib/recupero.js';
import { metodiDisponibili } from '../_lib/pagamenti.js';
import { Errore, json, leggiJson, controllaOrigine, adessoISO, dataValida } from '../_lib/util.js';

async function vista(env, p) {
  const v = vistaCliente(p);
  if (p.stato === 'in_attesa' && p.scade_il <= adessoISO()) v.stato = 'scaduta';
  // La pagina di conferma dice "ti mandiamo un'email" solo se le email sono attive.
  v.email = emailAttive(env) && Boolean(p.email);
  v.extra = await extraDi(env.DB, p.id);
  if (v.pagabile) v.pagamenti = metodiDisponibili(env);
  return v;
}

export async function onRequestGet(contesto) {
  const { request, env } = contesto;
  const url = new URL(request.url);
  let p = await prenotazioneDaCodice(env.DB, url.searchParams.get('codice'), url.searchParams.get('t'));
  if (!p) throw new Errore(404, 'Prenotazione non trovata.');
  const attesaSumup = p.metodo === 'sumup' && p.pagamento_rif && env.SUMUP_API_KEY && (p.stato === 'in_attesa' || (p.stato === 'confermata' && !(p.pagato > 0)));
  if (attesaSumup) {
    const s = await statoSumup(env, p.pagamento_rif);
    if (s.pagato && (!s.riferimento || String(s.riferimento).startsWith(p.codice))) {
      await confermaPagamento(contesto, p, { importo: s.importo, rif: p.pagamento_rif, chi: 'sumup-verifica' });
      p = await prenotazioneDaCodice(env.DB, p.codice, p.token);
    }
  }
  return json(await vista(env, p));
}

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  controllaOrigine(request);
  const b = await leggiJson(request);
  const p = await prenotazioneDaCodice(env.DB, b.codice, b.t);
  if (!p) throw new Errore(404, 'Prenotazione non trovata.');

  if (b.azione === 'rinuncia') {
    // Le prenotazioni con il link di pagamento della gestione restano tenute fino alla scadenza del link.
    if (p.stato === 'in_attesa' && !daGestione(p)) {
      const r = await esegui(env.DB, "UPDATE prenotazioni SET stato = 'annullata', ip_hash = NULL, aggiornata_il = :ora WHERE id = :id AND stato = 'in_attesa'", { ora: adessoISO(), id: p.id });
      if (r.meta?.changes === 1) await restituisciCodice(env.DB, p.id);
    }
    return json({ ok: true });
  }

  if (b.azione === 'annulla') {
    if (!annullabileDalCliente(p)) throw new Errore(409, 'Questa prenotazione non si può più annullare online: scrivici su WhatsApp.');
    const r = await annullaPrenotazione(contesto, p, { modo: 'rimborso', motivo: 'annullata dal cliente', chi: 'cliente' });
    return json({ ok: true, rimborso: r.rimborso, prenotazione: await vista(env, r.prenotazione) });
  }

  if (b.azione === 'rinvio' || b.azione === 'rimborso') {
    if (b.azione === 'rinvio' && (!dataValida(b.data) || typeof b.turno !== 'string')) throw new Errore(400, 'Scegli giorno e orario.');
    const agg = await sceltaRecupero(contesto, p, { scelta: b.azione, data: b.data, turno: b.turno });
    return json({ ok: true, prenotazione: await vista(env, agg) });
  }

  throw new Errore(400, 'Azione non valida.');
}
