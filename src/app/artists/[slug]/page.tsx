import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArtistBySlug, getEvents, getSetsForArtist } from "@/lib/db";
import type { Artist, Event, SetItem } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) return { title: "Artist Not Found" };

  const description =
    artist.bio || `${artist.stageName} performs at COC Concertz`;

  return {
    title: `${artist.stageName} — COC Concertz`,
    description,
    openGraph: {
      title: `${artist.stageName} — COC Concertz`,
      description,
      url: `https://cocconcertz.com/artists/${artist.slug}`,
      siteName: "COC Concertz",
      images: [{ url: `/api/og/artist?slug=${slug}`, width: 1200, height: 630 }],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${artist.stageName} — COC Concertz`,
      description,
      images: [`/api/og/artist?slug=${slug}`],
    },
  };
}

// ─── Social icon SVGs ─────────────────────────────────────────────────────────

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  twitter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.638zM17.083 20.19h1.834L7.042 4.126H5.075z" />
    </svg>
  ),
  farcaster: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.978 0C5.361 0 0 5.373 0 12s5.361 12 11.978 12C18.616 24 24 18.627 24 12S18.616 0 11.978 0zm5.323 17.5h-2.1v-6.75c0-.69-.558-1.25-1.246-1.25h-.478c-.688 0-1.246.56-1.246 1.25V17.5H10.13V9.25h2.1v.607c.502-.434 1.156-.607 1.891-.607h.478c1.722 0 2.702 1.008 2.702 2.75V17.5zm-9.347 0H5.853V6.5h2.101v11zm-1.05-12.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
    </svg>
  ),
  audius: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 4.8c1.988 0 3.6 1.612 3.6 3.6 0 1.988-1.612 3.6-3.6 3.6-1.988 0-3.6-1.612-3.6-3.6 0-1.988 1.612-3.6 3.6-3.6zm0 14.4c-3.312 0-6.228-1.692-7.944-4.248.036-2.64 5.292-4.092 7.944-4.092 2.64 0 7.908 1.452 7.944 4.092C18.228 17.508 15.312 19.2 12 19.2z" />
    </svg>
  ),
  spotify: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  website: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  spotify: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  ),
  audius: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 4.8c1.988 0 3.6 1.612 3.6 3.6 0 1.988-1.612 3.6-3.6 3.6-1.988 0-3.6-1.612-3.6-3.6 0-1.988 1.612-3.6 3.6-3.6zm0 14.4c-3.312 0-6.228-1.692-7.944-4.248.036-2.64 5.292-4.092 7.944-4.092 2.64 0 7.908 1.452 7.944 4.092C18.228 17.508 15.312 19.2 12 19.2z" />
    </svg>
  ),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    youtube: "YouTube",
    audius: "Audius",
    spotify: "Spotify",
    soundcloud: "SoundCloud",
    other: "Link",
  };
  return labels[platform] ?? platform;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArtistProfilePage({ params }: Props) {
  const { slug } = await params;

  const [artist, allEvents] = await Promise.all([
    getArtistBySlug(slug),
    getEvents(),
  ]);

  if (!artist) notFound();

  const sets = await getSetsForArtist(artist.id);

  // Events this artist was part of
  const artistEvents = allEvents.filter((e) =>
    e.artists.some((a) => a.artistId === artist.id)
  );

  // Upcoming events (for CTA)
  const upcomingEvents = artistEvents.filter((e) => e.status === "upcoming" || e.status === "live");
  const nextEvent = upcomingEvents[0] ?? null;

  // All upcoming events (any artist) for CTA fallback
  const anyUpcoming = allEvents.find((e) => e.status === "upcoming" || e.status === "live");

  const accent = artist.cardCustomization?.primaryColor ?? "var(--yellow)";
  const heroBg = artist.cardCustomization?.backgroundColor ?? "#0a0a0a";
  const heroImage = artist.cardCustomization?.backgroundImage;
  const socials = artist.socialLinks ?? {};
  const socialEntries = Object.entries(socials).filter(([, url]) => !!url) as [string, string][];

  // Map sets by eventId for quick lookup
  const setsByEvent: Record<string, SetItem[]> = {};
  for (const set of sets) {
    if (!setsByEvent[set.eventId]) setsByEvent[set.eventId] = [];
    setsByEvent[set.eventId].push(set);
  }

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          background: heroBg,
          overflow: "hidden",
          paddingBottom: "60px",
        }}
      >
        {/* Background image overlay */}
        {heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.18,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Radial glow behind avatar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "400px",
            background: `radial-gradient(ellipse, ${accent}22 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Back to home nav */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "20px 28px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderBottom: `1px solid ${accent}20`,
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
              transition: "color 0.15s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
            COC Concertz
          </a>
          <span style={{ color: "var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>/</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: accent }}>
            {artist.stageName}
          </span>
        </div>

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "800px",
            margin: "0 auto",
            padding: "60px 24px 0",
            textAlign: "center",
          }}
        >
          {/* Profile photo */}
          <div
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              border: `3px solid ${accent}`,
              overflow: "hidden",
              margin: "0 auto 28px",
              background: "var(--border)",
              boxShadow: `0 0 40px ${accent}33`,
              flexShrink: 0,
            }}
          >
            {artist.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artist.profilePhoto}
                alt={artist.stageName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                  fontSize: "56px",
                  fontWeight: 900,
                  color: accent,
                }}
              >
                {artist.stageName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Role label */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "6px",
              textTransform: "uppercase",
              color: accent,
              marginBottom: "12px",
              opacity: 0.8,
            }}
          >
            // Artist
          </div>

          {/* Stage name */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 8vw, 6rem)",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: accent,
              lineHeight: 1,
              marginBottom: "24px",
              textShadow: `0 0 60px ${accent}44`,
            }}
          >
            {artist.stageName}
          </h1>

          {/* Social links */}
          {socialEntries.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: "32px",
              }}
            >
              {socialEntries.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 18px",
                    border: `1px solid ${accent}44`,
                    background: `${accent}0d`,
                    color: "var(--text-dim)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ color: accent }}>{SOCIAL_ICONS[platform]}</span>
                  {platform === "website" ? "Website" : platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              ))}
            </div>
          )}

          {/* Divider line */}
          <div
            style={{
              width: "100%",
              height: "1px",
              background: `linear-gradient(90deg, transparent, ${accent}33 30%, ${accent}66 50%, ${accent}33 70%, transparent)`,
              marginBottom: "0",
            }}
          />
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "60px 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >

        {/* ── Bio ─────────────────────────────────────────────────────────── */}
        {artist.bio && (
          <section style={{ marginBottom: "60px" }}>
            <div className="section-label" style={{ color: accent }}>About</div>
            <p
              style={{
                color: "var(--text)",
                lineHeight: 1.85,
                fontSize: "1.05rem",
                fontFamily: "inherit",
                marginTop: "8px",
              }}
            >
              {artist.bio}
            </p>
          </section>
        )}

        {/* ── Upcoming CTA ────────────────────────────────────────────────── */}
        {(nextEvent ?? anyUpcoming) && (
          <section style={{ marginBottom: "60px" }}>
            <div
              style={{
                background: `linear-gradient(135deg, var(--card) 0%, ${accent}0d 100%)`,
                border: `1px solid ${accent}44`,
                padding: "32px",
                clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                display: "flex",
                flexDirection: "column" as const,
                gap: "16px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  color: accent,
                }}
              >
                // Upcoming Performance
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                  letterSpacing: "3px",
                  color: "#fff",
                  lineHeight: 1.1,
                }}
              >
                {(nextEvent ?? anyUpcoming)!.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--text-dim)",
                  letterSpacing: "1px",
                }}
              >
                {formatDate((nextEvent ?? anyUpcoming)!.date)}
              </div>
              <div>
                <a
                  href={(nextEvent ?? anyUpcoming)!.rsvpLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "14px 36px",
                    background: accent,
                    color: accent === "var(--yellow)" || accent === "#FFD600" ? "#000" : "#fff",
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    letterSpacing: "3px",
                    textDecoration: "none",
                    clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    transition: "all 0.2s",
                    fontWeight: 900,
                  }}
                >
                  RSVP NOW
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ── Performance History ──────────────────────────────────────────── */}
        {artistEvents.length > 0 && (
          <section style={{ marginBottom: "60px" }}>
            <div className="section-label" style={{ color: accent }}>Performance History</div>
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
              Past Shows
            </h2>

            <div style={{ display: "flex", flexDirection: "column" as const, gap: "16px" }}>
              {artistEvents.map((event) => {
                const eventSets = setsByEvent[event.id] ?? [];
                const allSongs = eventSets.flatMap((s) => s.songs ?? []);
                const allVideos = eventSets.flatMap((s) => s.videos ?? []);
                const isCompleted = event.status === "completed";

                return (
                  <div
                    key={event.id}
                    style={{
                      background: "var(--card)",
                      border: `1px solid ${isCompleted ? "var(--border)" : accent + "44"}`,
                      padding: "28px",
                      clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Left accent bar */}
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "3px",
                        background: accent,
                        opacity: isCompleted ? 0.4 : 1,
                      }}
                    />

                    <div style={{ paddingLeft: "12px" }}>
                      {/* Status tag */}
                      <div
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          marginBottom: "10px",
                          background: event.status === "upcoming"
                            ? "rgba(0,240,255,0.1)"
                            : event.status === "live"
                              ? "rgba(255,50,50,0.15)"
                              : `${accent}15`,
                          color: event.status === "upcoming"
                            ? "var(--cyan)"
                            : event.status === "live"
                              ? "#ff5555"
                              : accent,
                          border: `1px solid ${event.status === "upcoming"
                            ? "rgba(0,240,255,0.3)"
                            : event.status === "live"
                              ? "rgba(255,50,50,0.3)"
                              : accent + "44"}`,
                        }}
                      >
                        {event.status === "live" ? "LIVE NOW" : event.status.toUpperCase()}
                      </div>

                      {/* Event name & date */}
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1.4rem",
                          letterSpacing: "2px",
                          color: "#fff",
                          marginBottom: "4px",
                        }}
                      >
                        {event.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                          color: "var(--text-dim)",
                          marginBottom: allSongs.length > 0 || allVideos.length > 0 ? "20px" : "0",
                          letterSpacing: "1px",
                        }}
                      >
                        {formatDate(event.date)}
                      </div>

                      {/* Songs */}
                      {allSongs.length > 0 && (
                        <div style={{ marginBottom: allVideos.length > 0 ? "16px" : "0" }}>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.65rem",
                              letterSpacing: "3px",
                              textTransform: "uppercase",
                              color: "var(--text-dim)",
                              marginBottom: "8px",
                            }}
                          >
                            Setlist
                          </div>
                          <ul
                            style={{
                              listStyle: "none",
                              padding: 0,
                              margin: 0,
                              display: "flex",
                              flexDirection: "column" as const,
                              gap: "4px",
                            }}
                          >
                            {allSongs.map((song, i) => (
                              <li key={i}>
                                <a
                                  href={song.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "8px 12px",
                                    background: "rgba(255,255,255,0.03)",
                                    borderLeft: `2px solid ${accent}44`,
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.8rem",
                                    color: "var(--text-dim)",
                                    textDecoration: "none",
                                    transition: "all 0.2s",
                                  }}
                                >
                                  <span style={{ color: accent, fontWeight: 700, minWidth: "24px" }}>
                                    {String(i + 1).padStart(2, "0")}
                                  </span>
                                  <span style={{ flex: 1 }}>{song.title}</span>
                                  <span style={{ color: accent, opacity: 0.7, display: "flex", alignItems: "center", gap: "4px" }}>
                                    {PLATFORM_ICONS[song.platform]}
                                    <span style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>
                                      {getPlatformLabel(song.platform)}
                                    </span>
                                  </span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Videos */}
                      {allVideos.length > 0 && (
                        <div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.65rem",
                              letterSpacing: "3px",
                              textTransform: "uppercase",
                              color: "var(--text-dim)",
                              marginBottom: "8px",
                            }}
                          >
                            Videos
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column" as const,
                              gap: "8px",
                            }}
                          >
                            {allVideos.map((video, i) => (
                              <a
                                key={i}
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "10px 14px",
                                  background: "rgba(255,255,255,0.03)",
                                  border: `1px solid ${accent}22`,
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.8rem",
                                  color: "var(--text)",
                                  textDecoration: "none",
                                  clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                                  transition: "all 0.2s",
                                }}
                              >
                                <span style={{ color: accent }}>{PLATFORM_ICONS["youtube"]}</span>
                                {video.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── No events fallback ──────────────────────────────────────────── */}
        {artistEvents.length === 0 && (
          <section style={{ marginBottom: "60px" }}>
            <div className="section-label" style={{ color: accent }}>Shows</div>
            <p
              style={{
                color: "var(--text-dim)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                letterSpacing: "1px",
                marginTop: "12px",
              }}
            >
              No shows yet — stay tuned.
            </p>
          </section>
        )}

        {/* ── Footer link ─────────────────────────────────────────────────── */}
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
                transition: "opacity 0.3s, filter 0.3s",
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
              color: accent,
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
