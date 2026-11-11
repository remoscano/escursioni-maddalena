import random, json, urllib.request, urllib.parse, http.cookiejar, threading, sys
B = 'http://127.0.0.1:8788'
def client(ip=None):
    cj = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    def call(method, path, body=None, origin=True):
        req = urllib.request.Request(B + path, method=method, data=json.dumps(body).encode() if body is not None else None)
        if body is not None: req.add_header('Content-Type', 'application/json')
        if origin: req.add_header('Origin', B)
        req.add_header('CF-Connecting-IP', ip or '10.0.%d.%d' % (random.randint(0,255), random.randint(1,254)))
        for c in cj: c.secure = False  # il cookie è "Secure": su http locale Python non lo rimanderebbe
        try:
            with op.open(req) as r:
                for c in cj: c.secure = False
                return r.status, json.loads(r.read() or b'{}')
        except urllib.error.HTTPError as e: return e.code, json.loads(e.read() or b'{}')
    return call
pub = client()
ok = lambda c, m: print(('OK  ' if c else 'ERR ') + m) or (c or sys.exit(1))
def prenota(call, **kw):
    b = dict(escursione='tour-7-isole', turno='giornata', data='2027-06-10', persone=2, imbarco='palau', nome='Cliente Prova', email='c@example.com', telefono='+39 333 0000000', metodo='prova', accetto=True); b.update(kw); b = {k: v for k, v in b.items() if v is not None}
    return call('POST', '/api/prenota', b)
def paga(call, r):
    q = urllib.parse.parse_qs(urllib.parse.urlparse(r['redirect']).query)
    return call('POST', '/api/pagamento/prova', {'codice': q['codice'][0], 't': q['t'][0], 'esito': 'ok'}), q
def giorno(slug, data, call=pub):
    s, d = call('GET', f'/api/disponibilita?escursione={slug}&mese={data[:7]}')
    return d['giorni'][data]

# 1. pagamento di prova della prima prenotazione (fatta prima con curl, 6 posti) + una nuova
s, r = prenota(pub, persone=None, adulti=4, bambini=1, neonati=1); ok(s == 200, 'prima prenotazione dal vecchio modulo (4+1+1): 6 persone')
s, r = prenota(pub, persone=3); ok(s == 200, f'prenotazione 3 persone → {r.get("codice")}')
(s2, r2), q = paga(pub, r); ok(r2.get('stato') == 'confermata', 'pagamento di prova confermato')
s, v = pub('GET', f'/api/prenotazione?codice={q["codice"][0]}&t={q["t"][0]}'); ok(v['stato'] == 'confermata' and v['totale'] == 300, f'esito cliente: {v["stato"]}, totale {v["totale"]} €')
s, v = pub('GET', f'/api/prenotazione?codice={q["codice"][0]}&t=sbagliato'); ok(s == 404, 'token sbagliato → non trovata')

# 2. riempire il gommone 1 (già 6 + 3 = 9 posti): 3 entrano, poi 2 vanno sul gommone 2
s, r = prenota(pub, persone=3); ok(s == 200, 'altri 3: gommone 1 pieno (12)')
g = giorno('tour-7-isole', '2027-06-10'); ok(g['turni'][0]['max'] == 12 and g['turni'][0]['confermata'], f'ancora 12 posti (gommone 2) e uscita confermata: {g}')
s, r = prenota(pub, persone=2); ok(s == 200, 'altri 2 → gommone 2')
s, r = prenota(pub, persone=11); ok(s == 409, f'11 persone non entrano (restano 10): {s} {r}')
s, r = prenota(pub, persone=10); ok(s == 200, '10 persone → gommone 2 pieno')
g = giorno('tour-7-isole', '2027-06-10'); ok(g['stato'] == 'pieno', 'giorno pieno per il 7 isole')
g = giorno('mezza-giornata', '2027-06-10'); ok(g['stato'] == 'pieno', 'con i due gommoni in giornata intera, la mezza giornata è chiusa')
g = giorno('tramonto', '2027-06-10'); ok(g['stato'] == 'pieno', 'con i due gommoni in giornata intera, il tramonto è chiuso')

