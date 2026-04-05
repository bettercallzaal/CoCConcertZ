"use client";

import React, { useState } from "react";
import { updateInvite } from "@/lib/db";
import type { Invite } from "@/lib/types";
import { Badge, Button } from "@/components/ui";

interface InviteListProps {
  invites: Invite[];
  onRevoked?: () => void;
}

function statusBadgeVariant(status: Invite["status"]): "upcoming" | "completed" | "live" {
  if (status === "pending") return "upcoming";
  if (status === "accepted") return "completed";
  return "live"; // revoked
}

function statusLabel(status: Invite["status"]): string {
  if (status === "pending") return "Pending";
  if (status === "accepted") return "Accepted";
  return "Revoked";
}

export function InviteList({ invites, onRevoked }: InviteListProps) {
  const [revoking, setRevoking] = useState<string | null>(null);

  async function handleRevoke(id: string) {
    setRevoking(id);
    try {
      await updateInvite(id, { status: "revoked" });
      onRevoked?.();
    } catch (err) {
      // silently handled — caller will see stale data until next refresh
    } finally {
      setRevoking(null);
    }
  }

  if (invites.length === 0) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-dim)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          border: "1px dashed var(--border)",
        }}
      >
        No invites yet
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {invites.map((invite) => (
        <div
          key={invite.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "12px 16px",
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Email */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                color: "var(--text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {invite.email}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--text-dim)",
                marginTop: "3px",
                letterSpacing: "0.08em",
              }}
            >
              {invite.createdAt.toLocaleDateString()}
            </div>
          </div>

          {/* Role */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--cyan)",
              minWidth: "52px",
              textAlign: "right",
            }}
          >
            {invite.role}
          </div>

          {/* Status badge */}
          <Badge variant={statusBadgeVariant(invite.status)}>
            {statusLabel(invite.status)}
          </Badge>

          {/* Revoke button — only for pending */}
          <div style={{ minWidth: "72px", textAlign: "right" }}>
            {invite.status === "pending" ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={revoking === invite.id}
                onClick={() => handleRevoke(invite.id)}
                style={{ fontSize: "10px", padding: "4px 10px" }}
              >
                {revoking === invite.id ? "..." : "Revoke"}
              </Button>
            ) : (
              <span style={{ display: "inline-block", width: "72px" }} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default InviteList;
