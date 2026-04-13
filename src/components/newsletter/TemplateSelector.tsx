"use client";

import React from "react";

export type Template =
  | "show-announcement"
  | "artist-spotlight"
  | "show-recap"
  | "community-update"
  | "youtube-description"
  | "custom";

interface TemplateSelectorProps {
  selected: Template | null;
  onSelect: (t: Template) => void;
}

interface TemplateDefinition {
  id: Template;
  label: string;
  description: string;
  icon: string;
}

const TEMPLATES: TemplateDefinition[] = [
  {
    id: "show-announcement",
    label: "Show Announcement",
    description: "Upcoming concert details + RSVP",
    icon: "📣",
  },
  {
    id: "artist-spotlight",
    label: "Artist Spotlight",
    description: "Feature an artist before a show",
    icon: "⭐",
  },
  {
    id: "show-recap",
    label: "Show Recap",
    description: "Post-show highlights + vibes",
    icon: "📷",
  },
  {
    id: "community-update",
    label: "Community Update",
    description: "News, milestones, announcements",
    icon: "👥",
  },
  {
    id: "youtube-description",
    label: "YouTube Description",
    description: "SEO-optimized description + timestamps + tags from transcript",
    icon: "▶",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Write your own prompt",
    icon: "✏️",
  },
];

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: "12px",
};

function getCardStyle(isSelected: boolean): React.CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
    padding: "16px",
    background: isSelected ? "rgba(255, 220, 0, 0.08)" : "var(--card)",
    border: isSelected
      ? "2px solid var(--yellow)"
      : "2px solid var(--border)",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    transition: "border-color 0.15s, background 0.15s",
  };
}

const iconStyle: React.CSSProperties = {
  fontSize: "24px",
  lineHeight: 1,
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontWeight: 600,
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--text)",
};

const descStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  color: "var(--text-dim)",
  lineHeight: 1.4,
};

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div style={gridStyle}>
      {TEMPLATES.map((t) => {
        const isSelected = selected === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            style={getCardStyle(isSelected)}
          >
            <span style={iconStyle}>{t.icon}</span>
            <span style={labelStyle}>{t.label}</span>
            <span style={descStyle}>{t.description}</span>
          </button>
        );
      })}
    </div>
  );
}

export default TemplateSelector;
