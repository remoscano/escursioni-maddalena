// GET /api/gestione/statistiche?dal=&al=&base=escursione|prenotazione
// Incassi, prenotazioni e persone per escursione, canale, mese, orario; maltempo; sconti, buoni, extra.
// "base": le date si riferiscono al giorno dell'escursione oppure al giorno in cui si è prenotato.
import { turnoDi } from '../../../src/data/prenotazioni.js';
import { tutte } from '../../_lib/db.js';
import { richiedi } from '../../_lib/accessi.js';
import { titoloEscursione, nomeImbarco, nomeGommone } from '../../_lib/prenotazioni.js';
import { Errore, json, dataValida, oraRoma } from '../../_lib/util.js';

const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const gruppoCanale = (p) => (p.canale === 'sito' ? (p.campagna ? 'Sito (da volantino)' : 'Sito') : ['struttura', 'link-struttura', 'Struttura partner'].includes(p.canale) ? 'Strutture partner' : p.canale);
const euro = (c) => Math.round(c) / 100;

function aggiungi(mappa, chiave, p) {
  if (!mappa.has(chiave)) mappa.set(chiave, { nome: chiave, prenotazioni: 0, persone: 0, lordo: 0, incassato: 0 });
  const r = mappa.get(chiave);
  r.prenotazioni++;
  r.persone += p.adulti + p.bambini + p.neonati;
  r.lordo += p.totale;
  r.incassato += p.pagato - p.rimborsato;
}
const elenco = (mappa, ordina = (a, b) => b.lordo - a.lordo) => [...mappa.values()].sort(ordina).map((r) => ({
  ...r, lordo: euro(r.lordo), incassato: euro(r.incassato), medio: r.prenotazioni ? euro(r.lordo / r.prenotazioni) : 0, perPersona: r.persone ? euro(r.lordo / r.persone) : 0,
}));

