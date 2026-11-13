// Service worker minimo: serve per installare l'area imbarco sul telefono come un'app.
// Non salva niente: le prenotazioni si leggono sempre dal server, così sono sempre aggiornate.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Senza connessione</title>'
    + '<body style="font-family:system-ui,sans-serif;padding:32px;color:#282828"><h1>Senza connessione</h1><p>Il telefono non è collegato a internet. Riprova appena c\'è campo.</p>'
    + '<p><button onclick="location.reload()" style="font-size:18px;padding:12px 20px;border-radius:12px;border:0;background:#2BA6DE">Riprova</button></p></body>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )));
});
