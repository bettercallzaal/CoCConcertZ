/**
 * Patch the Firestore event doc for COC Concertz #5 with the GodCloud
 * theme. Run once: `npx tsx scripts/update-coc5.ts`.
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

const NEW_NAME = "+COC Concertz #5: A Day in the Life of GodCloud";
const NEW_DESCRIPTION =
  "GODCLOUD - Web3's first finger drummer, multi-instrumentalist, and CTO of Malaspalabras Records (George Lopez x Andy Vargas of Santana) - takes over StiloWorld for one night. Trip-hop, urban sci-fi, and a behind-the-scenes Q&A on building onchain music careers.";
const NEW_ANNOUNCEMENT =
  "GodCloud headlines COC Concertz #5 - May 9, 4PM EST. RSVP open.";
const RSVP_LINK = "https://luma.com/dwrdi3gg";

const SPATIAL =
  "https://www.spatial.io/s/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349";

async function run() {
  const snap = await db.collection("events").where("number", "==", 5).get();
  const now = new Date();

  if (snap.empty) {
    const ref = db.collection("events").doc();
    await ref.set({
      name: NEW_NAME,
      number: 5,
      date: new Date("2026-05-09T20:00:00Z"),
      description: NEW_DESCRIPTION,
      announcement: NEW_ANNOUNCEMENT,
      rsvpLink: RSVP_LINK,
      venue: { spatialLink: SPATIAL },
      status: "upcoming",
      flyerUrl: "",
      bannerUrl: "",
      artists: [],
      createdAt: now,
      updatedAt: now,
    });
    console.log(`OK: created event ${ref.id} -> ${NEW_NAME}`);
    return;
  }

  if (snap.size > 1) {
    console.warn(`Found ${snap.size} events with number=5. Patching all.`);
  }
  const updates = snap.docs.map((d) =>
    d.ref.update({
      name: NEW_NAME,
      description: NEW_DESCRIPTION,
      announcement: NEW_ANNOUNCEMENT,
      rsvpLink: RSVP_LINK,
      updatedAt: now,
    })
  );
  await Promise.all(updates);
  console.log(`OK: patched ${snap.size} event doc(s) for COC #5.`);
  for (const d of snap.docs) {
    console.log(`  ${d.id} -> ${NEW_NAME}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
