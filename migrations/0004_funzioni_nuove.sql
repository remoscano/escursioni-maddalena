-- Funzioni nuove (13 novembre 2026): rinvio e rimborsi, link di pagamento, email automatiche, check-in,
-- statistiche, codici sconto e buoni regalo, regole di prezzo, extra, lista d'attesa, volantini, accesso skipper.
-- Da applicare a entrambi i database (sito pubblicato e anteprime).

-- ---------- Accesso "skipper": il ruolo si aggiunge ricreando la tabella degli utenti ----------
-- (SQLite non permette di cambiare il controllo sui ruoli). Le sessioni aperte si chiudono: basta rientrare.
PRAGMA defer_foreign_keys = true;
CREATE TABLE utenti_nuova (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ruolo TEXT NOT NULL CHECK (ruolo IN ('gestione', 'partner', 'skipper')),
  partner_id INTEGER REFERENCES partner(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  attivo INTEGER NOT NULL DEFAULT 1,
  deve_cambiare INTEGER NOT NULL DEFAULT 1,
  creato_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ultimo_accesso TEXT
);
INSERT INTO utenti_nuova (id, ruolo, partner_id, nome, email, password_hash, attivo, deve_cambiare, creato_il, ultimo_accesso)
  SELECT id, ruolo, partner_id, nome, email, password_hash, attivo, deve_cambiare, creato_il, ultimo_accesso FROM utenti;
DELETE FROM sessioni;
DROP TABLE utenti;
ALTER TABLE utenti_nuova RENAME TO utenti;

-- ---------- Codici sconto e buoni regalo ----------
CREATE TABLE IF NOT EXISTS codici_sconto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codice TEXT NOT NULL UNIQUE COLLATE NOCASE,
  -- percentuale (valore = % ) | importo (valore = centesimi) | buono (buono regalo: valore = importo iniziale, saldo = quanto resta)
  tipo TEXT NOT NULL CHECK (tipo IN ('percentuale', 'importo', 'buono')),
  valore REAL NOT NULL,
  saldo INTEGER NOT NULL DEFAULT 0,
  -- Validità: per i codici, date dell'escursione; per i buoni, "al" = scadenza
  dal TEXT,
  al TEXT,
  usi_max INTEGER,
  usati INTEGER NOT NULL DEFAULT 0,
  escursioni TEXT,
  -- attivo | in_attesa (buono in pagamento) | annullato
  stato TEXT NOT NULL DEFAULT 'attivo',
  note TEXT,
  -- Buoni comprati online
  token TEXT,
  acquirente TEXT,
  email TEXT,
  telefono TEXT,
  destinatario TEXT,
  messaggio TEXT,
  metodo TEXT,
  pagamento_rif TEXT,
  pagato INTEGER NOT NULL DEFAULT 0,
  rimborsato INTEGER NOT NULL DEFAULT 0,
  ip_hash TEXT,
  scade_il TEXT,
  creato_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  creato_da TEXT
);
CREATE INDEX IF NOT EXISTS idx_codici_rif ON codici_sconto (pagamento_rif);

