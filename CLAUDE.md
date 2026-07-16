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

## Key Scripts
- `scripts/smoke-test.sh` — pre-show health check (run from prod URL)
- `scripts/setup-coc7-artists.ts` — create artist Firestore docs + generate passcodes (`npx tsx`)
- `scripts/fetch-wavewarz-history.ts` — refresh `src/data/wavewarz-history.json` (page-capped, totals will undercount)

## Pre-Show Checklist (quick ref)
1. Rotate Cloudinary key if fan uploads return 500
2. Set `NEXT_PUBLIC_WALLET_GATE_ENABLED=false` in Vercel Production → redeploy
3. Merge PRs in order, run smoke-test.sh, verify gate canary passes
4. Run `setup-coc7-artists.ts` after merge to seed Firestore artist docs
