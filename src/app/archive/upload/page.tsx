"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Event, Artist } from "@/lib/types";
import { TokenGate } from "@/components/archive/TokenGate";
import { ArchiveUploader } from "@/components/archive/ArchiveUploader";

export default function ArchiveUploadPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [success, setSuccess] = useState<{
    id: string;
    arweave_tx_id: string;
    gateway_url: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [evSnap, arSnap] = await Promise.all([
        getDocs(query(collection(db, "events"), orderBy("number", "desc"))),
        getDocs(collection(db, "artists")),
      ]);
      setEvents(evSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Event));
      setArtists(arSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Artist));
    };
    fetchData();
  }, []);

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 20px" }}>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "40px",
          color: "var(--yellow)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          margin: "0 0 8px 0",
        }}
      >
        Upload to Archive
      </h1>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-dim)",
          marginBottom: "32px",
          lineHeight: 1.6,
        }}
      >
        Permanently store content on Arweave. Funded by the COC Concertz community archive fund.
      </p>

      {success ? (
        <div
          style={{
            border: "1px solid var(--yellow)",
            background: "rgba(255,221,0,0.05)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              color: "var(--yellow)",
              margin: 0,
            }}
          >
            Archived Forever
          </h2>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)" }}>
            Transaction: ar://{success.arweave_tx_id}
          </div>
          <a
            href={success.gateway_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--yellow)",
            }}
          >
            View on Arweave →
          </a>
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button
              onClick={() => setSuccess(null)}
              style={{
                background: "var(--yellow)",
                color: "#000",
                border: "none",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              Upload Another
            </button>
            <a
              href="/archive"
              style={{
                border: "1px solid var(--yellow)",
                color: "var(--yellow)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                padding: "10px 20px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Browse Archive
            </a>
          </div>
        </div>
      ) : !walletAddress ? (
        <TokenGate onGatePass={setWalletAddress} />
      ) : (
        <ArchiveUploader
          walletAddress={walletAddress}
          events={events}
          artists={artists}
          onUploadComplete={setSuccess}
        />
      )}
    </div>
  );
}
