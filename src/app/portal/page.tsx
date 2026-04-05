"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getArtists, getEvents } from "@/lib/db";
import type { Artist, Event } from "@/lib/types";
import { Card } from "@/components/ui";

const QUICK_LINKS = [
  {
    label: "Profile",
    href: "/portal/profile",
    description: "Edit your stage name, bio, photo, and social links",
  },
  {
    label: "Setlists",
    href: "/portal/sets",
    description: "Manage your set lists and tracklogs for each show",
  },
  {
    label: "Card Design",
    href: "/portal/card",
    description: "Customize your artist card appearance",
  },
];

export default function PortalDashboardPage() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [artists, allEvents] = await Promise.all([
          getArtists(),
          getEvents(),
        ]);
        const artistData = artists[0] ?? null;

        setArtist(artistData);

        if (artistData) {
          const linked = allEvents.filter((e) =>
            e.artists.some((a) => a.artistId === artistData.id)
          );
          setMyEvents(linked);
        }
      } catch (err) {
        console.error("Failed to load portal dashboard", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div style={{ padding: "32px" }}>
      {/* Page header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "28px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--text)",
            margin: 0,
          }}
        >
          {artist ? artist.stageName : "Artist Portal"}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-dim)",
            marginTop: "6px",
          }}
        >
          Welcome back.
        </p>
      </div>

      {/* No profile prompt */}
      {!loading && !artist && (
        <Card
          style={{
            padding: "24px",
            marginBottom: "32px",
            border: "1px solid var(--cyan-dim)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "16px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--cyan)",
                  marginBottom: "6px",
                }}
              >
                Set Up Your Artist Profile
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--text-dim)",
                }}
              >
                You don&apos;t have an artist profile yet. Create one to appear on the lineup.
              </div>
            </div>
            <Link
              href="/portal/profile"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                textDecoration: "none",
                padding: "8px 20px",
                border: "2px solid var(--cyan)",
                color: "var(--cyan)",
                whiteSpace: "nowrap",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "rgba(0,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "transparent";
              }}
            >
              Create Profile
            </Link>
          </div>
        </Card>
      )}

      {/* Quick links */}
      <div style={{ marginBottom: "40px" }}>
        <h2
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "var(--text-dim)",
            marginBottom: "16px",
          }}
        >
          Quick Links
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ textDecoration: "none" }}
            >
              <Card
                hoverable
                style={{ padding: "20px", height: "100%", cursor: "pointer" }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "14px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--cyan)",
                    marginBottom: "8px",
                  }}
                >
                  {link.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-dim)",
                    lineHeight: 1.5,
                  }}
                >
                  {link.description}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Your shows */}
      <div>
        <h2
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "var(--text-dim)",
            marginBottom: "16px",
          }}
        >
          Your Shows
        </h2>

        {loading ? (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
            }}
          >
            Loading...
          </div>
        ) : myEvents.length === 0 ? (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
            }}
          >
            {artist
              ? "You haven't been added to any shows yet."
              : "Create your artist profile to be added to shows."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {myEvents.map((event) => (
              <Card key={event.id} style={{ padding: "16px 20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "16px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--text)",
                      }}
                    >
                      {event.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--text-dim)",
                      }}
                    >
                      #{event.number} &mdash;{" "}
                      {event.date.toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      padding: "3px 8px",
                      background:
                        event.status === "live"
                          ? "rgba(220, 38, 38, 0.15)"
                          : "rgba(0, 255, 255, 0.08)",
                      color:
                        event.status === "live" ? "#ef4444" : "var(--cyan)",
                      border: `1px solid ${
                        event.status === "live" ? "#ef4444" : "var(--cyan-dim)"
                      }`,
                    }}
                  >
                    {event.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
