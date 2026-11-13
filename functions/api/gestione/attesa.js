// GET  /api/gestione/attesa → lista d'attesa con chi ha un posto libero adesso
// POST { id, azione: 'avvisato' | 'chiudi' }
import { turnoDi } from '../../../src/data/prenotazioni.js';
import { esegui, registra } from '../../_lib/db.js';
import { richiedi } from '../../_lib/accessi.js';
import { situazioneAttesa } from '../../_lib/attesa.js';
import { titoloEscursione, nomeImbarco } from '../../_lib/prenotazioni.js';
import { Errore, json, leggiJson, controllaOrigine } from '../../_lib/util.js';

export async function onRequestGet({ request, env }) {
  await richiedi(env.DB, request, 'gestione');
  const righe = await situazioneAttesa(env.DB, { soloInAttesa: false });
  const origine = new URL(request.url).origin;
  return json({
    attesa: righe.filter((a) => a.stato !== 'chiuso').map((a) => ({
      id: a.id, data: a.data, escursione: titoloEscursione(a.escursione), turno: turnoDi(a.escursione, a.turno)?.nome ?? a.turno,
      imbarco: nomeImbarco(a.imbarco), adulti: a.adulti, bambini: a.bambini, posti: a.posti, nome: a.nome, email: a.email, telefono: a.telefono,
      stato: a.stato, libero: a.stato === 'attesa' && a.libero, creataIl: a.creata_il, avvisataIl: a.avvisata_il,
      link: `${origine}/prenota/?escursione=${encodeURIComponent(a.escursione)}&imbarco=${encodeURIComponent(a.imbarco)}&data=${encodeURIComponent(a.data)}`,
    })),
  });
}

export async function onRequestPost({ request, env }) {
  controllaOrigine(request);
  const u = await richiedi(env.DB, request, 'gestione');
  const b = await leggiJson(request, 1000);
  if (!['avvisato', 'chiudi'].includes(b.azione)) throw new Errore(400, 'Azione non valida.');
  await esegui(env.DB, "UPDATE lista_attesa SET stato = :s, avvisata_il = COALESCE(avvisata_il, :ora) WHERE id = :id", { s: b.azione === 'chiudi' ? 'chiuso' : 'avvisato', ora: new Date().toISOString(), id: Number(b.id) || 0 });
  await registra(env.DB, `gestione:${u.id}`, `attesa-${b.azione}`, { id: b.id });
  return json({ ok: true });
}
