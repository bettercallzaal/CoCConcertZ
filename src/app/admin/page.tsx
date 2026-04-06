"use client";

import React, { useEffect, useState } from "react";
import { getEvents, getArtists, getUsers, getInvites, updateEvent, getSetsForEvent, getArtist } from "@/lib/db";
import { doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Event, Artist, User, Invite, SetItem, Song } from "@/lib/types";
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
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [setlistSongs, setSetlistSongs] = useState<{ song: Song; artistName: string }[]>([]);
  const [nowPlayingSong, setNowPlayingSong] = useState<string | null>(null);
  const [nowPlayingLoading, setNowPlayingLoading] = useState(false);

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
        // Pre-fill announcement from the live/upcoming event
        const liveOrNext =
          upcoming.find((e) => e.status === "live") ??
          upcoming.find((e) => e.status === "upcoming");
        if (liveOrNext?.announcement) {
          setAnnouncementText(liveOrNext.announcement);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Load setlist when live event changes
  useEffect(() => {
    const liveEvent = upcomingEvents.find((e) => e.status === "live");
    if (!liveEvent) {
      setSetlistSongs([]);
      return;
    }

    async function loadSetlist() {
      try {
        const sets = await getSetsForEvent(liveEvent!.id);
        const songList: { song: Song; artistName: string }[] = [];
        for (const s of sets) {
          const artist = await getArtist(s.artistId);
          const name = artist?.stageName ?? "Unknown Artist";
          for (const song of s.songs) {
            songList.push({ song, artistName: name });
          }
        }
        setSetlistSongs(songList);
      } catch (err) {
        console.error("Failed to load setlist", err);
      }
    }
    loadSetlist();
  }, [upcomingEvents]);

  // Listen to now playing doc
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "live", "nowPlaying"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setNowPlayingSong(data.songTitle ?? null);
      } else {
        setNowPlayingSong(null);
      }
    });
    return () => unsub();
  }, []);

  async function handlePlaySong(song: Song, artistName: string) {
    setNowPlayingLoading(true);
    try {
      await setDoc(doc(db, "live", "nowPlaying"), {
        songTitle: song.title,
        artistName,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error("Failed to set now playing", err);
    } finally {
      setNowPlayingLoading(false);
    }
  }

  async function handleClearNowPlaying() {
    setNowPlayingLoading(true);
    try {
      await deleteDoc(doc(db, "live", "nowPlaying"));
    } catch (err) {
      console.error("Failed to clear now playing", err);
    } finally {
      setNowPlayingLoading(false);
    }
  }

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

  async function handlePostAnnouncement() {
    if (!controlEvent || !announcementText.trim()) return;
    setAnnouncementLoading(true);
    try {
      await updateEvent(controlEvent.id, { announcement: announcementText.trim() });
      setUpcomingEvents((prev) =>
        prev.map((e) =>
          e.id === controlEvent.id
            ? { ...e, announcement: announcementText.trim() }
            : e
        )
      );
    } catch (err) {
      console.error("Failed to post announcement", err);
    } finally {
      setAnnouncementLoading(false);
    }
  }

  async function handleClearAnnouncement() {
    if (!controlEvent) return;
    setAnnouncementLoading(true);
    try {
      await updateEvent(controlEvent.id, { announcement: "" });
      setUpcomingEvents((prev) =>
        prev.map((e) =>
          e.id === controlEvent.id ? { ...e, announcement: "" } : e
        )
      );
      setAnnouncementText("");
    } catch (err) {
      console.error("Failed to clear announcement", err);
    } finally {
      setAnnouncementLoading(false);
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

      {/* Now Playing */}
      {controlEvent?.status === "live" && (
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
            Now Playing
          </h2>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Current playing indicator */}
              {nowPlayingSong && (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "#eab308",
                    background: "rgba(234, 179, 8, 0.08)",
                    border: "1px solid rgba(234, 179, 8, 0.3)",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        background: "#eab308",
                        color: "#000",
                        padding: "2px 6px",
                      }}
                    >
                      LIVE
                    </span>
                    <span>{nowPlayingSong}</span>
                  </div>
                  <button
                    onClick={handleClearNowPlaying}
                    disabled={nowPlayingLoading}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      padding: "4px 12px",
                      background: "transparent",
                      color: "var(--text-dim)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      cursor: nowPlayingLoading ? "not-allowed" : "pointer",
                      opacity: nowPlayingLoading ? 0.5 : 1,
                      borderRadius: 0,
                    }}
                  >
                    CLEAR
                  </button>
                </div>
              )}

              {/* Song list */}
              {setlistSongs.length === 0 ? (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-dim)",
                  }}
                >
                  No setlist data found for this event. Add sets to artists first.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {setlistSongs.map((item, i) => {
                    const isPlaying = nowPlayingSong === item.song.title;
                    return (
                      <div
                        key={`${item.artistName}-${item.song.title}-${i}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          padding: "8px 12px",
                          background: isPlaying
                            ? "rgba(234, 179, 8, 0.1)"
                            : "rgba(255,255,255,0.02)",
                          border: isPlaying
                            ? "1px solid rgba(234, 179, 8, 0.3)"
                            : "1px solid transparent",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                          <span
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: "13px",
                              fontWeight: 700,
                              color: isPlaying ? "#eab308" : "var(--text)",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.song.title}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "10px",
                              color: "var(--cyan)",
                            }}
                          >
                            {item.artistName}
                          </span>
                        </div>
                        <button
                          onClick={() => handlePlaySong(item.song, item.artistName)}
                          disabled={nowPlayingLoading || isPlaying}
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            padding: "4px 14px",
                            background: isPlaying
                              ? "rgba(234, 179, 8, 0.15)"
                              : "rgba(234, 179, 8, 0.08)",
                            color: isPlaying ? "#eab308" : "var(--text-dim)",
                            border: `1px solid ${isPlaying ? "#eab308" : "rgba(255,255,255,0.1)"}`,
                            cursor: nowPlayingLoading || isPlaying ? "not-allowed" : "pointer",
                            opacity: nowPlayingLoading ? 0.5 : 1,
                            borderRadius: 0,
                            flexShrink: 0,
                          }}
                        >
                          {isPlaying ? "PLAYING" : "PLAY"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Announcement */}
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
          Announcement
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
              No active event to announce on.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {controlEvent.announcement && (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "#eab308",
                    background: "rgba(234, 179, 8, 0.08)",
                    border: "1px solid rgba(234, 179, 8, 0.3)",
                    padding: "8px 12px",
                  }}
                >
                  <span style={{ color: "var(--text-dim)", marginRight: 8 }}>Current:</span>
                  {controlEvent.announcement}
                </div>
              )}
              <div style={{ display: "flex", gap: "10px", alignItems: "stretch" }}>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Type announcement message..."
                  style={{
                    flex: 1,
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "var(--text)",
                    padding: "10px 14px",
                    outline: "none",
                    borderRadius: 0,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePostAnnouncement();
                  }}
                />
                <button
                  onClick={handlePostAnnouncement}
                  disabled={announcementLoading || !announcementText.trim()}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    padding: "10px 20px",
                    background: "rgba(234, 179, 8, 0.12)",
                    color: "#eab308",
                    border: "1px solid #eab308",
                    cursor: announcementLoading || !announcementText.trim() ? "not-allowed" : "pointer",
                    opacity: announcementLoading || !announcementText.trim() ? 0.5 : 1,
                    borderRadius: 0,
                  }}
                >
                  POST
                </button>
                <button
                  onClick={handleClearAnnouncement}
                  disabled={announcementLoading || !controlEvent.announcement}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    padding: "10px 20px",
                    background: "transparent",
                    color: "var(--text-dim)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    cursor: announcementLoading || !controlEvent.announcement ? "not-allowed" : "pointer",
                    opacity: announcementLoading || !controlEvent.announcement ? 0.4 : 1,
                    borderRadius: 0,
                  }}
                >
                  CLEAR
                </button>
              </div>
            </div>
          )}
        </Card>
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
