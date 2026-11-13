// Programma "automatico": ogni ora chiama il sito, che manda promemoria, ringraziamenti,
// avvisi di maltempo e lista d'attesa (vedi functions/api/automatico.js).
// Variabili: SITO (es. https://escursioni-maddalena.pages.dev) e la chiave segreta AUTOMATICO_CHIAVE,
// uguale a quella messa in Cloudflare Pages.

export default {
  async scheduled(evento, env, contesto) {
    contesto.waitUntil(chiama(env));
  },
  // Aprendo l'indirizzo del Worker nel browser si vede solo questo: niente dati.
  async fetch() {
    return new Response('Programma automatico di Escursioni Maddalena: parte da solo ogni ora.', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  },
};

async function chiama(env) {
  const r = await fetch(`${env.SITO.replace(/\/$/, '')}/api/automatico`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.AUTOMATICO_CHIAVE}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  const testo = await r.text();
  if (!r.ok) throw new Error(`Lavori automatici non riusciti (${r.status}): ${testo.slice(0, 300)}`);
  console.log('Lavori automatici', testo);
}
