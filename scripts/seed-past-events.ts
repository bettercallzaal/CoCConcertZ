/**
 * Upserts Firestore docs for COC Concertz #1-#4 with name, date, flyer,
 * lineup links (resolved from artists collection by slug), and recap
 * content. Run after seed-artist-socials.ts + seed-iman-crew.ts +
 * setup-coc6-artists.ts + seed-duo-do.ts so the artist docs exist.
 *
 * #5 + #6 are already in Firestore (handled by update-coc5.ts +
 * update-coc6.ts). This script DOES NOT touch them.
 *
 * Idempotent: re-runs merge new fields and update artist links.
 *
 * Run: `npx tsx scripts/seed-past-events.ts`.
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

const SPATIAL = "https://www.spatial.io/s/Dope-Stilo-Music-Club-66ed19e8c23d0d0c2a3d51c0";

interface EventSeed {
  number: number;
  name: string;
  date: Date;
  flyerUrl: string;
  description: string;
  rsvpLink: string;
  spatialLink: string;
  artistSlugs: string[];
  recap?: {
    summary: string;
    highlights?: string[];
    videos?: { title: string; youtubeId: string; artist?: string }[];
    transcriptUrls?: string[];
  };
}

const EVENTS: EventSeed[] = [
  {
    number: 1,
    name: "+COC Concertz #1",
    date: new Date("2025-03-29T20:00:00Z"),
    flyerUrl: "/images/coc1-flyer.png",
    description:
      "The first-ever COC Concertz - AttaBotty and Clejan live in a Spatial metaverse venue. Proof of concept for what became the series.",
    rsvpLink: "",
    spatialLink: SPATIAL,
    artistSlugs: ["attabotty", "clejan"],
    recap: {
      summary:
        "The pilot. AttaBotty opened with an immersive audiovisual set blending lo-fi, EDM, and cinematic orchestra with 2D/3D animation. Clejan followed with a trap-violin set built around his signature classical-meets-hip-hop sound. Two artists, one Spatial venue, the genesis of the whole COC Concertz series.",
      highlights: [
        "First time COC ran live music inside a Spatial.io metaverse venue",
        "AttaBotty's audiovisual storytelling - sound design + live animation",
        "Clejan's trap violin - the signature 'Trap Violin' style live on chain",
        "Established the format that #2 through #6 iterate on",
      ],
      videos: [
        { title: "Attabotty Flyin", youtubeId: "-ggYAdu4KRE", artist: "AttaBotty" },
        { title: "Altered Pathways", youtubeId: "E0xE65RRKI0", artist: "AttaBotty" },
        { title: "Clejan Intro", youtubeId: "rFKN-WobG9Y", artist: "Clejan" },
      ],
    },
  },
  {
    number: 2,
    name: "+COC Concertz #2",
    date: new Date("2025-10-11T20:00:00Z"),
    flyerUrl: "/images/concertz2-flyer.jpg",
    description:
      "Second installment. Tom Fellenz opened with a 30-minute live set in the SaltyVerse Auditorium. Stilo World DJ'd an extended WaveWarZ set blending beats with Web3 culture. AttaBotty returned to close with another audiovisual set.",
    rsvpLink: "",
    spatialLink: SPATIAL,
    artistSlugs: ["fellenz", "stilo", "attabotty"],
    recap: {
      summary:
        "Bigger crowd, bigger sound. Three artists, three sets, one venue. Tom Fellenz opened with a live performance, Stilo World DJ'd WaveWarZ (the English vs Spanish community battle format), and AttaBotty closed with a 30-minute audiovisual finale.",
      highlights: [
        "First time WaveWarZ ran inside a COC Concertz",
        "Tom Fellenz solo live set in the SaltyVerse Auditorium",
        "Stilo World's extended Web3-DJ set",
        "AttaBotty's closing audiovisual performance",
      ],
      videos: [
        { title: "Live Set", youtubeId: "0MIJ0YSVe5s", artist: "Tom Fellenz" },
        { title: "WaveWarZ Battle", youtubeId: "zYm3g_YUYjE", artist: "Stilo World" },
        { title: "Closing Set", youtubeId: "-nx9gZtK8ug", artist: "AttaBotty" },
      ],
    },
  },
  {
    number: 3,
    name: "+COC Concertz #3",
    date: new Date("2026-03-07T20:00:00Z"),
    flyerUrl: "/images/concertz3-flyer.jpeg",
    description:
      "Three-act show in StiloWorld. Dúo Dø Musica opened (4:15-4:45 PM EST), Joseph Goats took the middle slot (4:45-5:15), and Stilo World closed with a live set + the English vs Spanish WaveWarZ community battle.",
    rsvpLink: "",
    spatialLink: SPATIAL,
    artistSlugs: ["duo-do-musica", "joseph-goats", "stilo"],
    recap: {
      summary:
        "Three sets, one battle. Dúo Dø Musica opened the room with a Latin music live set. Joseph Goats took the middle slot. Stilo World closed with a live set leading directly into the English vs Spanish WaveWarZ Community Battle.",
      highlights: [
        "First Dúo Dø Musica appearance on COC Concertz",
        "Joseph Goats live set (still going by Jose at the time)",
        "Stilo World's English vs Spanish WaveWarZ Community Battle",
      ],
      videos: [
        { title: "Outro", youtubeId: "gGAQ_tkBMpQ", artist: "COC Concertz #3" },
      ],
    },
  },
  {
    number: 4,
    name: "+COC Concertz #4",
    date: new Date("2026-04-11T20:00:00Z"),
    flyerUrl: "/images/coc4.jpg",
    description:
      "The rebrand show. Joseph Goats (formerly Jose), Tom Fellenz (formerly FΞLLΞNZ), and Stilo World - all three pivoting their projects. Hosted by BetterCallZaal and ThyRevolution in StiloWorld on Spatial.",
    rsvpLink: "https://luma.com/0ksej24k",
    spatialLink: SPATIAL,
    artistSlugs: ["joseph-goats", "fellenz", "stilo"],
    recap: {
      summary:
        "Called 'the rebrand concert' on-air because all three artists were mid-pivot. Joseph Goats (rebranded from Jose to bridge into English-language audiences) opened with Spanish-language reggae from the Venezuelan Amazon and a shout to the Huottoja community. Tom Fellenz (formerly FΞLLΞNZ) did a pure-guitar set - acoustic, vineyard-bound - signaling his pivot toward live wine venue performances. Stilo World previewed his Ambition album, talked vibe-coding the COC portal, and pitched community voting on the next lineup.",
      highlights: [
        "Joseph Goats: bilingual reggae set + Huottoja (Venezuelan Amazon) community call-to-action",
        "Tom Fellenz: stripped-down acoustic guitar set + new vineyard-music direction",
        "Stilo World: Ambition album preview + vibe-coding the COC artist portal that ships in this same PR cycle",
        "Hosts pitched community-voting on next concert lineup via a custom tool",
        "First COC show held in the Dope Stilo Music Club (the same venue #5 and #6 use)",
      ],
      videos: [
        { title: "Intro", youtubeId: "LF7qcZnF7XY", artist: "COC Concertz #4" },
        { title: "Live Performance", youtubeId: "-SOwQ5xR714", artist: "Joseph Goats" },
        { title: "Live Performance", youtubeId: "uvURHoFXoVs", artist: "Tom Fellenz" },
        { title: "Live Performance", youtubeId: "iwkDtZHuQPE", artist: "Stilo World" },
      ],
    },
  },
];

async function resolveArtistIds(slugs: string[]): Promise<{ artistId: string; order: number }[]> {
  const results: { artistId: string; order: number }[] = [];
  for (let i = 0; i < slugs.length; i++) {
    const snap = await db.collection("artists").where("slug", "==", slugs[i]).get();
    if (snap.empty) {
      console.warn(`WARN: artist slug=${slugs[i]} not found, skipping link`);
      continue;
    }
    results.push({ artistId: snap.docs[0].id, order: i });
  }
  return results;
}

async function upsertEvent(seed: EventSeed): Promise<string> {
  const existing = await db.collection("events").where("number", "==", seed.number).get();
  const now = new Date();
  const artistLinks = await resolveArtistIds(seed.artistSlugs);

  const payload = {
    name: seed.name,
    number: seed.number,
    date: seed.date,
    description: seed.description,
    rsvpLink: seed.rsvpLink,
    venue: { spatialLink: seed.spatialLink },
    status: "completed",
    flyerUrl: seed.flyerUrl,
    bannerUrl: seed.flyerUrl,
    artists: artistLinks,
    ...(seed.recap ? { recap: seed.recap } : {}),
    updatedAt: now,
  };

  if (existing.empty) {
    const ref = db.collection("events").doc();
    await ref.set({ ...payload, createdAt: now });
    console.log(`OK: created events/${ref.id} (#${seed.number})`);
    return ref.id;
  }

  for (const doc of existing.docs) {
    await doc.ref.update(payload);
    console.log(`OK: patched events/${doc.id} (#${seed.number}) - ${artistLinks.length} artists linked`);
  }
  return existing.docs[0].id;
}

async function mirrorLinkedEvents(): Promise<void> {
  // For every artist in any past event's artists[], add the eventId to that artist's linkedEvents
  for (const seed of EVENTS) {
    const eventSnap = await db.collection("events").where("number", "==", seed.number).get();
    if (eventSnap.empty) continue;
    const eventId = eventSnap.docs[0].id;

    for (const slug of seed.artistSlugs) {
      const artistSnap = await db.collection("artists").where("slug", "==", slug).get();
      if (artistSnap.empty) continue;
      const artistDoc = artistSnap.docs[0];
      const linkedEvents: string[] = Array.isArray(artistDoc.data().linkedEvents)
        ? artistDoc.data().linkedEvents
        : [];
      if (!linkedEvents.includes(eventId)) {
        linkedEvents.push(eventId);
        await artistDoc.ref.update({ linkedEvents });
        console.log(`OK: linked artists/${slug} <- event #${seed.number}`);
      }
    }
  }
}

async function run() {
  for (const seed of EVENTS) {
    await upsertEvent(seed);
  }
  await mirrorLinkedEvents();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
