"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FileUpload, Button, Input } from "@/components/ui";

interface ContestEntry {
  id: string;
  url: string;
  name: string;
  handle?: string;
  winner?: boolean;
  createdAt: Date;
}

const DEADLINE = new Date("2026-07-11T03:59:00Z"); // Fri Jul 10, 11:59 PM EST

function useCountdown(target: Date) {
  const [left, setLeft] = useState({ d: "--", h: "--", m: "--", closed: false });

  useEffect(() => {
    function update() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setLeft({ d: "0", h: "0", m: "0", closed: true });
        return;
      }
      setLeft({
        d: String(Math.floor(diff / 86400000)),
        h: String(Math.floor((diff % 86400000) / 3600000)),
        m: String(Math.floor((diff % 3600000) / 60000)),
        closed: false,
      });
    }
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [target]);

  return left;
}

export default function ThumbnailContest() {
  const [entries, setEntries] = useState<ContestEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [artistName, setArtistName] = useState("");
  const [handle, setHandle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const countdown = useCountdown(DEADLINE);

  const fetchEntries = useCallback(async () => {
    try {
      const q = query(
        collection(db, "contestEntries"),
        orderBy("createdAt", "desc"),
        limit(60)
      );
      const snapshot = await getDocs(q);
      const fetched: ContestEntry[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          url: data.url as string,
          name: data.name as string,
          handle: data.handle as string | undefined,
          winner: data.winner as boolean | undefined,
          createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
        };
      });
      // Winner first, then newest
      fetched.sort((a, b) => Number(b.winner ?? false) - Number(a.winner ?? false));
      setEntries(fetched);
    } catch (err) {
      console.error("Failed to load contest entries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    try {
      const stored = localStorage.getItem("coc_fan_name");
      if (stored) setArtistName(stored);
    } catch {
      // ignore
    }
  }, [fetchEntries]);

  const handleSubmit = async () => {
    if (!file) {
      setSubmitError("Please select your artwork file.");
      return;
    }
    if (!artistName.trim()) {
      setSubmitError("Please enter your name so we can credit you.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "coc-concertz/contest-coc7");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();

      await addDoc(collection(db, "contestEntries"), {
        url,
        name: artistName.trim(),
        handle: handle.trim() || null,
        createdAt: serverTimestamp(),
      });

      try {
        localStorage.setItem("coc_fan_name", artistName.trim());
      } catch {
        // ignore
      }

      setSubmitSuccess(true);
      setFile(null);
      await fetchEntries();
    } catch (err) {
      console.error("Contest submit error:", err);
      setSubmitError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Countdown */}
      <div
        className="clip-corner"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          border: `1px solid ${countdown.closed ? "var(--border)" : "var(--yellow)"}`,
          background: "var(--card)",
          padding: "18px 24px",
          marginBottom: "48px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: countdown.closed ? "var(--text-dim)" : "var(--cyan)",
          }}
        >
          {countdown.closed
            ? "Submissions closed — winner announced at COC #7 (Jul 18, 2026)"
            : "Submissions close Fri July 10, 11:59 PM EST"}
        </span>
        {!countdown.closed && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--yellow)",
              letterSpacing: "0.1em",
            }}
          >
            {countdown.d}D : {countdown.h}H : {countdown.m}M
          </span>
        )}
      </div>

      {/* Submit form */}
      {!countdown.closed && (
        <div
          className="clip-corner"
          style={{
            border: "1px solid var(--border)",
            background: "var(--card)",
            padding: "28px 24px",
            marginBottom: "56px",
            maxWidth: "560px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--yellow)",
              marginBottom: "20px",
            }}
          >
            Submit Your Design
          </h3>

          {submitSuccess ? (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--cyan)",
                padding: "16px 0",
              }}
            >
              Submitted. Your design is in the grid below. Good luck!
              <div style={{ marginTop: "14px" }}>
                <Button variant="outline" onClick={() => setSubmitSuccess(false)}>
                  Submit Another
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <Input
                label="Your Name"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="How should we credit you?"
              />
              <Input
                label="Social Handle (optional)"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@yourhandle - Farcaster, X, or IG"
              />
              <FileUpload
                label="Your Artwork"
                accept="image/*"
                onUpload={(f) => setFile(f)}
              />

              {submitError && (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "#ef4444",
                    padding: "10px 14px",
                    border: "1px solid rgba(239,68,68,0.3)",
                    background: "rgba(239,68,68,0.06)",
                  }}
                >
                  {submitError}
                </div>
              )}

              <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Uploading..." : "Enter the Contest"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Entries grid */}
      <div style={{ marginBottom: "16px" }}>
        <span className="section-label">Entries</span>
        <h2>SUBMISSIONS</h2>
      </div>

      {loading ? (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            padding: "40px 0",
            textAlign: "center",
          }}
        >
          Loading entries...
        </div>
      ) : entries.length === 0 ? (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            padding: "60px 0",
            textAlign: "center",
            border: "1px dashed var(--border)",
          }}
        >
          No entries yet - be the first to submit.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "12px",
          }}
        >
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="clip-corner"
              style={{
                position: "relative",
                overflow: "hidden",
                background: "var(--card)",
                border: `1px solid ${entry.winner ? "var(--yellow)" : "var(--border)"}`,
                aspectRatio: "1 / 1",
                boxShadow: entry.winner ? "0 0 20px rgba(255,214,0,0.25)" : "none",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.url}
                alt={`Contest entry by ${entry.name}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {entry.winner && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    background: "var(--yellow)",
                    color: "#000",
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    padding: "4px 10px",
                  }}
                >
                  Official Flyer
                </div>
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                  padding: "24px 10px 10px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "var(--yellow)",
                  }}
                >
                  {entry.name}
                </div>
                {entry.handle && (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {entry.handle}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
