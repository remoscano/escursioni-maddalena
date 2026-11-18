// @ts-check
import { defineConfig } from 'astro/config';
import { rename, rm } from 'node:fs/promises';

// Pagina 404 inglese: Cloudflare Pages mostra il 404.html più vicino all'indirizzo chiesto,
// quindi /en/404/index.html diventa /en/404.html (per /en/... la pagina "not found" è in inglese).
const pagine404 = {
  name: 'pagine-404',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const en = new URL('en/', dir);
      await rename(new URL('404/index.html', en), new URL('404.html', en));
      await rm(new URL('404/', en), { recursive: true });
    },
  },
};

export default defineConfig({
  // Indirizzo del sito: da aggiornare anche in src/data/sito.js quando si collega il dominio.
  site: 'https://escursioni-maddalena.pages.dev',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [pagine404],
});
