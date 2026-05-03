/**
 * Seed a stub artists/godcloud document and link it to the COC #5
 * event lineup so the portal opens to "Edit Profile" and the homepage
 * lineup picks him up. Run once: `npx tsx scripts/seed-godcloud-artist.ts`.
 *
 * Idempotent: re-running won't duplicate the artist doc or the lineup
 * entry.
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

const SLUG = "godcloud";
const STAGE_NAME = "GODCLOUD";

async function run() {
  // 1. Find or create the artist doc
  const existing = await db.collection("artists").where("slug", "==", SLUG).get();
  let artistId: string;

  if (existing.empty) {
    const ref = db.collection("artists").doc();
    await ref.set({
      userId: "",
      stageName: STAGE_NAME,
      slug: SLUG,
      bio: "",
      profilePhoto: "",
      socialLinks: {
        twitter: "https://twitter.com/therealgodcloud",
        website: "https://www.godcloud.org",
      },
      cardCustomization: {},
      linkedEvents: [],
      createdAt: new Date(),
    });
    artistId = ref.id;
    console.log(`OK: created artists/${artistId} (slug=${SLUG})`);
  } else {
    artistId = existing.docs[0].id;
    console.log(`OK: artists/${artistId} already exists (slug=${SLUG})`);
  }

  // 2. Link to COC #5 event lineup
  const eventSnap = await db.collection("events").where("number", "==", 5).get();
  if (eventSnap.empty) {
    console.warn("WARN: event #5 not found; skipping lineup link");
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
    await eventDoc.ref.update({ artists, updatedAt: new Date() });
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
