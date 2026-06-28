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
import { afegirEvent, llegirEvents } from "@exercicis/shared/db";
import { agregaPerCategoria, agrupaPerTemps } from "@exercicis/shared/events";

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
        <Historial events={events} />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

function Historial({ events }) {
  const [agrupacio, setAgrupacio] = useState("dia");
  const { perCategoria, total } = agregaPerCategoria(events);
  const grups = agrupaPerTemps(events, agrupacio);

  if (events.length === 0)
    return <Text style={st.center}>Encara no hi ha events.</Text>;

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={st.resum}>
        <Targeta etiqueta="Fet" valor={perCategoria["Fet"]} color="#1a7f37" />
        <Targeta etiqueta="No fet" valor={perCategoria["No fet"]} color="#cf222e" />
        <Targeta etiqueta="Total" valor={total} color="#0969da" />
      </View>

      <View style={st.selector}>
        {["dia", "setmana", "mes"].map((g) => (
          <Pressable
            key={g}
            style={agrupacio === g ? st.tabOn : st.tab}
            onPress={() => setAgrupacio(g)}
          >
            <Text style={agrupacio === g ? st.tabOnText : st.tabText}>{g}</Text>
          </Pressable>
        ))}
      </View>

      <View style={st.filaCap}>
        <Text style={[st.cel, st.cap]}>Període</Text>
        <Text style={[st.cel, st.cap]}>Fet</Text>
        <Text style={[st.cel, st.cap]}>No fet</Text>
        <Text style={[st.cel, st.cap]}>Total</Text>
      </View>
      {grups.map((g) => (
        <View key={g.periode} style={st.fila}>
          <Text style={st.cel}>{g.periode}</Text>
          <Text style={st.cel}>{g.Fet}</Text>
          <Text style={st.cel}>{g["No fet"]}</Text>
          <Text style={st.cel}>{g.total}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function Targeta({ etiqueta, valor, color }) {
  return (
    <View style={st.targeta}>
      <Text style={[st.num, { color }]}>{valor}</Text>
      <Text style={st.etq}>{etiqueta}</Text>
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
  selector: { flexDirection: "row", gap: 8, marginBottom: 12 },
  filaCap: { flexDirection: "row", borderBottomWidth: 2, borderColor: "#ddd", paddingVertical: 8 },
  fila: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#eee", paddingVertical: 8 },
  cel: { flex: 1, fontSize: 13 },
  cap: { fontWeight: "bold" },
});
