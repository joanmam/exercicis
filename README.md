# Exercicis Primer

App d'exercicis (web + mòbil) amb backend Firebase compartit.

## Estructura

```
exercicis-primer/
├── apps/
│   ├── web/          → React + Vite (web)
│   └── mobile/       → Expo / React Native (Android + iOS)
├── packages/
│   └── shared/       → lògica i config Firebase compartides
├── firebase/         → regles Firestore/Storage + Cloud Functions
├── firebase.json
└── .firebaserc       → posa-hi el teu Firebase project ID
```

## Posada en marxa

1. Instal·la dependències (des de l'arrel):
   ```
   npm install
   ```
2. Configura Firebase:
   - Copia `apps/web/.env.example` → `apps/web/.env` i omple els valors.
   - Copia `apps/mobile/.env.example` → `apps/mobile/.env` i omple els valors.
   - Posa el teu project ID a `.firebaserc`.
   - Els valors són a Firebase Console → Configuració del projecte → Les teves apps.
3. Executa:
   ```
   npm run web      # web a http://localhost:5173
   npm run mobile   # Expo (escaneja el QR amb l'app Expo Go)
   ```

## Desplegament

El web es desplega a Firebase Hosting automàticament via GitHub Actions
en cada push a `main` (vegeu `.github/workflows/`).

## Seguretat

Les claus i credencials NO es pugen al repo (vegeu `.gitignore`).
Mai posis `serviceAccountKey.json`, `google-services.json` ni `.env` al control de versions.
```
