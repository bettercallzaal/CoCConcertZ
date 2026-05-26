/**
 * Seed an artists/iman-and-zambia-crew document and link it to the COC #6
 * event lineup. Mirrors seed-godcloud-artist.ts. Idempotent.
 *
 * Run once: `npx tsx scripts/seed-iman-crew.ts`.
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

const SLUG = "iman-and-zambia-crew";
const STAGE_NAME = "IMAN AND ZAMBIA CREW";
const BIO =
  "First international COC Concertz - Iman Afrikah and his Zambia crew (the 45-builder hackathon cohort he ran in Zambia in May 2026). Producer, sound engineer, and live performer based in Lusaka. Building on Base. Individual artist names land closer to showtime.";

async function run() {
  // 1. Find or create the artist doc
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
      socialLinks: {
        twitter: "https://x.com/Imanafrikah",
      },
      cardCustomization: {},
      linkedEvents: [],
      createdAt: now,
    });
    artistId = ref.id;
    console.log(`OK: created artists/${artistId} (slug=${SLUG})`);
  } else {
    artistId = existing.docs[0].id;
    // Keep bio + handle in sync on re-runs
    await existing.docs[0].ref.update({
      stageName: STAGE_NAME,
      bio: BIO,
      "socialLinks.twitter": "https://x.com/Imanafrikah",
    });
    console.log(`OK: artists/${artistId} already exists (slug=${SLUG}) - bio/handle synced`);
  }

  // 2. Link to COC #6 event lineup
  const eventSnap = await db.collection("events").where("number", "==", 6).get();
  if (eventSnap.empty) {
    console.warn("WARN: event #6 not found; run update-coc6.ts first.");
    return;
  }

  for (const eventDoc of eventSnap.docs) {
    const data = eventDoc.data();
    const artists: { artistId: string; order: number; setTime?: string }[] =
      Array.isArray(data.artists) ? data.artists : [];
    const alreadyLinked = artists.some((a) => a.artistId === artistId);
    if (alreadyLinked) {
      console.log(`OK: ${eventDoc.id} already lists ${SLUG}`);
      continue;
    }
    artists.push({ artistId, order: artists.length });
    await eventDoc.ref.update({ artists, updatedAt: now });
    console.log(`OK: linked ${SLUG} to event ${eventDoc.id} as artist #${artists.length}`);
  }

  // 3. Mirror the event id into the artist's linkedEvents
  const artistRef = db.collection("artists").doc(artistId);
  const artistData = (await artistRef.get()).data() ?? {};
  const linkedEvents: string[] = Array.isArray(artistData.linkedEvents)
    ? artistData.linkedEvents
    : [];
  for (const eventDoc of eventSnap.docs) {
    if (!linkedEvents.includes(eventDoc.id)) linkedEvents.push(eventDoc.id);
  }
  await artistRef.update({ linkedEvents });
  console.log(`OK: artists/${artistId}.linkedEvents = ${JSON.stringify(linkedEvents)}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
