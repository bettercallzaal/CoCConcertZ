"use client";

import React, { useState } from "react";
import type { Event, Artist, UploadType, UDLLicense } from "@/lib/types";
import { FileUpload } from "@/components/ui/FileUpload";
import { UDLPicker } from "@/components/archive/UDLPicker";

interface ArchiveUploaderProps {
  walletAddress: string;
  events: Event[];
  artists: Artist[];
  onUploadComplete: (result: {
    id: string;
    arweave_tx_id: string;
    gateway_url: string;
  }) => void;
}

const UPLOAD_TYPES: { value: UploadType; label: string; description: string }[] = [
  {
    value: "simple",
    label: "Simple",
    description: "Basic file upload to Arweave.",
  },
  {
    value: "atomic_asset",
    label: "Atomic Asset",
    description: "NFT-ready with UDL license metadata.",
  },
  {
    value: "show_bundle",
    label: "Show Bundle",
    description: "Group multiple files under one show.",
  },
];

const fieldLabel: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "var(--text-dim)",
  display: "block",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--card)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  padding: "10px 14px",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

const sectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

export function ArchiveUploader({
  walletAddress,
  events,
  artists,
  onUploadComplete,
}: ArchiveUploaderProps) {
  const [uploadType, setUploadType] = useState<UploadType>("simple");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [showId, setShowId] = useState<string>("");
  const [selectedArtistSlugs, setSelectedArtistSlugs] = useState<string[]>([]);
  const [udlPreset, setUdlPreset] = useState<UDLLicense["preset"] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleArtist = (slug: string) => {
    setSelectedArtistSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const canSubmit = !uploading && !!file && title.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_type", uploadType);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("wallet_address", walletAddress);

      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      parsedTags.forEach((tag) => formData.append("tags[]", tag));

      if (showId) formData.append("show_id", showId);

      selectedArtistSlugs.forEach((slug) => formData.append("artist_slugs[]", slug));

      if (uploadType === "atomic_asset" && udlPreset) {
        formData.append("udl_preset", udlPreset);
      }

      const res = await fetch("/api/archive/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Upload failed (${res.status})`);
      }

      const result = await res.json();
      onUploadComplete({
        id: result.id,
        arweave_tx_id: result.arweave_tx_id,
        gateway_url: result.gateway_url,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Upload Type Selector */}
        <div style={sectionStyle}>
          <span style={fieldLabel}>Upload Type</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {UPLOAD_TYPES.map((type) => {
              const isSelected = uploadType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setUploadType(type.value)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "4px",
                    background: isSelected ? "rgba(255, 221, 0, 0.06)" : "var(--card)",
                    border: `1px solid ${isSelected ? "var(--yellow)" : "var(--border)"}`,
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      color: isSelected ? "var(--yellow)" : "var(--text)",
                      transition: "color 0.15s",
                    }}
                  >
                    {type.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--text-dim)",
                      lineHeight: 1.4,
                    }}
                  >
                    {type.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* File Upload */}
        <FileUpload
          label="File"
          accept="image/*,video/*,audio/*,.pdf,.md"
          onUpload={(f) => setFile(f)}
        />

        {/* Title */}
        <div style={sectionStyle}>
          <label style={fieldLabel} htmlFor="archive-title">
            Title <span style={{ color: "var(--yellow)" }}>*</span>
          </label>
          <input
            id="archive-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. COC ConcertZ #7 Flyer"
            style={inputStyle}
            onFocus={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = "var(--yellow)";
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = "var(--border)";
            }}
          />
        </div>

        {/* Description */}
        <div style={sectionStyle}>
          <label style={fieldLabel} htmlFor="archive-description">
            Description
          </label>
          <textarea
            id="archive-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description of this archive item..."
            rows={3}
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: "80px",
              fontFamily: "var(--font-mono)",
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLTextAreaElement).style.borderColor = "var(--yellow)";
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLTextAreaElement).style.borderColor = "var(--border)";
            }}
          />
        </div>

        {/* Tags */}
        <div style={sectionStyle}>
          <label style={fieldLabel} htmlFor="archive-tags">
            Tags <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(comma separated)</span>
          </label>
          <input
            id="archive-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. flyer, show7, art"
            style={inputStyle}
            onFocus={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = "var(--yellow)";
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = "var(--border)";
            }}
          />
        </div>

        {/* Show Selector */}
        <div style={sectionStyle}>
          <label style={fieldLabel} htmlFor="archive-show">
            Show
          </label>
          <select
            id="archive-show"
            value={showId}
            onChange={(e) => setShowId(e.target.value)}
            style={{
              ...inputStyle,
              cursor: "pointer",
            }}
          >
            <option value="">— No show selected —</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                #{event.number} — {event.name}
              </option>
            ))}
          </select>
        </div>

        {/* Artist Multi-Select */}
        {artists.length > 0 && (
          <div style={sectionStyle}>
            <span style={fieldLabel}>Artists</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {artists.map((artist) => {
                const isSelected = selectedArtistSlugs.includes(artist.slug);
                return (
                  <button
                    key={artist.slug}
                    type="button"
                    onClick={() => toggleArtist(artist.slug)}
                    style={{
                      background: isSelected ? "rgba(255, 221, 0, 0.08)" : "var(--card)",
                      border: `1px solid ${isSelected ? "var(--yellow)" : "var(--border)"}`,
                      color: isSelected ? "var(--yellow)" : "var(--text-dim)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: isSelected ? 700 : 400,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      padding: "6px 12px",
                      cursor: "pointer",
                      transition: "border-color 0.15s, color 0.15s, background 0.15s",
                    }}
                  >
                    {artist.stageName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* UDL Picker — only for atomic_asset */}
        {uploadType === "atomic_asset" && (
          <UDLPicker selected={udlPreset} onSelect={setUdlPreset} />
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "#ff4444",
              background: "rgba(255,68,68,0.08)",
              border: "1px solid rgba(255,68,68,0.3)",
              padding: "10px 14px",
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="clip-corner"
          style={{
            background: canSubmit ? "var(--yellow)" : "transparent",
            border: "2px solid var(--yellow)",
            color: canSubmit ? "var(--black, #000)" : "var(--yellow)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            padding: "14px 24px",
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.4,
            transition: "opacity 0.15s, background 0.15s, color 0.15s",
            width: "100%",
          }}
        >
          {uploading ? "Uploading to Arweave..." : "Upload to Permanent Archive"}
        </button>
      </div>
    </form>
  );
}

export default ArchiveUploader;
