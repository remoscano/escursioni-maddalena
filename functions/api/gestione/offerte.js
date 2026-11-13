// Promozioni (regole di prezzo), codici sconto, buoni regalo ed extra.
// GET  /api/gestione/offerte → tutto l'elenco
// POST { tipo: 'regola' | 'codice' | 'buono' | 'extra', azione: 'crea' | 'attiva' | 'disattiva' | 'annulla', ... }
import { offerte } from '../../../src/data/prenotazioni.js';
import { tutte, prima, esegui, registra } from '../../_lib/db.js';
import { richiedi } from '../../_lib/accessi.js';
import { codiceBuono, scadenzaBuono } from '../../_lib/buoni.js';
import { rimborsa } from '../../_lib/pagamenti.js';
import { Errore, json, leggiJson, controllaOrigine, testo, dataValida, tokenSicuro } from '../../_lib/util.js';

const numero = (v, campo, min, max) => {
  const n = Number(String(v ?? '').replace(',', '.'));
  if (!Number.isFinite(n) || n < min || n > max) throw new Errore(400, `Valore non valido: ${campo}.`);
  return n;
};
const dataOpz = (v) => (v ? (dataValida(v) ? v : (() => { throw new Errore(400, 'Data non valida.'); })()) : null);
const escursioniOpz = (v) => {
  const lista = (Array.isArray(v) ? v : String(v || '').split(',')).map((x) => String(x).trim()).filter(Boolean);
  if (lista.some((x) => !offerte[x])) throw new Errore(400, 'Escursione non valida.');
  return lista.length ? lista.join(',') : null;
};

