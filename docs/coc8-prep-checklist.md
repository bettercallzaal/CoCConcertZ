# COC Concertz #8 Prep Checklist

## Locked prerequisites (merge PR queue first)

Before any COC #8 setup can run, the 16 open PRs must land on main.
**Merge order:** #56 → #59/#60/#61/#62/#63/#64/#65/#66/#67/#68/#69 (any order) → #58 → #55 (after SESSION_SECRET set in Vercel) → #57.

Conflict heads-up: PRs #61 and #66 both touch `ShowNightPanel.tsx` — trivial to resolve on merge.

---

## Phase 1: confirm date + theme (Zaal)

- [ ] COC #8 date confirmed → update `scripts/update-coc8.ts` TBD constants:
  - `SHOW_DATE_UTC` — e.g. `"2026-08-16T20:00:00Z"` (4PM EST)
  - `SHOW_DATE_DISPLAY` — e.g. `"Sat Aug 16, 4PM EST"`
  - `SHOW_SUBTITLE` — e.g. `"Producer Showcase"`
  - `LINEUP_TEXT` — e.g. `"Full lineup announced week of show"`
  - `SPATIAL` — reuse COC #7 Spatial URL or provide new one
- [ ] Artist lineup confirmed (week-of is fine for initial setup)
- [ ] Contest: run new round or skip for COC #8?

## Phase 2: Vercel env setup

- [ ] `SESSION_SECRET` set in Vercel (required before PR #55 can deploy)
  - Generate: `openssl rand -hex 32`
  - Add to Vercel → cocconcertz → Settings → Environment Variables → Production + Preview
- [ ] Verify `NEXT_PUBLIC_WALLET_GATE_ENABLED` is set to `"false"` for show night (flip to `"true"` post-show to gate the archive)
- [ ] Verify Cloudinary key is working: `curl -s https://www.cocconcertz.com/api/upload` should not 401/500

## Phase 3: Firestore event doc

After filling TBD constants in `scripts/update-coc8.ts`:

```bash
npx tsx scripts/update-coc8.ts
```

- Flips COC #7 to `status: completed`
- Creates/updates COC #8 event doc with date, subtitle, lineup text, Spatial URL
- Verify: admin dashboard → Events → COC #8 should appear with `status: upcoming`

## Phase 4: code updates (after date confirmed)

- [ ] `src/components/home/Countdown.tsx` — add COC #8 entry to `upcomingShows` array:
  ```ts
  { name: "+COC CONCERTZ #8: [SUBTITLE]", date: "[SHOW_DATE_UTC]", display: "[SHOW_DATE_DISPLAY]", rsvp: "https://ticket.cocconcertz.com" }
  ```
- [ ] `src/components/home/UpcomingShows.tsx` — update `HARDCODED_EVENTS` array with COC #8 entry (same values)
- Both changes go in one PR; branch off `fix/og-and-upcoming-shows-coc8` or a new branch

## Phase 5: artist passcodes

Once lineup is confirmed:

```bash
npx tsx scripts/setup-coc8-artists.ts
```

- Creates/updates Firestore artist docs for each performer
- Generates portal passcodes
- Add generated passcodes to Vercel env `ARTIST_PASSCODES` (JSON format)

## Phase 6: WaveWarZ history refresh (week of show)

```bash
npx tsx scripts/fetch-wavewarz-history.ts
```

- Refreshes `src/data/wavewarz-history.json` snapshot
- Cross-check `totalBattles` + `totalVolumeSol` against wavewarz.com display stats
- Commit + PR if numbers changed materially

## Phase 7: pre-show smoke test

```bash
PROD_URL=https://www.cocconcertz.com bash scripts/smoke-test.sh
```

Key checks: wallet gate, fan upload, archive upload, metrics endpoints, push notifications.

## Phase 8: show week socials

```bash
npx tsx scripts/generate-socials.ts --theme "[SUBTITLE]" --highlight "DJ Zaal on the decks. Free entry." --link https://cocconcertz.com
```

- 7-platform drafts in COC voice
- See `docs/coc7-show-day-socials.md` for tone/format reference

## Show night

Follow `docs/coc8-show-night-runbook.md` (in PR #61).

## Post-show (Saturday morning)

```bash
npx tsx scripts/generate-pilot-report.ts 8
```

- Pulls metrics from `/api/metrics/coc8` + Supabase
- Prints Saturday pilot report template
- See `docs/coc7-post-show-capture.md` as reference for what data to capture

## Rollover checklist (add to future session)

After COC #8 show:
- [ ] Update `Countdown.tsx` upcomingShows → add COC #9 or show "announcement coming soon"
- [ ] Update `UpcomingShows.tsx` HARDCODED_EVENTS
- [ ] Update `README.md` Concert History — mark COC #8 completed
- [ ] Update `public/llms.txt` — COC #8 completed + COC #9 upcoming
- [ ] Update OG countdown + contest metadata
- [ ] Update ShowNightPanel.tsx placeholders → COC #9
- [ ] Update WaveWarzHistory.tsx marketing copy + run WaveWarZ history refresh
