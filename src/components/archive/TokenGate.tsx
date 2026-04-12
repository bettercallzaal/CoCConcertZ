"use client";

import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

interface TokenGateProps {
  onGatePass: (walletAddress: string) => void;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  padding: "28px",
  background: "var(--card)",
  border: "1px solid var(--border)",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "22px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--yellow)",
  margin: 0,
};

const descStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text-dim)",
  lineHeight: 1.6,
  margin: 0,
};

const addressRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const addressStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text)",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--border)",
  padding: "6px 12px",
};

const disconnectStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--text-dim)",
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
  textDecoration: "underline",
  textDecorationColor: "var(--border)",
};

const actionBtnStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontWeight: 600,
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  cursor: "pointer",
  transition: "opacity 0.15s, background 0.15s",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 24px",
  border: "2px solid var(--yellow)",
  background: "var(--yellow)",
  color: "var(--black)",
  whiteSpace: "nowrap",
};

const actionBtnDisabledStyle: React.CSSProperties = {
  ...actionBtnStyle,
  opacity: 0.4,
  cursor: "not-allowed",
};

const errorBoxStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  color: "#ff4d4d",
  background: "rgba(255, 77, 77, 0.08)",
  border: "1px solid rgba(255, 77, 77, 0.3)",
  padding: "10px 14px",
  lineHeight: 1.5,
};

const statusStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  color: "var(--text-dim)",
  padding: "2px 0",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TokenGate({ onGatePass }: TokenGateProps) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    if (!address) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/archive/gate-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }

      const data = await res.json();

      if (data.eligible) {
        onGatePass(address);
      } else {
        const balance = data.balance ?? "0";
        const required = data.required ?? "100,000,000";
        setError(
          `Insufficient ZABAL balance. You hold ${Number(balance).toLocaleString()} ZABAL — ${Number(required).toLocaleString()} required.`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div>
        <h2 style={titleStyle}>Archive Access</h2>
      </div>

      <p style={descStyle}>
        Connect your wallet and hold 100M+ ZABAL on Base to upload to the permanent archive.
      </p>

      {/* Wallet state */}
      {!isConnected ? (
        <button
          type="button"
          style={actionBtnStyle}
          onClick={() => connect({ connector: injected() })}
        >
          Connect Wallet
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Connected address row */}
          <div style={addressRowStyle}>
            <span style={addressStyle}>{truncateAddress(address!)}</span>
            <button
              type="button"
              style={disconnectStyle}
              onClick={() => {
                disconnect();
                setError(null);
              }}
            >
              Disconnect
            </button>
          </div>

          {/* Verify button */}
          <button
            type="button"
            style={loading ? actionBtnDisabledStyle : actionBtnStyle}
            disabled={loading}
            onClick={handleVerify}
          >
            {loading ? "Verifying..." : "Verify ZABAL Balance"}
          </button>

          {/* Loading indicator */}
          {loading && (
            <p style={statusStyle}>Checking your ZABAL balance on Base...</p>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={errorBoxStyle}>{error}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default TokenGate;
