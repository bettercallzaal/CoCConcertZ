/**
 * Shared Firebase Admin init for operational scripts.
 *
 * Credential order:
 * 1. FIREBASE_ADMIN_* env vars (service account) — `vercel env pull .env.local` hydrates these
 * 2. Application Default Credentials — `gcloud auth application-default login`, no key file needed
 *    (Firestore works under ADC; Firebase Auth admin ops do not — scripts only touch Firestore)
 */
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export function initAdmin() {
  if (getApps().length > 0) return;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (projectId && clientEmail && rawPrivateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: rawPrivateKey.replace(/\\n/g, "\n"),
      }),
    });
    return;
  }

  if (projectId || process.env.GOOGLE_CLOUD_PROJECT) {
    initializeApp({
      credential: applicationDefault(),
      projectId: projectId || process.env.GOOGLE_CLOUD_PROJECT,
    });
    console.log("Using Application Default Credentials (no service account key).");
    return;
  }

  console.error(
    "No Firebase Admin credentials. Either:\n" +
      "  1. `vercel link && vercel env pull .env.local`  (pulls FIREBASE_ADMIN_* vars), or\n" +
      "  2. set FIREBASE_ADMIN_PROJECT_ID in .env.local and run `gcloud auth application-default login`"
  );
  process.exit(1);
}

export function adminDb() {
  initAdmin();
  return getFirestore();
}
