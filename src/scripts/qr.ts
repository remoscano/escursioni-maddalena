// Codici QR (biglietto del cliente, volantini): disegnati nel browser, senza servizi esterni.
import qrcode from 'qrcode-generator';

function moduli(testo: string) {
  const qr = qrcode(0, 'M');
  qr.addData(testo);
  qr.make();
  const n = qr.getModuleCount();
  return { n, scuro: (r: number, c: number) => qr.isDark(r, c) };
}

// SVG nitido a qualsiasi dimensione, con il margine bianco che serve ai lettori.
export function svgQr(testo: string, etichetta = 'Codice QR') {
  const { n, scuro } = moduli(testo);
  const m = 4;
  let percorso = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (scuro(r, c)) percorso += `M${c + m} ${r + m}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 2 * m} ${n + 2 * m}" role="img" aria-label="${etichetta.replace(/"/g, '&quot;')}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${percorso}" fill="#000"/></svg>`;
}

// Immagine PNG da scaricare (per volantini e locandine), con una scritta sotto se serve.
export function pngQr(testo: string, lato = 1200, scritta = '') {
  const { n, scuro } = moduli(testo);
  const m = 4;
  const passo = Math.floor(lato / (n + 2 * m));
  const quadro = passo * (n + 2 * m);
  const canvas = document.createElement('canvas');
  const altezzaScritta = scritta ? Math.round(passo * 6) : 0;
  canvas.width = quadro;
  canvas.height = quadro + altezzaScritta;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#fff';
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.fillStyle = '#000';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (scuro(r, c)) g.fillRect((c + m) * passo, (r + m) * passo, passo, passo);
  if (scritta) {
    g.fillStyle = '#282828';
    g.font = `700 ${Math.round(passo * 2.6)}px system-ui, sans-serif`;
    g.textAlign = 'center';
    g.fillText(scritta, quadro / 2, quadro + altezzaScritta * 0.45, quadro - passo * 4);
  }
  return canvas.toDataURL('image/png');
}