export async function onRequestGet({ request, env }) {
  await richiedi(env.DB, request, 'gestione');
  const u = new URL(request.url).searchParams;
  const oggi = oraRoma().data;
  const dal = dataValida(u.get('dal')) ? u.get('dal') : `${oggi.slice(0, 4)}-01-01`;
  const al = dataValida(u.get('al')) ? u.get('al') : `${oggi.slice(0, 4)}-12-31`;
  if (al < dal) throw new Errore(400, 'Il periodo non è valido.');
  const base = u.get('base') === 'prenotazione' ? 'prenotazione' : 'escursione';
  const campoData = base === 'prenotazione' ? 'substr(p.creata_il, 1, 10)' : 'p.data';

  const righe = await tutte(env.DB, `SELECT p.*, pa.nome AS partner_nome, c.codice AS codice_sconto
      FROM prenotazioni p LEFT JOIN partner pa ON pa.id = p.partner_id LEFT JOIN codici_sconto c ON c.id = p.codice_id
      WHERE ${campoData} BETWEEN :dal AND :al AND (p.stato IN ('confermata', 'da_verificare') OR (p.stato = 'annullata' AND (p.pagato > 0 OR p.recupero IS NOT NULL)))
      ORDER BY p.data, p.creata_il LIMIT 10000`, { dal, al });
  const extra = await tutte(env.DB, `SELECT x.nome, SUM(x.quantita) AS quantita, SUM(x.totale) AS totale FROM prenotazioni_extra x JOIN prenotazioni p ON p.id = x.prenotazione_id
      WHERE ${campoData} BETWEEN :dal AND :al AND p.stato = 'confermata' GROUP BY x.nome ORDER BY totale DESC`, { dal, al });
  const buoni = await tutte(env.DB, `SELECT COUNT(*) AS numero, COALESCE(SUM(pagato), 0) AS incassato, COALESCE(SUM(valore), 0) AS valore, COALESCE(SUM(saldo), 0) AS saldo
      FROM codici_sconto WHERE tipo = 'buono' AND stato IN ('attivo', 'annullato') AND substr(creato_il, 1, 10) BETWEEN :dal AND :al`, { dal, al });

  const spese = await tutte(env.DB, `SELECT COALESCE(SUM(litri), 0) AS litri, COALESCE(SUM(carburante), 0) AS carburante, COALESCE(SUM(bevande), 0) AS bevande,
      COALESCE(SUM(cibo), 0) AS cibo, COALESCE(SUM(altro), 0) AS altro FROM rendiconti WHERE data BETWEEN :dal AND :al`, { dal, al });
  const confermate = righe.filter((p) => p.stato === 'confermata' || p.stato === 'da_verificare');
  const annullate = righe.filter((p) => p.stato === 'annullata');
  const perEscursione = new Map(), perCanale = new Map(), perMese = new Map(), perTurno = new Map(), perGiorno = new Map();
  for (const p of confermate) {
    aggiungi(perEscursione, titoloEscursione(p.escursione), p);
    aggiungi(perCanale, gruppoCanale(p), p);
    const [a, m] = p.data.split('-');
    aggiungi(perMese, `${a}-${m}`, p);
    aggiungi(perTurno, turnoDi(p.escursione, p.turno)?.nome ?? p.turno, p);
    aggiungi(perGiorno, ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'][new Date(`${p.data}T12:00:00Z`).getUTCDay()], p);
  }
  const somma = (lista, f) => lista.reduce((s, p) => s + f(p), 0);
  const persone = somma(confermate, (p) => p.adulti + p.bambini + p.neonati);
  const lordo = somma(confermate, (p) => p.totale);
  // Clienti abituali: stessa email con più di una prenotazione confermata nel periodo.
  const perEmail = new Map();
  for (const p of confermate) if (p.email) perEmail.set(p.email, (perEmail.get(p.email) || 0) + 1);

  return json({
    dal, al, base,
    totali: {
      prenotazioni: confermate.length,
      persone,
      lordo: euro(lordo),
      incassato: euro(somma(righe, (p) => p.pagato)),
      rimborsato: euro(somma(righe, (p) => p.rimborsato)),
      netto: euro(somma(righe, (p) => p.pagato - p.rimborsato)),
      buoniUsati: euro(somma(confermate, (p) => p.buono)),
      daIncassare: euro(somma(confermate, (p) => Math.max(0, p.totale - p.buono - p.pagato))),
      sconti: euro(somma(confermate, (p) => Math.max(0, p.sconto))),
      maggiorazioni: euro(somma(confermate, (p) => Math.max(0, -p.sconto))),
      extra: euro(somma(confermate, (p) => p.extra_totale)),
      provvigioni: euro(somma(confermate, (p) => p.provvigione)),
      medioPrenotazione: confermate.length ? euro(lordo / confermate.length) : 0,
      medioPersona: persone ? euro(lordo / persone) : 0,
      checkin: confermate.filter((p) => p.checkin_il).length,
      clienti: perEmail.size,
      clientiAbituali: [...perEmail.values()].filter((n) => n > 1).length,
    },
    maltempo: {
      rinviate: confermate.filter((p) => p.recupero === 'rinviata').length,
      rinviateValore: euro(somma(confermate.filter((p) => p.recupero === 'rinviata'), (p) => p.totale)),
      rimborsate: annullate.filter((p) => p.recupero === 'rimborso').length,
      inAttesaDiScelta: annullate.filter((p) => p.recupero === 'proposto').length,
      annullateTotali: annullate.length,
    },
    spese: (() => { const x = spese[0] || {}; const tot = (x.carburante || 0) + (x.bevande || 0) + (x.cibo || 0) + (x.altro || 0);
      return { litri: Math.round((x.litri || 0) * 10) / 10, carburante: euro(x.carburante || 0), bevande: euro(x.bevande || 0), cibo: euro(x.cibo || 0), altro: euro(x.altro || 0), totale: euro(tot) }; })(),
    buoniVenduti: { numero: buoni[0]?.numero ?? 0, incassato: euro(buoni[0]?.incassato ?? 0), valore: euro(buoni[0]?.valore ?? 0), ancoraDaUsare: euro(buoni[0]?.saldo ?? 0) },
    perEscursione: elenco(perEscursione),
    perCanale: elenco(perCanale),
    perMese: elenco(perMese, (a, b) => a.nome.localeCompare(b.nome)).map((r) => ({ ...r, nome: `${MESI[Number(r.nome.slice(5)) - 1]} ${r.nome.slice(0, 4)}` })),
    perTurno: elenco(perTurno),
    perGiorno: elenco(perGiorno),
    extra: extra.map((e) => ({ nome: e.nome, quantita: e.quantita, totale: euro(e.totale) })),
    prenotazioni: righe.map((p) => ({
      data: p.data, prenotataIl: p.creata_il.slice(0, 10), codice: p.codice, stato: p.stato, escursione: titoloEscursione(p.escursione),
      turno: turnoDi(p.escursione, p.turno)?.nome ?? p.turno, gommone: nomeGommone(p.barca), imbarco: nomeImbarco(p.imbarco),
      cliente: p.nome, email: p.email, adulti: p.adulti, bambini: p.bambini + p.neonati,
      listino: p.listino === null ? null : euro(p.listino), sconto: euro(p.sconto), scontoNota: p.sconto_nota || '', codiceSconto: p.codice_sconto || '',
      extra: euro(p.extra_totale), totale: euro(p.totale), buono: euro(p.buono), pagato: euro(p.pagato), rimborsato: euro(p.rimborsato),
      metodo: p.metodo, rifPagamento: p.pagamento_rif || '', canale: gruppoCanale(p), struttura: p.partner_nome || '', provvigione: euro(p.provvigione),
      rifEsterno: p.rif_esterno || '', campagna: p.campagna || '', maltempo: p.recupero || '',
    })),
  });
}
