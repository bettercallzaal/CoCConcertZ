"use client";

import React, { useState } from "react";
import type { Event, Artist } from "@/lib/types";
import { Button } from "@/components/ui";

interface Props {
  template: "show-announcement" | "artist-spotlight" | "show-recap" | "community-update" | "custom";
  events: Event[];
  artists: Artist[];
  generating: boolean;
  onGenerate: (inputs: {
    customPrompt?: string;
    artistContext?: string;
    eventContext?: string;
    mentionHandles?: Record<string, Record<string, string>>;
  }) => void;
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function buildMentionHandles(
  artists: Artist[],
  selectedArtistIds: string[]
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  for (const artist of artists) {
    if (!selectedArtistIds.includes(artist.id)) continue;
    const handles: Record<string, string> = {};
    if (artist.socialLinks.twitter) handles.twitter = artist.socialLinks.twitter;
    if (artist.socialLinks.farcaster) handles.farcaster = artist.socialLinks.farcaster;
    result[artist.stageName] = handles;
  }
  return result;
}

function formatEventContext(event: Event, artists: Artist[]): string {
  const eventArtistIds = event.artists.map((ea) => ea.artistId);
  const lineup = artists
    .filter((a) => eventArtistIds.includes(a.id))
    .sort((a, b) => {
      const orderA = event.artists.find((ea) => ea.artistId === a.id)?.order ?? 99;
      const orderB = event.artists.find((ea) => ea.artistId === b.id)?.order ?? 99;
      return orderA - orderB;
    })
    .map((a) => a.stageName)
    .join(", ");

  const dateStr = event.date instanceof Date
    ? event.date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : String(event.date);

  const lines: string[] = [
    `COC Concertz #${event.number}: ${event.name}`,
    `Date: ${dateStr}`,
  ];
  if (lineup) lines.push(`Artists: ${lineup}`);
  lines.push(`Venue: Metaverse (Spatial.io)`);
  if (event.venue?.spatialLink) lines.push(`Stream: ${event.venue.spatialLink}`);
  if (event.rsvpLink) lines.push(`RSVP: ${event.rsvpLink}`);
  if (event.description) lines.push(``, event.description);
  return lines.join("\n");
}

function formatArtistContext(artist: Artist): string {
  const lines: string[] = [`Artist: ${artist.stageName}`];
  if (artist.bio) lines.push(``, artist.bio);
  const { twitter, farcaster, audius, spotify, youtube, website } = artist.socialLinks;
  const socials: string[] = [];
  if (twitter) socials.push(`Twitter: ${twitter}`);
  if (farcaster) socials.push(`Farcaster: ${farcaster}`);
  if (audius) socials.push(`Audius: ${audius}`);
  if (spotify) socials.push(`Spotify: ${spotify}`);
  if (youtube) socials.push(`YouTube: ${youtube}`);
  if (website) socials.push(`Website: ${website}`);
  if (socials.length > 0) lines.push(``, ...socials);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const fieldWrapStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "var(--text-dim)",
};

const optionalBadgeStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  fontWeight: 400,
  textTransform: "lowercase",
  letterSpacing: "0.05em",
  color: "var(--text-dim)",
  opacity: 0.6,
  marginLeft: "6px",
};

const fieldBase: React.CSSProperties = {
  width: "100%",
  background: "var(--card)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  padding: "10px 14px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const selectArrowSVG =
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E`;

const selectStyle: React.CSSProperties = {
  ...fieldBase,
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  backgroundImage: `url("${selectArrowSVG}")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  paddingRight: "38px",
  cursor: "pointer",
};

const textareaBase: React.CSSProperties = {
  ...fieldBase,
  resize: "vertical",
  minHeight: "90px",
  lineHeight: 1.5,
};

const formStackStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

// ---------------------------------------------------------------------------
// Focusable field wrappers
// ---------------------------------------------------------------------------

function FocusSelect({
  value,
  onChange,
  children,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...selectStyle,
        borderColor: focused ? "var(--yellow)" : "var(--border)",
        ...style,
      }}
    >
      {children}
    </select>
  );
}

function FocusTextarea({
  value,
  onChange,
  placeholder,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      style={{
        ...textareaBase,
        borderColor: focused ? "var(--yellow)" : "var(--border)",
        ...style,
      }}
    />
  );
}

function FocusInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      style={{
        ...fieldBase,
        borderColor: focused ? "var(--yellow)" : "var(--border)",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TemplateInputs({
  template,
  events,
  artists,
  generating,
  onGenerate,
}: Props) {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedArtistId, setSelectedArtistId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [keyPoints, setKeyPoints] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const upcomingEvents = events.filter((e) => e.status === "upcoming");
  const completedEvents = events.filter((e) => e.status === "completed");

  const announcementEvents = upcomingEvents.length > 0 ? upcomingEvents : events;
  const recapEvents = completedEvents.length > 0 ? completedEvents : events;

  const filteredEvents =
    template === "show-announcement" ? announcementEvents : recapEvents;

  // ---------------------------------------------------------------------------
  // Validation — which required fields are filled
  // ---------------------------------------------------------------------------

  const isValid = (() => {
    if (generating) return false;
    if (template === "show-announcement" || template === "show-recap") {
      return selectedEventId !== "";
    }
    if (template === "artist-spotlight") {
      return selectedArtistId !== "";
    }
    if (template === "community-update") {
      return topic.trim() !== "";
    }
    if (template === "custom") {
      return customPrompt.trim() !== "";
    }
    return false;
  })();

  // ---------------------------------------------------------------------------
  // Generate handler
  // ---------------------------------------------------------------------------

  function handleGenerate() {
    if (!isValid) return;

    if (template === "show-announcement" || template === "show-recap") {
      const event = events.find((e) => e.id === selectedEventId);
      if (!event) return;
      const eventArtistIds = event.artists.map((ea) => ea.artistId);
      const mentionHandles = buildMentionHandles(artists, eventArtistIds);
      const eventContext = formatEventContext(event, artists);
      const customPromptVal = notes.trim() ? `Additional notes: ${notes.trim()}` : undefined;
      onGenerate({ eventContext, mentionHandles, customPrompt: customPromptVal });
      return;
    }

    if (template === "artist-spotlight") {
      const artist = artists.find((a) => a.id === selectedArtistId);
      if (!artist) return;
      const artistContext = formatArtistContext(artist);
      const mentionHandles = buildMentionHandles(artists, [artist.id]);
      const customPromptVal = notes.trim() ? `Angle/Hook: ${notes.trim()}` : undefined;
      onGenerate({ artistContext, mentionHandles, customPrompt: customPromptVal });
      return;
    }

    if (template === "community-update") {
      const parts: string[] = [`Topic: ${topic.trim()}`];
      if (keyPoints.trim()) parts.push(`Key Points:\n${keyPoints.trim()}`);
      onGenerate({ customPrompt: parts.join("\n\n") });
      return;
    }

    if (template === "custom") {
      onGenerate({ customPrompt: customPrompt.trim() });
      return;
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={formStackStyle}>
      {/* Show Announcement & Show Recap */}
      {(template === "show-announcement" || template === "show-recap") && (
        <>
          <div style={fieldWrapStyle}>
            <label style={labelStyle}>Event</label>
            <FocusSelect value={selectedEventId} onChange={setSelectedEventId}>
              <option value="">— Select a show —</option>
              {filteredEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  ConcertZ #{event.number} — {event.name}
                </option>
              ))}
            </FocusSelect>
          </div>

          <div style={fieldWrapStyle}>
            <label style={labelStyle}>
              Notes
              <span style={optionalBadgeStyle}>(optional)</span>
            </label>
            <FocusTextarea
              value={notes}
              onChange={setNotes}
              placeholder="Any extra context, talking points, or tone notes…"
            />
          </div>
        </>
      )}

      {/* Artist Spotlight */}
      {template === "artist-spotlight" && (
        <>
          <div style={fieldWrapStyle}>
            <label style={labelStyle}>Artist</label>
            <FocusSelect value={selectedArtistId} onChange={setSelectedArtistId}>
              <option value="">— Select an artist —</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.stageName}
                </option>
              ))}
            </FocusSelect>
          </div>

          <div style={fieldWrapStyle}>
            <label style={labelStyle}>
              Angle / Hook
              <span style={optionalBadgeStyle}>(optional)</span>
            </label>
            <FocusTextarea
              value={notes}
              onChange={setNotes}
              placeholder="What's the unique angle or hook for this spotlight?"
            />
          </div>
        </>
      )}

      {/* Community Update */}
      {template === "community-update" && (
        <>
          <div style={fieldWrapStyle}>
            <label style={labelStyle}>Topic</label>
            <FocusInput
              value={topic}
              onChange={setTopic}
              placeholder="What's this update about?"
            />
          </div>

          <div style={fieldWrapStyle}>
            <label style={labelStyle}>
              Key Points
              <span style={optionalBadgeStyle}>(optional)</span>
            </label>
            <FocusTextarea
              value={keyPoints}
              onChange={setKeyPoints}
              placeholder="List the main points to cover, one per line…"
            />
          </div>
        </>
      )}

      {/* Custom */}
      {template === "custom" && (
        <div style={fieldWrapStyle}>
          <label style={labelStyle}>Prompt</label>
          <FocusTextarea
            value={customPrompt}
            onChange={setCustomPrompt}
            placeholder="Describe exactly what you want the newsletter content to say…"
            style={{ minHeight: "120px" }}
          />
        </div>
      )}

      {/* Generate button */}
      <Button
        variant="primary"
        size="lg"
        disabled={!isValid}
        onClick={handleGenerate}
        style={{ width: "100%", marginTop: "4px" }}
      >
        {generating ? "Generating..." : "Generate Content"}
      </Button>
    </div>
  );
}

export default TemplateInputs;
