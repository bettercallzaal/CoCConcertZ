"use client";

import React, { useEffect, useState } from "react";
import { getEvents, getArtists, getUsers, getInvites, updateEvent } from "@/lib/db";
import type { Event, Artist, User, Invite } from "@/lib/types";
import { Card } from "@/components/ui";
import { SeedArtists } from "@/components/admin/SeedArtists";

interface Stats {
  events: number;
  artists: number;
  users: number;
  pendingInvites: number;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  color: "var(--text-dim)",
};

const valueStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "40px",
  fontWeight: 900,
  color: "var(--yellow)",
  lineHeight: 1,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    events: 0,
    artists: 0,
    users: 0,
    pendingInvites: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveLoading, setLiveLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [events, artists, users, invites] = await Promise.all([
          getEvents(),
          getArtists(),
          getUsers(),
          getInvites(),
        ]);

        const pending = invites.filter((i) => i.status === "pending").length;
        const upcoming = events
          .filter((e) => e.status === "upcoming" || e.status === "live")
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 5);

        setStats({
          events: events.length,
          artists: artists.length,
          users: users.length,
          pendingInvites: pending,
        });
        setUpcomingEvents(upcoming);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // The next controllable event: live event first, then earliest upcoming
  const controlEvent =
    upcomingEvents.find((e) => e.status === "live") ??
    upcomingEvents.find((e) => e.status === "upcoming") ??
    null;

  async function handleGoLive() {
    if (!controlEvent) return;
    setLiveLoading(true);
    try {
      const newStatus: Event["status"] = controlEvent.status === "live" ? "completed" : "live";
      await updateEvent(controlEvent.id, { status: newStatus });
      setUpcomingEvents((prev) =>
        prev
          .map((e) =>
            e.id === controlEvent.id ? { ...e, status: newStatus } : e
          )
          .filter((e) => newStatus === "completed" ? e.id !== controlEvent.id : true)
      );
    } catch (err) {
      console.error("Failed to update event status", err);
    } finally {
      setLiveLoading(false);
    }
  }

  const statCards = [
    { label: "Total Events", value: stats.events },
    { label: "Artists", value: stats.artists },
    { label: "Users", value: stats.users },
    { label: "Pending Invites", value: stats.pendingInvites },
  ];

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
          Dashboard
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-dim)",
            marginTop: "6px",
          }}
        >
          COC ConcertZ admin overview
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={labelStyle}>{stat.label}</span>
              <span style={valueStyle}>
                {loading ? "—" : stat.value}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Live Controls */}
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
          Live Controls
        </h2>
        <Card>
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
          ) : !controlEvent ? (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--text-dim)",
              }}
            >
              No upcoming or live events to control.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                  }}
                >
                  Controlling
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "20px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text)",
                  }}
                >
                  +COC CONCERTZ #{controlEvent.number}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-dim)",
                  }}
                >
                  {controlEvent.date.toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <button
                onClick={handleGoLive}
                disabled={liveLoading}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  padding: "14px 36px",
                  border: "2px solid",
                  borderRadius: 0,
                  cursor: liveLoading ? "not-allowed" : "pointer",
                  opacity: liveLoading ? 0.6 : 1,
                  transition: "all 0.15s ease",
                  ...(controlEvent.status === "live"
                    ? {
                        background: "rgba(220, 38, 38, 0.15)",
                        color: "#ef4444",
                        borderColor: "#ef4444",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }
                    : {
                        background: "rgba(234, 179, 8, 0.12)",
                        color: "#eab308",
                        borderColor: "#eab308",
                      }),
                }}
              >
                {liveLoading
                  ? "Updating..."
                  : controlEvent.status === "live"
                  ? "END SHOW"
                  : "GO LIVE"}
              </button>
            </div>
          )}
        </Card>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
            50% { opacity: 0.8; box-shadow: 0 0 0 8px rgba(239,68,68,0); }
          }
        `}</style>
      </div>

      {/* Seed artists */}
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
          Data Tools
        </h2>
        <SeedArtists />
      </div>

      {/* Upcoming shows */}
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
          Upcoming Shows
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
        ) : upcomingEvents.length === 0 ? (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
            }}
          >
            No upcoming shows.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {upcomingEvents.map((event) => (
              <Card key={event.id}>
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
