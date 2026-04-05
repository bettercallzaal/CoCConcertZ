"use client";

import React, { useState } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { Card } from "@/components/ui";
import { createSet, updateSet, deleteSet } from "@/lib/db";
import type { SetItem, Song, Video } from "@/lib/types";

interface SetlistEditorProps {
  artistId: string;
  eventId: string;
  existingSet?: SetItem | null;
  onSaved?: (set: SetItem) => void;
  onDeleted?: () => void;
}

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.2em",
  color: "var(--text-dim)",
  marginBottom: "12px",
};

const rowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr auto auto",
  gap: "10px",
  alignItems: "end",
};

const videoRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr auto",
  gap: "10px",
  alignItems: "end",
};

const dividerStyle: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid var(--border)",
  margin: "24px 0",
};

function emptySong(): Song {
  return { title: "", platform: "youtube", url: "" };
}

function emptyVideo(): Video {
  return { title: "", url: "", platform: "youtube" };
}

export function SetlistEditor({
  artistId,
  eventId,
  existingSet,
  onSaved,
  onDeleted,
}: SetlistEditorProps) {
  const [songs, setSongs] = useState<Song[]>(existingSet?.songs ?? [emptySong()]);
  const [videos, setVideos] = useState<Video[]>(existingSet?.videos ?? []);
  const [notes, setNotes] = useState(existingSet?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- Songs helpers ---

  function updateSong(index: number, field: keyof Song, value: string) {
    setSongs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addSong() {
    setSongs((prev) => [...prev, emptySong()]);
  }

  function removeSong(index: number) {
    setSongs((prev) => prev.filter((_, i) => i !== index));
  }

  // --- Videos helpers ---

  function updateVideo(index: number, field: keyof Video, value: string) {
    setVideos((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addVideo() {
    setVideos((prev) => [...prev, emptyVideo()]);
  }

  function removeVideo(index: number) {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  }

  // --- Save ---

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const filteredSongs = songs.filter((s) => s.title.trim() || s.url.trim());
    const filteredVideos = videos.filter((v) => v.title.trim() || v.url.trim());

    try {
      if (existingSet) {
        await updateSet(existingSet.id, {
          songs: filteredSongs,
          videos: filteredVideos,
          notes: notes.trim(),
        });
        const updated: SetItem = {
          ...existingSet,
          songs: filteredSongs,
          videos: filteredVideos,
          notes: notes.trim(),
        };
        setSuccess(true);
        onSaved?.(updated);
      } else {
        const created = await createSet({
          artistId,
          eventId,
          songs: filteredSongs,
          videos: filteredVideos,
          notes: notes.trim(),
          order: 0,
        });
        setSuccess(true);
        onSaved?.(created);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save setlist");
    } finally {
      setSaving(false);
    }
  }

  // --- Delete ---

  async function handleDelete() {
    if (!existingSet) return;
    if (!window.confirm("Delete this setlist? This cannot be undone.")) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteSet(existingSet.id);
      onDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete setlist");
      setDeleting(false);
    }
  }

  const selectStyle: React.CSSProperties = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    padding: "10px 14px",
    outline: "none",
    width: "100%",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Songs section */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={sectionHeadingStyle}>Songs</span>
          <Button variant="ghost" size="sm" onClick={addSong}>
            + Add Song
          </Button>
        </div>

        {songs.length === 0 ? (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
              padding: "16px",
              border: "1px dashed var(--border)",
              textAlign: "center",
            }}
          >
            No songs yet. Click &ldquo;Add Song&rdquo; to begin.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {songs.map((song, i) => (
              <Card key={i} style={{ padding: "14px" }}>
                <div style={rowStyle}>
                  <Input
                    label={i === 0 ? "Title" : undefined}
                    placeholder="Song title"
                    value={song.title}
                    onChange={(e) => updateSong(i, "title", e.target.value)}
                  />
                  <Input
                    label={i === 0 ? "URL" : undefined}
                    placeholder="https://..."
                    value={song.url}
                    onChange={(e) => updateSong(i, "url", e.target.value)}
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {i === 0 && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          color: "var(--text-dim)",
                          marginBottom: "6px",
                        }}
                      >
                        Platform
                      </span>
                    )}
                    <select
                      className="clip-corner"
                      value={song.platform}
                      onChange={(e) => updateSong(i, "platform", e.target.value)}
                      style={selectStyle}
                    >
                      <option value="youtube">YouTube</option>
                      <option value="audius">Audius</option>
                      <option value="spotify">Spotify</option>
                      <option value="soundcloud">SoundCloud</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => removeSong(i)}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border)",
                        color: "#ef4444",
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        padding: "10px 14px",
                        cursor: "pointer",
                        transition: "border-color 0.15s",
                      }}
                      title="Remove song"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <hr style={dividerStyle} />

      {/* Videos section */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={sectionHeadingStyle}>Videos</span>
          <Button variant="ghost" size="sm" onClick={addVideo}>
            + Add Video
          </Button>
        </div>

        {videos.length === 0 ? (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
              padding: "16px",
              border: "1px dashed var(--border)",
              textAlign: "center",
            }}
          >
            No videos yet. Click &ldquo;Add Video&rdquo; to begin.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {videos.map((video, i) => (
              <Card key={i} style={{ padding: "14px" }}>
                <div style={videoRowStyle}>
                  <Input
                    label={i === 0 ? "Title" : undefined}
                    placeholder="Video title"
                    value={video.title}
                    onChange={(e) => updateVideo(i, "title", e.target.value)}
                  />
                  <Input
                    label={i === 0 ? "URL" : undefined}
                    placeholder="https://..."
                    value={video.url}
                    onChange={(e) => updateVideo(i, "url", e.target.value)}
                  />
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => removeVideo(i)}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border)",
                        color: "#ef4444",
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        padding: "10px 14px",
                        cursor: "pointer",
                        transition: "border-color 0.15s",
                      }}
                      title="Remove video"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <hr style={dividerStyle} />

      {/* Notes */}
      <Textarea
        label="Notes"
        placeholder="Set notes, performance instructions, etc."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{ minHeight: "80px" }}
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
          Setlist saved successfully.
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : existingSet ? "Update Setlist" : "Create Setlist"}
        </Button>

        {existingSet && (
          <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={deleting}
            style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}
          >
            {deleting ? "Deleting..." : "Delete Setlist"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default SetlistEditor;
