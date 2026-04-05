"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createInvite } from "@/lib/db";
import type { UserRole } from "@/lib/types";
import { Button, Input } from "@/components/ui";

interface InviteFormProps {
  onSuccess?: () => void;
}

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
  appearance: "none",
  WebkitAppearance: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "var(--text-dim)",
  marginBottom: "6px",
};

export function InviteForm({ onSuccess }: InviteFormProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("fan");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await createInvite({
        email: trimmed,
        role,
        invitedBy: user.uid,
        status: "pending",
      });
      setEmail("");
      setRole("fan");
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 1200);
    } catch (err) {
      setError("Failed to send invite. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <Input
        label="Email Address"
        type="email"
        placeholder="artist@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        disabled={submitting}
        autoFocus
      />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={labelStyle}>Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          disabled={submitting}
          style={selectStyle}
        >
          <option value="fan">Fan</option>
          <option value="artist">Artist</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={submitting}
        style={{ alignSelf: "flex-end" }}
      >
        {success ? "Sent!" : submitting ? "Sending..." : "Send Invite"}
      </Button>
    </form>
  );
}

export default InviteForm;
