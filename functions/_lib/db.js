// Piccolo aiuto per il database D1: permette di scrivere i parametri per nome (:data, :barca, ...).

export function istruzione(db, sql, parametri = {}) {
  const nomi = [];
  const testo = sql.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, n) => {
    let i = nomi.indexOf(n);
    if (i < 0) { nomi.push(n); i = nomi.length - 1; }
    return `?${i + 1}`;
  });
  const valori = nomi.map((n) => {
    if (!(n in parametri)) throw new Error(`Parametro SQL mancante: ${n}`);
    const v = parametri[n];
    if (v === undefined) return null;
    if (typeof v === 'boolean') return v ? 1 : 0;
    return v;
  });
  return db.prepare(testo).bind(...valori);
}

export const tutte = async (db, sql, p) => (await istruzione(db, sql, p).all()).results ?? [];
export const prima = (db, sql, p) => istruzione(db, sql, p).first();
export const esegui = (db, sql, p) => istruzione(db, sql, p).run();

export async function registra(db, chi, azione, dettagli) {
  try {
    await esegui(db, 'INSERT INTO registro (chi, azione, dettagli) VALUES (:chi, :azione, :dettagli)', {
      chi, azione, dettagli: dettagli ? JSON.stringify(dettagli).slice(0, 2000) : null,
    });
  } catch (e) {
    console.error('Registro non scritto', e);
  }
}
