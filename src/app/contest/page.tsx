import type { Metadata } from "next";
import Link from "next/link";
import ThumbnailContest from "@/components/contest/ThumbnailContest";

export const metadata: Metadata = {
  title: "Flyer Contest - COC Concertz #7: WaveWarZ Takeover",
  description:
    "Community flyer contest for COC Concertz #7: WaveWarZ Takeover (July 18). Submissions closed July 10. Winner announced at the show — winner gets full credit everywhere the flyer runs.",
  openGraph: {
    title: "Flyer Contest - COC Concertz #7: WaveWarZ Takeover",
    description:
      "Community flyer contest for COC Concertz #7. Submissions closed. Winner announced at the show July 18.",
    url: "https://cocconcertz.com/contest",
    siteName: "COC Concertz",
    images: [{ url: "/api/og/contest", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flyer Contest - COC Concertz #7: WaveWarZ Takeover",
    description:
      "Community flyer contest for COC Concertz #7. Submissions closed. Winner announced at the show July 18.",
    images: ["/api/og/contest"],
  },
};

const RULES = [
  {
    title: "What to include",
    body: "Show name (COC Concertz #7: WaveWarZ Takeover), Sat July 18 4PM EST, DJ Zaal + WaveWarZ artists, and cocconcertz.com.",
  },
  {
    title: "Brand colors (optional)",
    body: "Gold #FFD600, Cyan #00F0FF, Deep Black #050505. Cyberpunk energy welcome, but make it yours. Full assets on the Brand Kit page.",
  },
  {
    title: "Any tool counts",
    body: "AI, Photoshop, MS Paint, crayons on paper. We judge the design, not the software.",
  },
  {
    title: "The prize",
    body: "Winner becomes the official flyer on the site, the Luma page, and every social post, with full credit and a shoutout at the show.",
  },
];

export default function ContestPage() {
  return (
    <main style={{ background: "var(--black)", color: "var(--text)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "120px 24px 100px" }}>
        {/* Hero */}
        <span className="section-label">Community Contest</span>
        <h1 style={{ marginBottom: "12px" }}>
          DESIGN THE COC #7 FLYER
        </h1>
        <p style={{ maxWidth: 640, marginBottom: "40px" }}>
          The WaveWarZ Takeover needs art, and the community makes it. Submit your
          flyer design for COC Concertz #7 (Sat July 18, 4PM EST, live in Stilo World
          with DJ Zaal + WaveWarZ artists). The winning design becomes the official
          flyer everywhere the show runs.
        </p>

        {/* Rules */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "12px",
            marginBottom: "48px",
          }}
        >
          {RULES.map((rule) => (
            <div
              key={rule.title}
              className="clip-corner"
              style={{
                border: "1px solid var(--border)",
                background: "var(--card)",
                padding: "20px 18px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "var(--cyan)",
                  marginBottom: "10px",
                }}
              >
                {rule.title}
              </div>
              <div style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--text)" }}>
                {rule.body}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "48px" }}>
          <Link
            href="/brand"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--yellow)",
            }}
          >
            Grab logos + colors from the Brand Kit
          </Link>
        </div>

        <ThumbnailContest />
      </div>
    </main>
  );
}
