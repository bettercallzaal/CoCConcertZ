"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface RecapData {
  eventName: string;
  eventDate: string; // ISO string
  visitorCount: number;
  chatMessages: number;
  artists: string[];
  generatedAt: string; // ISO string
}

const SHOW_FOR_DAYS = 7;

export default function ShowRecap() {
  const [recap, setRecap] = useState<(RecapData & { eventId: string }) | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Find the most recent completed event
        const q = query(
          collection(db, "events"),
          where("status", "==", "completed"),
          orderBy("date", "desc")
        );
        const snap = await getDocs(q);
        if (snap.empty) return;

        const latestEvent = snap.docs[0];
        const eventId = latestEvent.id;

        // Check if within SHOW_FOR_DAYS days
        const eventData = latestEvent.data();
        const eventDate: Date =
          eventData.date && typeof eventData.date.toDate === "function"
            ? eventData.date.toDate()
            : new Date(eventData.date);

        const daysSince = (Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > SHOW_FOR_DAYS) return;

        // Check for recap doc
        const recapSnap = await getDoc(doc(db, "recaps", eventId));
        if (!recapSnap.exists()) return;

        const recapRaw = recapSnap.data() as RecapData;
        setRecap({ ...recapRaw, eventId });
      } catch (err) {
        console.error("ShowRecap: failed to load", err);
      }
    }
    load();
  }, []);

  if (!recap) return null;

  function formatDate(isoStr: string) {
    try {
      return new Date(isoStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoStr;
    }
  }

  async function handleShare() {
    const artistList = recap!.artists.length > 0 ? recap!.artists.join(", ") : "various artists";
    const text = `COC ConcertZ Recap — ${recap!.eventName}\n📅 ${formatDate(recap!.eventDate)}\n👥 ${recap!.visitorCount} visitors · 💬 ${recap!.chatMessages} messages\n🎤 Performed: ${artistList}\n\nhttps://cocconcertz.com`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback — do nothing
    }
  }

  const eventLabel = recap.eventName.toUpperCase().replace(/^\+/, "");

  return (
    <section className="show-recap-section" aria-label="Post-show recap">
      <style>{`
        .show-recap-section {
          position: relative;
          z-index: 1;
          padding: 60px 20px;
          display: flex;
          justify-content: center;
        }
        .show-recap-card {
          position: relative;
          width: 100%;
          max-width: 720px;
          padding: 40px;
          background: linear-gradient(
            135deg,
            rgba(255, 214, 0, 0.07) 0%,
            rgba(0, 240, 255, 0.04) 50%,
            rgba(255, 0, 60, 0.04) 100%
          );
          border: 1px solid rgba(255, 214, 0, 0.25);
          overflow: hidden;
        }
        .show-recap-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--yellow), var(--cyan), var(--yellow));
          opacity: 0.6;
        }
        .show-recap-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,214,0,0.3), transparent);
        }

        /* Corner accents */
        .recap-corner-tl,
        .recap-corner-br {
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: var(--yellow);
          border-style: solid;
          opacity: 0.4;
        }
        .recap-corner-tl { top: 0; left: 0; border-width: 2px 0 0 2px; }
        .recap-corner-br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

        /* Header */
        .recap-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 5px;
          color: var(--cyan);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .recap-eyebrow-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(0,240,255,0.3), transparent);
        }
        .recap-heading {
          font-family: var(--font-display);
          font-size: clamp(1.6rem, 4vw, 2.8rem);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: var(--yellow);
          margin-bottom: 8px;
          line-height: 1;
        }
        .recap-date {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-dim);
          letter-spacing: 2px;
          margin-bottom: 32px;
        }

        /* Stats row */
        .recap-stats {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 32px;
          padding: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
        }
        .recap-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 100px;
        }
        .recap-stat-value {
          font-family: var(--font-mono);
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 700;
          color: var(--yellow);
          line-height: 1;
        }
        .recap-stat-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: var(--text-dim);
        }

        /* Divider */
        .recap-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border), transparent);
          margin-bottom: 24px;
        }

        /* Artists */
        .recap-artists-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 4px;
          color: var(--text-dim);
          margin-bottom: 12px;
        }
        .recap-artists-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 32px;
        }
        .recap-artist-tag {
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--cyan);
          padding: 6px 14px;
          border: 1px solid rgba(0,240,255,0.3);
          background: rgba(0,240,255,0.05);
        }

        /* Share button */
        .recap-share-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: transparent;
          border: 1px solid var(--yellow);
          color: var(--yellow);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 3px;
          cursor: pointer;
          transition: all 0.2s;
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
        }
        .recap-share-btn:hover {
          background: rgba(255,214,0,0.1);
          transform: translate(-1px, -1px);
          box-shadow: 2px 2px 0 rgba(255,214,0,0.3);
        }
        .recap-share-btn.copied {
          border-color: var(--cyan);
          color: var(--cyan);
          background: rgba(0,240,255,0.08);
        }

        @media (max-width: 768px) {
          .show-recap-section { padding: 40px 16px; }
          .show-recap-card { padding: 28px 20px; }
          .recap-stats { gap: 16px; padding: 16px; }
        }
      `}</style>

      <div className="show-recap-card">
        {/* Corner accents */}
        <div className="recap-corner-tl" />
        <div className="recap-corner-br" />

        {/* Eyebrow */}
        <div className="recap-eyebrow">
          <span>Post-Show Recap</span>
          <span className="recap-eyebrow-line" />
        </div>

        {/* Heading */}
        <h2 className="recap-heading">{eventLabel} Recap</h2>
        <p className="recap-date">{formatDate(recap.eventDate)}</p>

        {/* Stats */}
        <div className="recap-stats">
          <div className="recap-stat">
            <span className="recap-stat-value">{recap.visitorCount.toLocaleString()}</span>
            <span className="recap-stat-label">Visitors</span>
          </div>
          <div className="recap-stat">
            <span className="recap-stat-value">{recap.chatMessages.toLocaleString()}</span>
            <span className="recap-stat-label">Messages</span>
          </div>
          <div className="recap-stat">
            <span className="recap-stat-value">{recap.artists.length}</span>
            <span className="recap-stat-label">Artists Performed</span>
          </div>
        </div>

        <div className="recap-divider" />

        {/* Artists */}
        {recap.artists.length > 0 && (
          <>
            <p className="recap-artists-label">Lineup</p>
            <div className="recap-artists-list">
              {recap.artists.map((name) => (
                <span key={name} className="recap-artist-tag">{name}</span>
              ))}
            </div>
          </>
        )}

        {/* Share */}
        <button
          className={`recap-share-btn${copied ? " copied" : ""}`}
          onClick={handleShare}
        >
          <span>{copied ? "Copied!" : "Share Recap"}</span>
        </button>
      </div>
    </section>
  );
}
