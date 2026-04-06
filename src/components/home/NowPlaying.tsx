"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface NowPlayingData {
  songTitle: string;
  artistName: string;
  timestamp: unknown;
}

export default function NowPlaying() {
  const [data, setData] = useState<NowPlayingData | null>(null);
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "live", "nowPlaying"), (snap) => {
      if (snap.exists()) {
        const d = snap.data() as NowPlayingData;
        if (d.songTitle && d.artistName) {
          setData(d);
          setVisible(true);
          // Trigger slide-up animation
          setAnimateIn(false);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setAnimateIn(true));
          });
          return;
        }
      }
      // No data or cleared
      setAnimateIn(false);
      setTimeout(() => {
        setVisible(false);
        setData(null);
      }, 400);
    });

    return () => unsub();
  }, []);

  if (!visible || !data) return null;

  return (
    <>
      <style>{`
        @keyframes nowPlayingSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes nowPlayingSlideDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }
        @keyframes eqBar1 {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        @keyframes eqBar2 {
          0%, 100% { height: 12px; }
          50% { height: 6px; }
        }
        @keyframes eqBar3 {
          0%, 100% { height: 8px; }
          50% { height: 18px; }
        }
        @keyframes eqBar4 {
          0%, 100% { height: 14px; }
          50% { height: 4px; }
        }
        @keyframes nowPlayingGlow {
          0%, 100% { box-shadow: 0 -2px 20px rgba(234,179,8,0.3); }
          50% { box-shadow: 0 -2px 30px rgba(234,179,8,0.5); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9998,
          background: "rgba(10, 10, 10, 0.95)",
          borderTop: "2px solid var(--yellow, #eab308)",
          backdropFilter: "blur(12px)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          animation: animateIn
            ? "nowPlayingSlideUp 0.4s ease-out forwards, nowPlayingGlow 2s ease-in-out infinite"
            : "nowPlayingSlideDown 0.4s ease-in forwards",
        }}
      >
        {/* Equalizer bars */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "3px",
            height: "20px",
            flexShrink: 0,
          }}
        >
          {[
            { anim: "eqBar1", delay: "0s" },
            { anim: "eqBar2", delay: "0.2s" },
            { anim: "eqBar3", delay: "0.1s" },
            { anim: "eqBar4", delay: "0.3s" },
          ].map((bar, i) => (
            <div
              key={i}
              style={{
                width: "3px",
                background: "var(--yellow, #eab308)",
                borderRadius: "1px",
                animation: `${bar.anim} 0.6s ease-in-out ${bar.delay} infinite`,
                height: "8px",
              }}
            />
          ))}
        </div>

        {/* Now Playing label */}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "var(--yellow, #eab308)",
            flexShrink: 0,
            background: "rgba(234,179,8,0.1)",
            padding: "3px 8px",
            border: "1px solid rgba(234,179,8,0.3)",
          }}
        >
          NOW PLAYING
        </span>

        {/* Song info */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "8px",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "15px",
              fontWeight: 800,
              color: "var(--text, #fff)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {data.songTitle}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--cyan, #00ffff)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {data.artistName}
          </span>
        </div>
      </div>
    </>
  );
}
