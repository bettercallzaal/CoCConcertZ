"use client";

import React, { useEffect, useState } from "react";
import { getEvents } from "@/lib/db";
import type { Event } from "@/lib/types";
import { Button, Modal } from "@/components/ui";
import { EventList } from "@/components/admin/EventList";
import { EventForm } from "@/components/admin/EventForm";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openCreate = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingEvent(null);
  };

  const handleSuccess = async () => {
    handleClose();
    setLoading(true);
    await loadEvents();
  };

  const handleDeleted = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "32px",
          gap: "16px",
        }}
      >
        <div>
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
            Events
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
              marginTop: "6px",
            }}
          >
            Manage COC ConcertZ shows
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreate}>
          + New Event
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-dim)",
          }}
        >
          Loading events...
        </div>
      ) : (
        <EventList
          events={events}
          onEdit={openEdit}
          onDeleted={handleDeleted}
        />
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={handleClose}
        title={editingEvent ? "Edit Event" : "New Event"}
        maxWidth="640px"
      >
        <EventForm
          event={editingEvent}
          onSuccess={handleSuccess}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  );
}