-- ---------- Prenotazioni: colonne nuove ----------
-- Maltempo o uscita annullata da noi: NULL | proposto (il cliente deve scegliere) | rinviata | rimborso
ALTER TABLE prenotazioni ADD COLUMN recupero TEXT;
-- Data prima di un rinvio o di uno spostamento
ALTER TABLE prenotazioni ADD COLUMN data_originale TEXT;
-- Rimborsi fatti (centesimi) e riferimento del rimborso presso SumUp o PayPal
ALTER TABLE prenotazioni ADD COLUMN rimborsato INTEGER NOT NULL DEFAULT 0;
ALTER TABLE prenotazioni ADD COLUMN rimborso_rif TEXT;
-- Check-in all'imbarco
ALTER TABLE prenotazioni ADD COLUMN checkin_il TEXT;
ALTER TABLE prenotazioni ADD COLUMN checkin_da TEXT;
-- Email automatiche già mandate
ALTER TABLE prenotazioni ADD COLUMN promemoria_il TEXT;
ALTER TABLE prenotazioni ADD COLUMN grazie_il TEXT;
ALTER TABLE prenotazioni ADD COLUMN avviso_il TEXT;
-- Prezzo: listino, sconto (promozioni o codice), parte pagata con un buono regalo, extra
ALTER TABLE prenotazioni ADD COLUMN listino INTEGER;
ALTER TABLE prenotazioni ADD COLUMN sconto INTEGER NOT NULL DEFAULT 0;
ALTER TABLE prenotazioni ADD COLUMN sconto_nota TEXT;
ALTER TABLE prenotazioni ADD COLUMN codice_id INTEGER REFERENCES codici_sconto(id);
ALTER TABLE prenotazioni ADD COLUMN codice_reso INTEGER NOT NULL DEFAULT 0;
ALTER TABLE prenotazioni ADD COLUMN buono INTEGER NOT NULL DEFAULT 0;
ALTER TABLE prenotazioni ADD COLUMN extra_totale INTEGER NOT NULL DEFAULT 0;
-- Volantino o locandina da cui è arrivato il cliente
ALTER TABLE prenotazioni ADD COLUMN campagna TEXT;
CREATE INDEX IF NOT EXISTS idx_pren_campagna ON prenotazioni (campagna) WHERE campagna IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pren_codice ON prenotazioni (codice_id) WHERE codice_id IS NOT NULL;

-- ---------- Regole di prezzo automatiche ----------
-- anticipo (prenoti almeno "soglia" giorni prima) | ultimo-minuto (partenza entro "soglia" ore)
-- gruppo (almeno "soglia" persone) | weekend (sabato e domenica: percentuale in più)
CREATE TABLE IF NOT EXISTS regole_prezzo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('anticipo', 'ultimo-minuto', 'gruppo', 'weekend')),
  soglia INTEGER NOT NULL DEFAULT 0,
  percentuale REAL NOT NULL,
  escursioni TEXT,
  dal TEXT,
  al TEXT,
  attiva INTEGER NOT NULL DEFAULT 1,
  creata_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ---------- Extra a pagamento ----------
CREATE TABLE IF NOT EXISTS extra (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descrizione TEXT,
  prezzo INTEGER NOT NULL,
  -- persona (prezzo per ogni persona che lo vuole) | prenotazione (prezzo unico)
  modo TEXT NOT NULL CHECK (modo IN ('persona', 'prenotazione')),
  -- quanti se ne possono vendere in un giorno (NULL = senza limite)
  max_giorno INTEGER,
  escursioni TEXT,
  attivo INTEGER NOT NULL DEFAULT 1,
  ordine INTEGER NOT NULL DEFAULT 0,
  creato_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE TABLE IF NOT EXISTS prenotazioni_extra (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prenotazione_id INTEGER NOT NULL REFERENCES prenotazioni(id),
  extra_id INTEGER NOT NULL REFERENCES extra(id),
  nome TEXT NOT NULL,
  quantita INTEGER NOT NULL,
  prezzo INTEGER NOT NULL,
  totale INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pextra_pren ON prenotazioni_extra (prenotazione_id);
CREATE INDEX IF NOT EXISTS idx_pextra_extra ON prenotazioni_extra (extra_id);

-- ---------- Lista d'attesa ----------
CREATE TABLE IF NOT EXISTS lista_attesa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  escursione TEXT NOT NULL,
  turno TEXT NOT NULL,
  data TEXT NOT NULL,
  imbarco TEXT NOT NULL,
  adulti INTEGER NOT NULL DEFAULT 1,
  bambini INTEGER NOT NULL DEFAULT 0,
  posti INTEGER NOT NULL,
  nome TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  token TEXT NOT NULL,
  -- attesa | avvisato | chiuso
  stato TEXT NOT NULL DEFAULT 'attesa',
  creata_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  avvisata_il TEXT
);
CREATE INDEX IF NOT EXISTS idx_attesa ON lista_attesa (data, stato);

-- ---------- Volantini e locandine (campagne con QR) ----------
CREATE TABLE IF NOT EXISTS campagne (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codice TEXT NOT NULL UNIQUE COLLATE NOCASE,
  nome TEXT NOT NULL,
  visite INTEGER NOT NULL DEFAULT 0,
  attiva INTEGER NOT NULL DEFAULT 1,
  creata_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
