# Escursioni La Maddalena — sito web

Sito statico fatto con [Astro](https://astro.build): produce HTML, CSS e un po' di JavaScript, senza server né database.
Viene pubblicato su Cloudflare Pages a ogni modifica salvata su GitHub.

## Dove si cambiano i contenuti

| Cosa | File |
|---|---|
| Numero WhatsApp, telefono, email, dati dell'azienda (ragione sociale, P. IVA, REA), moli, orari di ritrovo, dati del gommone e dello skipper, regole (maltempo, pagamento, bambini, animali, ticket del Parco) | `src/data/sito.js` |
| Le 4 escursioni: titoli, prezzi, orari, programma, incluso/non incluso | `src/data/escursioni.js` |
| Domande frequenti | `src/data/faq.js` |
| Voci del menu | `src/data/menu.js` |
| Colori, caratteri, spaziature | `src/styles/global.css` |

I campi lasciati vuoti (`''`) compaiono sul sito come **segnaposto rosa** tra parentesi quadre, ad esempio `[PREZZO]`.
Appena si compila il campo, il segnaposto sparisce in tutte le pagine.

## Pagine

- `/` home
- `/escursioni/` catalogo
- `/escursioni/tour-7-isole/`, `/escursioni/corsica-lavezzi-bonifacio/`, `/escursioni/mezza-giornata/`, `/escursioni/tramonto/`, `/escursioni/tour-privato/` — tutte generate dallo stesso modello (`src/pages/escursioni/[slug].astro`)
- `/richiesta/` modulo WhatsApp (accetta `?escursione=<slug>` per preselezionare l'escursione)
- `/gommone/`, `/info-utili/`, `/domande-frequenti/`, `/contatti/`, `/privacy/`, `/cookie/`

## Prenotazioni online

| Cosa | Dove |
|---|---|
| Prezzi per periodo, orari dei turni, gommoni e posti, regole (chiusura online, cancellazione, provvigione strutture, carburante delle esclusive) | `src/data/prenotazioni.js` |
| Prenotazione per i clienti | `/prenota/` (anche `/prenota/?escursione=tour-7-isole`) |
| Area delle strutture partner | `/partner/` (link per i loro ospiti: `/prenota/?p=CODICE`) |
| Gestione interna: giornata per gommone, inserimento prenotazioni dalle altre piattaforme, maltempo, strutture, provvigioni | `/gestione/` |
| Condizioni di prenotazione (lo stesso testo parte nell'email di conferma) | `/condizioni/`, testo in `src/data/condizioni.js` |

Le prenotazioni girano su Cloudflare: funzioni in `functions/`, database D1 (struttura in `migrations/`), collegamenti in `wrangler.toml`.

**Pagamenti.** Si attivano inserendo le chiavi in Cloudflare Pages → progetto → Impostazioni → Variabili e segreti (ambiente Production, tipo "segreto"):
`SUMUP_API_KEY` e `SUMUP_MERCHANT_CODE` (carta, dalla sezione sviluppatori di SumUp), `PAYPAL_CLIENT_ID` e `PAYPAL_SECRET` (app "Live" su developer.paypal.com). Senza chiavi il sito mostra "pagamenti non ancora attivi" e rimanda a WhatsApp. Nelle anteprime c'è il pagamento simulato.

**Email di conferma.** Con `RESEND_API_KEY` ed `EMAIL_MITTENTE` (serve il dominio) partono la conferma al cliente, con riepilogo e copia delle condizioni, e l'avviso a `maddalena.escursioni@gmail.com`. Vanno attivate prima di aprire le prenotazioni vere: la legge chiede di mandare al cliente la conferma con le condizioni su un supporto durevole (art. 51, comma 7, Codice del consumo). Senza, la conferma si vede solo a schermo e nella gestione.

**Nuovo accesso di gestione.** `node strumenti/impronta-password.mjs "password"` e inserire l'impronta nella tabella `utenti` (ruolo `gestione`). Le strutture si creano dalla gestione.

## Modulo WhatsApp

Il modulo compone il messaggio nel browser e apre `https://wa.me/<numero>?text=…`.
Nessun dato passa dal sito.

## Foto

Le foto sono segnaposto che dicono quale scatto serve. Per inserirne una:

1. metti il file in `src/assets/foto/` (JPG, almeno 2000 px di larghezza per le foto grandi);
2. importalo nella pagina e passalo al componente `Foto` come `src`.

Astro crea da solo le versioni WebP in più dimensioni.

## Privacy

- Caratteri ospitati sul sito (nessuna chiamata a Google Fonts).
- Nessun cookie di profilazione, nessuna mappa o video incorporati da terzi. Cookie tecnico solo nelle aree riservate (`em_sessione`).
- Condizioni, privacy e cookie controllati sulle norme l'8 novembre 2026 (non è un parere legale): restano da compilare i dati in rosa. Se il sito raccoglie un dato nuovo o usa un servizio nuovo, vanno aggiornate privacy e cookie.

## Lavorare in locale

```bash
npm install
npm run dev      # anteprima delle pagine su http://localhost:4321 (senza prenotazioni)
npm run build    # crea il sito in dist/
npx wrangler pages dev dist   # sito + prenotazioni con database locale (vedi prove/LEGGIMI.md)
```

## Cloudflare Pages

- Framework preset: **Astro**
- Build command: `npm run build`
- Build output directory: `dist`
- Variabile d'ambiente: `NODE_VERSION` = `22` (Astro richiede Node 22)

## Prima di andare online

- [ ] Compilare tutti i segnaposto (cercare `''` nei file di `src/data/` e `[` nelle pagine)
- [ ] Inserire le foto
- [ ] Compilare i dati in rosa di condizioni e privacy (azienda, carburante delle esclusive, ticket del Parco)
- [ ] Attivare le email di conferma (dominio + Resend)
- [ ] Collegare il dominio e aggiornare l'indirizzo in `astro.config.mjs` e in `src/data/sito.js`
- [ ] Mettere `inCostruzione: false` in `src/data/sito.js` e aprire `public/robots.txt` all'indicizzazione
- [ ] Inglese, poi tedesco e francese
