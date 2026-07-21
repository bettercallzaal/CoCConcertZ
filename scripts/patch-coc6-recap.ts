/**
 * Patch event #6 with recap for COC Concertz #6: The African Experience.
 * June 13, 2026 — Iman Afrikah + Santana in Stilo World.
 *
 * Fill in `videos` and `transcriptUrls` once the YouTube clips and
 * recording links are available.
 *
 * Idempotent. Run: `npx tsx scripts/patch-coc6-recap.ts`.
 */
import { adminDb } from "./lib/admin-init";

const db = adminDb();

const RECAP = {
  summary:
    "COC ConcertZ #6 — The African Experience. COC's first African showcase, curated by Iman Afrikah (Lusaka, Zambia) and co-headlined by Santana. The show brought West African and Southern African sounds live into Stilo World on Spatial, with Iman walking through his production process and the intersection of Web3 and independent music from the continent. Co-presented by The ZAO, COC Concertz, and BetterCallZaal, hosted by ThyRevolution.",
  highlights: [
    "COC's first African-curated showcase — Iman Afrikah brought the Zambian hackathon scene to Stilo World",
    "Iman Afrikah live performance + production walkthrough in the Spatial 3D venue",
    "Santana co-headlined, expanding the Afrobeats + Web3 artist roster",
    "Live in StiloWorld — fans and artists sharing the same metaverse stage",
    "Reinforced the COC model: global artists, free virtual venue, zero geography barrier",
    "First COC show to spotlight an artist building Web3 music on Base from Africa",
  ],
  // Fill these in once footage is available:
  // videos: [{ youtubeId: "...", title: "COC #6 Full Set — Iman Afrikah" }],
  // transcriptUrls: ["..."],
  videos: [],
  transcriptUrls: [],
};

async function run() {
  const snap = await db.collection("events").where("number", "==", 6).get();
  if (snap.empty) {
    console.error("FAIL: event #6 not found — run update-coc7.ts first (it marks #6 completed).");
    process.exit(1);
  }
  for (const doc of snap.docs) {
    await doc.ref.update({ recap: RECAP, updatedAt: new Date() });
    console.log(
      `OK: patched events/${doc.id} (#6) with recap — ` +
        `summary=${RECAP.summary.length} chars, highlights=${RECAP.highlights.length}`
    );
  }
  console.log("\nNOTE: videos[] and transcriptUrls[] are empty — fill in once footage is uploaded.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
