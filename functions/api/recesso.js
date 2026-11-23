// POST /api/recesso { codice, nome, email } → recesso online da un buono regalo comprato sul sito
// (art. 54-bis del Codice del consumo, dalla direttiva UE 2023/2673, in vigore dal 19 giugno 2026).
//
// Il recesso di 14 giorni c'è solo per i buoni regalo: le escursioni prenotate per una data precisa ne sono escluse
// (art. 59, comma 1, lettera n). La legge chiede: pulsante "Recedi dal contratto qui", poi "Conferma recesso" con nome,
// contratto e indirizzo per la risposta; subito dopo, una ricevuta su supporto durevole (email) con il testo della
// dichiarazione e data e ora. Il buono si annulla e il rimborso parte in automatico, se SumUp o PayPal lo permettono;
// altrimenti l'ufficio riceve l'email e rimborsa a mano (entro 14 giorni, art. 56).
import { prima, esegui, registra } from '../_lib/db.js';
import { rimborsa } from '../_lib/pagamenti.js';
import { inviaEmail } from '../_lib/prenotazioni.js';
import { sito } from '../../src/data/sito.js';
import { linguaValida } from '../../src/data/percorsi.js';
import { testiBuonoDi } from '../../src/data/buono-testi.js';
import { testiPrenotaDi } from '../../src/data/prenota-testi.js';
import { testiEmailDi } from '../../src/data/email-testi.js';
import { Errore, json, leggiJson, controllaOrigine, testo, email as validaEmail, oraRoma, euroDaCent } from '../_lib/util.js';

const GIORNI = 14;

// Ultimo giorno per recedere: data d'acquisto (ora italiana) + 14 giorni.
function ultimoGiorno(creatoIl) {
  const d = new Date(`${oraRoma(new Date(creatoIl)).data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + GIORNI);
  return d.toISOString().slice(0, 10);
}

// Data e ora nella lingua del cliente.
const quando = (d, locale = 'it-IT') => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' }).format(d);

export async function onRequestPost(contesto) {
  const { request, env } = contesto;
  controllaOrigine(request);
  const b = await leggiJson(request, 2000);
  const codice = testo(b.codice, { campo: 'codice del buono', massimo: 20, obbligatorio: true }).toUpperCase();
  const nome = testo(b.nome, { campo: 'nome e cognome', massimo: 100, obbligatorio: true });
  const indirizzo = validaEmail(b.email, true);
  // Dichiarazione e ricevuta nella lingua della pagina da cui il cliente recede.
  const lingua = linguaValida(b.lingua);
  const R = testiBuonoDi(lingua).recesso;
  const T = testiPrenotaDi(lingua);
  const soldi = (cent) => T.euro(cent / 100);

  const buono = await prima(env.DB, "SELECT * FROM codici_sconto WHERE codice = :c AND tipo = 'buono' AND creato_da = 'cliente'", { c: codice });
  // Stesso messaggio se il codice non c'è o l'email non corrisponde: non si rivela se un codice esiste.
  if (!buono || String(buono.email || '').toLowerCase() !== indirizzo.toLowerCase()) {
    throw new Errore(404, "Non troviamo un buono con questo codice e questa email. Controlla l'email con cui l'hai comprato, oppure scrivici.");
  }
  if (buono.stato === 'annullato') throw new Errore(409, 'Questo buono è già annullato.');
  if (buono.stato !== 'attivo' || !(buono.pagato > 0)) throw new Errore(409, 'Questo buono non risulta pagato: non c\'è nulla da rimborsare.');
  const limite = ultimoGiorno(buono.creato_il);
  if (oraRoma().data > limite) throw new Errore(409, `Il periodo di recesso di ${GIORNI} giorni è finito il ${limite.split('-').reverse().join('/')}. Se pensi ci sia un errore, scrivici.`);
  if (buono.saldo < buono.valore) throw new Errore(409, "Il buono è già stato usato, anche in parte, per una prenotazione: scrivici e vediamo insieme.");

  const adesso = new Date();
  // Annullato subito (una sola volta anche con due richieste insieme): il buono non si può più usare.
  const r = await esegui(env.DB, "UPDATE codici_sconto SET stato = 'annullato', saldo = 0, note = :n WHERE id = :id AND stato = 'attivo' AND saldo = valore",
    { n: `Recesso online del ${adesso.toISOString()}`, id: buono.id });
  if (r.meta?.changes !== 1) throw new Errore(409, 'Questo buono è appena stato usato o annullato: scrivici.');

  let rimborsoFatto = false;
  try {
    await rimborsa(env, buono, buono.pagato);
    await esegui(env.DB, 'UPDATE codici_sconto SET rimborsato = :i WHERE id = :id', { i: buono.pagato, id: buono.id });
    rimborsoFatto = true;
  } catch (e) {
    console.error('Rimborso del recesso non riuscito', e?.message || e);
  }
  await registra(env.DB, 'cliente', 'buono-recesso', { codice, importo: buono.pagato, rimborsoFatto });

  const dichiarazione = R.testoDichiarazione(nome, codice, soldi(buono.valore), quando(new Date(buono.creato_il), T.locale));
  const ricevuta = [
    R.ciao(nome),
    R.abbiamoRicevuto,
    '',
    `${R.dichiarazione}: ${dichiarazione}`,
    `${R.inviata}: ${quando(adesso, T.locale)}`,
    '',
    rimborsoFatto ? R.rimborsoPartito(soldi(buono.pagato), buono.metodo) : R.rimborsoEntro(soldi(buono.pagato)),
    '',
    sito.contatti.telefonoVisibile ? testiEmailDi(lingua).whatsapp(sito.contatti.telefonoVisibile) : null,
    sito.nome,
  ].filter((x) => x !== null).join('\n');
  const inviata = await inviaEmail(env, { a: indirizzo, oggetto: R.oggetto(codice), testo: ricevuta });
  if (sito.contatti.email) {
    await inviaEmail(env, {
      a: sito.contatti.email,
      oggetto: `Recesso dal buono ${codice}${rimborsoFatto ? '' : ' · RIMBORSO DA FARE A MANO'}`,
      testo: `${dichiarazione}\nInviata il ${quando(adesso)} da ${indirizzo}.\n${rimborsoFatto ? `Rimborso automatico fatto: ${euroDaCent(buono.pagato)} €.` : `Rimborso automatico NON riuscito: rimborsa ${euroDaCent(buono.pagato)} € (${buono.metodo}) dal pannello entro 14 giorni.`}`,
    });
  }

  return json({ dichiarazione, inviataIl: quando(adesso, T.locale), rimborsoFatto, importo: buono.pagato / 100, emailInviata: inviata });
}
