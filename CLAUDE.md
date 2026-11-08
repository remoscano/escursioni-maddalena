# Istruzioni per Claude — sito Escursioni Maddalena

Leggi questo file all'inizio di ogni sessione. Il README spiega dove stanno i contenuti; qui ci sono contesto, regole e cose da fare.

## Il progetto

- **Cliente:** Escursioni Maddalena, escursioni in maxi gommone nell'Arcipelago di La Maddalena (Sardegna), con imbarco a Palau e a La Maddalena.
- **Chi lavora sul sito:** Remo (web designer/consulente, non programmatore). Parla italiano: rispondi in italiano, in modo semplice, senza gergo tecnico se non serve.
- **Obiettivo del sito:** trasformare le visite in richieste WhatsApp complete (escursione, data, persone, imbarco). Niente prenotazione né pagamento online.
- **Pubblico:** famiglie, gruppi di amici, turisti alla prima volta in Sardegna, spesso dal telefono e già in vacanza.
- **Lingue:** italiano ora; poi inglese, quindi tedesco e francese.

## Come si pubblica

- Codice su GitHub: `remoscano/escursioni-maddalena`, ramo `main`.
- Cloudflare Pages pubblica da solo ogni push su `main` (preset Astro, `npm run build`, cartella `dist`, `NODE_VERSION=22`). Anteprima: https://escursioni-maddalena.pages.dev/
- Prima di ogni push: `npm run build` deve andare a buon fine. Per modifiche visibili, controlla le pagine toccate a 1440 px e a 390 px di larghezza (non deve esserci scorrimento orizzontale).
- Commit con messaggi in italiano, brevi, che dicano cosa cambia per il visitatore.
- Push diretto su `main` va bene per modifiche richieste da Remo; per cambi grossi o rischiosi (struttura, lingue, dipendenze) chiedi prima o usa un ramo e fai vedere l'anteprima.

## Tecnica

- Astro statico, nessun framework JS lato client. Il JavaScript serve solo per il menu su telefono e per il modulo WhatsApp.
- I contenuti stanno in `src/data/` (`sito.js`, `gommoni.js`, `escursioni.js`, `faq.js`, `menu.js`). Prima di scrivere testo dentro una pagina, chiediti se va in un file dati.
- Le pagine escursione nascono tutte da `src/pages/escursioni/[slug].astro`, le pagine gommone da `src/pages/gommoni/[slug].astro`: una nuova escursione o un nuovo gommone si aggiungono nei file dati, non con un file nuovo.
- **Tre gommoni:** (1) Tour delle 7 isole, 6–12 persone, posto singolo o esclusiva; (2) mezze giornate (due rotte, gialla e rossa), 6–12 persone, posto singolo o esclusiva, in esclusiva anche giornata intera; entrambi fanno l'aperitivo al tramonto; (3) solo esclusiva, max 6 persone. In esclusiva tutti e tre fanno tutte le proposte, Corsica compresa. Corsica e Tour privato sono solo in esclusiva.
- Componenti riutilizzabili in `src/components/`. In particolare:
  - `Dato.astro`: mostra il valore o, se vuoto, un segnaposto rosa `[etichetta]`. Usalo per ogni dato non ancora fornito dal cliente.
  - `Foto.astro`: foto vera (con `src` importato da `src/assets/foto/`, ottimizzata da Astro) o segnaposto che dice quale scatto serve.
  - `ModuloRichiesta.astro`: compone il messaggio e apre `https://wa.me/<numero>?text=…`. Accetta `?escursione=<slug>` nell'URL della pagina `/richiesta/`.
- Stili in `src/styles/global.css` con le variabili CSS in cima. Non introdurre Tailwind o altre librerie CSS.

## Identità visiva ("Solare e turchese")

