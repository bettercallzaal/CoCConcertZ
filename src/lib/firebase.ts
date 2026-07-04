import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

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

// App Check - activates automatically when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is
// set (Vercel env + redeploy). Until then the public-write collections rely on
// rule-level validation only. Full activation steps: docs/app-check-setup.md
// (register the site key in the Firebase console FIRST, then set env, then
// flip enforcement in the console once token metrics look healthy).
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
  const w = window as unknown as { __cocAppCheck?: boolean };
  if (!w.__cocAppCheck) {
    w.__cocAppCheck = true;
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      console.warn("App Check init skipped:", err);
    }
  }
}

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
