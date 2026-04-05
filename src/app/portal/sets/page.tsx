"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getArtistByUserId, getEvents, getSetsForArtist } from "@/lib/db";
import { SetlistEditor } from "@/components/portal/SetlistEditor";
import { Card } from "@/components/ui";
import type { Artist, Event, SetItem } from "@/lib/types";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.2em",
  color: "var(--text-dim)",
};

const pageHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "28px",
  fontWeight: 900,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "var(--text)",
  margin: 0,
};

export default function SetsPage() {
  const { user, loading: authLoading } = useAuth();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [sets, setSets] = useState<SetItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    async function load() {
      try {
        const artistData = await getArtistByUserId(user!.uid);
        if (!artistData) {
          setError("No artist profile found. Contact an admin.");
          setLoading(false);
          return;
        }

        const [allEvents, artistSets] = await Promise.all([
          getEvents(),
          getSetsForArtist(artistData.id),
        ]);

        // Filter to only events this artist is on
        const myEvents = allEvents.filter((ev) =>
          ev.artists.some((ea) => ea.artistId === artistData.id)
        );

        setArtist(artistData);
        setEvents(myEvents);
        setSets(artistSets);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user, authLoading]);

  function getSetForEvent(eventId: string): SetItem | null {
    return sets.find((s) => s.eventId === eventId) ?? null;
  }

  function handleSaved(saved: SetItem) {
    setSets((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  }

  function handleDeleted(eventId: string) {
    setSets((prev) => prev.filter((s) => s.eventId !== eventId));
    setSelectedEventId(null);
  }

  const selectedEvent = selectedEventId
    ? events.find((ev) => ev.id === selectedEventId) ?? null
    : null;

  if (authLoading || loading) {
    return (
      <div style={{ padding: "32px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "32px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "#ef4444",
            padding: "14px",
            border: "1px solid rgba(239,68,68,0.3)",
            background: "rgba(239,68,68,0.06)",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={pageHeadingStyle}>Setlists</h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)", marginTop: "6px" }}>
          Manage your songs and videos for each event.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Event list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <span style={labelStyle}>Your Events</span>

          {events.length === 0 ? (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--text-dim)",
                padding: "16px",
                border: "1px dashed var(--border)",
                textAlign: "center",
              }}
            >
              You have not been assigned to any events yet.
            </div>
          ) : (
            events.map((ev) => {
              const hasSet = !!getSetForEvent(ev.id);
              const isSelected = selectedEventId === ev.id;

              return (
                <Card
                  key={ev.id}
                  hoverable
                  onClick={() => setSelectedEventId(isSelected ? null : ev.id)}
                  style={{
                    padding: "14px 16px",
                    borderColor: isSelected ? "var(--yellow)" : undefined,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "14px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: isSelected ? "var(--yellow)" : "var(--text)",
                      }}
                    >
                      {ev.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--text-dim)",
                      }}
                    >
                      #{ev.number} &mdash;{" "}
                      {ev.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: hasSet ? "var(--cyan)" : "var(--text-dim)",
                        marginTop: "2px",
                      }}
                    >
                      {hasSet ? "Setlist added" : "No setlist"}
                    </span>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Editor panel */}
        <div>
          {!selectedEvent ? (
            <div
              style={{
                border: "1px dashed var(--border)",
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--text-dim)",
                }}
              >
                Select an event to manage its setlist.
              </span>
            </div>
          ) : (
            <Card style={{ padding: "24px" }}>
              <div style={{ marginBottom: "24px" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "20px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--yellow)",
                    margin: 0,
                  }}
                >
                  {selectedEvent.name}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-dim)",
                    marginTop: "4px",
                  }}
                >
                  #{selectedEvent.number} &mdash;{" "}
                  {selectedEvent.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {artist && (
                <SetlistEditor
                  artistId={artist.id}
                  eventId={selectedEvent.id}
                  existingSet={getSetForEvent(selectedEvent.id)}
                  onSaved={handleSaved}
                  onDeleted={() => handleDeleted(selectedEvent.id)}
                />
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
