# Prove delle funzioni del 13 novembre 2026: rinvio/rimborso, rimborsi, link di pagamento, email automatiche,
# check-in e skipper, statistiche, codici sconto, buoni regalo, regole di prezzo, extra, lista d'attesa, volantini.
# Le email arrivano a un finto server locale (porta 8799): in .dev.vars servono
#   RESEND_API_KEY=prova, EMAIL_MITTENTE=prova@example.com, RESEND_API_URL=http://127.0.0.1:8799/, AUTOMATICO_CHIAVE=chiave-di-prova
import os, sys, json, threading, subprocess, urllib.parse
from http.server import BaseHTTPRequestHandler, HTTPServer
QUI = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(QUI, 'prova_api.py')).read().split('# 1.')[0])  # client(), prenota(), paga(), giorno()
ok = lambda c, m: print(('OK  ' if c else 'ERR ') + m) or (c or sys.exit(1))

# ---------- finto server delle email ----------
EMAIL = []
class Posta(BaseHTTPRequestHandler):
    def do_POST(self):
        EMAIL.append(json.loads(self.rfile.read(int(self.headers['Content-Length']))))
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(b'{"id":"x"}')
    def log_message(self, *a): pass
srv = HTTPServer(('127.0.0.1', 8799), Posta); threading.Thread(target=srv.serve_forever, daemon=True).start()
def posta(a, parola):
    import time
    for _ in range(30):  # le email partono "in sottofondo": si aspetta fino a 3 secondi
        trovate = [e for e in EMAIL if a in e['to'] and parola in e['subject'] + e['text']]
        if trovate: return trovate
        time.sleep(0.1)
    return []
def sql(comando):
    r = subprocess.run(['npx', 'wrangler', 'd1', 'execute', 'DB', '--local', '--json', '--command', comando], cwd=os.path.dirname(QUI), capture_output=True, text=True)
    try: return json.loads(r.stdout)[0]['results']
    except Exception: print(r.stdout, r.stderr); raise
def q_di(r):
    q = urllib.parse.parse_qs(urllib.parse.urlparse(r['redirect']).query); return q['codice'][0], q['t'][0]
def vedi(call, codice, t):
    return call('GET', f'/api/prenotazione?codice={codice}&t={t}')[1]

adm = client()
s, r = adm('POST', '/api/accesso', {'email': 'gestione@prova.it', 'password': 'prova-gestione-123'}); ok(s == 200, 'accesso gestione')

# ---------- 1. maltempo: il cliente sceglie rinvio o rimborso ----------
D = '2027-06-15'
s, r1 = prenota(pub, data=D, adulti=2, email='rinvio@example.com'); (s2, x), q = paga(pub, r1); c1, t1 = q['codice'][0], q['t'][0]
s, r2 = prenota(pub, data=D, adulti=3, email='rimborso@example.com'); (s2, x), q = paga(pub, r2); c2, t2 = q['codice'][0], q['t'][0]
s, d = adm('GET', f'/api/gestione/giorno?data={D}'); barca = [g for g in d['gommoni'] if g['uscite']][0]['id']
s, r = adm('POST', '/api/gestione/chiusure', {'azione': 'annulla-uscita', 'data': D, 'barca': barca, 'escursione': 'tour-7-isole', 'turno': 'giornata', 'motivo': 'maestrale a 30 nodi'})
ok(s == 200 and len(r['annullate']) == 2 and all(a['emailInviata'] for a in r['annullate']), f'maltempo: 2 clienti avvisati per email {s} {r}')
ok(posta('rinvio@example.com', 'scegli rinvio o rimborso') and '/prenota/esito/?codice=' in posta('rinvio@example.com', 'scegli')[0]['text'], 'l\'email di maltempo ha il link per scegliere')
v = vedi(pub, c1, t1); ok(v['stato'] == 'annullata' and v['recupero'] == 'proposto', 'il cliente vede: annullata, scegli')
s, r = pub('POST', '/api/prenotazione', {'codice': c1, 't': t1, 'azione': 'rinvio', 'data': '2027-06-22', 'turno': 'giornata'}); ok(s == 200 and r['prenotazione']['stato'] == 'confermata' and r['prenotazione']['data'] == '2027-06-22' and r['prenotazione']['dataOriginale'] == D, 'rinvio scelto: confermata il 22 giugno, la data vecchia resta scritta')
ok(posta('rinvio@example.com', 'Data: martedì 22 giugno 2027'), 'nuova conferma via email con la nuova data')
s, r = pub('POST', '/api/prenotazione', {'codice': c1, 't': t1, 'azione': 'rimborso'}); ok(s == 409, 'non si sceglie due volte')
s, r = pub('POST', '/api/prenotazione', {'codice': c2, 't': t2, 'azione': 'rimborso'}); v = r['prenotazione']; ok(s == 200 and v['recupero'] == 'rimborso' and v['rimborsato'] == 300 and v['rimborso'] == 'fatto', f'rimborso scelto: {v["rimborsato"]} € rimborsati in automatico')
ok(posta('rimborso@example.com', 'Rimborso: 300 €'), 'email con il rimborso fatto')

