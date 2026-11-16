# Prova dell'avviso automatico di PayPal (webhook) con un finto PayPal in locale (porta 8797).
# Il sito va avviato con le chiavi finte e l'indirizzo del finto PayPal (vedi prove/LEGGIMI.md):
#   npx wrangler pages dev dist --port 8789 --ip 127.0.0.1 --binding PAYPAL_CLIENT_ID=prova --binding PAYPAL_SECRET=prova --binding PAYPAL_API_URL=http://127.0.0.1:8797
import json, random, subprocess, sys, threading, urllib.request, urllib.error
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

B = 'http://127.0.0.1:8789'
ordini = {}   # id → {'stato', 'importo', 'rif', 'catture'}
conta = {'n': 0, 'incassi': 0}

class FintoPaypal(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def manda(self, codice, dati):
        corpo = json.dumps(dati).encode()
        self.send_response(codice); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(corpo))); self.end_headers(); self.wfile.write(corpo)
    def ordine(self, o, oid):
        u = {'reference_id': o['rif'], 'amount': {'currency_code': 'EUR', 'value': o['importo']}}
        if o['stato'] == 'COMPLETED': u['payments'] = {'captures': [{'id': 'CAP-' + oid, 'status': 'COMPLETED', 'amount': {'currency_code': 'EUR', 'value': o['importo']}}]}
        return {'id': oid, 'status': o['stato'], 'purchase_units': [u]}
    def do_POST(self):
        n = int(self.headers.get('Content-Length') or 0); corpo = json.loads(self.rfile.read(n) or b'{}') if n and 'json' in (self.headers.get('Content-Type') or '') else {}
        if self.path == '/v1/oauth2/token': return self.manda(200, {'access_token': 'finto'})
        if self.path == '/v2/checkout/orders':
            conta['n'] += 1; oid = f'ORD{conta["n"]}{random.randint(1000, 9999)}'
            u = corpo['purchase_units'][0]
            ordini[oid] = {'stato': 'CREATED', 'importo': u['amount']['value'], 'rif': u['reference_id']}
            return self.manda(201, {'id': oid, 'status': 'PAYER_ACTION_REQUIRED', 'links': [{'rel': 'payer-action', 'href': f'http://paypal.finto/approva?token={oid}'}]})
        if self.path.endswith('/capture'):
            oid = self.path.split('/')[4]; o = ordini.get(oid)
            if not o: return self.manda(404, {'name': 'RESOURCE_NOT_FOUND'})
            if o['stato'] == 'COMPLETED': return self.manda(422, {'name': 'UNPROCESSABLE_ENTITY', 'details': [{'issue': 'ORDER_ALREADY_CAPTURED'}]})
            if o['stato'] != 'APPROVED': return self.manda(422, {'name': 'UNPROCESSABLE_ENTITY', 'details': [{'issue': 'ORDER_NOT_APPROVED'}]})
            o['stato'] = 'COMPLETED'; conta['incassi'] += 1
            return self.manda(201, self.ordine(o, oid))
        return self.manda(404, {})
    def do_GET(self):
        oid = self.path.split('/')[-1]; o = ordini.get(oid)
        return self.manda(200, self.ordine(o, oid)) if o else self.manda(404, {})

srv = ThreadingHTTPServer(('127.0.0.1', 8797), FintoPaypal); threading.Thread(target=srv.serve_forever, daemon=True).start()

def chiama(metodo, path, body=None):
    req = urllib.request.Request(B + path, method=metodo, data=json.dumps(body).encode() if body is not None else None)
    req.add_header('Content-Type', 'application/json'); req.add_header('Origin', B)
    req.add_header('CF-Connecting-IP', '10.8.%d.%d' % (random.randint(0, 255), random.randint(1, 254)))
    try:
        with urllib.request.urlopen(req) as r: return r.status, json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e: return e.code, json.loads(e.read() or b'{}')

def senza_redirect(path):
    class No(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **k): return None
    try: urllib.request.build_opener(No).open(B + path); return None
    except urllib.error.HTTPError as e: return e.headers.get('Location')

