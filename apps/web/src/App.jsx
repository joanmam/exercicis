import { useState } from "react";
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
    <main style={{ fontFamily: "system-ui", textAlign: "center", padding: "2rem" }}>
      <h1>Exercicis Primer</h1>
      <p style={{ fontSize: "2rem" }}>{exercici.pregunta}</p>
      <input
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        inputMode="numeric"
        style={{ fontSize: "1.5rem", width: "5rem", textAlign: "center" }}
      />
      <div style={{ marginTop: "1rem" }}>
        <button onClick={comprova}>Comprova</button>
        <button onClick={seguent} style={{ marginLeft: "0.5rem" }}>Següent</button>
      </div>
      {resultat && <p style={{ fontSize: "1.25rem" }}>{resultat}</p>}
    </main>
  );
}
