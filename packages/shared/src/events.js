// Lògica d'events compartida entre web i mòbil.
// Un "event" és { value: "Fet" | "No fet", date: <ISO string> }.
// Les categories són justament els valors dels dos botons.

export const CATEGORIES = ["Fet", "No fet"];

// Grups d'exercicis. Els registres antics sense grup es consideren "Cara".
export const GRUPS = ["Cara", "Vista"];

export function grupDe(event) {
  return event.grup || "Cara";
}

// Retorna només els events d'un grup concret.
export function filtraPerGrup(events, grup) {
  return events.filter((e) => grupDe(e) === grup);
}

// Períodes disponibles per filtrar els events.
// "7dies" | "15dies" | "setmana" | "mes" | "tot"
export const PERIODES = [
  { clau: "7dies", etiqueta: "Últims 7 dies" },
  { clau: "15dies", etiqueta: "Últims 15 dies" },
  { clau: "setmana", etiqueta: "Aquesta setmana" },
  { clau: "mes", etiqueta: "Aquest mes" },
  { clau: "tot", etiqueta: "Tot" },
];

// Retorna només els events dins del període demanat.
export function filtraPerPeriode(events, periode, ara = new Date()) {
  if (periode === "tot") return events;

  let desde;
  if (periode === "7dies") {
    desde = new Date(ara);
    desde.setDate(ara.getDate() - 7);
  } else if (periode === "15dies") {
    desde = new Date(ara);
    desde.setDate(ara.getDate() - 15);
  } else if (periode === "setmana") {
    // dilluns d'aquesta setmana a les 00:00
    desde = new Date(ara);
    const dayNr = (ara.getDay() + 6) % 7;
    desde.setDate(ara.getDate() - dayNr);
    desde.setHours(0, 0, 0, 0);
  } else if (periode === "mes") {
    desde = new Date(ara.getFullYear(), ara.getMonth(), 1);
  } else {
    return events;
  }

  return events.filter((e) => new Date(e.date) >= desde);
}

// Compta quants events hi ha de cada categoria i el total.
export function agregaPerCategoria(events) {
  const perCategoria = {};
  for (const c of CATEGORIES) perCategoria[c] = 0;
  for (const e of events) {
    perCategoria[e.value] = (perCategoria[e.value] || 0) + 1;
  }
  return { perCategoria, total: events.length };
}

// Retorna la clau de període d'una data segons l'agrupació demanada.
// groupBy: "dia" | "setmana" | "mes"
export function clauPeriode(date, groupBy) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");

  if (groupBy === "mes") return `${y}-${m}`;

  if (groupBy === "setmana") {
    // Setmana ISO (dilluns com a primer dia)
    const target = new Date(d);
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const week =
      1 +
      Math.round(
        ((target - firstThursday) / 86400000 -
          3 +
          ((firstThursday.getDay() + 6) % 7)) /
          7
      );
    return `${target.getFullYear()}-S${String(week).padStart(2, "0")}`;
  }

  // per defecte: dia
  return `${y}-${m}-${dia}`;
}

const MESOS_CURT = ["gen", "feb", "mar", "abr", "mai", "jun", "jul", "ago", "set", "oct", "nov", "des"];

// Etiqueta curta d'un mes "YYYY-MM" -> "gen 26".
export function etiquetaMes(mesClau) {
  const [y, m] = mesClau.split("-");
  return `${MESOS_CURT[Number(m) - 1]} ${y.slice(2)}`;
}

// Per cada mes, percentatge de "Fet" sobre el total del mes.
// Retorna [{ mes: "YYYY-MM", fet, total, pct }] ordenat de més antic a més nou.
export function percentatgeMensual(events) {
  const grups = {};
  for (const e of events) {
    const clau = clauPeriode(e.date, "mes");
    if (!grups[clau]) grups[clau] = { mes: clau, fet: 0, total: 0 };
    if (e.value === "Fet") grups[clau].fet += 1;
    grups[clau].total += 1;
  }
  return Object.values(grups)
    .map((g) => ({ ...g, pct: g.total ? Math.round((g.fet / g.total) * 100) : 0 }))
    .sort((a, b) => (a.mes < b.mes ? -1 : 1));
}

// Agrupa els events per període i compta Fet / No fet / total a cada grup.
export function agrupaPerTemps(events, groupBy = "dia") {
  const grups = {};
  for (const e of events) {
    const clau = clauPeriode(e.date, groupBy);
    if (!grups[clau]) {
      grups[clau] = { periode: clau, Fet: 0, "No fet": 0, total: 0 };
    }
    grups[clau][e.value] = (grups[clau][e.value] || 0) + 1;
    grups[clau].total += 1;
  }
  // ordre descendent (el més recent a dalt)
  return Object.values(grups).sort((a, b) => (a.periode < b.periode ? 1 : -1));
}
