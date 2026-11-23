// Importi con il separatore delle migliaia, uguali su sito, server ed email (Remo, 22 novembre 2026: "1.200 €", non "1200 €").
// Non si usa toLocaleString: per l'italiano e lo spagnolo non separa i numeri di 4 cifre (dà "1200").
// it, es, de: 1.200 e 12,50 · en: 1,200 e 12.50 · fr: 1 200 (spazio fine che non va a capo) e 12,50
const separatori = { it: ['.', ','], es: ['.', ','], de: ['.', ','], en: [',', '.'], fr: ['\u202f', ','] };

export function cifra(n, lingua = 'it') {
  if (n === '' || n === null || n === undefined) return '';
  const v = Number(n);
  if (!Number.isFinite(v)) return String(n);
  const [migliaia, decimali] = separatori[lingua] ?? separatori.it;
  const a = Math.abs(v);
  const [intero, dec] = (Number.isInteger(Math.round(a * 100) / 100) ? String(Math.round(a)) : a.toFixed(2)).split('.');
  return `${v < 0 ? '-' : ''}${intero.replace(/\B(?=(\d{3})+(?!\d))/g, migliaia)}${dec ? decimali + dec : ''}`;
}
