import { useEffect, useState } from "react";
import { db, isConfigured } from "./firebaseConfig";
import { afegirEvent, llegirEvents, esborraEvent } from "@exercicis/shared/db";
import { agregaPerCategoria, filtraPerPeriode, filtraPerGrup, PERIODES, GRUPS } from "@exercicis/shared/events";

// Colors de fons i accent per a cada grup.
const TEMA = {
  Cara: { fons: "#f4eefc", accent: "#8250df" },
  Vista: { fons: "#fff3e6", accent: "#d4731c" },
};

export default function App() {
  const [grup, setGrup] = useState("Cara");
  const [tab, setTab] = useState("registre");
  const [events, setEvents] = useState([]);
  const [carregant, setCarregant] = useState(false);
  const [missatge, setMissatge] = useState("");

  const tema = TEMA[grup];

  useEffect(() => {
    document.body.style.background = tema.fons;
    document.body.style.transition = "background 0.2s";
  }, [tema.fons]);

  async function carrega() {
    if (!isConfigured) return;
    setCarregant(true);
    try {
      setEvents(await llegirEvents(db));
    } finally {
      setCarregant(false);
    }
  }

  useEffect(() => {
    carrega();
  }, []);

  async function registra(value) {
    if (!isConfigured) {
      setMissatge("Configura Firebase (.env) per guardar els events.");
      return;
    }
    await afegirEvent(db, value, grup);
    setMissatge(`Registrat: ${value} ✓`);
    carrega();
  }

  async function esborra(id) {
    if (!isConfigured) return;
    await esborraEvent(db, id);
    carrega();
  }

  const eventsGrup = filtraPerGrup(events, grup);

  return (
    <main style={{ ...s.main, background: tema.fons }}>
      <h1 style={s.h1}>Exercicis Primer</h1>

      <nav style={s.grups}>
        {GRUPS.map((g) => (
          <button
            key={g}
            style={
              grup === g
                ? { ...s.grup, background: TEMA[g].accent, borderColor: TEMA[g].accent, color: "#fff" }
                : { ...s.grup, color: TEMA[g].accent, borderColor: TEMA[g].accent }
            }
            onClick={() => {
              setGrup(g);
              setMissatge("");
            }}
          >
            {g}
          </button>
        ))}
      </nav>

      {!isConfigured && (
        <p style={s.avis}>
          ⚠️ Firebase encara no està configurat. Omple <code>apps/web/.env</code> per
          guardar i veure els events.
        </p>
      )}

      <nav style={s.nav}>
        <button
          style={tab === "registre" ? { ...s.tabOn, background: tema.accent, borderColor: tema.accent } : s.tab}
          onClick={() => setTab("registre")}
        >
          Registre
        </button>
        <button
          style={tab === "historial" ? { ...s.tabOn, background: tema.accent, borderColor: tema.accent } : s.tab}
          onClick={() => {
            setTab("historial");
            carrega();
          }}
        >
          Historial
        </button>
      </nav>

      {tab === "registre" ? (
        <section style={s.center}>
          <div style={s.botons}>
            <button style={{ ...s.gran, ...s.fet }} onClick={() => registra("Fet")}>
              Fet
            </button>
            <button style={{ ...s.gran, ...s.nofet }} onClick={() => registra("No fet")}>
              No fet
            </button>
          </div>
          {missatge && <p style={s.msg}>{missatge}</p>}
        </section>
      ) : (
        <Historial events={eventsGrup} carregant={carregant} onEsborra={esborra} accent={tema.accent} />
      )}
    </main>
  );
}

const VISIBLES_INICIALS = 5;

