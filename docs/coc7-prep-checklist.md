# COC Concertz #7 Prep Checklist - WaveWarZ Takeover (DJ Zaal)

Branch: `feature/coc-7-wavewarz`. Pattern follows PR #2/#6 (the COC #6 rollover).

## Locked

- [x] Show date: Sat July 18, 2026, 4PM EST (2026-07-18T20:00:00Z)
- [x] Lineup placeholder: DJ Zaal + WaveWarZ artists, full crew announced week of show
- [x] Placeholder art: `/images/wavewarz-battle.jpeg` until community thumbnail lands

## Still open

- [ ] Crew lineup (week before show) -> update CONCERT7_FALLBACK_ARTISTS + Firestore artist docs
- [ ] Community thumbnail -> winner from /contest page; save as `public/images/coc7-flyer.png`, swap refs in ShareSection, page.tsx, ArtistLineup, update-coc7.ts BANNER, rerun script. Mark winning contestEntries doc `winner: true` via Admin SDK
- [ ] Luma event created? RSVP stays at ticket.cocconcertz.com or new link?
- [x] Deploy firestore.rules - DONE 2026-07-03 (contestEntries + battles/votes rules live)

## Org-lift build queue (from cross-repo scout 2026-07-03)

- [x] /contest page - flyer contest submissions + countdown + winner badge (reused FanGallery Cloudinary+Firestore plumbing; patterns from zabalartsubmission + zpoidh)
- [x] Live battle voting widget - BattleVote.tsx, anonymous one-vote-per-session, real-time tally, PoolBar split bar (wavewarzapp pattern). Show-night control: `npx tsx scripts/manage-battle.ts create|close|status`
- [x] Socials generator - `npx tsx scripts/generate-socials.ts --theme "..." --highlight "..." --link <url>` -> 7 platform drafts in COC voice (zabalnewsletterbuilder pattern)
- [x] WaveWarZ history section - WaveWarzHistory.tsx on homepage, baked snapshot (415+ battles, 88+ SOL) via `scripts/fetch-wavewarz-history.ts` (ZAOscout port). Re-run before shows to refresh
- [ ] Recap video pipeline - runbook at docs/recap-video-pipeline.md; needs Deepgram key + COC-branded spacetovideo fork + test run on past show audio

## Cleanup from #6 (overdue - show was June 13)

- [x] Run `scripts/update-coc7.ts` - DONE 2026-07-03: #6 -> completed, #7 created in prod Firestore
- [ ] COC #6 recap: summary, highlights, YouTube clips -> `events/{id}.recap` (pattern: `scripts/patch-coc5-recap.ts`)
- [ ] COC #5 recap still marked "pending" in README Concert History - verify done or finish it
- [ ] Clear any stale #6 announcement banner in admin

## Code changes (hardcoded fallbacks - all currently say #6)

- [ ] `src/components/home/Countdown.tsx` - SHOWS array entry for #7
- [ ] `src/components/home/UpcomingShows.tsx` - HARDCODED_EVENTS entry
- [ ] `src/components/home/FinalCTA.tsx` - heading + date line
- [ ] `src/components/home/ShareSection.tsx` - share text + flyer URL
- [ ] `src/app/page.tsx` - composeCast text + embeds (line ~126)
- [ ] `src/app/layout.tsx` - OG metadata if flyer-based
- [ ] `src/components/home/ArtistLineup.tsx` - add CONCERTZ #7 tab + CONCERT7_FALLBACK_ARTISTS, make #7 default tab
- [ ] `src/components/home/VideoHighlights.tsx` - add #6 clips once recap cut

## Artist setup

- [ ] Artist docs for WaveWarZ crew performers (pattern: `scripts/setup-coc6-artists.ts` - creates docs, links to event, generates portal passcodes)
- [ ] DJ Zaal artist doc + portal passcode (add to ARTIST_PASSCODES env in Vercel)
- [ ] WaveWarZ battle image exists at `images/wavewarz-battle.jpeg` (used for #3 tab) - reusable placeholder until new art

## Show week

- [ ] README Concert History table: add row 7, mark 6 completed
- [ ] Announcement via admin dashboard
- [ ] /socials for Farcaster + X + Telegram
- [ ] Show day: GO LIVE -> Now Playing -> END SHOW -> GENERATE RECAP (README checklist)

## Audit follow-ups (not blocking #7)

- [ ] App Check still inactive - chat/gallery/subscribers spam-prone (docs/app-check-setup.md)
- [ ] Archive activation manual steps outstanding (docs/TODO-archive-activation.md): Supabase project, Arweave fund wallet, ZABAL token gate
- [ ] Root `index.html` (83KB legacy static page) coexists with Next.js app - confirm not served, then delete
- [ ] Firestore backup workflow: verify GCP bucket + secrets actually configured
