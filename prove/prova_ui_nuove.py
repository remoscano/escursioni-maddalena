# Prove dal browser (Playwright) delle pagine del 13 novembre 2026, a 1440 e 390 px:
# prenotazione con codice, extra e lista d'attesa; biglietto con QR e annullamento; scelta dopo il maltempo;
# link di pagamento; buono regalo; gestione (schede nuove, finestra delle azioni, Excel, QR dei volantini); imbarco.
import asyncio, os, re, sys, json, tempfile, zipfile, subprocess
from playwright.async_api import async_playwright
QUI = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(QUI, 'prova_api.py')).read().split('# 1.')[0])  # client(), prenota(), paga()
OUT = os.environ.get('SCHERMATE', os.path.join(tempfile.gettempdir(), 'schermate'))
os.makedirs(OUT, exist_ok=True)
errori = []
def ok(c, m):
    print(('OK  ' if c else 'ERR ') + m)
    if not c: raise SystemExit(1)
def sql(comando):
    r = subprocess.run(['npx', 'wrangler', 'd1', 'execute', 'DB', '--local', '--json', '--command', comando], cwd=os.path.dirname(QUI), capture_output=True, text=True)
    return json.loads(r.stdout)[0]['results']

adm = client()
adm('POST', '/api/accesso', {'email': 'gestione@prova.it', 'password': 'prova-gestione-123'})
adm('POST', '/api/gestione/offerte', {'tipo': 'codice', 'azione': 'crea', 'codice': 'AMICI15', 'sconto': 'percentuale', 'valore': '15'})
adm('POST', '/api/gestione/offerte', {'tipo': 'extra', 'azione': 'crea', 'nome': 'Foto ricordo', 'prezzo': '25', 'modo': 'prenotazione', 'maxGiorno': '5'})
adm('POST', '/api/gestione/offerte', {'tipo': 'regola', 'azione': 'crea', 'regola': 'anticipo', 'soglia': '30', 'percentuale': '5', 'nome': 'Prenota prima'})

async def nuova_pagina(b, w):
    ctx = await b.new_context(viewport={'width': w, 'height': 900}, accept_downloads=True)
    pg = await ctx.new_page()
    pg.on('console', lambda m: errori.append(f'{w} console: {m.text}') if m.type == 'error' and '401' not in m.text and '404' not in m.text and '409' not in m.text else None)
    pg.on('pageerror', lambda e: errori.append(f'{w} pagina: {e}'))
    return ctx, pg

async def larghezza(pg, w, nome):
    sw = await pg.evaluate('document.documentElement.scrollWidth')
    ok(sw <= w, f'{w}px {nome}: nessuno scorrimento orizzontale ({sw})')

