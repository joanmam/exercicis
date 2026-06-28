import { initFirebase } from "@exercicis/shared/firebase";
import { firebaseConfig } from "@exercicis/shared/config";

export const isConfigured = true;
export const { app, auth, db, storage } = initFirebase(firebaseConfig);
