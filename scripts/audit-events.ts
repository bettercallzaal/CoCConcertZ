/**
 * Audit all event docs in Firestore. Flag missing/empty fields per show.
 * Read-only. Run: `npx tsx scripts/audit-events.ts`.
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

const REQUIRED: Array<keyof Record<string, unknown>> = [
  "name",
  "number",
  "date",
  "description",
  "flyerUrl",
  "rsvpLink",
  "venue",
  "status",
  "artists",
];

async function run() {
  const snap = await db.collection("events").orderBy("number", "asc").get();
  console.log(`Total events: ${snap.size}\n`);

  for (const doc of snap.docs) {
    const d = doc.data();
    const num = d.number ?? "??";
    const name = d.name ?? "(no name)";
    console.log(`=== #${num} - ${name} ===`);
    console.log(`  id:           ${doc.id}`);
    console.log(`  status:       ${d.status ?? "(missing)"}`);
    console.log(`  date:         ${d.date?.toDate?.()?.toISOString?.() ?? "(missing)"}`);
    console.log(`  description:  ${d.description ? `${String(d.description).slice(0, 70)}...` : "(MISSING)"}`);
    console.log(`  flyerUrl:     ${d.flyerUrl ?? "(MISSING)"}`);
    console.log(`  bannerUrl:    ${d.bannerUrl ?? "(missing - falls back to flyer)"}`);
    console.log(`  rsvpLink:     ${d.rsvpLink ?? "(MISSING)"}`);
    console.log(`  venue:        ${d.venue?.spatialLink ? "spatial OK" : "(MISSING spatial)"} | stream: ${d.venue?.streamLink ?? "(missing)"}`);
    console.log(`  announcement: ${d.announcement ? `"${String(d.announcement).slice(0, 60)}..."` : "(missing)"}`);
    const artists = Array.isArray(d.artists) ? d.artists : [];
    console.log(`  artists:      ${artists.length} linked (${artists.map((a: { artistId: string }) => a.artistId.slice(0, 6)).join(", ")})`);
    if (d.recap) {
      const r = d.recap;
      console.log(`  recap:        summary=${r.summary ? "OK" : "EMPTY"}, highlights=${r.highlights?.length ?? 0}, videos=${r.videos?.length ?? 0}, transcripts=${r.transcriptUrls?.length ?? 0}`);
    } else {
      console.log(`  recap:        (NONE)`);
    }
    console.log("");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