# ---------- 2. il cliente annulla da solo (più di 48 ore prima) ----------
s, r = prenota(pub, data='2027-06-23', adulti=1, email='annulla@example.com'); (s2, x), q = paga(pub, r); c, t = q['codice'][0], q['t'][0]
v = vedi(pub, c, t); ok(v['annullabile'], 'la prenotazione si può annullare online')
s, r = pub('POST', '/api/prenotazione', {'codice': c, 't': t, 'azione': 'annulla'}); ok(s == 200 and r['prenotazione']['stato'] == 'annullata' and r['prenotazione']['rimborsato'] == 100, 'annullata dal cliente: 100 € rimborsati')

# ---------- 3. gestione: rimborso parziale, spostamento ----------
s, r = prenota(pub, data='2027-06-24', adulti=2, email='sposta@example.com'); (s2, x), q = paga(pub, r); c, t = q['codice'][0], q['t'][0]
s, l = adm('GET', f'/api/gestione/prenotazioni?q={c}'); pid = l['prenotazioni'][0]['id']
s, r = adm('POST', '/api/gestione/prenotazione', {'id': pid, 'azione': 'rimborsa', 'importo': '30'}); ok(s == 200, 'rimborso parziale di 30 €')
s, r = adm('POST', '/api/gestione/prenotazione', {'id': pid, 'azione': 'rimborsa', 'importo': '500'}); ok(s == 400, 'non si rimborsa più di quanto pagato')
s, r = adm('POST', '/api/gestione/prenotazione', {'id': pid, 'azione': 'sposta', 'data': '2027-06-25', 'turno': 'giornata'}); ok(s == 200, 'spostata al 25 giugno dalla gestione')
v = vedi(pub, c, t); ok(v['data'] == '2027-06-25' and v['stato'] == 'confermata' and v['rimborsato'] == 30, 'il cliente vede la nuova data e il rimborso parziale')

