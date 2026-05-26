/**
 * Bulk-upsert artist Firestore docs with public socialLinks gathered
 * via web research on 2026-05-26. Idempotent - merges into existing
 * socialLinks, doesn't overwrite fields not in ARTISTS below.
 *
 * Source for each link: thezao.com community page, artist's official
 * website, or direct platform search. Empty fields = not found publicly,
 * need Zaal to fill in.
 *
 * Run: `npx tsx scripts/seed-artist-socials.ts`.
 */
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
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

interface ArtistSeed {
  slug: string;
  stageName: string;
  socialLinks: Record<string, string>;
}

const ARTISTS: ArtistSeed[] = [
  {
    slug: "attabotty",
    stageName: "ATTABOTTY",
    socialLinks: {
      website: "https://www.attabotty.com",
      twitter: "https://twitter.com/AttaBotty",
      youtube: "https://www.youtube.com/channel/UC3cB4FnMIRKcNFGUOPvNvsg",
    },
  },
  {
    slug: "clejan",
    stageName: "CLEJAN",
    socialLinks: {
      website: "https://clejan.com",
      twitter: "https://twitter.com/clejanmusic",
      spotify: "https://open.spotify.com/artist/6CbxzZHyeIz1Pig7giCufl",
      youtube: "https://www.youtube.com/channel/UCoYv2XQDO0jEBdu6e1HO0oQ",
    },
  },
  {
    slug: "fellenz",
    stageName: "TOM FELLENZ",
    socialLinks: {
      website: "https://linktr.ee/fellenzmusic",
      twitter: "https://x.com/fellenzmusic",
      youtube: "https://www.youtube.com/tfellenz",
    },
  },
  {
    slug: "stilo",
    stageName: "STILO WORLD",
    socialLinks: {
      website: "https://stilo.world",
    },
  },
  {
    slug: "godcloud",
    stageName: "GODCLOUD",
    socialLinks: {
      website: "https://www.godcloud.org",
      twitter: "https://x.com/therealgodcloud",
    },
  },
  // Joseph Goats: no public X/website found via search 2026-05-26.
  // TODO: Zaal to provide handles. Stub creates the doc so portal can edit.
  {
    slug: "joseph-goats",
    stageName: "JOSEPH GOATS",
    socialLinks: {},
  },
  // DUO DØ MUSICA: no public links found via search 2026-05-26.
  // TODO: Zaal to provide handles + confirm canonical slug.
];

async function upsert(seed: ArtistSeed): Promise<void> {
  const existing = await db.collection("artists").where("slug", "==", seed.slug).get();
  const now = new Date();

  if (existing.empty) {
    const ref = db.collection("artists").doc();
    await ref.set({
      userId: "",
      stageName: seed.stageName,
      slug: seed.slug,
      bio: "",
      profilePhoto: "",
      socialLinks: seed.socialLinks,
      cardCustomization: {},
      linkedEvents: [],
      createdAt: now,
    });
    console.log(`OK: created artists/${ref.id} (slug=${seed.slug})`);
    return;
  }

  // Merge - never overwrite an existing populated field with empty
  for (const doc of existing.docs) {
    const data = doc.data();
    const current = (data.socialLinks ?? {}) as Record<string, string>;
    const merged: Record<string, string | FieldValue> = { ...current };
    for (const [k, v] of Object.entries(seed.socialLinks)) {
      if (v && !current[k]) merged[k] = v;
    }
    await doc.ref.update({ socialLinks: merged });
    console.log(
      `OK: merged socialLinks into artists/${doc.id} (slug=${seed.slug}) - keys: ${Object.keys(merged).join(", ") || "(none)"}`
    );
  }
}

async function run() {
  for (const seed of ARTISTS) {
    await upsert(seed);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
