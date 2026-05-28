/**
 * Patch event #5 with EventRecap built from ThyRevolution's post-show audio.
 * Source transcript: content/transcripts/concertz-5/cocconcertz5-rev-reflection.txt
 *
 * Idempotent. Run: `npx tsx scripts/patch-coc5-recap.ts`.
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

const RECAP = {
  summary:
    "COC ConcertZ #5 - 'A Day in the Life of GodCloud.' The ZAO, COC, and Zaal hosted a deep-dive into GodCloud's world: how he produces, the skill set he's built, the journey behind the music. The format flipped the standard set into a conversation - GodCloud walked through songs, told the stories behind them, played them back, and answered live in StiloWorld alongside listeners in the same 3D room. Hosted by ThyRevolution, set the template for the dialogue-driven COC show.",
  highlights: [
    "Show theme: 'A Day in the Life of GodCloud' - deep-dive on craft + journey",
    "GodCloud walked through his production process and skill set live",
    "Music played interleaved with context on each song's meaning + inspiration",
    "Live in StiloWorld on Spatial - listeners + artist in the same 3D room",
    "Hosted by ThyRevolution and BetterCallZaal, co-presented by The ZAO and Community of Communities",
    "First COC show to lean fully into the conversation-with-the-artist format vs straight live set",
  ],
  videos: [],
  transcriptUrls: [],
};

async function run() {
  const snap = await db.collection("events").where("number", "==", 5).get();
  if (snap.empty) {
    console.error("FAIL: event #5 not found");
    process.exit(1);
  }
  for (const doc of snap.docs) {
    await doc.ref.update({ recap: RECAP, updatedAt: new Date() });
    console.log(
      `OK: patched events/${doc.id} (#5) with recap - summary=${RECAP.summary.length} chars, highlights=${RECAP.highlights.length}`
    );
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
