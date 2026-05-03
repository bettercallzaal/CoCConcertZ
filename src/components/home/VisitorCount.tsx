"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

// Increment/decrement go through /api/stats/visit (Admin SDK) so the
// client never writes to Firestore directly. This lets firestore.rules
// keep `stats` read-only for clients (eliminates the abuse vector where
// anyone could spam the increment from the browser).
export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);
  const decrementedRef = useRef(false);

  useEffect(() => {
    const statsRef = doc(db, "stats", "visitors");

    async function incrementVisitor() {
      try {
        await fetch("/api/stats/visit", { method: "POST", keepalive: true });
      } catch {
        // Silently fail — non-critical UI
      }
    }

    function decrementVisitor() {
      if (decrementedRef.current) return;
      decrementedRef.current = true;
      try {
        // keepalive lets the request finish even after the page unloads.
        fetch("/api/stats/visit", { method: "DELETE", keepalive: true }).catch(
          () => {}
        );
      } catch {
        // Silently fail
      }
    }

    incrementVisitor();

    const unsubscribe = onSnapshot(
      statsRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const raw = typeof data?.count === "number" ? data.count : 0;
          setCount(Math.max(1, raw));
        }
      },
      () => {
        // Ignore snapshot errors silently
      }
    );

    function handleBeforeUnload() {
      decrementVisitor();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      unsubscribe();
      decrementVisitor();
    };
  }, []);

  if (count === null) return null;

  return (
    <div className="visitor-count" aria-label={`${count} people viewing this page now`}>
      <style>{`
        .visitor-count {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px 0;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 2px;
          color: var(--text-dim);
          text-transform: uppercase;
          user-select: none;
        }
        .visitor-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 6px var(--cyan), 0 0 12px rgba(0,240,255,0.4);
          animation: visitor-pulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes visitor-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.35);
            opacity: 0.65;
          }
        }
        .visitor-count-text {
          color: var(--text-dim);
          transition: color 0.3s ease;
        }
        .visitor-count-number {
          color: var(--cyan);
          font-weight: 700;
        }
      `}</style>
      <span className="visitor-dot" aria-hidden="true" />
      <span className="visitor-count-text">
        <span className="visitor-count-number">{count}</span>
        {" "}
        {count === 1 ? "person" : "people"} here now
      </span>
    </div>
  );
}
