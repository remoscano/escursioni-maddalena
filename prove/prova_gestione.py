import random, json, urllib.request, urllib.parse, http.cookiejar, sys, subprocess
import os
QUI = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(QUI, 'prova_api.py')).read().split('# 1.')[0])  # riusa client(), prenota(), paga()
ok = lambda c, m: print(('OK  ' if c else 'ERR ') + m) or (c or sys.exit(1))
anon = client()
s, r = anon('GET', '/api/gestione/giorno?data=2027-06-10'); ok(s == 401, 'gestione senza accesso → 401')
adm = client()
s, r = adm('POST', '/api/accesso', {'email': 'gestione@prova.it', 'password': 'sbagliata'}); ok(s == 401, 'password sbagliata → 401')
s, r = adm('POST', '/api/accesso', {'email': 'gestione@prova.it', 'password': 'prova-gestione-123'}); ok(s == 200 and r['ruolo'] == 'gestione', 'accesso gestione')
s, r = adm('POST', '/api/accesso', {'email': 'gestione@prova.it', 'password': 'x'}, origin=False); ok(s == 403, 'accesso senza Origin → 403')

# prenotazione da altra piattaforma, anche per una data già piena → rifiutata; su data libera → ok
s, r = adm('POST', '/api/gestione/prenotazioni', {'escursione': 'tour-7-isole', 'turno': 'giornata', 'data': '2027-06-10', 'adulti': 2, 'imbarco': 'palau', 'nome': 'Ospite GYG', 'canale': 'GetYourGuide'}); ok(s == 409, f'piattaforma su giorno pieno → {r.get("errore")}')
s, r = adm('POST', '/api/gestione/prenotazioni', {'escursione': 'tour-7-isole', 'turno': 'giornata', 'data': '2027-06-12', 'adulti': 4, 'imbarco': 'maddalena', 'nome': 'Ospite GYG', 'canale': 'GetYourGuide', 'rifEsterno': 'GYG123', 'importo': '380', 'pagato': True}); ok(s == 200, f'prenotazione GetYourGuide inserita → {r}')
s, d = adm('GET', '/api/gestione/giorno?data=2027-06-12'); u = d['gommoni'][0]['uscite'][0]; ok(u['persone'] == 4 and u['prenotazioni'][0]['totale'] == 380 and u['prenotazioni'][0]['rifEsterno'] == 'GYG123', f'giorno 12 giugno: {u["escursione"]}, {u["persone"]} persone, importo {u["prenotazioni"][0]["totale"]} €')
s, r = adm('POST', '/api/gestione/prenotazioni', {'escursione': 'tour-7-isole', 'turno': 'giornata', 'data': '2027-06-12', 'adulti': 2, 'imbarco': 'palau', 'nome': 'Sbagliato', 'canale': 'Inventato'}); ok(s == 400, 'canale non valido → 400')

# maltempo: annulla l'uscita del gommone 1 il 10 giugno
s, d = adm('GET', '/api/gestione/giorno?data=2027-06-10'); n_prima = sum(len(u['prenotazioni']) for g in d['gommoni'] for u in g['uscite'])
s, r = adm('POST', '/api/gestione/chiusure', {'azione': 'annulla-uscita', 'data': '2027-06-10', 'barca': 'gruppo-1', 'escursione': 'tour-7-isole', 'turno': 'giornata', 'motivo': 'Maestrale forte'}); ok(s == 200 and len(r['annullate']) >= 1 and all('/prenota/esito/' in a['link'] for a in r['annullate']), f'uscita annullata per maltempo: {len(r["annullate"])} clienti da avvisare, ognuno con il suo link per scegliere')
s, d = adm('GET', '/api/gestione/giorno?data=2027-06-10'); g1 = d['gommoni'][0]; ok(not g1['uscite'] and len(g1['chiusure']) == 3, 'gommone 1 chiuso tutto il giorno, nessuna uscita attiva')
ok(any(p['recupero'] == 'proposto' for p in d['annullate']), 'chi aveva pagato aspetta di scegliere tra rinvio e rimborso')
s, r = anon('POST', '/api/prenota', {'escursione': 'mezza-giornata', 'turno': 'mattina', 'data': '2027-06-10', 'adulti': 2, 'imbarco': 'palau', 'nome': 'X', 'email': 'x@example.com', 'telefono': '3330000000', 'metodo': 'prova', 'accetto': True}); ok(s == 409, 'sul gommone chiuso non si prenota più')
s, l = adm('GET', '/api/gestione/prenotazioni?stato=scelta'); da = l['prenotazioni']; ok(len(da) >= 1, f'elenco "aspettano la scelta": {len(da)}')
s, r = adm('POST', '/api/gestione/prenotazione', {'id': da[0]['id'], 'azione': 'annulla', 'modo': 'manuale'}); ok(s == 409, 'una prenotazione già annullata non si annulla di nuovo')
s, c = adm('GET', '/api/gestione/chiusure?dal=2027-06-10&al=2027-06-10'); s, r = adm('DELETE', f'/api/gestione/chiusure?id={c["chiusure"][0]["id"]}', None); ok(s == 200, 'riapertura di un blocco')

