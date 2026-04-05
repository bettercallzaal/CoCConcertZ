"use client";

import React, { useState } from "react";
import { createArtist, getArtistBySlug } from "@/lib/db";
import { Button } from "@/components/ui";

const SEED_ARTISTS = [
  {
    slug: "joseph-goats",
    stageName: "Joseph Goats",
    bio: "Community artist from The ZAO, performing live at COC ConcertZ.",
    socialLinks: {},
  },
  {
    slug: "stilo",
    stageName: "Stilo",
    bio: "Host of StiloWorld and 150+ consecutive weekly VR concerts. Returning for his third COC ConcertZ appearance.",
    socialLinks: { website: "https://www.stilo.world/" },
  },
  {
    slug: "tom-fellenz",
    stageName: "Tom Fellenz",
    bio: "ZAO community member and returning performer — previously opened ConcertZ #2 with a live set in the SaltyVerse Auditorium.",
    socialLinks: {},
  },
];

export function SeedArtists() {
  const [status, setStatus] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  async function handleSeed() {
    setSeeding(true);
    setStatus(null);

    const results: string[] = [];

    for (const artist of SEED_ARTISTS) {
      try {
        const existing = await getArtistBySlug(artist.slug);
        if (existing) {
          results.push(`${artist.stageName}: already exists (skipped)`);
          continue;
        }

        await createArtist({
          userId: artist.slug,
          stageName: artist.stageName,
          slug: artist.slug,
          bio: artist.bio,
          socialLinks: artist.socialLinks,
          cardCustomization: {},
          linkedEvents: [],
        });

        results.push(`${artist.stageName}: created`);
      } catch (err) {
        results.push(
          `${artist.stageName}: ERROR — ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    setStatus(results.join("\n"));
    setSeeding(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Button
        variant="outline"
        disabled={seeding}
        onClick={handleSeed}
        style={{ borderColor: "var(--yellow)", color: "var(--yellow)", width: "fit-content" }}
      >
        {seeding ? "Seeding..." : "SEED ARTISTS"}
      </Button>

      {status && (
        <pre
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-dim)",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid var(--border)",
            padding: "12px",
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
          }}
        >
          {status}
        </pre>
      )}
    </div>
  );
}
