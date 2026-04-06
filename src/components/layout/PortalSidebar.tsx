"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui";

const NAV_ITEMS = [
  { label: "Home", href: "/portal" },
  { label: "Profile", href: "/portal/profile" },
  { label: "Setlists", href: "/portal/sets" },
  { label: "Card Design", href: "/portal/card" },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const sidebarContent = (
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
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "14px",
              fontWeight: 900,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--cyan)",
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
            Artist Portal
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          className="sidebar-close-btn"
          aria-label="Close menu"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            color: "var(--text-dim)",
            display: "none",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0" }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                padding: "10px 20px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                textDecoration: "none",
                color: isActive ? "var(--cyan)" : "var(--text-dim)",
                background: isActive ? "rgba(0, 255, 255, 0.06)" : "transparent",
                borderLeft: isActive
                  ? "3px solid var(--cyan)"
                  : "3px solid transparent",
                transition: "color 0.15s, background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "rgba(255,255,255,0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-dim)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
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
          Artist Portal
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        onClick={() => setMobileOpen(true)}
        className="portal-hamburger"
        aria-label="Open menu"
        style={{
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 1000,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          width: "40px",
          height: "40px",
          display: "none",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          cursor: "pointer",
          padding: "0",
        }}
      >
        <span
          style={{
            display: "block",
            width: "18px",
            height: "2px",
            background: "var(--cyan)",
            borderRadius: "1px",
          }}
        />
        <span
          style={{
            display: "block",
            width: "18px",
            height: "2px",
            background: "var(--cyan)",
            borderRadius: "1px",
          }}
        />
        <span
          style={{
            display: "block",
            width: "18px",
            height: "2px",
            background: "var(--cyan)",
            borderRadius: "1px",
          }}
        />
      </button>

      {/* Desktop sidebar */}
      <div className="portal-sidebar-desktop">{sidebarContent}</div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="portal-sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 1001,
            display: "none",
          }}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`portal-sidebar-mobile${mobileOpen ? " open" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 1002,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          display: "none",
        }}
      >
        {sidebarContent}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .portal-hamburger {
            display: flex !important;
          }
          .portal-sidebar-desktop {
            display: none !important;
          }
          .portal-sidebar-mobile {
            display: block !important;
          }
          .portal-sidebar-backdrop {
            display: block !important;
          }
          .sidebar-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}

export default PortalSidebar;
