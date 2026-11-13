# Istruzioni per Claude — sito Escursioni La Maddalena

Leggi questo file all'inizio di ogni sessione. Il README spiega dove stanno i contenuti; qui ci sono contesto, regole e cose da fare.

## Il progetto

- **Cliente:** Escursioni La Maddalena (nome scelto da Remo il 13 novembre 2026; prima "Escursioni Maddalena"), escursioni in maxi gommone nell'Arcipelago di La Maddalena (Sardegna), con partenza da La Maddalena (porto principale) e Cannigione; a Palau il gommone passa a prendere i clienti.
- **Chi lavora sul sito:** Remo (web designer/consulente, non programmatore). Parla italiano: rispondi in italiano, in modo semplice, senza gergo tecnico se non serve.
- **Obiettivo del sito:** trasformare le visite in prenotazioni online pagate (escursione, data, orario, persone, imbarco). WhatsApp resta per domande, ultimo minuto e gruppi oltre 12 persone. Le altre piattaforme (GetYourGuide, Viator, Click&Boat…) NON sono collegate al sito: una persona dedicata inserisce a mano le loro prenotazioni nella gestione.
- **Flotta:** 2 gommoni di gruppo, Joker Clubman 28 e BWA 30 (12 posti, uscita confermata con almeno 6 paganti), e il Joker 35 solo per le esclusive (6 posti). Modelli e motori in `sito.flotta`. Quarto gommone: Honda 9.50 (12 posti), solo per chi parte da Cannigione (Pontile La Sciumara, Via Lungomare A. Doria 7): mezze giornate, tramonto ed esclusive, stessi orari e prezzi; niente Tour delle 7 isole né Corsica da Cannigione. Ogni gommone ha i suoi imbarchi (`imbarchi` in `gommoni`), ogni offerta i suoi (`imbarchi` in `offerte`): il calendario dei posti dipende dall'imbarco scelto, che nella prenotazione viene prima della data. I gommoni di Palau e La Maddalena si possono prenotare in esclusiva, allo stesso prezzo: il sistema sceglie il più piccolo che basta (fino a 6 persone il gommone da 6, da 7 a 12 uno da 12). Stagione 2027: 1 maggio – 31 ottobre.
- **Strutture partner:** hotel e B&B prenotano dalla loro area (/partner/) o danno ai clienti il loro link (/prenota/?p=CODICE). Provvigione 20% sul lordo (dall'11 novembre 2026; prima 15%), pagata dall'ufficio ogni 15 giorni (1–15 e 16–fine mese, in base alla data dell'escursione).
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
  - `src/data/prenotazioni.js`: gommoni, turni con orari, listini per periodo, regole (chiusura online alle 20 del giorno prima, 48 ore di cancellazione gratuita, 20% alle strutture, fasce d'età (ridotto da 0 a 10 anni, nessuna gratuità), come si paga il carburante delle esclusive). È l'unica fonte dei prezzi: la usano sito e server, e il server ricalcola sempre il totale.
  - `src/data/condizioni.js`: testo delle condizioni di prenotazione, usato dalla pagina `/condizioni/` e copiato per intero nell'email di conferma (la legge chiede la conferma con le condizioni su supporto durevole).
  - `functions/_lib/motore.js`: posti liberi e scelta del gommone. Ogni turno occupa blocchi della giornata (mattina, pomeriggio, sera); l'inserimento controlla i posti nella stessa istruzione SQL, così due clienti non prendono lo stesso posto. Durante il pagamento i posti restano tenuti per 30 minuti.
  - `functions/_lib/pagamenti.js`: SumUp (pagina di pagamento ospitata) e PayPal (ordini v2), sempre con reindirizzamento e verifica dal server: sul sito non si carica nessuno script di terze parti. `PAGAMENTI_PROVA=1` (solo anteprime) aggiunge un pagamento simulato.
  - `functions/_lib/accessi.js`: accessi per gestione e strutture (password PBKDF2, sessione in cookie tecnico `em_sessione`, blocco dopo 5 tentativi; tentativi sbagliati cancellati dopo 24 ore).
  - Impronta dell'indirizzo internet (`ip_hash`, limite di 5 prenotazioni in attesa): si cancella appena la prenotazione è pagata, annullata o scaduta. L'informativa privacy lo promette.
  - Pagine: `/prenota/` (+ `esito/` = pagina del cliente e biglietto con QR, `prova/`, `paga/` = link di pagamento), `/buono-regalo/` (+ `esito/`), `/imbarco/` (skipper), `/partner/`, `/gestione/`, `/condizioni/`.
  - Funzioni del 13 novembre 2026 (migrazione `0004_funzioni_nuove.sql`):
    - `functions/_lib/recupero.js`: annullamenti, rimborsi automatici (`rimborsa` in `pagamenti.js`, SumUp e PayPal, anche parziali), scelta del cliente dopo il maltempo (rinvio o rimborso, colonna `recupero`: proposto | rinviata | rimborso). `spostaPrenotazione` in `motore.js` sposta data o orario con lo stesso controllo dei posti dell'inserimento; il prezzo resta quello pagato.
    - Il cliente annulla da solo dalla sua pagina fino a 48 ore prima (solo pagate sul sito o con buono): rimborso automatico.
    - Link di pagamento: la gestione crea la prenotazione con `link: true` (stato `in_attesa`, posti tenuti per le ore scelte in `regole.orePerPagareLink`) o lo manda per una prenotazione confermata non pagata. `pagabileConLink` in `prenotazioni.js`. Il cliente paga da `/prenota/paga/` (`/api/pagamento/avvia`).
    - Prezzo: `calcolaPrenotazione(slug, turno, data, persone, { regole, codice, extra, extraScelti })` in `src/data/prenotazioni.js`, uguale su sito e server. Regole di prezzo (tabella `regole_prezzo`: anticipo, ultimo-minuto, gruppo, weekend in più), codici sconto e buoni regalo (`codici_sconto`, tipo percentuale | importo | buono), extra (`extra`, `prenotazioni_extra`, con massimo al giorno). Promozione e codice non si sommano: vale il migliore. Si creano tutti dalla gestione (scheda Offerte): nel codice non ci sono prezzi inventati.
    - In prenotazione: `totale` = prezzo finale (dopo sconti, con extra), `buono` = parte pagata con un buono regalo, `pagato` = soldi incassati con carta o PayPal, `rimborsato`. Da pagare = totale − buono − pagato (`daPagare`). Il codice o il buono si "prendono" all'inserimento e tornano disponibili se la prenotazione scade o si annulla (`istruzioniRestituzione`, colonna `codice_reso`).
    - Buoni regalo comprati online: `functions/_lib/buoni.js`, `/api/buono`; pagamento come le prenotazioni (`tipo=buono` nei ritorni di PayPal e nel pagamento di prova).
    - Email (`functions/_lib/email.js`): maltempo con link per scegliere, link di pagamento, annullamento, promemoria, grazie con recensione Google (`sito.recensioniGoogle`), lista d'attesa, buono. Partono da `/api/automatico`, chiamato ogni ora dal Worker in `automatico/` (vedi il suo LEGGIMI) con la chiave `AUTOMATICO_CHIAVE`, o a mano dalla gestione (Account).
    - Lista d'attesa (`lista_attesa`, `functions/_lib/attesa.js`): avviso per email appena si libera un posto (anche subito dopo un annullamento); i dati si cancellano dopo la data.
    - Biglietto con QR (`src/scripts/qr.ts`, libreria `qrcode-generator`): il QR apre `/imbarco/?codice=…`. Ruolo `skipper` (accessi creati dalla gestione, scheda Account): vede solo le uscite di oggi e fa il check-in (`/api/imbarco`, colonne `checkin_il`, `checkin_da`).
    - Statistiche (`/api/gestione/statistiche`) e file Excel per il commercialista creato nel browser (`src/scripts/xlsx.ts`, senza librerie).
    - Volantini (`campagne`): QR `/v/CODICE` → conta la visita (solo il numero) e porta a `/prenota/?c=CODICE`; la prenotazione salva il codice (`campagna`).
    - Gestione e imbarco installabili sul telefono: `public/gestione/` e `public/imbarco/` (manifest e service worker che non salva niente), icone `public/img/app-*.png`.
  - Dati per Google: `src/components/DatiStrutturati.astro` (LocalBusiness in home, TouristTrip + briciole + domande nelle pagine escursione, FAQPage) e `src/pages/sitemap.xml.js`. Scrivono solo dati veri: i campi vuoti di `sito.js` non compaiono.
  - Prove automatiche in `prove/` (vedi `prove/LEGGIMI.md`): prima di ogni push che tocca le prenotazioni devono passare tutte.
- I contenuti stanno in `src/data/` (`sito.js`, `escursioni.js`, `faq.js`, `menu.js`). Prima di scrivere testo dentro una pagina, chiediti se va in un file dati.
- Le 5 pagine escursione (7 isole, Corsica, mezza giornata, tramonto, tour privato) nascono tutte da `src/pages/escursioni/[slug].astro`: una nuova escursione si aggiunge in `escursioni.js`, non con un file nuovo.
- Componenti riutilizzabili in `src/components/`. In particolare:
  - `Dato.astro`: mostra il valore o, se vuoto, un segnaposto rosa `[etichetta]`. Usalo per ogni dato non ancora fornito dal cliente.
  - `Foto.astro`: foto vera (con `src` importato da `src/assets/foto/`, ottimizzata da Astro) o segnaposto che dice quale scatto serve.
  - `ModuloRichiesta.astro`: compone il messaggio e apre `https://wa.me/<numero>?text=…`. Accetta `?escursione=<slug>` nell'URL della pagina `/richiesta/`.
- Stili in `src/styles/global.css` con le variabili CSS in cima. Non introdurre Tailwind o altre librerie CSS.

## Identità visiva ("Bianco e azzurro", dall'11 novembre 2026)

- Scelta di Remo: sito più pulito e minimale, riferimento escursi.com per colori e carattere. Sfondo bianco ovunque, niente sezioni colorate.
- Colori (in `src/styles/global.css`; i nomi delle variabili sono rimasti quelli vecchi): bianco `#FFFFFF` (`--sabbia`, `--sabbia-calda`), grafite `#282828` (`--mare`: testi, piede, apertura), azzurro mare `#2BA6DE` (`--laguna`: bottoni principali, con testo grafite), azzurro scuro `#0A6A9E` (`--turchese`: link e occhielli, contrasto ok su bianco), azzurro chiarissimo `#EEF7FC` (`--acqua`: etichette e riquadri); fino all'11 novembre 2026 era arancio `#FC971C` / `#A85500` / crema `#F7F3EC`, grigio `#5F676E` (`--testo-2`), bordi `#E6E6E6`. La mappa resta col mare azzurro.
- Carattere: Urbanist (titoli e testi), ospitato sul sito con `@fontsource-variable/urbanist`: non usare Google Fonts.
- Home: apertura bianca (testo a sinistra, foto a destra), su tutte le escursioni, bottone "Prenota online"; poi le schede (7 isole in evidenza), il percorso del 7 isole e la cartina dei due percorsi della mezza giornata.
- Un solo bottone arancio per sezione: "Prenota" dove la prenotazione online è attiva (`regole.attive` in `src/data/prenotazioni.js`), altrimenti la richiesta WhatsApp.
- Icone a tratto da 24 px in `Icona.astro`; mai emoji.
- Marchio: sole e due onde che disegnano la M (in `Logo.astro` e `public/favicon.svg`, ora azzurro e grafite), con la scritta "Escursioni / La Maddalena". È una proposta, da rivedere (Remo, 13 novembre 2026): se il cliente fornisce un logo, va sostituito.
- Accessibilità: contrasto almeno 4.5:1, bersagli tattili almeno 44 px, veri `<button>`/`<a>`/`<label>`, testo alternativo sulle foto.

## Regole sui contenuti

- **Mai inventare dati:** prezzi, orari, numeri, nomi, capienza, regole. Se mancano, usa `Dato` con un segnaposto chiaro.
- **Mai recensioni inventate.** Solo recensioni vere copiate da Google o TripAdvisor, con nome e data come pubblicati.
- Mezza giornata e tramonto sono due attività diverse, con due pagine e due offerte (`mezza-giornata`, `tramonto`); il vecchio indirizzo `/escursioni/tramonto-mezza-giornata/` rimanda alla mezza giornata (`public/_redirects`). Migrazione `0003_mezza_giornata_tramonto.sql` per le prenotazioni già registrate.
- Porti: La Maddalena è il porto di partenza dei tre gommoni di gruppo ed esclusiva (Il Porticciolo, Via Padule); Palau è un punto di raccolta (il gommone passa a prendere i clienti); l'Honda 9.50 parte da Cannigione. Sulle mappe: ancora azzurra = partenza da La Maddalena, puntini = passaggio a Palau.
- Prezzi delle uscite di gruppo: intero da 11 anni, ridotto da 0 a 10 anni; nessuno viaggia gratis (Remo, 11 novembre 2026). Nel database i vecchi `neonati` contano come bambini.
- Fatti da rispettare: alla Spiaggia Rosa di Budelli niente sbarco né bagno (si vede dal mare); il pranzo del Tour delle 7 isole è libero a La Maddalena e non incluso; la Corsica si fa solo in esclusiva (giornata intera, prezzi delle giornate in esclusiva) e serve un documento valido per l'espatrio; nelle esclusive il carburante è a parte. Sunset, aperitivo al tramonto (slug `tramonto`; Remo, 11 e 13 novembre 2026): frigo di bordo con prosecco (una bottiglia ogni 6 persone, quelle in più a parte), birra, Coca-Cola e acqua; tagliere con salsiccia e formaggio, oppure spiedini di frutta o taralli e ciliege. Partenza sempre tra le 18:30 e le 19:00 (niente orari per mese). Sosta di gruppo scelta dal comandante col vento: di solito Il Pesce, a Santo Stefano di fronte al pontile dei gommoni (3 minuti, acqua bassa, spiaggia), in alternativa Cala Villamarina. Di gruppo minimo 6 e massimo 10 persone (`postiMax`), da 100 € a persona; in esclusiva 700/750/800 € per periodo, con la possibilità di allungare fino a Spargi o Budelli o di fare il tramonto a Porto della Madonna o Caprera (meteo permettendo, carburante a parte). Orario indicativo; partenza consigliata da La Maddalena (rientro al buio più corto). Periodi e ridotti confermati da Remo il 13 novembre 2026.
- Orari (Remo, 13 novembre 2026): le uscite di gruppo partono da La Maddalena e passano a Palau mezz'ora dopo; al ritorno prima Palau, poi La Maddalena. Mezza giornata 9:00–13:00 e 14:00–18:00 da La Maddalena, 9:30–12:30 e 14:30–17:30 da Palau. Tour delle 7 isole 9:00–17:30 da La Maddalena, 9:30–17:00 da Palau (rientro a Palau calcolato da Claude, da confermare). Esclusive (Corsica e tour privato) 9:30–17:30 la giornata intera. Cannigione: orari di prima (9:30–13:30, 14:00–18:00), da confermare. Nel codice: `orario` del turno = La Maddalena, `orariImbarco` per gli altri moli. Ritrovo 15 minuti prima ovunque; l'orario esatto l'ufficio lo conferma con un messaggio.
- Da bere (Remo, 13 novembre 2026): Tour delle 7 isole due bibite in lattina a testa (acqua naturale e gassata, Coca-Cola, aranciata, tè al limone e alla pesca, birra), acqua in bottigliette da mezzo litro, mirto e dolcetti a fine giro, niente tagliere; mezza giornata acqua e bibite; esclusive e Sunset prosecco e tagliere. "Cosa portare" è una lista sola (`sito.cosaPortare`).
- Tour delle 7 isole: nei testi solo le isole (Santo Stefano, Caprera, La Maddalena, Spargi, Budelli dal mare, Razzoli e Santa Maria / Porto della Madonna), senza nomi di cale: dove fermarsi lo decide lo skipper col meteo (Remo, 13 novembre 2026). Se servono le cale, le alternative si scrivono con la barra: "Cala Villamarina / Il Pesce", "Cala Garibaldi / Cala Serena".
- Mezza giornata: due giri distinti, mai insieme. Giro 1 Caprera (Cala Garibaldi / Cala Serena, Cala Coticcio); giro 2 isole del nord (Spargi, Spiaggia Rosa dal mare, Porto della Madonna, rientro diretto senza Santo Stefano). Il giro lo sceglie lo skipper col vento, non il cliente (Remo, 13 novembre 2026).
- Niente nomi di ristoranti sul sito. Si dice però che, nella sosta a La Maddalena del Tour delle 7 isole, lo skipper può accompagnare i clienti in ristoranti tipici convenzionati, con pranzo sardo a prezzo agevolato; sulla pagina del 7 isole c'è la sezione con le foto dei piatti (`pranzo` in `escursioni.js`) (Remo, 13 novembre 2026).
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
- [x] Decisioni di Remo (11 novembre 2026): niente sezione skipper, niente certificazioni da citare, niente recensioni (primo anno di attività; il componente `Recensioni.astro` resta pronto per il futuro). Cartina della mezza giornata con i due percorsi (`Mappa.astro` variante 'mezza', `public/img/mappa-mezza-giornata.svg`)
- [x] Molo di La Maddalena: Il Porticciolo, Via Padule (con link Google Maps)
- [x] Fasce d'età (11 novembre 2026): ridotto da 0 a 10 anni, intero da 11, nessuna gratuità; tolti i neonati da prenotazione, gestione e testi
- [x] Mezza giornata e tramonto separati; La Maddalena porto di partenza, Palau passaggio; mappe corrette (11 novembre 2026)
- [x] Ombra a bordo su tutti i gommoni (Remo, 11 novembre 2026)
- [x] Gommoni: modelli, motori e posti confermati, pagina "I gommoni e lo skipper" aggiornata (8 novembre 2026). Due righe per gommone ok per ora; Honda 9.50 con le dotazioni degli altri tranne il bagno (Remo, 13 novembre 2026)
- [x] Orari per punto d'imbarco, bevande, prosecco e tagliere, Sunset 18:30–19:00 (Remo, 13 novembre 2026): vedi "Regole sui contenuti"
- [x] Sunset, mezza giornata a due giri, 7 isole senza cale, ristoranti convenzionati, nome "Escursioni La Maddalena" (13 novembre 2026)
- [x] Funzioni nuove sul ramo `prenotazioni` (13 novembre 2026, dopo il confronto con Yorango): rinvio o rimborso scelto dal cliente dopo il maltempo, spostamento dalla gestione, rimborsi automatici (anche parziali), annullamento online del cliente fino a 48 ore prima, link di pagamento, email automatiche (promemoria, grazie, maltempo, lista d'attesa), biglietto con QR e check-in con accesso skipper, statistiche ed Excel per il commercialista, promozioni (anticipo, ultimo minuto, gruppo), aumento nel weekend, codici sconto, buoni regalo comprati online, extra a pagamento con massimo al giorno, lista d'attesa, volantini con QR, gestione e imbarco installabili sul telefono, dati strutturati e sitemap. Prove: `prove/prova_nuove.py` e `prove/prova_ui_nuove.py`
- [x] Confermati da Remo (8 novembre 2026): Corsica 9:30 – 17:30 con Lavezzi, isola di Cavallo e Bonifacio (dall'11 novembre 2026: isola Piana, Lavezzi e Cavallo, senza Bonifacio); le due regole aggiunte alle condizioni (guasto = regola del maltempo; altre piattaforme = loro condizioni); nessuna autorizzazione da indicare; ritrovo 15 minuti prima della partenza da ogni molo (dal 13 novembre 2026 gli orari cambiano per imbarco: vedi "Regole sui contenuti")

### Da decidere o da avere dal cliente (Remo)
- [ ] Molo di Palau: Remo manda il link (13 novembre 2026); poi `molo` e `mappa` in `sito.imbarchi.palau`. Parcheggio a Palau
- [ ] Dati dell'azienda: ragione sociale, indirizzo, P. IVA, REA (Remo li manda insieme alle foto)
- [ ] Da confermare: rientro a Palau del 7 isole alle 17:00; orari da Cannigione; pranzo in Corsica (ristorante o al sacco?)
- [ ] Testi delle soste della Corsica (isola Piana, Lavezzi, Cavallo) scritti da Claude il 13 novembre 2026: da far controllare a Remo
- [ ] Foto (le note sui segnaposto indicano gli scatti, comprese quelle dei piatti dei ristoranti convenzionati) e logo da rivedere
- [ ] Proposte di Claude da confermare (13 novembre 2026, in `regole` di `src/data/prenotazioni.js`): buoni regalo da 50/100/150/200/300 € (minimo 30, massimo 2000) validi 12 mesi; durata dei link di pagamento 2/12/24/48 ore; promemoria dalle 18 del giorno prima; grazie 2 ore dopo il rientro. Nelle condizioni: buono rimborsabile se il cliente cambia idea entro 14 giorni (art. 52 Codice del consumo: da far confermare, non è un parere legale)
- [ ] Da decidere nella gestione (scheda Offerte): promozioni, eventuale aumento nel weekend, codici sconto, extra a pagamento (foto, kit...): ora non ce n'è nessuno
- [ ] Link alla scheda Google per le recensioni (`recensioniGoogle` in `src/data/sito.js`): serve all'email di ringraziamento
- [ ] Risposte automatiche di WhatsApp Business (benvenuto, assenza fuori orario, risposte rapide): testi proposti da Claude, li imposta il cliente nell'app

### Da attivare prima di aprire le prenotazioni vere
- [ ] Dominio: da GoDaddy a Cloudflare (DNS), collegarlo in Pages → Custom domains; poi `site` in `astro.config.mjs`, `url` in `src/data/sito.js`, `www` che rimanda alla versione senza `www`
- [ ] Email di conferma, obbligatorie (art. 51, comma 7, Codice del consumo): account Resend, dominio verificato, `RESEND_API_KEY` ed `EMAIL_MITTENTE` in Cloudflare Pages
- [ ] Conti SumUp e PayPal → chiavi in Cloudflare Pages (Production): `SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE`, `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`
- [ ] Migrazione `0004_funzioni_nuove.sql` su entrambi i database (`npx wrangler d1 migrations apply escursioni-prenotazioni-prova --remote` e `... escursioni-prenotazioni --remote`): chiude le sessioni aperte, basta rientrare
- [ ] Email automatiche: segreto `AUTOMATICO_CHIAVE` (e `SITO_URL` col dominio) in Cloudflare Pages, poi pubblicare il Worker in `automatico/` (istruzioni nel suo LEGGIMI)
- [ ] Rimborsi automatici: controllare che la chiave SumUp possa fare rimborsi (permesso "payments") e fare una prova con PayPal sandbox
- [ ] Accessi skipper dalla gestione (Account) e prova dell'imbarco col telefono il primo giorno
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
- [ ] Inglese (`/en/`) con hreflang, poi tedesco e francese: tutte le pagine, i testi in `src/data/`, la prenotazione (testi nel JavaScript di `Prenotazione.astro`, `esito.astro`, `paga/`, `buono-regalo/`), le email (`email.js`, `prenotazioni.js`) e le condizioni. Il sito oggi è solo in italiano
- [ ] Al lancio aggiungere `Sitemap: https://<dominio>/sitemap.xml` in `public/robots.txt`
