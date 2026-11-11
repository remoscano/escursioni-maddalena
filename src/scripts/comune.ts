// Funzioni condivise dalle pagine con JavaScript (prenotazione, area strutture, gestione).

export class ErroreApi extends Error {
  constructor(public stato: number, messaggio: string) { super(messaggio); }
}

export async function api<T = any>(percorso: string, opzioni: { metodo?: string; corpo?: unknown } = {}): Promise<T> {
  const r = await fetch(percorso, {
    method: opzioni.metodo ?? (opzioni.corpo ? 'POST' : 'GET'),
    headers: opzioni.corpo ? { 'Content-Type': 'application/json' } : {},
    body: opzioni.corpo ? JSON.stringify(opzioni.corpo) : undefined,
    credentials: 'same-origin',
  });
  let dati: any = {};
  try { dati = await r.json(); } catch { /* risposta vuota */ }
  if (!r.ok) throw new ErroreApi(r.status, dati.errore || 'Qualcosa non ha funzionato. Riprova tra poco.');
  return dati as T;
}

const esc: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const h = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => esc[c]);

export const euro = (n: number) =>
  `${n.toLocaleString('it-IT', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })} €`;

const fData = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const fDataBreve = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
export const dataLunga = (s: string) => fData.format(new Date(`${s}T12:00:00Z`));
export const dataBreve = (s: string) => fDataBreve.format(new Date(`${s}T12:00:00Z`));

export function oggiRoma(): string {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date()).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

export function aggiungiGiorni(data: string, n: number) {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const segnaposto = (etichetta: string) => `<span class="dato">[${h(etichetta)}]</span>`;

// I "neonati" delle prenotazioni vecchie contano come bambini.
export function persone(a: number, b = 0, n = 0) {
  const bb = (Number(b) || 0) + (Number(n) || 0);
  return [
    a && `${a} ${a === 1 ? 'adulto' : 'adulti'}`,
    bb && `${bb} ${bb === 1 ? 'bambino' : 'bambini'}`,
  ].filter(Boolean).join(', ');
}
