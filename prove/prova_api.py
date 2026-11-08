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
    b = dict(escursione='tour-7-isole', turno='giornata', data='2027-06-10', adulti=2, bambini=0, neonati=0, imbarco='palau', nome='Cliente Prova', email='c@example.com', telefono='+39 333 0000000', metodo='prova', accetto=True); b.update(kw)
    return call('POST', '/api/prenota', b)
def paga(call, r):
    q = urllib.parse.parse_qs(urllib.parse.urlparse(r['redirect']).query)
    return call('POST', '/api/pagamento/prova', {'codice': q['codice'][0], 't': q['t'][0], 'esito': 'ok'}), q
def giorno(slug, data, call=pub):
    s, d = call('GET', f'/api/disponibilita?escursione={slug}&mese={data[:7]}')
    return d['giorni'][data]

# 1. pagamento di prova della prima prenotazione (fatta prima con curl, 6 posti) + una nuova
s, r = prenota(pub, adulti=4, bambini=1, neonati=1); ok(s == 200, 'prima prenotazione: 6 posti (4+1+1)')
s, r = prenota(pub, adulti=3); ok(s == 200, f'prenotazione 3 adulti → {r.get("codice")}')
(s2, r2), q = paga(pub, r); ok(r2.get('stato') == 'confermata', 'pagamento di prova confermato')
s, v = pub('GET', f'/api/prenotazione?codice={q["codice"][0]}&t={q["t"][0]}'); ok(v['stato'] == 'confermata' and v['totale'] == 300, f'esito cliente: {v["stato"]}, totale {v["totale"]} €')
s, v = pub('GET', f'/api/prenotazione?codice={q["codice"][0]}&t=sbagliato'); ok(s == 404, 'token sbagliato → non trovata')

# 2. riempire il gommone 1 (già 6 + 3 = 9 posti): 3 entrano, poi 2 vanno sul gommone 2
s, r = prenota(pub, adulti=3); ok(s == 200, 'altri 3: gommone 1 pieno (12)')
g = giorno('tour-7-isole', '2027-06-10'); ok(g['turni'][0]['max'] == 12 and g['turni'][0]['confermata'], f'ancora 12 posti (gommone 2) e uscita confermata: {g}')
s, r = prenota(pub, adulti=2); ok(s == 200, 'altri 2 → gommone 2')
s, r = prenota(pub, adulti=11); ok(s == 409, f'11 persone non entrano (restano 10): {s} {r}')
s, r = prenota(pub, adulti=10); ok(s == 200, '10 persone → gommone 2 pieno')
g = giorno('tour-7-isole', '2027-06-10'); ok(g['stato'] == 'pieno', 'giorno pieno per il 7 isole')
g = giorno('tramonto-mezza-giornata', '2027-06-10'); ok(g['stato'] == 'pieno', 'con i due gommoni in giornata intera, mezza giornata e tramonto sono chiusi')

# 3. conflitti tra turni: pomeriggio occupa anche la sera
s, r = prenota(pub, escursione='tramonto-mezza-giornata', turno='pomeriggio', data='2027-06-11', adulti=2); ok(s == 200, 'pomeriggio 11 giugno su gommone 1')
s, r = prenota(pub, escursione='tramonto-mezza-giornata', turno='tramonto', data='2027-06-11', adulti=2); ok(s == 200, 'tramonto 11 giugno → va sul gommone 2')
g = giorno('tramonto-mezza-giornata', '2027-06-11'); t = {x['id']: x for x in g['turni']}
ok(t['mattina']['max'] == 12, 'mattina ancora libera su entrambi')
ok(t['pomeriggio']['max'] == 10 and t['tramonto']['max'] == 10, 'pomeriggio e tramonto: solo 10 posti, sulle uscite già aperte')
g = giorno('tour-7-isole', '2027-06-11'); ok(g['stato'] == 'pieno', 'giornata intera impossibile: entrambi i gommoni hanno un\'uscita')
s, r = prenota(pub, escursione='tramonto-mezza-giornata', turno='mattina', data='2027-06-11', adulti=1, bambini=1, neonati=1); ok(s == 200, 'mattina + pomeriggio sullo stesso gommone: possibile')

# 4. tour privato
s, r = prenota(pub, escursione='tour-privato', turno='giornata', data='2027-07-15', adulti=2, bambini=2); ok(s == 200, 'privato giornata intera 15 luglio')
(s2, r2), q = paga(pub, r); s, v = pub('GET', f'/api/prenotazione?codice={q["codice"][0]}&t={q["t"][0]}'); ok(v['totale'] == 1500 and v['carburanteEscluso'], f'privato luglio = {v["totale"]} €, carburante escluso')
g = giorno('tour-privato', '2027-07-15'); ok(g['stato'] == 'pieno', 'gommone esclusiva occupato tutto il giorno')
s, r = prenota(pub, escursione='tour-privato', turno='mattina', data='2027-07-16', adulti=7); ok(s == 400, f'7 persone nel privato: {r.get("errore")}')
s, r = prenota(pub, escursione='tour-7-isole', data='2027-08-05', adulti=2, bambini=1); (s2, r2), q = paga(pub, r); s, v = pub('GET', f'/api/prenotazione?codice={q["codice"][0]}&t={q["t"][0]}'); ok(v['totale'] == 135*2+125, f'agosto 2 interi + 1 ridotto = {v["totale"]} €')

# 5. prenotazioni in contemporanea per gli ultimi posti (12 richieste da 2 persone su 2×12 posti liberi = solo 12 possono entrare... 24 posti → 12 richieste da 2 = 24, poi altre 4 devono fallire)
risultati = []
def tenta(i):
    c = client(); s, r = prenota(c, data='2027-09-09', adulti=2, nome=f'Parallelo {i}', email=f'p{i}@example.com'); risultati.append(s)
th = [threading.Thread(target=tenta, args=(i,)) for i in range(16)]
[t.start() for t in th]; [t.join() for t in th]
ok(risultati.count(200) == 12 and risultati.count(409) + risultati.count(429) == 4, f'16 richieste contemporanee da 2 persone su 24 posti: {risultati.count(200)} accettate, {len(risultati) - risultati.count(200)} rifiutate')

# 6. date non prenotabili
s, r = prenota(pub, data='2026-11-20'); ok(s == 409, f'fuori stagione: {r.get("errore")}')
s, r = prenota(pub, adulti=0, bambini=2); ok(s == 400, f'senza adulti: {r.get("errore")}')
s, r = prenota(pub, accetto=False); ok(s == 400, 'senza accettare le condizioni')
s, r = prenota(pub, email='nonvalida'); ok(s == 400, f'email non valida: {r.get("errore")}')
# 7. limite di prenotazioni in attesa dallo stesso indirizzo
stesso = client(ip='10.9.9.9'); esiti = [prenota(stesso, data='2027-10-01', adulti=1)[0] for _ in range(6)]
ok(esiti == [200]*5 + [429], f'stesso indirizzo: 5 in attesa poi blocco ({esiti})')
print('TUTTO OK (pubblico)')
