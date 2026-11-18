# Prove automatiche delle prenotazioni

Servono a controllare che tutto funzioni dopo una modifica. Si usano in locale, con il database di prova di Wrangler.

```bash
npm run build
printf 'PAGAMENTI_PROVA=1\nRESEND_API_KEY=prova\nEMAIL_MITTENTE=prova@example.com\nRESEND_API_URL=http://127.0.0.1:8799/\nAUTOMATICO_CHIAVE=chiave-di-prova\n' > .dev.vars
# pagamento simulato; le email vanno a un finto server locale che prova_nuove.py apre sulla porta 8799
npx wrangler d1 migrations apply DB --local                 # crea le tabelle nel database locale
node strumenti/impronta-password.mjs "prova-gestione-123"   # impronta per l'accesso di prova
npx wrangler d1 execute DB --local --command "INSERT INTO utenti (ruolo, nome, email, password_hash, deve_cambiare) VALUES ('gestione', 'Ufficio', 'gestione@prova.it', '<impronta>', 0)"
npx wrangler pages dev dist --port 8788 --ip 127.0.0.1      # in un altro terminale

python3 prove/prova_api.py         # prenotazioni, posti, gommoni, prenotazioni contemporanee
python3 prove/prova_gestione.py    # gestione, maltempo, strutture, provvigioni
python3 prove/prova_ui.py          # dal browser (Playwright), 1440 e 390 px
python3 prove/prova_nuove.py       # rinvio e rimborsi, link di pagamento, sconti, buoni, extra, lista d'attesa, volantini, skipper, email, statistiche
python3 prove/prova_ui_nuove.py    # le stesse funzioni dal browser, 1440 e 390 px (serve openpyxl per controllare l'Excel)
python3 prove/prova_recesso.py     # recesso online dai buoni regalo (art. 54-bis Codice del consumo), API e pagina a 1440 e 390 px

python3 prove/prova_inglese.py     # versione inglese (/en/): 1440 e 390 px, lingua, hreflang, link, messaggio WhatsApp in inglese

# Avviso automatico di PayPal, con un finto PayPal (porta 8797): sito avviato a parte sulla porta 8789
npx wrangler pages dev dist --port 8789 --ip 127.0.0.1 --binding PAYPAL_CLIENT_ID=prova --binding PAYPAL_SECRET=prova --binding PAYPAL_API_URL=http://127.0.0.1:8797
python3 prove/prova_paypal.py

# Accessibilità (WCAG 2.2 AA) di tutte le pagine, sul sito della porta 8788
npm i --no-save axe-core@4
python3 prove/prova_accessibilita.py
```

Le prove usano date della stagione 2027 e vanno lanciate su un database locale vuoto (tranne l'accesso di gestione):
`npx wrangler d1 execute DB --local --command "DELETE FROM rendiconti; DELETE FROM promemoria_spese; DELETE FROM prenotazioni_extra; DELETE FROM prenotazioni; DELETE FROM blocchi; DELETE FROM liquidazioni; DELETE FROM utenti WHERE ruolo='partner'; DELETE FROM partner; DELETE FROM tentativi_accesso; DELETE FROM sessioni; DELETE FROM extra; DELETE FROM regole_prezzo; DELETE FROM codici_sconto; DELETE FROM lista_attesa; DELETE FROM campagne; DELETE FROM utenti WHERE ruolo='skipper';"`