# strutture partner
s, r = adm('POST', '/api/gestione/strutture', {'azione': 'crea', 'nome': 'Hotel Prova Palau', 'email': 'hotel@prova.it', 'telefono': '+39 0789 000000', 'referente': 'Anna'}); ok(s == 200 and r['password'], f'struttura creata: codice {r.get("codice")}')
codice, pw = r['codice'], r['password']; pid = r['id']
s, r = adm('POST', '/api/gestione/strutture', {'azione': 'crea', 'nome': 'Doppione', 'email': 'hotel@prova.it'}); ok(s == 409, 'stessa email due volte → 409')
hot = client()
s, r = hot('POST', '/api/accesso', {'email': 'hotel@prova.it', 'password': pw}); ok(s == 200 and r['ruolo'] == 'partner' and r['deveCambiare'], 'accesso struttura (deve cambiare password)')
s, r = hot('GET', '/api/gestione/giorno?data=2027-06-10'); ok(s == 403, 'la struttura non vede la gestione')
s, r = hot('POST', '/api/accesso/password', {'attuale': pw, 'nuova': 'corta'}); ok(s == 400, 'password troppo corta → 400')
s, r = hot('POST', '/api/accesso/password', {'attuale': pw, 'nuova': 'hotel-nuova-password'}); ok(s == 200, 'password cambiata')
s, d = hot('GET', '/api/disponibilita?escursione=tour-7-isole&mese=2027-07'); ok(d['partner'] is None, 'struttura collegata sul sito pubblico: nessun "stai prenotando tramite"')
s, d = hot('GET', '/api/disponibilita?escursione=tour-7-isole&mese=2027-07&area=struttura'); ok(d['partner'] and d['partner']['collegato'], 'dalla sua area la struttura prenota a suo nome')
s, r = hot('POST', '/api/prenota', {'area': 'struttura', 'escursione': 'tour-7-isole', 'turno': 'giornata', 'data': '2027-07-20', 'adulti': 2, 'imbarco': 'palau', 'nome': 'Ospite Hotel', 'email': 'o@example.com', 'telefono': '3331112222', 'metodo': 'prova', 'accetto': True}); (s2, r2), q = paga(hot, r); ok(r2['stato'] == 'confermata', 'la struttura prenota per un ospite (250 €)')
s, r = anon('POST', '/api/prenota', {'escursione': 'mezza-giornata', 'turno': 'mattina', 'data': '2027-07-21', 'adulti': 1, 'bambini': 1, 'imbarco': 'maddalena', 'nome': 'Ospite dal link', 'email': 'l@example.com', 'telefono': '3332223333', 'metodo': 'prova', 'accetto': True, 'partner': codice.lower()}); (s2, r2), q = paga(anon, r); ok(r2['stato'] == 'confermata', 'ospite prenota dal link della struttura (75 + 70 = 145 €)')
s, d = hot('GET', '/api/partner/riepilogo'); t = d['totali']
ok(t['venduto'] == 395 and t['inArrivo'] == round(395 * 0.20, 2), f'struttura: venduto {t["venduto"]} €, provvigione in arrivo {t["inArrivo"]} €')
ok(d['prenotazioni'][0]['nome'] is None and d['prenotazioni'][0]['daLink'] and d['prenotazioni'][1]['nome'] == 'Ospite Hotel', 'il nome dell\'ospite dal link non si vede, quello inserito dalla struttura sì')

