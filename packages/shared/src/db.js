// Accés a Firestore per als events. Web i mòbil fan servir les mateixes funcions.
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const COL = "events";

// Afegeix un event nou amb el valor del botó ("Fet" o "No fet") i la data actual.
export async function afegirEvent(db, value) {
  return addDoc(collection(db, COL), {
    value,
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
