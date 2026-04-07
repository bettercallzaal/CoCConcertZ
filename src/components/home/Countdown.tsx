"use client";

import { useState, useEffect } from "react";

const upcomingShows = [
  { name: "+COC CONCERTZ #4", date: "2026-04-11T20:00:00Z", display: "April 11, 2026 \u00b7 4:00 PM EST" },
  { name: "+COC CONCERTZ #5", date: "2026-05-09T20:00:00Z", display: "May 9, 2026 \u00b7 4:00 PM EST" },
];

function getNextShow() {
  const now = new Date();
  for (const show of upcomingShows) {
    if (new Date(show.date) > now) return show;
  }
  return upcomingShows[upcomingShows.length - 1];
}

export default function Countdown() {
  const [nextShow] = useState(getNextShow);
  const [timeLeft, setTimeLeft] = useState({ d: "--", h: "--", m: "--", s: "--" });
  const [status, setStatus] = useState<"next" | "today" | "live">("next");
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const eventDate = new Date(nextShow.date);

    function update() {
      const now = new Date();
      const diff = eventDate.getTime() - now.getTime();
      const diffHours = diff / (1000 * 60 * 60);

      if (diff <= 0) {
        setIsLive(true);
        setStatus("live");
        return;
      }

      if (diffHours <= 24) {
        setStatus("today");
      } else {
        setStatus("next");
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        d: String(d).padStart(2, "0"),
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextShow]);

  return (
    <section className="next-show" aria-label="Next show countdown">
      <style>{`
        .next-show {
          position: relative;
          z-index: 1;
          padding: 60px 20px;
          text-align: center;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          overflow: hidden;
        }
        .next-show::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,214,0,0.06) 0%, rgba(0,240,255,0.03) 100%);
          pointer-events: none;
        }
        .next-show::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--yellow), var(--cyan), var(--yellow), transparent);
          animation: countdown-bar-sweep 3s ease-in-out infinite;
        }
        @keyframes countdown-bar-sweep {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .next-show-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 6px;
          color: var(--cyan);
          margin-bottom: 16px;
          display: inline-block;
          padding: 4px 16px;
          border: 1px solid rgba(0,240,255,0.3);
        }
        .next-show-live {
          display: inline-block;
          padding: 4px 16px;
          background: #ff003c;
          color: #fff;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 16px;
          animation: live-pulse 1.5s infinite;
        }
        @keyframes live-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .next-show h2 {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 6vw, 5rem);
          letter-spacing: 4px;
          margin-bottom: 8px;
          color: var(--yellow);
        }
        .show-date {
          font-family: var(--font-mono);
          color: var(--text-dim);
          font-size: 0.9rem;
          letter-spacing: 2px;
        }
        .countdown {
          display: flex;
          gap: 24px;
          justify-content: center;
          margin-top: 32px;
          flex-wrap: wrap;
        }
        .countdown-item {
          text-align: center;
          min-width: 80px;
        }
        .countdown-item .number {
          display: block;
          font-family: var(--font-mono);
          font-size: clamp(3rem, 6vw, 4.5rem);
          font-weight: 700;
          color: var(--yellow);
          line-height: 1;
          text-shadow: 0 0 30px rgba(255,214,0,0.3), 0 0 60px rgba(255,214,0,0.15);
          animation: countdown-glow 2s ease-in-out infinite alternate;
        }
        @keyframes countdown-glow {
          0% { text-shadow: 0 0 20px rgba(255,214,0,0.2), 0 0 40px rgba(255,214,0,0.1); }
          100% { text-shadow: 0 0 40px rgba(255,214,0,0.5), 0 0 80px rgba(255,214,0,0.2), 0 0 4px rgba(0,240,255,0.15); }
        }
        .countdown-item .label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 4px;
          color: var(--text-dim);
          margin-top: 8px;
        }
        .countdown-separator {
          font-family: var(--font-mono);
          font-size: 2.5rem;
          color: var(--text-dim);
          align-self: flex-start;
          padding-top: 4px;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        .live-cta {
          display: inline-block;
          padding: 18px 52px;
          background: var(--yellow);
          color: #000;
          text-decoration: none;
          font-family: var(--font-display);
          font-size: 1.4rem;
          letter-spacing: 3px;
          transition: all 0.2s;
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
          animation: rsvp-glow 1.5s ease-in-out infinite;
          margin-top: 32px;
        }
        .live-cta:hover {
          background: var(--cyan);
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0 var(--yellow);
        }
        @keyframes rsvp-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,214,0,0.2), 0 0 60px rgba(255,214,0,0.1); }
          50% { box-shadow: 0 0 30px rgba(255,214,0,0.4), 0 0 80px rgba(255,214,0,0.2), 0 0 4px rgba(0,240,255,0.2); }
        }
        .rsvp-btn {
          display: inline-block;
          padding: 20px 60px;
          background: var(--yellow);
          color: #000;
          text-decoration: none;
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-top: 40px;
          clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
          transition: all 0.25s ease;
          animation: rsvp-glow 1.5s ease-in-out infinite;
        }
        .rsvp-btn:hover {
          background: var(--cyan);
          transform: translate(-3px, -3px) scale(1.03);
          box-shadow: 6px 6px 0 var(--yellow);
        }
        @media (max-width: 768px) {
          .next-show { padding: 40px 16px; }
          .countdown { gap: 12px; }
          .countdown-item .number { font-size: 2rem; }
          .countdown-item { min-width: 60px; }
          .countdown-separator { font-size: 1.8rem; }
          .rsvp-btn { padding: 16px 40px; font-size: 1.2rem; letter-spacing: 3px; margin-top: 32px; }
        }
        @media (max-width: 380px) {
          .countdown { gap: 8px; }
          .countdown-item .number { font-size: 1.5rem; }
          .countdown-separator { font-size: 1.4rem; }
          .rsvp-btn { padding: 14px 32px; font-size: 1rem; letter-spacing: 2px; }
        }
      `}</style>

      {status === "live" || status === "today" ? (
        <div className="next-show-live">{status === "live" ? "LIVE NOW" : "TODAY"}</div>
      ) : (
        <div className="next-show-label">NEXT SHOW</div>
      )}

      <h2>{nextShow.name}</h2>
      <p className="show-date" dangerouslySetInnerHTML={{ __html: nextShow.display }} />

      {isLive ? (
        <a className="live-cta" href="#venue">JOIN LIVE NOW</a>
      ) : (
        <>
          <div className="countdown">
            <div className="countdown-item">
              <span className="number">{timeLeft.d}</span>
              <span className="label">Days</span>
            </div>
            <span className="countdown-separator">:</span>
            <div className="countdown-item">
              <span className="number">{timeLeft.h}</span>
              <span className="label">Hours</span>
            </div>
            <span className="countdown-separator">:</span>
            <div className="countdown-item">
              <span className="number">{timeLeft.m}</span>
              <span className="label">Min</span>
            </div>
            <span className="countdown-separator">:</span>
            <div className="countdown-item">
              <span className="number">{timeLeft.s}</span>
              <span className="label">Sec</span>
            </div>
          </div>
          <a className="rsvp-btn" href="https://luma.com/0ksej24k" target="_blank" rel="noopener">
            RSVP NOW — FREE
          </a>
        </>
      )}
    </section>
  );
}
