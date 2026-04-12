"use client";

import React from "react";
import type { UDLLicense } from "@/lib/types";

interface UDLPickerProps {
  selected: UDLLicense["preset"] | null;
  onSelect: (preset: UDLLicense["preset"]) => void;
}

// ---------------------------------------------------------------------------
// Preset definitions
// ---------------------------------------------------------------------------

interface PresetDefinition {
  id: UDLLicense["preset"];
  label: string;
  description: string;
}

const PRESETS: PresetDefinition[] = [
  {
    id: "community-share",
    label: "Community Share",
    description: "Free to view & share, attribution required",
  },
  {
    id: "collectible",
    label: "Collectible",
    description: "Viewable, purchasable as a collectible",
  },
  {
    id: "premium",
    label: "Premium",
    description: "Gated, requires payment to access",
  },
  {
    id: "open",
    label: "Open",
    description: "Fully open, no restrictions",
  },
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const wrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "var(--text-dim)",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "10px",
};

function getCardStyle(isSelected: boolean): React.CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
    padding: "14px 16px",
    background: isSelected ? "rgba(255, 220, 0, 0.07)" : "var(--card)",
    border: isSelected ? "2px solid var(--yellow)" : "2px solid var(--border)",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    transition: "border-color 0.15s, background 0.15s",
  };
}

function getCardLabelStyle(isSelected: boolean): React.CSSProperties {
  return {
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: isSelected ? "var(--yellow)" : "var(--text)",
    transition: "color 0.15s",
  };
}

const cardDescStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  color: "var(--text-dim)",
  lineHeight: 1.4,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UDLPicker({ selected, onSelect }: UDLPickerProps) {
  return (
    <div style={wrapperStyle}>
      <label style={fieldLabelStyle}>License Preset</label>
      <div style={gridStyle}>
        {PRESETS.map((preset) => {
          const isSelected = selected === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.id)}
              style={getCardStyle(isSelected)}
            >
              <span style={getCardLabelStyle(isSelected)}>{preset.label}</span>
              <span style={cardDescStyle}>{preset.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default UDLPicker;
