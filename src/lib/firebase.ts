import { initializeApp, type FirebaseOptions } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const env = import.meta.env;

export const usingEmulators = env.VITE_USE_EMULATORS === "true";

const projectId = env.VITE_FIREBASE_PROJECT_ID || (usingEmulators ? "demo-gugu" : "");

const config: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY || (usingEmulators ? "demo-api-key" : ""),
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || (projectId ? `${projectId}.firebaseapp.com` : undefined),
  projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || (projectId ? `${projectId}.appspot.com` : undefined),
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID || (usingEmulators ? "demo-app-id" : undefined),
};

/** False when the build has no Firebase web config (the web app is not registered yet). */
export const firebaseConfigured = Boolean(config.apiKey && config.projectId);

if (!firebaseConfigured) {
  console.error(
    "[gugu] Firebase web config is missing. Copy .env.example to .env.local and fill the VITE_FIREBASE_* values, or set VITE_USE_EMULATORS=true.",
  );
}

export const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "us-central1");
export const storage = getStorage(app);

if (usingEmulators) {
  const host = env.VITE_EMULATOR_HOST || "127.0.0.1";
  // Defaults match gugu_2.0/firebase.json; override e.g. "auth:29099,firestore:28080,functions:25001,storage:29199".
  const ports: Record<string, number> = { auth: 9099, firestore: 8080, functions: 5001, storage: 9199 };
  for (const pair of (env.VITE_EMULATOR_PORTS ?? "").split(",")) {
    const [name, port] = pair.split(":").map((x) => x.trim());
    if (name in ports && Number(port) > 0) ports[name] = Number(port);
  }
  connectAuthEmulator(auth, `http://${host}:${ports.auth}`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, ports.firestore);
  connectFunctionsEmulator(functions, host, ports.functions);
  connectStorageEmulator(storage, host, ports.storage);
}
