/**
 * Reset Firestore visitor counters before each show.
 *
 * Run this ~1h before show start so the pilot report for the CURRENT show
 * gets a fresh peak, not the inherited peak from the previous show.
 *
 * What this does:
 *   stats/visitors       → count: 0   (live concurrent counter, also resets naturally
 *                                       as unload events fire, but zeroing is clean)
 *   stats/visitors_peak  → count: 0   (monotonic peak — must reset manually between shows)
 *
 * Safe to run multiple times (idempotent).
 * Run: `npx tsx scripts/reset-visitor-stats.ts`
 */
import { adminDb } from "./lib/admin-init";

const db = adminDb();

async function main() {
  const now = new Date();

  await db.doc("stats/visitors").set({ count: 0, resetAt: now }, { merge: true });
  console.log("OK: stats/visitors.count = 0");

  await db.doc("stats/visitors_peak").set({ count: 0, resetAt: now }, { merge: true });
  console.log("OK: stats/visitors_peak.count = 0");

  console.log("Done. Run `npx tsx scripts/check-cloudinary-perms.ts` next.");
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
