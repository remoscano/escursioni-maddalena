-- Mezza giornata e tramonto diventano due escursioni (11 novembre 2026).
-- Le prenotazioni già registrate passano al nuovo nome in base al turno.
UPDATE prenotazioni SET escursione = 'tramonto' WHERE escursione = 'tramonto-mezza-giornata' AND turno = 'tramonto';
UPDATE prenotazioni SET escursione = 'mezza-giornata' WHERE escursione = 'tramonto-mezza-giornata';
