-- Spese di bordo inserite dagli skipper (13 novembre 2026): carburante (litri ed euro), bevande, cibo, altro.
-- Un rendiconto per skipper, giorno e gommone; "nessuna spesa" = rendiconto con tutti zero.
-- Importi in centesimi di euro. Da applicare a entrambi i database.

CREATE TABLE IF NOT EXISTS rendiconti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  utente_id INTEGER NOT NULL REFERENCES utenti(id),
  data TEXT NOT NULL,
  barca TEXT NOT NULL,
  litri REAL NOT NULL DEFAULT 0,
  carburante INTEGER NOT NULL DEFAULT 0,
  bevande INTEGER NOT NULL DEFAULT 0,
  cibo INTEGER NOT NULL DEFAULT 0,
  altro INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  creato_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  aggiornato_il TEXT,
  UNIQUE (utente_id, data, barca)
);
CREATE INDEX IF NOT EXISTS idx_rendiconti_data ON rendiconti (data, barca);

-- Promemoria per email già mandati agli skipper (uno per momento della giornata).
CREATE TABLE IF NOT EXISTS promemoria_spese (
  utente_id INTEGER NOT NULL REFERENCES utenti(id),
  giorno TEXT NOT NULL,
  momento TEXT NOT NULL CHECK (momento IN ('sera', 'mattina')),
  inviato_il TEXT NOT NULL,
  PRIMARY KEY (utente_id, giorno, momento)
);

-- Per trovare in fretta i giorni in cui uno skipper ha imbarcato clienti.
CREATE INDEX IF NOT EXISTS idx_pren_checkin ON prenotazioni (checkin_da, data) WHERE checkin_da IS NOT NULL;