# ---------- 4. link di pagamento ----------
s, r = adm('POST', '/api/gestione/prenotazioni', {'escursione': 'mezza-giornata', 'turno': 'mattina', 'data': '2027-06-26', 'adulti': 2, 'bambini': 1, 'imbarco': 'maddalena', 'nome': 'Cliente Telefono', 'email': 'link@example.com', 'canale': 'Telefono o WhatsApp', 'link': True, 'ore': 24})
ok(s == 200 and '/prenota/paga/' in r['link'] and r['inviata'] and r['daPagare'] == 190, f'link di pagamento creato e mandato per email ({r.get("daPagare")} €)')
lq = urllib.parse.parse_qs(urllib.parse.urlparse(r['link']).query); c, t = lq['codice'][0], lq['t'][0]
v = vedi(pub, c, t); ok(v['stato'] == 'in_attesa' and v['pagabile'] and 'prova' in v['pagamenti'], 'il cliente vede la prenotazione da pagare')
s, d = adm('GET', '/api/gestione/giorno?data=2027-06-26'); u = [u for g in d['gommoni'] for u in g['uscite']][0]; ok(u['persone'] == 3 and u['prenotazioni'][0]['stato'] == 'in_attesa', 'i posti del link restano tenuti (3 persone, in attesa di pagamento)')
s, r = pub('POST', '/api/pagamento/avvia', {'codice': c, 't': t, 'metodo': 'prova', 'accetto': True}); ok(s == 200 and '/prenota/prova/' in r['redirect'], 'pagamento dal link avviato')
s, r = pub('POST', '/api/pagamento/prova', {'codice': c, 't': t, 'esito': 'ok'}); ok(r['stato'] == 'confermata', 'pagata dal link: confermata')
s, r = adm('POST', '/api/gestione/prenotazioni', {'escursione': 'tour-7-isole', 'turno': 'giornata', 'data': '2027-06-26', 'adulti': 2, 'imbarco': 'palau', 'nome': 'Da pagare al molo', 'canale': 'Telefono o WhatsApp'})
s, l = adm('GET', f'/api/gestione/prenotazioni?q={r["codice"]}'); pid = l['prenotazioni'][0]['id']; ok(l['prenotazioni'][0]['pagabile'], 'prenotazione confermata e non pagata: si può mandare il link')
s, r = adm('POST', '/api/gestione/prenotazione', {'id': pid, 'azione': 'link'}); lq = urllib.parse.parse_qs(urllib.parse.urlparse(r['link']).query)
s, r = pub('POST', '/api/pagamento/avvia', {'codice': lq['codice'][0], 't': lq['t'][0], 'metodo': 'prova', 'accetto': True}); pub('POST', '/api/pagamento/prova', {'codice': lq['codice'][0], 't': lq['t'][0], 'esito': 'ok'})
v = vedi(pub, lq['codice'][0], lq['t'][0]); ok(v['pagato'] == 200 and v['daPagare'] == 0 and v['stato'] == 'confermata', 'pagata dopo dal link: 200 € incassati')

# ---------- 5. codici sconto, regole di prezzo, extra ----------
s, r = adm('POST', '/api/gestione/offerte', {'tipo': 'codice', 'azione': 'crea', 'codice': 'estate10', 'sconto': 'percentuale', 'valore': '10', 'usiMax': '1'}); ok(s == 200, 'codice ESTATE10 creato (un solo uso)')
s, r = prenota(pub, data='2027-06-16', adulti=2, codice='estate10'); c, t = q_di(r); v = vedi(pub, c, t); ok(v['totale'] == 180 and v['sconto'] == 20, f'codice applicato: 200 − 10% = {v["totale"]} €')
s, r = prenota(pub, data='2027-06-16', adulti=2, codice='ESTATE10'); ok(s == 400, f'secondo uso dello stesso codice: {r.get("errore")}')
pub('POST', '/api/prenotazione', {'codice': c, 't': t, 'azione': 'rinuncia'})
s, r = prenota(pub, data='2027-06-16', adulti=2, codice='ESTATE10'); ok(s == 200, 'rinuncia al pagamento: il codice torna disponibile')
s, r = adm('POST', '/api/gestione/offerte', {'tipo': 'regola', 'azione': 'crea', 'regola': 'weekend', 'percentuale': '10'})
s, r = adm('POST', '/api/gestione/offerte', {'tipo': 'regola', 'azione': 'crea', 'regola': 'gruppo', 'soglia': '5', 'percentuale': '5', 'nome': 'Gruppo da 5'})
s, r = prenota(pub, data='2027-06-19', adulti=5); c, t = q_di(r); v = vedi(pub, c, t); ok(v['totale'] == 522.5, f'sabato 5 persone: 500 + 10% weekend − 5% gruppo = {v["totale"]} €')
s, r = adm('POST', '/api/gestione/offerte', {'tipo': 'extra', 'azione': 'crea', 'nome': 'Foto ricordo', 'prezzo': '25', 'modo': 'prenotazione', 'maxGiorno': '1'})
s, o = adm('GET', '/api/gestione/offerte'); xid = o['extra'][0]['id']
s, e = pub('GET', '/api/extra?escursione=tour-7-isole&data=2027-06-17'); ok(e['extra'][0]['rimanenti'] == 1, 'extra disponibile: 1 al giorno')
s, r = prenota(pub, data='2027-06-17', adulti=2, extra={str(xid): 1}); (s2, x), q = paga(pub, r); v = vedi(pub, q['codice'][0], q['t'][0]); ok(v['totale'] == 225 and v['extra'][0]['nome'] == 'Foto ricordo', f'con l\'extra: {v["totale"]} €')
s, r = prenota(pub, data='2027-06-17', adulti=2, extra={str(xid): 1}); ok(s == 400, f'extra finito per quel giorno: {r.get("errore")}')
s, r = adm('POST', '/api/gestione/offerte', {'tipo': 'regola', 'azione': 'disattiva', 'id': o['regole'][0]['id']}); s, r = adm('POST', '/api/gestione/offerte', {'tipo': 'regola', 'azione': 'disattiva', 'id': o['regole'][1]['id']})

