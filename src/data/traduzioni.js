// Strumenti comuni alle traduzioni (src/data/en/, es/, fr/, de/): orari e prezzi presi dal listino unico
// (prenotazioni.js), così ogni lingua scrive solo le parole e mai i numeri.

import { prezzoDa, offerte, imbarchiPer, gommoni } from './prenotazioni.js';
import { escursioni as escursioniIt } from './escursioni.js';
import { sito as sitoIt } from './sito.js';

// Unisce i dati italiani con i testi tradotti (gli elenchi si sostituiscono per intero).
export const unisci = (base, sopra) => {
  if (Array.isArray(sopra) || typeof sopra !== 'object' || sopra === null) return sopra;
  const r = { ...base };
  for (const [k, v] of Object.entries(sopra)) r[k] = k in (base ?? {}) ? unisci(base[k], v) : v;
  return r;
};

// I dati del sito in una lingua: quelli italiani più i testi tradotti (e le descrizioni dei gommoni per id).
export const sitoTradotto = (testi, flotta) =>
  unisci(sitoIt, { ...testi, flotta: sitoIt.flotta.map((f) => ({ ...f, ...flotta[f.id] })) });

export const da = (slug) => prezzoDa(slug) ?? {};
export const ore = (o) => String(o).split('–').map((x) => x.trim());
export const breve = (o) => String(o).replace(' – ', '–');
export const posti = (slug) => escursioniIt.find((e) => e.slug === slug).postiMax;

// Turni del listino usati nei testi delle escursioni.
export const turno7 = offerte['tour-7-isole'].turni[0];
export const [mattina, pomeriggio] = offerte['mezza-giornata'].turni;
export const privatoGiornata = offerte['tour-privato'].turni.find((t) => t.id === 'giornata');
export const corsica = offerte['corsica'].turni[0];
export const [partenzaCorsica, rientroCorsica] = ore(corsica.orario);
export const palauMattina = ore(turno7.orariImbarco.palau)[0];
export const minimoGruppo = offerte['tour-7-isole'].minimo;

// "La Maddalena (passaggio a Palau) o Cannigione" nella lingua giusta: Palau mai prima di La Maddalena.
export const daDoveIn = (passaggio, o) => (slug) => {
  const id = imbarchiPer(slug).map((i) => i.id);
  const porti = [id.includes('maddalena') && `La Maddalena${id.includes('palau') ? ` (${passaggio})` : ''}`, id.includes('cannigione') && 'Cannigione'].filter(Boolean);
  return porti.join(` ${o} `);
};

// Le escursioni in una lingua: dati italiani (prezzi, posti, mappa) + testi tradotti per slug.
export const escursioniTradotte = (testi, daDove) =>
  escursioniIt.map((e) => ({ ...e, ...testi[e.slug], daDove: daDove(e.slug) }));

// Escursioni che partono da un imbarco, con gli orari di quell'imbarco e i nomi dei turni tradotti.
export function escursioniDaImbarco(escursioni, imbarco, nomiTurni, nomiTurniPrivato, testoSunset) {
  return escursioni
    .filter((e) => offerte[e.slug]?.imbarchi.includes(imbarco))
    .map((e) => {
      const nomi = offerte[e.slug].tipo === 'esclusiva' && offerte[e.slug].turni.length > 1 ? nomiTurniPrivato : nomiTurni;
      const turni = offerte[e.slug].turni.map((t) => {
        const orario = imbarco === 'maddalena' ? t.orario : t.orariImbarco?.[imbarco];
        return { nome: nomi[t.id] ?? t.nome, orario: t.indicativo ? testoSunset : orario ? breve(orario) : '' };
      });
      return { e, turni };
    });
}
export const prezzoMinimo = (lista) => Math.min(...lista.filter((x) => !x.e.prezzoGommone).map((x) => Number(x.e.prezzoAdulti)));
export const honda = gommoni.find((g) => g.imbarchi.includes('cannigione') && g.imbarchi.length === 1);
export const [mezzaMattina, mezzaPomeriggio] = offerte['mezza-giornata'].turni;
