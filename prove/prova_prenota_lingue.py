# Prenotazione online nelle altre lingue (23 novembre 2026): inglese, spagnolo, francese, tedesco.
# Per ogni lingua, a 1440 e a 390 px: prenotazione completa con il pagamento di prova, pagina del cliente con il
# biglietto nella lingua giusta, email al cliente nella sua lingua (e all'ufficio in italiano), nessuno scorrimento
# orizzontale e nessuna frase italiana rimasta. Poi: link di pagamento dalla gestione, condizioni (pagina e file),
# buono regalo e recesso.
# Serve il sito avviato come in LEGGIMI.md (porta 8788, .dev.vars con PAGAMENTI_PROVA=1 e RESEND_API_URL sulla 8799).
import asyncio, json, re, threading, time, urllib.request, http.cookiejar
from http.server import BaseHTTPRequestHandler, HTTPServer
from playwright.async_api import async_playwright

B = 'http://127.0.0.1:8788'
ERRORI = []
def ok(cond, msg):
    print(('OK  ' if cond else 'ERR ') + msg)
    if not cond: ERRORI.append(msg)

# ---------- finto server delle email ----------
EMAIL = []
class Posta(BaseHTTPRequestHandler):
    def do_POST(self):
        EMAIL.append(json.loads(self.rfile.read(int(self.headers['Content-Length']))))
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(b'{"id":"x"}')
    def log_message(self, *a): pass
threading.Thread(target=HTTPServer(('127.0.0.1', 8799), Posta).serve_forever, daemon=True).start()
def posta(a, parola):
    for _ in range(40):
        trovate = [e for e in EMAIL if a in e['to'] and parola in e['subject'] + e['text']]
        if trovate: return trovate
        time.sleep(0.1)
    return []

# Per ogni lingua: indirizzi, parole attese e frasi italiane che non devono esserci.
LINGUE = {
    'en': dict(prenota='/en/book/', esito='/en/book/booking/', paga='/en/book/pay/', condizioni='/en/booking-terms/', txt='/en/booking-terms.txt',
               buono='/en/gift-voucher/', buonoEsito='/en/gift-voucher/voucher/', recesso='/en/withdrawal/',
               prezzo='€200', confermata='Booking confirmed', biglietto='Your ticket', oggetto='Booking ', corpo='your booking is confirmed',
               condTitolo='Booking terms', condFile='BOOKING TERMS', paga_titolo='Pay for your booking', buonoCarta='Gift voucher',
               buonoOggetto='gift voucher', recessoOk='Withdrawal received', recessoOggetto='Withdrawal receipt', mese='May 2027'),
    'es': dict(prenota='/es/reservar/', esito='/es/reservar/reserva/', paga='/es/reservar/pagar/', condizioni='/es/condiciones/', txt='/es/condiciones.txt',
               buono='/es/bono-regalo/', buonoEsito='/es/bono-regalo/bono/', recesso='/es/desistimiento/',
               prezzo='200 €', confermata='Reserva confirmada', biglietto='Tu billete', oggetto='Reserva ', corpo='tu reserva está confirmada',
               condTitolo='Condiciones de reserva', condFile='CONDICIONES DE RESERVA', paga_titolo='Paga la reserva', buonoCarta='Bono regalo',
               buonoOggetto='bono regalo', recessoOk='Desistimiento recibido', recessoOggetto='Recibo del desistimiento', mese='mayo de 2027'),
    'fr': dict(prenota='/fr/reserver/', esito='/fr/reserver/reservation/', paga='/fr/reserver/payer/', condizioni='/fr/conditions/', txt='/fr/conditions.txt',
               buono='/fr/bon-cadeau/', buonoEsito='/fr/bon-cadeau/bon/', recesso='/fr/retractation/',
               prezzo='200 €', confermata='Réservation confirmée', biglietto='Votre billet', oggetto='Réservation ', corpo='votre réservation est confirmée',
               condTitolo='Conditions de réservation', condFile='CONDITIONS DE RÉSERVATION', paga_titolo='Payer la réservation', buonoCarta='Bon cadeau',
               buonoOggetto='bon cadeau', recessoOk='Rétractation reçue', recessoOggetto='Reçu de rétractation', mese='mai 2027'),
    'de': dict(prenota='/de/buchen/', esito='/de/buchen/buchung/', paga='/de/buchen/bezahlen/', condizioni='/de/buchungsbedingungen/', txt='/de/buchungsbedingungen.txt',
               buono='/de/gutschein/', buonoEsito='/de/gutschein/gutschein/', recesso='/de/widerruf/',
               prezzo='200 €', confermata='Buchung bestätigt', biglietto='Ihr Ticket', oggetto='Buchung ', corpo='Ihre Buchung ist bestätigt',
               condTitolo='Buchungsbedingungen', condFile='BUCHUNGSBEDINGUNGEN', paga_titolo='Buchung bezahlen', buonoCarta='Geschenkgutschein',
               buonoOggetto='Geschenkgutschein', recessoOk='Widerruf erhalten', recessoOggetto='Widerrufsbestätigung', mese='Mai 2027'),
}
# Frasi italiane della prenotazione: se compaiono in una pagina tradotta, qualcosa non è stato tradotto.
ITALIANO = ['Prenotazione confermata', 'Scrivici', 'Aggiungi al calendario', 'Il tuo biglietto', 'Cancellazione gratuita', 'Riepilogo',
            'Posti liberi', 'I tuoi dati', 'Persone', 'Imbarco', 'Orario', 'Escursione', 'a persona', 'ridotto', 'Paga con', 'Da pagare', 'Totale']

