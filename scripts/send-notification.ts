/**
 * Send a push notification to everyone who added the COC Mini App with
 * notifications enabled. Tokens come from the Farcaster webhook
 * (src/app/api/webhook/farcaster/route.ts -> Firestore notificationTokens).
 *
 * Usage:
 *   npx tsx scripts/send-notification.ts \
 *     --id "coc7-showday-2026-07-18" \
 *     --title "COC Concertz #7 is LIVE" \
 *     --body "WaveWarZ Takeover starts now. DJ Zaal on the decks." \
 *     [--url https://cocconcertz.com] [--dry-run]
 *
 * The --id is the stable notificationId: retries within 24h dedupe per user,
 * so re-running the same send is safe. Warpcast limits: 1/30s and 100/day
 * per token; batches of up to 100 tokens per POST per host url.
 */
import { adminDb } from "./lib/admin-init";

const db = adminDb();

interface TokenDoc {
  fid: number;
  token: string;
  url: string;
  enabled: boolean;
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const notificationId = arg("id");
  const title = arg("title");
  const body = arg("body");
  const targetUrl = arg("url") ?? "https://cocconcertz.com";
  const dryRun = process.argv.includes("--dry-run");

  if (!notificationId || !title || !body) {
    console.error('Usage: send-notification.ts --id <stable-id> --title "..." --body "..." [--url <url>] [--dry-run]');
    process.exit(1);
  }
  if (title.length > 32) console.warn(`WARN: title ${title.length} chars (spec max 32) - may truncate`);
  if (body.length > 128) console.warn(`WARN: body ${body.length} chars (spec max 128) - may truncate`);

  const snap = await db.collection("notificationTokens").where("enabled", "==", true).get();
  const docs = snap.docs.map((d) => d.data() as TokenDoc).filter((t) => t.token && t.url);
  console.log(`${docs.length} enabled token(s).`);
  if (docs.length === 0) return;

  // Group by host url, batch 100 tokens per POST
  const byUrl = new Map<string, string[]>();
  for (const t of docs) {
    const list = byUrl.get(t.url) ?? [];
    list.push(t.token);
    byUrl.set(t.url, list);
  }

  for (const [url, tokens] of byUrl) {
    for (let i = 0; i < tokens.length; i += 100) {
      const batch = tokens.slice(i, i + 100);
      if (dryRun) {
        console.log(`DRY RUN: would POST ${batch.length} token(s) to ${url}`);
        continue;
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId,
          title,
          body,
          targetUrl,
          tokens: batch,
        }),
      });
      const result = await res.json().catch(() => ({}));
      const ok = result.successfulTokens?.length ?? 0;
      const invalid: string[] = result.invalidTokens ?? [];
      const rateLimited = result.rateLimitedTokens?.length ?? 0;
      console.log(`${url}: ${ok} sent, ${invalid.length} invalid, ${rateLimited} rate-limited (HTTP ${res.status})`);

      // Disable invalid tokens so future sends skip them
      for (const bad of invalid) {
        const match = docs.find((t) => t.token === bad);
        if (match) {
          await db.collection("notificationTokens").doc(String(match.fid)).set(
            { enabled: false, updatedAt: new Date() },
            { merge: true }
          );
        }
      }
    }
  }
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
