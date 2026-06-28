import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TextInput, View, Button } from "react-native";
import { EXERCICIS_DEMO, comprovaResposta } from "@exercicis/shared/exercicis";

export default function App() {
  const [i, setI] = useState(0);
  const [valor, setValor] = useState("");
  const [resultat, setResultat] = useState(null);

  const exercici = EXERCICIS_DEMO[i];

  function comprova() {
    setResultat(comprovaResposta(exercici, valor) ? "Correcte! 🎉" : "Torna-ho a provar");
  }

  function seguent() {
    setI((i + 1) % EXERCICIS_DEMO.length);
    setValor("");
    setResultat(null);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercicis Primer</Text>
      <Text style={styles.pregunta}>{exercici.pregunta}</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={setValor}
        keyboardType="numeric"
      />
      <View style={styles.row}>
        <Button title="Comprova" onPress={comprova} />
        <View style={{ width: 12 }} />
        <Button title="Següent" onPress={seguent} />
      </View>
      {resultat && <Text style={styles.resultat}>{resultat}</Text>}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  pregunta: { fontSize: 32, marginBottom: 16 },
  input: { fontSize: 24, borderWidth: 1, borderColor: "#ccc", width: 100, textAlign: "center", padding: 8, borderRadius: 8 },
  row: { flexDirection: "row", marginTop: 16 },
  resultat: { fontSize: 20, marginTop: 16 },
});
