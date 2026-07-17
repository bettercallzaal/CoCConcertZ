/**
 * COC #7 Saturday pilot report generator.
 *
 * Fetches /api/metrics/coc7, handles both the base (PR #29) and enhanced
 * (PR #30+) response shapes, and prints a markdown pilot report ready to
 * paste into docs/coc7-post-show-capture.md or share directly.
 *
 * Usage (run Saturday morning after the show):
 *   npx tsx scripts/generate-pilot-report.ts
 *   npx tsx scripts/generate-pilot-report.ts --url https://www.cocconcertz.com
 *
 * No secrets needed — the metrics endpoint is public.
 */

const BASE_URL =
  process.argv.find((a) => a.startsWith("--url="))?.split("=")[1] ??
  (process.argv.indexOf("--url") !== -1
    ? process.argv[process.argv.indexOf("--url") + 1]
    : "https://www.cocconcertz.com");

// ── fetch ────────────────────────────────────────────────────────────────────

interface BaseMetrics {
  uniqueVisitors?: number;
  contestSubmissions?: number;
  galleryUploads?: number;
}

interface EnhancedMetrics extends BaseMetrics {
  concurrentViewers?: number;
  walletConnected?: number;
  walletNotConnected?: number;
  archiveUploads?: {
    total?: number;
    gateless?: number;
    fromWallet?: number;
    volumeMb?: number;
  };
  battleVotes?: {
    total?: number;
    byBattle?: Array<{ title: string; a: number; b: number; winner?: string }>;
  };
  pilotStatus?: {
    walletGateEnabled?: boolean;
    capturedAt?: string;
  };
}

interface MetricsResponse {
  event?: string;
  date?: string;
  metrics?: EnhancedMetrics;
  notes?: string;
  capturedAt?: string;
  error?: string;
}

async function fetchMetrics(url: string): Promise<MetricsResponse> {
  const res = await fetch(`${url}/api/metrics/coc7`, {
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<MetricsResponse>;
}

// ── format ───────────────────────────────────────────────────────────────────

function n(val: number | undefined | null, fallback = "??"): string {
  return val !== undefined && val !== null ? String(val) : fallback;
}

function bool(val: boolean | undefined | null, fallback = "??"): string {
  if (val === undefined || val === null) return fallback;
  return val ? "YES" : "NO";
}

function generateReport(data: MetricsResponse, fetchedAt: string): string {
  const m = data.metrics ?? {};
  const au = m.archiveUploads ?? {};
  const bv = m.battleVotes ?? {};
  const ps = m.pilotStatus ?? {};

  // Handle both field name variants (PR #29 vs PR #30)
  const visitors = m.concurrentViewers ?? m.uniqueVisitors;
  const contestSubs = m.contestSubmissions;
  const galleryUps = m.galleryUploads;
  const archiveTotal = au.total;
  const archiveGateless = au.gateless;
  const archiveVol = au.volumeMb;
  const walletOn = ps.walletGateEnabled;
  const battleTotal = bv.total;
  const battlesByBattle = bv.byBattle ?? [];

  const lines: string[] = [];

  lines.push(`# COC #7 WaveWarZ Takeover — Pilot Report`);
  lines.push(`**Show date:** Sat Jul 18, 2026, 4PM EST`);
  lines.push(`**Report generated:** ${fetchedAt}`);
  lines.push(`**Metrics captured:** ${data.capturedAt ?? ps.capturedAt ?? "?"}`);
  lines.push(``);

  lines.push(`## Pilot Gate Status`);
  lines.push(`| Field | Value |`);
  lines.push(`|---|---|`);
  lines.push(`| Wallet gate enabled | ${bool(walletOn)} |`);
  lines.push(`| Gate was OFF for pilot | ${bool(walletOn === false || walletOn === undefined && true)} |`);
  lines.push(``);

  lines.push(`## Attendance`);
  lines.push(`| Metric | Value | Notes |`);
  lines.push(`|---|---|---|`);
  lines.push(`| Site visitors | ${n(visitors)} | Unique sessions hitting the site |`);
  if (m.walletConnected !== undefined || m.walletNotConnected !== undefined) {
    lines.push(`| Wallet-connected visitors | ${n(m.walletConnected)} | Had a wallet even though gate was off |`);
    lines.push(`| Wallet-not-connected | ${n(m.walletNotConnected)} | Pure gateless audience |`);
  }
  lines.push(``);

  lines.push(`## Archive Uploads`);
  lines.push(`| Metric | Value |`);
  lines.push(`|---|---|`);
  lines.push(`| Total archive uploads | ${n(archiveTotal ?? galleryUps)} |`);
  if (au.gateless !== undefined) lines.push(`| Gateless uploads | ${n(archiveGateless)} |`);
  if (au.fromWallet !== undefined) lines.push(`| Wallet uploads | ${n(au.fromWallet)} |`);
  if (au.volumeMb !== undefined) lines.push(`| Total volume | ${n(archiveVol)} MB |`);
  if (galleryUps !== undefined && archiveTotal === undefined) {
    lines.push(`| Gallery uploads | ${n(galleryUps)} |`);
  }
  lines.push(``);

  lines.push(`## Contest`);
  lines.push(`| Metric | Value |`);
  lines.push(`|---|---|`);
  lines.push(`| Contest submissions | ${n(contestSubs)} |`);
  lines.push(``);

  lines.push(`## WaveWarZ Battle Votes`);
  lines.push(`| Metric | Value |`);
  lines.push(`|---|---|`);
  lines.push(`| Total battle votes | ${n(battleTotal)} |`);
  if (battlesByBattle.length > 0) {
    lines.push(``);
    lines.push(`### Battle Results`);
    for (const b of battlesByBattle) {
      const winner = b.winner ?? "??";
      lines.push(`- **${b.title}**: ${b.a} vs ${b.b} → Winner: ${winner}`);
    }
  }
  lines.push(``);

  lines.push(`## Pilot Question: Does dropping the wallet gate change the audience?`);
  lines.push(``);
  if (m.walletConnected !== undefined && m.walletNotConnected !== undefined) {
    const total = (m.walletConnected ?? 0) + (m.walletNotConnected ?? 0);
    const pct = total > 0
      ? Math.round(((m.walletNotConnected ?? 0) / total) * 100)
      : 0;
    lines.push(
      `**${pct}%** of visitors had no wallet (${n(m.walletNotConnected)} of ${n(total)}). ` +
      `${n(m.walletConnected)} were wallet-connected even without a gate.`
    );
    lines.push(``);
    if (pct > 50) {
      lines.push(`Conclusion: The open gate DID bring in a new audience — majority were non-wallet users.`);
    } else {
      lines.push(`Conclusion: Most attendees were wallet users even without a gate. Gate may not be the friction point.`);
    }
  } else {
    lines.push(`Wallet-split data not captured (requires PR #30 metrics enhancement).`);
    lines.push(`Proxy: ${n(visitors)} site visitors total. Compare against COC #6 baseline to assess impact.`);
  }
  lines.push(``);

  lines.push(`## Raw data`);
  lines.push(``);
  lines.push(`\`\`\`json`);
  lines.push(JSON.stringify({ metrics: m, capturedAt: data.capturedAt }, null, 2));
  lines.push(`\`\`\``);

  return lines.join("\n");
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.error(`Fetching metrics from ${BASE_URL}/api/metrics/coc7 ...`);
  const data = await fetchMetrics(BASE_URL);
  if (data.error) {
    console.error(`Error: ${data.error}`);
    process.exit(1);
  }
  const report = generateReport(data, new Date().toISOString());
  console.log(report);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
