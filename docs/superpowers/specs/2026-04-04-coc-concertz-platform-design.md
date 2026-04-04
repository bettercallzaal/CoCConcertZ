# COC ConcertZ Platform — Full Design Spec

## Overview

Migrate COC ConcertZ from a static HTML site to a full Next.js platform on Vercel with Firebase backend. Three user tiers: **Admin**, **Artist**, **Fan**. Features span event management, artist creator portal, live show controls, Web3 monetization, Farcaster integration, streaming production tools, and community engagement.

---

## Architecture

- **Framework:** Next.js 15 (App Router)
- **Auth:** Firebase Auth (Google sign-in)
- **Database:** Firestore
- **Storage:** Firebase Storage (images, audio, video assets)
- **Hosting:** Vercel
- **Blockchain:** Base (L2) via viem/wagmi
- **Streaming:** OBS WebSocket, RTMP multistream
- **AI:** OpenRouter (later phase)
- **Real-time:** Firebase Realtime Database (reactions, chat, presence)

---

## Data Model

### Users
```
userId, email, displayName, photoURL, role (admin | artist | fan),
walletAddress?, invitedBy, createdAt, lastLogin
```

### Events
```
eventId, name, number, date, venue (spatialLink, streamLink),
rsvpLink, status (upcoming | live | completed),
flyerUrl, bannerUrl, description, announcement?,
artists[] (artistId, order, setTime?), createdAt, updatedAt
```

### Artists
```
artistId, userId, stageName, slug, bio, profilePhoto,
socialLinks {twitter, farcaster, audius, spotify, youtube, website},
cardCustomization {primaryColor, backgroundColor, backgroundImage, featuredMedia},
linkedEvents[], respectScore?, walletAddress?, createdAt
```

### Sets
```
setId, artistId, eventId, songs[] {title, platform, url, videoId},
videos[] {title, url, platform}, notes, order
```

### Invites
```
inviteId, email, role, invitedBy, status (pending | accepted | revoked),
createdAt, acceptedAt?
```

### Tips
```
tipId, fromUserId, toArtistId, eventId, amount, currency (ETH | USDC | RESPECT),
txHash?, mode (onchain | offchain), createdAt
```

### Attendance
```
attendanceId, userId, eventId, joinedAt, leftAt?, duration,
poapMinted (boolean), poapTxHash?
```

### Predictions
```
predictionId, eventId, question, options[], stakes[] {userId, optionIndex, amount},
status (open | locked | settled), settledOptionIndex?, createdAt
```

---

## Roles & Permissions

| Action | Admin | Artist | Fan |
|--------|-------|--------|-----|
| Manage events (CRUD) | Yes | No | No |
| Toggle live mode | Yes | No | No |
| Invite users | Yes | No | No |
| OBS/stream controls | Yes | No | No |
| Manage announcements | Yes | No | No |
| Edit own profile/bio | Yes | Yes | Yes |
| Upload assets | Yes | Yes | No |
| Manage own setlist | Yes | Yes | No |
| Customize artist card | Yes | Yes | No |
| Send tips | Yes | Yes | Yes |
| Song requests | Yes | Yes | Yes |
| Live reactions | Yes | Yes | Yes |
| Vote in predictions | Yes | Yes | Yes |
| View full lineup | Yes | Yes | Yes |
| Claim attendance POAP | Yes | Yes | Yes |

---

## Pages

### Public Pages

#### `/` — Homepage
Redesigned with the existing design system (black/yellow/cyan, Bebas Neue + IBM Plex Mono + Satoshi). All content dynamically pulled from Firestore.

- Hero section with logo constellation, countdown to next show
- Live mode banner (when active) with "JOIN NOW" CTA
- Venue embed (Spatial.io) with metaverse/stream toggle
- About section
- How to join steps
- Upcoming shows (from events collection)
- Past shows archive with flyers
- Community links (ZAO, COC)
- Artist lineup (tabbed by event, rendered from DB)
- Share section (Farcaster, X, copy link)
- Final CTA with RSVP

