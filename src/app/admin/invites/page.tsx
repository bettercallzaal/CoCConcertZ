"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getInvites } from "@/lib/db";
import type { Invite } from "@/lib/types";
import { Button, Modal } from "@/components/ui";
import { InviteForm } from "@/components/admin/InviteForm";
import { InviteList } from "@/components/admin/InviteList";

export default function InvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInvites();
      setInvites(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  function handleInviteSent() {
    setModalOpen(false);
    fetchInvites();
  }

  return (
    <div style={{ padding: "32px 36px", maxWidth: "860px" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "32px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "28px",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text)",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Invites
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
              margin: "6px 0 0",
              letterSpacing: "0.08em",
            }}
          >
            Manage access invitations
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          + Send Invite
        </Button>
      </div>

      {/* Invite list */}
      {loading ? (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--yellow)",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            animation: "pulse 1.5s infinite",
          }}
        >
          Loading...
        </div>
      ) : (
        <InviteList invites={invites} onRevoked={fetchInvites} />
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Send Invite"
      >
        <InviteForm onSuccess={handleInviteSent} />
      </Modal>
    </div>
  );
}
