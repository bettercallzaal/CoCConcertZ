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
- Spatial.io metaverse venue embed with Twitch stream toggle
- Artist lineup with tabbed panels per concert (ConcertZ #1-4)
- ConcertZ #4 artist cards pull live from Firestore — artist profile edits appear on the site
- Upcoming and past shows connected to Firestore (admin-managed)
- Live visitor count with real-time Firestore presence
- Announcement banner system (admin-controlled, dismissible)
- Share section (Farcaster composeCast, X/Twitter, clipboard copy)
- Scroll-reveal animations, responsive design

### Public Artist Pages (`/artists/[slug]`)
- Shareable profile pages for each artist
- Dynamic SEO metadata (title, description, OG tags)
- Artist's custom accent and background colors
- Bio, social links, performance history across events
- Setlist display with song/video links
- Upcoming performance CTA with RSVP button

### Public Event Pages (`/events/[number]`)
- Dedicated page per concert with flyer/banner image
- Lineup grid linking to artist profiles
- RSVP button (upcoming) or "JOIN NOW" (live)
- Venue links (Spatial.io + stream)
- Dynamic SEO metadata with flyer as OG image

### Admin Dashboard (`/admin`)
- **Event Management** — full CRUD for events (name, date, description, venue, RSVP link, status, flyer/banner)
- **GO LIVE / END SHOW** — one-click toggle to flip an event to live mode
- **Announcement Banner** — type a message, it shows across the public site instantly
- **Invite System** — send invites by email with role assignment (admin/artist/fan), track pending/accepted/revoked
- **User Management** — view all users, switch roles
- **Seed Artists** — one-click button to pre-populate artist profiles

### Artist Portal (`/portal`)
- Per-artist passcode login (unique 5-letter code per artist)
- **Profile Editor** — stage name, bio, social links (Twitter, Farcaster, Audius, Spotify, YouTube, website), wallet address
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
- robots.txt + sitemap.xml
- Canonical URL, meta description, theme-color

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS + CSS custom properties
- **Auth:** Passcode-based (admin + per-artist codes via env vars, httpOnly cookies)
- **Database:** Firebase Firestore
- **Hosting:** Vercel (auto-deploy on push to `main`)
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
│   └── api/auth/                   # Auth API (passcode verify, cookie mgmt)
├── components/
│   ├── home/                       # Homepage sections (14 components)
│   ├── admin/                      # Admin components
│   ├── portal/                     # Portal components
│   ├── layout/                     # Sidebars
│   └── ui/                         # Primitives (Button, Input, Card, Badge, Modal)
├── lib/
│   ├── firebase.ts                 # Firebase client SDK init
│   ├── firebase-admin.ts           # Firebase Admin SDK init
│   ├── db.ts                       # Firestore CRUD helpers
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

---

## Event Data

### Firestore Collections
- `events` — name, number, date, venue, rsvpLink, status, flyer/banner URLs, artist assignments, announcement
- `artists` — stageName, slug, bio, socialLinks, cardCustomization, linkedEvents
- `sets` — songs, videos, notes per artist per event
- `invites` — email, role, status
- `users` — role, email, displayName
- `stats/visitors` — real-time visitor count

### Concert History
| # | Date | Artists |
|---|------|---------|
| 1 | March 29, 2025 | AttaBotty, Clejan |
| 2 | October 11, 2025 | Tom Fellenz, Stilo World, AttaBotty |
| 3 | March 7, 2026 | Duo Do Musica, Joseph Goats, Stilo World |
| 4 | April 11, 2026 | Joseph Goats, Stilo, Tom Fellenz |
| 5 | May 9, 2026 | TBA |

---

## Show Day Checklist

1. Go to `cocconcertz.com/admin`
2. Click **GO LIVE** on the event
3. Post an announcement: "ConcertZ #4 is LIVE — join now!"
4. After the show, click **END SHOW**
5. Clear the announcement

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

# Auth
ADMIN_PASSCODE=
ARTIST_PASSCODES={"code1":"artist-slug-1","code2":"artist-slug-2"}
```

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
