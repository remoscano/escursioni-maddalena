# Recesso online dai buoni regalo (art. 54-bis del Codice del consumo): /api/recesso e pagina /recesso/.
# Sito locale sulla porta 8788 con PAGAMENTI_PROVA=1 (i buoni di prova si rimborsano con il pagamento simulato).
import json, subprocess, sys, urllib.request, asyncio
B = 'http://127.0.0.1:8788'
ok = lambda c, m: print(('OK  ' if c else 'ERR ') + m) or (c or sys.exit(1))
def sql(q): subprocess.run(['npx', 'wrangler', 'd1', 'execute', 'DB', '--local', '--command', q], capture_output=True, check=True)
def post(corpo):
    r = urllib.request.Request(B + '/api/recesso', json.dumps(corpo).encode(), {'Content-Type': 'application/json', 'Origin': B})
    try:
        with urllib.request.urlopen(r) as x: return x.status, json.loads(x.read())
    except urllib.error.HTTPError as e: return e.code, json.loads(e.read())

sql("DELETE FROM codici_sconto WHERE codice LIKE 'BR-PROVA%'")
sql("""INSERT INTO codici_sconto (codice,tipo,valore,saldo,stato,token,acquirente,email,metodo,pagato,creato_da,al) VALUES
 ('BR-PROVA001','buono',10000,10000,'attivo','t1','Mario Rossi','mario@example.com','prova',10000,'cliente','2027-11-16'),
 ('BR-PROVA002','buono',10000,5000,'attivo','t2','Anna','anna@example.com','prova',10000,'cliente','2027-11-16'),
 ('BR-PROVA004','buono',10000,10000,'attivo','t4','Sara','sara@example.com','prova',10000,'cliente','2027-11-16')""")
sql("INSERT INTO codici_sconto (codice,tipo,valore,saldo,stato,token,acquirente,email,metodo,pagato,creato_da,al,creato_il) VALUES ('BR-PROVA003','buono',10000,10000,'attivo','t3','Luca','luca@example.com','prova',10000,'cliente','2027-11-16','2026-01-01T10:00:00Z')")

s, r = post({'codice': 'BR-PROVA001', 'nome': 'Mario Rossi', 'email': 'altro@example.com'}); ok(s == 404, 'email diversa → rifiutato senza dire se il codice esiste')
s, r = post({'codice': 'br-prova001', 'nome': 'Mario Rossi', 'email': 'Mario@Example.com'}); ok(s == 200 and r['rimborsoFatto'] and 'BR-PROVA001' in r['dichiarazione'] and r['inviataIl'], 'recesso entro 14 giorni → buono annullato, rimborso partito, ricevuta con data e ora')
s, r = post({'codice': 'BR-PROVA001', 'nome': 'Mario Rossi', 'email': 'mario@example.com'}); ok(s == 409, 'secondo recesso sullo stesso buono → rifiutato')
s, r = post({'codice': 'BR-PROVA002', 'nome': 'Anna', 'email': 'anna@example.com'}); ok(s == 409, 'buono già usato in parte → rifiutato')
s, r = post({'codice': 'BR-PROVA003', 'nome': 'Luca', 'email': 'luca@example.com'}); ok(s == 409 and 'finito' in r['errore'], 'oltre i 14 giorni → rifiutato')
s, r = post({'codice': 'BR-PROVA004', 'nome': '', 'email': 'sara@example.com'}); ok(s == 400, 'senza nome → rifiutato')

from playwright.async_api import async_playwright
async def pagina():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w in (1440, 390):
            pg = await b.new_page(viewport={'width': w, 'height': 900})
            await pg.goto(B + '/recesso/?codice=BR-PROVA004', wait_until='networkidle')
            ok(await pg.input_value('#r-codice') == 'BR-PROVA004', f'{w}px: codice già scritto dal link del buono')
            ok(await pg.evaluate('document.documentElement.scrollWidth') <= w, f'{w}px: nessuno scorrimento orizzontale')
            ok(await pg.locator('h1', has_text='Recedi dal contratto qui').count() == 1 and await pg.locator('button', has_text='Conferma recesso').count() == 1, f'{w}px: "Recedi dal contratto qui" e "Conferma recesso"')
            if w == 390:
                await pg.fill('#r-nome', 'Sara Bianchi'); await pg.fill('#r-email', 'sara@example.com')
                await pg.click('button:has-text("Conferma recesso")')
                await pg.wait_for_selector('text=Recesso ricevuto')
                ok(await pg.locator('text=Inviata il').count() == 1, '390px: ricevuta a schermo con data e ora')
            await pg.close()
        await b.close()
asyncio.run(pagina())
sql("DELETE FROM codici_sconto WHERE codice LIKE 'BR-PROVA%'")
print('TUTTO OK (recesso)')
