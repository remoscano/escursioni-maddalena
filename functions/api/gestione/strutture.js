// GET  /api/gestione/strutture → strutture partner con vendite e provvigioni
// POST { azione: 'crea' | 'modifica' | 'nuova-password', ... }
import { regole } from '../../../src/data/prenotazioni.js';
import { tutte, prima, esegui, registra } from '../../_lib/db.js';
import { richiedi, impronta, passwordCasuale } from '../../_lib/accessi.js';
import { Errore, json, leggiJson, controllaOrigine, testo, email, telefono, codiceCasuale, oraRoma } from '../../_lib/util.js';

export async function onRequestGet({ request, env }) {
  await richiedi(env.DB, request, 'gestione');
  const oggi = oraRoma().data;
  const righe = await tutte(env.DB, `SELECT pa.*, u.email AS accesso_email, u.ultimo_accesso,
      (SELECT COALESCE(SUM(totale), 0) FROM prenotazioni WHERE partner_id = pa.id AND stato = 'confermata') AS venduto,
      (SELECT COUNT(*) FROM prenotazioni WHERE partner_id = pa.id AND stato = 'confermata') AS numero,
      (SELECT COALESCE(SUM(provvigione), 0) FROM prenotazioni WHERE partner_id = pa.id AND stato = 'confermata' AND data < :oggi) AS maturata,
      (SELECT COALESCE(SUM(importo), 0) FROM liquidazioni WHERE partner_id = pa.id) AS liquidata
    FROM partner pa LEFT JOIN utenti u ON u.partner_id = pa.id AND u.ruolo = 'partner'
    ORDER BY pa.attivo DESC, pa.nome`, { oggi });
  return json({
    strutture: righe.map((r) => ({
      id: r.id, nome: r.nome, codice: r.codice, email: r.email, telefono: r.telefono, referente: r.referente,
      provvigione: r.provvigione_pct, attivo: Boolean(r.attivo), accesso: r.accesso_email, ultimoAccesso: r.ultimo_accesso,
      venduto: r.venduto / 100, numero: r.numero, maturata: r.maturata / 100, liquidata: r.liquidata / 100,
      daPagare: Math.max(0, r.maturata - r.liquidata) / 100,
    })),
  });
}

function codiceDaNome(nome) {
  const base = nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'STRUTTURA';
  return `${base}${codiceCasuale(3)}`;
}

export async function onRequestPost({ request, env }) {
  controllaOrigine(request);
  const u = await richiedi(env.DB, request, 'gestione');
  const b = await leggiJson(request, 4000);
  const chi = `gestione:${u.id}`;
  const provvigione = (v) => {
    const n = Number(v ?? regole.provvigioneStrutture);
    if (!Number.isFinite(n) || n < 0 || n > 50) throw new Errore(400, 'Provvigione non valida.');
    return n;
  };

  if (b.azione === 'crea') {
    const nome = testo(b.nome, { campo: 'nome della struttura', massimo: 100, obbligatorio: true });
    const mail = email(b.email, true);
    const tel = telefono(b.telefono, false) || null;
    const referente = testo(b.referente, { campo: 'referente', massimo: 100 }) || null;
    if (await prima(env.DB, 'SELECT id FROM utenti WHERE email = :e', { e: mail })) throw new Errore(409, 'Esiste già un accesso con questa email.');
    const codice = codiceDaNome(nome);
    const password = passwordCasuale();
    const r = await esegui(env.DB, 'INSERT INTO partner (nome, codice, email, telefono, referente, provvigione_pct) VALUES (:n, :c, :e, :t, :r, :p)',
      { n: nome, c: codice, e: mail, t: tel, r: referente, p: provvigione(b.provvigione) });
    await esegui(env.DB, "INSERT INTO utenti (ruolo, partner_id, nome, email, password_hash, deve_cambiare) VALUES ('partner', :p, :n, :e, :h, 1)",
      { p: r.meta.last_row_id, n: referente || nome, e: mail, h: await impronta(password) });
    await registra(env.DB, chi, 'struttura-creata', { nome, codice });
    return json({ id: r.meta.last_row_id, codice, email: mail, password });
  }

  const pa = await prima(env.DB, 'SELECT * FROM partner WHERE id = :id', { id: Number(b.id) || 0 });
  if (!pa) throw new Errore(404, 'Struttura non trovata.');

  if (b.azione === 'modifica') {
    await esegui(env.DB, 'UPDATE partner SET nome = :n, telefono = :t, referente = :r, provvigione_pct = :p, attivo = :a WHERE id = :id', {
      n: testo(b.nome, { campo: 'nome della struttura', massimo: 100, obbligatorio: true }),
      t: telefono(b.telefono, false) || null,
      r: testo(b.referente, { campo: 'referente', massimo: 100 }) || null,
      p: provvigione(b.provvigione),
      a: b.attivo === false ? 0 : 1,
      id: pa.id,
    });
    if (b.attivo === false) await esegui(env.DB, "DELETE FROM sessioni WHERE utente_id IN (SELECT id FROM utenti WHERE partner_id = :p)", { p: pa.id });
    await registra(env.DB, chi, 'struttura-modificata', { id: pa.id });
    return json({ ok: true });
  }

  if (b.azione === 'nuova-password') {
    const password = passwordCasuale();
    const r = await esegui(env.DB, "UPDATE utenti SET password_hash = :h, deve_cambiare = 1 WHERE partner_id = :p AND ruolo = 'partner'", { h: await impronta(password), p: pa.id });
    if (r.meta?.changes !== 1) throw new Errore(404, 'Accesso della struttura non trovato.');
    await esegui(env.DB, "DELETE FROM sessioni WHERE utente_id IN (SELECT id FROM utenti WHERE partner_id = :p)", { p: pa.id });
    await registra(env.DB, chi, 'struttura-nuova-password', { id: pa.id });
    return json({ email: pa.email, password });
  }

  throw new Errore(400, 'Azione non valida.');
}
