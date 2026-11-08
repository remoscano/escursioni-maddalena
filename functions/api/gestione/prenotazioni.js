// GET  /api/gestione/prenotazioni?dal=&al=&q=&stato= → elenco prenotazioni
// POST /api/gestione/prenotazioni → prenotazione inserita a mano (altre piattaforme, telefono, molo)
import { turnoDi } from '../../../src/data/prenotazioni.js';
import { tutte, registra } from '../../_lib/db.js';
import { richiedi } from '../../_lib/accessi.js';
import { creaPrenotazione } from '../../_lib/crea.js';
import { titoloEscursione, nomeImbarco, nomeGommone } from '../../_lib/prenotazioni.js';
import { json, leggiJson, controllaOrigine, dataValida, oraRoma, aggiungiGiorni } from '../../_lib/util.js';

export async function onRequestGet({ request, env }) {
  await richiedi(env.DB, request, 'gestione');
  const u = new URL(request.url).searchParams;
  const oggi = oraRoma().data;
  const dal = dataValida(u.get('dal')) ? u.get('dal') : aggiungiGiorni(oggi, -7);
  const al = dataValida(u.get('al')) ? u.get('al') : aggiungiGiorni(oggi, 365);
  const q = (u.get('q') || '').trim().slice(0, 60);
  const stato = ['confermata', 'annullata', 'da_verificare', 'rimborsi'].includes(u.get('stato')) ? u.get('stato') : '';
  const righe = await tutte(env.DB, `SELECT p.*, pa.nome AS partner_nome FROM prenotazioni p LEFT JOIN partner pa ON pa.id = p.partner_id
      WHERE p.stato != 'scaduta' AND NOT (p.stato = 'in_attesa')
        AND (:q != '' OR :stato = 'rimborsi' OR p.data BETWEEN :dal AND :al)
        AND (:q = '' OR p.codice LIKE :like OR p.nome LIKE :like OR p.telefono LIKE :like OR p.email LIKE :like OR p.rif_esterno LIKE :like)
        AND (:stato = '' OR (:stato = 'rimborsi' AND p.rimborso = 'da_fare') OR p.stato = :stato)
      ORDER BY p.data, p.creata_il LIMIT 400`, { q, like: `%${q}%`, dal, al, stato });
  return json({
    dal, al,
    prenotazioni: righe.map((p) => ({
      id: p.id, codice: p.codice, data: p.data, escursione: titoloEscursione(p.escursione), turno: turnoDi(p.escursione, p.turno)?.nome ?? p.turno,
      gommone: nomeGommone(p.barca), nome: p.nome, telefono: p.telefono, email: p.email, imbarco: nomeImbarco(p.imbarco),
      adulti: p.adulti, bambini: p.bambini, neonati: p.neonati, totale: p.totale / 100, pagato: p.pagato / 100,
      provvigione: p.provvigione / 100, stato: p.stato, rimborso: p.rimborso, canale: p.canale, metodo: p.metodo,
      rifEsterno: p.rif_esterno, struttura: p.partner_nome, note: p.note, creataIl: p.creata_il,
    })),
  });
}

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  controllaOrigine(request);
  const utente = await richiedi(env.DB, request, 'gestione');
  const b = await leggiJson(request);
  const p = await creaPrenotazione(contesto, b, { modo: 'gestione', utente });
  await registra(env.DB, `gestione:${utente.id}`, 'prenotazione-manuale', { codice: p.codice, canale: p.canale });
  return json({ codice: p.codice, gommone: nomeGommone(p.barca) });
}
