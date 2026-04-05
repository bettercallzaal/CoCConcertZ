import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getEventByNumber, getArtists } from "@/lib/db";
import type { Artist } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ number: string }>;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  const event = await getEventByNumber(parseInt(number, 10));
  if (!event) return { title: "Event Not Found" };

  const description = event.description || `${event.name} — COC Concertz`;
  const imageUrl = event.flyerUrl ?? event.bannerUrl;

  return {
    title: `${event.name} — COC Concertz`,
    description,
    openGraph: {
      title: `${event.name} — COC Concertz`,
      description,
      url: `https://cocconcertz.com/events/${event.number}`,
      siteName: "COC Concertz",
      ...(imageUrl && {
        images: [{ url: imageUrl }],
      }),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.name} — COC Concertz`,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

// ─── External link icon ───────────────────────────────────────────────────────

function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_CONFIG = {
  upcoming: {
    label: "UPCOMING",
    bg: "rgba(0,255,255,0.08)",
    color: "var(--cyan)",
    border: "rgba(0,255,255,0.3)",
  },
  live: {
    label: "LIVE NOW",
    bg: "rgba(255,50,50,0.15)",
    color: "#ff5555",
    border: "rgba(255,50,50,0.4)",
  },
  completed: {
    label: "COMPLETED",
    bg: "rgba(255,214,0,0.08)",
    color: "var(--yellow)",
    border: "rgba(255,214,0,0.3)",
  },
} as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EventPage({ params }: Props) {
  const { number } = await params;
  const event = await getEventByNumber(parseInt(number, 10));

  if (!event) notFound();

  const allArtists = await getArtists();

  // Map artistId -> Artist for fast lookup
  const artistMap = new Map<string, Artist>(
    allArtists.map((a) => [a.id, a])
  );

  // Resolve lineup in event order
  const lineup = [...event.artists]
    .sort((a, b) => a.order - b.order)
    .map((ea) => ({ eventArtist: ea, artist: artistMap.get(ea.artistId) ?? null }))
    .filter((x): x is { eventArtist: typeof x.eventArtist; artist: Artist } => x.artist !== null);

  const statusConfig = STATUS_CONFIG[event.status];
  const heroImage = event.flyerUrl ?? event.bannerUrl;
  const isLive = event.status === "live";
  const isUpcoming = event.status === "upcoming";

  return (
    <>
      {/* ── Hero bar ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          background: "#0a0a0a",
          overflow: "hidden",
          paddingBottom: "60px",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "700px",
            height: "450px",
            background: isLive
              ? "radial-gradient(ellipse, rgba(255,50,50,0.12) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(255,214,0,0.10) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Nav breadcrumb */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "20px 28px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderBottom: "1px solid rgba(255,214,0,0.12)",
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
              display: "flex",
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
          <span
            style={{
              color: "var(--border)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
            }}
          >
            /
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--yellow)",
            }}
          >
            Event #{event.number}
          </span>
        </div>

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "860px",
            margin: "0 auto",
            padding: "56px 24px 0",
            textAlign: "center",
          }}
        >
          {/* Status badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 14px",
              background: statusConfig.bg,
              color: statusConfig.color,
              border: `1px solid ${statusConfig.border}`,
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: "28px",
            }}
          >
            {isLive && (
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#ff5555",
                  display: "inline-block",
                  boxShadow: "0 0 6px #ff5555",
                  animation: "pulse 1.4s ease-in-out infinite",
                }}
              />
            )}
            {statusConfig.label}
          </div>

          {/* Event number label */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "6px",
              textTransform: "uppercase",
              color: "var(--yellow)",
              marginBottom: "14px",
              opacity: 0.7,
            }}
          >
            // Show #{event.number}
          </div>

          {/* Event name */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 9vw, 6.5rem)",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#fff",
              lineHeight: 1,
              marginBottom: "20px",
              textShadow: isLive
                ? "0 0 60px rgba(255,50,50,0.3)"
                : "0 0 60px rgba(255,214,0,0.2)",
            }}
          >
            {event.name}
          </h1>

          {/* Date and time */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "var(--text-dim)",
              letterSpacing: "1px",
              marginBottom: "40px",
            }}
          >
            {formatDate(event.date)}&nbsp;&mdash;&nbsp;{formatTime(event.date)}
          </div>

          {/* Gradient divider */}
          <div
            style={{
              width: "100%",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(255,214,0,0.3) 30%, rgba(255,214,0,0.6) 50%, rgba(255,214,0,0.3) 70%, transparent)",
            }}
          />
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "60px 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── CTA buttons ─────────────────────────────────────────────────── */}
        {(isLive || isUpcoming) && (
          <section style={{ marginBottom: "56px", textAlign: "center" }}>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              {isLive && (
                <a
                  href={event.venue.streamLink ?? event.venue.spatialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "18px 48px",
                    background: "#ff5555",
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                    fontSize: "1.2rem",
                    letterSpacing: "4px",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    clipPath:
                      "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                    fontWeight: 900,
                    boxShadow: "0 0 40px rgba(255,50,50,0.4)",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#fff",
                      display: "inline-block",
                      boxShadow: "0 0 8px rgba(255,255,255,0.8)",
                    }}
                  />
                  LIVE NOW — JOIN
                </a>
              )}

              {isUpcoming && event.rsvpLink && (
                <a
                  href={event.rsvpLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "18px 48px",
                    background: "var(--yellow)",
                    color: "#000",
                    fontFamily: "var(--font-display)",
                    fontSize: "1.2rem",
                    letterSpacing: "4px",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    clipPath:
                      "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                    fontWeight: 900,
                  }}
                >
                  RSVP NOW
                </a>
              )}
            </div>
          </section>
        )}

        {/* ── Flyer / Banner ──────────────────────────────────────────────── */}
        {heroImage && (
          <section style={{ marginBottom: "56px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt={`${event.name} flyer`}
              style={{
                width: "100%",
                maxHeight: "560px",
                objectFit: "cover",
                display: "block",
                clipPath:
                  "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
                border: "1px solid rgba(255,214,0,0.2)",
              }}
            />
          </section>
        )}

        {/* ── Description ─────────────────────────────────────────────────── */}
        {event.description && (
          <section style={{ marginBottom: "56px" }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "var(--yellow)",
                marginBottom: "16px",
                opacity: 0.8,
              }}
            >
              // About This Show
            </div>
            <p
              style={{
                color: "var(--text)",
                lineHeight: 1.85,
                fontSize: "1.05rem",
                fontFamily: "inherit",
              }}
            >
              {event.description}
            </p>
          </section>
        )}

        {/* ── Announcement ────────────────────────────────────────────────── */}
        {event.announcement && (
          <section style={{ marginBottom: "56px" }}>
            <div
              style={{
                background: "rgba(255,214,0,0.06)",
                border: "1px solid rgba(255,214,0,0.3)",
                borderLeft: "4px solid var(--yellow)",
                padding: "20px 24px",
                clipPath:
                  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  color: "var(--yellow)",
                  marginBottom: "10px",
                  fontWeight: 700,
                }}
              >
                Announcement
              </div>
              <p
                style={{
                  color: "var(--text)",
                  lineHeight: 1.7,
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                  margin: 0,
                }}
              >
                {event.announcement}
              </p>
            </div>
          </section>
        )}

        {/* ── Lineup ──────────────────────────────────────────────────────── */}
        <section style={{ marginBottom: "56px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "var(--yellow)",
              marginBottom: "8px",
              opacity: 0.8,
            }}
          >
            // Lineup
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              letterSpacing: "3px",
              color: "#fff",
              marginBottom: "24px",
              marginTop: "4px",
            }}
          >
            Artists
          </h2>

          {lineup.length === 0 ? (
            <p
              style={{
                color: "var(--text-dim)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                letterSpacing: "1px",
              }}
            >
              Lineup to be announced.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              {lineup.map(({ eventArtist, artist }) => (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "var(--card)",
                      border: "1px solid rgba(255,214,0,0.2)",
                      padding: "20px",
                      clipPath:
                        "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      transition: "border-color 0.2s, background 0.2s",
                      cursor: "pointer",
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        border: "2px solid rgba(255,214,0,0.4)",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "var(--border)",
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
                            fontSize: "22px",
                            fontWeight: 900,
                            color: "var(--yellow)",
                          }}
                        >
                          {artist.stageName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1.1rem",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          color: "var(--yellow)",
                          marginBottom: "4px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {artist.stageName}
                      </div>
                      {eventArtist.setTime && (
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            letterSpacing: "1px",
                            color: "var(--text-dim)",
                          }}
                        >
                          {eventArtist.setTime}
                        </div>
                      )}
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          color: "rgba(255,214,0,0.5)",
                          marginTop: "4px",
                        }}
                      >
                        View Profile →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Venue ───────────────────────────────────────────────────────── */}
        <section style={{ marginBottom: "56px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "var(--yellow)",
              marginBottom: "8px",
              opacity: 0.8,
            }}
          >
            // Venue
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              letterSpacing: "3px",
              color: "#fff",
              marginBottom: "20px",
              marginTop: "4px",
            }}
          >
            Location
          </h2>

          <div
            style={{
              background: "var(--card)",
              border: "1px solid rgba(255,214,0,0.2)",
              padding: "28px",
              clipPath:
                "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
              display: "flex",
              flexDirection: "column" as const,
              gap: "16px",
            }}
          >
            <a
              href={event.venue.spatialLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                color: "var(--yellow)",
                textDecoration: "none",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Open in Spatial.io
              <ExternalLinkIcon />
            </a>

            {event.venue.streamLink && (
              <a
                href={event.venue.streamLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  color: "var(--cyan)",
                  textDecoration: "none",
                  fontWeight: 700,
                  letterSpacing: "1px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                Watch Stream
                <ExternalLinkIcon />
              </a>
            )}
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "40px",
            textAlign: "center",
          }}
        >
          <a href="/" style={{ display: "inline-block", marginBottom: "16px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/coc-concertz-logo.jpeg"
              alt="COC Concertz"
              style={{
                height: "56px",
                width: "auto",
                opacity: 0.7,
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
              marginBottom: "16px",
            }}
          >
            Live in the Metaverse
          </div>
          <a
            href="https://cocconcertz.com"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "2px",
              color: "var(--yellow)",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            cocconcertz.com
          </a>
        </div>
      </main>
    </>
  );
}
