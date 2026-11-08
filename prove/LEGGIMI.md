# Prove automatiche delle prenotazioni

Servono a controllare che tutto funzioni dopo una modifica. Si usano in locale, con il database di prova di Wrangler.

```bash
npm run build
printf 'PAGAMENTI_PROVA=1\n' > .dev.vars                    # pagamento simulato in locale
npx wrangler d1 migrations apply DB --local                 # crea le tabelle nel database locale
node strumenti/impronta-password.mjs "prova-gestione-123"   # impronta per l'accesso di prova
npx wrangler d1 execute DB --local --command "INSERT INTO utenti (ruolo, nome, email, password_hash, deve_cambiare) VALUES ('gestione', 'Ufficio', 'gestione@prova.it', '<impronta>', 0)"
npx wrangler pages dev dist --port 8788 --ip 127.0.0.1      # in un altro terminale

python3 prove/prova_api.py         # prenotazioni, posti, gommoni, prenotazioni contemporanee
python3 prove/prova_gestione.py    # gestione, maltempo, strutture, provvigioni
python3 prove/prova_ui.py          # dal browser (Playwright), 1440 e 390 px
```

Le prove usano date della stagione 2027 e vanno lanciate su un database locale vuoto (tranne l'accesso di gestione):
`npx wrangler d1 execute DB --local --command "DELETE FROM prenotazioni; DELETE FROM blocchi; DELETE FROM liquidazioni; DELETE FROM utenti WHERE ruolo='partner'; DELETE FROM partner; DELETE FROM tentativi_accesso; DELETE FROM sessioni;"`
