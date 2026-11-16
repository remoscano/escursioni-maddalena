-- La Corsica non passa più da Bonifacio (11 novembre 2026): l'escursione si chiama "corsica" (16 novembre 2026).
UPDATE prenotazioni SET escursione = 'corsica' WHERE escursione = 'corsica-lavezzi-bonifacio';
UPDATE lista_attesa SET escursione = 'corsica' WHERE escursione = 'corsica-lavezzi-bonifacio';
UPDATE codici_sconto SET escursioni = REPLACE(escursioni, 'corsica-lavezzi-bonifacio', 'corsica') WHERE escursioni LIKE '%corsica-lavezzi-bonifacio%';
UPDATE regole_prezzo SET escursioni = REPLACE(escursioni, 'corsica-lavezzi-bonifacio', 'corsica') WHERE escursioni LIKE '%corsica-lavezzi-bonifacio%';
UPDATE extra SET escursioni = REPLACE(escursioni, 'corsica-lavezzi-bonifacio', 'corsica') WHERE escursioni LIKE '%corsica-lavezzi-bonifacio%';
