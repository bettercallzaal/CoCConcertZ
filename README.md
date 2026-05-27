# COC Concertz — Metaverse Concert Platform

A full-stack concert platform and Farcaster Mini App for COC Concertz, a live metaverse concert experience hosted in StiloWorld on Spatial.io. Built with Next.js, Firebase, and a cyberpunk design system.

## Live Site

**https://cocconcertz.com**

---

## Platform Overview

### Public Site
- Cyberpunk-themed homepage with floating logo constellation, grain overlay, scanlines, halftone backgrounds
- Live countdown timer to next show (auto-advances through upcoming events)
- "LIVE NOW" state — countdown becomes "JOIN NOW" button, status badge pulses
- **Full-page live mode takeover** — when a show goes live, visitors get a dramatic full-screen overlay with blurred flyer background, pulsing "LIVE NOW" heading, and CTA buttons. The entire page border glows red/yellow. Dismissible, shows once per session
- **Live chat** — collapsible side panel for real-time chat during shows. No login required — pick a name and go. Rate-limited, auto-scrolling, real-time via Firestore
- **"Now Playing" bar** — fixed bottom bar showing the current song and artist with animated equalizer bars, updated live by admin during shows
- **Post-show recap cards** — auto-generated after shows with visitor count, chat messages, artists performed. Shareable, displayed on homepage for 7 days
- Spatial.io metaverse venue embed with Twitch stream toggle
- Artist lineup with tabbed panels per concert (ConcertZ #1-6) with staggered entrance animations and border glow effects, default tab is the upcoming show
- All concert artist cards pull live from Firestore — artist profile edits appear on the site
- Upcoming and past shows connected to Firestore (admin-managed)
- Live visitor count with real-time Firestore presence
- Announcement banner system (admin-controlled, dismissible)
- **Video highlights** — "BEST MOMENTS" grid with curated clips from past shows, click-to-play YouTube embeds
- **Email signup** — "GET NOTIFIED" section for show announcements, saves to Firestore with duplicate detection
- **Fan photo gallery** — fans submit photos with captions, displayed in a grid on the homepage. Cloudinary-hosted uploads
- **Team section** — Zaal & Thy Rev cards with roles, bios, and social links
- **Telegram link** in community section
- Share section (Farcaster composeCast, X/Twitter, clipboard copy)
- Scroll-reveal animations, responsive design
- Mobile-responsive hamburger menus for admin and portal sidebars

### Public Artist Pages (`/artists/[slug]`)
- Shareable profile pages for each artist
- Dynamic SEO metadata (title, description, OG tags)
- Artist's custom accent and background colors
- Bio, social links, performance history across events
- Setlist display with song/video links
- Upcoming performance CTA with RSVP button
- **Auto-generated OG images** — branded social cards generated dynamically for sharing

### Public Event Pages (`/events/[number]`)
- Dedicated page per concert with flyer/banner image
- Lineup grid linking to artist profiles
- RSVP button (upcoming) or "JOIN NOW" (live)
- Venue links (Spatial.io + stream)
- Dynamic SEO metadata with flyer as OG image
- **Show recap section** for completed events — summary paragraph, highlight bullets, YouTube clip grid (linking out), and optional transcript URL list. Recap content lives in `events/{id}.recap` as a structured field, populated by `scripts/seed-past-events.ts` or hand-edited in Firestore.

### Admin Dashboard (`/admin`)
- **Event Management** — full CRUD for events (name, date, description, venue, RSVP link, status, flyer/banner)
- **GO LIVE / END SHOW** — one-click toggle to flip an event to live mode, triggers full-page takeover for visitors
- **Now Playing Controls** — tap through the setlist during a live show, updates the public "Now Playing" bar in real-time
- **Announcement Banner** — type a message, it shows across the public site instantly
- **Post-Show Recap Generator** — one click after END SHOW auto-counts visitors, chat messages, and artists, creates a shareable recap card
- **Invite System** — send invites by email with role assignment (admin/artist/fan), track pending/accepted/revoked
- **User Management** — view all users, switch roles
- **Platform Stats** — subscriber count, events, artists, gallery photos, visitors at a glance
- **Subscriber Management** — view recent signups, export full list as CSV
- **Seed Artists** — one-click button to pre-populate artist profiles

### API Routes
- `/api/auth` — passcode verification, cookie management, logout
- `/api/artists` — artist profile create/update via Firebase Admin SDK (auth-verified)
- `/api/upload` — Cloudinary image upload
- `/api/og/artist` — dynamic OG image generation for artist social cards
- `/api/og/countdown` — countdown social card generation

### Artist Portal (`/portal`)
- Per-artist passcode login (unique 5-letter code per artist)
- **Profile Editor** — stage name, bio, profile photo upload (Cloudinary), social links (Twitter, Farcaster, Audius, Spotify, YouTube, website), wallet address
- **Setlist Manager** — add songs and videos per event, with platform selection
- **Card Customizer** — choose accent color and background color with live preview
- **Preview Link** — "View your public profile" opens their shareable artist page
- Changes go live on the homepage and artist pages immediately

### Farcaster Mini App
- `fc:miniapp` embed meta tag with `launch_frame` action
- `/.well-known/farcaster.json` manifest with signed account association (FID 19640)
- Mini App SDK — `sdk.actions.ready()`, context detection, native `composeCast`
- Stream fallback for Twitch inside Farcaster frames
- Spec-compliant icons (1024x1024 PNG), splash screen, embed preview image

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

**Data access pattern:** Client components use the Firebase client SDK (`db.ts`) for real-time reads via `onSnapshot`. Server components and API routes use the Firebase Admin SDK (`db-server.ts`) for server-side data fetching — this is required because the client SDK cannot authenticate in Vercel serverless functions. Profile saves from the artist portal go through `/api/artists` (admin SDK) rather than writing directly to Firestore.

---

## Event Data

### Firestore Collections
- `events` — name, number, date, venue, rsvpLink, status, flyer/banner URLs, artist assignments, announcement
- `artists` — stageName, slug, bio, socialLinks, cardCustomization, linkedEvents
- `sets` — songs, videos, notes per artist per event
- `invites` — email, role, status
- `users` — role, email, displayName
- `subscribers` — email signups for show notifications
- `gallery` — fan-submitted photos with captions
- `chat/{eventId}/messages` — live chat messages per event
- `live/nowPlaying` — current song and artist during live shows
- `recaps/{eventId}` — auto-generated post-show recap data
- `stats/visitors` — real-time visitor count

### Concert History
| # | Date | Theme | Artists | Status |
|---|------|-------|---------|--------|
| 1 | March 29, 2025 | The pilot | AttaBotty, Clejan | completed |
| 2 | October 11, 2025 | Second installment | Tom Fellenz, Stilo World, AttaBotty | completed |
| 3 | March 7, 2026 | + WaveWarZ battle | Dúo Dø Musica, Joseph Goats, Stilo World | completed |
| 4 | April 11, 2026 | The rebrand show | Joseph Goats, Tom Fellenz, Stilo World | completed |
| 5 | May 9, 2026 | A Day in the Life | GodCloud | completed (recap pending) |
| 6 | June 13, 2026 | The African Experience | Iman Afrikah, Santana | upcoming |

---

## Show Day Checklist

### Before the show
1. Go to `cocconcertz.com/admin`
2. Verify artists have set up their profiles in the portal
3. Post an announcement: "ConcertZ #4 starts at 4PM EST today!"

### Going live
4. Click **GO LIVE** — visitors get the full-page live takeover
5. Update the announcement: "ConcertZ #4 is LIVE — join now!"
6. Use **Now Playing** controls to mark the current song as each artist performs

### During the show
7. Monitor the live chat
8. Tap through setlist songs as they play
9. Update announcements as needed

### After the show
10. Click **END SHOW**
11. Click **GENERATE RECAP** — auto-creates the recap card with stats
12. Clear the announcement
13. The recap card appears on the homepage for 7 days

---

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in Firebase credentials and passcodes

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

The full event recap data model is in `src/lib/types.ts` as `EventRecap` (summary, highlights, videos, transcriptUrls) — render path is in `src/app/events/[number]/page.tsx`.

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

Skeleton in place but **not active**. The init block in `src/lib/firebase.ts` is commented out. Follow `docs/app-check-setup.md` to flip it on once a reCAPTCHA v3 site key is provisioned. Until then, the public-write collections (`chat`, `gallery`, `subscribers`) are protected by rule-level validation only.

### Backups

Daily Firestore export to a Cloud Storage bucket via `.github/workflows/firestore-backup.yml`. The workflow header has the one-time GCP setup steps (bucket, service account, GitHub secrets). Bucket lifecycle is recommended at 30 days.

### Required env vars

See `.env.local.example`. The Firebase Admin SDK throws at module load if any of `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` is missing — set them in Vercel before the first deploy.

---

## Design System

- **Colors:** Gold (#FFD600), Cyan (#00F0FF), Deep Black (#050505)
- **Fonts:** Bebas Neue (display), IBM Plex Mono (mono), Satoshi (body)
- **Textures:** Film grain overlay, scanlines, halftone dot backgrounds
- **Effects:** Floating animations, glitch overlays, scroll-reveal, pulsing glows
- **Components:** Cut-corner cards (`clip-path`), cyberpunk badges, status indicators

---

## Future Roadmap

### Phase 2: Live Experience
- [ ] Live chat (Firebase Realtime Database)
- [ ] Emoji reactions overlay during shows
- [ ] Song request queue with upvoting
- [ ] Farcaster Mini App upgrades (Quick Auth, push notifications, haptics)

### Phase 3: Web3 & Monetization
- [ ] Wallet connection (wagmi/RainbowKit)
- [ ] Tipping system (ETH/USDC on Base + off-chain Respect)
- [ ] 0xSplits revenue distribution (80% artist / 10% treasury / 10% curator)
- [ ] Attendance POAPs (ERC-1155 on Base)
- [ ] Coinbase Onramp for fiat users

### Phase 4: Production & Engagement
- [ ] OBS WebSocket integration (scene switching from admin)
- [ ] Multistream management (YouTube/Twitch/Kick)
- [ ] Chat aggregation across platforms
- [ ] Prediction market voting (WaveWarZ battles)
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
