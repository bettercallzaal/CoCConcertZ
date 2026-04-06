"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Event } from "@/lib/types";

interface LiveEvent {
  id: string;
  name: string;
  flyerUrl?: string;
  bannerUrl?: string;
  venue: { spatialLink: string; streamLink?: string };
}

export default function LiveMode() {
  const [liveEvent, setLiveEvent] = useState<LiveEvent | null>(null);
  const [dismissed, setDismissed] = useState(true); // start true to avoid flash
  const [mounted, setMounted] = useState(false);

  // Check sessionStorage only after mount (client-side)
  useEffect(() => {
    setMounted(true);
    const wasDismissed = sessionStorage.getItem("liveModeOverlayDismissed") === "1";
    setDismissed(wasDismissed);
  }, []);

  // Listen for live events
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snap) => {
      const live = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Event & { id: string }))
        .find((e) => e.status === "live");

      if (live) {
        setLiveEvent({
          id: live.id,
          name: live.name,
          flyerUrl: live.flyerUrl,
          bannerUrl: live.bannerUrl,
          venue: live.venue,
        });
      } else {
        setLiveEvent(null);
      }
    });
    return () => unsub();
  }, []);

  // Toggle body.live-mode class whenever there's a live event
  useEffect(() => {
    if (liveEvent) {
      document.body.classList.add("live-mode");
    } else {
      document.body.classList.remove("live-mode");
    }
    return () => {
      document.body.classList.remove("live-mode");
    };
  }, [liveEvent]);

  function handleDismiss() {
    sessionStorage.setItem("liveModeOverlayDismissed", "1");
    setDismissed(true);
  }

  // Don't render anything server-side or before mount
  if (!mounted || !liveEvent) return null;

  const bgImage = liveEvent.bannerUrl || liveEvent.flyerUrl;

  return (
    <>
      <style>{`
        /* Body-level pulsing border glow when live */
        @keyframes live-border-pulse {
          0%, 100% {
            box-shadow:
              inset 0 0 0 3px rgba(255, 0, 60, 0.5),
              inset 0 0 60px rgba(255, 0, 60, 0.08),
              0 0 0 3px rgba(255, 214, 0, 0.3),
              0 0 60px rgba(255, 214, 0, 0.05);
          }
          50% {
            box-shadow:
              inset 0 0 0 3px rgba(255, 0, 60, 0.9),
              inset 0 0 80px rgba(255, 0, 60, 0.15),
              0 0 0 3px rgba(255, 214, 0, 0.6),
              0 0 80px rgba(255, 214, 0, 0.1);
          }
        }
        body.live-mode {
          animation: live-border-pulse 2s ease-in-out infinite;
        }

        /* Overlay */
        .livemode-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          animation: livemode-overlay-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes livemode-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Blurred background image */
        .livemode-bg {
          position: absolute;
          inset: -5%;
          background-size: cover;
          background-position: center;
          filter: blur(24px) brightness(0.25) saturate(1.4);
          transform: scale(1.05);
          z-index: 0;
        }
        .livemode-bg-fallback {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(255,0,60,0.15) 0%, rgba(255,214,0,0.05) 40%, #050505 70%);
          z-index: 0;
        }

        /* Red/yellow scanning line effect */
        .livemode-scan {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 0, 60, 0.03) 2px,
            rgba(255, 0, 60, 0.03) 4px
          );
          pointer-events: none;
        }

        /* Content */
        .livemode-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 48px 32px;
          max-width: 680px;
          width: 100%;
        }

        /* LIVE NOW badge */
        .livemode-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
          animation: livemode-badge-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        @keyframes livemode-badge-in {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .livemode-dot {
          width: 12px;
          height: 12px;
          background: #ff003c;
          border-radius: 50%;
          flex-shrink: 0;
          animation: livemode-dot-pulse 1s ease-in-out infinite;
        }
        @keyframes livemode-dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(255,0,60,0.6); }
          50% { opacity: 0.8; transform: scale(1.3); box-shadow: 0 0 0 8px rgba(255,0,60,0); }
        }
        .livemode-live-text {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 6px;
          color: #ff003c;
          animation: livemode-text-flicker 3s infinite;
        }
        @keyframes livemode-text-flicker {
          0%, 88%, 100% { opacity: 1; }
          89% { opacity: 0.4; }
          90% { opacity: 1; }
          92% { opacity: 0.6; }
          93% { opacity: 1; }
        }

        /* Big LIVE NOW heading */
        .livemode-heading {
          font-family: var(--font-display);
          font-size: clamp(3.5rem, 12vw, 8rem);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 4px;
          line-height: 0.9;
          margin-bottom: 24px;
          color: var(--yellow);
          text-shadow:
            0 0 40px rgba(255,214,0,0.6),
            0 0 80px rgba(255,214,0,0.3),
            0 0 120px rgba(255,214,0,0.15);
          animation:
            livemode-heading-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both,
            livemode-heading-pulse 2s ease-in-out 1s infinite;
        }
        @keyframes livemode-heading-in {
          from { opacity: 0; transform: scale(0.8); filter: blur(8px); }
          to { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes livemode-heading-pulse {
          0%, 100% {
            text-shadow:
              0 0 30px rgba(255,214,0,0.5),
              0 0 60px rgba(255,214,0,0.25);
          }
          50% {
            text-shadow:
              0 0 50px rgba(255,214,0,0.8),
              0 0 100px rgba(255,214,0,0.4),
              0 0 4px rgba(0,240,255,0.3);
          }
        }

        /* Event name */
        .livemode-event-name {
          font-family: var(--font-display);
          font-size: clamp(1.1rem, 3vw, 1.8rem);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 8px;
          color: var(--cyan);
          margin-bottom: 40px;
          animation: livemode-sub-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both;
        }
        @keyframes livemode-sub-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* CTA buttons */
        .livemode-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 32px;
          animation: livemode-sub-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
        }
        .livemode-btn-primary {
          display: inline-block;
          padding: 18px 44px;
          background: var(--yellow);
          color: #000;
          text-decoration: none;
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
          transition: all 0.2s;
          animation: livemode-btn-glow 1.8s ease-in-out infinite;
        }
        .livemode-btn-primary:hover {
          background: var(--cyan);
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0 var(--yellow);
        }
        @keyframes livemode-btn-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,214,0,0.3), 0 0 60px rgba(255,214,0,0.1); }
          50% { box-shadow: 0 0 30px rgba(255,214,0,0.55), 0 0 80px rgba(255,214,0,0.25); }
        }
        .livemode-btn-secondary {
          display: inline-block;
          padding: 18px 36px;
          background: transparent;
          color: var(--cyan);
          text-decoration: none;
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          border: 2px solid var(--cyan);
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
          transition: all 0.2s;
        }
        .livemode-btn-secondary:hover {
          background: rgba(0,240,255,0.1);
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0 var(--cyan);
        }

        /* Dismiss */
        .livemode-dismiss {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 4px;
          color: rgba(255,255,255,0.3);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px 16px;
          transition: color 0.2s;
          animation: livemode-sub-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both;
        }
        .livemode-dismiss:hover {
          color: rgba(255,255,255,0.7);
        }

        /* Border ring effect on overlay */
        .livemode-ring {
          position: absolute;
          inset: 12px;
          border: 1px solid rgba(255,0,60,0.25);
          pointer-events: none;
          z-index: 2;
          animation: livemode-ring-pulse 2s ease-in-out infinite;
        }
        .livemode-ring-outer {
          position: absolute;
          inset: 4px;
          border: 1px solid rgba(255,214,0,0.15);
          pointer-events: none;
          z-index: 2;
          animation: livemode-ring-pulse 2s ease-in-out 0.3s infinite;
        }
        @keyframes livemode-ring-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .livemode-content { padding: 32px 20px; }
          .livemode-btn-primary { padding: 14px 32px; font-size: 1rem; }
          .livemode-btn-secondary { padding: 14px 24px; font-size: 0.9rem; }
        }
      `}</style>

      {/* Full-screen overlay (only if not dismissed) */}
      {!dismissed && (
        <div className="livemode-overlay" role="dialog" aria-modal="true" aria-label="Live show in progress">
          {/* Background */}
          {bgImage ? (
            <div
              className="livemode-bg"
              style={{ backgroundImage: `url(${bgImage})` }}
            />
          ) : (
            <div className="livemode-bg-fallback" />
          )}

          {/* Scanlines */}
          <div className="livemode-scan" />

          {/* Border rings */}
          <div className="livemode-ring" />
          <div className="livemode-ring-outer" />

          {/* Content */}
          <div className="livemode-content">
            {/* Live badge */}
            <div className="livemode-badge">
              <div className="livemode-dot" />
              <span className="livemode-live-text">Live Now</span>
              <div className="livemode-dot" />
            </div>

            {/* Main heading */}
            <h1 className="livemode-heading">Live Now</h1>

            {/* Event name */}
            <p className="livemode-event-name">{liveEvent.name}</p>

            {/* CTAs */}
            <div className="livemode-buttons">
              <a
                href={liveEvent.venue.spatialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="livemode-btn-primary"
              >
                Enter Metaverse
              </a>
              {liveEvent.venue.streamLink && (
                <a
                  href={liveEvent.venue.streamLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="livemode-btn-secondary"
                >
                  Watch Stream
                </a>
              )}
            </div>

            {/* Dismiss */}
            <button className="livemode-dismiss" onClick={handleDismiss}>
              Dismiss &mdash; View Site
            </button>
          </div>
        </div>
      )}
    </>
  );
}