# ---------- 6. buoni regalo ----------
s, r = pub('POST', '/api/buono', {'valore': 150, 'nome': 'Marco Regalo', 'email': 'regalo@example.com', 'destinatario': 'Sara', 'metodo': 'prova', 'accetto': True}); ok(s == 200 and '/prenota/prova/' in r['redirect'] and 'tipo=buono' in r['redirect'], 'buono regalo da 150 €: pagamento avviato')
bq = urllib.parse.parse_qs(urllib.parse.urlparse(r['redirect']).query); bc, bt = bq['codice'][0], bq['t'][0]
s, r = pub('POST', '/api/pagamento/prova', {'codice': bc, 't': bt, 'esito': 'ok', 'tipo': 'buono'}); s, b = pub('GET', f'/api/buono?codice={bc}&t={bt}'); ok(b['stato'] == 'attivo' and b['saldo'] == 150 and b['al'], f'buono attivo: {b["saldo"]} €, valido fino al {b["al"]}')
ok(posta('regalo@example.com', bc), 'il buono arriva per email')
s, r = prenota(pub, data='2027-06-18', adulti=1, codice=bc, metodo='buono'); ok(s == 200 and '/prenota/esito/' in r['redirect'], 'prenotazione da 100 € pagata tutta con il buono: confermata subito')
c, t = q_di(r); v = vedi(pub, c, t); ok(v['stato'] == 'confermata' and v['buono'] == 100 and v['daPagare'] == 0, 'confermata con il buono')
s, r = prenota(pub, data='2027-06-18', adulti=2, codice=bc, metodo='buono'); ok(s == 400, 'con 50 € di buono non basta per 200 €: serve un pagamento')
s, r = prenota(pub, data='2027-06-18', adulti=2, codice=bc); c2, t2 = q_di(r); v2 = vedi(pub, c2, t2); ok(v2['buono'] == 50 and v2['daPagare'] == 150, 'buono 50 € + 150 € con carta')
s, b = pub('GET', f'/api/buono?codice={bc}&t={bt}'); ok(b['saldo'] == 0, 'saldo del buono: 0 (tenuto per la prenotazione in pagamento)')
pub('POST', '/api/prenotazione', {'codice': c2, 't': t2, 'azione': 'rinuncia'}); s, b = pub('GET', f'/api/buono?codice={bc}&t={bt}'); ok(b['saldo'] == 50, 'pagamento abbandonato: i 50 € tornano sul buono')
s, r = pub('POST', '/api/prenotazione', {'codice': c, 't': t, 'azione': 'annulla'}); s, b = pub('GET', f'/api/buono?codice={bc}&t={bt}'); ok(b['saldo'] == 150, 'prenotazione annullata: il buono torna a 150 €')

