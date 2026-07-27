/**
 * One-shot setup for COC #8 lineup artist docs + portal access.
 *
 * Creates/upserts artist docs and links them to event #8.
 * Generates portal passcodes to merge into ARTIST_PASSCODES env var.
 *
 * DJ ZAAL is confirmed. Guest lineup is TBA — fill in GUEST_ARTISTS below
 * once Zaal confirms the lineup, then re-run (script is idempotent).
 *
 * Prerequisite: run update-coc8.ts first so event #8 doc exists.
 * Run: `npx tsx scripts/setup-coc8-artists.ts`
 */
import { adminDb } from "./lib/admin-init";
import * as crypto from "node:crypto";

const db = adminDb();

function passcode(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) s += alphabet[bytes[i] % alphabet.length];
  return s;
}

// ============================================================
// CONFIRMED LINEUP
// ============================================================

const CONFIRMED_ARTISTS = [
  {
    slug: "dj-zaal",
    stageName: "DJ ZAAL",
    bio: "BetterCallZaal — COC Concertz founder. On the decks for COC #8.",
    profilePhoto: "",
    socialLinks: {
      farcaster: "https://warpcast.com/bettercallzaal",
      x: "https://x.com/bettercallzaal",
    },
  },
];

// ============================================================
// GUEST ARTISTS — uncomment once lineup is confirmed by Zaal
// ============================================================

// const GUEST_ARTISTS = [
//   {
//     slug: "artist-slug",
//     stageName: "ARTIST NAME",
//     bio: "Bio text here.",
//     profilePhoto: "",
//     socialLinks: {},
//   },
// ];

// ============================================================

const ALL_ARTISTS = [
  ...CONFIRMED_ARTISTS,
  // ...(typeof GUEST_ARTISTS !== "undefined" ? GUEST_ARTISTS : []),
];

async function getEventId(): Promise<string | null> {
  const snap = await db.collection("events").where("number", "==", 8).get();
  if (snap.empty) {
    console.error("ERROR: event #8 not found — run update-coc8.ts first.");
    return null;
  }
  return snap.docs[0].id;
}

async function upsertArtist(
  artist: (typeof ALL_ARTISTS)[number],
  eventId: string,
  codes: Record<string, string>,
) {
  const ref = db.collection("artists").doc(artist.slug);
  const snap = await ref.get();
  const now = new Date();

  if (!snap.exists) {
    const code = passcode();
    codes[artist.slug] = code;
    await ref.set({
      ...artist,
      eventId,
      passcode: code,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`OK: created artist ${artist.slug} (code: ${code})`);
  } else {
    await ref.set({ ...artist, eventId, updatedAt: now }, { merge: true });
    const existing = snap.data()?.passcode as string | undefined;
    if (existing) {
      codes[artist.slug] = existing;
      console.log(`OK: updated artist ${artist.slug} (existing code: ${existing})`);
    } else {
      const code = passcode();
      codes[artist.slug] = code;
      await ref.set({ passcode: code }, { merge: true });
      console.log(`OK: updated artist ${artist.slug} (new code: ${code})`);
    }
  }
}

async function main() {
  const eventId = await getEventId();
  if (!eventId) process.exit(1);

  const codes: Record<string, string> = {};
  for (const artist of ALL_ARTISTS) {
    await upsertArtist(artist, eventId, codes);
  }

  console.log("\n--- ARTIST_PASSCODES env var payload (merge into Vercel) ---");
  console.log(JSON.stringify(codes, null, 2));
  console.log("\nAdd each entry to ARTIST_PASSCODES in Vercel → Settings → Env Vars → redeploy.");
  console.log("Portal URL: https://cocconcertz.com/login");
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
