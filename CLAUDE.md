# Istruzioni per Claude — sito Escursioni Maddalena

Leggi questo file all'inizio di ogni sessione. Il README spiega dove stanno i contenuti; qui ci sono contesto, regole e cose da fare.

## Il progetto

- **Cliente:** Escursioni Maddalena, escursioni in maxi gommone nell'Arcipelago di La Maddalena (Sardegna), con imbarco a Palau e a La Maddalena.
- **Chi lavora sul sito:** Remo (web designer/consulente, non programmatore). Parla italiano: rispondi in italiano, in modo semplice, senza gergo tecnico se non serve.
- **Obiettivo del sito:** trasformare le visite in prenotazioni online pagate (escursione, data, orario, persone, imbarco). WhatsApp resta per domande, ultimo minuto e gruppi oltre 12 persone. Le altre piattaforme (GetYourGuide, Viator, Click&Boat…) NON sono collegate al sito: una persona dedicata inserisce a mano le loro prenotazioni nella gestione.
- **Flotta:** 2 gommoni di gruppo (12 posti, uscita confermata con almeno 6 paganti) e 1 gommone solo per le esclusive (6 posti). Stagione 2027: 1 maggio – 31 ottobre.
- **Strutture partner:** hotel e B&B prenotano dalla loro area (/partner/) o danno ai clienti il loro link (/prenota/?p=CODICE). Provvigione 15% sul lordo, pagata dall'ufficio ogni 15 giorni (1–15 e 16–fine mese, in base alla data dell'escursione).
- **Pubblico:** famiglie, gruppi di amici, turisti alla prima volta in Sardegna, spesso dal telefono e già in vacanza.
- **Lingue:** italiano ora; poi inglese, quindi tedesco e francese.

## Come si pubblica

- Codice su GitHub: `remoscano/escursioni-maddalena`, ramo `main`.
- Cloudflare Pages pubblica da solo ogni push su `main` (preset Astro, `npm run build`, cartella `dist`, `NODE_VERSION=22`). Anteprima: https://escursioni-maddalena.pages.dev/
- Prima di ogni push: `npm run build` deve andare a buon fine. Per modifiche visibili, controlla le pagine toccate a 1440 px e a 390 px di larghezza (non deve esserci scorrimento orizzontale).
- Commit con messaggi in italiano, brevi, che dicano cosa cambia per il visitatore.
- Push diretto su `main` va bene per modifiche richieste da Remo; per cambi grossi o rischiosi (struttura, lingue, dipendenze) chiedi prima o usa un ramo e fai vedere l'anteprima.
- Il sistema di prenotazione vive sul ramo `prenotazioni` finché Remo non dà l'ok: anteprima https://prenotazioni.escursioni-maddalena.pages.dev/ (pagamento simulato, database di prova).
- `wrangler.toml` decide i collegamenti di Cloudflare: database D1 `escursioni-prenotazioni` (sito pubblicato) ed `escursioni-prenotazioni-prova` (anteprime). Le chiavi di pagamento e email stanno solo nelle variabili segrete di Cloudflare Pages, mai nel codice.
- Modifiche alla struttura del database: nuovo file in `migrations/` (0002_…sql), da applicare a entrambi i database.

## Tecnica

