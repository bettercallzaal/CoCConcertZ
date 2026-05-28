/**
 * One-shot: link Stilo as artist #2 on event #5 (host alongside GodCloud).
 * Idempotent.
 * Run: `npx tsx scripts/link-stilo-coc5.ts`.
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
  const stiloSnap = await db.collection("artists").where("slug", "==", "stilo").get();
  if (stiloSnap.empty) {
    console.error("FAIL: artists/stilo not found");
    process.exit(1);
  }
  const stiloId = stiloSnap.docs[0].id;

  const eventSnap = await db.collection("events").where("number", "==", 5).get();
  if (eventSnap.empty) {
    console.error("FAIL: event #5 not found");
    process.exit(1);
  }

  for (const eventDoc of eventSnap.docs) {
    const data = eventDoc.data();
    const artists: { artistId: string; order: number }[] = Array.isArray(data.artists) ? data.artists : [];
    if (artists.some((a) => a.artistId === stiloId)) {
      console.log(`OK: ${eventDoc.id} already lists stilo`);
      continue;
    }
    artists.push({ artistId: stiloId, order: artists.length });
    await eventDoc.ref.update({ artists, updatedAt: new Date() });
    console.log(`OK: linked stilo to event #5 (${eventDoc.id}) as artist #${artists.length}`);

    // Mirror linkedEvents on stilo doc
    const linkedEvents: string[] = Array.isArray(stiloSnap.docs[0].data().linkedEvents)
      ? stiloSnap.docs[0].data().linkedEvents
      : [];
    if (!linkedEvents.includes(eventDoc.id)) {
      linkedEvents.push(eventDoc.id);
      await stiloSnap.docs[0].ref.update({ linkedEvents });
      console.log(`OK: mirrored event #5 onto artists/stilo.linkedEvents`);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
