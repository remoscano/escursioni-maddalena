// Accessi degli skipper (vedono solo le uscite di oggi e fanno il check-in all'imbarco).
// GET  /api/gestione/utenti → elenco
// POST { azione: 'crea', nome, email } | { azione: 'attiva' | 'disattiva' | 'nuova-password', id }
import { tutte, prima, esegui, registra } from '../../_lib/db.js';
import { richiedi, impronta, passwordCasuale } from '../../_lib/accessi.js';
import { Errore, json, leggiJson, controllaOrigine, testo, email } from '../../_lib/util.js';

export async function onRequestGet({ request, env }) {
  await richiedi(env.DB, request, 'gestione');
  const righe = await tutte(env.DB, "SELECT id, nome, email, attivo, ultimo_accesso FROM utenti WHERE ruolo = 'skipper' ORDER BY attivo DESC, nome", {});
  return json({ skipper: righe.map((r) => ({ ...r, attivo: Boolean(r.attivo) })) });
}

export async function onRequestPost({ request, env }) {
  controllaOrigine(request);
  const u = await richiedi(env.DB, request, 'gestione');
  const chi = `gestione:${u.id}`;
  const b = await leggiJson(request, 2000);
  if (b.azione === 'crea') {
    const nome = testo(b.nome, { campo: 'nome', massimo: 100, obbligatorio: true });
    const mail = email(b.email, true);
    if (await prima(env.DB, 'SELECT id FROM utenti WHERE email = :e', { e: mail })) throw new Errore(409, 'Esiste già un accesso con questa email.');
    const password = passwordCasuale();
    const r = await esegui(env.DB, "INSERT INTO utenti (ruolo, nome, email, password_hash, deve_cambiare) VALUES ('skipper', :n, :e, :h, 1)", { n: nome, e: mail, h: await impronta(password) });
    await registra(env.DB, chi, 'skipper-creato', { nome });
    return json({ id: r.meta.last_row_id, email: mail, password });
  }
  const s = await prima(env.DB, "SELECT * FROM utenti WHERE id = :id AND ruolo = 'skipper'", { id: Number(b.id) || 0 });
  if (!s) throw new Errore(404, 'Accesso non trovato.');
  if (b.azione === 'attiva' || b.azione === 'disattiva') {
    await esegui(env.DB, 'UPDATE utenti SET attivo = :a WHERE id = :id', { a: b.azione === 'attiva' ? 1 : 0, id: s.id });
    if (b.azione === 'disattiva') await esegui(env.DB, 'DELETE FROM sessioni WHERE utente_id = :id', { id: s.id });
  } else if (b.azione === 'nuova-password') {
    const password = passwordCasuale();
    await esegui(env.DB, 'UPDATE utenti SET password_hash = :h, deve_cambiare = 1 WHERE id = :id', { h: await impronta(password), id: s.id });
    await esegui(env.DB, 'DELETE FROM sessioni WHERE utente_id = :id', { id: s.id });
    await registra(env.DB, chi, 'skipper-nuova-password', { id: s.id });
    return json({ email: s.email, password });
  } else {
    throw new Errore(400, 'Azione non valida.');
  }
  await registra(env.DB, chi, `skipper-${b.azione}`, { id: s.id });
  return json({ ok: true });
}
