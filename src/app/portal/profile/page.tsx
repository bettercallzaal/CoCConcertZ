"use client";

import React, { useEffect, useState } from "react";
import { getArtists } from "@/lib/db";
import type { Artist } from "@/lib/types";
import { ProfileForm } from "@/components/portal/ProfileForm";

export default function PortalProfilePage() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const artists = await getArtists();
        setArtist(artists[0] ?? null);
      } catch (err) {
        console.error("Failed to load artist profile", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div style={{ padding: "32px", maxWidth: "900px" }}>
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
          {artist ? "Edit Profile" : "Create Profile"}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-dim)",
            marginTop: "6px",
          }}
        >
          {artist
            ? "Update your artist info, photo, and links."
            : "Set up your artist profile to appear on the COC ConcertZ lineup."}
        </p>
      </div>

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
      ) : (
        <ProfileForm
          artist={artist}
          onSaved={(saved) => setArtist(saved)}
        />
      )}
    </div>
  );
}
