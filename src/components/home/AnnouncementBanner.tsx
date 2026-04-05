"use client";

import { useEffect, useState } from "react";
import { getEvents } from "@/lib/db";

const SESSION_KEY = "coc-announcement-dismissed";

export default function AnnouncementBanner() {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) {
      return;
    }

    getEvents()
      .then((events) => {
        // Prefer live event, then earliest upcoming
        const target =
          events.find((e) => e.status === "live") ??
          events
            .filter((e) => e.status === "upcoming")
            .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

        if (target?.announcement && target.announcement.trim()) {
          setMessage(target.announcement.trim());
          setVisible(true);
        }
      })
      .catch((err) => {
        console.warn("AnnouncementBanner: fetch failed", err);
      });
  }, []);

  function handleDismiss() {
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  }

  if (!visible || !message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#eab308",
        color: "#000",
        fontFamily: "var(--font-mono)",
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.05em",
        padding: "10px 56px 10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1.4,
        boxShadow: "0 2px 12px rgba(234,179,8,0.4)",
      }}
    >
      <span
        style={{
          display: "inline-block",
          marginRight: "10px",
          fontWeight: 900,
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          background: "#000",
          color: "#eab308",
          padding: "2px 6px",
        }}
      >
        Notice
      </span>
      {message}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        style={{
          position: "absolute",
          right: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#000",
          fontFamily: "var(--font-mono)",
          fontSize: "18px",
          fontWeight: 700,
          lineHeight: 1,
          padding: "4px 6px",
          opacity: 0.7,
        }}
      >
        ×
      </button>
    </div>
  );
}
