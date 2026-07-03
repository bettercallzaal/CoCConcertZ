"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  limit,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Live community battle voting - COC's no-wallet take on the WaveWarZ format.
// Battle docs are admin-created (scripts/create-battle.ts); votes are one per
// browser session, enforced by using the session id as the vote doc id.

interface Battle {
  id: string;
  title: string;
  sideA: string;
  sideB: string;
  status: "live" | "closed";
  winner?: "a" | "b" | null;
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

export default function BattleVote() {
  const [battle, setBattle] = useState<Battle | null>(null);
  const [votesA, setVotesA] = useState(0);
  const [votesB, setVotesB] = useState(0);
  const [myVote, setMyVote] = useState<"a" | "b" | null>(null);
  const [voting, setVoting] = useState(false);

  // Subscribe to the active battle (live, or most recently closed with a winner)
  useEffect(() => {
    const q = query(
      collection(db, "battles"),
      where("status", "==", "live"),
      limit(1)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setBattle(null);
          return;
        }
        const d = snap.docs[0];
        const data = d.data();
        setBattle({
          id: d.id,
          title: data.title as string,
          sideA: data.sideA as string,
          sideB: data.sideB as string,
          status: data.status as "live" | "closed",
          winner: (data.winner as "a" | "b" | null) ?? null,
        });
      },
      () => setBattle(null)
    );
    return () => unsub();
  }, []);

  // Subscribe to votes for the active battle
  useEffect(() => {
    if (!battle) return;
    const unsub = onSnapshot(
      collection(db, "battles", battle.id, "votes"),
      (snap) => {
        let a = 0;
        let b = 0;
        const session = getSessionId();
        snap.forEach((v) => {
          const choice = v.data().choice;
          if (choice === "a") a += 1;
          else if (choice === "b") b += 1;
          if (v.id === session) setMyVote(choice as "a" | "b");
        });
        setVotesA(a);
        setVotesB(b);
      },
      () => {
        // votes unavailable - keep widget visible with zero counts
      }
    );
    return () => unsub();
  }, [battle?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!battle) return null;

  const total = votesA + votesB;
  const aPct = total === 0 ? 50 : Math.round((votesA / total) * 100);
  const bPct = 100 - aPct;

  const castVote = async (choice: "a" | "b") => {
    if (myVote || voting) return;
    setVoting(true);
    try {
      await setDoc(doc(db, "battles", battle.id, "votes", getSessionId()), {
        choice,
        createdAt: serverTimestamp(),
      });
      setMyVote(choice);
    } catch (err) {
      console.error("Vote failed:", err);
    } finally {
      setVoting(false);
    }
  };

  const sideStyle = (mine: boolean): React.CSSProperties => ({
    flex: 1,
    background: "transparent",
    border: `1px solid ${mine ? "var(--cyan)" : "var(--yellow)"}`,
    color: mine ? "var(--cyan)" : "var(--yellow)",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    padding: "14px 10px",
    cursor: myVote ? "default" : "pointer",
    opacity: myVote && !mine ? 0.45 : 1,
    transition: "all 0.15s",
  });

  return (
    <section
      className="reveal"
      aria-label="Live battle vote"
      style={{ margin: "60px auto 0", maxWidth: 720, padding: "0 24px" }}
    >
      <div
        className="clip-corner"
        style={{
          border: "1px solid var(--yellow)",
          background: "var(--card)",
          boxShadow: "0 0 24px rgba(255,214,0,0.12)",
          padding: "26px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#000",
              background: "var(--yellow)",
              padding: "3px 8px",
            }}
          >
            Live Battle
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            {total} vote{total === 1 ? "" : "s"}
          </span>
        </div>

        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(20px, 3.5vw, 28px)",
            letterSpacing: "0.04em",
            margin: "6px 0 18px",
          }}
        >
          {battle.title}
        </h3>

        {/* Split bar - PoolBar pattern from wavewarzapp */}
        <div
          style={{
            display: "flex",
            height: 10,
            overflow: "hidden",
            background: "var(--border)",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: `${aPct}%`,
              background: "var(--yellow)",
              transition: "width 0.4s ease",
            }}
          />
          <div
            style={{
              width: `${bPct}%`,
              background: "var(--cyan)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 700,
            marginBottom: "18px",
          }}
        >
          <span style={{ color: "var(--yellow)" }}>
            {battle.sideA} {aPct}%
          </span>
          <span style={{ color: "var(--cyan)" }}>
            {bPct}% {battle.sideB}
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="clip-corner"
            style={sideStyle(myVote === "a")}
            onClick={() => castVote("a")}
            disabled={!!myVote || voting}
          >
            {myVote === "a" ? "Your Vote" : `Vote ${battle.sideA}`}
          </button>
          <button
            className="clip-corner"
            style={sideStyle(myVote === "b")}
            onClick={() => castVote("b")}
            disabled={!!myVote || voting}
          >
            {myVote === "b" ? "Your Vote" : `Vote ${battle.sideB}`}
          </button>
        </div>

        {myVote && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginTop: "12px",
              textAlign: "center",
            }}
          >
            Vote locked - watch the bar move live
          </div>
        )}
      </div>
    </section>
  );
}
