-- Database delle prenotazioni (Cloudflare D1, SQLite).
-- Importi in centesimi di euro. Date 'AAAA-MM-GG', orari in formato ISO UTC.

CREATE TABLE IF NOT EXISTS partner (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  codice TEXT NOT NULL UNIQUE,
  email TEXT,
  telefono TEXT,
  referente TEXT,
  provvigione_pct REAL NOT NULL DEFAULT 15,
  attivo INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  creato_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS utenti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ruolo TEXT NOT NULL CHECK (ruolo IN ('gestione', 'partner')),
  partner_id INTEGER REFERENCES partner(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  attivo INTEGER NOT NULL DEFAULT 1,
  deve_cambiare INTEGER NOT NULL DEFAULT 1,
  creato_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ultimo_accesso TEXT
);

CREATE TABLE IF NOT EXISTS sessioni (
  token_hash TEXT PRIMARY KEY,
  utente_id INTEGER NOT NULL REFERENCES utenti(id) ON DELETE CASCADE,
  scade_il TEXT NOT NULL,
  creata_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS tentativi_accesso (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chiave TEXT NOT NULL,
  quando TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tentativi ON tentativi_accesso (chiave, quando);

CREATE TABLE IF NOT EXISTS prenotazioni (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codice TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL,
  escursione TEXT NOT NULL,
  turno TEXT NOT NULL,
  data TEXT NOT NULL,
  barca TEXT NOT NULL,
  blocchi TEXT NOT NULL,
  adulti INTEGER NOT NULL DEFAULT 0,
  bambini INTEGER NOT NULL DEFAULT 0,
  neonati INTEGER NOT NULL DEFAULT 0,
  posti INTEGER NOT NULL,
  paganti INTEGER NOT NULL,
  imbarco TEXT NOT NULL,
  nome TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  note TEXT,
  totale INTEGER NOT NULL,
  pagato INTEGER NOT NULL DEFAULT 0,
  provvigione INTEGER NOT NULL DEFAULT 0,
  -- in_attesa | confermata | annullata | scaduta | da_verificare (pagata ma da controllare)
  stato TEXT NOT NULL,
  -- NULL | da_fare | fatto
  rimborso TEXT,
  -- sito | struttura | link-struttura | nome della piattaforma esterna
  canale TEXT NOT NULL,
  partner_id INTEGER REFERENCES partner(id),
  -- sumup | paypal | prova | esterno
  metodo TEXT,
  pagamento_rif TEXT,
  rif_esterno TEXT,
  ip_hash TEXT,
  scade_il TEXT,
  creata_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  aggiornata_il TEXT,
  creata_da TEXT
);
CREATE INDEX IF NOT EXISTS idx_pren_data ON prenotazioni (data, barca);
CREATE INDEX IF NOT EXISTS idx_pren_partner ON prenotazioni (partner_id, data);
CREATE INDEX IF NOT EXISTS idx_pren_rif ON prenotazioni (pagamento_rif);
CREATE INDEX IF NOT EXISTS idx_pren_attesa ON prenotazioni (stato, scade_il);

-- Gommoni chiusi in un blocco della giornata (manutenzione, maltempo, uscita annullata). barca = '*' vale per tutti.
CREATE TABLE IF NOT EXISTS blocchi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL,
  barca TEXT NOT NULL,
  blocco TEXT NOT NULL CHECK (blocco IN ('mattina', 'pomeriggio', 'sera')),
  motivo TEXT,
  creato_da TEXT,
  creato_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (data, barca, blocco)
);

-- Provvigioni pagate alle strutture (una riga per struttura e quindicina).
CREATE TABLE IF NOT EXISTS liquidazioni (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id INTEGER NOT NULL REFERENCES partner(id),
  dal TEXT NOT NULL,
  al TEXT NOT NULL,
  importo INTEGER NOT NULL,
  pagata_il TEXT NOT NULL,
  note TEXT,
  creata_da TEXT,
  UNIQUE (partner_id, dal, al)
);

-- Registro delle operazioni (chi ha fatto cosa).
CREATE TABLE IF NOT EXISTS registro (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quando TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  chi TEXT,
  azione TEXT NOT NULL,
  dettagli TEXT
);
