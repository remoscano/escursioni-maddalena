// GET /api/partner/riepilogo → vendite, guadagni e provvigioni della struttura collegata.
import { turnoDi } from '../../../src/data/prenotazioni.js';
import { tutte } from '../../_lib/db.js';
import { richiedi } from '../../_lib/accessi.js';
import { titoloEscursione } from '../../_lib/prenotazioni.js';
import { json, oraRoma } from '../../_lib/util.js';
import { quindicinaDi } from '../../_lib/periodi.js';

export async function onRequestGet({ request, env }) {
  const u = await richiedi(env.DB, request, 'partner');
  const oggi = oraRoma().data;
  const righe = await tutte(env.DB, `SELECT codice, escursione, turno, data, adulti, bambini, neonati, nome, totale, provvigione, stato, canale, creata_il
                                     FROM prenotazioni WHERE partner_id = :p AND stato IN ('confermata', 'da_verificare', 'annullata')
                                     ORDER BY data DESC, creata_il DESC LIMIT 500`, { p: u.partner_id });
  const liquidazioni = await tutte(env.DB, 'SELECT dal, al, importo, pagata_il FROM liquidazioni WHERE partner_id = :p ORDER BY dal DESC', { p: u.partner_id });
  const confermate = righe.filter((r) => r.stato === 'confermata');
  const somma = (lista, campo) => lista.reduce((s, r) => s + r[campo], 0);
  const maturata = somma(confermate.filter((r) => r.data < oggi), 'provvigione');
  const liquidata = somma(liquidazioni, 'importo');
  const periodo = quindicinaDi(oggi);
  return json({
    struttura: { nome: u.partner_nome, codice: u.partner_codice, provvigione: u.provvigione_pct },
    totali: {
      venduto: somma(confermate, 'totale') / 100,
      maturata: maturata / 100,
      inArrivo: somma(confermate.filter((r) => r.data >= oggi), 'provvigione') / 100,
      liquidata: liquidata / 100,
      daRicevere: Math.max(0, maturata - liquidata) / 100,
      prenotazioni: confermate.length,
    },
    periodo: {
      ...periodo,
      provvigione: somma(confermate.filter((r) => r.data >= periodo.dal && r.data <= periodo.al), 'provvigione') / 100,
    },
    prenotazioni: righe.map((r) => ({
      codice: r.codice,
      escursione: titoloEscursione(r.escursione),
      turno: turnoDi(r.escursione, r.turno)?.nome ?? r.turno,
      data: r.data,
      persone: r.adulti + r.bambini + r.neonati,
      // Il nome dell'ospite si vede solo se la prenotazione l'ha fatta la struttura.
      nome: r.canale === 'struttura' ? r.nome : null,
      daLink: r.canale === 'link-struttura',
      totale: r.totale / 100,
      provvigione: r.stato === 'confermata' ? r.provvigione / 100 : 0,
      stato: r.stato,
    })),
    liquidazioni: liquidazioni.map((l) => ({ ...l, importo: l.importo / 100 })),
  });
}