- Colori: Sabbia `#FBF8F2` (sfondo), Sabbia calda `#F3EADB` (sezioni alternate), Mare profondo `#0A3A51` (testi, fondi scuri), Laguna `#2BB7C2` (bottoni WhatsApp, con testo blu scuro), Turchese scuro `#0A7380` (link, occhielli), Acqua chiara `#DDF3F4` (etichette, riquadri), Rosa granito `#EC9A86` (Spiaggia Rosa, dettagli).
- Caratteri: Bricolage Grotesque (titoli, peso 800) e Figtree (testi). Sono ospitati sul sito tramite `@fontsource-variable`: non usare Google Fonts.
- Un solo bottone turchese per sezione, ed è sempre la richiesta WhatsApp.
- Icone a tratto da 24 px in `Icona.astro`; mai emoji.
- Marchio: sole e due onde che disegnano la M (in `Logo.astro`). È una proposta: se il cliente fornisce un logo, va sostituito.
- Accessibilità: contrasto almeno 4.5:1, bersagli tattili almeno 44 px, veri `<button>`/`<a>`/`<label>`, testo alternativo sulle foto.

## Regole sui contenuti

- **Mai inventare dati:** prezzi, orari, numeri, nomi, capienza, regole. Se mancano, usa `Dato` con un segnaposto chiaro.
- **Mai recensioni inventate.** Solo recensioni vere copiate da Google o TripAdvisor, con nome e data come pubblicati.
- Fatti da rispettare: alla Spiaggia Rosa di Budelli niente sbarco né bagno (si vede dal mare); il pranzo del Tour delle 7 isole è libero a La Maddalena e non incluso; per la Corsica serve un documento valido per l'espatrio.
- Tono: diretto, caldo, concreto. Frasi brevi, seconda persona singolare ("scrivici", "scegli").
- Niente servizi esterni che caricano cookie o tracciano (YouTube, Google Maps incorporata, Google Fonts, pixel pubblicitari). Se servono statistiche, Cloudflare Web Analytics. Ogni nuovo servizio va riportato nella pagina `/cookie/`.
- Privacy e cookie sono bozze: segnalare a Remo che vanno fatte verificare, non presentarle come definitive.
- Niente video: la home usa una foto di apertura (scelta di Remo).

## Stato e prossimi passi

Aggiorna questa sezione quando qualcosa viene completato.

- [x] Prima versione in italiano online su pages.dev
- [ ] Dati del cliente nei file di `src/data/` (numero WhatsApp, prezzi, orari, moli, regole, gommone, skipper, P. IVA)
- [ ] Foto (le note sui segnaposto indicano gli scatti)
- [ ] Dominio: acquistato su GoDaddy, da spostare su Cloudflare (DNS) e collegare in Pages → Custom domains. Poi aggiornare `site` in `astro.config.mjs` e `url` in `src/data/sito.js`, e far rimandare `www` alla versione senza `www`
- [x] Struttura a 3 gommoni: pagine `/gommoni/`, escursioni Mezza giornata e Aperitivo al tramonto separate, scelta posto singolo/esclusiva nel modulo
- [x] Mappa delle due rotte della mezza giornata (`MappaRotte.astro`): rossa = giro di Caprera (Cala Coticcio, Cala Napoletana, Giardinelli); gialla = con maestrale oltre 15 nodi (Cala Corsara a Spargi, Cala Gavetta a La Maddalena, Giardinelli). Partenza da La Maddalena, su richiesta presa a Palau o Cannigione
- [ ] Da chiarire con Remo: la partenza principale da La Maddalena vale anche per le altre escursioni? (oggi le altre dicono Palau, poi La Maddalena)
- [ ] Nomi/modelli dei 3 gommoni e loro skipper in `gommoni.js`
- [ ] Testi delle escursioni Aperitivo al tramonto, Corsica e Tour privato (programma ancora a segnaposto)
- [ ] Revisione di privacy e cookie da parte di chi segue il cliente
- [ ] Lancio: `inCostruzione: false` in `src/data/sito.js`, `public/robots.txt` aperto, sitemap, dati strutturati (LocalBusiness e TouristTrip)
- [ ] Inglese (`/en/`) con hreflang, poi tedesco e francese
