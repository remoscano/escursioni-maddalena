// Le provvigioni si pagano ogni 15 giorni: dal 1 al 15 e dal 16 alla fine del mese (data dell'escursione).
export function quindicinaDi(data) {
  const [a, m, g] = data.split('-').map(Number);
  const fine = new Date(Date.UTC(a, m, 0)).getUTCDate();
  const mm = String(m).padStart(2, '0');
  return g <= 15
    ? { dal: `${a}-${mm}-01`, al: `${a}-${mm}-15` }
    : { dal: `${a}-${mm}-16`, al: `${a}-${mm}-${String(fine).padStart(2, '0')}` };
}

export function quindicinePrecedenti(data, quante = 12) {
  const elenco = [];
  let q = quindicinaDi(data);
  for (let i = 0; i < quante; i++) {
    elenco.push(q);
    const giornoPrima = new Date(`${q.dal}T12:00:00Z`);
    giornoPrima.setUTCDate(giornoPrima.getUTCDate() - 1);
    q = quindicinaDi(giornoPrima.toISOString().slice(0, 10));
  }
  return elenco;
}