# 3. conflitti tra turni: pomeriggio occupa anche la sera
s, r = prenota(pub, escursione='mezza-giornata', turno='pomeriggio', data='2027-06-11', persone=2); ok(s == 200, 'pomeriggio 11 giugno su gommone 1')
s, r = prenota(pub, escursione='tramonto', turno='tramonto', data='2027-06-11', persone=2); ok(s == 200, 'tramonto 11 giugno → va sul gommone 2')
g = giorno('mezza-giornata', '2027-06-11'); t = {x['id']: x for x in g['turni']}
t.update({x['id']: x for x in giorno('tramonto', '2027-06-11')['turni']})
ok(t['mattina']['max'] == 12, 'mattina ancora libera su entrambi')
ok(t['pomeriggio']['max'] == 10 and t['tramonto']['max'] == 10, 'pomeriggio e tramonto: solo 10 posti, sulle uscite già aperte')
g = giorno('tour-7-isole', '2027-06-11'); ok(g['stato'] == 'pieno', 'giornata intera impossibile: entrambi i gommoni hanno un\'uscita')
s, r = prenota(pub, escursione='mezza-giornata', turno='mattina', data='2027-06-11', persone=3); ok(s == 200, 'mattina + pomeriggio sullo stesso gommone: possibile')

# 3b. Cannigione: gommone dedicato (Honda 9.50), solo mezze giornate, tramonto ed esclusive
def giorno_da(slug, data, imbarco):
    s, d = pub('GET', f'/api/disponibilita?escursione={slug}&mese={data[:7]}&imbarco={imbarco}'); return d['giorni'][data]
ok(giorno_da('mezza-giornata', '2027-06-10', 'cannigione')['stato'] == 'libero', '10 giugno: da Palau tutto pieno, da Cannigione il gommone è libero')
s, r = prenota(pub, escursione='mezza-giornata', turno='mattina', data='2027-06-10', persone=12, imbarco='cannigione'); ok(s == 200, 'mezza giornata da Cannigione, 12 persone sul gommone di Cannigione')
s, r = prenota(pub, escursione='mezza-giornata', turno='mattina', data='2027-06-10', persone=1, imbarco='cannigione'); ok(s == 409, 'il gommone di Cannigione è pieno: non si va su quelli di Palau')
s, r = prenota(pub, escursione='tour-7-isole', data='2027-06-20', persone=2, imbarco='cannigione'); ok(s == 400, f'7 isole da Cannigione: {r.get("errore")}')
s, r = prenota(pub, escursione='corsica-lavezzi-bonifacio', turno='giornata', data='2027-06-20', persone=2, imbarco='cannigione'); ok(s == 400, 'Corsica da Cannigione: non parte')
s, d = pub('GET', '/api/disponibilita?escursione=tour-7-isole&mese=2027-06&imbarco=cannigione'); ok(s == 400, 'calendario del 7 isole da Cannigione: non esiste')
s, r = prenota(pub, escursione='tour-privato', turno='giornata', data='2027-06-21', persone=3, imbarco='cannigione'); ok(s == 200, 'privato da Cannigione, 3 persone')
s, r = prenota(pub, escursione='tour-privato', turno='giornata', data='2027-06-21', persone=3, imbarco='cannigione'); ok(s == 409, 'secondo privato da Cannigione lo stesso giorno: gommone già occupato')
t = {x['id']: x for x in giorno('tour-privato', '2027-06-21')['turni']}; ok(t['giornata']['disponibile'], 'da Palau il privato del 21 giugno è ancora libero')

