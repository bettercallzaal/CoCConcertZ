# COC Concertz — Metaverse Concert Landing Page

A landing page for COC Concertz, a live metaverse concert experience hosted in StiloWorld on Spatial.io.

## What We Built

### Hero Section
- Full-screen hero with oversized gradient typography ("COC Concertz")
- "Live in the Metaverse" badge for instant context
- Animated CTA button with glow effect linking to the venue
- Scroll indicator to guide users down the page

### Countdown Timer
- Live countdown to the next show (+COC ConcertZ #3 — March 7, 2026 @ 4PM EST)
- Updates every second with days, hours, minutes, seconds
- Gradient-styled numbers matching the brand palette

### Spatial.io Embed
- Full-viewport embedded Spatial metaverse venue (Dope Stilo Music Club)
- Supports camera, microphone, and fullscreen
- Lazy-loaded for performance

### Event Schedule
- Upcoming shows list with event name, description, and date
- Hover effects on event cards
- "RSVP on Luma" button linking to the Luma event page

### Additional Sections
- About section describing the COC Concertz mission
- Social links (Instagram, TikTok, YouTube, X/Twitter) — placeholder hrefs, ready to fill in
- Final CTA section with "Enter the Venue" button
- Responsive design for mobile and desktop

## Tech Stack

- **HTML/CSS/JS** — single-page static site, no build step
- **Google Fonts** — Inter (400, 600, 800, 900)
- **Spatial.io** — metaverse venue embed
- **Luma** — event RSVP
- **Vercel** — deployment (see below)

## Deploy to Vercel

This is a static site — no framework or build step required.

1. Connect this GitHub repo to [Vercel](https://vercel.com)
2. Vercel will auto-detect it as a static site
3. No build command or output directory needed — it serves `index.html` from root
4. Deploys automatically on every push to `main`

## Live Site

**https://cocconcertz.com** — custom domain via Porkbun + Vercel

## Future Ideas

### Quick Wins
- [ ] Add real social media URLs (Instagram, TikTok, YouTube, X)
- [ ] Custom favicon and site icon
- [ ] Open Graph meta tags (thumbnail, title, description for link sharing)
- [ ] Add Apple touch icon for mobile bookmarks
- [ ] Google Analytics or Plausible analytics integration

### Content & Events
- [ ] Dynamic event schedule pulled from an API or CMS (Notion, Airtable, etc.)
- [ ] Past shows archive with recordings and highlights
- [ ] Artist lineup pages with bios, photos, and social links
- [ ] Blog/news section for announcements and recaps
- [ ] Newsletter signup (Mailchimp, ConvertKit, Buttondown) for show alerts
- [ ] Photo/video gallery from past events
- [ ] Testimonials or quotes from attendees
- [ ] FAQ section for first-time metaverse visitors
- [ ] "How to Join" tutorial walkthrough for Spatial newcomers
- [ ] Press kit page with logos, bios, and media assets

### Design & UX
- [ ] Custom COC Concertz logo/wordmark
- [ ] Background video or looping visuals in the hero section
- [ ] Particle effects or Three.js animated background
- [ ] Spline 3D interactive element (e.g. rotating stage or globe)
- [ ] Dark/light mode toggle
- [ ] Smooth page transition animations (fade, slide)
- [ ] Loading screen / skeleton UI while Spatial embed initializes
- [ ] Parallax scrolling effects between sections
- [ ] Animated gradient border on event cards
- [ ] Custom cursor effect
- [ ] Sound toggle — ambient music on the landing page
- [ ] Confetti or visual effect when countdown hits zero

### Web3 & Blockchain
- [ ] Wallet connect button (MetaMask, WalletConnect, Coinbase Wallet)
- [ ] On-chain ticket minting (NFT tickets as event passes)
- [ ] POAP integration (Proof of Attendance Protocol) for attendees
- [ ] Token-gated access to exclusive content or backstage areas
- [ ] NFT gallery showcasing event collectibles and artist drops
- [ ] DAO governance page — community voting on future events
- [ ] On-chain event history (transparent attendance records)
- [ ] Tipping / donations via crypto during live shows
- [ ] Merch purchases with crypto payments

### Functionality
- [ ] Luma checkout button embed (official script from Luma dashboard)
- [ ] Discord widget or live chat integration
- [ ] Real-time "viewers in venue" counter via Spatial API
- [ ] Multi-language support (EN, ES, PT, etc.)
- [ ] Search functionality across events and artists
- [ ] User accounts / profiles for returning fans
- [ ] Event reminders via email or push notification
- [ ] Calendar export (.ics) for upcoming shows
- [ ] Live poll or voting during concerts
- [ ] QR code generator for easy mobile access to venue
- [ ] Referral system — share and earn rewards
- [ ] Accessibility features (screen reader support, reduced motion, high contrast)

### SEO & Performance
- [ ] Structured data (JSON-LD) for events — show up in Google event search
- [ ] Sitemap.xml and robots.txt
- [ ] Image optimization (WebP, lazy loading)
- [ ] CDN caching headers via Vercel edge config
- [ ] Lighthouse score optimization (target 95+)
- [ ] Preload critical fonts and assets
- [ ] Server-side rendering or static generation if migrating to Next.js

### Platform Expansion
- [ ] Multiple venue pages for different Spatial spaces
- [ ] Merch store integration (Shopify, Printful, BigCartel)
- [ ] Mobile app or PWA with push notifications
- [ ] Integration with streaming platforms (Twitch, YouTube Live, Kick)
- [ ] Spotify/Apple Music embeds for featured artists
- [ ] Discord bot that announces shows and links to the venue
- [ ] Telegram or WhatsApp group integration
- [ ] Podcast page for recorded DJ sets or interviews
- [ ] Partner/sponsor showcase section
- [ ] Affiliate program for promoters

### Infrastructure & DevOps
- [ ] Migrate to Next.js for dynamic pages and SSR
- [ ] CMS integration (Sanity, Contentful, or Notion as CMS)
- [ ] CI/CD pipeline with GitHub Actions (lint, preview deploys)
- [ ] Staging environment for testing before production
- [ ] Error monitoring (Sentry)
- [ ] Uptime monitoring (BetterStack, UptimeRobot)
- [ ] A/B testing on hero CTA and landing page variants
- [ ] Edge functions for geo-targeted content (show local times)

## Local Development

```bash
python3 -m http.server 8001
# Open http://localhost:8001
```

## License

&copy; 2026 COC Concertz. All rights reserved.
