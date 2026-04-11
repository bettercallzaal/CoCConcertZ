"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Event, Artist } from "@/lib/types";
import { TemplateSelector, type Template } from "@/components/newsletter/TemplateSelector";
import { TemplateInputs } from "@/components/newsletter/TemplateInputs";
import { ContentPreview, type GeneratedPosts } from "@/components/newsletter/ContentPreview";

type Brand = "coc" | "zao" | "custom";

const sectionLabel: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  color: "var(--text-dim)",
  marginBottom: "12px",
};

export default function NewsletterPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [brand, setBrand] = useState<Brand>("coc");
  const [customVoice, setCustomVoice] = useState("");
  const [template, setTemplate] = useState<Template | null>(null);
  const [generating, setGenerating] = useState(false);
  const [posts, setPosts] = useState<GeneratedPosts | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const evSnap = await getDocs(query(collection(db, "events"), orderBy("number", "desc")));
        setEvents(
          evSnap.docs.map((d) => {
            const data = d.data();
            return {
              ...data,
              id: d.id,
              date: data.date?.toDate?.() ?? new Date(),
              createdAt: data.createdAt?.toDate?.() ?? new Date(),
              updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
            } as Event;
          })
        );

        const arSnap = await getDocs(query(collection(db, "artists"), orderBy("stageName", "asc")));
        setArtists(
          arSnap.docs.map((d) => {
            const data = d.data();
            return {
              ...data,
              id: d.id,
              createdAt: data.createdAt?.toDate?.() ?? new Date(),
            } as Artist;
          })
        );
      } catch (e) {
        console.error("Failed to load data:", e);
      }
    }
    load();
  }, []);

  async function handleGenerate(inputs: {
    customPrompt?: string;
    artistContext?: string;
    eventContext?: string;
    mentionHandles?: Record<string, Record<string, string>>;
  }) {
    if (!template) return;
    setGenerating(true);
    setError("");
    setPosts(null);

    try {
      const res = await fetch("/api/newsletter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          brand,
          customVoice: brand === "custom" ? customVoice : undefined,
          ...inputs,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const data = await res.json();
      setPosts(data.posts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "48px",
          color: "var(--yellow)",
          marginBottom: "8px",
        }}
      >
        NEWSLETTER BUILDER
      </h1>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          color: "var(--text-dim)",
          marginBottom: "40px",
        }}
      >
        Generate content for all platforms in one click
      </p>

      {/* Brand Selector */}
      <div style={{ marginBottom: "32px" }}>
        <div style={sectionLabel}>Brand Voice</div>
        <div style={{ display: "flex", gap: "8px" }}>
          {(["coc", "zao", "custom"] as Brand[]).map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              style={{
                padding: "8px 20px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                background: brand === b ? "var(--yellow)" : "var(--card)",
                color: brand === b ? "var(--black)" : "var(--text-dim)",
                border: `1px solid ${brand === b ? "var(--yellow)" : "var(--border)"}`,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {b === "coc" ? "COC Concertz" : b === "zao" ? "The ZAO" : "Custom"}
            </button>
          ))}
        </div>
        {brand === "custom" && (
          <textarea
            placeholder="Describe the voice and tone you want..."
            value={customVoice}
            onChange={(e) => setCustomVoice(e.target.value)}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "12px",
              minHeight: "80px",
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              resize: "vertical",
            }}
          />
        )}
      </div>

      {/* Template Selector */}
      <div style={{ marginBottom: "32px" }}>
        <div style={sectionLabel}>Template</div>
        <TemplateSelector selected={template} onSelect={setTemplate} />
      </div>

      {/* Dynamic Inputs */}
      {template && (
        <div style={{ marginBottom: "32px" }}>
          <div style={sectionLabel}>Details</div>
          <TemplateInputs
            template={template}
            events={events}
            artists={artists}
            generating={generating}
            onGenerate={handleGenerate}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(255,0,0,0.1)",
            border: "1px solid rgba(255,0,0,0.3)",
            color: "#ff6b6b",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            marginBottom: "24px",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {generating && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--yellow)",
          }}
        >
          Generating content across all platforms...
        </div>
      )}

      {/* Preview */}
      {posts && !generating && <ContentPreview posts={posts} />}
    </div>
  );
}
