"use client";

import { useState, useEffect, useRef } from "react";

export default function StickyNav() {
  const [visible, setVisible] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    heroRef.current = document.querySelector(".hero");
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setVisible(!entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <a
        href="#"
        className={`nav-logo${visible ? " visible" : ""}`}
        aria-label="COC Concertz — back to top"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/coc-concertz-logo.jpeg" alt="COC Concertz" loading="eager" />
      </a>
      <a
        href="/brand"
        className={`nav-brand-link${visible ? " visible" : ""}`}
        aria-label="COC Concertz brand kit"
      >
        Brand Kit
      </a>
      <style>{`
        .nav-brand-link {
          position: fixed;
          top: 22px;
          right: 22px;
          z-index: 950;
          padding: 8px 14px;
          background: rgba(5,5,5,0.85);
          border: 1px solid rgba(255,214,0,0.3);
          color: var(--yellow);
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          text-decoration: none;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          backdrop-filter: blur(6px);
        }
        .nav-brand-link.visible {
          opacity: 1;
          pointer-events: auto;
        }
        .nav-brand-link:hover {
          background: var(--yellow);
          color: #000;
          border-color: var(--yellow);
        }
        @media (max-width: 768px) {
          .nav-brand-link { top: 16px; right: 16px; padding: 6px 10px; font-size: 0.6rem; }
        }
      `}</style>
    </>
  );
}
