import type { Metadata } from "next";
import Link from "next/link";
import CopyableSwatch from "@/components/brand/CopyableSwatch";
import { config } from "../../../concertz.config";

export const metadata: Metadata = {
  title: "Brand Kit - COC Concertz",
  description:
    "Logos, colors, typography, voice, and press assets for COC Concertz. Use these to credit, share, or build on the brand.",
  openGraph: {
    title: "Brand Kit - COC Concertz",
    description:
      "Logos, colors, typography, voice, and press assets for COC Concertz.",
    url: "https://cocconcertz.com/brand",
    siteName: "COC Concertz",
    images: [{ url: "/images/coc-banner-dark.jpeg" }],
    type: "website",
  },
};

const COLORS = [
  { name: "Yellow", hex: "#FFD600", rgb: "rgb(255, 214, 0)", role: "Primary - actions, highlights, headlines" },
  { name: "Cyan", hex: "#00F0FF", rgb: "rgb(0, 240, 255)", role: "Accent - secondary CTAs, hover states" },
  { name: "Black", hex: "#050505", rgb: "rgb(5, 5, 5)", role: "Background - page base" },
  { name: "Card", hex: "#0A0A0A", rgb: "rgb(10, 10, 10)", role: "Surface - cards, sections" },
  { name: "Border", hex: "#1A1A1A", rgb: "rgb(26, 26, 26)", role: "Outlines - dividers, borders" },
  { name: "Text", hex: "#C8C8C8", rgb: "rgb(200, 200, 200)", role: "Body copy default color" },
];

const LOGOS = [
  { file: "coc-concertz-logo.jpeg", name: "Primary Logo", desc: "Full wordmark. Use on dark backgrounds. Default choice for headers + share cards.", w: 800 },
  { file: "coc-logo-circle.jpeg", name: "Circle Badge", desc: "Square avatar mark. Use for social profiles, Farcaster, X.", w: 400 },
  { file: "coc-icon-1024.png", name: "App Icon", desc: "1024x1024 PNG. Use for Farcaster Mini App icon + favicon source.", w: 400 },
  { file: "coc-banner-dark.jpeg", name: "Banner (Dark)", desc: "1098px hero banner. Default for OG images and dark backgrounds.", w: 800 },
  { file: "coc-banner-light.jpeg", name: "Banner (Light)", desc: "Light variant for embeds and partners with light themes.", w: 800 },
  { file: "coc-splash-200.jpeg", name: "Splash Tile", desc: "200px Farcaster Mini App splash image.", w: 240 },
];

const FLYERS = [
  { file: "coc1-flyer.png", num: 1, date: "Mar 29, 2025", title: "AttaBotty + Clejan" },
  { file: "concertz2-flyer.jpg", num: 2, date: "Oct 11, 2025", title: "Tom Fellenz / Stilo / AttaBotty" },
  { file: "concertz3-flyer.jpeg", num: 3, date: "Mar 7, 2026", title: "Dúo Dø / Joseph Goats / Stilo" },
  { file: "coc4.jpg", num: 4, date: "Apr 11, 2026", title: "The Rebrand Show" },
  { file: "coc5-flyer.png", num: 5, date: "May 9, 2026", title: "A Day in the Life of GodCloud" },
  { file: "coc6-flyer.png", num: 6, date: "Jun 13, 2026", title: "The African Experience" },
];

const VOICE_DOS = [
  "Energetic, hype, community-first",
  "Reference the metaverse venue + virtual crowd",
  "Use \"COC Concertz\" with proper capitalization - C-O-C, then Concertz with a z",
  "Mention free RSVP, no wallet, anyone can show up",
  "Credit hosts (BetterCallZaal, ThyRevolution) when relevant",
];

const VOICE_DONTS = [
  "Don't write \"Coc Concerts\" or \"COC Concerts\" - it's always Concertz with a z",
  "Don't oversell - skip cheesy hype like \"epic\" or \"unforgettable journey\"",
  "Don't use emojis in formal copy (newsletters, press, partner content)",
  "Don't strip the Community of Communities + The ZAO credit when describing the org",
  "Don't recolor the logo - keep yellow #FFD600 on dark backgrounds",
];

