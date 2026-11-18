# Versione inglese (/en/): pagine a 1440 e 390 px senza scorrimento orizzontale, lingua della pagina, hreflang,
# link interni non rotti, messaggio WhatsApp in inglese, menu del telefono. Sito avviato sulla porta 8788 (vedi LEGGIMI).
import re, sys
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright
BASE='http://127.0.0.1:8788'
pagine=['/en/','/en/boat-tours/','/en/boat-tours/la-maddalena-archipelago-boat-tour/','/en/boat-tours/half-day-boat-tour-la-maddalena/',
 '/en/boat-tours/sunset-boat-tour-la-maddalena/','/en/boat-tours/private-boat-tour-la-maddalena/','/en/boat-tours/corsica-boat-trip-from-la-maddalena/',
 '/en/la-maddalena-boat-tours-from-palau/','/en/la-maddalena-boat-tours-from-cannigione/','/en/boats/','/en/useful-info/','/en/faq/','/en/contact/',
 '/en/enquiry/','/en/privacy/','/en/cookies/','/','/escursioni/giro-delle-isole-la-maddalena/','/gommone/']
errori=[]; visti=set(); link=set()
with sync_playwright() as p:
    b=p.chromium.launch()
    for w in (1440,390):
        pg=b.new_page(viewport={'width':w,'height':900})
        pg.on('pageerror', lambda e: errori.append(f'JS {e}'))
        for u in pagine:
            pg.goto(BASE+u)
            sw=pg.evaluate('document.documentElement.scrollWidth')
            if sw>w: errori.append(f'{w}px {u}: scorrimento orizzontale {sw}')
            if w==1440:
                lang=pg.evaluate('document.documentElement.lang')
                if u.startswith('/en/') and lang!='en': errori.append(f'{u}: lang={lang}')
                alt=pg.eval_on_selector_all('link[hreflang]','e=>e.map(x=>x.hreflang+" "+x.getAttribute("href"))')
                if len(alt)!=3: errori.append(f'{u}: hreflang {alt}')
                for h in pg.eval_on_selector_all('a[href]','e=>e.map(x=>x.getAttribute("href"))'):
                    if h.startswith('/') : link.add(urljoin(u,h).split('#')[0])
        if w==390:
            for u in ['/en/','/en/boat-tours/la-maddalena-archipelago-boat-tour/','/en/enquiry/']:
                pg.goto(BASE+u); pg.screenshot(path=f'/tmp/390{u.replace("/","_")}.png', full_page=False)
        else:
            for u in ['/en/','/en/boat-tours/la-maddalena-archipelago-boat-tour/']:
                pg.goto(BASE+u); pg.screenshot(path=f'/tmp/1440{u.replace("/","_")}.png', full_page=False)
    # modulo WhatsApp in inglese
    pg=b.new_page(viewport={'width':390,'height':900})
    pg.goto(BASE+'/en/enquiry/?escursione=tramonto')
    pg.fill('input[name=nome]','Anna'); pg.fill('input[name=data]','2027-07-14')
    msg=pg.inner_text('[data-anteprima]'); print(msg)
    if 'Sunset aperitivo' not in msg or 'Wednesday' not in msg: errori.append('messaggio WhatsApp inglese: '+msg)
    # menu a tendina delle lingue (1440 px): dalla pagina italiana alla stessa pagina in inglese
    pc=b.new_page(viewport={'width':1440,'height':900})
    pc.goto(BASE+'/gommone/'); pc.click('.lingue__bottone'); pc.click('.lingue__elenco a[lang=en]')
    if not pc.url.endswith('/en/boats/'): errori.append('tendina lingue: '+pc.url)
    # menu del telefono: etichetta inglese
    pg.goto(BASE+'/en/'); pg.click('[data-apri-menu]')
    if pg.inner_text('[data-apri-menu] .sr-only')!='Close the menu': errori.append('menu: etichetta')
    for l in sorted(link):
        r=pg.request.get(BASE+l, max_redirects=0)
        if r.status>=400: errori.append(f'link rotto {l} {r.status}')
    b.close()
print('\n'.join(errori) or 'TUTTO OK'); print(len(link),'link interni controllati')
