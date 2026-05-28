/**
 * Read-only: list every artists/{doc} with slug + stageName + socialLinks keys.
 * Use to spot duplicates and slug mismatches.
 * Run: `npx tsx scripts/list-artists.ts`.
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

async function run() {
  const snap = await db.collection("artists").get();
  const rows = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      slug: data.slug ?? "",
      stageName: data.stageName ?? "",
      socialKeys: Object.keys(data.socialLinks ?? {}).filter((k) => Boolean(data.socialLinks[k])),
      linkedEventsCount: Array.isArray(data.linkedEvents) ? data.linkedEvents.length : 0,
    };
  });
  rows.sort((a, b) => a.slug.localeCompare(b.slug));
  console.log(`Total artists: ${rows.length}\n`);
  for (const r of rows) {
    console.log(
      `${r.slug.padEnd(28)} | ${r.stageName.padEnd(28)} | socials: [${r.socialKeys.join(", ")}] | linked events: ${r.linkedEventsCount} | id: ${r.id}`
    );
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
