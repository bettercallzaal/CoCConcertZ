import type { Metadata } from "next";
import { getArtistsServer } from "@/lib/db-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artists — COC Concertz",
  description:
    "Meet the artists who perform at COC Concertz — live in Stilo World metaverse.",
  openGraph: {
    title: "Artists — COC Concertz",
    description:
      "Meet the artists who perform at COC Concertz — live in Stilo World metaverse.",
    url: "https://cocconcertz.com/artists",
    siteName: "COC Concertz",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Artists — COC Concertz",
    description:
      "Meet the artists who perform at COC Concertz — live in Stilo World metaverse.",
  },
};

export default async function ArtistsPage() {
  const artists = await getArtistsServer();
  const sorted = [...artists].sort((a, b) =>
    a.stageName.localeCompare(b.stageName),
  );

  return (
    <>
      {/* Back nav */}
      <div
        style={{
          padding: "20px 28px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "var(--text-dim)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          COC Concertz
        </a>
      </div>

      <main
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "60px 24px 80px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <div className="section-label" style={{ color: "var(--yellow)", marginBottom: "12px" }}>
            Roster
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 8vw, 5rem)",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "var(--yellow)",
              lineHeight: 1,
              textShadow: "0 0 60px rgba(255,214,0,0.25)",
            }}
          >
            Artists
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              letterSpacing: "2px",
              color: "var(--text-dim)",
              marginTop: "16px",
              textTransform: "uppercase",
            }}
          >
            {sorted.length > 0
              ? `${sorted.length} artist${sorted.length !== 1 ? "s" : ""} in the COC Concertz roster`
              : "Lineup coming soon"}
          </p>
        </div>

        {/* Artist grid */}
        {sorted.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {sorted.map((artist) => {
              const accent =
                artist.cardCustomization?.primaryColor ?? "var(--yellow)";
              return (
                <a
                  key={artist.id}
                  href={`/artists/${artist.slug}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "32px 20px 24px",
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    clipPath:
                      "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                    textDecoration: "none",
                    transition: "border-color 0.2s, background 0.2s",
                    textAlign: "center",
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: "88px",
                      height: "88px",
                      borderRadius: "50%",
                      border: `2px solid ${accent}`,
                      overflow: "hidden",
                      marginBottom: "16px",
                      background: "var(--border)",
                      boxShadow: `0 0 24px ${accent}22`,
                      flexShrink: 0,
                    }}
                  >
                    {artist.profilePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={artist.profilePhoto}
                        alt={artist.stageName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-display)",
                          fontSize: "36px",
                          fontWeight: 900,
                          color: accent,
                        }}
                      >
                        {artist.stageName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Stage name */}
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "#fff",
                      marginBottom: "8px",
                      lineHeight: 1.2,
                    }}
                  >
                    {artist.stageName}
                  </div>

                  {/* Bio snippet */}
                  {artist.bio && (
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.7rem",
                        color: "var(--text-dim)",
                        lineHeight: 1.5,
                        letterSpacing: "0.5px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {artist.bio}
                    </div>
                  )}

                  {/* View profile hint */}
                  <div
                    style={{
                      marginTop: "16px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: accent,
                      opacity: 0.7,
                    }}
                  >
                    View Profile →
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "var(--text-dim)",
              letterSpacing: "2px",
            }}
          >
            Artist lineup coming soon.
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "40px",
            marginTop: "60px",
            textAlign: "center",
          }}
        >
          <a href="/" style={{ display: "inline-block", marginBottom: "16px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/coc-concertz-logo.jpeg"
              alt="COC Concertz"
              style={{
                height: "48px",
                width: "auto",
                opacity: 0.6,
                filter: "drop-shadow(0 0 8px rgba(255,214,0,0.2))",
              }}
            />
          </a>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "var(--text-dim)",
            }}
          >
            Live in the Metaverse
          </div>
        </div>
      </main>
    </>
  );
}
