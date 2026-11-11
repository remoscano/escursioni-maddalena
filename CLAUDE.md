# Istruzioni per Claude — sito Escursioni Maddalena

Leggi questo file all'inizio di ogni sessione. Il README spiega dove stanno i contenuti; qui ci sono contesto, regole e cose da fare.

## Il progetto

- **Cliente:** Escursioni Maddalena, escursioni in maxi gommone nell'Arcipelago di La Maddalena (Sardegna), con imbarco a Palau, La Maddalena e Cannigione.
- **Chi lavora sul sito:** Remo (web designer/consulente, non programmatore). Parla italiano: rispondi in italiano, in modo semplice, senza gergo tecnico se non serve.
- **Obiettivo del sito:** trasformare le visite in prenotazioni online pagate (escursione, data, orario, persone, imbarco). WhatsApp resta per domande, ultimo minuto e gruppi oltre 12 persone. Le altre piattaforme (GetYourGuide, Viator, Click&Boat…) NON sono collegate al sito: una persona dedicata inserisce a mano le loro prenotazioni nella gestione.
- **Flotta:** 2 gommoni di gruppo, Joker Clubman 28 e BWA 30 (12 posti, uscita confermata con almeno 6 paganti), e il Joker 35 solo per le esclusive (6 posti). Modelli e motori in `sito.flotta`. Quarto gommone: Honda 9.50 (12 posti), solo per chi parte da Cannigione (Pontile La Sciumara, Via Lungomare A. Doria 7): mezze giornate, tramonto ed esclusive, stessi orari e prezzi; niente Tour delle 7 isole né Corsica da Cannigione. Ogni gommone ha i suoi imbarchi (`imbarchi` in `gommoni`), ogni offerta i suoi (`imbarchi` in `offerte`): il calendario dei posti dipende dall'imbarco scelto, che nella prenotazione viene prima della data. I gommoni di Palau e La Maddalena si possono prenotare in esclusiva, allo stesso prezzo: il sistema sceglie il più piccolo che basta (fino a 6 persone il gommone da 6, da 7 a 12 uno da 12). Stagione 2027: 1 maggio – 31 ottobre.
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
  - `src/data/prenotazioni.js`: gommoni, turni con orari, listini per periodo, regole (chiusura online alle 20 del giorno prima, 48 ore di cancellazione gratuita, 15% alle strutture, fasce d'età, come si paga il carburante delle esclusive). È l'unica fonte dei prezzi: la usano sito e server, e il server ricalcola sempre il totale.
  - `src/data/condizioni.js`: testo delle condizioni di prenotazione, usato dalla pagina `/condizioni/` e copiato per intero nell'email di conferma (la legge chiede la conferma con le condizioni su supporto durevole).
  - `functions/_lib/motore.js`: posti liberi e scelta del gommone. Ogni turno occupa blocchi della giornata (mattina, pomeriggio, sera); l'inserimento controlla i posti nella stessa istruzione SQL, così due clienti non prendono lo stesso posto. Durante il pagamento i posti restano tenuti per 30 minuti.
  - `functions/_lib/pagamenti.js`: SumUp (pagina di pagamento ospitata) e PayPal (ordini v2), sempre con reindirizzamento e verifica dal server: sul sito non si carica nessuno script di terze parti. `PAGAMENTI_PROVA=1` (solo anteprime) aggiunge un pagamento simulato.
  - `functions/_lib/accessi.js`: accessi per gestione e strutture (password PBKDF2, sessione in cookie tecnico `em_sessione`, blocco dopo 5 tentativi; tentativi sbagliati cancellati dopo 24 ore).
  - Impronta dell'indirizzo internet (`ip_hash`, limite di 5 prenotazioni in attesa): si cancella appena la prenotazione è pagata, annullata o scaduta. L'informativa privacy lo promette.
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
- Fatti da rispettare: alla Spiaggia Rosa di Budelli niente sbarco né bagno (si vede dal mare); il pranzo del Tour delle 7 isole è libero a La Maddalena e non incluso; la Corsica si fa solo in esclusiva (giornata intera, prezzi delle giornate in esclusiva) e serve un documento valido per l'espatrio; nelle esclusive il carburante è a parte; il tramonto costa come la mezza giornata.
- Tono: diretto, caldo, concreto. Frasi brevi, seconda persona singolare ("scrivici", "scegli").
- Niente servizi esterni che caricano cookie o tracciano (YouTube, Google Maps incorporata, Google Fonts, pixel pubblicitari). Se servono statistiche, Cloudflare Web Analytics. Ogni nuovo servizio va riportato nella pagina `/cookie/` e in `/privacy/`.
- Alle strutture partner non si mostra il nome dell'ospite che ha prenotato dal loro link (solo data, escursione, persone, importo).
- Condizioni, privacy e cookie: controllate sulle norme l'8 novembre 2026, su richiesta di Remo (Codice del consumo, D.Lgs. 70/2003, GDPR, linee guida cookie del Garante). Non è un parere legale: dirlo a Remo se chiede se sono definitive. Restano da compilare i dati in rosa. Se il sito raccoglie un dato nuovo o usa un servizio nuovo, aggiornare privacy e cookie.
- Prima del pagamento il cliente deve vedere il prezzo totale e come si calcolano i costi in più (carburante, eventuale ticket del Parco): art. 49 del Codice del consumo. Se mancano, il cliente può rifiutarsi di pagarli.
- Niente video: la home usa una foto di apertura (scelta di Remo).

## Stato e prossimi passi

Aggiorna questa sezione quando qualcosa viene completato.

### Fatto
- [x] Prima versione in italiano online su pages.dev
- [x] WhatsApp (+39 331 505 5736) ed email (maddalena.escursioni@gmail.com) nel sito
- [x] Sistema di prenotazione interno con area strutture e gestione: ramo `prenotazioni`, anteprima con pagamento simulato (8 novembre 2026)
- [x] Prezzi decisi da Remo (8 novembre 2026): tramonto come la mezza giornata, Corsica solo in esclusiva con i prezzi della giornata intera, esclusiva possibile su tutti e tre i gommoni
- [x] Condizioni, privacy e cookie controllati sulle norme e su quello che fa il sito (8 novembre 2026); migrazione `0002_impronta_ip.sql` applicata a entrambi i database
- [x] Carburante delle esclusive: a consumo, si paga a bordo a fine uscita. Ticket del Parco incluso nel prezzo (Remo, 8 novembre 2026)
- [x] Cannigione terzo punto d'imbarco con il suo gommone (Honda 9.50), nelle prenotazioni, nella gestione e nelle pagine (9 novembre 2026). Confermato da Remo: anche da Cannigione minimo 6 persone per le uscite di gruppo; tour privato prenotabile online (mezza giornata, tramonto, giornata intera)
- [x] Dati di Remo (11 novembre 2026): risposte tutti i giorni 7:30–22:30 dal 1° maggio al 31 ottobre; niente animali a bordo; bambini di qualsiasi età, giubbotti solo in taglia adulto (consigliato portare il proprio); maschere e boccagli non forniti per igiene (qualcuno a bordo); cibo e bevande a carico dei clienti, nelle esclusive bevande incluse, nel tramonto aperitivo; pranzo libero (suggeriamo noi dove, o pranzo al sacco); nessuna tassa di sbarco extra; prenotare presto, soprattutto da fine luglio ad agosto; niente programma ora per ora
- [x] Molo di La Maddalena: Il Porticciolo, Via Padule (con link Google Maps)
- [x] Gommoni: modelli, motori e posti confermati, pagina "I gommoni e lo skipper" aggiornata (8 novembre 2026)
- [x] Confermati da Remo (8 novembre 2026): Corsica 9:30 – 17:30 con Lavezzi, isola di Cavallo e Bonifacio; le due regole aggiunte alle condizioni (guasto = regola del maltempo; altre piattaforme = loro condizioni); nessuna autorizzazione da indicare; ritrovo 15 minuti prima della partenza a Palau e a La Maddalena (9:15 per le uscite delle 9:30)

### Da decidere o da avere dal cliente (Remo)
- [ ] Molo di Palau (ancora da sapere)
- [ ] Dati dell'azienda: ragione sociale, indirizzo, P. IVA, REA
- [ ] Imbarchi: parcheggio a Palau, link Google Maps del molo di Palau
- [ ] Skipper (nome, esperienza, lingue) e due righe di presentazione dei gommoni
- [ ] Testi delle soste della Corsica (traversata, Lavezzi, Cavallo, Bonifacio) e percorso del tramonto. Mezza giornata fatta (11 novembre 2026): giro di Caprera (Coticcio, Napoletana, Giardinelli) o, con maestrale oltre 15 nodi, Spargi e La Maddalena (Cala Corsara, Cala Gavetta, Giardinelli). Lagunetta: riga scritta da Claude, da far controllare
- [ ] Foto (le note sui segnaposto indicano gli scatti) ed eventuale logo
- [ ] Recensioni vere da Google o TripAdvisor e link alla scheda Google
- [ ] Risposte automatiche di WhatsApp Business (benvenuto, assenza fuori orario, risposte rapide): testi proposti da Claude, li imposta il cliente nell'app

### Da attivare prima di aprire le prenotazioni vere
- [ ] Dominio: da GoDaddy a Cloudflare (DNS), collegarlo in Pages → Custom domains; poi `site` in `astro.config.mjs`, `url` in `src/data/sito.js`, `www` che rimanda alla versione senza `www`
- [ ] Email di conferma, obbligatorie (art. 51, comma 7, Codice del consumo): account Resend, dominio verificato, `RESEND_API_KEY` ed `EMAIL_MITTENTE` in Cloudflare Pages
- [ ] Conti SumUp e PayPal → chiavi in Cloudflare Pages (Production): `SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE`, `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`
- [ ] Accesso di gestione: Remo cambia la password provvisoria al primo accesso; creare le strutture partner vere dalla gestione
- [ ] Unire `prenotazioni` in `main` quando Remo dà l'ok (se i pagamenti non sono ancora attivi: `regole.attive: false`)

### Da provare con soldi veri o servizi veri (non si può fare in anteprima)
- [ ] PayPal in sandbox nell'anteprima (`PAYPAL_AMBIENTE=sandbox` + chiavi sandbox), poi un pagamento vero da pochi euro e il suo rimborso
- [ ] SumUp: un pagamento vero con carta, controllare che la prenotazione si confermi da sola, poi rimborso dal pannello SumUp
- [ ] Email: arrivo al cliente (non nello spam) e copia a maddalena.escursioni@gmail.com
- [ ] "Aggiungi al calendario" su iPhone e su Android
- [ ] Una giornata di prova completa con la persona che inserisce le prenotazioni delle piattaforme e con una struttura partner vera

### Lancio e dopo
- [ ] `inCostruzione: false` in `src/data/sito.js`, `public/robots.txt` aperto (con le esclusioni già scritte nel commento), sitemap, dati strutturati (LocalBusiness e TouristTrip)
- [ ] Se servono statistiche: Cloudflare Web Analytics (aggiornare privacy e cookie)
- [ ] Inglese (`/en/`) con hreflang, poi tedesco e francese
