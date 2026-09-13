/**
 * Put the correct YouTube videos on the event pages for COC Concertz #1-#6.
 *
 * Writes only `recap.videos` (and `updatedAt`) on each event doc, from
 * scripts/lib/past-show-videos.ts. Summary, highlights, transcripts, artists
 * and dates are left alone.
 *
 * Dry run by default: prints what each page shows now and what it will show.
 * Nothing is written without --apply.
 *
 *   npx tsx scripts/patch-past-show-videos.ts           # dry run
 *   npx tsx scripts/patch-past-show-videos.ts --apply   # write
 *
 * Idempotent. After --apply, check https://cocconcertz.com/events/<n> - a
 * write that returns OK is not proof the page changed.
 */
import { adminDb } from "./lib/admin-init";
import { PAST_SHOW_VIDEOS } from "./lib/past-show-videos";
import type { RecapVideo } from "../src/lib/types";

const db = adminDb();
const apply = process.argv.includes("--apply");

function describe(videos: RecapVideo[] | undefined): string {
  if (!videos || videos.length === 0) return "    (none)";
  return videos
    .map((v, i) => `    ${i + 1}. ${v.youtubeId}  ${v.artist ?? ""} - ${v.title}`)
    .join("\n");
}

async function run() {
  let failed = false;

  for (const [key, videos] of Object.entries(PAST_SHOW_VIDEOS)) {
    const number = Number(key);
    const snap = await db.collection("events").where("number", "==", number).get();
    if (snap.empty) {
      console.error(`FAIL: event #${number} not found - nothing written for it`);
      failed = true;
      continue;
    }
    if (snap.size > 1) {
      console.error(`FAIL: ${snap.size} event docs have number=${number} - fix that first, nothing written for it`);
      failed = true;
      continue;
    }

    const doc = snap.docs[0];
    // A recap with videos and no summary renders an empty recap block.
    if (!doc.data().recap?.summary) {
      console.error(
        `FAIL: event #${number} has no recap summary - run scripts/patch-coc${number}-recap.ts ` +
          `(it carries these videos too), nothing written for it`
      );
      failed = true;
      continue;
    }
    const current = (doc.data().recap?.videos ?? []) as RecapVideo[];
    const same = JSON.stringify(current) === JSON.stringify(videos);

    console.log(`\n#${number} events/${doc.id}${same ? " - already correct" : ""}`);
    if (!same) {
      console.log(`  now:\n${describe(current)}`);
      console.log(`  after:\n${describe(videos)}`);
    }

    if (apply && !same) {
      await doc.ref.update({ "recap.videos": videos, updatedAt: new Date() });
      console.log(`  OK: wrote ${videos.length} video(s)`);
    }
  }

  if (!apply) console.log("\nDry run. Re-run with --apply to write.");
  if (failed) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
