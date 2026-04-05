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
    <a
      href="#"
      className={`nav-logo${visible ? " visible" : ""}`}
      aria-label="COC Concertz — back to top"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/coc-concertz-logo.jpeg" alt="COC Concertz" loading="eager" />
    </a>
  );
}
