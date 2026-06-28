import { useEffect, useState } from "react";
import { db, isConfigured } from "./firebaseConfig";
import { afegirEvent, llegirEvents } from "@exercicis/shared/db";
import { agregaPerCategoria, agrupaPerTemps } from "@exercicis/shared/events";

export default function App() {
  const [tab, setTab] = useState("registre");
  const [events, setEvents] = useState([]);
  const [carregant, setCarregant] = useState(false);
  const [missatge, setMissatge] = useState("");

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
    await afegirEvent(db, value);
    setMissatge(`Registrat: ${value} ✓`);
    carrega();
  }

  return (
    <main style={s.main}>
      <h1 style={s.h1}>Exercicis Primer</h1>

      {!isConfigured && (
        <p style={s.avis}>
          ⚠️ Firebase encara no està configurat. Omple <code>apps/web/.env</code> per
          guardar i veure els events.
        </p>
      )}

      <nav style={s.nav}>
        <button
          style={tab === "registre" ? s.tabOn : s.tab}
          onClick={() => setTab("registre")}
        >
          Registre
        </button>
        <button
          style={tab === "historial" ? s.tabOn : s.tab}
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
        <Historial events={events} carregant={carregant} />
      )}
    </main>
  );
}

function Historial({ events, carregant }) {
  const [agrupacio, setAgrupacio] = useState("dia");
  const { perCategoria, total } = agregaPerCategoria(events);
  const grups = agrupaPerTemps(events, agrupacio);

  if (carregant) return <p style={s.center}>Carregant…</p>;
  if (events.length === 0) return <p style={s.center}>Encara no hi ha events.</p>;

  return (
    <section>
      <div style={s.resum}>
        <Targeta etiqueta="Fet" valor={perCategoria["Fet"]} color="#1a7f37" />
        <Targeta etiqueta="No fet" valor={perCategoria["No fet"]} color="#cf222e" />
        <Targeta etiqueta="Total" valor={total} color="#0969da" />
      </div>

      <div style={s.selector}>
        <span>Agrupa per:</span>
        {["dia", "setmana", "mes"].map((g) => (
          <button
            key={g}
            style={agrupacio === g ? s.tabOn : s.tab}
            onClick={() => setAgrupacio(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <table style={s.taula}>
        <thead>
          <tr>
            <th style={s.th}>Període</th>
            <th style={s.th}>Fet</th>
            <th style={s.th}>No fet</th>
            <th style={s.th}>Total</th>
          </tr>
        </thead>
        <tbody>
          {grups.map((g) => (
            <tr key={g.periode}>
              <td style={s.td}>{g.periode}</td>
              <td style={s.td}>{g.Fet}</td>
              <td style={s.td}>{g["No fet"]}</td>
              <td style={s.td}>{g.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Targeta({ etiqueta, valor, color }) {
  return (
    <div style={s.targeta}>
      <div style={{ ...s.num, color }}>{valor}</div>
      <div style={s.etq}>{etiqueta}</div>
    </div>
  );
}

const s = {
  main: { fontFamily: "system-ui, sans-serif", maxWidth: 520, margin: "0 auto", padding: 24 },
  h1: { textAlign: "center" },
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
  selector: { display: "flex", gap: 8, alignItems: "center", marginBottom: 16 },
  taula: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", borderBottom: "2px solid #ddd", padding: 8 },
  td: { borderBottom: "1px solid #eee", padding: 8 },
};
