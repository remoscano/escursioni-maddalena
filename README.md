# Escursioni Maddalena — sito web

Sito statico fatto con [Astro](https://astro.build): produce HTML, CSS e un po' di JavaScript, senza server né database.
Viene pubblicato su Cloudflare Pages a ogni modifica salvata su GitHub.

## Dove si cambiano i contenuti

| Cosa | File |
|---|---|
| Numero WhatsApp, telefono, email, P. IVA, moli, orari di ritrovo, dati del gommone e dello skipper, regole (maltempo, pagamento, bambini, animali) | `src/data/sito.js` |
| Le 4 escursioni: titoli, prezzi, orari, programma, incluso/non incluso | `src/data/escursioni.js` |
| Domande frequenti | `src/data/faq.js` |
| Voci del menu | `src/data/menu.js` |
| Colori, caratteri, spaziature | `src/styles/global.css` |

I campi lasciati vuoti (`''`) compaiono sul sito come **segnaposto rosa** tra parentesi quadre, ad esempio `[PREZZO]`.
Appena si compila il campo, il segnaposto sparisce in tutte le pagine.

## Pagine

- `/` home
- `/escursioni/` catalogo
- `/escursioni/tour-7-isole/`, `/escursioni/corsica-lavezzi-bonifacio/`, `/escursioni/tramonto-mezza-giornata/`, `/escursioni/tour-privato/` — tutte generate dallo stesso modello (`src/pages/escursioni/[slug].astro`)
- `/richiesta/` modulo WhatsApp (accetta `?escursione=<slug>` per preselezionare l'escursione)
- `/gommone/`, `/info-utili/`, `/domande-frequenti/`, `/contatti/`, `/privacy/`, `/cookie/`

## Prenotazioni online

| Cosa | Dove |
|---|---|
| Prezzi per periodo, orari dei turni, gommoni e posti, regole (chiusura online, cancellazione, provvigione strutture) | `src/data/prenotazioni.js` |
| Prenotazione per i clienti | `/prenota/` (anche `/prenota/?escursione=tour-7-isole`) |
| Area delle strutture partner | `/partner/` (link per i loro ospiti: `/prenota/?p=CODICE`) |
| Gestione interna: giornata per gommone, inserimento prenotazioni dalle altre piattaforme, maltempo, strutture, provvigioni | `/gestione/` |
| Condizioni di prenotazione | `/condizioni/` |

Le prenotazioni girano su Cloudflare: funzioni in `functions/`, database D1 (struttura in `migrations/`), collegamenti in `wrangler.toml`.

**Pagamenti.** Si attivano inserendo le chiavi in Cloudflare Pages → progetto → Impostazioni → Variabili e segreti (ambiente Production, tipo "segreto"):
`SUMUP_API_KEY` e `SUMUP_MERCHANT_CODE` (carta, dalla sezione sviluppatori di SumUp), `PAYPAL_CLIENT_ID` e `PAYPAL_SECRET` (app "Live" su developer.paypal.com). Senza chiavi il sito mostra "pagamenti non ancora attivi" e rimanda a WhatsApp. Nelle anteprime c'è il pagamento simulato.

**Email di conferma.** Facoltative: con `RESEND_API_KEY` ed `EMAIL_MITTENTE` (serve il dominio) partono la conferma al cliente e l'avviso a `maddalena.escursioni@gmail.com`. Senza, la conferma si vede a schermo e nella gestione.

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
- Nessun cookie, nessuna mappa o video incorporati da terzi.
- Privacy e cookie sono **bozze** da far verificare.

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
- [ ] Far verificare privacy e cookie
- [ ] Collegare il dominio e aggiornare l'indirizzo in `astro.config.mjs` e in `src/data/sito.js`
- [ ] Mettere `inCostruzione: false` in `src/data/sito.js` e aprire `public/robots.txt` all'indicizzazione
- [ ] Inglese, poi tedesco e francese
