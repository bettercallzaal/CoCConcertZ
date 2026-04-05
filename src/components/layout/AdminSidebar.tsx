"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Events", href: "/admin/events" },
  { label: "Invites", href: "/admin/invites" },
  { label: "Users", href: "/admin/users" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <aside
      style={{
        width: "224px",
        minWidth: "224px",
        minHeight: "100vh",
        background: "var(--card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "14px",
            fontWeight: 900,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--yellow)",
            lineHeight: 1.2,
          }}
        >
          COC ConcertZ
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--text-dim)",
            marginTop: "4px",
          }}
        >
          Admin
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0" }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "10px 20px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                textDecoration: "none",
                color: isActive ? "var(--yellow)" : "var(--text-dim)",
                background: isActive ? "rgba(255, 221, 0, 0.06)" : "transparent",
                borderLeft: isActive
                  ? "3px solid var(--yellow)"
                  : "3px solid transparent",
                transition: "color 0.15s, background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--text)";
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "rgba(255,255,255,0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--text-dim)";
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "transparent";
                }
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user + sign out */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-dim)",
          }}
        >
          Admin
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
