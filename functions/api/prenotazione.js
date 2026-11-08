// GET  /api/prenotazione?codice=EM-XXXXXX&t=...  → stato della prenotazione (pagina di esito)
// POST /api/prenotazione { codice, t, azione: 'rinuncia' } → il cliente torna indietro dal pagamento: i posti si liberano
import { esegui } from '../_lib/db.js';
import { prenotazioneDaCodice, vistaCliente, confermaPagamento, emailAttive } from '../_lib/prenotazioni.js';
import { statoSumup } from '../_lib/pagamenti.js';
import { Errore, json, leggiJson, controllaOrigine, adessoISO } from '../_lib/util.js';

export async function onRequestGet(contesto) {
  const { request, env } = contesto;
  const url = new URL(request.url);
  let p = await prenotazioneDaCodice(env.DB, url.searchParams.get('codice'), url.searchParams.get('t'));
  if (!p) throw new Errore(404, 'Prenotazione non trovata.');
  if (p.stato === 'in_attesa' && p.metodo === 'sumup' && p.pagamento_rif && env.SUMUP_API_KEY) {
    const s = await statoSumup(env, p.pagamento_rif);
    if (s.pagato && (!s.riferimento || s.riferimento === p.codice)) {
      await confermaPagamento(contesto, p, { importo: s.importo, rif: p.pagamento_rif, chi: 'sumup-verifica' });
      p = await prenotazioneDaCodice(env.DB, p.codice, p.token);
    }
  }
  const vista = vistaCliente(p);
  if (p.stato === 'in_attesa' && p.scade_il <= adessoISO()) vista.stato = 'scaduta';
  // La pagina di conferma dice "ti mandiamo un'email" solo se le email sono attive.
  vista.email = emailAttive(env) && Boolean(p.email);
  return json(vista);
}

export async function onRequestPost({ request, env }) {
  controllaOrigine(request);
  const b = await leggiJson(request);
  const p = await prenotazioneDaCodice(env.DB, b.codice, b.t);
  if (!p) throw new Errore(404, 'Prenotazione non trovata.');
  if (b.azione === 'rinuncia' && p.stato === 'in_attesa') {
    await esegui(env.DB, "UPDATE prenotazioni SET stato = 'annullata', ip_hash = NULL, aggiornata_il = :ora WHERE id = :id AND stato = 'in_attesa'", { ora: adessoISO(), id: p.id });
  }
  return json({ ok: true });
}