# ---------- 7. lista d'attesa ----------
D2 = '2027-07-08'
s, r = prenota(pub, escursione='tour-privato', turno='giornata', data=D2, adulti=2); (s2, x), q = paga(pub, r); cp, tp = q['codice'][0], q['t'][0]
prenota(pub, escursione='tour-privato', turno='giornata', data=D2, adulti=8); s, r = prenota(pub, escursione='tour-privato', turno='giornata', data=D2, adulti=8); paga(pub, r)
ok(giorno('tour-privato', D2)['stato'] == 'pieno', 'esclusive dell\'8 luglio tutte prese')
s, r = pub('POST', '/api/lista-attesa', {'escursione': 'tour-privato', 'turno': 'giornata', 'data': D2, 'imbarco': 'maddalena', 'adulti': 2, 'nome': 'Attesa Prova', 'email': 'attesa@example.com', 'accetto': True}); ok(s == 200, 'in lista d\'attesa')
s, a = adm('GET', '/api/gestione/attesa'); ok(a['attesa'][0]['libero'] is False, 'la gestione vede la richiesta: ancora nessun posto')
s, r = pub('POST', '/api/prenotazione', {'codice': cp, 't': tp, 'azione': 'annulla'})
import time; time.sleep(1)
ok(posta('attesa@example.com', 'Si è liberato un posto'), 'si libera un gommone: chi aspettava riceve l\'email subito')

# ---------- 8. volantini ----------
s, r = adm('POST', '/api/gestione/campagne', {'azione': 'crea', 'nome': 'Locandina bar del porto', 'codice': 'BARPORTO'}); ok(s == 200, 'volantino creato')
import urllib.request
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
try: urllib.request.build_opener(NoRedirect).open(B + '/v/barporto')
except urllib.error.HTTPError as e: ok(e.code == 302 and e.headers['Location'].endswith('/prenota/?c=BARPORTO'), 'il QR del volantino porta alla prenotazione')
s, r = prenota(pub, data='2027-06-29', adulti=2, campagna='BARPORTO'); paga(pub, r)
s, cmp = adm('GET', '/api/gestione/campagne'); cc = cmp['campagne'][0]; ok(cc['visite'] == 1 and cc['prenotazioni'] == 1 and cc['incasso'] == 200, f'volantino: {cc["visite"]} visita, {cc["prenotazioni"]} prenotazione, {cc["incasso"]} €')

# ---------- 9. skipper e check-in ----------
s, r = adm('POST', '/api/gestione/utenti', {'azione': 'crea', 'nome': 'Skipper Prova', 'email': 'skipper@prova.it'}); ok(s == 200 and r['password'], 'accesso skipper creato')
sk = client(); s, x = sk('POST', '/api/accesso', {'email': 'skipper@prova.it', 'password': r['password']}); sk('POST', '/api/accesso/password', {'attuale': r['password'], 'nuova': 'skipper-password-1'})
oggi = sql("SELECT date('now') AS d")[0]['d']
sql(f"INSERT INTO prenotazioni (codice, token, escursione, turno, data, barca, blocchi, adulti, posti, paganti, imbarco, nome, telefono, totale, pagato, stato, canale, metodo) VALUES ('EM-OGGI01', 'tok', 'tour-7-isole', 'giornata', '{oggi}', 'gruppo-1', ',mattina,pomeriggio,sera,', 3, 3, 3, 'maddalena', 'Imbarco Oggi', '3330001111', 30000, 30000, 'confermata', 'sito', 'prova')")
s, r = sk('GET', '/api/gestione/strutture'); ok(s == 403, 'lo skipper non vede la gestione')
s, r = sk('GET', '/api/gestione/giorno?data=2027-06-26'); ok(s == 403, 'lo skipper non vede gli altri giorni')
s, r = sk('GET', f'/api/gestione/giorno?data={oggi}'); ok(s == 200 and any(u['prenotazioni'] for g in r['gommoni'] for u in g['uscite']), 'lo skipper vede le uscite di oggi')
s, r = sk('GET', '/api/imbarco?codice=em-oggi01'); ok(s == 200 and r['persone'] == 3 and r['pagata'] and r['puoImbarcare'], 'QR letto: 3 persone, pagata')
s, r = sk('POST', '/api/imbarco', {'codice': 'EM-OGGI01'}); ok(s == 200 and r['checkin'], 'check-in fatto')
s, r = sk('GET', f'/api/imbarco?codice={c1}'); ok(s == 409, 'una prenotazione di un altro giorno: lo skipper viene avvisato')

