"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Event, Artist } from "@/lib/types";
import { Button } from "@/components/ui";

interface Segment {
  filename: string;
  segmentId: string;
  segmentLabel: string;
  text: string;
}

interface GeneratedContent {
  segmentLabel: string;
  posts: {
    newsletter: string;
    x: string;
    farcaster: string;
    bluesky: string;
    telegram: string;
    discord: string;
  };
}

type Brand = "coc" | "zao" | "custom";
type OutputTab = "newsletter" | "x" | "farcaster" | "bluesky" | "telegram" | "discord";

const TAB_LABELS: { key: OutputTab; label: string }[] = [
  { key: "newsletter", label: "YouTube Desc" },
  { key: "x", label: "X" },
  { key: "farcaster", label: "Farcaster" },
  { key: "bluesky", label: "Bluesky" },
  { key: "telegram", label: "Telegram" },
  { key: "discord", label: "Discord" },
];

export default function ContentPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [results, setResults] = useState<GeneratedContent[]>([]);
  const [brand, setBrand] = useState<Brand>("coc");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [activeSegment, setActiveSegment] = useState(0);
  const [activeTab, setActiveTab] = useState<OutputTab>("newsletter");
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [evSnap, arSnap] = await Promise.all([
          getDocs(query(collection(db, "events"), orderBy("number", "desc"))),
          getDocs(query(collection(db, "artists"), orderBy("stageName", "asc"))),
        ]);
        setEvents(evSnap.docs.map((d) => ({ id: d.id, ...d.data(), date: d.data().date?.toDate?.() ?? new Date(), createdAt: d.data().createdAt?.toDate?.() ?? new Date(), updatedAt: d.data().updatedAt?.toDate?.() ?? new Date() }) as Event));
        setArtists(arSnap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() ?? new Date() }) as Artist));
      } catch { /* Firestore may not have events */ }
    }
    load();
  }, []);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const docxFiles = Array.from(files).filter((f) => f.name.endsWith(".docx") || f.name.endsWith(".txt"));
    if (!docxFiles.length) { setError("Upload .docx or .txt transcript files"); return; }

    setError("");
    const formData = new FormData();
    docxFiles.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/content/parse-transcript", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSegments(data.segments);
      setResults([]);
    } catch {
      setError("Failed to parse transcripts");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const generateAll = async () => {
    if (!segments.length) return;
    setGenerating(true);
    setError("");
    setResults([]);

    const generated: GeneratedContent[] = [];

    // Build artist context from all artists in Firestore
    const artistContext = artists.map((a) => {
      const lines = [`Artist: ${a.stageName}`];
      if (a.bio) lines.push(a.bio);
      const { twitter, farcaster, audius, spotify, youtube, website } = a.socialLinks;
      if (twitter) lines.push(`Twitter: ${twitter}`);
      if (farcaster) lines.push(`Farcaster: ${farcaster}`);
      if (audius) lines.push(`Audius: ${audius}`);
      if (spotify) lines.push(`Spotify: ${spotify}`);
      if (youtube) lines.push(`YouTube: ${youtube}`);
      if (website) lines.push(`Website: ${website}`);
      return lines.join("\n");
    }).join("\n\n---\n\n");

    // Build mention handles
    const mentionHandles: Record<string, Record<string, string>> = {};
    for (const a of artists) {
      const handles: Record<string, string> = {};
      if (a.socialLinks.twitter) handles.twitter = a.socialLinks.twitter;
      if (a.socialLinks.farcaster) handles.farcaster = a.socialLinks.farcaster;
      if (Object.keys(handles).length) mentionHandles[a.stageName] = handles;
    }

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      setProgress(`Generating ${i + 1}/${segments.length}: ${seg.segmentLabel}...`);

      try {
        const segmentType = seg.segmentLabel.toLowerCase() === "intro" ? "intro"
          : seg.segmentLabel.toLowerCase() === "outro" ? "outro"
          : "artist-set";

        const customPrompt = [
          `Segment type: ${segmentType}`,
          `Segment: ${seg.segmentLabel}`,
          `\nTRANSCRIPT:\n${seg.text}`,
        ].join("\n");

        const res = await fetch("/api/newsletter/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            template: "youtube-description",
            brand,
            customPrompt,
            artistContext: artistContext || undefined,
            mentionHandles: Object.keys(mentionHandles).length ? mentionHandles : undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          generated.push({ segmentLabel: seg.segmentLabel, posts: { newsletter: `Error: ${data.error}`, x: "", farcaster: "", bluesky: "", telegram: "", discord: "" } });
          continue;
        }

        generated.push({ segmentLabel: seg.segmentLabel, posts: data.posts });
      } catch {
        generated.push({ segmentLabel: seg.segmentLabel, posts: { newsletter: "Generation failed", x: "", farcaster: "", bluesky: "", telegram: "", discord: "" } });
      }
    }

    // Also generate full show description by combining all transcripts
    setProgress(`Generating full show description...`);
    try {
      const fullTranscript = segments.map((s) => `--- ${s.segmentLabel} ---\n${s.text}`).join("\n\n");
      const res = await fetch("/api/newsletter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: "youtube-description",
          brand,
          customPrompt: `Segment type: full-show\n\nFULL SHOW TRANSCRIPT (all segments combined):\n${fullTranscript}`,
          artistContext: artistContext || undefined,
          mentionHandles: Object.keys(mentionHandles).length ? mentionHandles : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        generated.unshift({ segmentLabel: "Full Show", posts: data.posts });
      }
    } catch { /* skip full show if it fails */ }

    setResults(generated);
    setActiveSegment(0);
    setGenerating(false);
    setProgress("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentResult = results[activeSegment];
  const currentText = currentResult?.posts?.[activeTab] || "";

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "48px", color: "var(--yellow)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
        Content Hub
      </h1>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-dim)", marginTop: "8px", marginBottom: "32px", lineHeight: 1.6 }}>
        Drop your transcript files. Get YouTube descriptions + social posts for every segment in one click.
      </p>

      {/* Step 1: Upload */}
      {!results.length && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? "var(--yellow)" : "var(--border)"}`,
              background: isDragging ? "rgba(255,221,0,0.04)" : "var(--card)",
              padding: "48px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-dim)" }}>
              Drop .docx or .txt transcript files here
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", opacity: 0.5 }}>
              e.g. cocconcertz4-seg1-intro.docx, cocconcertz4-seg2-jose.docx
            </span>
            <input ref={inputRef} type="file" multiple accept=".docx,.txt" onChange={(e) => e.target.files && handleFiles(e.target.files)} style={{ display: "none" }} />
          </div>

          {/* Segments parsed */}
          {segments.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-dim)", marginBottom: "12px" }}>
                {segments.length} segments detected
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                {segments.map((s) => (
                  <span key={s.segmentId} style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--yellow)", border: "1px solid var(--yellow)", padding: "4px 12px" }}>
                    {s.segmentLabel}
                  </span>
                ))}
              </div>

              {/* Brand selector */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {(["coc", "zao"] as Brand[]).map((b) => (
                  <button key={b} onClick={() => setBrand(b)} style={{
                    background: brand === b ? "rgba(255,221,0,0.1)" : "transparent",
                    border: `1px solid ${brand === b ? "var(--yellow)" : "var(--border)"}`,
                    color: brand === b ? "var(--yellow)" : "var(--text-dim)",
                    fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 16px", cursor: "pointer",
                  }}>
                    {b === "coc" ? "COC Concertz" : "The ZAO"}
                  </button>
                ))}
              </div>

              <Button variant="primary" size="lg" disabled={generating} onClick={generateAll} style={{ width: "100%" }}>
                {generating ? progress || "Generating..." : `Generate All (${segments.length} segments + Full Show)`}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Step 2: Results */}
      {results.length > 0 && (
        <>
          {/* Segment tabs */}
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "16px" }}>
            {results.map((r, i) => (
              <button key={i} onClick={() => { setActiveSegment(i); setCopied(false); }} style={{
                background: activeSegment === i ? "rgba(255,221,0,0.1)" : "var(--card)",
                border: `1px solid ${activeSegment === i ? "var(--yellow)" : "var(--border)"}`,
                color: activeSegment === i ? "var(--yellow)" : "var(--text-dim)",
                fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 600,
                padding: "8px 14px", cursor: "pointer",
              }}>
                {r.segmentLabel}
              </button>
            ))}
          </div>

          {/* Platform tabs */}
          <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
            {TAB_LABELS.map((t) => (
              <button key={t.key} onClick={() => { setActiveTab(t.key); setCopied(false); }} style={{
                background: activeTab === t.key ? "var(--yellow)" : "var(--card)",
                color: activeTab === t.key ? "#000" : "var(--text-dim)",
                border: "none",
                fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em",
                padding: "8px 14px", cursor: "pointer",
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ position: "relative" }}>
            <pre style={{
              fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text)",
              background: "var(--card)", border: "1px solid var(--border)",
              padding: "20px", whiteSpace: "pre-wrap", wordBreak: "break-word",
              lineHeight: 1.7, minHeight: "200px", maxHeight: "500px", overflowY: "auto",
            }}>
              {currentText || "No content generated for this tab."}
            </pre>

            {/* Copy + character count */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-dim)" }}>
                {currentText.length} chars {activeTab === "newsletter" && currentText.length > 5000 ? "(over YouTube 5000 limit!)" : ""}
                {activeTab === "x" && currentText.length > 280 ? "(over 280 limit!)" : ""}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => copyToClipboard(currentText)} style={{
                  background: copied ? "var(--yellow)" : "transparent",
                  color: copied ? "#000" : "var(--yellow)",
                  border: "1px solid var(--yellow)",
                  fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  padding: "6px 16px", cursor: "pointer",
                }}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Reset */}
          <button onClick={() => { setResults([]); setSegments([]); }} style={{
            background: "none", border: "1px solid var(--border)", color: "var(--text-dim)",
            fontFamily: "var(--font-mono)", fontSize: "11px", padding: "8px 16px",
            cursor: "pointer", marginTop: "24px",
          }}>
            Start Over
          </button>
        </>
      )}

      {error && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#ff4444", marginTop: "16px" }}>
          {error}
        </div>
      )}
    </div>
  );
}
