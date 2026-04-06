"use client";

import { useState } from "react";

interface VideoItem {
  id: string;
  title: string;
  artist: string;
  concert: string;
}

const VIDEOS: VideoItem[] = [
  { id: "-ggYAdu4KRE", title: "AttaBotty Intro", artist: "AttaBotty", concert: "#1" },
  { id: "E0xE65RRKI0", title: "Attabotty Flyin", artist: "AttaBotty", concert: "#1" },
  { id: "4n1dFs5T4T4", title: "Clejan Intro", artist: "Clejan", concert: "#1" },
  { id: "zYm3g_YUYjE", title: "Live Set", artist: "Tom Fellenz", concert: "#2" },
  { id: "-nx9gZtK8ug", title: "WaveWarZ Battle", artist: "Stilo World", concert: "#2" },
  { id: "YYyBFasvkuM", title: "Closing Set", artist: "AttaBotty", concert: "#2" },
];

export default function VideoHighlights() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section
      className="reveal"
      style={{
        padding: "80px 0",
      }}
    >
      {/* Section label */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.3em",
          color: "var(--cyan)",
          marginBottom: "16px",
          opacity: 0.7,
        }}
      >
        // HIGHLIGHTS
      </div>

      {/* Heading */}
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--text)",
          margin: "0 0 48px 0",
          lineHeight: 1,
        }}
      >
        BEST{" "}
        <span style={{ color: "var(--yellow)" }}>MOMENTS</span>
      </h2>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px",
        }}
        className="video-highlights-grid"
      >
        {VIDEOS.map((video) => {
          const isActive = activeId === video.id;
          const thumb = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;

          return (
            <div
              key={video.id}
              className="video-card"
              style={{
                position: "relative",
                aspectRatio: "16 / 9",
                overflow: "hidden",
                cursor: isActive ? "default" : "pointer",
                border: "1px solid var(--border)",
                background: "var(--card)",
              }}
              onClick={() => {
                if (!isActive) setActiveId(video.id);
              }}
            >
              {isActive ? (
                /* Embedded player */
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                />
              ) : (
                /* Thumbnail */
                <>
                  {/* Thumbnail image as background */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: `url(${thumb})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      transition: "transform 0.3s ease",
                    }}
                    className="video-thumb-bg"
                  />

                  {/* Bottom gradient overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 45%, transparent 100%)",
                    }}
                  />

                  {/* Play button */}
                  <div
                    className="play-btn"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "54px",
                      height: "54px",
                      borderRadius: "50%",
                      background: "rgba(255,214,0,0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.2s ease, transform 0.2s ease",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      style={{ marginLeft: "3px" }}
                    >
                      <path d="M5 3L17 10L5 17V3Z" fill="#000" />
                    </svg>
                  </div>

                  {/* Info overlay */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          color: "#000",
                          background: "var(--yellow)",
                          padding: "2px 6px",
                          lineHeight: 1.4,
                        }}
                      >
                        ConcertZ {video.concert}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(13px, 2vw, 16px)",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#fff",
                        lineHeight: 1.2,
                      }}
                    >
                      {video.title}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        color: "var(--cyan)",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                      }}
                    >
                      {video.artist}
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Close active video button */}
      {activeId && (
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => setActiveId(null)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              padding: "8px 20px",
              background: "transparent",
              color: "var(--text-dim)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              borderRadius: 0,
              transition: "color 0.15s ease, border-color 0.15s ease",
            }}
          >
            CLOSE VIDEO
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .video-highlights-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        .video-card:hover .play-btn {
          opacity: 1 !important;
          transform: translate(-50%, -50%) scale(1.08) !important;
        }
        .video-card:hover .video-thumb-bg {
          transform: scale(1.04);
        }
      `}</style>
    </section>
  );
}
