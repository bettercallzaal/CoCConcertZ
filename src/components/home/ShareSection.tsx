"use client";

import { useMemo, useState } from "react";

const SHARE = {
  url: "https://cocconcertz.com",
  rsvp: "https://luma.com/njzxpsgn",
  flyer: "https://cocconcertz.com/images/coc-banner-dark.jpeg",
  text:
    "COC Concertz #6: Live from Zambia. First international showcase — Zambian artists curated by Iman, hosted in Stilo World.\n\nSat Jun 13, 4PM EST. Free RSVP:",
  channelKey: "cocconcertz",
};

function buildFarcaster(): string {
  const text = `${SHARE.text} ${SHARE.rsvp}`;
  const params = new URLSearchParams({ text, channelKey: SHARE.channelKey });
  // Warpcast supports multiple embeds[] params - flyer + RSVP
  return `https://warpcast.com/~/compose?${params.toString()}&embeds[]=${encodeURIComponent(SHARE.rsvp)}&embeds[]=${encodeURIComponent(SHARE.flyer)}`;
}

function buildX(): string {
  const text = `${SHARE.text}`;
  const params = new URLSearchParams({ text, url: SHARE.rsvp });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

function buildTelegram(): string {
  const params = new URLSearchParams({ url: SHARE.rsvp, text: SHARE.text });
  return `https://t.me/share/url?${params.toString()}`;
}

export default function ShareSection() {
  const [copied, setCopied] = useState(false);

  const farcasterHref = useMemo(buildFarcaster, []);
  const xHref = useMemo(buildX, []);
  const telegramHref = useMemo(buildTelegram, []);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(`${SHARE.text} ${SHARE.rsvp}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <section className="share-section reveal" aria-label="Share">
      <span className="section-label">Spread the Word</span>
      <h2>SHARE THE SHOW</h2>
      <p>Help us pack StiloWorld for the Zambia showcase. One click, share everywhere.</p>

      <pre
        style={{
          background: "rgba(255,214,0,0.04)",
          border: "1px solid rgba(255,214,0,0.2)",
          padding: "16px 18px",
          margin: "20px auto 24px",
          maxWidth: 640,
          textAlign: "left",
          fontFamily: "var(--font-mono)",
          fontSize: "0.85rem",
          lineHeight: 1.55,
          color: "var(--text)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          clipPath:
            "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
        }}
      >
        {`${SHARE.text} ${SHARE.rsvp}`}
      </pre>

      <a
        className="share-btn-hero"
        id="shareFarcaster"
        href={farcasterHref}
        target="_blank"
        rel="noopener"
      >
        CAST ON FARCASTER
      </a>
      <div className="share-secondary">
        <a className="share-btn" href={xHref} target="_blank" rel="noopener">
          POST ON X
        </a>
        <a className="share-btn" href={telegramHref} target="_blank" rel="noopener">
          TELEGRAM
        </a>
        <button className="share-btn" type="button" onClick={handleCopy}>
          {copied ? "COPIED" : "COPY POST"}
        </button>
      </div>
      <div className={`share-copied${copied ? " visible" : ""}`}>POST COPIED!</div>
    </section>
  );
}