export async function onRequestGet({ request, env }) {
  await richiedi(env.DB, request, 'gestione');
  const [regole, codici, buoni, extra] = await Promise.all([
    tutte(env.DB, 'SELECT * FROM regole_prezzo ORDER BY attiva DESC, id DESC', {}),
    tutte(env.DB, `SELECT c.*, (SELECT COUNT(*) FROM prenotazioni p WHERE p.codice_id = c.id AND p.stato = 'confermata') AS prenotazioni,
                     (SELECT COALESCE(SUM(p.sconto), 0) FROM prenotazioni p WHERE p.codice_id = c.id AND p.stato = 'confermata') AS scontato
                   FROM codici_sconto c WHERE c.tipo != 'buono' ORDER BY c.stato = 'attivo' DESC, c.id DESC`, {}),
    tutte(env.DB, "SELECT * FROM codici_sconto WHERE tipo = 'buono' AND stato != 'in_attesa' ORDER BY id DESC LIMIT 300", {}),
    tutte(env.DB, `SELECT e.*, (SELECT COALESCE(SUM(x.quantita), 0) FROM prenotazioni_extra x JOIN prenotazioni p ON p.id = x.prenotazione_id WHERE x.extra_id = e.id AND p.stato = 'confermata') AS venduti
                   FROM extra e ORDER BY e.attivo DESC, e.ordine, e.id`, {}),
  ]);
  return json({
    regole: regole.map((r) => ({ ...r, attiva: Boolean(r.attiva) })),
    codici: codici.map((c) => ({ id: c.id, codice: c.codice, tipo: c.tipo, valore: c.tipo === 'importo' ? c.valore / 100 : c.valore, dal: c.dal, al: c.al, usiMax: c.usi_max, usati: c.usati, escursioni: c.escursioni, attivo: c.stato === 'attivo', note: c.note, prenotazioni: c.prenotazioni, scontato: c.scontato / 100 })),
    buoni: buoni.map((b) => ({ id: b.id, codice: b.codice, valore: b.valore / 100, saldo: b.saldo / 100, al: b.al, stato: b.stato, acquirente: b.acquirente, email: b.email, destinatario: b.destinatario, pagato: b.pagato / 100, metodo: b.metodo, creatoIl: b.creato_il, creatoDa: b.creato_da, note: b.note, token: b.token })),
    extra: extra.map((e) => ({ id: e.id, nome: e.nome, descrizione: e.descrizione, prezzo: e.prezzo / 100, modo: e.modo, maxGiorno: e.max_giorno, escursioni: e.escursioni, attivo: Boolean(e.attivo), venduti: e.venduti })),
  });
}

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  controllaOrigine(request);
  const u = await richiedi(env.DB, request, 'gestione');
  const chi = `gestione:${u.id}`;
  const b = await leggiJson(request, 4000);
  const id = Number(b.id) || 0;
  let risposta = { ok: true };

  if (b.tipo === 'regola') {
    if (b.azione === 'crea') {
      const tipo = ['anticipo', 'ultimo-minuto', 'gruppo', 'weekend'].includes(b.regola) ? b.regola : null;
      if (!tipo) throw new Errore(400, 'Scegli il tipo di promozione.');
      const soglia = tipo === 'weekend' ? 0 : numero(b.soglia, tipo === 'gruppo' ? 'persone' : tipo === 'anticipo' ? 'giorni' : 'ore', 1, 400);
      const percentuale = numero(b.percentuale, 'percentuale', 1, tipo === 'weekend' ? 100 : 90);
      const r = await esegui(env.DB, 'INSERT INTO regole_prezzo (nome, tipo, soglia, percentuale, escursioni, dal, al) VALUES (:n, :t, :s, :p, :e, :dal, :al)', {
        n: testo(b.nome, { campo: 'nome', massimo: 60 }) || '', t: tipo, s: Math.round(soglia), p: percentuale, e: escursioniOpz(b.escursioni), dal: dataOpz(b.dal), al: dataOpz(b.al),
      });
      risposta = { id: r.meta.last_row_id };
    } else if (['attiva', 'disattiva'].includes(b.azione)) {
      await esegui(env.DB, 'UPDATE regole_prezzo SET attiva = :a WHERE id = :id', { a: b.azione === 'attiva' ? 1 : 0, id });
    } else if (b.azione === 'elimina') {
      await esegui(env.DB, 'DELETE FROM regole_prezzo WHERE id = :id', { id });
    } else throw new Errore(400, 'Azione non valida.');
  } else if (b.tipo === 'codice') {
    if (b.azione === 'crea') {
      const codice = testo(b.codice, { campo: 'codice', massimo: 20, obbligatorio: true }).toUpperCase().replace(/\s+/g, '');
      if (!/^[A-Z0-9-]{3,20}$/.test(codice)) throw new Errore(400, 'Il codice può avere solo lettere, numeri e trattini (da 3 a 20).');
      const tipo = b.sconto === 'importo' ? 'importo' : 'percentuale';
      const valore = tipo === 'importo' ? Math.round(numero(b.valore, 'importo', 1, 5000) * 100) : numero(b.valore, 'percentuale', 1, 90);
      const usi = b.usiMax ? Math.round(numero(b.usiMax, 'numero di usi', 1, 100000)) : null;
      try {
        await esegui(env.DB, 'INSERT INTO codici_sconto (codice, tipo, valore, dal, al, usi_max, escursioni, note, creato_da) VALUES (:c, :t, :v, :dal, :al, :u, :e, :n, :chi)', {
          c: codice, t: tipo, v: valore, dal: dataOpz(b.dal), al: dataOpz(b.al), u: usi, e: escursioniOpz(b.escursioni), n: testo(b.note, { campo: 'note', massimo: 200 }) || null, chi,
        });
      } catch (e) {
        if (String(e?.message || e).includes('UNIQUE')) throw new Errore(409, 'Questo codice esiste già.');
        throw e;
      }
    } else if (['attiva', 'disattiva'].includes(b.azione)) {
      await esegui(env.DB, "UPDATE codici_sconto SET stato = :s WHERE id = :id AND tipo != 'buono'", { s: b.azione === 'attiva' ? 'attivo' : 'annullato', id });
    } else throw new Errore(400, 'Azione non valida.');
  } else if (b.tipo === 'buono') {
    if (b.azione === 'crea') {
      // Buono fatto dall'ufficio (pagato in contanti, omaggio, rimborso in credito).
      const valore = Math.round(numero(b.valore, 'importo', 1, 5000) * 100);
      const codice = codiceBuono();
      await esegui(env.DB, `INSERT INTO codici_sconto (codice, tipo, valore, saldo, al, stato, token, acquirente, email, destinatario, note, metodo, pagato, creato_da)
        VALUES (:c, 'buono', :v, :v, :al, 'attivo', :t, :a, :e, :d, :n, 'ufficio', :p, :chi)`, {
        c: codice, v: valore, al: dataOpz(b.al) || scadenzaBuono(), t: tokenSicuro(24),
        a: testo(b.acquirente, { campo: 'nome', massimo: 100 }) || null, e: null, d: testo(b.destinatario, { campo: 'a chi', massimo: 100 }) || null,
        n: testo(b.note, { campo: 'note', massimo: 200 }) || null, p: b.pagato === true ? valore : 0, chi,
      });
      const nuovo = await prima(env.DB, 'SELECT codice, token FROM codici_sconto WHERE codice = :c', { c: codice });
      risposta = { codice, link: `${new URL(request.url).origin}/buono-regalo/esito/?codice=${encodeURIComponent(codice)}&t=${encodeURIComponent(nuovo.token)}` };
    } else if (b.azione === 'annulla') {
      const buono = await prima(env.DB, "SELECT * FROM codici_sconto WHERE id = :id AND tipo = 'buono' AND stato = 'attivo'", { id });
      if (!buono) throw new Errore(404, 'Buono non trovato.');
      if (b.rimborsa === true) {
        if (buono.saldo !== buono.valore) throw new Errore(409, 'Il buono è già stato usato in parte: il rimborso automatico vale solo per i buoni mai usati.');
        if (!['sumup', 'paypal', 'prova'].includes(buono.metodo)) throw new Errore(400, 'Questo buono non è stato pagato sul sito: il rimborso va fatto a mano.');
        const { rif } = await rimborsa(env, buono, buono.pagato, 1);
        await esegui(env.DB, 'UPDATE codici_sconto SET rimborsato = pagato, note = COALESCE(note || char(10), \'\') || :n WHERE id = :id', { n: `Rimborsato (${rif})`, id });
      }
      await esegui(env.DB, "UPDATE codici_sconto SET stato = 'annullato', saldo = 0 WHERE id = :id", { id });
    } else throw new Errore(400, 'Azione non valida.');
  } else if (b.tipo === 'extra') {
    if (b.azione === 'crea') {
      const max = b.maxGiorno ? Math.round(numero(b.maxGiorno, 'massimo al giorno', 1, 10000)) : null;
      await esegui(env.DB, 'INSERT INTO extra (nome, descrizione, prezzo, modo, max_giorno, escursioni) VALUES (:n, :d, :p, :m, :x, :e)', {
        n: testo(b.nome, { campo: 'nome', massimo: 60, obbligatorio: true }), d: testo(b.descrizione, { campo: 'descrizione', massimo: 200 }) || null,
        p: Math.round(numero(b.prezzo, 'prezzo', 0.5, 5000) * 100), m: b.modo === 'persona' ? 'persona' : 'prenotazione', x: max, e: escursioniOpz(b.escursioni),
      });
    } else if (['attiva', 'disattiva'].includes(b.azione)) {
      await esegui(env.DB, 'UPDATE extra SET attivo = :a WHERE id = :id', { a: b.azione === 'attiva' ? 1 : 0, id });
    } else throw new Errore(400, 'Azione non valida.');
  } else {
    throw new Errore(400, 'Tipo non valido.');
  }
  await registra(env.DB, chi, `${b.tipo}-${b.azione}`, { id, codice: b.codice });
  return json(risposta);
}

