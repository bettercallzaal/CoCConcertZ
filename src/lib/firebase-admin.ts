import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (getApps().length === 0) {
  if (clientEmail && rawPrivateKey && projectId) {
    // Vercel encodes newlines in env vars as the literal "\n". Restore real newlines
    // before passing to cert() — without this the JWT signing throws "Invalid PEM".
    const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } else if (projectId || process.env.GOOGLE_CLOUD_PROJECT) {
    // Local fallback: Application Default Credentials — no private key on disk.
    // One-time setup per machine: `gcloud auth application-default login`
    // (and `gcloud auth application-default set-quota-project <project-id>`).
    // Firestore works under ADC; only Firebase Auth admin ops don't (unused by scripts).
    initializeApp({
      credential: applicationDefault(),
      projectId: projectId || process.env.GOOGLE_CLOUD_PROJECT,
    });
  } else {
    throw new Error(
      "Firebase Admin credentials not found. Either set FIREBASE_ADMIN_PROJECT_ID, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY (run `vercel env pull .env.local`), " +
        "or set FIREBASE_ADMIN_PROJECT_ID alone and run `gcloud auth application-default login`."
    );
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