const PARTNERS = [
  {
    name: "The ZAO",
    logo: "/images/zao-logo.png",
    url: "https://thezao.com",
    credit: "COC Concertz is curated by BetterCallZaal as part of The ZAO.",
  },
  {
    name: "Community of Communities",
    logo: "/images/coc-logo-circle.jpeg",
    url: "https://communityofcommunities.xyz/",
    credit: "Co-presented by the Community of Communities.",
  },
];

const sectionStyle: React.CSSProperties = {
  maxWidth: 1080,
  margin: "0 auto",
  padding: "60px 28px",
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.65rem",
  letterSpacing: "5px",
  textTransform: "uppercase",
  color: "var(--yellow)",
  opacity: 0.8,
  marginBottom: 12,
};

const h2Style: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
  letterSpacing: "3px",
  textTransform: "uppercase",
  color: "#fff",
  marginBottom: 28,
  marginTop: 4,
};

const bodyStyle: React.CSSProperties = {
  color: "var(--text)",
  lineHeight: 1.75,
  fontSize: "1rem",
  marginBottom: 18,
};

const cardStyle: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  padding: 20,
  clipPath:
    "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
};

export default function BrandPage() {
  return (
    <main style={{ background: "var(--black)", color: "var(--text)", minHeight: "100vh" }}>
      {/* Hero */}
      <section
        style={{
          position: "relative",
          padding: "100px 28px 60px",
          textAlign: "center",
          borderBottom: "1px solid rgba(255,214,0,0.15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 700px 400px at 50% 0%, rgba(255,214,0,0.10), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "var(--text-dim)",
              textDecoration: "none",
            }}
          >
            COC Concertz / Brand
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 10vw, 6rem)",
              letterSpacing: "5px",
              textTransform: "uppercase",
              color: "#fff",
              lineHeight: 1,
              margin: "28px 0 16px",
              textShadow: "0 0 60px rgba(255,214,0,0.25)",
            }}
          >
            Brand Kit
          </h1>
          <p
            style={{
              color: "var(--text-dim)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              letterSpacing: "1px",
              marginBottom: 32,
            }}
          >
            Logos. Colors. Typography. Voice. Press assets. Use it freely - credit the project.
          </p>
          <a
            href="#download"
            style={{
              display: "inline-block",
              background: "var(--yellow)",
              color: "#000",
              padding: "14px 36px",
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              textDecoration: "none",
              fontWeight: 900,
              clipPath:
                "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            }}
          >
            Download Press Kit
          </a>
        </div>
      </section>

      {/* Brand story */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>// The Brand</div>
        <h2 style={h2Style}>{config.site.name}</h2>
        <p style={{ ...bodyStyle, fontSize: "1.15rem" }}>
          <strong style={{ color: "var(--yellow)" }}>{config.site.tagline}</strong>
        </p>
        <p style={bodyStyle}>{config.site.description}</p>
        <p style={bodyStyle}>
          COC Concertz runs in Stilo World on Spatial.io, hosted by BetterCallZaal and ThyRevolution.
          Curated by The ZAO and the Community of Communities. Every show is free, no wallet
          required, and surfaces independent Web3 musicians to a metaverse-native audience.
        </p>
      </section>

      <div style={{ height: 1, background: "rgba(255,214,0,0.1)", maxWidth: 1080, margin: "0 auto" }} />

      {/* Logos */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>// Logo System</div>
        <h2 style={h2Style}>Logos</h2>
        <p style={{ ...bodyStyle, marginBottom: 36 }}>
          Six logo variants. Right-click any preview to save, or click the download link. Always
          place on a dark background. Maintain at least one logo-height of clear space.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {LOGOS.map((l) => (
            <div key={l.file} style={cardStyle}>
              <div
                style={{
                  background: "#0f0f0f",
                  padding: 18,
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 160,
                  border: "1px solid var(--border)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/${l.file}`}
                  alt={l.name}
                  style={{ maxWidth: "100%", maxHeight: 140, objectFit: "contain" }}
                />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--yellow)",
                  marginBottom: 6,
                }}
              >
                {l.name}
              </div>
              <p
                style={{
                  color: "var(--text-dim)",
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  marginBottom: 12,
                }}
              >
                {l.desc}
              </p>
              <a
                href={`/images/${l.file}`}
                download
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--cyan)",
                  textDecoration: "none",
                }}
              >
                Download &rarr; /{l.file}
              </a>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,214,0,0.1)", maxWidth: 1080, margin: "0 auto" }} />

      {/* Colors */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>// Color System</div>
        <h2 style={h2Style}>Colors</h2>
        <p style={{ ...bodyStyle, marginBottom: 36 }}>
          Six core values. Click any value to copy. Use yellow sparingly - it's a loud color and
          works best as accents, not large fills. Backgrounds are always near-black.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {COLORS.map((c) => (
            <CopyableSwatch key={c.hex} {...c} />
          ))}
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,214,0,0.1)", maxWidth: 1080, margin: "0 auto" }} />

      {/* Typography */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>// Typography</div>
        <h2 style={h2Style}>Typography</h2>
        <p style={{ ...bodyStyle, marginBottom: 36 }}>
          Three typefaces. Bebas Neue for big display moments, IBM Plex Mono for labels and UI,
          Satoshi for body copy. All open-source or via Fontshare.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          <div style={cardStyle}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "3rem",
                letterSpacing: "3px",
                color: "var(--yellow)",
                lineHeight: 1,
                marginBottom: 16,
              }}
            >
              BEBAS NEUE
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 12 }}>
              Display - headlines, hero text
            </div>
            <p style={{ color: "var(--text)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              All-caps, condensed. Use for show names, section headers, hero. Never run body copy in this face.
            </p>
            <a href="https://fonts.google.com/specimen/Bebas+Neue" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--cyan)", textDecoration: "none", display: "inline-block", marginTop: 12 }}>
              Google Fonts &rarr;
            </a>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1.4rem",
                color: "var(--cyan)",
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              IBM Plex Mono
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 12 }}>
              Mono - labels, UI, code
            </div>
            <p style={{ color: "var(--text)", fontSize: "0.9rem", lineHeight: 1.6, fontFamily: "var(--font-mono)" }}>
              Use for section eyebrows, status badges, timestamps, code, terminal-style UI moments.
            </p>
            <a href="https://fonts.google.com/specimen/IBM+Plex+Mono" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--cyan)", textDecoration: "none", display: "inline-block", marginTop: 12 }}>
              Google Fonts &rarr;
            </a>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                fontFamily: "Satoshi, system-ui, sans-serif",
                fontSize: "1.6rem",
                color: "#fff",
                lineHeight: 1.2,
                marginBottom: 16,
                fontWeight: 700,
              }}
            >
              Satoshi
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 12 }}>
              Body - paragraphs, longform
            </div>
            <p style={{ color: "var(--text)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Geometric sans with humanist character. Use 400 for body, 500 for emphasis, 700 for sub-headlines.
            </p>
            <a href="https://www.fontshare.com/fonts/satoshi" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--cyan)", textDecoration: "none", display: "inline-block", marginTop: 12 }}>
              Fontshare &rarr;
            </a>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,214,0,0.1)", maxWidth: 1080, margin: "0 auto" }} />

      {/* Voice */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>// Voice + Tone</div>
        <h2 style={h2Style}>Voice</h2>
        <p style={bodyStyle}>{config.newsletter.brands.coc.voice}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 32 }}>
          <div style={{ ...cardStyle, borderLeft: "4px solid var(--yellow)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--yellow)", marginBottom: 16 }}>
              Do
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {VOICE_DOS.map((d, i) => (
                <li key={i} style={{ color: "var(--text)", fontSize: "0.95rem", lineHeight: 1.6, paddingLeft: 18, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, top: 9, width: 8, height: 8, background: "var(--yellow)" }} />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ ...cardStyle, borderLeft: "4px solid #ff5555" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "#ff5555", marginBottom: 16 }}>
              Don&apos;t
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {VOICE_DONTS.map((d, i) => (
                <li key={i} style={{ color: "var(--text)", fontSize: "0.95rem", lineHeight: 1.6, paddingLeft: 18, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, top: 9, width: 8, height: 8, background: "#ff5555" }} />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,214,0,0.1)", maxWidth: 1080, margin: "0 auto" }} />

      {/* Flyer gallery */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>// Show Design History</div>
        <h2 style={h2Style}>Flyer Gallery</h2>
        <p style={{ ...bodyStyle, marginBottom: 36 }}>
          Every COC Concertz flyer to date. Each one captures the moment - artist style, show theme,
          design lineage. Free for press and partner use with credit.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 18,
          }}
        >
          {FLYERS.map((f) => (
            <Link
              key={f.num}
              href={`/events/${f.num}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  ...cardStyle,
                  padding: 12,
                  transition: "border-color 0.2s",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/${f.file}`}
                  alt={`COC ConcertZ #${f.num} flyer`}
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                    marginBottom: 12,
                    background: "#000",
                  }}
                />
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 4 }}>
                  #{f.num} - {f.date}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", letterSpacing: "1px", textTransform: "uppercase", color: "var(--yellow)", lineHeight: 1.3 }}>
                  {f.title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,214,0,0.1)", maxWidth: 1080, margin: "0 auto" }} />

      {/* Partners */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>// Partners + Credit</div>
        <h2 style={h2Style}>Partners</h2>
        <p style={{ ...bodyStyle, marginBottom: 36 }}>
          COC Concertz is co-presented by The ZAO and the Community of Communities. Always credit
          both when describing the project or using its assets in press.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {PARTNERS.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", display: "block" }}
            >
              <div style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.logo}
                    alt={p.name}
                    style={{ width: 56, height: 56, objectFit: "contain", background: "#000", borderRadius: 8 }}
                  />
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--yellow)" }}>
                    {p.name}
                  </div>
                </div>
                <p style={{ color: "var(--text)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 12 }}>
                  &quot;{p.credit}&quot;
                </p>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--cyan)" }}>
                  Visit &rarr;
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,214,0,0.1)", maxWidth: 1080, margin: "0 auto" }} />

      {/* Press kit + contact */}
      <section id="download" style={sectionStyle}>
        <div style={eyebrowStyle}>// Press Kit</div>
        <h2 style={h2Style}>Download Everything</h2>
        <p style={{ ...bodyStyle, marginBottom: 36 }}>
          Bundle includes all six logo variants, six flyer assets, a colors reference file, and a
          one-page brand overview. Single zip, no signup, free use with credit.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 40 }}>
          <a
            href="/downloads/coc-concertz-press-kit.zip"
            download
            style={{
              display: "inline-block",
              background: "var(--yellow)",
              color: "#000",
              padding: "16px 40px",
              fontFamily: "var(--font-display)",
              fontSize: "1.05rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              textDecoration: "none",
              fontWeight: 900,
              clipPath:
                "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
          >
            Download Press Kit (.zip)
          </a>
          <a
            href="https://github.com/bettercallzaal/CoCConcertZ"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: "transparent",
              color: "var(--cyan)",
              padding: "16px 40px",
              fontFamily: "var(--font-display)",
              fontSize: "1.05rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              textDecoration: "none",
              fontWeight: 900,
              border: "1px solid var(--cyan)",
              clipPath:
                "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
          >
            View Source on GitHub
          </a>
        </div>

        <div
          style={{
            ...cardStyle,
            background: "rgba(255,214,0,0.04)",
            borderColor: "rgba(255,214,0,0.25)",
          }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--yellow)", marginBottom: 12 }}>
            Contact
          </div>
          <p style={{ color: "var(--text)", lineHeight: 1.7, fontSize: "0.95rem", margin: 0 }}>
            Press, partnership, or asset questions: DM{" "}
            <a href="https://x.com/bettercallzaal" target="_blank" rel="noopener noreferrer" style={{ color: "var(--cyan)" }}>
              @bettercallzaal
            </a>
            {" "}on X or join the{" "}
            <a href="https://t.me/cocommunities" target="_blank" rel="noopener noreferrer" style={{ color: "var(--cyan)" }}>
              COC Telegram
            </a>
            . For artists who want to perform: open the{" "}
            <Link href="/portal" style={{ color: "var(--cyan)" }}>artist portal</Link>
            {" "}or message via the channels above.
          </p>
        </div>
      </section>

      <footer style={{ padding: "40px 28px", textAlign: "center", borderTop: "1px solid var(--border)" }}>
        <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--text-dim)", textDecoration: "none" }}>
          &larr; Back to cocconcertz.com
        </Link>
      </footer>
    </main>
  );
}
