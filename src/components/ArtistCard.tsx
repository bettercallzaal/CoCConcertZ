import React from "react";
import type { Artist } from "@/lib/types";

interface ArtistCardProps {
  artist: Artist;
  /** Override colors for live preview in the customizer */
  accentColor?: string;
  backgroundColor?: string;
  backgroundImage?: string;
}

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  twitter: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.638zM17.083 20.19h1.834L7.042 4.126H5.075z" />
    </svg>
  ),
  farcaster: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.978 0C5.361 0 0 5.373 0 12s5.361 12 11.978 12C18.616 24 24 18.627 24 12S18.616 0 11.978 0zm5.323 17.5h-2.1v-6.75c0-.69-.558-1.25-1.246-1.25h-.478c-.688 0-1.246.56-1.246 1.25V17.5H10.13V9.25h2.1v.607c.502-.434 1.156-.607 1.891-.607h.478c1.722 0 2.702 1.008 2.702 2.75V17.5zm-9.347 0H5.853V6.5h2.101v11zm-1.05-12.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
    </svg>
  ),
  audius: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 4.8c1.988 0 3.6 1.612 3.6 3.6 0 1.988-1.612 3.6-3.6 3.6-1.988 0-3.6-1.612-3.6-3.6 0-1.988 1.612-3.6 3.6-3.6zm0 14.4c-3.312 0-6.228-1.692-7.944-4.248.036-2.64 5.292-4.092 7.944-4.092 2.64 0 7.908 1.452 7.944 4.092C18.228 17.508 15.312 19.2 12 19.2z" />
    </svg>
  ),
  spotify: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  website: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

export function ArtistCard({
  artist,
  accentColor,
  backgroundColor,
  backgroundImage,
}: ArtistCardProps) {
  const accent = accentColor ?? artist.cardCustomization?.primaryColor ?? "var(--yellow)";
  const bg = backgroundColor ?? artist.cardCustomization?.backgroundColor ?? "var(--card)";
  const bgImage = backgroundImage ?? artist.cardCustomization?.backgroundImage;

  const socials = artist.socialLinks ?? {};
  const socialEntries = Object.entries(socials).filter(([, url]) => !!url) as [string, string][];

  return (
    <div
      className="clip-corner"
      style={{
        position: "relative",
        background: bg,
        border: `1px solid ${accent}33`,
        overflow: "hidden",
        width: "100%",
        maxWidth: "360px",
      }}
    >
      {/* Background image at 20% opacity */}
      {bgImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.2,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Photo + name row */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Profile photo */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              border: `2px solid ${accent}`,
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
                  fontSize: "22px",
                  fontWeight: 900,
                  color: accent,
                }}
              >
                {artist.stageName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Stage name */}
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: accent,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {artist.stageName}
          </h3>
        </div>

        {/* Bio — 3 line clamp */}
        {artist.bio && (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text)",
              lineHeight: 1.6,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {artist.bio}
          </p>
        )}

        {/* Social links */}
        {socialEntries.length > 0 && (
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {socialEntries.map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title={platform}
                style={{
                  color: "var(--text-dim)",
                  transition: "color 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = accent;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-dim)";
                }}
              >
                {SOCIAL_ICONS[platform] ?? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArtistCard;
