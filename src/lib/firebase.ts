import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const requiredEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (typeof window !== "undefined") {
  const missing = Object.entries(requiredEnv)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase client env vars: ${missing.join(", ")}. ` +
        "Set them in .env.local and your Vercel project settings."
    );
  }
}

const firebaseConfig = {
  apiKey: requiredEnv.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: requiredEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: requiredEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: requiredEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: requiredEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: requiredEnv.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);

// App Check skeleton — wire up once a reCAPTCHA v3 site key is provisioned.
// See docs/app-check-setup.md.
//
// import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
// if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
//   initializeAppCheck(app, {
//     provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
//     isTokenAutoRefreshEnabled: true,
//   });
// }

// Local Firestore emulator. Opt in via:
//   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
// in `.env.local`. Guarded so we only connect once per app instance.
if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true"
) {
  const w = window as unknown as { __cocFirebaseEmulator?: boolean };
  if (!w.__cocFirebaseEmulator) {
    w.__cocFirebaseEmulator = true;
    try {
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
    } catch (err) {
      console.warn("Firestore emulator connect skipped:", err);
    }
  }
}