# 4. esclusive: si possono prenotare tutti e tre i gommoni, il sistema sceglie il più piccolo che basta
s, r = prenota(pub, escursione='tour-privato', turno='giornata', data='2027-07-15', persone=4); ok(s == 200, 'privato giornata intera 15 luglio, 4 persone')
(s2, r2), q = paga(pub, r); s, v = pub('GET', f'/api/prenotazione?codice={q["codice"][0]}&t={q["t"][0]}'); ok(v['totale'] == 1500 and v['carburanteEscluso'], f'privato luglio = {v["totale"]} €, carburante escluso')
t = {x['id']: x for x in giorno('tour-privato', '2027-07-15')['turni']}; ok(t['giornata']['disponibile'] and t['giornata']['max'] == 12, 'dopo il primo privato restano liberi i gommoni da 12')
s, r = prenota(pub, data='2027-07-15', persone=12); ok(s == 200, '7 isole 15 luglio, 12 persone: c\'è un gommone grande libero')
s, r = prenota(pub, data='2027-07-15', persone=12); ok(s == 200, '7 isole 15 luglio, altre 12: anche il secondo gommone grande era libero (il privato da 4 è sul gommone da 6)')
ok(giorno('tour-privato', '2027-07-15')['stato'] == 'pieno', 'tutti e tre i gommoni occupati: niente più esclusive il 15 luglio')
s, r = prenota(pub, escursione='tour-privato', turno='mattina', data='2027-07-16', persone=7); ok(s == 200, 'privato da 7 persone → su un gommone da 12')
t = {x['id']: x for x in giorno('tour-7-isole', '2027-07-16')['turni']}; ok(t['giornata']['max'] == 12, '7 isole 16 luglio: resta un solo gommone grande')
t = {x['id']: x for x in giorno('mezza-giornata', '2027-07-16')['turni']}; ok(t['pomeriggio']['max'] == 12, 'il pomeriggio è libero anche sul gommone del privato del mattino')
s, r = prenota(pub, escursione='tour-privato', turno='mattina', data='2027-07-17', persone=13); ok(s == 400, f'13 persone in esclusiva: {r.get("errore")}')
s, r = prenota(pub, escursione='corsica-lavezzi-bonifacio', turno='giornata', data='2027-08-12', persone=3); (s2, r2), q = paga(pub, r)
s, v = pub('GET', f'/api/prenotazione?codice={q["codice"][0]}&t={q["t"][0]}'); ok(v['totale'] == 1620 and v['privato'] and v['carburanteEscluso'] and v['documento'] and v['orario'] == '9:30 – 17:30', f'Corsica in esclusiva ad agosto = {v["totale"]} €, carburante escluso, documento, {v["orario"]}')
s, r = prenota(pub, escursione='tramonto', turno='tramonto', data='2027-07-20', persone=3); (s2, r2), q = paga(pub, r)
s, v = pub('GET', f'/api/prenotazione?codice={q["codice"][0]}&t={q["t"][0]}'); ok(v['totale'] == 75*3, f'tramonto a luglio come la mezza giornata, 3 persone: {v["totale"]} €')
s, r = prenota(pub, escursione='tour-7-isole', data='2027-08-05', persone=None, adulti=2, bambini=1); (s2, r2), q = paga(pub, r); s, v = pub('GET', f'/api/prenotazione?codice={q["codice"][0]}&t={q["t"][0]}'); ok(v['totale'] == 135*3, f'agosto 3 persone, prezzo unico (anche se arrivano come bambini) = {v["totale"]} €')

# 5. prenotazioni in contemporanea per gli ultimi posti (12 richieste da 2 persone su 2×12 posti liberi = solo 12 possono entrare... 24 posti → 12 richieste da 2 = 24, poi altre 4 devono fallire)
risultati = []
def tenta(i):
    c = client(); s, r = prenota(c, data='2027-09-09', persone=2, nome=f'Parallelo {i}', email=f'p{i}@example.com'); risultati.append(s)
th = [threading.Thread(target=tenta, args=(i,)) for i in range(16)]
[t.start() for t in th]; [t.join() for t in th]
ok(risultati.count(200) == 12 and risultati.count(409) + risultati.count(429) == 4, f'16 richieste contemporanee da 2 persone su 24 posti: {risultati.count(200)} accettate, {len(risultati) - risultati.count(200)} rifiutate')

# 6. date non prenotabili
s, r = prenota(pub, data='2026-11-20'); ok(s == 409, f'fuori stagione: {r.get("errore")}')
s, r = prenota(pub, persone=0); ok(s == 400, f'zero persone: {r.get("errore")}')
s, r = prenota(pub, accetto=False); ok(s == 400, 'senza accettare le condizioni')
s, r = prenota(pub, email='nonvalida'); ok(s == 400, f'email non valida: {r.get("errore")}')
# 7. limite di prenotazioni in attesa dallo stesso indirizzo
stesso = client(ip='10.9.9.9'); esiti = [prenota(stesso, data='2027-10-01', persone=1)[0] for _ in range(6)]
ok(esiti == [200]*5 + [429], f'stesso indirizzo: 5 in attesa poi blocco ({esiti})')
print('TUTTO OK (pubblico)')
