/**
 * Upsert the Firestore event doc for COC Concertz #8
 * AND flip COC #7 to status=completed. Idempotent.
 * Run: `npx tsx scripts/update-coc8.ts`.
 *
 * FILL THE TBD CONSTANTS BELOW BEFORE RUNNING - the script refuses to run
 * while any TBD placeholder remains.
 */
import { adminDb } from "./lib/admin-init";

const db = adminDb();

// ============================================================
// FILL THESE IN WHEN COC #8 DATE + SUBTITLE ARE CONFIRMED
// ============================================================

const SHOW_DATE_UTC = "TBD"; // e.g. "2026-08-09T20:00:00Z"  (4PM EST = 20:00 UTC)
const SHOW_DATE_DISPLAY = "TBD"; // e.g. "Sat Aug 9, 4PM EST"
const SHOW_SUBTITLE = "TBD"; // e.g. "Producer Showcase" or "Freestyle Night"
const LINEUP_TEXT = "TBD"; // e.g. "Full lineup announced week of show"
const SPATIAL = "TBD"; // Spatial venue URL - reuse COC #7 URL or new one
// const SPATIAL = "https://www.spatial.io/s/Dope-Stilo-Music-Club-66ed19e8c23d0d0c2a3d51c0";

// ============================================================

const TBD = "TBD";

function assertNoTBD() {
  const fields: Record<string, string> = {
    SHOW_DATE_UTC,
    SHOW_DATE_DISPLAY,
    SHOW_SUBTITLE,
    LINEUP_TEXT,
    SPATIAL,
  };
  const missing = Object.entries(fields).filter(([, v]) => v === TBD);
  if (missing.length > 0) {
    console.error(
      `ERROR: Fill in the following constants before running:\n  ${missing.map(([k]) => k).join("\n  ")}`,
    );
    process.exit(1);
  }
}

async function upsertEight() {
  const snap = await db.collection("events").where("number", "==", 8).get();
  const now = new Date();

  const payload = {
    name: `+COC Concertz #8: ${SHOW_SUBTITLE}`,
    number: 8,
    date: new Date(SHOW_DATE_UTC),
    description: `${SHOW_SUBTITLE} takes over Stilo World. DJ Zaal on the decks. ${LINEUP_TEXT}. Hosted by BetterCallZaal.`,
    announcement: `COC Concertz #8: ${SHOW_SUBTITLE}. DJ Zaal, ${SHOW_DATE_DISPLAY}. RSVP open.`,
    rsvpLink: "https://ticket.cocconcertz.com",
    venue: {
      spatialLink: SPATIAL,
      streamLink: "https://www.twitch.tv/bettercallzaal",
    },
    status: "upcoming",
    flyerUrl: "/images/coc-banner-dark.jpeg",
    bannerUrl: "/images/coc-banner-dark.jpeg",
    updatedAt: now,
  };

  if (snap.empty) {
    const ref = db.collection("events").doc();
    await ref.set({ ...payload, artists: [], createdAt: now });
    console.log(`OK: created event ${ref.id} -> ${payload.name}`);
    return;
  }

  for (const doc of snap.docs) {
    await doc.ref.set(payload, { merge: true });
    console.log(`OK: patched event ${doc.id} -> ${payload.name}`);
  }
}

async function completeSeven() {
  const snap = await db.collection("events").where("number", "==", 7).get();
  if (snap.empty) {
    console.warn("WARN: no event with number=7 found.");
    return;
  }
  for (const doc of snap.docs) {
    if (doc.data().status === "completed") {
      console.log(`OK: event ${doc.id} (#7) already completed.`);
      continue;
    }
    await doc.ref.set({ status: "completed", updatedAt: new Date() }, { merge: true });
    console.log(`OK: event ${doc.id} (#7) -> completed`);
  }
}

async function main() {
  assertNoTBD();
  await completeSeven();
  await upsertEight();
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
