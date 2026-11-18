// @ts-check
import { defineConfig } from 'astro/config';
import { rename, rm } from 'node:fs/promises';

// Pagine 404 tradotte: Cloudflare Pages mostra il 404.html più vicino all'indirizzo chiesto,
// quindi /en/404/index.html diventa /en/404.html (per /en/... la pagina "not found" è in inglese), e così per le altre lingue.
const lingue404 = ['en', 'es', 'fr', 'de'];
const pagine404 = {
  name: 'pagine-404',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      for (const lingua of lingue404) {
        const cartella = new URL(`${lingua}/`, dir);
        await rename(new URL('404/index.html', cartella), new URL('404.html', cartella));
        await rm(new URL('404/', cartella), { recursive: true });
      }
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
