# Sito nelle lingue straniere (inglese, spagnolo, francese, tedesco): tutte le pagine tradotte a 1440 e 390 px senza
# scorrimento orizzontale, lingua della pagina, hreflang verso tutte le lingue, testata su una riga, link interni non rotti,
# messaggio WhatsApp nella lingua giusta, menu a tendina delle lingue. Sito avviato sulla porta 8788 (vedi LEGGIMI).
import os, re
from urllib.parse import urljoin
from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:8788'
DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist')
LINGUE = ['en', 'es', 'fr', 'de']
# Pagine tradotte prese dalla cartella dist/ (tutte le index.html sotto /en/, /es/, /fr/, /de/).
pagine = []
for l in LINGUE:
    for radice, _, file in os.walk(os.path.join(DIST, l)):
        if 'index.html' in file:
            pagine.append('/' + os.path.relpath(radice, DIST).replace(os.sep, '/') + '/')
pagine.sort()
# Messaggio WhatsApp: saluto e data nella lingua giusta (14 luglio 2027 è un mercoledì).
attesi = {
    'en': ('Hi Escursioni La Maddalena', 'Wednesday'),
    'es': ('¡Hola Escursioni La Maddalena', 'miércoles'),
    'fr': ('Bonjour Escursioni La Maddalena', 'mercredi'),
    'de': ('Hallo Escursioni La Maddalena', 'Mittwoch'),
}
richiesta = {'en': '/en/enquiry/', 'es': '/es/solicitud/', 'fr': '/fr/demande/', 'de': '/de/anfrage/'}

errori, link = [], set()
with sync_playwright() as p:
    b = p.chromium.launch()
    for w in (1440, 1241, 390):
        pg = b.new_page(viewport={'width': w, 'height': 900})
        pg.on('pageerror', lambda e: errori.append(f'JS {e}'))
        for u in pagine:
            pg.goto(BASE + u)
            sw = pg.evaluate('document.documentElement.scrollWidth')
            if sw > w: errori.append(f'{w}px {u}: scorrimento orizzontale {sw}')
            h = pg.evaluate("document.querySelector('.testata__barra').getBoundingClientRect().height")
            if h > 100: errori.append(f'{w}px {u}: testata su due righe ({round(h)} px)')
            if w == 1440:
                lingua = u.split('/')[1]
                if pg.evaluate('document.documentElement.lang') != lingua: errori.append(f'{u}: lang sbagliato')
                alt = pg.eval_on_selector_all('link[hreflang]', 'e=>e.map(x=>x.hreflang)')
                if sorted(alt) != sorted(['it', 'en', 'es', 'fr', 'de', 'x-default']): errori.append(f'{u}: hreflang {alt}')
                for h in pg.eval_on_selector_all('a[href]', 'e=>e.map(x=>x.getAttribute("href"))'):
                    if h.startswith('/'): link.add(urljoin(u, h).split('#')[0])
        pg.close()
    pg = b.new_page(viewport={'width': 390, 'height': 900})
    for l, (saluto, giorno) in attesi.items():
        pg.goto(BASE + richiesta[l] + '?escursione=tramonto')
        pg.fill('input[name=nome]', 'Anna'); pg.fill('input[name=data]', '2027-07-14')
        msg = pg.inner_text('[data-anteprima]')
        if saluto not in msg or giorno not in msg.lower() and giorno not in msg: errori.append(f'messaggio WhatsApp {l}: {msg}')
    # Menu a tendina: dalla pagina italiana dei gommoni alla stessa pagina in tedesco.
    pc = b.new_page(viewport={'width': 1440, 'height': 900})
    pc.goto(BASE + '/gommone/'); pc.click('.lingue__bottone'); pc.click('.lingue__elenco a[lang=de]')
    if not pc.url.endswith('/de/unsere-boote/'): errori.append('tendina lingue: ' + pc.url)
    for l in sorted(link):
        r = pg.request.get(BASE + l, max_redirects=0)
        if r.status >= 400: errori.append(f'link rotto {l} {r.status}')
    b.close()
print('\n'.join(errori) or 'TUTTO OK')
print(len(pagine), 'pagine tradotte,', len(link), 'link interni controllati')