# ---------- 10. email automatiche ----------
domani = sql("SELECT date('now', '+1 day') AS d")[0]['d']; ieri = sql("SELECT date('now', '-1 day') AS d")[0]['d']
sql(f"INSERT INTO prenotazioni (codice, token, escursione, turno, data, barca, blocchi, adulti, posti, paganti, imbarco, nome, email, totale, pagato, stato, canale, metodo) VALUES ('EM-DOMANI', 'tok2', 'tour-7-isole', 'giornata', '{domani}', 'gruppo-1', ',mattina,', 2, 2, 2, 'palau', 'Domani Prova', 'domani@example.com', 20000, 20000, 'confermata', 'sito', 'prova'), ('EM-IERI01', 'tok3', 'tour-7-isole', 'giornata', '{ieri}', 'gruppo-1', ',mattina,', 2, 2, 2, 'palau', 'Ieri Prova', 'ieri@example.com', 20000, 20000, 'confermata', 'sito', 'prova')")
s, r = pub('POST', '/api/automatico', {}); ok(s == 401, 'senza chiave i lavori automatici non partono')
import urllib.request as ur
req = ur.Request(B + '/api/automatico', method='POST', data=b'{}', headers={'Authorization': 'Bearer chiave-di-prova', 'Content-Type': 'application/json'})
r = json.loads(ur.urlopen(req).read()); ok(r['grazie'] >= 1, f'lavori automatici: {r}')
ok(posta('ieri@example.com', 'Grazie'), 'email di ringraziamento dopo l\'uscita')
ok(r['promemoria'] == 1 and posta('domani@example.com', 'Domani') or r['promemoria'] == 0, 'promemoria del giorno prima (parte solo dopo le 18)')
r2 = json.loads(ur.urlopen(ur.Request(B + '/api/automatico', method='POST', data=b'{}', headers={'Authorization': 'Bearer chiave-di-prova', 'Content-Type': 'application/json'})).read()); ok(r2['grazie'] == 0 and r2['promemoria'] == 0, 'la seconda volta non manda niente due volte')

# ---------- 11. statistiche ----------
s, st = adm('GET', '/api/gestione/statistiche?dal=2027-01-01&al=2027-12-31'); t = st['totali']
ok(s == 200 and t['prenotazioni'] > 5 and t['rimborsato'] >= 430 and st['maltempo']['rinviate'] == 1 and st['maltempo']['rimborsate'] == 1, f'statistiche: {t["prenotazioni"]} prenotazioni, {t["lordo"]} € lordi, {t["rimborsato"]} € rimborsati, maltempo {st["maltempo"]}')
ok(any(c['nome'] == 'Sito (da volantino)' for c in st['perCanale']) and st['perMese'] and st['prenotazioni'], 'statistiche per canale (anche volantini), per mese, elenco per il commercialista')
srv.shutdown()
print('TUTTO OK (funzioni nuove)')
