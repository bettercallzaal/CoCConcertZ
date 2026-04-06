"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim();

    if (!isValidEmail(trimmed)) {
      setErrorMsg("Enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      // Check for duplicate
      const q = query(
        collection(db, "subscribers"),
        where("email", "==", trimmed.toLowerCase())
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setStatus("duplicate");
        return;
      }

      await addDoc(collection(db, "subscribers"), {
        email: trimmed.toLowerCase(),
        subscribedAt: serverTimestamp(),
      });

      setStatus("success");
      setEmail("");
    } catch {
      setErrorMsg("Something went wrong. Try again.");
      setStatus("error");
    }
  };

  return (
    <section style={{ padding: "60px 0" }}>
      {/* Section label */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "var(--yellow)",
          marginBottom: "16px",
          opacity: 0.7,
        }}
      >
        // STAY IN THE LOOP
      </div>

      {/* Heading */}
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(32px, 6vw, 56px)",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--text)",
          lineHeight: 1,
          margin: "0 0 16px",
        }}
      >
        GET NOTIFIED
      </h2>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          color: "var(--text-dim)",
          letterSpacing: "0.05em",
          marginBottom: "36px",
          maxWidth: "480px",
        }}
      >
        Drop your email to get notified about upcoming shows.
      </p>

      {/* Form / States */}
      {status === "success" ? (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "var(--yellow)",
            background: "rgba(255, 221, 0, 0.08)",
            border: "1px solid rgba(255, 221, 0, 0.3)",
            padding: "18px 24px",
            maxWidth: "520px",
            clipPath:
              "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          }}
        >
          YOU'RE IN — WE'LL HIT YOU UP BEFORE THE NEXT SHOW
        </div>
      ) : status === "duplicate" ? (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            letterSpacing: "0.1em",
            color: "var(--text-dim)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border)",
            padding: "16px 20px",
            maxWidth: "520px",
          }}
        >
          You're already on the list. We've got you.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "0",
            maxWidth: "520px",
            flexWrap: "wrap",
            rowGap: "12px",
          }}
        >
          {/* Email input */}
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") {
                setStatus("idle");
                setErrorMsg("");
              }
            }}
            placeholder="YOUR@EMAIL.COM"
            disabled={status === "loading"}
            style={{
              flex: 1,
              minWidth: "200px",
              background: "transparent",
              border: "1px solid var(--yellow)",
              borderRight: "none",
              padding: "14px 18px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text)",
              outline: "none",
              clipPath:
                "polygon(0 0, calc(100% - 0px) 0, 100% 0px, 100% 100%, 0 100%, 0 0)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "rgba(255,221,0,0.04)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          />

          {/* Subscribe button */}
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              background: "var(--yellow)",
              color: "var(--black)",
              border: "1px solid var(--yellow)",
              padding: "14px 24px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              cursor: status === "loading" ? "wait" : "pointer",
              whiteSpace: "nowrap",
              clipPath:
                "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              transition: "opacity 0.15s",
              opacity: status === "loading" ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (status !== "loading") {
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
              }
            }}
            onMouseLeave={(e) => {
              if (status !== "loading") {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              }
            }}
          >
            {status === "loading" ? "..." : "SUBSCRIBE"}
          </button>

          {/* Error message */}
          {status === "error" && errorMsg && (
            <div
              style={{
                width: "100%",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.1em",
                color: "#ff4d4d",
                marginTop: "4px",
              }}
            >
              {errorMsg}
            </div>
          )}
        </form>
      )}

      {/* Mobile: stack input above button */}
      <style>{`
        @media (max-width: 600px) {
          .email-signup-form input {
            border-right: 1px solid var(--yellow) !important;
          }
        }
      `}</style>
    </section>
  );
}
