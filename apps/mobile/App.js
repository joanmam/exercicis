import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from "react-native";
import { db, isConfigured } from "./src/firebaseConfig";
import { afegirEvent, llegirEvents, esborraEvent } from "@exercicis/shared/db";
import { agregaPerCategoria, filtraPerPeriode, PERIODES } from "@exercicis/shared/events";

export default function App() {
  const [tab, setTab] = useState("registre");
  const [events, setEvents] = useState([]);
  const [missatge, setMissatge] = useState("");

  async function carrega() {
    if (!isConfigured) return;
    setEvents(await llegirEvents(db));
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
    setMissatge(`Registrat: ${value}`);
    carrega();
  }

  async function esborra(id) {
    if (!isConfigured) return;
    await esborraEvent(db, id);
    carrega();
  }

  return (
    <View style={st.container}>
      <Text style={st.h1}>Exercicis Primer</Text>

      {!isConfigured && (
        <Text style={st.avis}>
          ⚠️ Firebase no configurat. Omple apps/mobile/.env per guardar events.
        </Text>
      )}

      <View style={st.nav}>
        <Pressable
          style={tab === "registre" ? st.tabOn : st.tab}
          onPress={() => setTab("registre")}
        >
          <Text style={tab === "registre" ? st.tabOnText : st.tabText}>Registre</Text>
        </Pressable>
        <Pressable
          style={tab === "historial" ? st.tabOn : st.tab}
          onPress={() => {
            setTab("historial");
            carrega();
          }}
        >
          <Text style={tab === "historial" ? st.tabOnText : st.tabText}>Historial</Text>
        </Pressable>
      </View>

      {tab === "registre" ? (
        <View style={st.center}>
          <View style={st.botons}>
            <Pressable style={[st.gran, st.fet]} onPress={() => registra("Fet")}>
              <Text style={st.granText}>Fet</Text>
            </Pressable>
            <Pressable style={[st.gran, st.nofet]} onPress={() => registra("No fet")}>
              <Text style={st.granText}>No fet</Text>
            </Pressable>
          </View>
          {!!missatge && <Text style={st.msg}>{missatge}</Text>}
        </View>
      ) : (
        <Historial events={events} onEsborra={esborra} />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const VISIBLES_INICIALS = 5;

function formataData(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function Historial({ events, onEsborra }) {
  const [periode, setPeriode] = useState("7dies");
  const [visibles, setVisibles] = useState(VISIBLES_INICIALS);

  if (events.length === 0)
    return <Text style={st.center}>Encara no hi ha events.</Text>;

  const filtrats = filtraPerPeriode(events, periode);
  const { perCategoria, total } = agregaPerCategoria(filtrats);
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const mostrats = filtrats.slice(0, visibles);

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={st.selector}>
        {PERIODES.map((p) => (
          <Pressable
            key={p.clau}
            style={periode === p.clau ? st.tabOn : st.tab}
            onPress={() => {
              setPeriode(p.clau);
              setVisibles(VISIBLES_INICIALS);
            }}
          >
            <Text style={periode === p.clau ? st.tabOnText : st.tabText}>{p.etiqueta}</Text>
          </Pressable>
        ))}
      </View>

      <View style={st.resum}>
        <Targeta etiqueta="Fet" valor={perCategoria["Fet"]} pct={pct(perCategoria["Fet"])} color="#1a7f37" />
        <Targeta etiqueta="No fet" valor={perCategoria["No fet"]} pct={pct(perCategoria["No fet"])} color="#cf222e" />
        <Targeta etiqueta="Total" valor={total} color="#0969da" />
      </View>

      {filtrats.length === 0 ? (
        <Text style={st.center}>Cap registre en aquest període.</Text>
      ) : (
        <>
          <View style={st.filaCap}>
            <Text style={[st.cel, st.cap]}>Data</Text>
            <Text style={[st.cel, st.cap]}>Estat</Text>
            <Text style={[st.celBoto, st.cap]}></Text>
          </View>
          {mostrats.map((e) => {
            const ferFet = e.value === "Fet";
            return (
              <View key={e.id} style={[st.fila, ferFet ? st.filaFet : st.filaNoFet]}>
                <Text style={st.cel}>{formataData(e.date)}</Text>
                <Text style={[st.cel, ferFet ? st.txtFet : st.txtNoFet]}>{e.value}</Text>
                <Pressable style={st.celBoto} onPress={() => onEsborra(e.id)}>
                  <Text style={st.esborrar}>✕</Text>
                </Pressable>
              </View>
            );
          })}

          {visibles < filtrats.length && (
            <Pressable style={st.veureMes} onPress={() => setVisibles((v) => v + VISIBLES_INICIALS)}>
              <Text style={st.veureMesText}>Veure més registres</Text>
            </Pressable>
          )}
        </>
      )}
    </ScrollView>
  );
}

function Targeta({ etiqueta, valor, pct, color }) {
  return (
    <View style={st.targeta}>
      <Text style={[st.num, { color }]}>{valor}</Text>
      <Text style={st.etq}>{etiqueta}</Text>
      {pct !== undefined && <Text style={st.pct}>{pct}%</Text>}
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 20 },
  h1: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
  avis: { backgroundColor: "#fff8c5", padding: 12, borderRadius: 8, fontSize: 13, marginTop: 12 },
  nav: { flexDirection: "row", gap: 8, justifyContent: "center", marginVertical: 16 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 },
  tabOn: { paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: "#0969da", backgroundColor: "#0969da", borderRadius: 8 },
  tabText: { color: "#333" },
  tabOnText: { color: "#fff" },
  center: { textAlign: "center", alignItems: "center", marginTop: 24 },
  botons: { flexDirection: "row", gap: 16, marginTop: 32 },
  gran: { borderRadius: 16, paddingVertical: 32, paddingHorizontal: 32, minWidth: 130, alignItems: "center" },
  granText: { color: "#fff", fontSize: 26, fontWeight: "bold" },
  fet: { backgroundColor: "#1a7f37" },
  nofet: { backgroundColor: "#cf222e" },
  msg: { marginTop: 24, fontSize: 18 },
  resum: { flexDirection: "row", gap: 10, marginVertical: 16 },
  targeta: { flex: 1, alignItems: "center", borderWidth: 1, borderColor: "#eee", borderRadius: 12, paddingVertical: 14 },
  num: { fontSize: 28, fontWeight: "bold" },
  etq: { fontSize: 13, color: "#666" },
  pct: { fontSize: 12, color: "#999", marginTop: 2 },
  selector: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 12 },
  filaCap: { flexDirection: "row", borderBottomWidth: 2, borderColor: "#ddd", paddingVertical: 8 },
  fila: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: "#eee", paddingVertical: 8, paddingHorizontal: 4, borderRadius: 6, marginBottom: 2 },
  filaFet: { backgroundColor: "#d8f5dd" },
  filaNoFet: { backgroundColor: "#ffdcdc" },
  cel: { flex: 1, fontSize: 13 },
  celBoto: { width: 32, alignItems: "center" },
  txtFet: { color: "#1a7f37", fontWeight: "600" },
  txtNoFet: { color: "#cf222e", fontWeight: "600" },
  esborrar: { color: "#cf222e", fontSize: 16 },
  cap: { fontWeight: "bold" },
  veureMes: { marginTop: 16, alignSelf: "center", paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: "#0969da", borderRadius: 8 },
  veureMesText: { color: "#0969da" },
});
