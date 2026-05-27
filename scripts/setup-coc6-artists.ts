/**
 * One-shot setup for COC #6 lineup artist docs + portal access.
 *
 * 1. Rename existing iman-and-zambia-crew doc to slug=iman-afrikah,
 *    stageName=IMAN AFRIKAH (Iman edits a personal artist page, not
 *    a collective doc).
 * 2. Create a new artists/santana doc and link it to event #6.
 * 3. Generate two random 6-char passcodes and emit the JSON snippet
 *    that needs to be merged into ARTIST_PASSCODES (env var).
 *
 * Idempotent: re-runs without duplicating Santana or re-renaming Iman.
 * Run once: `npx tsx scripts/setup-coc6-artists.ts`.
 */
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as crypto from "node:crypto";

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

function passcode(): string {
  // 6-char base32-ish, alphanumeric, lower (typeable, ~30B entropy)
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"; // no l/i/0/1/o
  let s = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) s += alphabet[bytes[i] % alphabet.length];
  return s;
}

async function renameIman(): Promise<string> {
  const oldSnap = await db
    .collection("artists")
    .where("slug", "==", "iman-and-zambia-crew")
    .get();
  if (oldSnap.empty) {
    // Maybe already renamed
    const newSnap = await db.collection("artists").where("slug", "==", "iman-afrikah").get();
    if (!newSnap.empty) {
      console.log("OK: iman-afrikah already exists (rename complete prior run)");
      return "iman-afrikah";
    }
    console.warn(
      "WARN: no iman-and-zambia-crew or iman-afrikah doc found. Run seed-iman-crew.ts first."
    );
    return "iman-afrikah";
  }
  // Update in place - keep doc id + linkedEvents + socials
  const doc = oldSnap.docs[0];
  await doc.ref.update({
    slug: "iman-afrikah",
    stageName: "IMAN AFRIKAH",
    bio:
      "Producer, sound engineer, and live performer based in Lusaka, Zambia. Web3 musician building on Base. Headlining COC's first African showcase.",
  });
  console.log(`OK: renamed artists/${doc.id} -> slug=iman-afrikah, stageName=IMAN AFRIKAH`);
  return "iman-afrikah";
}

async function upsertSantana(): Promise<string> {
  const existing = await db.collection("artists").where("slug", "==", "santana").get();
  const now = new Date();
  if (existing.empty) {
    const ref = db.collection("artists").doc();
    await ref.set({
      userId: "",
      stageName: "SANTANA",
      slug: "santana",
      bio: "Co-headliner of COC's African Experience alongside Iman Afrikah.",
      profilePhoto: "",
      socialLinks: {},
      cardCustomization: {},
      linkedEvents: [],
      createdAt: now,
    });
    console.log(`OK: created artists/${ref.id} (slug=santana)`);
  } else {
    console.log(`OK: artists/${existing.docs[0].id} already exists (slug=santana)`);
  }
  return "santana";
}

async function linkToEventSix(slug: string): Promise<void> {
  const artistSnap = await db.collection("artists").where("slug", "==", slug).get();
  if (artistSnap.empty) {
    console.warn(`WARN: artist ${slug} not found for #6 link`);
    return;
  }
  const artistId = artistSnap.docs[0].id;
  const eventSnap = await db.collection("events").where("number", "==", 6).get();
  if (eventSnap.empty) {
    console.warn("WARN: event #6 not found; run update-coc6.ts first.");
    return;
  }
  for (const eventDoc of eventSnap.docs) {
    const data = eventDoc.data();
    const artists: { artistId: string; order: number; setTime?: string }[] = Array.isArray(
      data.artists
    )
      ? data.artists
      : [];
    if (artists.some((a) => a.artistId === artistId)) {
      console.log(`OK: ${eventDoc.id} already lists ${slug}`);
      continue;
    }
    artists.push({ artistId, order: artists.length });
    await eventDoc.ref.update({ artists, updatedAt: new Date() });
    console.log(`OK: linked ${slug} to event ${eventDoc.id} as artist #${artists.length}`);

    // Mirror back
    const linkedEvents: string[] = Array.isArray(artistSnap.docs[0].data().linkedEvents)
      ? artistSnap.docs[0].data().linkedEvents
      : [];
    if (!linkedEvents.includes(eventDoc.id)) {
      linkedEvents.push(eventDoc.id);
      await artistSnap.docs[0].ref.update({ linkedEvents });
    }
  }
}

async function run() {
  const imanSlug = await renameIman();
  const santanaSlug = await upsertSantana();
  await linkToEventSix(imanSlug);
  await linkToEventSix(santanaSlug);

  const imanCode = passcode();
  const santanaCode = passcode();

  console.log("\n=========================================");
  console.log("PORTAL PASSCODES (generated this run)");
  console.log("=========================================");
  console.log(`Iman Afrikah  -> ${imanCode}`);
  console.log(`Santana       -> ${santanaCode}`);
  console.log("\nMerge into ARTIST_PASSCODES env var (.env.local AND Vercel):");
  console.log(
    JSON.stringify({ [imanCode]: imanSlug, [santanaCode]: santanaSlug }, null, 2)
  );
  console.log("\nPortal URL to share: https://cocconcertz.com/login");
  console.log("=========================================");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
