"use client";

import { useState, useRef } from "react";
import { config } from "../../../concertz.config";

export default function VenueEmbed() {
  const [mode, setMode] = useState<"metaverse" | "stream">("metaverse");
  const [size, setSize] = useState(100);
  const [expanded, setExpanded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const metaverseSrc = config.venue.spatialEmbedUrl;
  const streamSrc = `https://player.twitch.tv/?channel=${config.venue.twitchChannel}&allowfullscreen=true&muted=false&parent=cocconcertz.com&parent=${typeof window !== "undefined" ? location.hostname : "localhost"}`;

  const currentSrc = mode === "metaverse" ? metaverseSrc : streamSrc;
  const currentTitle = mode === "metaverse" ? "COC Concertz virtual venue on Spatial" : "COC Concertz live stream on Twitch";

  return (
    <section className="venue-section" id="venue" aria-label="Virtual venue">
      <style>{`
        .venue-section {
          width: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
        }
        .venue-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          width: 100%;
          max-width: 1000px;
          flex-wrap: wrap;
          border-bottom: 1px solid var(--border);
        }
        .venue-toggle {
          display: flex;
          overflow: hidden;
        }
        .venue-toggle button {
          padding: 10px 24px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-dim);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .venue-toggle button:first-child { border-right: none; }
        .venue-toggle button.active {
          background: var(--yellow);
          color: #000;
          border-color: var(--yellow);
        }
        .venue-toggle button:hover:not(.active) {
          color: var(--cyan);
          border-color: var(--cyan);
        }
        .size-control {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .size-control label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .size-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 120px;
          height: 2px;
          background: var(--border);
          outline: none;
        }
        .size-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: var(--yellow);
          cursor: pointer;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
        .size-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: var(--yellow);
          cursor: pointer;
          border: none;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
        .venue-frame {
          width: 100%;
          position: relative;
          transition: height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .venue-frame iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        .venue-expand-btn {
          display: none;
          width: 100%;
          padding: 14px;
          background: var(--card);
          border: 1px solid var(--border);
          border-top: none;
          color: var(--cyan);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .venue-expand-btn:hover {
          background: rgba(0,240,255,0.05);
          color: var(--yellow);
        }
        @media (max-width: 768px) {
          .venue-controls {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 12px 16px;
          }
          .venue-toggle button { padding: 8px 18px; font-size: 0.7rem; }
          .size-slider { width: 100%; }
          .size-control { width: 100%; }
          .venue-frame { height: 30vh !important; }
          .venue-frame.expanded { height: 80vh !important; }
          .venue-expand-btn { display: block; }
        }
        @media (max-width: 380px) {
          .venue-frame { height: 25vh !important; }
          .venue-frame.expanded { height: 70vh !important; }
        }
      `}</style>

      <div className="venue-controls">
        <div className="venue-toggle">
          <button
            className={mode === "metaverse" ? "active" : ""}
            onClick={() => setMode("metaverse")}
          >
            Metaverse
          </button>
          <button
            className={mode === "stream" ? "active" : ""}
            onClick={() => setMode("stream")}
          >
            Stream
          </button>
        </div>
        <div className="size-control">
          <label>Size</label>
          <input
            type="range"
            className="size-slider"
            min={40}
            max={100}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </div>
      </div>

      <div
        className={`venue-frame${expanded ? " expanded" : ""}`}
        style={{ height: `${size}vh` }}
      >
        <iframe
          ref={iframeRef}
          src={currentSrc}
          allow="camera; microphone; fullscreen; autoplay; encrypted-media"
          allowFullScreen
          loading="lazy"
          title={currentTitle}
        />
      </div>

      <button
        className={`venue-expand-btn${expanded ? " expanded" : ""}`}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "TAP TO COLLAPSE" : "TAP TO EXPAND VENUE"}
      </button>
    </section>
  );
}
