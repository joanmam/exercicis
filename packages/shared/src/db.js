// Accés a Firestore per als events. Web i mòbil fan servir les mateixes funcions.
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const COL = "events";

// Afegeix un event nou amb el valor del botó ("Fet" o "No fet"),
// el grup ("Cara" o "Vista") i la data actual.
export async function afegirEvent(db, value, grup = "Cara") {
  return addDoc(collection(db, COL), {
    value,
    grup,
    date: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
}

// Llegeix tots els events, més recents primer.
export async function llegirEvents(db) {
  const q = query(collection(db, COL), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Esborra un event pel seu id.
export async function esborraEvent(db, id) {
  return deleteDoc(doc(db, COL, id));
}
