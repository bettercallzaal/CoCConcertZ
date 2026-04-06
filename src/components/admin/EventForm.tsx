"use client";

import React, { useState, useEffect } from "react";
import { createEvent, updateEvent } from "@/lib/db";
import { uploadFile } from "@/lib/storage";
import type { Event } from "@/lib/types";
import { Button, Input, Textarea, FileUpload } from "@/components/ui";

interface EventFormProps {
  event?: Event | null;
  onSuccess: () => void;
  onCancel: () => void;
}

type Status = "upcoming" | "live" | "completed";

interface FormState {
  name: string;
  number: string;
  date: string;
  description: string;
  rsvpLink: string;
  spatialLink: string;
  streamLink: string;
  status: Status;
}

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

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

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--card)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  padding: "10px 14px",
  outline: "none",
  cursor: "pointer",
};

export function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const isEditing = !!event;

  const [form, setForm] = useState<FormState>({
    name: event?.name ?? "",
    number: event?.number != null ? String(event.number) : "",
    date: event?.date ? toDatetimeLocal(event.date) : "",
    description: event?.description ?? "",
    rsvpLink: event?.rsvpLink ?? "",
    spatialLink: event?.venue?.spatialLink ?? "",
    streamLink: event?.venue?.streamLink ?? "",
    status: event?.status ?? "upcoming",
  });

  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError("Event name is required.");
    if (!form.number || isNaN(Number(form.number)))
      return setError("A valid event number is required.");
    if (!form.date) return setError("Event date is required.");
    if (!form.spatialLink.trim()) return setError("Spatial link is required.");

    setSaving(true);
    try {
      let flyerUrl = event?.flyerUrl;
      let bannerUrl = event?.bannerUrl;

      if (flyerFile) {
        flyerUrl = await uploadFile(flyerFile, "coc-concertz/events");
      }

      if (bannerFile) {
        bannerUrl = await uploadFile(bannerFile, "coc-concertz/events");
      }

      const payload = {
        name: form.name.trim(),
        number: Number(form.number),
        date: new Date(form.date),
        description: form.description.trim(),
        rsvpLink: form.rsvpLink.trim(),
        venue: {
          spatialLink: form.spatialLink.trim(),
          streamLink: form.streamLink.trim() || undefined,
        },
        status: form.status,
        flyerUrl,
        bannerUrl,
        artists: event?.artists ?? [],
      };

      if (isEditing && event) {
        await updateEvent(event.id, payload);
      } else {
        await createEvent(payload);
      }

      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Name + Number row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "12px" }}>
          <Input
            label="Event Name"
            value={form.name}
            onChange={set("name")}
            placeholder="COC ConcertZ #12"
            required
          />
          <Input
            label="Number"
            type="number"
            value={form.number}
            onChange={set("number")}
            placeholder="12"
            required
          />
        </div>

        {/* Date */}
        <Input
          label="Date & Time"
          type="datetime-local"
          value={form.date}
          onChange={set("date")}
          required
        />

        {/* Description */}
        <Textarea
          label="Description"
          value={form.description}
          onChange={set("description")}
          placeholder="Describe the event..."
          style={{ minHeight: "80px" }}
        />

        {/* Links */}
        <Input
          label="RSVP Link"
          type="url"
          value={form.rsvpLink}
          onChange={set("rsvpLink")}
          placeholder="https://..."
        />
        <Input
          label="Spatial Link"
          type="url"
          value={form.spatialLink}
          onChange={set("spatialLink")}
          placeholder="https://spatial.io/..."
          required
        />
        <Input
          label="Stream Link (optional)"
          type="url"
          value={form.streamLink}
          onChange={set("streamLink")}
          placeholder="https://..."
        />

        {/* Status */}
        <div>
          <label style={fieldLabel}>Status</label>
          <select
            value={form.status}
            onChange={set("status")}
            style={selectStyle}
          >
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Flyer upload */}
        <FileUpload
          label="Flyer"
          accept="image/*"
          onUpload={(file) => setFlyerFile(file)}
          currentUrl={event?.flyerUrl}
        />

        {/* Banner upload */}
        <FileUpload
          label="Banner"
          accept="image/*"
          onUpload={(file) => setBannerFile(file)}
          currentUrl={event?.bannerUrl}
        />

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
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Event"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default EventForm;
