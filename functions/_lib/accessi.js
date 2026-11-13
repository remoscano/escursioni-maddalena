// Accessi per la gestione interna e per le strutture partner.
// Password salvate con PBKDF2 (100.000 passaggi), sessioni con codice casuale salvato solo come impronta.

import { prima, esegui } from './db.js';
import { Errore, base64url, sha256, tokenSicuro, ugualeSicuro, indirizzoIp } from './util.js';

const PASSAGGI = 100000;
const DURATA_SESSIONE_ORE = 12;
export const NOME_COOKIE = 'em_sessione';

function daBase64url(s) {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

async function deriva(password, sale, passaggi) {
  const chiave = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sale, iterations: passaggi }, chiave, 256);
  return base64url(new Uint8Array(bits));
}

export async function impronta(password) {
  const sale = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${PASSAGGI}$${base64url(sale)}$${await deriva(password, sale, PASSAGGI)}`;
}

export async function verificaPassword(password, memorizzata) {
  const [tipo, passaggi, sale, hash] = String(memorizzata || '').split('$');
  if (tipo !== 'pbkdf2' || !sale || !hash) return false;
  return ugualeSicuro(await deriva(password, daBase64url(sale), Number(passaggi)), hash);
}

export function controllaNuovaPassword(p) {
  if (typeof p !== 'string' || p.length < 10) throw new Errore(400, 'La password deve avere almeno 10 caratteri.');
  if (p.length > 200) throw new Errore(400, 'Password troppo lunga.');
  return p;
}

export function passwordCasuale() {
  return `${tokenSicuro(9).replace(/[-_]/g, 'x')}-${tokenSicuro(3).replace(/[-_]/g, 'k')}`;
}

function leggiCookie(request, nome) {
  const riga = request.headers.get('Cookie') || '';
  for (const parte of riga.split(';')) {
    const [k, ...v] = parte.trim().split('=');
    if (k === nome) return v.join('=');
  }
  return null;
}

export const cookieSessione = (valore, secondi) =>
  `${NOME_COOKIE}=${valore}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${secondi}`;

export async function creaSessione(db, utenteId) {
  const token = tokenSicuro(32);
  await esegui(db, 'INSERT INTO sessioni (token_hash, utente_id, scade_il) VALUES (:h, :u, :s)', {
    h: await sha256(token), u: utenteId, s: new Date(Date.now() + DURATA_SESSIONE_ORE * 3600000).toISOString(),
  });
  await esegui(db, 'DELETE FROM sessioni WHERE scade_il < :ora', { ora: new Date().toISOString() });
  return { token, secondi: DURATA_SESSIONE_ORE * 3600 };
}

export async function chiudiSessione(db, request) {
  const token = leggiCookie(request, NOME_COOKIE);
  if (token) await esegui(db, 'DELETE FROM sessioni WHERE token_hash = :h', { h: await sha256(token) });
}

// Utente collegato (o null).
export async function utenteCollegato(db, request) {
  const token = leggiCookie(request, NOME_COOKIE);
  if (!token || token.length > 100) return null;
  return prima(db, `SELECT u.id, u.ruolo, u.nome, u.email, u.partner_id, u.deve_cambiare,
                           pa.nome AS partner_nome, pa.codice AS partner_codice, pa.provvigione_pct, pa.attivo AS partner_attivo
                    FROM sessioni s JOIN utenti u ON u.id = s.utente_id
                    LEFT JOIN partner pa ON pa.id = u.partner_id
                    WHERE s.token_hash = :h AND s.scade_il > :ora AND u.attivo = 1`, {
    h: await sha256(token), ora: new Date().toISOString(),
  });
}

export async function richiedi(db, request, ruolo) {
  const utente = await utenteCollegato(db, request);
  if (!utente) throw new Errore(401, 'Accesso scaduto: entra di nuovo.');
  const ammessi = Array.isArray(ruolo) ? ruolo : ruolo ? [ruolo] : null;
  if (ammessi && !ammessi.includes(utente.ruolo)) throw new Errore(403, 'Non hai accesso a questa sezione.');
  if (utente.ruolo === 'partner' && !utente.partner_attivo) throw new Errore(403, 'Questo account non è attivo.');
  return utente;
}

// Limite ai tentativi: 5 errori per email o 20 per indirizzo in 15 minuti.
export async function controllaTentativi(db, request, emailInserita) {
  const ip = await sha256(`ip|${indirizzoIp(request)}`);
  const da = new Date(Date.now() - 15 * 60000).toISOString();
  // I tentativi sbagliati si tengono al massimo 24 ore (lo dice l'informativa privacy).
  await esegui(db, 'DELETE FROM tentativi_accesso WHERE quando < :vecchio', { vecchio: new Date(Date.now() - 86400000).toISOString() });
  const r = await prima(db, `SELECT
      SUM(CASE WHEN chiave = :e THEN 1 ELSE 0 END) AS per_email,
      SUM(CASE WHEN chiave = :i THEN 1 ELSE 0 END) AS per_ip
    FROM tentativi_accesso WHERE quando > :da AND chiave IN (:e, :i)`, { e: `email|${emailInserita}`, i: ip, da });
  if ((r?.per_email ?? 0) >= 5 || (r?.per_ip ?? 0) >= 20) throw new Errore(429, 'Troppi tentativi: riprova tra 15 minuti.');
  return {
    sbagliato: async () => {
      const ora = new Date().toISOString();
      await esegui(db, 'INSERT INTO tentativi_accesso (chiave, quando) VALUES (:e, :q), (:i, :q)', { e: `email|${emailInserita}`, i: ip, q: ora });
    },
    riuscito: () => esegui(db, 'DELETE FROM tentativi_accesso WHERE chiave = :e', { e: `email|${emailInserita}` }),
  };
}

export { ugualeSicuro };
