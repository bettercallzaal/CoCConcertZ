/**
 * One-shot cleanup: merge the older `tom-fellenz` artist doc's
 * socialLinks into the canonical `fellenz` doc, then delete the
 * older doc. Run once: `npx tsx scripts/dedupe-fellenz.ts`.
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
  const fellenzSnap = await db.collection("artists").where("slug", "==", "fellenz").get();
  const oldSnap = await db.collection("artists").where("slug", "==", "tom-fellenz").get();

  if (fellenzSnap.empty) {
    console.error("FAIL: canonical slug=fellenz doc not found. Aborting.");
    process.exit(1);
  }
  if (oldSnap.empty) {
    console.log("OK: no slug=tom-fellenz duplicate found. Nothing to do.");
    return;
  }

  const fellenzDoc = fellenzSnap.docs[0];
  const fellenzData = fellenzDoc.data();
  const currentSocials = (fellenzData.socialLinks ?? {}) as Record<string, string>;
  const currentLinkedEvents: string[] = Array.isArray(fellenzData.linkedEvents)
    ? fellenzData.linkedEvents
    : [];

  for (const oldDoc of oldSnap.docs) {
    const oldData = oldDoc.data();
    const oldSocials = (oldData.socialLinks ?? {}) as Record<string, string>;

    // Merge: prefer existing fellenz value, fill blanks from tom-fellenz
    const merged: Record<string, string> = { ...currentSocials };
    for (const [k, v] of Object.entries(oldSocials)) {
      if (v && !merged[k]) merged[k] = v;
    }

    // Merge linkedEvents too
    const oldLinked: string[] = Array.isArray(oldData.linkedEvents) ? oldData.linkedEvents : [];
    const mergedLinked = Array.from(new Set([...currentLinkedEvents, ...oldLinked]));

    // Carry over bio + profilePhoto if fellenz is empty
    const update: Record<string, unknown> = {
      socialLinks: merged,
      linkedEvents: mergedLinked,
    };
    if (!fellenzData.bio && oldData.bio) update.bio = oldData.bio;
    if (!fellenzData.profilePhoto && oldData.profilePhoto) update.profilePhoto = oldData.profilePhoto;

    await fellenzDoc.ref.update(update);
    console.log(`OK: merged ${oldDoc.id} (slug=tom-fellenz) into ${fellenzDoc.id} (slug=fellenz)`);
    console.log(`     socials -> [${Object.keys(merged).join(", ")}]`);
    console.log(`     linkedEvents -> ${JSON.stringify(mergedLinked)}`);

    await oldDoc.ref.delete();
    console.log(`OK: deleted artists/${oldDoc.id} (slug=tom-fellenz)`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
