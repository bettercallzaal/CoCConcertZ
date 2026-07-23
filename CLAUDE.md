# COC Concertz — Claude Code Project Context

## Loop Protocol
PR-only. Never push main directly. One item at a time. Status one-liners to ZAAL BOTZ via `~/bin/zao-status`. Gated actions (deploy/keys/outbound/spend/on-chain) → STOP + "DECISION NEEDED".

## Stack
- Next.js App Router (TypeScript) — all API routes in `src/app/api/`
- Firebase Firestore (client SDK in routes; Admin SDK in `scripts/lib/admin-init.ts`)
- Supabase — `archive_uploads` table; `createServerSupabase()` uses `SUPABASE_SERVICE_ROLE_KEY`
- Cloudinary — fan gallery uploads via `/api/upload`
- Arweave — permanent archive uploads via `/api/archive/upload`
- Wallet gate — `NEXT_PUBLIC_WALLET_GATE_ENABLED` env var; `concertz.config.ts` reads it

## Operational Lessons (COC #7 cycle, 2026-07)

**Baked stat files must be verified against source before each show.** `src/data/wavewarz-history.json` totals come from the scraper which is page-capped and undercounts. Always cross-check `totalBattles` / `totalVolumeSol` against wavewarz.com display stats before show night.

**Bonfire posting: use local env file, not VPS SSH.** `bonfire-post.sh` SSHes to VPS which fails from this env (exit 5). Use: `BONFIRE_ENV_FILE=~/.zao/bonfire.env bash /home/zaal/.claude/skills/bonfire/scripts/bonfire-remote-post.sh /tmp/bonfire-episodes.json`

**PR cross-dependencies belong in STATE and in every PR description at creation time.** If PR B checks fields added by PR A, document the merge order immediately (not after the fact). Merge order for COC #7: #30 first, then #33; rest any order.

**T-48h before show: consolidate all pending blockers into one zao-status ping.** Don't drip one blocker per day — one loud message with the full prioritized list.

**API field names must match UI and docs display names.** `uniqueVisitors` was a live concurrent count, renamed `concurrentViewers` at enhancement time. Verify naming on every endpoint change.

**After a deadline-gated event closes, update OG metadata in the same PR.** Don't leave "Submissions close July 10" in `<head>` while the UI component shows "Submissions closed."

**Audit FormData field names before each show.** When a component builds FormData and a separate API route reads it, names can silently diverge (snake_case vs camelCase, multi-value vs JSON string). The archive upload was 100% broken (PR #40): `wallet_address` vs `walletAddress`, `tags[]` multi-appends vs `tags` JSON string. Audit every upload path's component-sends vs API-reads before show night.

## Key Scripts
- `scripts/smoke-test.sh` — pre-show health check (run from prod URL)
- `scripts/update-coc8.ts` — upsert Firestore event #8 doc + flip #7 → completed (fill TBD constants first)
- `scripts/setup-coc8-artists.ts` — create artist Firestore docs + generate passcodes for COC #8 (`npx tsx`)
- `scripts/fetch-wavewarz-history.ts` — refresh `src/data/wavewarz-history.json` (page-capped, totals will undercount)

## Pre-Show Checklist (quick ref)
1. Rotate Cloudinary key if fan uploads return 500
2. Set `NEXT_PUBLIC_WALLET_GATE_ENABLED=false` in Vercel Production → redeploy
3. Merge PRs in order, run smoke-test.sh, verify gate canary passes (metrics/coc8 gate check)
4. Fill TBD constants in `update-coc8.ts` → run `npx tsx scripts/update-coc8.ts`
5. Once lineup confirmed: uncomment artists in `setup-coc8-artists.ts` → run `npx tsx scripts/setup-coc8-artists.ts`
6. Add printed passcodes to `ARTIST_PASSCODES` env var in Vercel → redeploy
7. At show start: admin dashboard → Events → COC #8 → Status → **Live** → Save
   (LiveMode overlay is driven by `event.status === "live"` — not a config/live Firestore doc)
8. Verify streamLink in event doc for "Watch on Twitch" CTA: admin → Events → COC #8 → Stream Link
   (update-coc8.ts sets this; re-run it after merge to patch any existing event doc)
9. Verify `src/data/wavewarz-history.json` totals against wavewarz.com before show (scraper undercounts)
