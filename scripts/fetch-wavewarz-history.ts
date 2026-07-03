/**
 * Bake a WaveWarZ battle-history snapshot into src/data/wavewarz-history.json
 * for the homepage WaveWarzHistory section. Scraper logic ported from
 * ZAOscout src/wavewarz-battles.ts (zod removed - manual validation).
 *
 * Run: `npx tsx scripts/fetch-wavewarz-history.ts` (no credentials needed).
 * Re-run before each show to refresh stats.
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const INTELLIGENCE_BASE = "https://wavewarz-intelligence.vercel.app";
const OUT = join(process.cwd(), "src/data/wavewarz-history.json");
const MAX_PAGES = 20;

export interface WaveWarzBattle {
  battleId: number;
  date: string | null;
  song1Title: string | null;
  song2Title: string | null;
  song1Handle: string | null;
  song2Handle: string | null;
  winnerTitle: string | null;
  totalVolumeSol: number | null;
  marginPct: number | null;
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

function toStr(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

/** Flight data escapes quotes as \". Normalize so the objects parse as JSON. */
function unescapeFlight(html: string): string {
  return html.replace(/\\"/g, '"');
}

/** Extract a balanced JSON object starting at the `{` index. */
function extractJsonObjectAt(s: string, startBrace: number): string | null {
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = startBrace; i < s.length; i += 1) {
    const ch = s[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return s.slice(startBrace, i + 1);
    }
  }
  return null;
}

function parsePage(html: string): WaveWarzBattle[] {
  const flight = unescapeFlight(html);
  const battles: WaveWarzBattle[] = [];
  const seen = new Set<number>();
  const marker = '{"battle_id":';
  let from = 0;
  while (true) {
    const idx = flight.indexOf(marker, from);
    if (idx < 0) break;
    from = idx + marker.length;
    const objStr = extractJsonObjectAt(flight, idx);
    if (!objStr) continue;
    try {
      const raw = JSON.parse(objStr) as Record<string, unknown>;
      const battleId = toNum(raw.battle_id);
      if (battleId === null || seen.has(battleId)) continue;
      seen.add(battleId);
      battles.push({
        battleId,
        date: toStr(raw.dateFormatted),
        song1Title: toStr(raw.song1Title),
        song2Title: toStr(raw.song2Title),
        song1Handle: toStr(raw.song1Handle),
        song2Handle: toStr(raw.song2Handle),
        winnerTitle: toStr(raw.winnerTitle),
        totalVolumeSol: toNum(raw.totalVolSol),
        marginPct: toNum(raw.marginPct),
      });
    } catch {
      // malformed slice - skip
    }
  }
  return battles;
}

async function fetchPage(page: number): Promise<string> {
  const url = page <= 1 ? `${INTELLIGENCE_BASE}/battles` : `${INTELLIGENCE_BASE}/battles?page=${page}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "COC-Concertz-Sync/1.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`/battles page ${page} returned HTTP ${res.status}`);
  return res.text();
}

async function main() {
  const seen = new Set<number>();
  const battles: WaveWarzBattle[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const pageBattles = parsePage(await fetchPage(page));
    let added = 0;
    for (const b of pageBattles) {
      if (!seen.has(b.battleId)) {
        seen.add(b.battleId);
        battles.push(b);
        added += 1;
      }
    }
    console.log(`page ${page}: +${added} (total ${battles.length})`);
    if (added === 0) break;
  }

  const totalVolume = battles.reduce((sum, b) => sum + (b.totalVolumeSol ?? 0), 0);
  const snapshot = {
    fetchedAt: new Date().toISOString(),
    totalBattles: battles.length,
    totalVolumeSol: Math.round(totalVolume * 100) / 100,
    recent: battles.slice(0, 8),
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
  console.log(`OK: wrote ${OUT} (${battles.length} battles, ${snapshot.totalVolumeSol} SOL)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
