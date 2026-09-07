# COC #7 Post-Show Capture Plan
## Saturday July 18, 2026 — Pilot Report Template

This doc tells you exactly where to get each number and has the retro shell ready to fill.
Run through Section 1 first (30 min data pull), then fill Section 2 (the actual report).

---

## Section 1 — Where the Numbers Live

### 1a. Metrics API (primary source)
```
curl https://www.cocconcertz.com/api/metrics/coc7
```
Read from the response:
- `metrics.concurrentViewers` — snapshot at time of call (this is live concurrent, not peak — see 1b)
- `metrics.fanGalleryUploads` — Firestore `gallery` collection count
- `metrics.contestSubmissions` — Firestore `contestEntries` count
- `metrics.archiveUploads.total` — Supabase `archive_uploads` count
- `metrics.archiveUploads.gateless` — uploads from ungated users (should be all of them in pilot)
- `metrics.archiveUploads.fromWallet` — uploads with real wallet (should be 0 during pilot)
- `metrics.pilotStatus.walletGateEnabled` — confirm it was `false` during show

### 1b. Peak concurrent viewers
The visitor count is live and decrements on page exit — there is no automatic peak capture yet.
Source: your manual screenshots from the runbook (T+0, T+1h, T+2h). Take the highest value.

### 1c. Battle results
Firebase console → Firestore → `battles` collection.
Each battle doc has: `title`, `sideA`, `sideB`, `votesA`, `votesB`, `winnerName`, `closedAt`.

Or pull via script:
```bash
npx tsx scripts/manage-battle.ts status
```

### 1d. Push notification delivery
Admin dashboard → Push Notification panel shows subscribed token count.
Vercel function logs (Settings → Logs → `/api/admin/notify`) show sent/invalid/rateLimited per call.

### 1e. Contest entries detail (if needed)
Firebase console → Firestore → `contestEntries`. Each doc has `name`, `imageUrl`, `createdAt`.
Count by date to confirm all submissions were pre-show (contest closed before Jul 18).

### 1f. Fan gallery detail
Firebase console → Firestore → `gallery`. Each doc has `name`, `url`, `createdAt`.
Filter by date to get show-night uploads only (after 2026-07-18T20:00:00Z).

### 1g. Archive upload detail
Supabase dashboard → Table Editor → `archive_uploads`.
Filter by `created_at >= '2026-07-18'` to get show-night activity.
Columns to export: `id`, `title`, `file_type`, `uploaded_by_wallet`, `created_at`.

---

## Section 2 — Pilot Report Template

Fill this in Saturday morning. Paste it into Bonfire / Discord / Farcaster as the pilot debrief.

---

### COC #7 Pilot Report — WaveWarZ Takeover
**Date:** Saturday July 18, 2026
**Format:** Gateless (no wallet required for archive uploads)

#### Attendance
| Metric | Value |
|---|---|
| Peak concurrent viewers | ___ |
| T+0 (4PM) | ___ |
| T+1h (5PM) | ___ |
| T+2h (6PM) | ___ |

#### Content
| Metric | Value |
|---|---|
| Fan gallery uploads (show night) | ___ |
| Fan gallery uploads (total) | ___ |
| Archive uploads (show night) | ___ |
| Archive uploads — gateless | ___ |
| Archive uploads — from wallet | ___ |

#### Community
| Metric | Value |
|---|---|
| Contest submissions (thumbnail) | ___ |
| Contest winner | ___ |
| Push notification subscribers | ___ |
| Notifications sent | ___ |
| Notifications delivered | ___ |

#### Battle Results
| Battle | Side A | Side B | Votes A | Votes B | Winner |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

#### Pilot Verdict
- [ ] Gallery uploads worked (Cloudinary key fix confirmed)
- [ ] Archive upload page reached without wallet prompt
- [ ] `pilotStatus.walletGateEnabled` was `false` during show
- [ ] Any friction / errors reported by attendees:

#### What worked
-
-

#### What to fix for #8
-
-

#### Pilot hypothesis result
> We dropped the 100M ZABAL wallet gate to lower the attendance barrier for the WaveWarZ
> community. Did it work?

Fan gallery uploads show night: ___
Archive uploads from non-wallet users: ___

**Verdict:** (met / partially met / missed)

---

## Section 3 — Saturday Task List

- [ ] Fill Section 2 from Section 1 data
- [ ] Post pilot report to Farcaster /cocconcertz + Discord
- [ ] Generate socials: `npx tsx scripts/generate-socials.ts --theme "WaveWarZ Takeover recap" --highlight "<top moment>" --link https://cocconcertz.com`
- [ ] Add #6 recap to Firestore if still pending (`scripts/patch-coc5-recap.ts` pattern)
- [ ] Start README Concert History: add COC #7 row, mark as completed
- [ ] If Deepgram key is in — kick off recap video pipeline: `docs/recap-video-pipeline.md`
- [ ] Re-enable wallet gate post-pilot: Vercel → `NEXT_PUBLIC_WALLET_GATE_ENABLED` remove or set `true` → redeploy
- [ ] Fire `coc7-retro` Bonfire episode: what/decision/link
