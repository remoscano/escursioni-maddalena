# Controllo automatico di accessibilità (WCAG 2.2 AA, axe-core) di tutte le pagine, a 1440 e 390 px.
# Sito avviato come per le altre prove (porta 8788). Nessun problema stampato = nessun problema trovato.
# Non sostituisce la prova a mano con tastiera e lettore di schermo (vedi CLAUDE.md).
import asyncio, json, sys
from playwright.async_api import async_playwright
import os
# axe-core non è tra le dipendenze del sito: si scarica solo per la prova con  npm i --no-save axe-core@4
AXE = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'node_modules', 'axe-core', 'axe.min.js')).read()
pub = ['/','/escursioni/','/escursioni/giro-delle-isole-la-maddalena/','/escursioni/escursione-mezza-giornata-la-maddalena/','/escursioni/aperitivo-al-tramonto-la-maddalena/','/escursioni/gommone-con-skipper-la-maddalena/','/escursioni/escursione-corsica-da-palau/','/escursioni-la-maddalena-da-palau/','/escursioni-la-maddalena-da-cannigione/','/gommone/','/info-utili/','/domande-frequenti/','/contatti/','/richiesta/','/condizioni/','/recesso/','/privacy/','/cookie/','/404.html']
pren = ['/prenota/','/prenota/?escursione=tour-7-isole','/buono-regalo/','/partner/','/gestione/','/imbarco/','/prenota/paga/?codice=X&t=Y','/prenota/esito/?codice=X&t=Y']
siti = [('sito','http://127.0.0.1:8788',pub+pren)]
async def main():
    risultati = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for nome, base, pagine in siti:
            for w in (1440, 390):
                pg = await b.new_page(viewport={'width': w, 'height': 900})
                for u in pagine:
                    await pg.goto(base+u, wait_until='networkidle')
                    await pg.wait_for_timeout(300)
                    await pg.add_script_tag(content=AXE)
                    r = await pg.evaluate("""async () => { const r = await axe.run(document, {runOnly:{type:'tag', values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}}); return r.violations.map(v => ({id:v.id, impact:v.impact, help:v.help, tags:v.tags.filter(t=>t.startsWith('wcag')), n:v.nodes.length, esempi:v.nodes.slice(0,3).map(n=>({t:n.target.join(' '), m:(n.failureSummary||'').slice(0,220)}))})) }""")
                    for v in r:
                        k = (v['id'])
                        e = risultati.setdefault(k, {'impact':v['impact'],'help':v['help'],'tags':v['tags'],'dove':set(),'esempi':v['esempi']})
                        e['dove'].add(f'{nome} {w} {u}')
                await pg.close()
        await b.close()
    for k,v in sorted(risultati.items(), key=lambda x: ['critical','serious','moderate','minor',None].index(x[1]['impact'])):
        print(f"== {k} [{v['impact']}] {v['help']} {v['tags']}")
        print('   pagine:', len(v['dove']), sorted(v['dove'])[:6])
        for e in v['esempi']: print('   -', e['t'][:120], '|', e['m'].replace('\n',' ')[:200])
asyncio.run(main())
print('Controllo accessibilità finito')