function formataData(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ca-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Historial({ events, carregant, onEsborra, accent = "#0969da" }) {
  const [periode, setPeriode] = useState("7dies");
  const [visibles, setVisibles] = useState(VISIBLES_INICIALS);

  if (carregant) return <p style={s.center}>Carregant…</p>;
  if (events.length === 0) return <p style={s.center}>Encara no hi ha registres en aquest grup.</p>;

  const filtrats = filtraPerPeriode(events, periode);
  const { perCategoria, total } = agregaPerCategoria(filtrats);
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  const mostrats = filtrats.slice(0, visibles);

  return (
    <section>
      <div style={s.selector}>
        {PERIODES.map((p) => (
          <button
            key={p.clau}
            style={periode === p.clau ? { ...s.tabOn, background: accent, borderColor: accent } : s.tab}
            onClick={() => {
              setPeriode(p.clau);
              setVisibles(VISIBLES_INICIALS);
            }}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      <div style={s.resum}>
        <Targeta etiqueta="Fet" valor={perCategoria["Fet"]} pct={pct(perCategoria["Fet"])} color="#1a7f37" />
        <Targeta etiqueta="No fet" valor={perCategoria["No fet"]} pct={pct(perCategoria["No fet"])} color="#cf222e" />
        <Targeta etiqueta="Total" valor={total} color={accent} />
      </div>

      {filtrats.length === 0 ? (
        <p style={s.center}>Cap registre en aquest període.</p>
      ) : (
        <>
          <table style={s.taula}>
            <thead>
              <tr>
                <th style={s.th}>Data</th>
                <th style={s.th}>Estat</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {mostrats.map((e) => {
                const ferFet = e.value === "Fet";
                return (
                  <tr key={e.id}>
                    <td style={s.td}>{formataData(e.date)}</td>
                    <td style={{ ...s.td, ...(ferFet ? s.celFet : s.celNoFet) }}>
                      {e.value}
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <button
                        style={s.esborrar}
                        title="Eliminar registre"
                        onClick={() => onEsborra(e.id)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {visibles < filtrats.length && (
            <div style={s.center}>
              <button
                style={{ ...s.veureMes, color: accent, borderColor: accent }}
                onClick={() => setVisibles((v) => v + VISIBLES_INICIALS)}
              >
                Veure més registres
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Targeta({ etiqueta, valor, pct, color }) {
  return (
    <div style={s.targeta}>
      <div style={{ ...s.num, color }}>{valor}</div>
      <div style={s.etq}>{etiqueta}</div>
      {pct !== undefined && <div style={s.pct}>{pct}%</div>}
    </div>
  );
}

const s = {
  main: { fontFamily: "system-ui, sans-serif", maxWidth: 520, margin: "0 auto", padding: 24, minHeight: "100vh", boxSizing: "border-box" },
  h1: { textAlign: "center" },
  grups: { display: "flex", gap: 8, justifyContent: "center", margin: "8px 0 4px" },
  grup: { padding: "10px 28px", border: "2px solid", background: "#fff", borderRadius: 999, fontSize: 16, fontWeight: 600, cursor: "pointer" },
  avis: { background: "#fff8c5", padding: 12, borderRadius: 8, fontSize: 14 },
  nav: { display: "flex", gap: 8, justifyContent: "center", margin: "16px 0" },
  tab: { padding: "8px 16px", border: "1px solid #ccc", background: "#fff", borderRadius: 8, cursor: "pointer" },
  tabOn: { padding: "8px 16px", border: "1px solid #0969da", background: "#0969da", color: "#fff", borderRadius: 8, cursor: "pointer" },
  center: { textAlign: "center" },
  botons: { display: "flex", gap: 16, justifyContent: "center", marginTop: 32 },
  gran: { fontSize: 28, fontWeight: "bold", color: "#fff", border: "none", borderRadius: 16, padding: "32px 40px", cursor: "pointer", minWidth: 140 },
  fet: { background: "#1a7f37" },
  nofet: { background: "#cf222e" },
  msg: { textAlign: "center", marginTop: 24, fontSize: 18 },
  resum: { display: "flex", gap: 12, justifyContent: "center", margin: "8px 0 24px" },
  targeta: { flex: 1, textAlign: "center", border: "1px solid #eee", borderRadius: 12, padding: 16 },
  num: { fontSize: 32, fontWeight: "bold" },
  etq: { fontSize: 14, color: "#666" },
  pct: { fontSize: 13, color: "#999", marginTop: 2 },
  selector: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16 },
  taula: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", borderBottom: "2px solid #ddd", padding: 8 },
  td: { borderBottom: "1px solid #eee", padding: 8 },
  celFet: { background: "#d8f5dd", color: "#1a7f37", fontWeight: 600 },
  celNoFet: { background: "#ffdcdc", color: "#cf222e", fontWeight: 600 },
  esborrar: { border: "none", background: "transparent", color: "#cf222e", fontSize: 16, cursor: "pointer", lineHeight: 1 },
  veureMes: { marginTop: 16, padding: "8px 16px", border: "1px solid #0969da", background: "#fff", color: "#0969da", borderRadius: 8, cursor: "pointer" },
};