async def larghezza(pg, w, nome):
    sw = await pg.evaluate('document.documentElement.scrollWidth')
    ok(sw <= w, f'{w}px {nome}: nessuno scorrimento orizzontale ({sw})')

async def italiano_rimasto(pg, l, w, nome):
    testo = await pg.inner_text('main') if await pg.locator('main').count() else await pg.inner_text('body')
    rimaste = [x for x in ITALIANO if re.search(r'\b' + re.escape(x) + r'\b', testo)]
    ok(not rimaste, f'{l} {w}px {nome}: niente frasi italiane {rimaste or ""}')

async def prenotazione(ctx, l, w, giorno, errori):
    D = LINGUE[l]
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: errori.append(f'{l} {w} {e}'))
    await pg.goto(f'{B}{D["prenota"]}?escursione=tour-7-isole', wait_until='networkidle')
    await pg.wait_for_selector('.cal__giorno:not([disabled])')
    ok(await pg.get_attribute('html', 'lang') == l, f'{l} {w}px prenota: lingua della pagina')
    ok(D['mese'].lower() in (await pg.inner_text('[data-nome-mese]')).lower(), f'{l} {w}px calendario: mese scritto in {l}')
    await larghezza(pg, w, f'{l} prenota')
    await pg.click(f'[data-data="{giorno}"]')
    await pg.wait_for_selector('[data-riepilogo]:not([hidden])')
    riep = await pg.inner_text('[data-righe]')
    ok(D['prezzo'] in riep, f'{l} {w}px riepilogo con il prezzo "{D["prezzo"]}"')
    await pg.fill('#pr-nome', f'Test {l.upper()} {w}'); await pg.fill('#pr-email', f'{l}{w}@example.com'); await pg.fill('#pr-tel', '+44 7700 900000')
    await italiano_rimasto(pg, l, w, 'prenota')
    await pg.check('[data-accetto]')
    await pg.click('[data-paga="prova"]')
    await pg.wait_for_url(re.compile(r'/prenota/prova/'))
    await pg.wait_for_selector('[data-dati] strong')
    await pg.click('[data-esito="ok"]')
    await pg.wait_for_url(re.compile(re.escape(D['esito'])))
    await pg.wait_for_selector(f'text={D["confermata"]}')
    ok(True, f'{l} {w}px pagamento di prova → {D["esito"]} "{D["confermata"]}"')
    ok(D['biglietto'] in await pg.inner_text('[data-esito]'), f'{l} {w}px biglietto con il QR')
    await larghezza(pg, w, f'{l} esito')
    await italiano_rimasto(pg, l, w, 'esito')
    href = await pg.get_attribute('a[download]', 'href')
    ok(href == D['txt'], f'{l} {w}px copia delle condizioni nella lingua ({href})')
    # Email al cliente nella sua lingua, all'ufficio in italiano
    mail = posta(f'{l}{w}@example.com', D['corpo'])
    ok(bool(mail) and mail[0]['subject'].startswith(D['oggetto']), f'{l} {w}px email di conferma in {l}: "{mail[0]["subject"] if mail else "nessuna"}"')
    ok(bool(mail) and D['condFile'] in mail[0]['text'], f'{l} {w}px email con le condizioni in {l}')
    ok(bool(mail) and 'Ciao' not in mail[0]['text'] and 'Codice:' not in mail[0]['text'], f'{l} {w}px email senza frasi italiane')
    ufficio = [e for e in EMAIL if 'Nuova prenotazione' in e['subject'] and f'Test {l.upper()} {w}' in e['text']]
    ok(bool(ufficio) and f'Lingua del cliente: {l.upper()}' in ufficio[0]['text'], f'{l} {w}px avviso all\'ufficio in italiano, con la lingua del cliente')
    await pg.close()

def client():
    cj = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    def chiama(metodo, percorso, corpo=None):
        req = urllib.request.Request(B + percorso, method=metodo, data=json.dumps(corpo).encode() if corpo is not None else None,
                                     headers={'Content-Type': 'application/json', 'Origin': B})
        try:
            with op.open(req) as r:
                for c in cj: c.secure = False  # il cookie è "Secure": su http locale Python non lo rimanderebbe
                return r.status, json.loads(r.read() or b'{}')
        except urllib.error.HTTPError as e: return e.code, json.loads(e.read() or b'{}')
    return chiama

