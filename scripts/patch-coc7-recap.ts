/**
 * Wire a YouTube video onto COC Concertz #7 (WaveWarZ Takeover).
 *
 * The recording exists - 78 minutes of it, `coc-concertz-7-space.m4a` on the
 * SanDisk - and the upload is Zaal's. This is the other half: once the video is
 * live, one command puts it on the event page. No code edit, no redeploy needed
 * beyond the usual, and no placeholder id sitting in the repo pretending to be
 * real.
 *
 *   npx tsx scripts/patch-coc7-recap.ts <youtubeId> ["Title for the card"]
 *   npx tsx scripts/patch-coc7-recap.ts dQw4w9WgXcQ "COC #7 Full Set"
 *
 * The id is the 11-character string after `watch?v=` - not the whole URL, though
 * a full URL is accepted and stripped.
 *
 * Idempotent: running it twice with the same id updates that entry rather than
 * adding a second copy. `/events/7` renders `recap.videos[].youtubeId` directly,
 * so a successful run is visible on the page.
 */
import { adminDb } from "./lib/admin-init";

const db = adminDb();

const DEFAULT_TITLE = "COC Concertz #7: WaveWarZ Takeover - full set";

/** Accept a bare id or any of the URL shapes, and reject anything else. */
function parseYouTubeId(input: string): string {
  const trimmed = input.trim();
  const patterns = [
    /^([A-Za-z0-9_-]{11})$/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/(?:embed|live|shorts)\/([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) return m[1];
  }
  throw new Error(
    `"${input}" is not a YouTube id or URL. Expected 11 characters of A-Z a-z 0-9 _ - ` +
      `(the part after watch?v=), or a full YouTube URL.`
  );
}

async function run() {
  const [rawId, rawTitle] = process.argv.slice(2);

  if (!rawId) {
    console.error(
      "FAIL: no YouTube id given.\n" +
        "  usage: npx tsx scripts/patch-coc7-recap.ts <youtubeId> [\"Title\"]\n" +
        "  Nothing is written without one - an empty or placeholder id would render\n" +
        "  a dead Watch card on /events/7, which is worse than no card at all."
    );
    process.exit(1);
  }

  const youtubeId = parseYouTubeId(rawId);
  const title = (rawTitle || DEFAULT_TITLE).trim();

  const snap = await db.collection("events").where("number", "==", 7).get();
  if (snap.empty) {
    console.error("FAIL: event #7 not found. Run scripts/update-coc7.ts first.");
    process.exit(1);
  }

  for (const doc of snap.docs) {
    const data = doc.data() as {
      recap?: { videos?: { youtubeId: string; title: string }[] };
    };
    const existing = data.recap?.videos ?? [];
    const others = existing.filter((v) => v.youtubeId !== youtubeId);
    const videos = [...others, { youtubeId, title }];

    await doc.ref.update({
      "recap.videos": videos,
      updatedAt: new Date(),
    });

    const verb = others.length === existing.length ? "added" : "updated";
    console.log(
      `OK: ${verb} video on events/${doc.id} (#7) - ${videos.length} video(s) total`
    );
    console.log(`    https://www.youtube.com/watch?v=${youtubeId}`);
  }

  console.log(
    "\nVerify on the page, not on this message: open /events/7 and check the Watch\n" +
      "card resolves. A write that returns OK is not a video anybody can play."
  );
}

run().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
