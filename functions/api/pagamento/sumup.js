// POST /api/pagamento/sumup → notifica di SumUp quando cambia lo stato di un pagamento.
// Non ci si fida del contenuto: lo stato si rilegge sempre da SumUp con la nostra chiave.
import { prima } from '../../_lib/db.js';
import { confermaPagamento } from '../../_lib/prenotazioni.js';
import { confermaBuono } from '../../_lib/buoni.js';
import { statoSumup } from '../../_lib/pagamenti.js';
import { json } from '../../_lib/util.js';

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  const corpo = await request.json().catch(() => ({}));
  const id = typeof corpo.id === 'string' ? corpo.id.slice(0, 80) : '';
  if (!id || !env.SUMUP_API_KEY) return json({ ok: true });
  const p = await prima(env.DB, "SELECT * FROM prenotazioni WHERE pagamento_rif = :r AND metodo = 'sumup'", { r: id });
  if (p) {
    if (p.stato === 'confermata' && p.pagato > 0) return json({ ok: true });
    const s = await statoSumup(env, id);
    if (s.pagato && (!s.riferimento || String(s.riferimento).startsWith(p.codice))) {
      await confermaPagamento(contesto, p, { importo: s.importo, rif: id, chi: 'sumup-notifica' });
    }
    return json({ ok: true });
  }
  const b = await prima(env.DB, "SELECT * FROM codici_sconto WHERE pagamento_rif = :r AND metodo = 'sumup' AND tipo = 'buono'", { r: id });
  if (b && b.stato === 'in_attesa') {
    const s = await statoSumup(env, id);
    if (s.pagato && (!s.riferimento || s.riferimento === b.codice)) await confermaBuono(contesto, b, { importo: s.importo, rif: id, chi: 'sumup-notifica' });
  }
  return json({ ok: true });
}
