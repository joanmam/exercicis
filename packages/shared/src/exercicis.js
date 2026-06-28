// Lògica d'exercicis compartida entre web i mòbil.
// Posa aquí tot el que vulguis reutilitzar a les dues plataformes.

export const EXERCICIS_DEMO = [
  { id: "suma-1", tipus: "suma", pregunta: "2 + 3 = ?", resposta: 5 },
  { id: "suma-2", tipus: "suma", pregunta: "4 + 1 = ?", resposta: 5 },
  { id: "resta-1", tipus: "resta", pregunta: "6 - 2 = ?", resposta: 4 },
];

export function comprovaResposta(exercici, valor) {
  return Number(valor) === exercici.resposta;
}
