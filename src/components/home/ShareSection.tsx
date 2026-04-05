"use client";

import { useState } from "react";

export default function ShareSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      "Come check out COC Concertz #4 \u2014 live metaverse concert happening now! https://cocconcertz.com"
    ).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="share-section reveal" aria-label="Share">
      <span className="section-label">Spread the Word</span>
      <h2>SHARE THE SHOW</h2>
      <p>Invite the community — cast it on Farcaster or share anywhere.</p>
      <a
        className="share-btn-hero"
        id="shareFarcaster"
        href="https://warpcast.com/~/compose?text=Come+check+out+COC+Concertz+%234+%E2%80%94+live+metaverse+concert+happening+now!+%F0%9F%8E%B6&embeds[]=https://cocconcertz.com&channelKey=cocconcertz"
        target="_blank"
        rel="noopener"
      >
        CAST ON FARCASTER
      </a>
      <div className="share-secondary">
        <a
          className="share-btn"
          href="https://twitter.com/intent/tweet?text=Come+check+out+COC+Concertz+%234+%E2%80%94+live+metaverse+concert+happening+now!+%F0%9F%8E%B6&url=https://cocconcertz.com"
          target="_blank"
          rel="noopener"
        >
          X / Twitter
        </a>
        <button className="share-btn" type="button" onClick={handleCopy}>
          Copy Link
        </button>
      </div>
      <div className={`share-copied${copied ? " visible" : ""}`}>LINK COPIED!</div>
    </section>
  );
}
