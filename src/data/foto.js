// Foto vere del sito, in src/assets/foto/<cartella>/<nome>.jpg (25 novembre 2026).
// Valgono per tutte le lingue: cambia solo il testo alternativo, che sta nei file dati di ogni lingua.
// Per cambiare una foto basta sostituire il file con lo stesso nome; se un file manca, torna il segnaposto.
const tutte = import.meta.glob('../assets/foto/**/*.jpg', { eager: true, import: 'default' });

/** Foto da "cartella/nome" (es. 'home/apertura'), oppure undefined se non c'è. */
export const foto = (percorso) => tutte[`../assets/foto/${percorso}.jpg`];

// Cartella delle foto di ogni escursione (slug interno → cartella)
const cartellaEscursione = {
  'tour-7-isole': '7-isole',
  'mezza-giornata': 'mezza-giornata',
  tramonto: 'tramonto',
  'tour-privato': 'tour-privato',
  corsica: 'corsica',
};

/** Copertina dell'escursione (schede in home e nel catalogo). */
export const fotoCopertina = (slug) => foto(`${cartellaEscursione[slug]}/copertina`);

/** Foto della galleria dell'escursione: i = 0 è la grande. */
export const fotoGalleria = (slug, i) => foto(`${cartellaEscursione[slug]}/galleria-${i + 1}`);

// Piatti dei ristoranti convenzionati (Tour delle 7 isole), nello stesso ordine di pranzo.foto in escursioni.js
const piatti = ['piatto-pesce', 'primo-sardo', 'antipasto-terra', 'tavola'];
export const fotoPiatto = (i) => foto(`pranzo/${piatti[i]}`);

// Gommoni: id di sito.flotta → file
const barche = {
  'gruppo-1': 'joker-clubman-28',
  'gruppo-2': 'bwa-30',
  esclusiva: 'joker-35',
  cannigione: 'honda-950',
};
export const fotoBarca = (id) => foto(`gommoni/${barche[id]}`);

/** Foto di bordo della pagina gommoni: i = 0 è la grande. */
export const fotoBordo = (i) => foto(`gommoni/bordo-${i + 1}`);
