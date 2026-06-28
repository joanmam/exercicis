// Configuració Firebase compartida entre web i mòbil.
// Els valors es llegeixen de variables d'entorn (NO es posen mai aquí en clar).
//
// Web (Vite):   defineix-los a apps/web/.env  amb prefix VITE_
// Mòbil (Expo): defineix-los a apps/mobile/.env amb prefix EXPO_PUBLIC_
//
// Aquest mòdul exporta una funció que rep la config, perquè cada app
// li passa les seves pròpies variables d'entorn.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export function initFirebase(config) {
  const app = initializeApp(config);
  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app),
  };
}