# provvigioni: una prenotazione passata (ottobre 2026) per provare il pagamento della quindicina
subprocess.run(['npx', 'wrangler', 'd1', 'execute', 'DB', '--local', '--command', f"INSERT INTO prenotazioni (codice, token, escursione, turno, data, barca, blocchi, adulti, posti, paganti, imbarco, nome, totale, pagato, provvigione, stato, canale, partner_id, metodo) VALUES ('EM-PASSAT', 'x', 'tour-7-isole', 'giornata', '2026-10-05', 'gruppo-1', ',mattina,', 2, 2, 2, 'palau', 'Ospite ottobre', 20000, 20000, 3000, 'confermata', 'struttura', {pid}, 'prova')"], cwd=os.path.dirname(QUI), capture_output=True)
s, d = adm('GET', '/api/gestione/provvigioni?dal=2026-10-01'); h = [x for x in d['strutture'] if x['id'] == pid][0]; ok(d['concluso'] and h['provvigione'] == 30 and h['pagato'] is None, f'quindicina 1–15 ottobre: provvigione {h["provvigione"]} € da pagare')
s, r = adm('POST', '/api/gestione/provvigioni', {'partnerId': pid, 'dal': '2026-10-01'}); ok(s == 200 and r['importo'] == 30, 'quindicina segnata come pagata (30 €)')
s, r = adm('POST', '/api/gestione/provvigioni', {'partnerId': pid, 'dal': '2026-10-01'}); ok(s == 409, 'non si paga due volte la stessa quindicina')
s, r = adm('POST', '/api/gestione/provvigioni', {'partnerId': pid, 'dal': '2027-07-16'}); ok(s == 409, 'quindicina non ancora finita → 409')
s, d = hot('GET', '/api/partner/riepilogo'); t = d['totali']; ok(t['liquidata'] == 30 and t['daRicevere'] == 0 and t['maturata'] == 30, f'la struttura vede: maturata {t["maturata"]} €, ricevuta {t["liquidata"]} €, da ricevere {t["daRicevere"]} €')
s, l = adm('GET', '/api/gestione/strutture'); h = [x for x in l['strutture'] if x['id'] == pid][0]; ok(h['venduto'] == 595 and h['daPagare'] == 0, f'gestione strutture: venduto {h["venduto"]} €, da pagare {h["daPagare"]} €')

# disattivazione: la struttura viene scollegata e non può più entrare
s, r = adm('POST', '/api/gestione/strutture', {'azione': 'modifica', 'id': pid, 'nome': 'Hotel Prova Palau', 'provvigione': 20, 'attivo': False}); ok(s == 200, 'struttura disattivata')
s, r = hot('GET', '/api/partner/riepilogo'); ok(s in (401, 403), f'struttura disattivata scollegata ({s})')
s, r = anon('GET', f'/api/disponibilita?escursione=tour-7-isole&mese=2027-07&partner={codice}'); ok(r['partner'] is None, 'il link di una struttura disattivata non vale più')
s, r = adm('DELETE', '/api/accesso', None); s, r = adm('GET', '/api/gestione/giorno?data=2027-06-10'); ok(s == 401, 'uscita: sessione chiusa')
# troppi tentativi
bad = client(ip='10.7.7.7'); esiti = [bad('POST', '/api/accesso', {'email': 'bloccato@prova.it', 'password': 'no'})[0] for _ in range(6)]
ok(esiti[-1] == 429, f'5 tentativi sbagliati → blocco ({esiti})')
print('TUTTO OK (gestione e strutture)')
