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

## Future Ideas

### Content & Events
- [ ] Dynamic event schedule pulled from an API or CMS
- [ ] Past shows archive with recordings/highlights
- [ ] Artist lineup pages with bios and social links
- [ ] Blog/news section for announcements
- [ ] Newsletter signup for show alerts

### Design & UX
- [ ] Custom logo/branding assets
- [ ] Background video or animated visuals in the hero
- [ ] Particle effects or Three.js background animation
- [ ] Dark/light mode toggle
- [ ] Page transition animations
- [ ] Loading screen while Spatial embed initializes

### Functionality
- [ ] Luma checkout button embed (requires Luma event ID from dashboard)
- [ ] Ticket minting / Web3 wallet connect for on-chain ticketing
- [ ] Live chat or Discord widget integration
- [ ] Real-time "viewers in venue" counter via Spatial API
- [ ] Multi-language support

### SEO & Performance
- [ ] Open Graph meta tags for social sharing previews
- [ ] Favicon and Apple touch icons
- [ ] Structured data (JSON-LD) for events
- [ ] Analytics integration (Google Analytics, Plausible, etc.)
- [ ] Image optimization and CDN caching headers

### Platform Expansion
- [ ] Multiple venue pages for different Spatial spaces
- [ ] Merch store integration
- [ ] NFT gallery showcasing event collectibles
- [ ] Mobile app or PWA for push notifications
- [ ] Integration with streaming platforms (Twitch, YouTube Live)

## Local Development

```bash
python3 -m http.server 8001
# Open http://localhost:8001
```

## License

&copy; 2026 COC Concertz. All rights reserved.
