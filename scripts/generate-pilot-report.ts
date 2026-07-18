/**
 * COC #7 Pilot Report Generator
 *
 * Reads Firestore (gallery count, visitor count, contest entries) and Supabase
 * (archive_uploads for coc7 show) and prints a formatted show-night summary.
 *
 * Run Saturday morning after the show:
 *   npx tsx scripts/generate-pilot-report.ts
 *
 * Requires in .env.local:
 *   FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (optional — prints warning if missing)
 */
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (getApps().length === 0) {
  const { FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY } = process.env;
  if (!FIREBASE_ADMIN_PROJECT_ID || !FIREBASE_ADMIN_CLIENT_EMAIL || !FIREBASE_ADMIN_PRIVATE_KEY) {
    console.error("Missing Firebase Admin env vars. Add to .env.local:\n  FIREBASE_ADMIN_PROJECT_ID\n  FIREBASE_ADMIN_CLIENT_EMAIL\n  FIREBASE_ADMIN_PRIVATE_KEY");
    process.exit(1);
  }
  initializeApp({
    credential: cert({
      projectId: FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const fs = getFirestore();

async function firestoreMetrics() {
  const [gallerySnap, visitorsDoc, visitorsPeakDoc, contestSnap] = await Promise.all([
    fs.collection("gallery").count().get(),
    fs.doc("stats/visitors").get(),
    fs.doc("stats/visitors_peak").get(),
    fs.collection("contestEntries").count().get(),
  ]);
  return {
    galleryCount: gallerySnap.data().count as number,
    concurrentNow: visitorsDoc.exists ? ((visitorsDoc.data()?.count as number) ?? 0) : 0,
    peakConcurrent: visitorsPeakDoc.exists ? ((visitorsPeakDoc.data()?.count as number) ?? 0) : 0,
    contestCount: contestSnap.data().count as number,
  };
}

async function supabaseMetrics() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { skipped: true as const, reason: "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set" };
  }

  const sb = createClient(url, key);
  const { data: uploads, error } = await sb
    .from("archive_uploads")
    .select("id, file_type, upload_type, uploaded_by_wallet, created_at")
    .or("show_id.eq.coc7-showday,show_id.ilike.coc7%");

  if (error) return { skipped: true as const, reason: error.message };

  const byType: Record<string, number> = {};
  for (const u of uploads ?? []) {
    const t = (u.file_type as string) ?? "unknown";
    byType[t] = (byType[t] ?? 0) + 1;
  }
  const uniqueWallets = new Set(
    (uploads ?? []).map((u) => u.uploaded_by_wallet as string).filter(Boolean),
  );

  return {
    skipped: false as const,
    total: uploads?.length ?? 0,
    uniqueWallets: uniqueWallets.size,
    byType,
  };
}

async function main() {
  const sep = "─".repeat(52);
  console.log(`\n${"═".repeat(52)}`);
  console.log("  COC Concertz #7: WaveWarZ Takeover — Pilot Report");
  console.log(`${"═".repeat(52)}`);
  console.log(`  Generated : ${new Date().toISOString()}`);
  console.log(`  Show date : 2026-07-18 4:00 PM EST`);
  console.log(`  Pilot mode: wallet gate DISABLED (open uploads)\n`);

  const [fire, sb] = await Promise.all([firestoreMetrics(), supabaseMetrics()]);

  console.log(`${sep}`);
  console.log("  FIRESTORE");
  console.log(`${sep}`);
  console.log(`  Peak concurrent  : ${fire.peakConcurrent} (max simultaneous during show)`);
  console.log(`  Current live     : ${fire.concurrentNow} (near-0 is normal post-show)`);
  console.log(`  Gallery uploads  : ${fire.galleryCount}`);
  console.log(`  Contest entries  : ${fire.contestCount}`);

  console.log(`\n${sep}`);
  console.log("  SUPABASE (archive_uploads, show_id=coc7*)");
  console.log(`${sep}`);
  if (sb.skipped) {
    console.log(`  SKIPPED — ${sb.reason}`);
    console.log("  Add NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to .env.local");
  } else {
    console.log(`  Total uploads    : ${sb.total}`);
    console.log(`  Unique wallets   : ${sb.uniqueWallets}`);
    if (Object.keys(sb.byType).length > 0) {
      console.log("  By file type:");
      for (const [type, count] of Object.entries(sb.byType).sort()) {
        console.log(`    ${type.padEnd(12)}: ${count}`);
      }
    }
  }

  const peakLabel = fire.peakConcurrent > 0 ? `${fire.peakConcurrent} peak concurrent` : "peak not tracked (deploy fix/track-peak-visitors before next show)";
  console.log(`\n${"═".repeat(52)}`);
  console.log("  SUMMARY");
  console.log(`${"═".repeat(52)}`);
  console.log(`  Viewers (peak)   : ${peakLabel}`);
  console.log(`  Gallery uploads  : ${fire.galleryCount}`);
  console.log(`  Contest entries  : ${fire.contestCount}`);
  console.log(`\n${sep}`);
  console.log("  NEXT STEPS (doc 1300 — 72h action plan)");
  console.log(`${sep}`);
  console.log("  1. Compare gallery count vs COC #6 baseline");
  console.log("  2. Post recap to FC /cocconcertz + X thread");
  console.log("  3. Close board task 23789082 with final numbers");
  console.log("  4. Lock COC #8 date by Mon Jul 21 (doc 1295 + doc 1367)");
  console.log(`${"═".repeat(52)}\n`);
}

main().catch((err: unknown) => {
  console.error("Script failed:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
