"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUsers } from "@/lib/db";
import type { User } from "@/lib/types";
import { UserList } from "@/components/admin/UserList";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div style={{ padding: "32px 36px", maxWidth: "860px" }}>
      {/* Page header */}
      <div style={{ marginBottom: "32px" }}>
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
          Users
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
          Manage user roles
        </p>
      </div>

      {/* User list */}
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
        <UserList
          users={users}
          currentUserId={currentUser?.uid ?? ""}
          onRoleChanged={fetchUsers}
        />
      )}
    </div>
  );
}