def riga(codice):
    out = subprocess.run(['npx', 'wrangler', 'd1', 'execute', 'DB', '--local', '--json', '--command',
                          f"SELECT codice, token, stato, pagato, totale, pagamento_rif FROM prenotazioni WHERE codice = '{codice}'"], capture_output=True, text=True).stdout
    return json.loads(out)[0]['results'][0]

ok = lambda c, m: print(('OK  ' if c else 'ERR ') + m) or (c or sys.exit(1))
def prenota(data):
    return chiama('POST', '/api/prenota', dict(escursione='tour-7-isole', turno='giornata', data=data, adulti=2, bambini=0, imbarco='maddalena',
                  nome='Cliente PayPal', email='pp@example.com', telefono='+39 333 0000001', metodo='paypal', accetto=True))

# 1. Il cliente approva su PayPal e chiude la pagina: basta l'avviso automatico.
s, r = prenota('2027-06-22'); ok(s == 200 and 'paypal.finto' in r.get('redirect', ''), f'prenotazione con PayPal avviata ({s})')
p = riga(r['codice']); oid = p['pagamento_rif']; ok(p['stato'] == 'in_attesa', 'in attesa di pagamento')
s, _ = chiama('POST', '/api/pagamento/paypal-notifica', {'event_type': 'CHECKOUT.ORDER.APPROVED', 'resource': {'id': oid}})
ok(s == 200 and riga(r['codice'])['stato'] == 'in_attesa', 'avviso per un ordine non ancora approvato: non cambia niente')
ordini[oid]['stato'] = 'APPROVED'
s, _ = chiama('POST', '/api/pagamento/paypal-notifica', {'event_type': 'CHECKOUT.ORDER.APPROVED', 'resource': {'id': oid}})
p = riga(r['codice']); ok(s == 200 and p['stato'] == 'confermata' and p['pagato'] == p['totale'] > 0, f'avviso automatico: prenotazione confermata e pagata ({p["stato"]}, {p["pagato"]})')
ok(conta['incassi'] == 1, 'incassato una volta sola')
# Lo stesso avviso ripetuto e il ritorno tardivo del cliente non incassano di nuovo.
s, _ = chiama('POST', '/api/pagamento/paypal-notifica', {'event_type': 'PAYMENT.CAPTURE.COMPLETED', 'resource': {'id': 'CAP-' + oid, 'supplementary_data': {'related_ids': {'order_id': oid}}}})
dove = senza_redirect(f'/api/pagamento/paypal?codice={p["codice"]}&t={p["token"]}&token={oid}')
ok(s == 200 and conta['incassi'] == 1 and dove and 'non_pagato' not in dove and riga(r['codice'])['stato'] == 'confermata', 'avviso ripetuto e ritorno del cliente: nessun doppio incasso')

# 2. Strada normale: il cliente torna sul sito, poi arriva l'avviso.
s, r = prenota('2027-06-23'); p = riga(r['codice']); oid = p['pagamento_rif']; ordini[oid]['stato'] = 'APPROVED'
dove = senza_redirect(f'/api/pagamento/paypal?codice={p["codice"]}&t={p["token"]}&token={oid}')
ok(dove and '/prenota/esito/' in dove and 'non_pagato' not in dove and riga(r['codice'])['stato'] == 'confermata', 'ritorno del cliente: confermata')
s, _ = chiama('POST', '/api/pagamento/paypal-notifica', {'event_type': 'CHECKOUT.ORDER.APPROVED', 'resource': {'id': oid}})
ok(conta['incassi'] == 2, 'avviso dopo il ritorno: nessun doppio incasso')

# 3. Avvisi che non riguardano noi o finti.
s, _ = chiama('POST', '/api/pagamento/paypal-notifica', {'event_type': 'CHECKOUT.ORDER.APPROVED', 'resource': {'id': 'ORDINE-INESISTENTE'}})
ok(s == 200, 'ordine sconosciuto: risposta 200, niente da fare')
s, _ = chiama('POST', '/api/pagamento/paypal-notifica', {'event_type': 'ALTRO'})
ok(s == 200, 'evento senza ordine: risposta 200')
print('TUTTO OK (avviso PayPal)')
srv.shutdown()
