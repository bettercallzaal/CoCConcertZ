# COC Concertz — Metaverse Concert Landing Page

A landing page and Farcaster Mini App for COC Concertz, a live metaverse concert experience hosted in StiloWorld on Spatial.io.

## Live Site

**https://cocconcertz.com**

## What's Built

### Branding & Design
- Official C.O.C. Concertz logo as hero centerpiece with pulsing gold glow and glitch overlay effect
- Sticky nav logo appears on scroll (IntersectionObserver) with golden drop-shadow
- Logo in footer with hover glow
- Favicon and apple-touch-icon using the logo
- Gig poster x cyberpunk aesthetic with halftone backgrounds, clipped corners, grain overlay, scanlines
- Fonts: Bebas Neue (display), JetBrains Mono (mono), Space Grotesk (body)
- Color palette: gold (#FFD600), cyan (#00F0FF), deep black (#050505)

### Core Site
- Live countdown timer to next show (auto-advances through upcoming shows)
- Spatial.io metaverse venue embed with Twitch stream toggle
- Event schedule with "Today" / "Live Now" dynamic badges
- ConcertZ #3 flyer image in schedule section
- ConcertZ #4 promoted with RSVP link to Luma in schedule + final CTA
- Past shows archive (ConcertZ #1 and #2)
- Artist lineup with tabbed panels per concert (#1, #2, #3)
- YouTube video embeds with clickable song lists for all past performances
  - ConcertZ #1: AttaBotty (8 videos), Clejan (14 videos)
  - ConcertZ #2: Fellenz, Stilo World WaveWarZ, AttaBotty
- Community links (The ZAO, Community of Communities)
- Social share section (Farcaster, X/Twitter, Copy Link) with pre-filled share text
- "How to Join" steps for new metaverse visitors
- Responsive design for mobile and desktop
- Scroll-reveal animations on all sections

### Farcaster Mini App
- `fc:miniapp` embed meta tag for feed discovery with "Enter the Venue" button
- `/.well-known/farcaster.json` manifest with signed account association (FID 19640)
- Mini App SDK integration with `ready()` call
- Stream fallback — "Watch Live on Twitch" button inside Farcaster (nested iframes blocked by Twitch)
- Native `composeCast` share to `/cocconcertz` channel
- Splash screen with spec-compliant 200x200px logo and yellow (#FFD600) background
- Manifest includes: imageUrl, buttonTitle, primaryCategory (music), tags, heroImageUrl, OG metadata

### SEO & Meta
- Open Graph + Twitter Card meta tags with flyer image
- `og:site_name` for branding in embeds
- JSON-LD structured data (Event schema with performers + image)
- Single H1 for proper heading hierarchy
- robots.txt + sitemap.xml
- Canonical URL, meta description, theme-color

## Tech Stack

- **HTML/CSS/JS** — single-page static site, no build step
- **Spatial.io** — metaverse venue embed
- **Twitch** — live stream embed
- **YouTube** — performance video embeds
- **Farcaster Mini App SDK** — via esm.sh CDN
- **Luma** — event RSVP
- **Vercel** — deployment with custom headers and CORS

## Deploy

Static site on Vercel — auto-deploys on push to `main`. Custom domain via Porkbun.

## Future Ideas

### High Priority
- [ ] Media gallery — let fans upload/share photos and videos from events
- [ ] Confetti or visual effect when countdown hits zero / show goes live
- [ ] Calendar export (.ics download) for upcoming shows
- [ ] QR code for easy mobile access to the venue
- [ ] Convert logo to 1024x1024 PNG (no alpha) for Farcaster spec compliance
- [ ] Add Farcaster mini app screenshots (1284x2778px, up to 3) for app store listing
- [ ] Create 3:2 aspect ratio (1200x800) version of flyer for optimal embed previews
- [ ] Farcaster notifications via webhookUrl for show reminders
- [ ] Google Analytics or Plausible analytics integration
- [ ] Loading skeleton / shimmer while Spatial embed initializes

### Content & Events
- [ ] Dynamic event schedule pulled from a CMS (Notion, Airtable, Sanity)
- [ ] Paragraph newsletter integration for recaps and announcements
- [ ] Newsletter signup for show alerts
- [ ] FAQ section for first-time metaverse visitors
- [ ] Press kit page with logos, bios, and media assets
- [ ] Testimonials or quotes from attendees
- [ ] Artist profile pages with full bios, photos, social links, and discography
- [ ] Setlist pages for each past concert with timestamps
- [ ] Post-show recap pages with highlights, stats, and community photos

### Design & UX
- [ ] Background video or looping visuals behind the hero logo
- [ ] Particle effects or Three.js animated background (stars, music notes)
- [ ] Sound toggle — ambient music on the landing page
- [ ] Animated gradient border on event cards
- [ ] Custom cursor effect matching the cyberpunk theme
- [ ] Dark/light mode toggle (light mode with inverted gold-on-white)
- [ ] Parallax scrolling effects between sections
- [ ] Micro-interactions on CTA buttons (ripple, pulse on hover)
- [ ] Animated waveform visualizer in the hero or countdown section

### Web3 & Blockchain
- [ ] POAP integration (Proof of Attendance Protocol) for attendees
- [ ] On-chain ticket minting (NFT event passes on Base)
- [ ] Token-gated access to exclusive content or backstage areas
- [ ] NFT gallery showcasing event collectibles and artist drops
- [ ] Tipping / donations via crypto during live shows
- [ ] Wallet connect for Base / Farcaster users
- [ ] On-chain event history (transparent attendance records)
- [ ] Merch purchases with crypto payments

### Farcaster Mini App Enhancements
- [ ] Farcaster notifications for show reminders (webhookUrl + server)
- [ ] In-app voting / polls during live concerts via composeCast
- [ ] Leaderboard for most active community members
- [ ] Share extension — receive casts shared into the app
- [ ] Deep links to specific artist pages or past shows
- [ ] Farcaster social graph — show which friends are attending
- [ ] Farcaster-hosted manifest (redirect to eliminate caching issues)
- [ ] Mini app analytics via Farcaster Developer Rewards dashboard
- [ ] Farcaster channel integration — pull recent casts from /cocconcertz into site

### Platform Expansion
- [ ] Spotify/Apple Music embeds for featured artists
- [ ] Discord bot that announces shows and links to the venue
- [ ] Multiple venue pages for different Spatial spaces
- [ ] Merch store integration (Shopify, Printful)
- [ ] Podcast page for recorded DJ sets or interviews
- [ ] Partner/sponsor showcase section
- [ ] PWA with push notifications and offline support
- [ ] Multi-language support (EN, ES, PT)
- [ ] Telegram or WhatsApp group integration
- [ ] Referral system — share and earn rewards or early access

### Infrastructure
- [ ] Migrate to Next.js for dynamic pages and SSR
- [ ] CMS integration for managing events and artists
- [ ] Edge functions for geo-targeted content (show local times)
- [ ] Lighthouse score optimization (target 95+)
- [ ] Image optimization (WebP conversion, responsive srcset)
- [ ] Error monitoring (Sentry)
- [ ] A/B testing on hero CTA variants
- [ ] CI/CD with GitHub Actions (lint, preview deploys)
- [ ] Staging environment for testing before production

## Local Development

```bash
python3 -m http.server 8001
# Open http://localhost:8001
```

## License

&copy; 2026 COC Concertz. All rights reserved.
