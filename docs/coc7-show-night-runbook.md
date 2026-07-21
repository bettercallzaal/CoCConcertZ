# COC #7 Show-Night Runbook - WaveWarZ Takeover
## Friday July 18, 2026 | 4PM EST

Pilot event: wallet gate dropped. Everything is self-serve from the admin dashboard
at https://www.cocconcertz.com/admin — no terminal needed on the night.

---

## BLOCKERS (Zaal must clear before show day)

### 1. Cloudinary key — UPLOADS DOWN
**Status: BLOCKED**
Gallery uploads (`/api/upload`) return 500. The API key for cloud `dzzqdbo9k`
(key prefix `498841...`) has been revoked or restricted.

**Fix (Cloudinary console, ~2 min):**
1. Settings → Access Keys → find the key, re-enable all permissions, OR
2. Generate a new API key pair (no restrictions), then:
   - Vercel dashboard → cocconcertz project → Settings → Environment Variables
   - Update `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
   - Trigger a redeploy (or wait for next push)
3. Verify: `curl -X POST https://www.cocconcertz.com/api/upload -F "file=@test.jpg" -F "folder=coc-concertz/gallery"` should return a URL.

### 2. Wallet gate env flip — NEEDED FOR PILOT
**Status: BLOCKED**
`NEXT_PUBLIC_WALLET_GATE_ENABLED` must be set to `false` in Vercel before show day
so the archive upload page does not require 100M ZABAL.

**Fix (Vercel, ~2 min):**
1. Vercel dashboard → cocconcertz → Settings → Environment Variables
2. Set `NEXT_PUBLIC_WALLET_GATE_ENABLED` = `false` (Production environment)
3. Trigger a redeploy
4. Confirm: visit https://www.cocconcertz.com/archive/upload — it should skip the
   wallet verification step and go straight to the upload form.

### 3. Artist passcodes — NEEDED IF CREW JOINS
**Status: BLOCKED on crew lineup confirmation**
If WaveWarZ crew artists (GodclouD, dopestilo, etc.) need to upload to the archive
during the show, they need portal passcodes.

**Fix (after PR #32 is merged):**
1. Uncomment WaveWarZ crew entries in `scripts/setup-coc7-artists.ts`
2. Run: `npx tsx scripts/setup-coc7-artists.ts` (needs `.env.local` with Firebase admin creds)
3. Copy the generated JSON codes from console output
4. Vercel dashboard → `ARTIST_PASSCODES` env var → merge the new codes into the existing JSON
5. Trigger a redeploy
6. Share passcodes with artists and the portal URL: https://cocconcertz.com/login

Note: If only DJ Zaal is uploading, this is not needed — admin access covers it.

---

## T-2 HOURS (Setup)

- [ ] Confirm Cloudinary fix is live (gallery upload test passes)
- [ ] Confirm wallet gate env flip is live (archive upload page skips wallet check)
- [ ] Check metrics baseline: https://www.cocconcertz.com/api/metrics/coc7
      - Note starting `contestSubmissions`, `fanGalleryUploads`, `archiveUploads.total`
- [ ] Fire show-day push notification (admin dashboard → Push Notification):
      - Send ID: leave the auto-generated value (do NOT hardcode — a reused ID is silently deduped for 24h)
      - Title: `COC #7 is LIVE Tonight`
      - Body: `WaveWarZ Takeover starts 4PM EST. DJ Zaal on the decks. Free entry.`
- [ ] Verify COC #7 event doc in admin: https://www.cocconcertz.com/admin → Events → COC #7
      - Confirm `number` field = 7 (required for badge claims)
      - Confirm `venue.spatialLink` is set (required for GO LIVE overlay CTA)
      - Confirm `venue.streamLink` is set if Twitch embed desired
- [ ] Confirm Spatial venue is accessible: https://www.spatial.io/s/Dope-Stilo-Music-Club-66ed19e8c23d0d0c2a3d51c0
- [ ] Confirm Twitch stream is set up: twitch.tv/bettercallzaal

---

## T-0 SHOW START (4PM EST)

- [ ] Fire go-live push notification:
      - Send ID: leave the auto-generated value (each page load gives a fresh ID)
      - Title: `COC #7: WaveWarZ LIVE NOW`
      - Body: `Join us in Stilo World. DJ Zaal spinning. Free entry — link in bio.`
- [ ] Check https://www.cocconcertz.com — LiveMode overlay should be active. If not:
      Admin dashboard → Events → COC #7 → Status → change to **Live** → Save.
      (LiveMode is driven by `event.status === "live"` in Firestore, not a separate config doc.)
- [ ] Monitor concurrent viewers at https://www.cocconcertz.com/api/metrics/coc7

---

## DURING SHOW — Battle Control

From admin dashboard (https://www.cocconcertz.com/admin → Show Night panel):

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

Use unique Send IDs so the same notification is not sent twice (dedupes for 24h):
- `coc7-battle-1`, `coc7-battle-2`, etc. for battle announcements
- `coc7-winner-1`, etc. for winner reveals
- Title max 32 chars, body max 128 chars

---

## PILOT METRICS — What to Watch

Check https://www.cocconcertz.com/api/metrics/coc7 every 30 min during the show.

| Field | What it means | Target |
|---|---|---|
| `concurrentViewers` | Live concurrent users on the site | Track peak |
| `fanGalleryUploads` | Fan photos uploaded (Cloudinary path) | Any >0 = working |
| `contestSubmissions` | Thumbnail contest entries | Already closed pre-show |
| `archiveUploads.total` | Arweave permanent archive items | Track artist activity |
| `archiveUploads.gateless` | Uploads with no wallet (pilot mode) | All should be gateless |
| `archiveUploads.fromWallet` | Uploads with a real wallet address | Should be 0 (gate is off) |
| `pilotStatus.walletGateEnabled` | Confirms gate is actually disabled | Must be `false` |

**Screenshot the API response at:**
- T+0 (show start baseline)
- T+1h (mid-show)
- T+2h (show end / final)

---

## POST-SHOW (Same Night)

- [ ] Send post-show push notification:
      - Send ID: leave the auto-generated value (reload the admin page for a fresh ID)
      - Title: `COC #7 Wrapped`
      - Body: `Thanks for being there. Recap + photos dropping soon. See you at #8.`
- [ ] Final metrics snapshot: https://www.cocconcertz.com/api/metrics/coc7 — save the JSON
- [ ] Note peak concurrent viewers (track manually during show — the metric is live, not cumulative)
- [ ] Export battle results from Firebase console → Firestore → `battles` collection

---

## SATURDAY MORNING — Pilot Report

See `docs/coc7-post-show-capture.md` (to be created after the show with the retro template).

Numbers to plug in:
- Peak concurrent viewers (from manual tracking)
- Final `fanGalleryUploads`
- Final `archiveUploads.total`
- Battle results (votes, winners)
- Push notification delivery counts (from admin dashboard)
- Any friction reports from the night

---

## ENV ROLLBACK (Post-Pilot)

After the show, re-enable the wallet gate for future shows:
1. Vercel → `NEXT_PUBLIC_WALLET_GATE_ENABLED` → remove or set to `true`
2. Redeploy
3. Confirm archive upload page shows wallet connect step again
