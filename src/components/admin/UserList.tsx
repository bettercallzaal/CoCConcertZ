"use client";

import React, { useState } from "react";
import { updateUserRole } from "@/lib/db";
import type { User, UserRole } from "@/lib/types";
import { Badge } from "@/components/ui";

interface UserListProps {
  users: User[];
  currentUserId: string;
  onRoleChanged?: () => void;
}

const ROLES: UserRole[] = ["fan", "artist", "admin"];

const selectStyle: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  padding: "5px 10px",
  outline: "none",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
};

export function UserList({ users, currentUserId, onRoleChanged }: UserListProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleRoleChange(uid: string, newRole: UserRole) {
    setUpdating(uid);
    try {
      await updateUserRole(uid, newRole);
      onRoleChanged?.();
    } catch (err) {
      // silently handled — caller will see stale data until next refresh
    } finally {
      setUpdating(null);
    }
  }

  if (users.length === 0) {
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
        No users found
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {users.map((u) => {
        const isCurrentUser = u.uid === currentUserId;
        const isUpdating = updating === u.uid;

        return (
          <div
            key={u.uid}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "12px 16px",
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--border)",
                flexShrink: 0,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {u.photoURL ? (
                <img
                  src={u.photoURL}
                  alt={u.displayName || u.email}
                  width={36}
                  height={36}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                  }}
                >
                  {(u.displayName || u.email || "?")[0]}
                </span>
              )}
            </div>

            {/* Name + email */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {u.displayName || "—"}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-dim)",
                  marginTop: "2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {u.email}
              </div>
            </div>

            {/* Role control or "You" badge */}
            {isCurrentUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "var(--text-dim)",
                  }}
                >
                  {u.role}
                </span>
                <Badge variant="default" style={{ fontSize: "9px" }}>
                  You
                </Badge>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <select
                  value={u.role}
                  disabled={isUpdating}
                  onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                  style={{
                    ...selectStyle,
                    opacity: isUpdating ? 0.4 : 1,
                    cursor: isUpdating ? "not-allowed" : "pointer",
                  }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default UserList;
