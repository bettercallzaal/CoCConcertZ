"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, increment, getDoc } from "firebase/firestore";

export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);
  const decrementedRef = useRef(false);

  useEffect(() => {
    const statsRef = doc(db, "stats", "visitors");

    // Increment on mount
    async function incrementVisitor() {
      try {
        const snap = await getDoc(statsRef);
        if (snap.exists()) {
          await setDoc(statsRef, { count: increment(1) }, { merge: true });
        } else {
          await setDoc(statsRef, { count: 1 });
        }
      } catch {
        // Silently fail — non-critical UI
      }
    }

    async function decrementVisitor() {
      if (decrementedRef.current) return;
      decrementedRef.current = true;
      try {
        await setDoc(statsRef, { count: increment(-1) }, { merge: true });
      } catch {
        // Silently fail
      }
    }

    incrementVisitor();

    // Listen for real-time count updates
    const unsubscribe = onSnapshot(
      statsRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const raw = typeof data?.count === "number" ? data.count : 0;
          setCount(Math.max(1, raw)); // always show at least 1 (the current user)
        }
      },
      () => {
        // Ignore snapshot errors silently
      }
    );

    // Decrement when navigating away
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

  // Don't render until we have a count
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