async def main():
    errori = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        giorni = iter([f'2027-05-{d:02d}' for d in range(4, 31)])
        for l in LINGUE:
            for w in (1440, 390):
                ctx = await b.new_context(viewport={'width': w, 'height': 900})
                await prenotazione(ctx, l, w, next(giorni), errori)
                await ctx.close()

        # Link di pagamento dalla gestione, nella lingua del cliente
        adm = client()
        s, _ = adm('POST', '/api/accesso', {'email': 'gestione@prova.it', 'password': 'prova-gestione-123'}); ok(s == 200, 'accesso gestione')
        ctx = await b.new_context(viewport={'width': 390, 'height': 900})
        for i, l in enumerate(LINGUE):
            D = LINGUE[l]
            s, r = adm('POST', '/api/gestione/prenotazioni', {'escursione': 'mezza-giornata', 'turno': 'mattina', 'data': f'2027-06-{10 + i:02d}', 'adulti': 2, 'bambini': 0,
                       'imbarco': 'maddalena', 'nome': f'Link {l}', 'email': f'link-{l}@example.com', 'canale': 'Telefono o WhatsApp', 'link': True, 'ore': 24, 'lingua': l})
            ok(s == 200 and D['paga'] in (r.get('link') or ''), f'{l} link di pagamento dalla gestione → {D["paga"]}')
            if s != 200: continue
            pg = await ctx.new_page()
            await pg.goto(r['link'].replace('https://', 'http://'), wait_until='networkidle')
            await pg.wait_for_selector('[data-metodo]')
            ok(D['paga_titolo'] in await pg.inner_text('h1'), f'{l} 390px link di pagamento: "{D["paga_titolo"]}"')
            await larghezza(pg, 390, f'{l} link di pagamento')
            await italiano_rimasto(pg, l, 390, 'link di pagamento')
            await pg.close()
        await ctx.close()

        # Condizioni: pagina e file
        ctx = await b.new_context(viewport={'width': 390, 'height': 900})
        pg = await ctx.new_page()
        for l, D in LINGUE.items():
            await pg.goto(B + D['condizioni'], wait_until='networkidle')
            ok(await pg.inner_text('h1') == D['condTitolo'], f'{l} pagina delle condizioni "{D["condTitolo"]}"')
            await larghezza(pg, 390, f'{l} condizioni')
            with urllib.request.urlopen(B + D['txt']) as r:
                ok(r.read().decode().startswith(D['condFile']), f'{l} file {D["txt"]}')
        await pg.close(); await ctx.close()

        # Buono regalo e recesso (al computer)
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900})
        for l, D in LINGUE.items():
            pg = await ctx.new_page()
            pg.on('pageerror', lambda e, l=l: errori.append(f'{l} buono {e}'))
            await pg.goto(B + D['buono'], wait_until='networkidle')
            await pg.wait_for_selector('[data-metodo="prova"]')
            await italiano_rimasto(pg, l, 1440, 'buono')
            await pg.fill('#b-nome', f'Regalo {l}'); await pg.fill('#b-email', f'buono-{l}@example.com')
            await pg.check('input[name="accetto"]')
            await pg.click('[data-metodo="prova"]')
            await pg.wait_for_url(re.compile(r'/prenota/prova/'))
            await pg.wait_for_selector('[data-dati] strong')
            await pg.click('[data-esito="ok"]')
            await pg.wait_for_url(re.compile(re.escape(D['buonoEsito'])))
            await pg.wait_for_selector('.buono-carta')
            ok(D['buonoCarta'] in await pg.inner_text('.buono-carta h1'), f'{l} buono pagato → {D["buonoEsito"]}')
            mail = posta(f'buono-{l}@example.com', D['buonoOggetto'])
            ok(bool(mail), f'{l} email del buono in {l}')
            codice = (await pg.inner_text('.buono-carta__codice')).strip()
            await pg.click(f'a[href^="{D["recesso"]}"]')
            await pg.wait_for_url(re.compile(re.escape(D['recesso'])))
            await pg.fill('#r-nome', f'Regalo {l}'); await pg.fill('#r-email', f'buono-{l}@example.com')
            ok((await pg.input_value('#r-codice')) == codice, f'{l} recesso con il codice già scritto')
            await pg.click('[data-recesso] button[type=submit]')
            await pg.wait_for_selector('[data-ricevuta]:not([hidden])')
            ok(D['recessoOk'] in await pg.inner_text('[data-ricevuta]'), f'{l} ricevuta del recesso "{D["recessoOk"]}"')
            ok(bool(posta(f'buono-{l}@example.com', D['recessoOggetto'])), f'{l} email della ricevuta del recesso in {l}')
            await pg.close()
        await ctx.close()
        await b.close()
    print('Errori JavaScript:', errori or 'nessuno')
    if errori: ERRORI.append('errori JavaScript')

asyncio.run(main())
print('TUTTO OK (prenotazione nelle lingue)' if not ERRORI else f'{len(ERRORI)} ERRORI')
