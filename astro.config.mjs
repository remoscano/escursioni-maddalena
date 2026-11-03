// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Indirizzo del sito: da aggiornare anche in src/data/sito.js quando si collega il dominio.
  site: 'https://escursioni-maddalena.pages.dev',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
