// GET  /api/gestione/prenotazioni?dal=&al=&q=&stato= → elenco prenotazioni
// POST /api/gestione/prenotazioni → prenotazione inserita a mano (altre piattaforme, telefono, molo)
import { turnoDi } from '../../../src/data/prenotazioni.js';
import { tutte, registra } from '../../_lib/db.js';
import { richiedi } from '../../_lib/accessi.js';
import { creaPrenotazione } from '../../_lib/crea.js';
import { titoloEscursione, nomeImbarco, nomeGommone, emailAttive, pagabileConLink, daPagare } from '../../_lib/prenotazioni.js';
import { inviaEmailLinkPagamento } from '../../_lib/email.js';
import { prima } from '../../_lib/db.js';
import { json, leggiJson, controllaOrigine, dataValida, oraRoma, aggiungiGiorni } from '../../_lib/util.js';

export async function onRequestGet({ request, env }) {
  await richiedi(env.DB, request, 'gestione');
  const u = new URL(request.url).searchParams;
  const oggi = oraRoma().data;
  const dal = dataValida(u.get('dal')) ? u.get('dal') : aggiungiGiorni(oggi, -7);
  const al = dataValida(u.get('al')) ? u.get('al') : aggiungiGiorni(oggi, 365);
  const q = (u.get('q') || '').trim().slice(0, 60);
  const stato = ['confermata', 'annullata', 'da_verificare', 'rimborsi', 'in_attesa', 'scelta'].includes(u.get('stato')) ? u.get('stato') : '';
  const righe = await tutte(env.DB, `SELECT p.*, pa.nome AS partner_nome FROM prenotazioni p LEFT JOIN partner pa ON pa.id = p.partner_id
      WHERE p.stato != 'scaduta' AND NOT (p.stato = 'in_attesa' AND (p.creata_da NOT LIKE 'gestione:%' OR p.scade_il <= :ora))
        AND (:q != '' OR :stato IN ('rimborsi', 'scelta') OR p.data BETWEEN :dal AND :al)
        AND (:q = '' OR p.codice LIKE :like OR p.nome LIKE :like OR p.telefono LIKE :like OR p.email LIKE :like OR p.rif_esterno LIKE :like)
        AND (:stato = '' OR (:stato = 'rimborsi' AND p.rimborso = 'da_fare') OR (:stato = 'scelta' AND p.recupero = 'proposto' AND p.stato = 'annullata') OR p.stato = :stato)
      ORDER BY p.data, p.creata_il LIMIT 400`, { q, like: `%${q}%`, dal, al, stato, ora: new Date().toISOString() });
  return json({
    dal, al,
    prenotazioni: righe.map((p) => ({
      id: p.id, codice: p.codice, data: p.data, escursione: titoloEscursione(p.escursione), turno: turnoDi(p.escursione, p.turno)?.nome ?? p.turno,
      gommone: nomeGommone(p.barca), nome: p.nome, telefono: p.telefono, email: p.email, imbarco: nomeImbarco(p.imbarco),
      adulti: p.adulti, bambini: p.bambini, neonati: p.neonati, totale: p.totale / 100, pagato: p.pagato / 100,
      provvigione: p.provvigione / 100, stato: p.stato, rimborso: p.rimborso, canale: p.canale, metodo: p.metodo,
      rifEsterno: p.rif_esterno, struttura: p.partner_nome, note: p.note, creataIl: p.creata_il,
      escursioneSlug: p.escursione, turnoId: p.turno, rimborsato: p.rimborsato / 100, recupero: p.recupero, dataOriginale: p.data_originale,
      buono: p.buono / 100, sconto: p.sconto / 100, scontoNota: p.sconto_nota, campagna: p.campagna, checkin: p.checkin_il,
      daPagare: daPagare(p) / 100, pagabile: pagabileConLink(p), scadeIl: p.scade_il, imbarcoId: p.imbarco,
    })),
  });
}

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  controllaOrigine(request);
  const utente = await richiedi(env.DB, request, 'gestione');
  const b = await leggiJson(request);
  const p = await creaPrenotazione(contesto, b, { modo: 'gestione', utente });
  await registra(env.DB, `gestione:${utente.id}`, b.link ? 'prenotazione-link-pagamento' : 'prenotazione-manuale', { codice: p.codice, canale: p.canale });
  const riga = await prima(env.DB, 'SELECT * FROM prenotazioni WHERE id = :id', { id: p.id });
  const origine = new URL(request.url).origin;
  let link = null;
  let inviata = false;
  if (pagabileConLink(riga)) {
    link = `${origine}/prenota/paga/?codice=${encodeURIComponent(riga.codice)}&t=${encodeURIComponent(riga.token)}`;
    if (b.link && riga.email && emailAttive(env)) inviata = await inviaEmailLinkPagamento(env, riga, origine);
  }
  return json({ codice: p.codice, gommone: nomeGommone(p.barca), link, inviata, scadeIl: riga.scade_il, daPagare: daPagare(riga) / 100, nome: riga.nome, telefono: riga.telefono });
}
