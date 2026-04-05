"use client";

import React, { useState } from "react";
import { deleteEvent } from "@/lib/db";
import type { Event } from "@/lib/types";
import { Badge, Button, Card } from "@/components/ui";

interface EventListProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDeleted: (id: string) => void;
}

export function EventList({ events, onEdit, onDeleted }: EventListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (event: Event) => {
    if (
      !window.confirm(
        `Delete "${event.name}"? This cannot be undone.`
      )
    ) {
      return;
    }
    setDeletingId(event.id);
    try {
      await deleteEvent(event.id);
      onDeleted(event.id);
    } catch (err) {
      console.error("Failed to delete event", err);
      alert("Failed to delete event. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (events.length === 0) {
    return (
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-dim)",
          padding: "32px 0",
          textAlign: "center",
        }}
      >
        No events yet. Create the first one.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {events.map((event) => (
        <Card key={event.id}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "16px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {event.name}
                </span>
                <Badge variant={event.status}>{event.status}</Badge>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-dim)",
                }}
              >
                #{event.number} &mdash;{" "}
                {event.date.toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(event)}
                disabled={deletingId === event.id}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(event)}
                disabled={deletingId === event.id}
                style={{ color: "#ef4444", borderColor: "#ef444460" }}
              >
                {deletingId === event.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default EventList;