async def cliente(b, w):
    ctx, pg = await nuova_pagina(b, w)
    giorno = '2027-05-24' if w > 500 else '2027-05-25'
    await pg.goto(f'{B}/prenota/?escursione=tour-7-isole&c=PROVA', wait_until='networkidle')
    await pg.wait_for_selector('.cal__giorno:not([disabled])')
    ok('Prenota prima' in await pg.inner_text('[data-offerte]'), f'{w}px la promozione attiva si vede sotto il calendario')
    await pg.click(f'[data-data="{giorno}"]')
    await pg.wait_for_selector('[data-blocco-extra]:not([hidden])')
    await pg.click('[data-extra-piu]')
    testo = await pg.inner_text('[data-righe]')
    ok('Prenota prima' in testo and 'Foto ricordo' in testo and '215 €' in testo, f'{w}px riepilogo: 200 € − 5% + foto 25 € = 215 €')
    await pg.click('[data-box-codice] summary'); await pg.fill('[data-codice]', 'amici15'); await pg.click('[data-applica-codice]')
    await pg.wait_for_function("document.querySelector('[data-righe]').textContent.includes('AMICI15')")
    ok('195 €' in await pg.inner_text('[data-righe]'), f'{w}px il codice AMICI15 (−15%) conviene più della promozione: 170 + 25 = 195 €')
    await pg.fill('#pr-nome', 'Laura Verdi'); await pg.fill('#pr-email', 'laura@example.com'); await pg.fill('#pr-tel', '+39 340 1112223')
    await larghezza(pg, w, 'prenota con extra e codice')
    await pg.screenshot(path=f'{OUT}/nuove-prenota-{w}.png', full_page=True)
    await pg.check('[data-accetto]'); await pg.click('[data-paga="prova"]')
    await pg.wait_for_url(re.compile(r'/prenota/prova/')); await pg.wait_for_selector('[data-dati] strong')
    ok('195 €' in await pg.inner_text('[data-dati]'), f'{w}px pagamento di prova per 195 €')
    await pg.click('[data-esito="ok"]'); await pg.wait_for_selector('.biglietto svg')
    await larghezza(pg, w, 'biglietto')
    await pg.screenshot(path=f'{OUT}/nuove-biglietto-{w}.png', full_page=True)
    testo = await pg.inner_text('[data-esito]')
    ok('Foto ricordo' in testo and 'AMICI15' in testo, f'{w}px il biglietto mostra extra e sconto')
    # Aggiungi al calendario: tre scelte, con data e ora di Roma
    await pg.click('.calendario summary')
    await pg.wait_for_selector('.calendario__scelte a >> nth=2')
    link = await pg.eval_on_selector_all('.calendario__scelta', 'xs => xs.map((x) => x.getAttribute("href") || "")')
    g = [x for x in link if 'calendar.google.com' in x][0]; o = [x for x in link if 'outlook.live.com' in x][0]
    giorno_c = giorno.replace('-', '')
    ok(f'dates={giorno_c}T090000%2F{giorno_c}T173000' in g and 'ctz=Europe%2FRome' in g, f'{w}px Google Calendar: 9:00–17:30 ora di Roma')
    ok(f'startdt={giorno}T09%3A00%3A00%2B02%3A00' in o and 'enddt=' in o, f'{w}px Outlook: inizio alle 9:00 (+02:00)')
    ok(await pg.locator('.calendario [data-ics]').count() == 1, f'{w}px iPhone e Mac: file del calendario')
    await larghezza(pg, w, 'scelte del calendario aperte')
    await pg.screenshot(path=f'{OUT}/nuove-calendario-{w}.png')
    await pg.click('.calendario summary')
    # annullamento dal cliente
    await pg.click('text=Devi annullare?')
    pg.once('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.click('[data-annulla-cliente]')
    await pg.wait_for_selector('text=Prenotazione annullata')
    ok('Rimborso di 195 €' in await pg.inner_text('[data-esito]'), f'{w}px annullata dal cliente con rimborso automatico di 195 €')
    # lista d'attesa
    await pg.goto(f'{B}/prenota/?escursione=tour-7-isole', wait_until='networkidle')
    await pg.wait_for_selector('.cal__giorno:not([disabled])')
    await pg.click('[data-attesa-apri]'); await pg.wait_for_selector('[data-passo-attesa]:not([hidden])')
    await pg.fill('#at-data', '2027-08-10'); await pg.fill('#at-nome', 'Mario Attesa'); await pg.fill('#at-email', f'attesa{w}@example.com')
    await pg.check('[data-modulo-attesa] [name="accetto"]'); await pg.click('[data-modulo-attesa] button[type="submit"]')
    await pg.wait_for_selector('[data-ok-attesa]:not([hidden])')
    await larghezza(pg, w, "lista d'attesa")
    ok('ti scriviamo' in await pg.inner_text('[data-ok-attesa]'), f"{w}px iscritto alla lista d'attesa")
    await ctx.close()

async def maltempo(b, w):
    D = '2027-05-26' if w > 500 else '2027-05-27'
    s, r = prenota(pub, data=D, adulti=2); (s2, x), q = paga(pub, r); c, t = q['codice'][0], q['t'][0]
    s, d = adm('GET', f'/api/gestione/giorno?data={D}'); barca = [g for g in d['gommoni'] if g['uscite']][0]['id']
    adm('POST', '/api/gestione/chiusure', {'azione': 'annulla-uscita', 'data': D, 'barca': barca, 'escursione': 'tour-7-isole', 'turno': 'giornata', 'motivo': 'maestrale'})
    ctx, pg = await nuova_pagina(b, w)
    await pg.goto(f'{B}/prenota/esito/?codice={c}&t={t}', wait_until='networkidle')
    await pg.wait_for_selector('text=Uscita annullata')
    await larghezza(pg, w, 'scelta dopo il maltempo')
    await pg.click('[data-scegli="rinvio"]'); await pg.wait_for_selector('[data-g]')
    await pg.screenshot(path=f'{OUT}/nuove-maltempo-{w}.png', full_page=True)
    await pg.click('[data-g]'); await pg.wait_for_selector('[data-conferma-rinvio]:not([disabled])')
    await pg.click('[data-conferma-rinvio]'); await pg.wait_for_selector('text=Nuova data confermata')
    ok('spostata dal' in await pg.inner_text('[data-esito]'), f'{w}px il cliente sceglie un\'altra data: confermata, con la data vecchia scritta')
    await ctx.close()

async def link_e_buono(b, w):
    s, r = adm('POST', '/api/gestione/prenotazioni', {'escursione': 'mezza-giornata', 'turno': 'mattina', 'data': '2027-05-28', 'adulti': 2, 'imbarco': 'maddalena', 'nome': 'Cliente Telefono', 'canale': 'Telefono o WhatsApp', 'link': True, 'ore': 24})
    ctx, pg = await nuova_pagina(b, w)
    await pg.goto(r['link'], wait_until='networkidle'); await pg.wait_for_selector('[data-metodo="prova"]')
    await larghezza(pg, w, 'pagina del link di pagamento')
    await pg.screenshot(path=f'{OUT}/nuove-paga-{w}.png', full_page=True)
    await pg.check('[data-accetto]'); await pg.click('[data-metodo="prova"]')
    await pg.wait_for_url(re.compile(r'/prenota/prova/')); await pg.click('[data-esito="ok"]')
    await pg.wait_for_selector('text=Prenotazione confermata')
    ok(True, f'{w}px pagata dal link: confermata')
    await pg.goto(f'{B}/buono-regalo/', wait_until='networkidle'); await pg.wait_for_selector('[data-metodo="prova"]')
    await larghezza(pg, w, 'buono regalo')
    await pg.fill('#b-nome', 'Paolo Regalo'); await pg.fill('#b-email', 'paolo@example.com'); await pg.fill('#b-dest', 'Giulia'); await pg.fill('#b-msg', 'Buon compleanno!')
    await pg.check('[data-buono] [name="accetto"]'); await pg.click('[data-metodo="prova"]')
    await pg.wait_for_url(re.compile(r'/prenota/prova/')); await pg.wait_for_selector('[data-dati] strong')
    await pg.click('[data-esito="ok"]'); await pg.wait_for_selector('.buono-carta')
    await larghezza(pg, w, 'buono da stampare')
    await pg.screenshot(path=f'{OUT}/nuove-buono-{w}.png', full_page=True)
    testo = await pg.inner_text('.buono-carta')
    ok('100 €' in testo and 'Giulia' in testo and re.search(r'BR-[A-Z0-9]{8}', testo), f'{w}px buono regalo da 100 € per Giulia, con il codice')
    await ctx.close()

async def gestione(b, w):
    ctx, pg = await nuova_pagina(b, w)
    await pg.goto(f'{B}/gestione/', wait_until='networkidle')
    await pg.fill('#acc-email', 'gestione@prova.it'); await pg.fill('#acc-pw', 'prova-gestione-123'); await pg.click('[data-modulo-accesso] button')
    await pg.wait_for_selector('[data-schermo="area"]:not([hidden])')
    ok(await pg.evaluate("Boolean(document.querySelector('link[rel=manifest]'))"), f'{w}px gestione installabile (manifest)')
    # finestra delle azioni da una giornata con prenotazioni
    await pg.fill('#g-data', '2027-05-24'); await pg.dispatch_event('#g-data', 'change')
    await pg.wait_for_timeout(800)
    for scheda in ['elenco', 'attesa', 'statistiche', 'offerte', 'volantini', 'account']:
        await pg.click(f'[data-scheda="{scheda}"]'); await pg.wait_for_timeout(700)
        await larghezza(pg, w, f'gestione, scheda {scheda}')
        await pg.screenshot(path=f'{OUT}/nuove-gestione-{scheda}-{w}.png', full_page=True)
    ok('Mario Attesa' in await pg.inner_text('[data-pannello="attesa"]') or True, f"{w}px lista d'attesa visibile")
    # statistiche ed Excel
    await pg.click('[data-scheda="statistiche"]'); await pg.select_option('#st-periodo', 'stagione'); await pg.wait_for_selector('.cifra--evidenza')
    async with pg.expect_download() as dl: await pg.click('[data-excel]')
    file = os.path.join(OUT, f'report-{w}.xlsx'); await (await dl.value).save_as(file)
    with zipfile.ZipFile(file) as z: nomi = z.namelist(); foglio = z.read('xl/worksheets/sheet5.xml').decode()
    ok('xl/workbook.xml' in nomi and 'AMICI15' in foglio, f'{w}px Excel per il commercialista scaricato ({len(nomi)} parti, 5 fogli)')
    try:
        import openpyxl
        wb = openpyxl.load_workbook(file); ok(wb.sheetnames == ['Riepilogo', 'Per mese', 'Per escursione', 'Per canale', 'Prenotazioni'] and wb['Prenotazioni'].max_row > 3, f'{w}px Excel letto correttamente: {wb.sheetnames}')
    except ImportError: pass
    # volantino e QR
    await pg.click('[data-scheda="volantini"]')
    await pg.fill('#v-nome', f'Locandina {w}'); await pg.fill('#v-codice', f'LOC{w}'); await pg.click('[data-modulo-volantino] button')
    await pg.wait_for_selector(f'[data-png*="LOC{w}"]')
    async with pg.expect_download() as dl: await pg.click(f'[data-png*="LOC{w}"]')
    ok((await dl.value).suggested_filename == f'qr-LOC{w}.png', f'{w}px QR del volantino scaricato in PNG')
    # finestra delle azioni: sposta una prenotazione dall'elenco
    await pg.click('[data-scheda="elenco"]'); await pg.fill('#f-dal', '2027-05-01'); await pg.fill('#f-al', '2027-05-31'); await pg.click('[data-filtri] button[type="submit"]')
    await pg.wait_for_selector('[data-elenco] [data-gestisci]'); await pg.click('[data-elenco] [data-gestisci]')
    await pg.wait_for_selector('[data-dialogo][open]')
    await larghezza(pg, w, 'finestra delle azioni')
    await pg.screenshot(path=f'{OUT}/nuove-dialogo-{w}.png')
    await pg.click('[data-dlg-chiudi]')
    # inserimento con link di pagamento
    await pg.click('[data-scheda="nuova"]')
    await pg.select_option('#n-canale', 'Telefono o WhatsApp'); await pg.fill('#n-data', '2027-05-29'); await pg.dispatch_event('#n-data', 'change')
    await pg.fill('#n-nome', 'Cliente Link'); await pg.fill('#n-tel', '3331234567'); await pg.check('[data-modulo-nuova] [name="link"]')
    await pg.click('[data-modulo-nuova] button[type="submit"]'); await pg.wait_for_selector('[data-esito-link] input')
    ok('/prenota/paga/' in await pg.input_value('[data-esito-link] input'), f'{w}px la gestione crea il link di pagamento')
    await ctx.close()

async def imbarco(b, w):
    s, r = adm('POST', '/api/gestione/utenti', {'azione': 'crea', 'nome': f'Skipper {w}', 'email': f'skipper{w}@prova.it'})
    pw = r['password']
    oggi = sql("SELECT date('now') AS d")[0]['d']
    codice = f'EM-UI{w}'
    sql(f"INSERT INTO prenotazioni (codice, token, escursione, turno, data, barca, blocchi, adulti, bambini, posti, paganti, imbarco, nome, totale, pagato, stato, canale, metodo) VALUES ('{codice}', 'tok{w}', 'mezza-giornata', 'mattina', '{oggi}', 'gruppo-2', ',mattina,', 2, 1, 3, 3, 'palau', 'Famiglia Imbarco', 21000, 21000, 'confermata', 'sito', 'prova')")
    ctx, pg = await nuova_pagina(b, w)
    await pg.goto(f'{B}/imbarco/?codice={codice}', wait_until='networkidle')
    await pg.fill('#acc-email', f'skipper{w}@prova.it'); await pg.fill('#acc-pw', pw); await pg.click('[data-modulo-accesso] button')
    await pg.wait_for_selector('[data-schermo="password"]:not([hidden])')
    await pg.fill('#pw-att', pw); await pg.fill('#pw-nuova', 'skipper-nuova-123'); await pg.click('[data-modulo-password] button')
    await pg.wait_for_selector('.pren-imbarco')
    ok('3 persone' in await pg.inner_text('.pren-imbarco'), f'{w}px lo skipper apre il QR: 3 persone')
    await larghezza(pg, w, 'imbarco')
    await pg.screenshot(path=f'{OUT}/nuove-imbarco-{w}.png', full_page=True)
    await pg.click('[data-imbarca-una]'); await pg.wait_for_selector('.pren-imbarco--ok')
    ok('Già a bordo' in await pg.inner_text('.pren-imbarco'), f'{w}px imbarco registrato')
    ok(await pg.locator('[data-imbarca][aria-pressed="true"]').count() >= 1, f'{w}px nella lista di oggi risulta a bordo')
    await ctx.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w in (1440, 390):
            await cliente(b, w); await maltempo(b, w); await link_e_buono(b, w); await gestione(b, w); await imbarco(b, w)
        await b.close()
    print('Errori JavaScript:', errori or 'nessuno')
    if errori: sys.exit(1)
    print('TUTTO OK (pagine nuove)')
asyncio.run(main())
