# COC Concertz - Metaverse Concert Platform

A full-stack concert platform and Farcaster Mini App for COC Concertz, a live metaverse concert experience hosted in StiloWorld on Spatial.io. Built with Next.js, Firebase, and a cyberpunk design system.

## Live Site

**https://cocconcertz.com**

---

## Platform Overview

### Public Site
- Cyberpunk-themed homepage with floating logo constellation, grain overlay, scanlines, halftone backgrounds
- Live countdown timer to next show (auto-advances through upcoming events)
- "LIVE NOW" state - countdown becomes "JOIN NOW" button, status badge pulses
- **Full-page live mode takeover** - when a show goes live, visitors get a dramatic full-screen overlay with blurred flyer background, pulsing "LIVE NOW" heading, and CTA buttons. The entire page border glows red/yellow. Dismissible, shows once per session
- **Live chat** - collapsible side panel for real-time chat during shows. No login required - pick a name and go. Rate-limited, auto-scrolling, real-time via Firestore
- **"Now Playing" bar** - fixed bottom bar showing the current song and artist with animated equalizer bars, updated live by admin during shows
- **Post-show recap cards** - auto-generated after shows with visitor count, chat messages, artists performed. Shareable, displayed on homepage for 7 days
- Spatial.io metaverse venue embed with Twitch stream toggle
- Artist lineup with tabbed panels per concert (ConcertZ #1-7) with staggered entrance animations and border glow effects, default tab is the upcoming show
- All concert artist cards pull live from Firestore - artist profile edits appear on the site
- Upcoming and past shows connected to Firestore (admin-managed)
- Live visitor count with real-time Firestore presence
- Announcement banner system (admin-controlled, dismissible)
- **Video highlights** - "BEST MOMENTS" grid with curated clips from past shows, click-to-play YouTube embeds
- **Email signup** - "GET NOTIFIED" section for show announcements, saves to Firestore with duplicate detection
- **Fan photo gallery** - fans submit photos with captions, displayed in a grid on the homepage. Cloudinary-hosted uploads
- **Team section** - Zaal & Thy Rev cards with roles, bios, and social links
- **Telegram link** in community section
- Share section (Farcaster composeCast, X/Twitter, clipboard copy)
- **Live battle voting** - anonymous one-vote-per-session battle widget with real-time split bar, renders while a battle is live (WaveWarZ format)
- **Attendance badge** - free per-session claim during a live show + 7-day recap window, voter tier unlocked by battle participation
- **WaveWarZ history section** - stat tiles + recent battles from a baked scraper snapshot
- **Flyer contest** (`/contest`) - community submissions with countdown, entry grid, winner badge, dynamic OG card
- Scroll-reveal animations, responsive design
- Mobile-responsive hamburger menus for admin and portal sidebars

### Public Artist Pages (`/artists/[slug]`)
- Shareable profile pages for each artist
- Dynamic SEO metadata (title, description, OG tags)
- Artist's custom accent and background colors
- Bio, social links, performance history across events
- Setlist display with song/video links
- Upcoming performance CTA with RSVP button
- **Auto-generated OG images** - branded social cards generated dynamically for sharing

### Public Event Pages (`/events/[number]`)
- Dedicated page per concert with flyer/banner image
- Lineup grid linking to artist profiles
- RSVP button (upcoming) or "JOIN NOW" (live)
- Venue links (Spatial.io + stream)
- Dynamic SEO metadata with flyer as OG image
- **Show recap section** for completed events - summary paragraph, highlight bullets, YouTube clip grid (linking out), and optional transcript URL list. Recap content lives in `events/{id}.recap` as a structured field, populated by `scripts/seed-past-events.ts` or hand-edited in Firestore.

### Admin Dashboard (`/admin`)
- **Event Management** - full CRUD for events (name, date, description, venue, RSVP link, status, flyer/banner)
- **GO LIVE / END SHOW** - one-click toggle to flip an event to live mode, triggers full-page takeover for visitors
- **Now Playing Controls** - tap through the setlist during a live show, updates the public "Now Playing" bar in real-time
- **Announcement Banner** - type a message, it shows across the public site instantly
- **Post-Show Recap Generator** - one click after END SHOW auto-counts visitors, chat messages, and artists, creates a shareable recap card
- **Invite System** - send invites by email with role assignment (admin/artist/fan), track pending/accepted/revoked
- **User Management** - view all users, switch roles
- **Platform Stats** - subscriber count, events, artists, gallery photos, visitors at a glance
- **Subscriber Management** - view recent signups, export full list as CSV
- **Seed Artists** - one-click button to pre-populate artist profiles
- **Show Night panel** - battle create/close with live tally, and push-notification sends with subscriber count (no terminal needed)

### API Routes
- `/api/auth` - passcode verification, cookie management, logout
- `/api/artists` - artist profile create/update via Firebase Admin SDK (auth-verified)
- `/api/upload` - Cloudinary image upload
- `/api/og/artist` - dynamic OG image generation for artist social cards
- `/api/og/countdown` - countdown social card generation
- `/api/og/contest` - flyer-contest social card with days-left countdown
- `/api/webhook/farcaster` - Mini App events; stores notification tokens after full JFS verification (ed25519 + Optimism KeyRegistry)
- `/api/admin/battle` - admin battle create/close/status (cookie-auth, mirrors `manage-battle.ts`)
- `/api/admin/notify` - admin push send with subscriber count (cookie-auth, mirrors `send-notification.ts`)

### Artist Portal (`/portal`)
- Per-artist passcode login (unique 5-letter code per artist)
- **Profile Editor** - stage name, bio, profile photo upload (Cloudinary), social links (Twitter, Farcaster, Audius, Spotify, YouTube, website), wallet address
- **Setlist Manager** - add songs and videos per event, with platform selection
- **Card Customizer** - choose accent color and background color with live preview
- **Preview Link** - "View your public profile" opens their shareable artist page
- Changes go live on the homepage and artist pages immediately

### Farcaster Mini App
- `fc:miniapp` embed meta tag with `launch_frame` action
- `/.well-known/farcaster.json` manifest with signed account association (FID 19640)
- Mini App SDK - `sdk.actions.ready()`, context detection, native `composeCast`
- Stream fallback for Twitch inside Farcaster frames
- Spec-compliant icons (1024x1024 PNG), splash screen, embed preview image
- **Push notifications** - `/api/webhook/farcaster` captures tokens (full JFS verification: ed25519 signature + Optimism KeyRegistry), sends via admin panel or `scripts/send-notification.ts`

### iOS App (Capacitor)
- `ios/` Xcode project wrapping the production site - TestFlight path in `docs/testflight-runbook.md`
- Content updates ship via normal Vercel deploys, no resubmission

### SEO & Meta
- Open Graph + Twitter Card meta tags with ConcertZ #4 artwork
- JSON-LD structured data (Event schema)
- Dynamic metadata on artist and event pages
- robots.txt + dynamic sitemap.xml (auto-generates entries for all artists and events)
- Canonical URL, meta description, theme-color

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS + CSS custom properties
- **Auth:** Passcode-based (admin + per-artist codes via env vars, httpOnly cookies)
- **Database:** Firebase Firestore (real-time via onSnapshot, admin SDK for server components)
- **Image Storage:** Cloudinary (25GB free tier)
- **Hosting:** Vercel (auto-deploy on push to `main`)
- **OG Images:** Dynamic generation via Next.js `ImageResponse` (Edge runtime)
- **Venue:** Spatial.io (metaverse embed)
- **Stream:** Twitch (live stream embed)
- **Video:** YouTube (performance embeds with click-to-play song lists)
- **Events:** Luma (RSVP links)
- **Farcaster:** Mini App SDK via esm.sh

---

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # Public homepage
│   ├── login/page.tsx              # Passcode login
│   ├── admin/                      # Admin dashboard
│   │   ├── page.tsx                # Dashboard (stats, live controls, announcements)
│   │   ├── events/page.tsx         # Event CRUD
│   │   ├── invites/page.tsx        # Invite management
│   │   └── users/page.tsx          # User management
│   ├── portal/                     # Artist portal
│   │   ├── page.tsx                # Portal home (quick links, shows)
│   │   ├── profile/page.tsx        # Edit profile
│   │   ├── sets/page.tsx           # Manage setlists
│   │   └── card/page.tsx           # Customize card appearance
│   ├── artists/[slug]/page.tsx     # Public artist profiles
│   ├── events/[number]/page.tsx    # Public event pages
│   ├── sitemap.ts                  # Dynamic sitemap (artists + events)
│   └── api/
│       ├── auth/                   # Auth API (passcode verify, cookie mgmt)
│       ├── artists/                # Artist profile CRUD (admin SDK)
│       ├── upload/                 # Cloudinary image upload endpoint
│       └── og/                     # Dynamic OG image generation
│           ├── countdown/          # Countdown social card
│           └── artist/             # Artist profile social card
├── components/
│   ├── home/                       # Homepage sections (14 components)
│   ├── admin/                      # Admin components
│   ├── portal/                     # Portal components
│   ├── layout/                     # Sidebars
│   └── ui/                         # Primitives (Button, Input, Card, Badge, Modal)
├── lib/
│   ├── firebase.ts                 # Firebase client SDK init
│   ├── firebase-admin.ts           # Firebase Admin SDK init
│   ├── db.ts                       # Firestore CRUD helpers (client-side)
│   ├── db-server.ts                # Firestore helpers (admin SDK, server-side)
│   ├── storage.ts                  # Firebase Storage helpers
│   └── types.ts                    # TypeScript types
├── context/
│   └── AuthContext.tsx              # Auth provider (role, artistSlug)
└── middleware.ts                    # Route protection stub
```

---

## Auth System

Passcode-based authentication via httpOnly cookies:

| Role | How it works |
|------|-------------|
| **Admin** | Single passcode in `ADMIN_PASSCODE` env var |
| **Artist** | Per-artist passcodes in `ARTIST_PASSCODES` env var (JSON: `{"code":"slug"}`) |

On login, the API route verifies the passcode, sets `coc-role` and `coc-artist-slug` cookies (30-day expiry), and the AuthContext provides `role` and `artistSlug` to the app.

**Data access pattern:** Client components use the Firebase client SDK (`db.ts`) for real-time reads via `onSnapshot`. Server components and API routes use the Firebase Admin SDK (`db-server.ts`) for server-side data fetching - this is required because the client SDK cannot authenticate in Vercel serverless functions. Profile saves from the artist portal go through `/api/artists` (admin SDK) rather than writing directly to Firestore.

---

## Event Data

### Firestore Collections
- `events` - name, number, date, venue, rsvpLink, status, flyer/banner URLs, artist assignments, announcement
- `artists` - stageName, slug, bio, socialLinks, cardCustomization, linkedEvents
- `sets` - songs, videos, notes per artist per event
- `invites` - email, role, status
- `users` - role, email, displayName
- `subscribers` - email signups for show notifications
- `gallery` - fan-submitted photos with captions
- `chat/{eventId}/messages` - live chat messages per event
- `live/nowPlaying` - current song and artist during live shows
- `recaps/{eventId}` - auto-generated post-show recap data
- `stats/visitors` - real-time visitor count
- `battles/{id}` + `votes/{sessionId}` - live battle voting (one vote per browser session)
- `badgeClaims` - attendance badge claims (`${eventNumber}-${sessionId}`, visitor/voter tiers)
- `contestEntries` - flyer contest submissions
- `notificationTokens/{fid}` - mini app push tokens (Admin SDK only)

### Concert History
| # | Date | Theme | Artists | Status |
|---|------|-------|---------|--------|
| 1 | March 29, 2025 | The pilot | AttaBotty, Clejan | completed |
| 2 | October 11, 2025 | Second installment | Tom Fellenz, Stilo World, AttaBotty | completed |
| 3 | March 7, 2026 | + WaveWarZ battle | Dúo Dø Musica, Joseph Goats, Stilo World | completed |
| 4 | April 11, 2026 | The rebrand show | Joseph Goats, Tom Fellenz, Stilo World | completed |
| 5 | May 9, 2026 | A Day in the Life | GodCloud | completed (recap pending) |
| 6 | June 13, 2026 | The African Experience | Iman Afrikah, Santana | completed (recap pending) |
| 7 | July 18, 2026 | WaveWarZ Takeover | DJ Zaal + WaveWarZ artists (TBA week of show) | upcoming |

---

## Show Day Checklist

Full show-night playbook (COC #7 pilot): **`docs/coc7-show-night-runbook.md`** — covers blockers, push timing, battle control, and the pilot metrics watch list. The steps below are the condensed version.

Everything below runs from `cocconcertz.com/admin` (admin passcode). The
terminal equivalents in parentheses work too, if you prefer scripts.

### Before the show
1. Run smoke test: `bash scripts/smoke-test.sh` — all checks must pass (upload + pilot gate canary)
2. Go to `cocconcertz.com/admin`
3. Verify artists have set up their profiles in the portal
4. Post an announcement: "ConcertZ #7 starts at 4PM EST today!"
5. Send a show-day push from the **Show Night** panel - subscriber count is shown (or `npx tsx scripts/send-notification.ts --id coc7-showday --title "..." --body "..."`)

### Going live
6. Click **GO LIVE** - visitors get the full-page live takeover
7. Update the announcement: "ConcertZ #7 is LIVE - join now!"
8. Use **Now Playing** controls to mark the current song as each artist performs

### Running a battle vote
9. In the **Show Night** panel, fill Battle Title + the two sides, click **GO LIVE WITH BATTLE** - the vote widget appears on the homepage (or `npx tsx scripts/manage-battle.ts create "<title>" "<A>" "<B>"`)
10. The crowd votes (anonymous, one per browser session); the split bar updates live
11. Click **END BATTLE + TALLY** to close and record the winner (or `manage-battle.ts close`)

### During the show
12. Monitor the live chat
13. Tap through setlist songs as they play
14. Check pilot metrics every 30 min: `https://cocconcertz.com/api/metrics/coc7` — note peak `concurrentViewers`, `fanGalleryUploads`, `archiveUploads`
15. Update announcements as needed

### After the show
16. Click **END SHOW**
17. Click **GENERATE RECAP** - auto-creates the recap card with stats
18. Final metrics snapshot: `curl https://cocconcertz.com/api/metrics/coc7` — save the JSON
19. Clear the announcement
20. The recap card + attendance badge stay on the homepage for 7 days (fans claim visitor/voter badges during the window)
21. Post-show: `docs/coc7-post-show-capture.md` (pilot report template) + `docs/recap-video-pipeline.md` + `npx tsx scripts/generate-socials.ts`

---

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables - one command, no key copying
npx vercel link --yes --project co-c-concert-z && npx vercel env pull .env.local
# (or manually: cp .env.local.example .env.local and fill in credentials)

# Run dev server
npm run dev
# Open http://localhost:3000

# Seed artists (requires Firebase Admin credentials)
npx tsx scripts/seed.ts
```

### Environment Variables

```
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Auth
ADMIN_PASSCODE=
ARTIST_PASSCODES={"code1":"artist-slug-1","code2":"artist-slug-2"}
```

---

## Operational Scripts

All scripts live in `scripts/` and are idempotent. Run with `npx tsx scripts/<name>.ts` after `.env.local` is in place.

| Script | What it does |
|--------|-------------|
| `seed.ts` | One-shot artist seeding (legacy bootstrap) |
| `seed-past-events.ts` | Upserts events #1-#4 with name, date, flyer, lineup links, and recap content |
| `update-coc5.ts` | Patches the COC #5 event doc (GodCloud) and flips status |
| `update-coc6.ts` | Upserts COC #6 (The African Experience) and marks #5 completed |
| `seed-iman-crew.ts` | Original Iman crew artist doc (now renamed via setup-coc6-artists.ts) |
| `setup-coc6-artists.ts` | Renames Iman doc to `iman-afrikah`, creates `santana`, links both to event #6, generates portal passcodes |
| `seed-godcloud-artist.ts` | Original GodCloud artist seed |
| `seed-duo-do.ts` | Stub artist doc for Dúo Dø Musica |
| `seed-artist-socials.ts` | Bulk-merges public socials into existing artist docs (idempotent merge, never overwrites) |
| `dedupe-fellenz.ts` | One-shot cleanup that merged the older `tom-fellenz` doc into the canonical `fellenz` doc |
| `list-artists.ts` | Read-only inventory of the artists collection - slug, stageName, socials keys, linked event count |
| `check-cloudinary-rule.ts` | Verifies the Cloudinary upload preset/rule used by the artist portal |
| `update-coc7.ts` | Upserts COC #7 (WaveWarZ Takeover) and marks #6 completed |
| `manage-battle.ts` | Show-night battle control: `create "<title>" "<A>" "<B>"` / `close` / `status` (also available in the admin Show Night panel) |
| `send-notification.ts` | Push notification to all mini app subscribers - batched, deduped by stable id, `--dry-run` |
| `generate-socials.ts` | 7 platform-sized post drafts in the COC voice from `--theme` / `--highlight` / `--link` |
| `fetch-wavewarz-history.ts` | Bakes the WaveWarZ battle snapshot into `src/data/wavewarz-history.json` - rerun before shows |
| `smoke-test.sh` | 17-check production health test (`npm run smoke`, or pass a base URL) |
| `lib/admin-init.ts` | Shared admin credential init: FIREBASE_ADMIN_* env vars, or ADC fallback (`gcloud auth application-default login`) |

Fresh clones no longer need any key copying: `npx vercel link --yes --project co-c-concert-z && npx vercel env pull .env.local` hydrates all credentials. Scripts also fall back to Application Default Credentials (`gcloud auth application-default login`) via `lib/admin-init.ts` when the FIREBASE_ADMIN_* vars are absent.

Two baked data snapshots power homepage sections without live calls: `src/data/wavewarz-history.json` (battle history, refreshed by `fetch-wavewarz-history.ts`) and `src/data/wavewarz-leaderboard.json` (49 main-event artists with wallets, X handles, records - scraped from the WaveWarZ Intelligence leaderboards).

The full event recap data model is in `src/lib/types.ts` as `EventRecap` (summary, highlights, videos, transcriptUrls) - render path is in `src/app/events/[number]/page.tsx`.

---

## Firebase Setup

The Firestore configuration lives at the repo root: `firebase.json`, `firestore.rules`, `firestore.indexes.json`. The schema and rule rationale are documented in `docs/firebase-inventory.md`.

### Deploy rules and indexes

```bash
# One-time
npm install -g firebase-tools
firebase login
firebase use <project-id>

# Each deploy
npm run firebase:deploy:rules
```

### Local emulator

```bash
# Start Firestore + Auth emulators on 127.0.0.1:8080 / 9099 (UI on :4000)
npm run firebase:emulator

# Point the dev server at the emulator
echo "NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true" >> .env.local
npm run dev
```

The client SDK auto-connects to the emulator when `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`.

### App Check status

Wired but dormant. `src/lib/firebase.ts` activates reCAPTCHA v3 App Check automatically the moment `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set - no code change needed. To turn it on: register a reCAPTCHA v3 site key in the Firebase console (steps in `docs/app-check-setup.md`), add the env var in Vercel, redeploy, then flip enforcement in the console once token metrics look clean. Until then, the public-write collections (`chat`, `gallery`, `subscribers`, `contestEntries`, `battles/{id}/votes`, `badgeClaims`) are protected by rule-level validation only.

### Backups

Daily Firestore export to a Cloud Storage bucket via `.github/workflows/firestore-backup.yml`. The workflow header has the one-time GCP setup steps (bucket, service account, GitHub secrets). Bucket lifecycle is recommended at 30 days.

### Required env vars

See `.env.local.example`. The Firebase Admin SDK throws at module load if any of `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` is missing - set them in Vercel before the first deploy.

---

## Runbooks & Documentation

All operational docs live in `docs/`. Start here for anything show- or ops-related.

| Doc | What it covers |
|-----|----------------|
| `docs/coc7-prep-checklist.md` | The live COC #7 show-prep tracker - blockers, cleanup, code changes, team asks. **Check this first for what's outstanding.** |
| `docs/wavewarz-brief.md` | Full WaveWarZ show-prep dossier: battle mechanics, the alumni-battler lineup story (GodclouD, Stilo, Cannon), numbers, Base timing. |
| `docs/testflight-runbook.md` | The Capacitor iOS app + the Apple-account steps to get it on TestFlight. |
| `docs/coc-agent-roadmap.md` | Path to an autonomous COC show-ops agent (4 stages). `.claude/agents/coc-ops.md` is the agent definition usable today. |
| `docs/recap-video-pipeline.md` | Post-show branded recap videos via the spacetovideo pipeline (Deepgram + Remotion). |
| `docs/app-check-setup.md` | Turning on reCAPTCHA v3 App Check for the public-write collections. |
| `docs/firebase-inventory.md` | Firestore schema + rule rationale. |
| `docs/TODO-archive-activation.md` | Manual steps to activate the Arweave archive feature (Supabase, Arweave wallet, token gate). |

### Health check

`npm run smoke` runs 17 credential-free checks against production (pages,
content markers, OG cards, SEO surfaces, Farcaster manifest, webhook signature
rejection, admin auth walls, upload health). Run before every show and after
every deploy; it exits non-zero on any failure. Point at any base URL with
`npm run smoke -- https://your-preview-url`.

### iOS app

The `ios/` directory is a Capacitor shell that loads the production site, so
content updates ship through normal Vercel deploys with no resubmission. Local
loop: `npx cap sync ios && npx cap open ios`. TestFlight steps: `docs/testflight-runbook.md`.

---

## Current Status (2026-07-04)

The site is live on COC #7 (WaveWarZ Takeover, July 18). All features below are
deployed and verified in production.

**Shipped this cycle:** COC #7 rollover, flyer contest (`/contest`), live battle
voting, attendance badges, WaveWarZ history section, mini-app push notifications
(webhook + full JFS verification), the admin Show Night panel, dynamic OG cards,
the `npm run smoke` health check, the Capacitor iOS app, and the legacy static
layer removed.

**Known blocker - image uploads down:** `/api/upload` returns 500. The Cloudinary
API key (cloud `dzzqdbo9k`) has lost its permissions, which kills both contest
submissions and the fan gallery. Fix in the Cloudinary console (Access Keys →
re-enable or regenerate), update `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
in Vercel, redeploy. `npm run smoke` will flip that check to PASS once fixed.
Full detail at the top of `docs/coc7-prep-checklist.md`.

**Outstanding before the show** (see the checklist for the full list): create the
Luma event, pick the contest winner (deadline July 10), confirm the WaveWarZ crew
lineup (week of show), and add #5/#6 recap content.

---

## Design System

- **Colors:** Gold (#FFD600), Cyan (#00F0FF), Deep Black (#050505)
- **Fonts:** Bebas Neue (display), IBM Plex Mono (mono), Satoshi (body)
- **Textures:** Film grain overlay, scanlines, halftone dot backgrounds
- **Effects:** Floating animations, glitch overlays, scroll-reveal, pulsing glows
- **Components:** Cut-corner cards (`clip-path`), cyberpunk badges, status indicators

---

## Future Roadmap

### Shipped
- [x] Live chat (Firestore)
- [x] Farcaster Mini App push notifications (webhook + JFS-verified tokens + send tooling)
- [x] Community battle voting (anonymous, no-wallet - the free layer of the WaveWarZ format)
- [x] Attendance badges (off-chain, visitor/voter tiers - POAP version still below)
- [x] iOS app shell (Capacitor, TestFlight-ready)

### Phase 2: Live Experience
- [ ] Emoji reactions overlay during shows
- [ ] Song request queue with upvoting
- [ ] Mini App Quick Auth + haptics

### Phase 3: Web3 & Monetization
- [ ] Wallet connection (wagmi/RainbowKit)
- [ ] Tipping system (ETH/USDC on Base + off-chain Respect)
- [ ] 0xSplits revenue distribution (80% artist / 10% treasury / 10% curator)
- [ ] Attendance POAPs (ERC-1155 on Base - onchain upgrade of the current badge)
- [ ] Onchain WaveWarZ battle betting (link out to wavewarz.com; x402 agent bets on Base)
- [ ] Coinbase Onramp for fiat users

### Phase 4: Production & Engagement
- [ ] OBS WebSocket integration (scene switching from admin)
- [ ] Multistream management (YouTube/Twitch/Kick)
- [ ] Chat aggregation across platforms
- [ ] Reputation system and fan tier badges

### Phase 5: Advanced
- [ ] NFT tickets via Unlock Protocol
- [ ] Token-gated VIP features
- [ ] AI features via OpenRouter (live captions, song ID, moderation)
- [ ] Synchronized listening rooms
- [ ] Clip creation and replay system

---

## License

&copy; 2026 COC Concertz. All rights reserved.