#### `/artists/[slug]` — Artist Profile Page
Full artist page with:
- Custom-styled header (artist's chosen colors/background)
- Bio and social links
- Performance history across COC ConcertZ events
- Embedded videos/setlists from past shows
- Tip button (if wallet connected)
- Audius/Spotify embeds for their music

#### `/events/[number]` — Event Page
Dedicated page per concert:
- Event flyer/banner
- Date, time, venue details
- Full artist lineup with cards
- Setlists and videos (post-event)
- Attendance count
- RSVP link (pre-event) or replay link (post-event)

#### `/live` — Live Concert Page
Active only during shows:
- Venue embed (Spatial.io or stream)
- Live chat (Firebase Realtime)
- Emoji reactions overlay
- Song request queue
- Tip leaderboard
- Now playing indicator
- Prediction market voting (WaveWarZ battles)
- Attendance tracker / "X people here" presence

### Auth Pages

#### `/login` — Google Sign-In
Simple Firebase Auth flow. Post-login redirect based on role.

#### `/admin` — Admin Dashboard
- Event management (create, edit, delete events)
- Live controls (GO LIVE button, announcement banner, venue/stream link swap)
- User management (view all users, change roles)
- Invite system (send invites by email, manage pending/accepted)
- Analytics (attendance counts, tip totals, engagement metrics)
- OBS WebSocket controls (scene switching, go live/stop)
- Multistream management (YouTube/Twitch/Kick RTMP keys)

#### `/admin/events` — Event CRUD
- Create/edit events with all fields
- Upload flyers and banners
- Assign artists to events
- Set event status

#### `/admin/invites` — Invite Management
- Send invites by email with role selection
- View pending, accepted, revoked invites
- Revoke access

#### `/admin/stream` — Stream Production
- OBS WebSocket connection status
- Scene switcher (starting soon, live performance, BRB, end screen)
- Multistream targets (add/remove RTMP destinations)
- Chat aggregation view (Twitch + YouTube + Kick in one feed)
- Clip creation (save highlight moments)
- Stream overlay settings

#### `/portal` — Artist Portal Home
Dashboard showing:
- Upcoming events they're part of
- Quick links to profile, sets, card customization
- Tip earnings summary
- Notifications

#### `/portal/profile` — Edit Artist Profile
- Stage name, bio, profile photo upload
- Social links (Twitter, Farcaster, Audius, Spotify, YouTube, website)
- Wallet address for tips

#### `/portal/sets` — Manage Setlists
- Add/edit songs per event (title, platform, URL)
- Upload/link performance videos
- Reorder setlist
- Add notes

#### `/portal/card` — Customize Artist Card
- Choose primary color and background color
- Upload background image
- Select featured media (video or image)
- Live preview of how card looks on the public site

---

## Feature Specs

### 1. Live Show Mode

**Trigger:** Admin clicks "GO LIVE" or auto-activates at event time.

**What changes:**
- Homepage hero becomes live banner with pulsing "LIVE NOW" badge
- Countdown replaced with "JOIN LIVE NOW" button
- `/live` page activates with full concert experience
- Venue embed auto-loads stream or Spatial
- Chat, reactions, tips, song requests all become active
- Farcaster Mini App shows live state

**Admin controls during live:**
- Announcement banner (text that appears site-wide)
- Swap venue/stream links on the fly
- Manual override for live start/stop
- Scene switching via OBS WebSocket

### 2. Tipping System

Three modes:

**Mode A: Native ETH tips (Base)**
- Preset amounts: 0.001 / 0.005 / 0.01 ETH
- Direct transfer to artist's wallet or 0xSplits contract
- Visual: tip animation overlay (floating amounts, confetti)

**Mode B: ERC-20 tips (USDC on Base)**
- Preset amounts: $1 / $5 / $10
- Same split logic via 0xSplits

**Mode C: Off-chain Respect tips (zero gas)**
- Firestore-based, no wallet needed
- Fans tip "Respect points" that contribute to artist reputation
- Good for non-crypto fans

**Revenue splits via 0xSplits:**
- Default: 80% artist / 10% treasury / 10% curator
- Collaboration: 40% artist1 / 40% artist2 / 10% treasury / 10% curator
- Auto-convert ETH to USDC via Swapper contract (optional)

**Leaderboard:** Real-time tip totals displayed during live shows, sorted by amount.

### 3. Attendance POAPs

- When a fan joins a live event, their attendance is recorded in Firestore
- Post-event, admin triggers POAP mint
- ERC-1155 on Base (batch mint, <$0.01 gas per)
- Mint-and-burn pattern: NFT serves as proof of attendance, non-transferable
- Fans see their POAP collection on their profile
- Fallback for non-wallet users: off-chain attendance badge in Firestore

### 4. Reactions & Chat

**Reactions:**
- Emoji overlay on the live page (fire, clap, heart, 100, music note)
- Firebase Realtime Database for sub-100ms delivery
- Rate-limited to prevent spam (max 3/second per user)
- Visual: emojis float up from bottom of venue embed

**Chat:**
- Firebase Realtime Database
- Username + avatar from Firebase Auth profile
- Moderation: admin can mute/ban users
- Optional: aggregate Twitch/YouTube chat into same feed

### 5. Song Requests

- Fans submit song requests during live shows
- Queue visible to artists and admin
- Upvote system (fans can +1 existing requests)
- Admin/artist can mark as "playing now" or dismiss
- Persisted in Firestore per event

### 6. Prediction Markets (WaveWarZ Battles)

- Admin creates a prediction question for an event (e.g., "Who wins the WaveWarZ battle?")
- Options tied to artists or teams
- Fans stake Respect points (off-chain, zero gas)
- Parimutuel pool: winners split the losing pool proportionally
- Admin settles the prediction after the outcome
- Results displayed on event page post-show

### 7. Farcaster Mini App

Upgrade existing Mini App integration:
- **Zero-login entry** via Quick Auth (Farcaster users auto-authenticated)
- **`sendToken()`** for in-app tipping without leaving the frame
- **Push notifications** for show reminders (24h before, 1h before, live now)
- **`composeCast()`** for sharing moments during live shows
- **`viewProfile()`** on artist cards to see their Farcaster profile
- **`addMiniApp()`** prompt for first-time visitors
- **Haptics** on reaction buttons for mobile feel

### 8. Streaming Production (Admin)

**OBS WebSocket Integration:**
- Connect to OBS via WebSocket from admin panel
- Switch scenes (Starting Soon, Live Performance, BRB, End Screen)
- Go live / stop stream remotely
- Monitor stream health (bitrate, dropped frames)

**Multistream:**
- Configure RTMP destinations (YouTube, Twitch, Kick, Facebook)
- Start/stop individual streams
- Chat aggregation from all platforms into unified feed

**Overlays:**
- Now Playing overlay (song title + artist)
- Speaker name lower-third
- Tip notification overlay
- Attendance count overlay

### 9. NFT Tickets (Future Events)

- **Unlock Protocol** on Base for ticket contracts
- Deploy `PublicLock` per event
- Free mint (gas-only) or priced tickets
- `balanceOf` check for entry to gated features (VIP chat, backstage room)
- Post-event: ticket becomes collectible (non-transferable POAP)
- Fiat on-ramp via Coinbase Onramp API (Apple Pay, guest checkout)

### 10. AI Features (OpenRouter — Later Phase)

- **Live captions** via Deepgram (sub-300ms transcription)
- **Song identification** via ACRCloud (auto "Now Playing" detection)
- **AI DJ Assistant** — automated playlist suggestions based on room mood
- **Sentiment analysis** — real-time audience mood tracking from chat
- **Auto-highlights** — detect peak moments for clip creation
- **AI moderation** — auto-flag inappropriate chat messages

### 11. Reputation System

**Composite score for fans:**
- Concert attendance (30%)
- Tips given (20%)
- Chat participation (15%)
- Prediction accuracy (15%)
- Song requests played (10%)
- Account tenure (10%)

**Display tiers:**
- Legend (850+)
- Veteran (650+)
- Regular (450+)
- Rising (250+)
- Newcomer (0-249)

Tier badge shown next to username in chat and on profile.

### 12. Token-Gated VIP

- Certain features gated by NFT/token ownership
- Gate check via viem `readContract` + `balanceOf`
- Possible gates: VIP chat room, backstage access, early RSVP, exclusive replays
- Configurable per event by admin

---

## Design System

Carry forward and refine the existing aesthetic:

- **Colors:** `--black: #050505`, `--yellow: #FFD600`, `--cyan: #00F0FF`, `--card: #0a0a0a`, `--border: #1a1a1a`
- **Fonts:** Bebas Neue (display), IBM Plex Mono (mono/labels), Satoshi (body)
- **Texture:** Film grain overlay, scanlines, halftone dot pattern
- **Motion:** Scroll reveal animations, glitch effects on hover, floating keyframes
- **Cards:** Cyberpunk cut corners (`clip-path`), border glow on hover
- **Responsive:** Mobile-first, all features work on phone (Farcaster Mini App context)

The redesign keeps this DNA but executes it with proper React components, CSS modules or Tailwind, and dynamic content from Firestore.

---

## Implementation Phases

### Phase 1: Foundation
- Next.js project setup with App Router
- Firebase project setup (Auth, Firestore, Storage)
- Google sign-in flow
- Invite system and role management
- Port public site content into React components with Firestore data
- Admin dashboard: event CRUD, user management, invites
- Artist portal: profile editing, set management, card customization
- Deploy to Vercel

### Phase 2: Live Experience
- Live mode toggle and auto-activation
- `/live` page with venue embed
- Real-time chat (Firebase Realtime)
- Emoji reactions overlay
- Song request queue
- Announcement banner system
- Farcaster Mini App upgrades (Quick Auth, push notifications)

### Phase 3: Web3 & Monetization
- Wallet connection (wagmi/RainbowKit)
- Tipping system (ETH, USDC, off-chain Respect)
- 0xSplits revenue distribution
- Attendance POAPs (ERC-1155 on Base)
- Tip leaderboard and animations
- Coinbase Onramp for fiat users

### Phase 4: Production & Engagement
- OBS WebSocket integration
- Multistream management
- Chat aggregation (Twitch/YouTube/Kick)
- Stream overlays (now playing, tips, attendance)
- Prediction market voting (WaveWarZ)
- Reputation system and tier badges

### Phase 5: Advanced
- NFT tickets via Unlock Protocol
- Token-gated VIP features
- AI features via OpenRouter (captions, song ID, moderation, highlights)
- Synchronized listening rooms
- Clip creation and replay system

---

## Config Pattern

Adopt the `community.config.ts` pattern from ZAO OS — a single config file defining:
- Branding (colors, fonts, logos)
- Farcaster channels
- Contract addresses (0xSplits, Unlock, POAP)
- Admin user IDs
- Default split ratios
- Spatial venue URLs
- Stream RTMP destinations

This makes the platform forkable for other metaverse concert communities.

---

## Key Decisions

1. **Firebase over Supabase** — user's choice, simpler auth flow, Realtime DB for chat/reactions
2. **Base L2** — low gas for POAPs, tips, tickets. Same chain as ZAO ecosystem
3. **Next.js App Router** — server components for SEO, client components for interactive features
4. **Phased rollout** — foundation first, layer features incrementally
5. **Forkable config** — other communities can spin up their own concert platform
