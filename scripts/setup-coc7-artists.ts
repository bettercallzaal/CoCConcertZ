/**
 * One-shot setup for COC #7 lineup artist docs + portal access.
 *
 * Creates/upserts artist docs and links them to event #7.
 * Generates portal passcodes to merge into ARTIST_PASSCODES env var.
 *
 * DJ ZAAL is confirmed. WaveWarZ crew lineup is TBA (week of show).
 * Uncomment the roster entries below once Zaal + Ike confirm the lineup,
 * then re-run — script is idempotent.
 *
 * Idempotent: re-runs without duplicating docs.
 * Run once per artist added: `npx tsx scripts/setup-coc7-artists.ts`.
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
    bio: "BetterCallZaal — COC Concertz founder, WaveWarZ Director of Ecosystem Strategy. On the decks for the WaveWarZ Takeover, spinning the battle soundtrack live in Stilo World.",
    profilePhoto: "",
    socialLinks: {
      farcaster: "https://warpcast.com/bettercallzaal",
      x: "https://x.com/bettercallzaal",
    },
  },
];

// ============================================================
// WAVEWARZ CREW — uncomment once lineup is confirmed by Zaal + Ike
// Source: docs/wavewarz-brief.md (WaveWarZ alumni with COC history)
// ============================================================

// const WAVEWARZ_CREW = [
//   {
//     slug: "godcloud",
//     stageName: "GODCLOUD",
//     bio: "COC #5 headliner. WaveWarZ fighter — 32 battles, 75% win rate, 8.33 SOL. 'A Day in the Life' format pioneer.",
//     profilePhoto: "",
//     socialLinks: {},
//   },
//   {
//     slug: "dopestilo",
//     stageName: "DOPESTILO",
//     bio: "Stilo World venue host, COC alumni from shows #2/#3/#4/#5. Top WaveWarZ earner — STILO English ran 14.46 SOL over 9 battles.",
//     profilePhoto: "",
//     socialLinks: {},
//   },
//   {
//     slug: "cannon-jones",
//     stageName: "CANNON JONES",
//     bio: "CannonJones973 (Taji). ZAO Cards lead, ZABAL mentor. WaveWarZ — 60 battles, 56.7% win rate, highest earnings at 12.49 SOL.",
//     profilePhoto: "",
//     socialLinks: {},
//   },
//   {
//     slug: "luiwrites",
//     stageName: "LUI",
//     bio: "Most active WaveWarZ fighter — 92 battles, 58.7% win rate, 7.12 SOL.",
//     profilePhoto: "",
//     socialLinks: {},
//   },
//   {
//     slug: "hurric4n3ike",
//     stageName: "HURRIC4N3IKE",
//     bio: "WaveWarZ co-founder. Dev, MC, and driving force behind the community battle format.",
//     profilePhoto: "",
//     socialLinks: {},
//   },
// ];
// CONFIRMED_ARTISTS.push(...WAVEWARZ_CREW);

// ============================================================

async function upsertArtist(artist: (typeof CONFIRMED_ARTISTS)[number]): Promise<string> {
  const existing = await db.collection("artists").where("slug", "==", artist.slug).get();
  const now = new Date();

  if (existing.empty) {
    const ref = db.collection("artists").doc();
    await ref.set({
      userId: "",
      stageName: artist.stageName,
      slug: artist.slug,
      bio: artist.bio,
      profilePhoto: artist.profilePhoto,
      socialLinks: artist.socialLinks,
      cardCustomization: {},
      linkedEvents: [],
      createdAt: now,
    });
    console.log(`OK: created artists/${ref.id} (slug=${artist.slug})`);
  } else {
    const doc = existing.docs[0];
    await doc.ref.update({
      stageName: artist.stageName,
      bio: artist.bio,
      socialLinks: artist.socialLinks,
      updatedAt: now,
    });
    console.log(`OK: artists/${doc.id} already exists (slug=${artist.slug}) — bio/socials updated`);
  }

  return artist.slug;
}

async function linkToEventSeven(slug: string): Promise<void> {
  const artistSnap = await db.collection("artists").where("slug", "==", slug).get();
  if (artistSnap.empty) {
    console.warn(`WARN: artist ${slug} not found for #7 link`);
    return;
  }
  const artistId = artistSnap.docs[0].id;

  const eventSnap = await db.collection("events").where("number", "==", 7).get();
  if (eventSnap.empty) {
    console.warn("WARN: event #7 not found — run update-coc7.ts first.");
    return;
  }

  for (const eventDoc of eventSnap.docs) {
    const data = eventDoc.data();
    const artists: { artistId: string; order: number }[] = Array.isArray(data.artists)
      ? data.artists
      : [];

    if (artists.some((a) => a.artistId === artistId)) {
      console.log(`OK: event ${eventDoc.id} already lists ${slug}`);
      continue;
    }

    artists.push({ artistId, order: artists.length });
    await eventDoc.ref.update({ artists, updatedAt: new Date() });
    console.log(`OK: linked ${slug} -> event ${eventDoc.id} as artist #${artists.length}`);

    const artistDoc = artistSnap.docs[0];
    const linkedEvents: string[] = Array.isArray(artistDoc.data().linkedEvents)
      ? artistDoc.data().linkedEvents
      : [];
    if (!linkedEvents.includes(eventDoc.id)) {
      linkedEvents.push(eventDoc.id);
      await artistDoc.ref.update({ linkedEvents });
    }
  }
}

async function run() {
  const codes: Record<string, string> = {};

  for (const artist of CONFIRMED_ARTISTS) {
    await upsertArtist(artist);
    await linkToEventSeven(artist.slug);
    codes[passcode()] = artist.slug;
  }

  console.log("\n=========================================");
  console.log("PORTAL PASSCODES (generated this run)");
  console.log("=========================================");
  for (const [code, slug] of Object.entries(codes)) {
    console.log(`${slug.padEnd(20)} -> ${code}`);
  }
  console.log("\nMerge into ARTIST_PASSCODES env var (.env.local AND Vercel):");
  console.log(JSON.stringify(codes, null, 2));
  console.log("\nPortal URL to share: https://cocconcertz.com/login");
  console.log("=========================================");
  console.log(
    "\nNOTE: WaveWarZ crew entries are commented out in this script. Uncomment and re-run once lineup is confirmed (week of show)."
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
