# COC Concertz — Metaverse Concert Landing Page

A landing page and Farcaster Mini App for COC Concertz, a live metaverse concert experience hosted in StiloWorld on Spatial.io.

## Live Site

**https://cocconcertz.com**

## What's Built

### Branding & Design
- Scattered floating logo constellation in the hero — 7 logo pieces at varying sizes, rotations, and opacities, each drifting independently with unique float animations
- Glitch overlay effect on the center logo piece (hue-shifted pseudo-elements)
- "THE ZAO × COC" hero anchor text — establishes the cross-community collaboration identity
- Staggered cinematic page-load entrance: badge → logos scatter in with blur → anchor text → subtitle → paragraph → CTA (all sequenced with animation-delay)
- Sticky nav logo appears on scroll (IntersectionObserver) with golden drop-shadow
- Logo in footer with hover glow
- Favicon and apple-touch-icon using the logo
- Gig poster x cyberpunk aesthetic with halftone backgrounds, clipped corners, grain overlay, scanlines
- Diagonal slash section transitions with yellow/cyan gradient lines between major sections
- Fonts: Bebas Neue (display), IBM Plex Mono (mono), Satoshi (body)
- Color palette: gold (#FFD600), cyan (#00F0FF), deep black (#050505)

### Core Site
- Live countdown timer to next show (auto-advances through upcoming shows)
- Countdown "LIVE NOW" state — when timer hits zero, countdown numbers are replaced with a pulsing "JOIN LIVE NOW" button linking to the venue, and status badge swaps to "LIVE NOW"
- Countdown numbers with pulsing yellow/cyan text-shadow glow and animated gradient sweep bar on the bottom edge
- Spatial.io metaverse venue embed with Twitch stream toggle
- Venue tap-to-expand on mobile — starts at 30vh with a "TAP TO EXPAND VENUE" button, toggles to 80vh with smooth animation
- Event schedule with "Today" / "Live Now" dynamic badges
- ConcertZ #4 promoted with pulsing glow RSVP button in the final CTA section
- Past shows archive (ConcertZ #1, #2, #3) ordered newest first with visual hierarchy — newest card is most prominent with yellow accent border and gradient background, older shows progressively fade
- Past show flyer images on #3 and #2 cards
- Artist lineup with tabbed panels per concert (CONCERTZ #1, CONCERTZ #2, CONCERTZ #3)
- YouTube video embeds with clickable song lists for all past performances
  - ConcertZ #1: AttaBotty (8 videos), Clejan (14 videos)
  - ConcertZ #2: Fellenz, Stilo World WaveWarZ, AttaBotty
- Community links (The ZAO, Community of Communities)
- Share section with "CAST ON FARCASTER" as hero-sized primary button with glow animation, X/Twitter and Copy Link as smaller secondary actions
- "How to Join" steps for new metaverse visitors
- Responsive design for mobile and desktop
- Scroll-reveal animations on all sections

### Farcaster Mini App
- `fc:miniapp` embed meta tag with `launch_frame` action for feed discovery
- `/.well-known/farcaster.json` manifest with signed account association (FID 19640)
- Mini App SDK integration — `sdk.actions.ready()` called unconditionally to dismiss splash screen, with `sdk.context` for Farcaster detection and try/catch error handling
- Stream fallback — "Watch Live on Twitch" button inside Farcaster (nested iframes blocked by Twitch)
- Native `composeCast` share to `/cocconcertz` channel
- Splash screen with spec-compliant 200x200px logo and yellow (#FFD600) background
- Spec-compliant 1024x1024 PNG icon (no alpha) for app store discovery
- 3:2 aspect ratio embed preview image (1280x853) for feed cards
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
- [x] Convert logo to 1024x1024 PNG (no alpha) for Farcaster spec compliance
- [ ] Add Farcaster mini app screenshots (1284x2778px, up to 3) for app store listing
- [x] Create 3:2 aspect ratio embed image for optimal feed card previews
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
- [x] Micro-interactions on CTA buttons (pulsing glow on RSVP)
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
