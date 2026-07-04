"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getEvents } from "@/lib/db";
import { Input, Button } from "@/components/ui";

// Free attendance badge - the first-session action mechanic from ZAOOS doc 960
// (claimers showed ~2x week-1 retention in comparable mini apps). No wallet,
// no login: one claim per browser session, doc id = `${eventNumber}-${sessionId}`.
// Claimable while the show is live and for 7 days after (the recap window).
// Tier upgrades to "voter" automatically if this session voted in a battle.

const CLAIM_WINDOW_DAYS = 7;

interface ClaimableEvent {
  number: number;
  name: string;
  live: boolean;
}

function getSessionId(): string {
  try {
    let id = localStorage.getItem("coc_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("coc_session_id", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export default function BadgeClaim() {
  const [event, setEvent] = useState<ClaimableEvent | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [claimCount, setClaimCount] = useState(0);
  const [name, setName] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find the claimable event: live now, or completed within the last 7 days
  useEffect(() => {
    getEvents()
      .then((events) => {
        const now = Date.now();
        const windowMs = CLAIM_WINDOW_DAYS * 86400000;
        const candidate = events.find(
          (e) =>
            e.status === "live" ||
            (e.status === "completed" &&
              now - e.date.getTime() < windowMs &&
              e.date.getTime() < now)
        );
        if (candidate) {
          setEvent({
            number: candidate.number,
            name: candidate.name,
            live: candidate.status === "live",
          });
        }
      })
      .catch(() => {
        // Firestore unavailable - render nothing
      });

    try {
      const stored = localStorage.getItem("coc_fan_name");
      if (stored) setName(stored);
    } catch {
      // ignore
    }
  }, []);

  // Live claim count + own-claim detection
  useEffect(() => {
    if (!event) return;
    const q = query(
      collection(db, "badgeClaims"),
      where("eventNumber", "==", event.number)
    );
    const session = getSessionId();
    const unsub = onSnapshot(
      q,
      (snap) => {
        setClaimCount(snap.size);
        setClaimed(snap.docs.some((d) => d.id === `${event.number}-${session}`));
      },
      () => {
        // keep zero count on error
      }
    );
    return () => unsub();
  }, [event]);

  if (!event) return null;

  const claim = async () => {
    if (claimed || claiming) return;
    setClaiming(true);
    setError(null);
    try {
      const session = getSessionId();
      // Voter tier if this session voted in any battle it remembers
      let tier: "visitor" | "voter" = "visitor";
      try {
        if (localStorage.getItem("coc_voted")) tier = "voter";
      } catch {
        // ignore
      }
      await setDoc(doc(db, "badgeClaims", `${event.number}-${session}`), {
        eventNumber: event.number,
        tier,
        name: name.trim() || null,
        createdAt: serverTimestamp(),
      });
      try {
        if (name.trim()) localStorage.setItem("coc_fan_name", name.trim());
      } catch {
        // ignore
      }
    } catch (err) {
      console.error("Badge claim failed:", err);
      setError("Claim failed. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <section
      className="reveal"
      aria-label="Attendance badge"
      style={{ margin: "60px auto 0", maxWidth: 720, padding: "0 24px" }}
    >
      <div
        className="clip-corner"
        style={{
          border: `1px solid ${claimed ? "var(--cyan)" : "var(--border)"}`,
          background: "var(--card)",
          padding: "26px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "var(--text-dim)",
            marginBottom: "8px",
          }}
        >
          {event.live ? "You are here - prove it" : "Were you there?"}
        </div>

        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(20px, 3.5vw, 26px)",
            letterSpacing: "0.04em",
            margin: "0 0 6px",
            color: "var(--yellow)",
          }}
        >
          COC #{event.number} ATTENDANCE BADGE
        </h3>

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-dim)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "18px",
          }}
        >
          {claimCount} claimed
        </div>

        {claimed ? (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--cyan)",
            }}
          >
            Badge claimed - you were part of it.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ minWidth: 220, textAlign: "left" }}>
              <Input
                label="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Who was in the crowd?"
              />
            </div>
            <Button variant="primary" onClick={claim} disabled={claiming}>
              {claiming ? "Claiming..." : "Claim Badge"}
            </Button>
          </div>
        )}

        {error && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "#ef4444",
              marginTop: "12px",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
