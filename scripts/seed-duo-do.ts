/**
 * Stub artist doc for DÚO DØ MUSICA (COC #3 opener). Public socials
 * not found via search 2026-05-27 - Zaal/Duo Dø to fill via portal
 * or Firestore console.
 *
 * Also links to event #3 if that doc exists. Idempotent.
 * Run: `npx tsx scripts/seed-duo-do.ts`.
 */
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

const SLUG = "duo-do-musica";
const STAGE_NAME = "DÚO DØ MUSICA";
const BIO =
  "Latin music duo. Opening act on COC Concertz #3 (March 7, 2026), 4:15-4:45 PM EST in StiloWorld. Set preceded the English vs Spanish WaveWarZ Community Battle.";

async function run() {
  const existing = await db.collection("artists").where("slug", "==", SLUG).get();
  let artistId: string;
  const now = new Date();

  if (existing.empty) {
    const ref = db.collection("artists").doc();
    await ref.set({
      userId: "",
      stageName: STAGE_NAME,
      slug: SLUG,
      bio: BIO,
      profilePhoto: "",
      socialLinks: {},
      cardCustomization: {},
      linkedEvents: [],
      createdAt: now,
    });
    artistId = ref.id;
    console.log(`OK: created artists/${ref.id} (slug=${SLUG})`);
  } else {
    artistId = existing.docs[0].id;
    console.log(`OK: artists/${artistId} already exists (slug=${SLUG})`);
  }

  // Link to event #3 if it exists
  const eventSnap = await db.collection("events").where("number", "==", 3).get();
  if (eventSnap.empty) {
    console.log("INFO: event #3 not in Firestore (using hardcoded fallback on site). Skipping link.");
    return;
  }
  for (const eventDoc of eventSnap.docs) {
    const data = eventDoc.data();
    const artists: { artistId: string; order: number; setTime?: string }[] = Array.isArray(
      data.artists
    )
      ? data.artists
      : [];
    if (artists.some((a) => a.artistId === artistId)) {
      console.log(`OK: ${eventDoc.id} already lists ${SLUG}`);
      continue;
    }
    artists.push({ artistId, order: 0, setTime: "4:15-4:45 PM EST" });
    await eventDoc.ref.update({ artists, updatedAt: new Date() });
    console.log(`OK: linked ${SLUG} to event ${eventDoc.id} as opener`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
