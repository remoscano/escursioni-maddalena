-- Lingua del cliente (23 novembre 2026): prenotazione, pagamento, email e condizioni nella sua lingua.
-- 'it', 'en', 'es', 'fr', 'de'. Tutto quello che c'è già resta in italiano.
ALTER TABLE prenotazioni ADD COLUMN lingua TEXT NOT NULL DEFAULT 'it';
ALTER TABLE lista_attesa ADD COLUMN lingua TEXT NOT NULL DEFAULT 'it';
ALTER TABLE codici_sconto ADD COLUMN lingua TEXT NOT NULL DEFAULT 'it';
