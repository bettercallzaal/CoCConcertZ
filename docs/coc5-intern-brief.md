# COC ConcertZ #5 — Intern Brainstorm Brief

Last updated: 2026-05-04

---

## Event

**COC ConcertZ #5: A Metaverse Musical Experience**
A Day in the Life of GODCLOUD — Web3's first finger drummer, multi-instrumentalist, vocalist, and CTO of Malaspalabras Records (George Lopez x Andy Vargas of Santana). Trip-hop, urban sci-fi, plus a behind-the-scenes Q&A on building onchain music careers.

- Date: May 9, 2026 — 4:00 PM EST
- Venue: Stilo World (Spatial.io)
- RSVP: https://luma.com/dwrdi3gg
- Site: https://cocconcertz.com
- Event page: https://cocconcertz.com/events/5
- Flyer: https://cocconcertz.com/images/coc5-flyer.png

---

## What's on the website right now

### Top of page (always visible)
- LiveMode takeover (auto-flips when event status = "live")
- Announcement banner: "GodCloud headlines COC ConcertZ #5 — May 9, 4PM EST. RSVP open."
- Sticky nav with COC logo
- Yellow corner decorations + side text rails

### Hero section
- Hero block (brand, tagline, CTA)
- Countdown timer (days/hours/min/sec to May 9, 4PM EST)
- ShowRecap (auto-shows for 7 days after a completed event)
- VisitorCount (live page-visit counter via Firestore)
- VenueEmbed (Stilo World preview)

