"use client";

import { useState } from "react";

interface Props {
  name: string;
  hex: string;
  rgb: string;
  role: string;
}

export default function CopyableSwatch({ name, hex, rgb, role }: Props) {
  const [copied, setCopied] = useState<"hex" | "rgb" | null>(null);

  function copy(text: string, kind: "hex" | "rgb") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(kind);
      setTimeout(() => setCopied(null), 1200);
    });
  }

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        clipPath:
          "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
        overflow: "hidden",
      }}
    >
      <div style={{ height: 140, background: hex, borderBottom: "1px solid var(--border)" }} />
      <div style={{ padding: "16px 18px" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.1rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "var(--yellow)",
            marginBottom: 4,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "var(--text-dim)",
            marginBottom: 12,
          }}
        >
          {role}
        </div>
        <button
          onClick={() => copy(hex, "hex")}
          style={{
            display: "block",
            width: "100%",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text)",
            padding: "8px 10px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
            letterSpacing: "1px",
            textAlign: "left",
            cursor: "pointer",
            marginBottom: 6,
          }}
        >
          {copied === "hex" ? "COPIED" : hex}
        </button>
        <button
          onClick={() => copy(rgb, "rgb")}
          style={{
            display: "block",
            width: "100%",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-dim)",
            padding: "8px 10px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            letterSpacing: "1px",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          {copied === "rgb" ? "COPIED" : rgb}
        </button>
      </div>
    </div>
  );
}
