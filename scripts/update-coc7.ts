/**
 * Upsert the Firestore event doc for COC Concertz #7 (WaveWarZ Takeover)
 * AND flip COC #6 to status=completed. Idempotent.
 * Run: `npx tsx scripts/update-coc7.ts`.
 *
 * FILL THE TBD CONSTANTS BELOW BEFORE RUNNING - the script refuses to run
 * while any TBD placeholder remains.
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

// ---- FILL THESE -----------------------------------------------------------
const SHOW_DATE_UTC = "TBD"; // e.g. "2026-08-08T20:00:00Z" (4PM EST)
const SHOW_DATE_DISPLAY = "TBD"; // e.g. "Sat Aug 8, 4PM EST"
const LINEUP_TEXT = "TBD"; // e.g. "DJ Zaal + WaveWarZ crew battle"
// ---------------------------------------------------------------------------

const NEW_NAME = "+COC Concertz #7: WaveWarZ Takeover";
const NEW_DESCRIPTION =
  `The WaveWarZ crew takes over Stilo World. DJ Zaal on the decks with a full WaveWarZ community battle. ${LINEUP_TEXT}. Hosted by BetterCallZaal + ThyRevolution.`;
const NEW_ANNOUNCEMENT =
  `COC Concertz #7: WaveWarZ Takeover. DJ Zaal + WaveWarZ crew, ${SHOW_DATE_DISPLAY}. RSVP open.`;
const RSVP_LINK = "https://ticket.cocconcertz.com";
const SPATIAL =
  "https://www.spatial.io/s/Dope-Stilo-Music-Club-66ed19e8c23d0d0c2a3d51c0";
const BANNER = "/images/coc7-flyer.png";

if ([SHOW_DATE_UTC, SHOW_DATE_DISPLAY, LINEUP_TEXT].some((v) => v === "TBD")) {
  console.error("ERROR: fill the TBD constants at the top of update-coc7.ts first.");
  process.exit(1);
}

async function upsertSeven() {
  const snap = await db.collection("events").where("number", "==", 7).get();
  const now = new Date();

  const payload = {
    name: NEW_NAME,
    number: 7,
    date: new Date(SHOW_DATE_UTC),
    description: NEW_DESCRIPTION,
    announcement: NEW_ANNOUNCEMENT,
    rsvpLink: RSVP_LINK,
    venue: { spatialLink: SPATIAL },
    status: "upcoming",
    flyerUrl: BANNER,
    bannerUrl: BANNER,
    updatedAt: now,
  };

  if (snap.empty) {
    const ref = db.collection("events").doc();
    await ref.set({ ...payload, artists: [], createdAt: now });
    console.log(`OK: created event ${ref.id} -> ${NEW_NAME}`);
    return;
  }

  for (const doc of snap.docs) {
    await doc.ref.set(payload, { merge: true });
    console.log(`OK: patched event ${doc.id} -> ${NEW_NAME}`);
  }
}

async function completeSix() {
  const snap = await db.collection("events").where("number", "==", 6).get();
  if (snap.empty) {
    console.warn("WARN: no event with number=6 found.");
    return;
  }
  for (const doc of snap.docs) {
    if (doc.data().status === "completed") {
      console.log(`OK: event ${doc.id} (#6) already completed.`);
      continue;
    }
    await doc.ref.set({ status: "completed", updatedAt: new Date() }, { merge: true });
    console.log(`OK: event ${doc.id} (#6) -> completed`);
  }
}

async function main() {
  await completeSix();
  await upsertSeven();
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
