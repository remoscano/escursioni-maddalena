// POST /api/buono { valore, nome, email, telefono?, destinatario?, messaggio?, metodo, accetto } → compra un buono regalo
// GET  /api/buono?codice=BR-...&t=... → stato del buono (pagina dopo il pagamento)
import { prima } from '../_lib/db.js';
import { creaBuono, pagamentoBuono, buonoDaCodice, vistaBuono, confermaBuono } from '../_lib/buoni.js';
import { metodiDisponibili, statoSumup } from '../_lib/pagamenti.js';
import { Errore, json, leggiJson, controllaOrigine, sha256, indirizzoIp, adessoISO } from '../_lib/util.js';

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  controllaOrigine(request);
  const b = await leggiJson(request, 4000);
  const metodo = String(b.metodo || '');
  if (!metodiDisponibili(env).includes(metodo)) throw new Errore(400, 'Scegli come pagare.');
  if (b.accetto !== true) throw new Errore(400, 'Per comprare il buono devi accettare le condizioni.');
  const ipHash = (await sha256(`ip|${indirizzoIp(request)}`)).slice(0, 32);
  const r = await prima(env.DB, "SELECT COUNT(*) AS n FROM codici_sconto WHERE ip_hash = :h AND stato = 'in_attesa' AND scade_il > :ora", { h: ipHash, ora: adessoISO() });
  if ((r?.n ?? 0) >= 3) throw new Errore(429, 'Hai già dei buoni in attesa di pagamento: completali oppure aspetta qualche minuto.');
  const buono = await creaBuono(env.DB, b, { metodo, ipHash });
  return json({ codice: buono.codice, redirect: await pagamentoBuono(contesto, buono) });
}

export async function onRequestGet(contesto) {
  const { request, env } = contesto;
  const u = new URL(request.url).searchParams;
  let b = await buonoDaCodice(env.DB, u.get('codice'), u.get('t'));
  if (!b) throw new Errore(404, 'Buono non trovato.');
  if (b.stato === 'in_attesa' && b.metodo === 'sumup' && b.pagamento_rif && env.SUMUP_API_KEY) {
    const s = await statoSumup(env, b.pagamento_rif);
    if (s.pagato && (!s.riferimento || s.riferimento === b.codice)) {
      await confermaBuono(contesto, b, { importo: s.importo, rif: b.pagamento_rif, chi: 'sumup-verifica' });
      b = await buonoDaCodice(env.DB, b.codice, b.token);
    }
  }
  return json(vistaBuono(b));
}
