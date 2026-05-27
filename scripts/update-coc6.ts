/**
 * Upsert the Firestore event doc for COC Concertz #6 (Live from Zambia)
 * AND flip COC #5 to status=completed. Idempotent.
 * Run: `npx tsx scripts/update-coc6.ts`.
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

const NEW_NAME = "+COC Concertz #6: The African Experience";
const NEW_DESCRIPTION =
  "COC's first African showcase. Iman Afrikah (Zambia-based producer, building on Base) and Santana co-headline live inside Stilo World on Spatial. Hosted by BetterCallZaal + ThyRevolution.";
const NEW_ANNOUNCEMENT =
  "COC Concertz #6: The African Experience. Iman Afrikah + Santana, Sat Jun 13, 4PM EST. RSVP open.";
const RSVP_LINK = "https://ticket.cocconcertz.com";
const SPATIAL =
  "https://www.spatial.io/s/Dope-Stilo-Music-Club-66ed19e8c23d0d0c2a3d51c0";
const BANNER = "/images/coc6-flyer.png";

async function upsertSix() {
  const snap = await db.collection("events").where("number", "==", 6).get();
  const now = new Date();

  if (snap.empty) {
    const ref = db.collection("events").doc();
    await ref.set({
      name: NEW_NAME,
      number: 6,
      date: new Date("2026-06-13T20:00:00Z"),
      description: NEW_DESCRIPTION,
      announcement: NEW_ANNOUNCEMENT,
      rsvpLink: RSVP_LINK,
      venue: { spatialLink: SPATIAL },
      status: "upcoming",
      flyerUrl: BANNER,
      bannerUrl: BANNER,
      artists: [],
      createdAt: now,
      updatedAt: now,
    });
    console.log(`OK: created event ${ref.id} -> ${NEW_NAME}`);
    return;
  }

  if (snap.size > 1) {
    console.warn(`Found ${snap.size} events with number=6. Patching all.`);
  }
  const updates = snap.docs.map((d) => {
    const existing = d.data();
    const venue = { ...(existing.venue ?? {}), spatialLink: SPATIAL };
    return d.ref.update({
      name: NEW_NAME,
      description: NEW_DESCRIPTION,
      announcement: NEW_ANNOUNCEMENT,
      rsvpLink: RSVP_LINK,
      venue,
      flyerUrl: BANNER,
      bannerUrl: BANNER,
      status: "upcoming",
      updatedAt: now,
    });
  });
  await Promise.all(updates);
  console.log(`OK: patched ${snap.size} event doc(s) for COC #6.`);
}

async function markFiveCompleted() {
  const snap = await db.collection("events").where("number", "==", 5).get();
  if (snap.empty) {
    console.log("Skip: no COC #5 doc to mark completed.");
    return;
  }
  const now = new Date();
  await Promise.all(
    snap.docs.map((d) =>
      d.ref.update({ status: "completed", updatedAt: now })
    )
  );
  console.log(`OK: marked ${snap.size} COC #5 doc(s) as completed.`);
}

async function run() {
  await upsertSix();
  await markFiveCompleted();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
