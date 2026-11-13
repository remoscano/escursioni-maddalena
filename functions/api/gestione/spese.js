// GET /api/gestione/spese?dal=&al= → spese di bordo di tutti gli skipper nel periodo:
// elenco, totali, per gommone, per skipper, per mese, e i giorni con uscite ma senza dati.
import { gommoni } from '../../../src/data/prenotazioni.js';
import { tutte } from '../../_lib/db.js';
import { richiedi } from '../../_lib/accessi.js';
import { vistaRendiconto } from '../../_lib/spese.js';
import { Errore, json, dataValida, oraRoma } from '../../_lib/util.js';

const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const nomeGommone = (id) => gommoni.find((g) => g.id === id)?.nome ?? id;

function somma(mappa, chiave, r) {
  if (!mappa.has(chiave)) mappa.set(chiave, { nome: chiave, giorni: new Set(), litri: 0, carburante: 0, bevande: 0, cibo: 0, altro: 0, totale: 0 });
  const t = mappa.get(chiave);
  t.giorni.add(r.data);
  t.litri += r.litri; t.carburante += r.carburante; t.bevande += r.bevande; t.cibo += r.cibo; t.altro += r.altro;
  t.totale += r.carburante + r.bevande + r.cibo + r.altro;
}
const elenco = (mappa) => [...mappa.values()].map((t) => ({
  nome: t.nome, giorni: t.giorni.size, litri: Math.round(t.litri * 10) / 10,
  carburante: t.carburante / 100, bevande: t.bevande / 100, cibo: t.cibo / 100, altro: t.altro / 100, totale: t.totale / 100,
  euroLitro: t.litri ? Math.round((t.carburante / 100 / t.litri) * 1000) / 1000 : null,
}));

export async function onRequestGet({ request, env }) {
  await richiedi(env.DB, request, 'gestione');
  const u = new URL(request.url).searchParams;
  const oggi = oraRoma().data;
  const dal = dataValida(u.get('dal')) ? u.get('dal') : `${oggi.slice(0, 7)}-01`;
  const al = dataValida(u.get('al')) ? u.get('al') : oggi;
  if (al < dal) throw new Errore(400, 'Il periodo non è valido.');
  const righe = await tutte(env.DB, `SELECT r.*, ut.nome AS skipper_nome FROM rendiconti r JOIN utenti ut ON ut.id = r.utente_id
                                     WHERE r.data BETWEEN :dal AND :al ORDER BY r.data, r.barca`, { dal, al });
  // Giorni con uscite fatte (prenotazioni confermate nel passato o oggi) su un gommone senza nessun rendiconto per quel gommone.
  const uscite = await tutte(env.DB, `SELECT p.data, p.barca, COUNT(*) AS prenotazioni, SUM(p.adulti + p.bambini + p.neonati) AS persone,
        MAX(p.checkin_da) AS checkin_da, MAX(ut.nome) AS skipper
      FROM prenotazioni p LEFT JOIN utenti ut ON ('skipper:' || ut.id) = p.checkin_da
      WHERE p.stato = 'confermata' AND p.data BETWEEN :dal AND :al AND p.data <= :oggi
      GROUP BY p.data, p.barca ORDER BY p.data, p.barca`, { dal, al, oggi });
  const conDati = new Set(righe.map((r) => `${r.data}|${r.barca}`));
  const mancanti = uscite.filter((x) => !conDati.has(`${x.data}|${x.barca}`))
    .map((x) => ({ data: x.data, barca: x.barca, gommone: nomeGommone(x.barca), prenotazioni: x.prenotazioni, persone: x.persone, skipper: x.skipper || null }));

  const perGommone = new Map(), perSkipper = new Map(), perMese = new Map(), totale = new Map();
  for (const r of righe) {
    somma(perGommone, nomeGommone(r.barca), r);
    somma(perSkipper, r.skipper_nome, r);
    somma(perMese, `${MESI[Number(r.data.slice(5, 7)) - 1]} ${r.data.slice(0, 4)}`, r);
    somma(totale, 'Totale', r);
  }
  return json({
    dal, al,
    totale: elenco(totale)[0] ?? { nome: 'Totale', giorni: 0, litri: 0, carburante: 0, bevande: 0, cibo: 0, altro: 0, totale: 0, euroLitro: null },
    perGommone: elenco(perGommone), perSkipper: elenco(perSkipper), perMese: elenco(perMese),
    mancanti,
    rendiconti: righe.map(vistaRendiconto),
  });
}
