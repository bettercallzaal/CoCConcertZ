import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

const missing: string[] = [];
if (!projectId) missing.push("FIREBASE_ADMIN_PROJECT_ID");
if (!clientEmail) missing.push("FIREBASE_ADMIN_CLIENT_EMAIL");
if (!rawPrivateKey) missing.push("FIREBASE_ADMIN_PRIVATE_KEY");
if (missing.length > 0) {
  throw new Error(
    `Missing Firebase Admin env vars: ${missing.join(", ")}. ` +
      "Add them to .env.local and your Vercel project settings."
  );
}

// Vercel encodes newlines in env vars as the literal "\n". Restore real newlines
// before passing to cert() — without this the JWT signing throws "Invalid PEM".
const privateKey = rawPrivateKey!.replace(/\\n/g, "\n");

if (getApps().length === 0) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
