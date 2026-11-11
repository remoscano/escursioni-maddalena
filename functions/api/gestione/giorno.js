// GET /api/gestione/giorno?data=AAAA-MM-GG → uscite del giorno per gommone, con l'elenco passeggeri.
import { gommoni, offerte, turnoDi, orarioDi } from '../../../src/data/prenotazioni.js';
import { tutte } from '../../_lib/db.js';
import { richiedi } from '../../_lib/accessi.js';
import { titoloEscursione, nomeImbarco } from '../../_lib/prenotazioni.js';
import { Errore, json, dataValida, adessoISO } from '../../_lib/util.js';

export async function onRequestGet({ request, env }) {
  await richiedi(env.DB, request, 'gestione');
  const data = new URL(request.url).searchParams.get('data');
  if (!dataValida(data)) throw new Errore(400, 'Data non valida.');
  const ora = adessoISO();
  const [pren, chiusure] = await Promise.all([
    tutte(env.DB, `SELECT p.*, pa.nome AS partner_nome FROM prenotazioni p LEFT JOIN partner pa ON pa.id = p.partner_id
                   WHERE p.data = :data AND (p.stato IN ('confermata', 'da_verificare', 'annullata') OR (p.stato = 'in_attesa' AND p.scade_il > :ora))
                   ORDER BY p.creata_il`, { data, ora }),
    tutte(env.DB, 'SELECT id, barca, blocco, motivo FROM blocchi WHERE data = :data ORDER BY barca, blocco', { data }),
  ]);
  const vista = (p) => ({
    id: p.id, codice: p.codice, nome: p.nome, telefono: p.telefono, email: p.email,
    adulti: p.adulti, bambini: p.bambini, neonati: p.neonati, imbarco: nomeImbarco(p.imbarco),
    stato: p.stato, rimborso: p.rimborso, canale: p.canale, metodo: p.metodo, rifEsterno: p.rif_esterno,
    totale: p.totale / 100, pagato: p.pagato / 100, note: p.note, struttura: p.partner_nome,
    escursione: titoloEscursione(p.escursione), turno: turnoDi(p.escursione, p.turno)?.nome ?? p.turno,
  });
  const attive = pren.filter((p) => p.stato !== 'annullata');
  const risultato = gommoni.map((g) => {
    const mie = attive.filter((p) => p.barca === g.id);
    const uscite = new Map();
    for (const p of mie) {
      const k = `${p.escursione}|${p.turno}`;
      if (!uscite.has(k)) {
        const t = turnoDi(p.escursione, p.turno);
        uscite.set(k, { escursioneSlug: p.escursione, turnoId: p.turno, escursione: titoloEscursione(p.escursione), turno: t?.nome ?? p.turno, orario: orarioDi(t, p.data), minimo: offerte[p.escursione]?.minimo ?? null, privato: offerte[p.escursione]?.tipo === 'esclusiva', persone: 0, paganti: 0, prenotazioni: [] });
      }
      const u = uscite.get(k);
      u.persone += p.adulti + p.bambini + p.neonati;
      u.paganti += p.paganti;
      u.prenotazioni.push(vista(p));
    }
    return {
      id: g.id, nome: g.nome, tipo: g.tipo, posti: g.posti,
      chiusure: chiusure.filter((c) => c.barca === g.id || c.barca === '*'),
      uscite: [...uscite.values()].map((u) => ({ ...u, confermata: u.privato || (u.minimo ? u.paganti >= u.minimo : true) })),
    };
  });
  return json({ data, gommoni: risultato, annullate: pren.filter((p) => p.stato === 'annullata').map(vista) });
}
