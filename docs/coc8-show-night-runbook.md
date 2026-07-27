# COC #8 Show-Night Runbook
## [DATE TBD] | 4PM EST

**FILL IN BEFORE SHOW NIGHT:**
- Date: `[TBD - confirm with Zaal]`
- Subtitle: `[TBD - e.g. "Producer Showcase"]`
- Artists: `[TBD - confirm lineup]`
- Spatial venue URL: `[TBD - reuse COC #7 URL or new one]`

---

## BLOCKERS (Zaal must clear before show day)

### 1. COC #8 event doc in Firestore
**Status: BLOCKED on date + subtitle confirmation**

Once date is locked, fill in constants in `scripts/update-coc8.ts` and run:
```bash
npx tsx scripts/update-coc8.ts
```
Verify: admin dashboard → Events → COC #8 should appear with correct date + status = `upcoming`.

### 2. Artist passcodes
**Status: BLOCKED on lineup confirmation**

Once lineup is confirmed, uncomment artists in `scripts/setup-coc8-artists.ts` and run:
```bash
npx tsx scripts/setup-coc8-artists.ts
```
Add the printed JSON output to `ARTIST_PASSCODES` env var in Vercel → redeploy.
Portal URL: https://cocconcertz.com/login

### 3. Cloudinary key
**Status: Rotate if fan gallery uploads return 500**

Settings → Access Keys in Cloudinary console. Update `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET` in Vercel if needed.

### 4. Wallet gate env flip (pilot continues)
**Status: BLOCKED on Vercel env update**

Set `NEXT_PUBLIC_WALLET_GATE_ENABLED=false` in Vercel Production → redeploy.
Confirm: archive upload page skips wallet step.

### 5. SESSION_SECRET in Vercel (PR #55 — HMAC security)
**Status: BLOCKED on Zaal setting env var + approving force-push**

After `SESSION_SECRET` is in Vercel, approve the force-push for branch `ws/security-signed-sessions` so PR #55 can merge. This gates PR #57 (api-auth tests).

### 6. WaveWarZ history stats
**Status: Verify before show**

Cross-check `src/data/wavewarz-history.json` totals against wavewarz.com display before show night. The scraper is page-capped and undercounts (COC #7: off by 5x). Run if needed:
```bash
npx tsx scripts/fetch-wavewarz-history.ts
```
Then manually update `totalBattles` / `totalVolumeSol` to match wavewarz.com.

---

## T-2 HOURS (Setup)

- [ ] Confirm Cloudinary fix is live: test gallery upload
- [ ] Confirm wallet gate env flip is live (archive upload page skips wallet check)
- [ ] Verify COC #8 event doc: admin → Events → COC #8
      - `number` field = 8 (required for badge claims)
      - `venue.spatialLink` is set
      - `venue.streamLink` is set if Twitch embed desired
- [ ] Check metrics baseline: https://www.cocconcertz.com/api/metrics/coc8
      - Note starting `archiveUploads.total`, `fanGalleryUploads`
      - Confirm `pilotStatus.walletGateEnabled = false`
- [ ] Fire show-day push notification (admin → Push Notification):
      - **Use a fresh auto-generated Send ID** — DO NOT reuse IDs (deduped 24h)
      - Title: `COC #8 is LIVE Tonight` (max 32 chars)
      - Body: `[SUBTITLE] starts 4PM EST. [ARTIST] live. Free entry.` (max 128 chars)
- [ ] Confirm Spatial venue is accessible
- [ ] Confirm Twitch stream is set up: twitch.tv/bettercallzaal

---

## T-0 SHOW START (4PM EST)

- [ ] Fire go-live push notification:
      - **Use a fresh auto-generated Send ID**
      - Title: `COC #8: [SUBTITLE] LIVE NOW` (max 32 chars)
      - Body: `We're live. [ARTIST] on the decks. Free entry — link in bio.` (max 128 chars)
- [ ] Check homepage — LiveMode overlay should be active. If not:
      Admin dashboard → Events → COC #8 → Status → **Live** → Save.
      (LiveMode is driven by `event.status === "live"` in Firestore.)
- [ ] Monitor metrics: https://www.cocconcertz.com/api/metrics/coc8

---

## DURING SHOW — Battle Control

From admin dashboard → Show Night panel:

**To start a battle:**
1. Enter Battle Title (e.g. "English vs Spanish Battle")
2. Enter Side A name and Side B name
3. Click "GO LIVE WITH BATTLE" — vote widget appears on homepage instantly

**To end a battle:**
1. Click "END BATTLE + TALLY" — tallies votes, shows winner
2. Announce winner on Twitch/Spatial
3. Start next battle if needed

**Notes:**
- One battle live at a time
- Votes are anonymous, one per session
- Results persist in Firestore `battles` collection for the retro doc

---

## DURING SHOW — Push Notifications

Use unique Send IDs to prevent silent deduplication (24h window):
- `coc8-battle-1`, `coc8-battle-2`, etc. for battle announcements
- `coc8-winner-1`, etc. for winner reveals
- Title max 32 chars, body max 128 chars

---

## PILOT METRICS — What to Watch

Check https://www.cocconcertz.com/api/metrics/coc8 every 30 min during the show.

| Field | What it means | Target |
|---|---|---|
| `concurrentViewers` | Live concurrent users on the site | Track peak |
| `peakViewers` | Auto-tracked peak (persisted to Firestore) | Check vs manual |
| `fanGalleryUploads` | Fan photos uploaded | Any >0 = working |
| `archiveUploads.total` | Arweave permanent archive items | Track artist activity |
| `archiveUploads.gateless` | Uploads with no wallet (pilot mode) | All should be gateless |
| `archiveUploads.fromWallet` | Uploads with a real wallet | Should be 0 (gate is off) |
| `pilotStatus.walletGateEnabled` | Confirms gate is disabled | Must be `false` |

**Screenshot the API response at:**
- T+0 (show start baseline)
- T+1h (mid-show)
- T+2h (show end / final)

Note: `peakViewers` is now auto-tracked via `stats/visitors_peak` Firestore doc (added PR #50). No manual tracking needed — but cross-check against manual observation to verify.

---

## POST-SHOW (Same Night)

- [ ] Send post-show push notification:
      - **Use a fresh auto-generated Send ID**
      - Title: `COC #8 Wrapped`
      - Body: `Thanks for being there. Recap + photos dropping soon. See you at #9.`
- [ ] Final metrics snapshot: https://www.cocconcertz.com/api/metrics/coc8 — save the JSON
- [ ] Export battle results: Firebase console → Firestore → `battles` collection

---

## SATURDAY MORNING — Pilot Report

Run the pilot report generator (requires Firebase admin creds in `.env.local`):
```bash
# Update show_id filter in scripts/generate-pilot-report.ts for coc8
npx tsx scripts/generate-pilot-report.ts
```

Numbers to plug in:
- Peak concurrent viewers (`peakViewers` field from metrics — auto-tracked)
- Final `fanGalleryUploads`
- Final `archiveUploads.total`
- Battle results (votes, winners)
- Push notification delivery counts (from admin dashboard)
- Any friction reports from the night

---

## ENV ROLLBACK (Post-Pilot)

After the show, re-enable the wallet gate:
1. Vercel → `NEXT_PUBLIC_WALLET_GATE_ENABLED` → remove or set to `true`
2. Redeploy
3. Confirm archive upload page shows wallet connect step again
