// File Excel (.xlsx) costruito nel browser, senza librerie: un archivio ZIP con dentro i fogli in XML.
// Basta per tabelle con testo e numeri (report per il commercialista).

type Cella = string | number | null | undefined;
export interface Foglio { nome: string; righe: Cella[][]; larghezze?: number[] }

const testo = (s: string) => new TextEncoder().encode(s);
const xml = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!)).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

let tabellaCrc: Uint32Array | null = null;
function crc32(dati: Uint8Array) {
  if (!tabellaCrc) {
    tabellaCrc = new Uint32Array(256);
    for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; tabellaCrc[i] = c >>> 0; }
  }
  let c = 0xFFFFFFFF;
  for (const b of dati) c = tabellaCrc[(c ^ b) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// ZIP senza compressione ("stored"): Excel lo apre senza problemi.
function zip(file: { nome: string; dati: Uint8Array }[]) {
  const parti: Uint8Array[] = [];
  const centrale: Uint8Array[] = [];
  let posizione = 0;
  for (const f of file) {
    const nome = testo(f.nome);
    const crc = crc32(f.dati);
    const locale = new DataView(new ArrayBuffer(30));
    locale.setUint32(0, 0x04034b50, true); locale.setUint16(4, 20, true); locale.setUint16(6, 0x0800, true);
    locale.setUint32(14, crc, true); locale.setUint32(18, f.dati.length, true); locale.setUint32(22, f.dati.length, true);
    locale.setUint16(26, nome.length, true);
    parti.push(new Uint8Array(locale.buffer), nome, f.dati);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
    c.setUint32(16, crc, true); c.setUint32(20, f.dati.length, true); c.setUint32(24, f.dati.length, true);
    c.setUint16(28, nome.length, true); c.setUint32(42, posizione, true);
    centrale.push(new Uint8Array(c.buffer), nome);
    posizione += 30 + nome.length + f.dati.length;
  }
  const lunghezzaCentrale = centrale.reduce((s, x) => s + x.length, 0);
  const fine = new DataView(new ArrayBuffer(22));
  fine.setUint32(0, 0x06054b50, true); fine.setUint16(8, file.length, true); fine.setUint16(10, file.length, true);
  fine.setUint32(12, lunghezzaCentrale, true); fine.setUint32(16, posizione, true);
  return new Blob([...parti, ...centrale, new Uint8Array(fine.buffer)] as BlobPart[], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

const colonna = (i: number) => { let s = ''; i++; while (i > 0) { const r = (i - 1) % 26; s = String.fromCharCode(65 + r) + s; i = Math.floor((i - 1) / 26); } return s; };

function foglioXml(f: Foglio) {
  const righe = f.righe.map((riga, r) => `<row r="${r + 1}">${riga.map((v, c) => {
    const ref = `${colonna(c)}${r + 1}`;
    const stile = r === 0 ? ' s="1"' : typeof v === 'number' && !Number.isInteger(v) ? ' s="2"' : '';
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}"${stile}><v>${v}</v></c>`;
    return `<c r="${ref}" t="inlineStr"${stile}><is><t xml:space="preserve">${xml(v)}</t></is></c>`;
  }).join('')}</row>`).join('');
  const larghezze = (f.larghezze || f.righe[0]?.map((_, c) => Math.min(50, Math.max(10, ...f.righe.map((r) => String(r[c] ?? '').length + 2)))) || [])
    .map((l, i) => `<col min="${i + 1}" max="${i + 1}" width="${l}" customWidth="1"/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>${larghezze ? `<cols>${larghezze}</cols>` : ''}<sheetData>${righe}</sheetData></worksheet>`;
}

export function creaXlsx(fogli: Foglio[]) {
  const nomi = fogli.map((f, i) => xml(f.nome.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || `Foglio ${i + 1}`));
  const file = [
    { nome: '[Content_Types].xml', dati: testo(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${fogli.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`) },
    { nome: '_rels/.rels', dati: testo('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>') },
    { nome: 'xl/workbook.xml', dati: testo(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${nomi.map((n, i) => `<sheet name="${n}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`) },
    { nome: 'xl/_rels/workbook.xml.rels', dati: testo(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${fogli.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${fogli.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`) },
    { nome: 'xl/styles.xml', dati: testo('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="4" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>') },
    ...fogli.map((f, i) => ({ nome: `xl/worksheets/sheet${i + 1}.xml`, dati: testo(foglioXml(f)) })),
  ];
  return zip(file);
}

export function scaricaXlsx(nome: string, fogli: Foglio[]) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(creaXlsx(fogli));
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
