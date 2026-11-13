# Programma automatico (email a orari fissi)

Cloudflare Pages non sa far partire niente da solo a un'ora precisa: lo fa questo piccolo Worker.
Ogni ora (al minuto 5) chiama `/api/automatico` del sito, che:

- annulla le prenotazioni non pagate in tempo e libera i posti;
- dalle 18 manda il **promemoria** a chi esce il giorno dopo;
- qualche ora dopo il rientro manda il **grazie**, con il link per la recensione su Google (se è compilato `recensioniGoogle` in `src/data/sito.js`);
- rimanda gli **avvisi di maltempo** non partiti;
- avvisa chi è in **lista d'attesa** quando si libera un posto, e cancella le richieste di date passate.

Le email partono solo se sono attive (`RESEND_API_KEY` ed `EMAIL_MITTENTE` in Cloudflare Pages).

## Da fare una volta sola

1. Scegli una chiave lunga e casuale (per esempio 40 lettere e numeri a caso).
2. In **Cloudflare Pages → escursioni-maddalena → Impostazioni → Variabili e segreti** aggiungi il segreto
   `AUTOMATICO_CHIAVE` con quella chiave (e, quando c'è il dominio, la variabile `SITO_URL` con l'indirizzo vero del sito,
   per esempio `https://www.escursionimaddalena.it`: serve per i link nelle email).
3. Pubblica il Worker, dal computer, in questa cartella:
   ```bash
   cd automatico
   npx wrangler deploy
   npx wrangler secret put AUTOMATICO_CHIAVE   # incolla la stessa chiave
   ```
   In alternativa dal sito di Cloudflare: **Workers e Pages → Crea → Worker**, incolla `index.js`,
   in **Impostazioni → Trigger** aggiungi il cron `5 * * * *`, in **Variabili** aggiungi `SITO` e il segreto `AUTOMATICO_CHIAVE`.
4. Quando colleghi il dominio, cambia `SITO` in `wrangler.toml` (o nelle variabili del Worker).

Per provarlo subito: nella gestione, scheda **Account → Email automatiche → Controlla e manda adesso**.
