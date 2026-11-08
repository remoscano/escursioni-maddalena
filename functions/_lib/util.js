// Funzioni di servizio comuni a tutte le API.

export class Errore extends Error {
  constructor(stato, messaggio, extra = {}) {
    super(messaggio);
    this.stato = stato;
    this.extra = extra;
  }
}

export function json(dati, stato = 200, intestazioni = {}) {
  return new Response(JSON.stringify(dati), {
    status: stato,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...intestazioni },
  });
}

export function rispostaErrore(e) {
  if (e instanceof Response) return e;
  if (e instanceof Errore) return json({ errore: e.message, ...e.extra }, e.stato);
  console.error(e?.stack || e);
  return json({ errore: 'Qualcosa non ha funzionato. Riprova tra poco o scrivici su WhatsApp.' }, 500);
}

export async function leggiJson(request, massimo = 20000) {
  const tipo = request.headers.get('Content-Type') || '';
  if (!tipo.includes('application/json')) throw new Errore(415, 'Formato della richiesta non valido.');
  const testo = await request.text();
  if (testo.length > massimo) throw new Errore(413, 'Richiesta troppo grande.');
  try {
    const dati = JSON.parse(testo);
    if (!dati || typeof dati !== 'object' || Array.isArray(dati)) throw new Error();
    return dati;
  } catch {
    throw new Errore(400, 'Dati non leggibili.');
  }
}

// Le richieste che cambiano qualcosa devono arrivare dalle pagine del sito (protezione CSRF).
export function controllaOrigine(request) {
  const origine = request.headers.get('Origin');
  const host = new URL(request.url).host;
  if (!origine) throw new Errore(403, 'Richiesta non consentita.');
  let o;
  try { o = new URL(origine); } catch { throw new Errore(403, 'Richiesta non consentita.'); }
  if (o.host !== host) throw new Errore(403, 'Richiesta non consentita.');
}

// ---------- Date e ore (fuso di Roma) ----------

export function oraRoma(d = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(d).map((x) => [x.type, x.value]),
  );
  return { data: `${p.year}-${p.month}-${p.day}`, ora: `${p.hour}:${p.minute}` };
}

export function aggiungiGiorni(data, n) {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const dataValida = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T12:00:00Z`)) && new Date(`${s}T12:00:00Z`).toISOString().slice(0, 10) === s;

export const adessoISO = () => new Date().toISOString();
export const traMinutiISO = (m) => new Date(Date.now() + m * 60000).toISOString();

const formatoData = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const dataLeggibile = (s) => formatoData.format(new Date(`${s}T12:00:00Z`));

// ---------- Controllo dei dati inseriti ----------

export function testo(v, { campo, massimo = 200, obbligatorio = false } = {}) {
  const s = typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '';
  if (obbligatorio && !s) throw new Errore(400, `Manca: ${campo}.`);
  if (s.length > massimo) throw new Errore(400, `Troppo lungo: ${campo}.`);
  return s;
}

export function testoLungo(v, massimo = 1000) {
  const s = typeof v === 'string' ? v.trim() : '';
  if (s.length > massimo) throw new Errore(400, 'Le note sono troppo lunghe.');
  return s;
}

export function intero(v, { campo, min = 0, max = 99 } = {}) {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  if (!Number.isInteger(n) || n < min || n > max) throw new Errore(400, `Valore non valido: ${campo}.`);
  return n;
}

export function email(v, obbligatoria = true) {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : '';
  if (!s && !obbligatoria) return '';
  if (s.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) throw new Errore(400, 'Indirizzo email non valido.');
  return s;
}

export function telefono(v, obbligatorio = true) {
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s && !obbligatorio) return '';
  const cifre = s.replace(/[^\d]/g, '');
  if (!/^[+\d][\d\s().-]*$/.test(s) || cifre.length < 6 || cifre.length > 16) throw new Errore(400, 'Numero di telefono non valido.');
  return s;
}

// ---------- Codici e impronte ----------

const ALFABETO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function codiceCasuale(lunghezza = 6) {
  const b = crypto.getRandomValues(new Uint8Array(lunghezza));
  return Array.from(b, (x) => ALFABETO[x % ALFABETO.length]).join('');
}

export const codicePrenotazione = () => `EM-${codiceCasuale(6)}`;

export function base64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export const tokenSicuro = (n = 24) => base64url(crypto.getRandomValues(new Uint8Array(n)));

export async function sha256(testo) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(testo));
  return Array.from(new Uint8Array(h), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function ugualeSicuro(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const indirizzoIp = (request) => request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0].trim() || 'locale';

export const euroDaCent = (c) => (Math.round(c) / 100).toLocaleString('it-IT', { minimumFractionDigits: c % 100 ? 2 : 0, maximumFractionDigits: 2 });
