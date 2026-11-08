// GET    /api/accesso → chi è collegato
// POST   /api/accesso { email, password } → entra
// DELETE /api/accesso → esce
import { prima, esegui, registra } from '../../_lib/db.js';
import { utenteCollegato, verificaPassword, creaSessione, chiudiSessione, cookieSessione, controllaTentativi } from '../../_lib/accessi.js';
import { Errore, json, leggiJson, controllaOrigine } from '../../_lib/util.js';

const pubblico = (u) => ({
  ruolo: u.ruolo, nome: u.nome, email: u.email, deveCambiare: Boolean(u.deve_cambiare),
  partner: u.partner_id ? { nome: u.partner_nome, codice: u.partner_codice, provvigione: u.provvigione_pct } : null,
});

export async function onRequestGet({ request, env }) {
  const u = await utenteCollegato(env.DB, request);
  if (!u) throw new Errore(401, 'Non collegato.');
  return json(pubblico(u));
}

export async function onRequestPost({ request, env }) {
  controllaOrigine(request);
  const b = await leggiJson(request, 2000);
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase().slice(0, 160) : '';
  const password = typeof b.password === 'string' ? b.password.slice(0, 200) : '';
  if (!email || !password) throw new Errore(400, 'Inserisci email e password.');
  const tentativi = await controllaTentativi(env.DB, request, email);
  const u = await prima(env.DB, `SELECT u.*, pa.attivo AS partner_attivo FROM utenti u LEFT JOIN partner pa ON pa.id = u.partner_id
                                 WHERE u.email = :e AND u.attivo = 1`, { e: email });
  if (!u || !(await verificaPassword(password, u.password_hash))) {
    await tentativi.sbagliato();
    throw new Errore(401, 'Email o password non corretti.');
  }
  if (u.ruolo === 'partner' && !u.partner_attivo) throw new Errore(403, 'Questo account non è attivo: contatta Escursioni Maddalena.');
  await tentativi.riuscito();
  const s = await creaSessione(env.DB, u.id);
  await esegui(env.DB, 'UPDATE utenti SET ultimo_accesso = :ora WHERE id = :id', { ora: new Date().toISOString(), id: u.id });
  await registra(env.DB, `${u.ruolo}:${u.id}`, 'accesso', null);
  const collegato = await prima(env.DB, `SELECT u.*, pa.nome AS partner_nome, pa.codice AS partner_codice, pa.provvigione_pct
                                         FROM utenti u LEFT JOIN partner pa ON pa.id = u.partner_id WHERE u.id = :id`, { id: u.id });
  return json(pubblico(collegato), 200, { 'Set-Cookie': cookieSessione(s.token, s.secondi) });
}

export async function onRequestDelete({ request, env }) {
  controllaOrigine(request);
  await chiudiSessione(env.DB, request);
  return json({ ok: true }, 200, { 'Set-Cookie': cookieSessione('', 0) });
}