### Content sections (in order)
- About — what COC ConcertZ is
- ArtistLineup — tabbed artist cards per concert. Tabs now include #1, #2, #3, #4, and #5 (default active = #5 with GodCloud + Stilo cards and the new flyer banner)
- HowToJoin — join instructions
- UpcomingShows — schedule list (currently shows COC #5 from Firestore)
- PastShows — completed concerts archive
- VideoHighlights — YouTube highlights grid
- EmailSignup — subscriber capture (writes to Firestore)
- Community — community links (ZAO, Stilo World, etc.)
- Team — core contributors
- FanGallery — user-submitted moments

### Bottom of page
- ShareSection (NEW): rich pre-filled post for COC #5 with one-click buttons for Farcaster (with flyer embed), X, Telegram, plus Copy Post. Shows preview block of the exact text users will share.
- FinalCTA: "COC CONCERTZ #5 / A DAY IN THE LIFE OF GODCLOUD" + RSVP NOW button
- Footer

### Floating overlays
- NowPlaying bar (admin-controlled "now playing" track)
- LiveChat widget
- ScrollReveal observer (drives all `.reveal` animations)
- Farcaster Mini App SDK (in-Warpcast share button uses native composeCast with COC #5 prefill)

---

## Other pages

- `/events/[number]` — dynamic event detail page (lineup, RSVP, venue, flyer)
- `/artists/[slug]` — artist profile pages (GodCloud is seeded)
- `/archive` — file/media archive (gated)
- `/content` — content tools
- `/newsletter` — newsletter draft + send tools
- `/admin` — event/artist/invite/user management
- `/portal` — artist self-serve portal (login + edit own bio, photo, socials)
- `/login` — auth entry

---

## Backend / admin tools

### Admin API routes (require role = admin/editor)
- `POST/GET/PATCH/DELETE /api/admin/events`
- `/api/admin/sets` — per-set track lists
- `/api/admin/invites` — invite codes for artists
- `/api/admin/users` + `/api/admin/users/[uid]/role` — role management
- `/api/admin/recaps/[eventId]` — upload show recaps
- `/api/admin/live/now-playing` — update Now Playing bar
- `/api/admin/subscribers` — newsletter list

### Public API routes
- `/api/artists` — artist directory
- `/api/auth` + `/api/auth/me` — session
- `/api/stats/visit` — visitor counter
- `/api/subscribers/check` — email check
- `/api/upload` + `/api/archive/upload` — file upload
- `/api/newsletter/generate` — newsletter generator
- `/api/content/parse-transcript` — transcript parser

### Data store
- Firebase / Firestore
- Collections: `events`, `artists`, `sets`, `invites`, `users`, `subscribers`, `recaps`, `archive`, `visits`
- Firestore rules hardened, all writes routed through `/api/admin/*`
- Admin SDK for server-side writes
- Daily backups via GitHub Action

---

## What's already done for COC #5

- Event #5 doc exists in Firestore: status=upcoming, name, description, announcement, RSVP, venue (Stilo World Spatial link), flyer + banner = `/images/coc5-flyer.png`
- GodCloud artist record seeded and linked to event
- Homepage Announcement banner reads "GodCloud headlines COC ConcertZ #5..."
- ShareSection rebuilt with rich GodCloud copy + Farcaster/X/Telegram/Copy
- Final CTA updated to COC #5 / GodCloud / May 9
- Countdown timer counts down to May 9
- Artist Lineup has CONCERTZ #5 tab as default with GodCloud + Stilo cards
- Embed preview (OG image + Twitter card) site-wide now uses coc5-flyer.png
- Browser tab favicon swapped from default Vercel triangle to COC icon
- Old COC #4 hardcoded RSVP links cleaned out

---

## Pre-event prep checklist (for intern)

### Discovery / SEO
- [ ] Verify `src/app/sitemap.ts` includes `/events/5` so Google indexes the GodCloud landing page in time
- [ ] Submit updated sitemap to Google Search Console
- [ ] Add structured data (JSON-LD MusicEvent schema) on `/events/5` so Google shows date/venue in search results

### OG / embed cache-busting
- [ ] Paste https://cocconcertz.com into Twitter Card Validator (cards-dev.twitter.com/validator)
- [ ] Paste into Facebook Sharing Debugger (developers.facebook.com/tools/debug) — hit Scrape Again
- [ ] Paste into Warpcast embed previewer (warpcast.com/~/developers/embeds)
- [ ] Discord: post link in a private channel and confirm new flyer renders, not coc4.jpg
- [ ] Slack: same
- [ ] If anything still shows the old coc4 flyer, scrape-again until it updates

### Email blast
- [ ] Use existing `/newsletter` tools to draft "GodCloud takes over Stilo World — May 9 RSVP"
- [ ] Pull subscribers from Firestore
- [ ] Include flyer image, RSVP link, Spatial join link
- [ ] Send 4-5 days out, then 24h reminder

### Artist profile polish
- [ ] Open `/artists/godcloud` and confirm bio reads well
- [ ] Add profile photo, social links (Twitter, Farcaster, Spotify, Audius, website)
- [ ] Add card customization colors so the Artist Lineup card pops
- [ ] Optionally pin one or two of GodCloud's tracks (YouTube IDs) to the card so visitors can preview live

### Day-of UX smoke test
- [ ] Confirm Countdown auto-flips to "TODAY" within 24h, then "LIVE NOW" at start time
- [ ] Test admin `POST /api/admin/live/now-playing` — it should change the floating bar instantly
- [ ] Test LiveChat widget loads
- [ ] Test the LiveMode takeover renders when event status flips to "live"
- [ ] Test the LIVE NOW — JOIN button on `/events/5` routes to Spatial

### Recap pipeline (post-event)
- [ ] ShowRecap homepage block displays for 7 days after a completed event
- [ ] After May 9: upload recap (videos, photos, set notes) via `/api/admin/recaps/[eventId]`
- [ ] Move event #5 status from upcoming to completed in admin

### Reminder casts / posts
- [ ] 24h out: schedule a Farcaster cast in `/cocconcertz` channel using ShareSection prefill
- [ ] Day-of: post LIVE NOW alert with Spatial join link on X + Farcaster
- [ ] Cross-post to The ZAO, SongJam, Stilo World, WaveWarZ communities

### Lineup expansion ideas
- [ ] Confirm with GodCloud whether Stilo opens / hosts or just hosts the venue
- [ ] Add any guest performers (sit-ins, surprise drops) to Firestore so the Artist Lineup card grows
- [ ] If GodCloud has a Q&A segment, list it in the event description with a time slot

### Archive seeding
- [ ] Once the show ends, push the recording to `/archive` and surface it on PastShows + VideoHighlights
- [ ] Add the flyer to the FanGallery as the canonical art

### Bug-watch / polish ideas
- [ ] Upcoming Shows section sometimes renders blank on first paint — check the `.reveal` IntersectionObserver, may need a fallback "always visible" class for hero schedule items
- [ ] `coc5-flyer.png` is 1.5MB — run `sips -Z 1200 public/images/coc5-flyer.png` to shrink it for faster OG fetch
- [ ] Mobile sticky countdown bar would help conversion on phone visitors
- [ ] Add an "Add to calendar" `.ics` download next to RSVP

---

## Handy links

- Production: https://cocconcertz.com
- RSVP: https://luma.com/dwrdi3gg
- Venue (Spatial): https://www.spatial.io/s/Dope-Stilo-Music-Club-66ed19e8c23d0d0c2a3d51c0?share=865562415562507517
- GitHub: https://github.com/bettercallzaal/CoCConcertZ
- Flyer: https://cocconcertz.com/images/coc5-flyer.png
- Farcaster channel: `/cocconcertz`
