"use client";

import React from "react";
import { ArchiveGrid } from "@/components/archive/ArchiveGrid";

export default function ArchivePage() {
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "48px",
            color: "var(--yellow)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            margin: 0,
          }}
        >
          Permanent Archive
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--text-dim)",
            marginTop: "8px",
            lineHeight: 1.6,
          }}
        >
          Every show, every moment — stored forever on Arweave. Community-funded, community-owned.
        </p>

        <a
          href="/archive/upload"
          style={{
            display: "inline-block",
            marginTop: "16px",
            background: "var(--yellow)",
            color: "#000",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            padding: "10px 24px",
            textDecoration: "none",
          }}
        >
          Upload to Archive
        </a>
      </div>

      <ArchiveGrid />
    </div>
  );
}
