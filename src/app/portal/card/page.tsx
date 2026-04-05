"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getArtistBySlug } from "@/lib/db";
import { CardCustomizer } from "@/components/portal/CardCustomizer";
import { ArtistCard } from "@/components/ArtistCard";
import { Card } from "@/components/ui";
import type { Artist } from "@/lib/types";

const pageHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "28px",
  fontWeight: 900,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "var(--text)",
  margin: 0,
};

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.2em",
  color: "var(--text-dim)",
  marginBottom: "16px",
};

export default function CardPage() {
  const { artistSlug, loading: authLoading } = useAuth();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [previewCustomization, setPreviewCustomization] = useState<
    Partial<Artist["cardCustomization"]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    async function load() {
      try {
        const artistData = artistSlug ? await getArtistBySlug(artistSlug) : null;
        if (!artistData) {
          setError("No artist profile found. Contact an admin.");
        } else {
          setArtist(artistData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load artist");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [authLoading, artistSlug]);

  function handleSaved(updated: Partial<Artist["cardCustomization"]>) {
    setArtist((prev) =>
      prev
        ? {
            ...prev,
            cardCustomization: {
              ...prev.cardCustomization,
              ...updated,
            },
          }
        : prev
    );
    setPreviewCustomization(updated);
  }

  if (authLoading || loading) {
    return (
      <div style={{ padding: "32px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error || !artist) {
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
          {error ?? "Artist not found."}
        </div>
      </div>
    );
  }

  const previewArtist: Artist = {
    ...artist,
    cardCustomization: {
      ...artist.cardCustomization,
      ...previewCustomization,
    },
  };

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={pageHeadingStyle}>Card Customizer</h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)", marginTop: "6px" }}>
          Customize how your artist card looks on the public site.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px",
          alignItems: "start",
        }}
      >
        {/* Left: controls */}
        <Card style={{ padding: "24px" }}>
          <div style={sectionLabelStyle}>Customization</div>
          <CardCustomizer artist={artist} onSaved={handleSaved} />
        </Card>

        {/* Right: live preview */}
        <div>
          <div style={sectionLabelStyle}>Live Preview</div>
          <ArtistCard
            artist={previewArtist}
            accentColor={previewCustomization.primaryColor ?? artist.cardCustomization?.primaryColor}
            backgroundColor={previewCustomization.backgroundColor ?? artist.cardCustomization?.backgroundColor}
            backgroundImage={previewCustomization.backgroundImage ?? artist.cardCustomization?.backgroundImage}
          />

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-dim)",
              marginTop: "12px",
            }}
          >
            Preview updates after saving. To edit name, bio or social links, go to Profile.
          </p>
        </div>
      </div>
    </div>
  );
}
