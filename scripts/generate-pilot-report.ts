/**
 * COC #7 Pilot Report Generator
 *
 * Queries Firestore + Supabase and prints a filled pilot report for doc 1393
 * (gate matrix) and doc 1395 (media kit). Run the morning after the show.
 *
 * Usage:
 *   npx tsx scripts/generate-pilot-report.ts
 *
 * Prerequisites:
 *   vercel link && vercel env pull .env.local   (pulls all required env vars)
 */

import { adminDb } from "./lib/admin-init";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

interface BattleResult {
  title: string;
  sideA: string;
  sideB: string;
  finalVotesA: number;
  finalVotesB: number;
  winner: "a" | "b" | null;
  winnerName: string;
}

async function main() {
  const db = adminDb();

  // ── Firestore: visitor stats ─────────────────────────────────────────────
  const [visitorsSnap, peakSnap] = await Promise.all([
    db.doc("stats/visitors").get(),
    db.doc("stats/visitors_peak").get(),
  ]);

  const concurrentViewers: number = visitorsSnap.data()?.count ?? 0;
  const peakViewers: number = peakSnap.data()?.count ?? 0;

  // ── Firestore: gallery count ─────────────────────────────────────────────
  const gallerySnap = await db.collection("gallery").count().get();
  const galleryUploads: number = gallerySnap.data().count;

  // ── Firestore: contest entries ───────────────────────────────────────────
  const contestSnap = await db.collection("contestEntries").count().get();
  const contestEntries: number = contestSnap.data().count;

  // ── Firestore: battle results ────────────────────────────────────────────
  const battlesSnap = await db
    .collection("battles")
    .where("status", "==", "closed")
    .orderBy("closedAt", "asc")
    .get();

  const battles: BattleResult[] = battlesSnap.docs.map((d) => {
    const data = d.data();
    const winnerName =
      data.winner === "a"
        ? data.sideA
        : data.winner === "b"
          ? data.sideB
          : "TIE";
    return {
      title: data.title ?? "Unknown",
      sideA: data.sideA ?? "Side A",
      sideB: data.sideB ?? "Side B",
      finalVotesA: data.finalVotesA ?? 0,
      finalVotesB: data.finalVotesB ?? 0,
      winner: data.winner ?? null,
      winnerName,
    };
  });

  // ── Supabase: archive uploads ────────────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let archiveUploads = 0;
  let uniqueWallets = 0;

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: archiveData, error } = await supabase
      .from("archive_uploads")
      .select("uploaded_by_wallet")
      .like("show_id", "coc7%");

    if (error) {
      console.warn("Supabase archive_uploads error:", error.message);
    } else if (archiveData) {
      archiveUploads = archiveData.length;
      uniqueWallets = new Set(archiveData.map((r) => r.uploaded_by_wallet)).size;
    }
  } else {
    console.warn("Supabase env vars not set — archive_uploads skipped.");
  }

  // ── Print report ─────────────────────────────────────────────────────────
  const now = new Date().toISOString();

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║              COC #7 PILOT REPORT — WaveWarZ Takeover             ║
║                    Generated: ${now.slice(0, 16).replace("T", " ")} UTC                ║
╚══════════════════════════════════════════════════════════════════╝

── ATTENDANCE ──────────────────────────────────────────────────────
  Peak concurrent viewers (cocconcertz.com)  : ${peakViewers === 0 ? "⚠ 0 — did PR #50 merge before show?" : peakViewers}
  Current concurrent viewers (at report time): ${concurrentViewers}

── CONTENT ─────────────────────────────────────────────────────────
  Gallery uploads (Firestore .gallery)        : ${galleryUploads}
  Archive uploads to Arweave (Supabase)       : ${archiveUploads}
  Unique contributor wallets                  : ${uniqueWallets}

── COMMUNITY ───────────────────────────────────────────────────────
  Contest entries (Firestore .contestEntries) : ${contestEntries}

── BATTLE RESULTS ──────────────────────────────────────────────────`);

  if (battles.length === 0) {
    console.log("  No closed battles found.");
  } else {
    battles.forEach((b, i) => {
      console.log(
        `  Battle ${i + 1}: ${b.title}\n` +
          `    ${b.sideA} ${b.finalVotesA} — ${b.finalVotesB} ${b.sideB}\n` +
          `    Winner: ${b.winnerName} (total votes: ${b.finalVotesA + b.finalVotesB})`
      );
    });
  }

  const totalVotes = battles.reduce(
    (sum, b) => sum + b.finalVotesA + b.finalVotesB,
    0
  );

  console.log(`
── GATE MATRIX (doc 1393) ──────────────────────────────────────────
  Fill Twitch peak and Spatial peak manually from each platform's analytics.

  Metric              Value             Gate
  ─────────────────────────────────────────────────────────────────
  Peak site viewers   ${String(peakViewers).padEnd(17)} ${gateLabel("viewers", peakViewers)}
  Gallery uploads     ${String(galleryUploads).padEnd(17)} ${gateLabel("gallery", galleryUploads)}
  Archive uploads     ${String(archiveUploads).padEnd(17)} ${gateLabel("archive", archiveUploads)}
  Contest entries     ${String(contestEntries).padEnd(17)} ${gateLabel("contest", contestEntries)}
  Total battle votes  ${String(totalVotes).padEnd(17)} (manual cross-check with BattleVote)

── FILL INTO DOC 1395 (MEDIA KIT) ─────────────────────────────────
  [PEAK_VIEWERS]      = ${peakViewers}
  [GALLERY_UPLOADS]   = ${galleryUploads}
  [ARCHIVE_UPLOADS]   = ${archiveUploads}
  [UNIQUE_WALLETS]    = ${uniqueWallets}
  [CONTEST_ENTRIES]   = ${contestEntries}
  [BATTLE_VOTES_1]    = ${battles[0] ? battles[0].finalVotesA + battles[0].finalVotesB : "N/A"}
  [BATTLE_VOTES_2]    = ${battles[1] ? battles[1].finalVotesA + battles[1].finalVotesB : "N/A"}
  [BATTLE_1_WINNER]   = ${battles[0]?.winnerName ?? "N/A"}
  [BATTLE_2_WINNER]   = ${battles[1]?.winnerName ?? "N/A"}
  [TWITCH_PEAK]       = (check Twitch Analytics → Stream Summary)
  [SPATIAL_PEAK]      = (check Spatial admin if available)
  [HEADLINE_QUOTE]    = (write after the show — 1-2 sentences, honest)
`);
}

function gateLabel(metric: string, value: number): string {
  // Gate thresholds from doc 1393
  const gates: Record<string, [number, number, number]> = {
    viewers:  [10, 25, 50],   // RED < 10, YELLOW 10-24, GREEN 25-49, GREAT 50+
    gallery:  [5, 15, 30],    // RED < 5, YELLOW 5-14, GREEN 15-29, GREAT 30+
    archive:  [3, 10, 20],    // RED < 3, YELLOW 3-9, GREEN 10-19, GREAT 20+
    contest:  [2, 5, 10],     // RED < 2, YELLOW 2-4, GREEN 5-9, GREAT 10+
  };
  const [red, green, great] = gates[metric] ?? [0, 0, 0];
  if (value === 0 && metric === "viewers") return "⚠  CHECK PR #50";
  if (value < red) return "🔴 RED";
  if (value < green) return "🟡 YELLOW";
  if (value < great) return "🟢 GREEN";
  return "⭐ GREAT";
}

main().catch((err) => {
  console.error("Pilot report failed:", err);
  process.exit(1);
});
