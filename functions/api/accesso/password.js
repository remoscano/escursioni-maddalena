// POST /api/accesso/password { attuale, nuova } → cambia la propria password
import { prima, esegui, registra } from '../../_lib/db.js';
import { richiedi, verificaPassword, impronta, controllaNuovaPassword } from '../../_lib/accessi.js';
import { Errore, json, leggiJson, controllaOrigine } from '../../_lib/util.js';

export async function onRequestPost({ request, env }) {
  controllaOrigine(request);
  const u = await richiedi(env.DB, request);
  const b = await leggiJson(request, 2000);
  const riga = await prima(env.DB, 'SELECT password_hash FROM utenti WHERE id = :id', { id: u.id });
  if (!(await verificaPassword(String(b.attuale || ''), riga.password_hash))) throw new Errore(400, 'La password attuale non è corretta.');
  const nuova = controllaNuovaPassword(b.nuova);
  if (nuova === b.attuale) throw new Errore(400, 'La nuova password deve essere diversa da quella attuale.');
  await esegui(env.DB, 'UPDATE utenti SET password_hash = :h, deve_cambiare = 0 WHERE id = :id', { h: await impronta(nuova), id: u.id });
  await registra(env.DB, `${u.ruolo}:${u.id}`, 'cambio-password', null);
  return json({ ok: true });
}
