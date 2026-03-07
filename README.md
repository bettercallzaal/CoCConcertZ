# COC Concertz — Metaverse Concert Landing Page

A landing page and Farcaster Mini App for COC Concertz, a live metaverse concert experience hosted in StiloWorld on Spatial.io.

## Live Site

**https://cocconcertz.com**

## What's Built

### Core Site
- Gig poster x cyberpunk aesthetic with glitch text, halftone backgrounds, clipped corners
- Live countdown timer to next show (auto-advances through upcoming shows)
- Spatial.io metaverse venue embed with Twitch stream toggle
- Event schedule with "Today" / "Live Now" dynamic badges
- Past shows archive (ConcertZ #1 and #2)
- Artist lineup with tabbed panels per concert (#1, #2, #3)
- YouTube video embeds with clickable song lists for past performances
- Community links (The ZAO, Community of Communities)
- Social share section (Farcaster, X/Twitter, Copy Link)
- Responsive design for mobile and desktop

### Farcaster Mini App
- `fc:miniapp` embed meta tag for feed discovery
- `/.well-known/farcaster.json` manifest with signed account association
- Mini App SDK integration with `ready()` call
- Stream fallback — "Watch Live on Twitch" button inside Farcaster (nested iframes don't work)
- Native `composeCast` share to `/cocconcertz` channel
- Splash screen with COC logo and yellow background

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
- **Vercel** — deployment with custom headers

## Deploy

Static site on Vercel — auto-deploys on push to `main`. Custom domain via Porkbun.

## Future Ideas

### High Priority
- [ ] Media gallery — let fans upload/share photos and videos from events
- [ ] Confetti or visual effect when countdown hits zero / show goes live
- [ ] Calendar export (.ics download) for upcoming shows
- [ ] QR code for easy mobile access to the venue
- [ ] Convert icon to 1024x1024 PNG (no alpha) for Farcaster spec compliance
- [ ] Add Farcaster mini app screenshots (1284x2778px, up to 3) for app store listing
- [ ] Create 3:2 aspect ratio (1200x800) version of flyer for optimal embed previews
- [ ] Farcaster notifications via webhookUrl for show reminders
- [ ] Google Analytics or Plausible analytics integration

### Content & Events
- [ ] Dynamic event schedule pulled from a CMS (Notion, Airtable, Sanity)
- [ ] Blog/news section for announcements and recaps (or link to Paragraph newsletter)
- [ ] Newsletter signup for show alerts
- [ ] FAQ section for first-time metaverse visitors
- [ ] Press kit page with logos, bios, and media assets
- [ ] Testimonials or quotes from attendees
- [ ] Artist profile pages with full bios, photos, social links, and discography
- [ ] Setlist pages for each past concert with timestamps

### Design & UX
- [ ] Custom COC Concertz logo/wordmark
- [ ] Background video or looping visuals in the hero section
- [ ] Particle effects or Three.js animated background
- [ ] Loading skeleton while Spatial embed initializes
- [ ] Sound toggle — ambient music on the landing page
- [ ] Animated gradient border on event cards
- [ ] Smooth scroll-triggered animations between sections

### Web3 & Blockchain
- [ ] POAP integration (Proof of Attendance Protocol) for attendees
- [ ] On-chain ticket minting (NFT event passes)
- [ ] Token-gated access to exclusive content or backstage areas
- [ ] NFT gallery showcasing event collectibles and artist drops
- [ ] Tipping / donations via crypto during live shows
- [ ] Wallet connect for Base / Farcaster users

### Farcaster Mini App Enhancements
- [ ] Farcaster notifications for show reminders (webhookUrl)
- [ ] In-app voting / polls during live concerts via composeCast
- [ ] Leaderboard for most active community members
- [ ] Share extension — receive casts shared into the app
- [ ] Deep links to specific artist pages or past shows
- [ ] Farcaster social graph — show which friends are attending

### Platform Expansion
- [ ] Spotify/Apple Music embeds for featured artists
- [ ] Discord bot that announces shows and links to the venue
- [ ] Multiple venue pages for different Spatial spaces
- [ ] Merch store integration (Shopify, Printful)
- [ ] Podcast page for recorded DJ sets or interviews
- [ ] Partner/sponsor showcase section
- [ ] PWA with push notifications
- [ ] Multi-language support (EN, ES, PT)

### Infrastructure
- [ ] Migrate to Next.js for dynamic pages and SSR
- [ ] CMS integration for managing events and artists
- [ ] Edge functions for geo-targeted content (show local times)
- [ ] Lighthouse score optimization (target 95+)
- [ ] Error monitoring (Sentry)
- [ ] A/B testing on hero CTA variants

## Local Development

```bash
python3 -m http.server 8001
# Open http://localhost:8001
```

## License

&copy; 2026 COC Concertz. All rights reserved.
