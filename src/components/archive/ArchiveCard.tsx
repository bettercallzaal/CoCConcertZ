"use client";

import React, { useState } from "react";
import type { ArchiveUpload } from "@/lib/types";

interface ArchiveCardProps {
  item: ArchiveUpload;
}

const FILE_TYPE_ICONS: Record<string, string> = {
  image: "IMG",
  video: "VID",
  audio: "AUD",
  document: "DOC",
};

const UPLOAD_TYPE_LABELS: Record<string, string> = {
  simple: "ARCHIVE",
  atomic_asset: "ATOMIC",
  show_bundle: "BUNDLE",
};

function truncateArLink(txId: string): string {
  return `ar://${txId.slice(0, 8)}...${txId.slice(-6)}`;
}

export function ArchiveCard({ item }: ArchiveCardProps) {
  const [hovered, setHovered] = useState(false);

  const gatewayUrl = `https://arweave.net/${item.arweave_tx_id}`;
  const visibleTags = (item.tags ?? []).slice(0, 3);
  const uploadLabel = UPLOAD_TYPE_LABELS[item.upload_type] ?? item.upload_type.toUpperCase();

  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    background: "var(--card)",
    border: `1px solid ${hovered ? "var(--yellow)" : "var(--border)"}`,
    overflow: "hidden",
    textDecoration: "none",
    color: "inherit",
    transition: "border-color 0.15s",
    cursor: "pointer",
  };

  return (
    <a
      href={gatewayUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail area */}
      <div
        style={{
          position: "relative",
          height: "160px",
          background: "rgba(255,255,255,0.04)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {item.file_type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gatewayUrl}
            alt={item.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontSize: "32px",
              fontWeight: 900,
              letterSpacing: "0.1em",
              color: "var(--text-dim)",
            }}
          >
            {FILE_TYPE_ICONS[item.file_type] ?? "FILE"}
          </div>
        )}

        {/* Upload type badge — top right */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--black, #000)",
            background: "var(--yellow)",
            padding: "3px 8px",
          }}
        >
          {uploadLabel}
        </div>
      </div>

      {/* Info section */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flexGrow: 1,
        }}
      >
        {/* Title */}
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "14px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--text, #fff)",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.title || "Untitled"}
        </p>

        {/* Tags */}
        {visibleTags.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {visibleTags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--text-dim)",
                  border: "1px solid var(--border)",
                  padding: "2px 7px",
                  whiteSpace: "nowrap",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ar:// link */}
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-dim)",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {truncateArLink(item.arweave_tx_id)}
        </p>
      </div>
    </a>
  );
}

export default ArchiveCard;
