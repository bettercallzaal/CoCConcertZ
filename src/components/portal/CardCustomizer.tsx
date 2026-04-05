"use client";

import React, { useState } from "react";
import { Button, Input, FileUpload } from "@/components/ui";
import { updateArtist } from "@/lib/db";
import { uploadFile, getStoragePath } from "@/lib/storage";
import type { Artist } from "@/lib/types";

interface CardCustomizerProps {
  artist: Artist;
  onSaved?: (updated: Partial<Artist["cardCustomization"]>) => void;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.15em",
  color: "var(--text-dim)",
  marginBottom: "6px",
  display: "block",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
};

export function CardCustomizer({ artist, onSaved }: CardCustomizerProps) {
  const cc = artist.cardCustomization ?? {};

  const [accentColor, setAccentColor] = useState(cc.primaryColor ?? "#FFD600");
  const [bgColor, setBgColor] = useState(cc.backgroundColor ?? "#0a0a0a");
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      let backgroundImage = cc.backgroundImage;

      if (bgImageFile) {
        const path = getStoragePath("artists", artist.id, `card-bg-${Date.now()}-${bgImageFile.name}`);
        backgroundImage = await uploadFile(path, bgImageFile);
      }

      const customization: Artist["cardCustomization"] = {
        ...cc,
        primaryColor: accentColor,
        backgroundColor: bgColor,
        backgroundImage,
      };

      await updateArtist(artist.id, { cardCustomization: customization });
      setSuccess(true);
      onSaved?.(customization);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Accent color */}
      <div>
        <label style={labelStyle}>Accent Color</label>
        <div style={rowStyle}>
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            style={{
              width: "44px",
              height: "44px",
              border: "1px solid var(--border)",
              background: "var(--card)",
              cursor: "pointer",
              padding: "2px",
              flexShrink: 0,
            }}
            title="Pick accent color"
          />
          <Input
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            placeholder="#FFD600"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* Background color */}
      <div>
        <label style={labelStyle}>Background Color</label>
        <div style={rowStyle}>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            style={{
              width: "44px",
              height: "44px",
              border: "1px solid var(--border)",
              background: "var(--card)",
              cursor: "pointer",
              padding: "2px",
              flexShrink: 0,
            }}
            title="Pick background color"
          />
          <Input
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            placeholder="#0a0a0a"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* Background image */}
      <FileUpload
        label="Background Image"
        accept="image/*"
        currentUrl={cc.backgroundImage}
        onUpload={(file) => setBgImageFile(file)}
      />

      {/* Feedback */}
      {error && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "#ef4444",
            padding: "10px 14px",
            border: "1px solid rgba(239,68,68,0.3)",
            background: "rgba(239,68,68,0.06)",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--cyan)",
            padding: "10px 14px",
            border: "1px solid var(--cyan-dim)",
            background: "rgba(0,240,255,0.05)",
          }}
        >
          Card customization saved.
        </div>
      )}

      <Button variant="primary" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Customization"}
      </Button>
    </div>
  );
}

export default CardCustomizer;
