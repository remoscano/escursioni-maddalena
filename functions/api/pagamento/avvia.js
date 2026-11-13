// POST /api/pagamento/avvia { codice, t, metodo, accetto } → link di pagamento mandato dalla gestione:
// il cliente paga online una prenotazione che lo aspetta (o che è confermata ma non ancora pagata).
import { prenotazioneDaCodice, pagabileConLink, pagamentoPrenotazione } from '../../_lib/prenotazioni.js';
import { metodiDisponibili } from '../../_lib/pagamenti.js';
import { Errore, json, leggiJson, controllaOrigine, codiceCasuale } from '../../_lib/util.js';

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  controllaOrigine(request);
  const b = await leggiJson(request, 2000);
  const p = await prenotazioneDaCodice(env.DB, b.codice, b.t);
  if (!p) throw new Errore(404, 'Prenotazione non trovata.');
  if (!pagabileConLink(p)) throw new Errore(409, p.stato === 'in_attesa' ? 'Il link di pagamento è scaduto: scrivici su WhatsApp.' : 'Questa prenotazione non ha niente da pagare online.');
  const metodo = String(b.metodo || '');
  if (!metodiDisponibili(env).includes(metodo)) throw new Errore(400, 'Scegli come pagare.');
  if (b.accetto !== true) throw new Errore(400, 'Per pagare devi accettare le condizioni di prenotazione.');
  // Ogni tentativo ha il suo riferimento: SumUp non accetta due pagamenti con lo stesso.
  const redirect = await pagamentoPrenotazione(contesto, p, metodo, codiceCasuale(4));
  return json({ redirect });
}