- Astro statico + funzioni di Cloudflare Pages in `functions/` (le API delle prenotazioni, su `/api/...`) + database D1. Nessun framework JS lato client: JavaScript solo per menu, modulo WhatsApp, prenotazione, area strutture e gestione.
- Prenotazioni:
  - `src/data/prenotazioni.js`: gommoni, turni con orari, listini per periodo, regole (chiusura online alle 20 del giorno prima, 48 ore di cancellazione gratuita, 15% alle strutture, fasce d'età). È l'unica fonte dei prezzi: la usano sito e server, e il server ricalcola sempre il totale.
  - `functions/_lib/motore.js`: posti liberi e scelta del gommone. Ogni turno occupa blocchi della giornata (mattina, pomeriggio, sera); l'inserimento controlla i posti nella stessa istruzione SQL, così due clienti non prendono lo stesso posto. Durante il pagamento i posti restano tenuti per 30 minuti.
  - `functions/_lib/pagamenti.js`: SumUp (pagina di pagamento ospitata) e PayPal (ordini v2), sempre con reindirizzamento e verifica dal server: sul sito non si carica nessuno script di terze parti. `PAGAMENTI_PROVA=1` (solo anteprime) aggiunge un pagamento simulato.
  - `functions/_lib/accessi.js`: accessi per gestione e strutture (password PBKDF2, sessione in cookie tecnico `em_sessione`, blocco dopo 5 tentativi).
  - Pagine: `/prenota/` (+ `esito/`, `prova/`), `/partner/`, `/gestione/`, `/condizioni/`.
  - Prove automatiche in `prove/` (vedi `prove/LEGGIMI.md`): prima di ogni push che tocca le prenotazioni devono passare tutte.
- I contenuti stanno in `src/data/` (`sito.js`, `escursioni.js`, `faq.js`, `menu.js`). Prima di scrivere testo dentro una pagina, chiediti se va in un file dati.
- Le 4 pagine escursione nascono tutte da `src/pages/escursioni/[slug].astro`: una nuova escursione si aggiunge in `escursioni.js`, non con un file nuovo.
- Componenti riutilizzabili in `src/components/`. In particolare:
  - `Dato.astro`: mostra il valore o, se vuoto, un segnaposto rosa `[etichetta]`. Usalo per ogni dato non ancora fornito dal cliente.
  - `Foto.astro`: foto vera (con `src` importato da `src/assets/foto/`, ottimizzata da Astro) o segnaposto che dice quale scatto serve.
  - `ModuloRichiesta.astro`: compone il messaggio e apre `https://wa.me/<numero>?text=…`. Accetta `?escursione=<slug>` nell'URL della pagina `/richiesta/`.
- Stili in `src/styles/global.css` con le variabili CSS in cima. Non introdurre Tailwind o altre librerie CSS.

## Identità visiva ("Solare e turchese")

- Colori: Sabbia `#FBF8F2` (sfondo), Sabbia calda `#F3EADB` (sezioni alternate), Mare profondo `#0A3A51` (testi, fondi scuri), Laguna `#2BB7C2` (bottoni WhatsApp, con testo blu scuro), Turchese scuro `#0A7380` (link, occhielli), Acqua chiara `#DDF3F4` (etichette, riquadri), Rosa granito `#EC9A86` (Spiaggia Rosa, dettagli).
- Caratteri: Bricolage Grotesque (titoli, peso 800) e Figtree (testi). Sono ospitati sul sito tramite `@fontsource-variable`: non usare Google Fonts.
- Un solo bottone turchese per sezione: "Prenota" dove la prenotazione online è attiva (`regole.attive` in `src/data/prenotazioni.js`), altrimenti la richiesta WhatsApp.
- Icone a tratto da 24 px in `Icona.astro`; mai emoji.
- Marchio: sole e due onde che disegnano la M (in `Logo.astro`). È una proposta: se il cliente fornisce un logo, va sostituito.
- Accessibilità: contrasto almeno 4.5:1, bersagli tattili almeno 44 px, veri `<button>`/`<a>`/`<label>`, testo alternativo sulle foto.

## Regole sui contenuti

- **Mai inventare dati:** prezzi, orari, numeri, nomi, capienza, regole. Se mancano, usa `Dato` con un segnaposto chiaro.
- **Mai recensioni inventate.** Solo recensioni vere copiate da Google o TripAdvisor, con nome e data come pubblicati.
- Fatti da rispettare: alla Spiaggia Rosa di Budelli niente sbarco né bagno (si vede dal mare); il pranzo del Tour delle 7 isole è libero a La Maddalena e non incluso; per la Corsica serve un documento valido per l'espatrio.
- Tono: diretto, caldo, concreto. Frasi brevi, seconda persona singolare ("scrivici", "scegli").
- Niente servizi esterni che caricano cookie o tracciano (YouTube, Google Maps incorporata, Google Fonts, pixel pubblicitari). Se servono statistiche, Cloudflare Web Analytics. Ogni nuovo servizio va riportato nella pagina `/cookie/` e in `/privacy/`.
- Alle strutture partner non si mostra il nome dell'ospite che ha prenotato dal loro link (solo data, escursione, persone, importo).
- Condizioni di prenotazione, privacy e cookie sono bozze da far verificare.
- Privacy e cookie sono bozze: segnalare a Remo che vanno fatte verificare, non presentarle come definitive.
- Niente video: la home usa una foto di apertura (scelta di Remo).

## Stato e prossimi passi

Aggiorna questa sezione quando qualcosa viene completato.

- [x] Prima versione in italiano online su pages.dev
- [x] WhatsApp (+39 331 505 5736) ed email (maddalena.escursioni@gmail.com) nel sito
- [x] Sistema di prenotazione interno con area strutture e gestione: ramo `prenotazioni`, anteprima con pagamento simulato (8 novembre 2026)
- [ ] Decisioni aperte su prezzi e orari: prezzo e orari della Corsica (ora 104 € / 78 € ridotto, privato 805 €: proposta dall'analisi dei concorrenti), prezzo del tramonto (ora 46 € / 35 €, privato 380 €), se "gommone in esclusiva" vale anche per i gommoni da 12 (in `offerte['tour-privato'].gommoni`)
- [ ] Conti SumUp e PayPal → chiavi in Cloudflare Pages (Production): `SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE`, `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`. Provare prima PayPal in sandbox (`PAYPAL_AMBIENTE=sandbox` nelle anteprime)
- [ ] Email di conferma: servono dominio e un servizio di invio (predisposto Resend: `RESEND_API_KEY`, `EMAIL_MITTENTE`)
- [ ] Unire `prenotazioni` in `main` quando Remo dà l'ok (se i pagamenti non sono ancora attivi: `regole.attive: false`)
- [ ] Dati del cliente rimasti: ragione sociale, P. IVA, indirizzo, moli e orari di ritrovo, gommoni (modello, motori), skipper, ticket del Parco, animali
- [ ] Foto (le note sui segnaposto indicano gli scatti)
- [ ] Dominio: acquistato su GoDaddy, da spostare su Cloudflare (DNS) e collegare in Pages → Custom domains. Poi aggiornare `site` in `astro.config.mjs` e `url` in `src/data/sito.js`, e far rimandare `www` alla versione senza `www`
- [ ] Testi delle escursioni Corsica, Tramonto e Tour privato (programma ancora a segnaposto)
- [ ] Revisione di condizioni, privacy e cookie da parte di chi segue il cliente
- [ ] Lancio: `inCostruzione: false` in `src/data/sito.js`, `public/robots.txt` aperto (con le esclusioni già scritte nel commento), sitemap, dati strutturati (LocalBusiness e TouristTrip)
- [ ] Inglese (`/en/`) con hreflang, poi tedesco e francese
