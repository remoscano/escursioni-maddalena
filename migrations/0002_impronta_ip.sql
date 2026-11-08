-- L'impronta dell'indirizzo internet serve solo mentre una prenotazione aspetta il pagamento
-- (limite di prenotazioni in attesa dallo stesso indirizzo). Indice per trovarla e cancellarla in fretta.
CREATE INDEX IF NOT EXISTS idx_pren_ip ON prenotazioni (ip_hash) WHERE ip_hash IS NOT NULL;

-- Pulizia delle impronte che non servono più.
UPDATE prenotazioni SET ip_hash = NULL WHERE ip_hash IS NOT NULL AND stato != 'in_attesa';
