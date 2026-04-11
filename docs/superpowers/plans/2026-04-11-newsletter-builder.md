# Newsletter Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a newsletter content builder page at `/newsletter` where 13+ COC promoters can generate AI-powered newsletters and platform-specific social posts with auto-resolved @mentions.

**Architecture:** Single page at `/newsletter` with brand selector, template picker, dynamic inputs, AI generation (MiniMax free primary, OpenRouter fallback), mention resolution from Firestore artists, and tabbed preview with per-platform copy buttons. Uses existing passcode auth, existing UI components (Button, Card, Badge), and existing Firestore data (events, artists).

**Tech Stack:** Next.js 16 App Router, React 19, MiniMax API (OpenAI-compatible), OpenRouter API (fallback), Firebase/Firestore, existing COC Concertz design system (cyberpunk yellow/cyan/black)

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `src/middleware.ts` | Add `/newsletter` to protected routes |
| Modify | `concertz.config.ts` | Add newsletter brand config |
| Rewrite | `src/app/api/newsletter/generate/route.ts` | Swap Anthropic for MiniMax/OpenRouter, return all 6 platforms in one call |
| Keep | `src/app/api/newsletter/resolve-mentions/route.ts` | Already works -- returns artist handles |
| Create | `src/app/newsletter/page.tsx` | Main page component, orchestrates all sections |
| Create | `src/components/newsletter/TemplateSelector.tsx` | Template card grid |
| Create | `src/components/newsletter/TemplateInputs.tsx` | Dynamic form per template |
| Create | `src/components/newsletter/ContentPreview.tsx` | Tabbed preview with copy buttons |

---

### Task 1: Add `/newsletter` Route Protection

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Update middleware matcher**

```typescript
export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/newsletter/:path*"],
};
```

- [ ] **Step 2: Verify middleware still passes through**

Run: `npm run dev` and visit `/newsletter` -- should show 404 (page doesn't exist yet) but no middleware error.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add /newsletter to middleware route protection"
```

---

### Task 2: Add Newsletter Brand Config

**Files:**
- Modify: `concertz.config.ts`

- [ ] **Step 1: Add newsletter config section**

Add after the `branding` field in `concertz.config.ts`:

```typescript
  newsletter: {
    brands: {
      coc: {
        name: "COC Concertz",
        voice: "You are a content writer for COC Concertz — a virtual concert series hosted inside the metaverse by the Community of Communities. The vibe is cyberpunk, hype, and community-first. 'Virtual Stages. Real Music.' Use energetic but not cheesy language. Reference the metaverse venue, the live chat, the energy of the virtual crowd.",
        signature: "- COC Concertz Team",
      },
      zao: {
        name: "The ZAO",
        voice: "You are writing for The ZAO — an impact organization bringing profit margins, data, and IP rights back to independent artists. Write in lowercase casual with proper nouns capitalized. First person ('I'). No emojis, no hashtags. Momentum-focused: 'showed up', 'locked in', 'the quiet work compounds'. Short paragraphs.",
        signature: "- BetterCallZaal on behalf of the ZABAL Team",
      },
    },
    farcasterChannel: "cocconcertz",
  },
```

- [ ] **Step 2: Commit**

```bash
git add concertz.config.ts
git commit -m "feat: add newsletter brand config with COC and ZAO voice profiles"
```

---

### Task 3: Rewrite Generate API Route (MiniMax + OpenRouter)

**Files:**
- Rewrite: `src/app/api/newsletter/generate/route.ts`

- [ ] **Step 1: Rewrite the generate route**

Replace the entire file with:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { config as siteConfig } from "../../../../concertz.config";

type Brand = "coc" | "zao" | "custom";

interface GenerateRequest {
  template: string;
  brand: Brand;
  customVoice?: string;
  customPrompt?: string;
  artistContext?: string;
  eventContext?: string;
  mentionHandles?: Record<string, Record<string, string>>;
}

const TEMPLATES: Record<string, string> = {
  "show-announcement": `Write a show announcement for an upcoming virtual concert.
Include: the show name, date, featured artists (with their names), venue details, and a call to action.`,
  "artist-spotlight": `Write an artist spotlight post to introduce an artist to the community.
Include: the artist's name, bio highlights, music style, and why fans should check them out.`,
  "show-recap": `Write a post-show recap for a virtual concert that already happened.
Include: what happened, standout moments, artist performances, community vibes, and a teaser for what's next.`,
  "community-update": `Write a community update.
Include: recent developments, upcoming plans, community milestones, and calls to action.`,
  custom: `Follow the user's custom instructions exactly.`,
};

const BRAND_CONTEXT = `Part of the Community of Communities (COC) and The ZAO ecosystem.
Never say "Warpcast" - always say "Farcaster".
The Farcaster channel is /cocconcertz.`;

async function callAI(messages: { role: string; content: string }[]): Promise<string> {
  // Try MiniMax first (free)
  const miniMaxKey = process.env.MINIMAX_API_KEY;
  if (miniMaxKey) {
    try {
      const res = await fetch("https://api.minimax.io/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${miniMaxKey}`,
        },
        body: JSON.stringify({
          model: "MiniMax-Text-01",
          messages,
          max_tokens: 4096,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "";
      }
    } catch (e) {
      console.warn("MiniMax failed, trying OpenRouter:", e);
    }
  }

  // Fallback to OpenRouter
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) {
    throw new Error("No AI provider configured. Set MINIMAX_API_KEY or OPENROUTER_API_KEY");
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openRouterKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-70b-instruct",
      messages,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter failed: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function POST(request: NextRequest) {
  const role = request.cookies.get("coc-role")?.value;
  if (role !== "admin" && role !== "artist") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: GenerateRequest = await request.json();
    const { template, brand, customVoice, customPrompt, artistContext, eventContext, mentionHandles } = body;

    if (!template) {
      return NextResponse.json({ error: "template is required" }, { status: 400 });
    }

    // Build brand voice
    const brandConfig = brand === "custom"
      ? { voice: customVoice || "Write in a professional, engaging tone.", signature: "" }
      : siteConfig.newsletter.brands[brand] || siteConfig.newsletter.brands.coc;

    const templatePrompt = TEMPLATES[template] || TEMPLATES.custom;

    // Build mention context
    let mentionContext = "";
    if (mentionHandles && Object.keys(mentionHandles).length > 0) {
      mentionContext = "\n\nArtist social handles (use the correct handle per platform):\n";
      for (const [name, handles] of Object.entries(mentionHandles)) {
        const parts: string[] = [];
        if (handles.twitter) parts.push(`X: @${handles.twitter}`);
        if (handles.farcaster) parts.push(`Farcaster: @${handles.farcaster}`);
        if (handles.bluesky) parts.push(`Bluesky: @${handles.bluesky}`);
        mentionContext += `- ${name}: ${parts.join(", ")}\n`;
      }
    }

    let context = "";
    if (artistContext) context += `\n\nArtist info:\n${artistContext}`;
    if (eventContext) context += `\n\nEvent info:\n${eventContext}`;

    const systemPrompt = `${brandConfig.voice}\n\n${BRAND_CONTEXT}`;

    const userPrompt = `${templatePrompt}
${context}
${mentionContext}
${customPrompt ? `\nAdditional instructions: ${customPrompt}` : ""}

Generate content for ALL of these platforms in a single response. Return ONLY valid JSON with this exact structure (no markdown fences, no explanation):
{
  "newsletter": "Full newsletter text with markdown formatting. End with: ${brandConfig.signature}",
  "x": "Max 280 characters. Punchy. 1-2 hashtags max.",
  "farcaster": "Max 1024 characters. Reference /cocconcertz channel. More detail than X.",
  "bluesky": "Max 300 characters. Clean and concise.",
  "telegram": "1-2 sentences. Direct and friendly. Include link placeholder.",
  "discord": "Casual community tone. Slightly longer. Can ask a question."
}

For @mentions: use the exact platform-specific handle format provided above. On X use @handle, on Farcaster use @handle, on Bluesky use @handle.bsky.social.
If no handles are provided for an artist, just use their name without @.`;

    const result = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    // Parse JSON from response (handle potential markdown fences)
    let parsed;
    try {
      const jsonStr = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      // If JSON parsing fails, return the raw text as newsletter
      parsed = {
        newsletter: result,
        x: "",
        farcaster: "",
        bluesky: "",
        telegram: "",
        discord: "",
      };
    }

    return NextResponse.json({ posts: parsed });
  } catch (err) {
    console.error("Newsletter generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate content" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Verify the route compiles**

Run: `npm run dev` and ensure no build errors.

- [ ] **Step 3: Test with curl**

```bash
curl -X POST http://localhost:3000/api/newsletter/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: coc-role=admin" \
  -d '{"template":"show-announcement","brand":"coc","eventContext":"COC Concertz #5, May 9 2026, featuring TBA artists"}'
```

Expected: JSON response with `{ posts: { newsletter, x, farcaster, bluesky, telegram, discord } }`

- [ ] **Step 4: Commit**

```bash
git add src/app/api/newsletter/generate/route.ts
git commit -m "feat: rewrite newsletter generate API to use MiniMax (free) with OpenRouter fallback"
```

---

### Task 4: Create the Newsletter Page

**Files:**
- Create: `src/app/newsletter/page.tsx`

- [ ] **Step 1: Create the page**

```typescript
"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Event, Artist } from "@/lib/types";
import { TemplateSelector } from "@/components/newsletter/TemplateSelector";
import { TemplateInputs } from "@/components/newsletter/TemplateInputs";
import { ContentPreview } from "@/components/newsletter/ContentPreview";
import { Button } from "@/components/ui";

type Brand = "coc" | "zao" | "custom";
type Template = "show-announcement" | "artist-spotlight" | "show-recap" | "community-update" | "custom";

interface GeneratedPosts {
  newsletter: string;
  x: string;
  farcaster: string;
  bluesky: string;
  telegram: string;
  discord: string;
}

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

  // Load events and artists
  useEffect(() => {
    async function load() {
      const evSnap = await getDocs(query(collection(db, "events"), orderBy("number", "desc")));
      setEvents(evSnap.docs.map((d) => ({ ...d.data(), id: d.id, date: d.data().date?.toDate?.() ?? new Date() }) as Event));

      const arSnap = await getDocs(query(collection(db, "artists"), orderBy("stageName", "asc")));
      setArtists(arSnap.docs.map((d) => ({ ...d.data(), id: d.id }) as Artist));
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
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-dim)", marginBottom: "40px" }}>
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
```

- [ ] **Step 2: Verify page loads**

Run: `npm run dev`, log in as admin, visit `/newsletter`. Should show header, brand selector, template grid (empty since components don't exist yet -- will show import errors). That's expected.

- [ ] **Step 3: Commit**

```bash
git add src/app/newsletter/page.tsx
git commit -m "feat: add newsletter builder page skeleton"
```

---

### Task 5: Create TemplateSelector Component

**Files:**
- Create: `src/components/newsletter/TemplateSelector.tsx`

- [ ] **Step 1: Create the component**

```typescript
"use client";

import React from "react";

type Template = "show-announcement" | "artist-spotlight" | "show-recap" | "community-update" | "custom";

interface Props {
  selected: Template | null;
  onSelect: (t: Template) => void;
}

const TEMPLATES: { id: Template; label: string; desc: string; icon: string }[] = [
  { id: "show-announcement", label: "Show Announcement", desc: "Upcoming concert details + RSVP", icon: "\u{1F4E2}" },
  { id: "artist-spotlight", label: "Artist Spotlight", desc: "Feature an artist before a show", icon: "\u{2B50}" },
  { id: "show-recap", label: "Show Recap", desc: "Post-show highlights + vibes", icon: "\u{1F4F8}" },
  { id: "community-update", label: "Community Update", desc: "News, milestones, announcements", icon: "\u{1F465}" },
  { id: "custom", label: "Custom", desc: "Write your own prompt", icon: "\u{270F}\u{FE0F}" },
];

export function TemplateSelector({ selected, onSelect }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          style={{
            padding: "16px",
            background: selected === t.id ? "rgba(255, 214, 0, 0.1)" : "var(--card)",
            border: `1px solid ${selected === t.id ? "var(--yellow)" : "var(--border)"}`,
            cursor: "pointer",
            textAlign: "left",
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>{t.icon}</div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: selected === t.id ? "var(--yellow)" : "var(--text)",
              marginBottom: "4px",
            }}
          >
            {t.label}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-dim)",
            }}
          >
            {t.desc}
          </div>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/newsletter/TemplateSelector.tsx
git commit -m "feat: add TemplateSelector component with 5 template cards"
```

---

### Task 6: Create TemplateInputs Component

**Files:**
- Create: `src/components/newsletter/TemplateInputs.tsx`

- [ ] **Step 1: Create the component**

```typescript
"use client";

import React, { useState } from "react";
import type { Event, Artist } from "@/lib/types";
import { Button } from "@/components/ui";

type Template = "show-announcement" | "artist-spotlight" | "show-recap" | "community-update" | "custom";

interface Props {
  template: Template;
  events: Event[];
  artists: Artist[];
  generating: boolean;
  onGenerate: (inputs: {
    customPrompt?: string;
    artistContext?: string;
    eventContext?: string;
    mentionHandles?: Record<string, Record<string, string>>;
  }) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--card)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: "32px",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--text-dim)",
  marginBottom: "6px",
  display: "block",
};

function buildMentionHandles(artists: Artist[], selectedIds: string[]): Record<string, Record<string, string>> {
  const handles: Record<string, Record<string, string>> = {};
  for (const id of selectedIds) {
    const artist = artists.find((a) => a.id === id);
    if (!artist) continue;
    const h: Record<string, string> = {};
    if (artist.socialLinks.twitter) h.twitter = artist.socialLinks.twitter;
    if (artist.socialLinks.farcaster) h.farcaster = artist.socialLinks.farcaster;
    handles[artist.stageName] = h;
  }
  return handles;
}

function formatEventContext(event: Event, artists: Artist[]): string {
  const artistNames = event.artists
    .map((ea) => artists.find((a) => a.id === ea.artistId)?.stageName)
    .filter(Boolean)
    .join(", ");
  const date = event.date instanceof Date ? event.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : String(event.date);
  return `COC Concertz #${event.number}: ${event.name}\nDate: ${date}\nArtists: ${artistNames}\nVenue: Metaverse (Spatial.io)\nRSVP: ${event.rsvpLink || "TBA"}`;
}

function formatArtistContext(artist: Artist): string {
  let ctx = `Name: ${artist.stageName}\nBio: ${artist.bio || "No bio yet"}`;
  if (artist.socialLinks.twitter) ctx += `\nX: @${artist.socialLinks.twitter}`;
  if (artist.socialLinks.farcaster) ctx += `\nFarcaster: @${artist.socialLinks.farcaster}`;
  if (artist.socialLinks.youtube) ctx += `\nYouTube: ${artist.socialLinks.youtube}`;
  return ctx;
}

export function TemplateInputs({ template, events, artists, generating, onGenerate }: Props) {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedArtist, setSelectedArtist] = useState("");
  const [notes, setNotes] = useState("");
  const [topic, setTopic] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  function handleGenerate() {
    const event = events.find((e) => e.id === selectedEvent);
    const artist = artists.find((a) => a.id === selectedArtist);

    switch (template) {
      case "show-announcement": {
        if (!event) return;
        const artistIds = event.artists.map((ea) => ea.artistId);
        onGenerate({
          eventContext: formatEventContext(event, artists),
          customPrompt: notes || undefined,
          mentionHandles: buildMentionHandles(artists, artistIds),
        });
        break;
      }
      case "artist-spotlight": {
        if (!artist) return;
        onGenerate({
          artistContext: formatArtistContext(artist),
          customPrompt: notes || undefined,
          mentionHandles: buildMentionHandles(artists, [artist.id]),
        });
        break;
      }
      case "show-recap": {
        if (!event) return;
        const artistIds = event.artists.map((ea) => ea.artistId);
        onGenerate({
          eventContext: formatEventContext(event, artists),
          customPrompt: notes || undefined,
          mentionHandles: buildMentionHandles(artists, artistIds),
        });
        break;
      }
      case "community-update":
        onGenerate({ customPrompt: `Topic: ${topic}\n\n${notes}` });
        break;
      case "custom":
        onGenerate({ customPrompt });
        break;
    }
  }

  const canGenerate =
    template === "custom"
      ? customPrompt.length > 0
      : template === "community-update"
        ? topic.length > 0
        : template === "artist-spotlight"
          ? selectedArtist !== ""
          : selectedEvent !== "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Event selector for announcement + recap */}
      {(template === "show-announcement" || template === "show-recap") && (
        <div>
          <label style={labelStyle}>Event</label>
          <select style={selectStyle} value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
            <option value="">Select an event...</option>
            {events
              .filter((ev) => template === "show-recap" ? ev.status === "completed" : ev.status === "upcoming")
              .map((ev) => (
                <option key={ev.id} value={ev.id}>
                  ConcertZ #{ev.number} — {ev.name}
                </option>
              ))}
            {/* Show all events if no filtered results */}
            {events.filter((ev) => template === "show-recap" ? ev.status === "completed" : ev.status === "upcoming").length === 0 &&
              events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  ConcertZ #{ev.number} — {ev.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Artist selector for spotlight */}
      {template === "artist-spotlight" && (
        <div>
          <label style={labelStyle}>Artist</label>
          <select style={selectStyle} value={selectedArtist} onChange={(e) => setSelectedArtist(e.target.value)}>
            <option value="">Select an artist...</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.stageName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Topic for community update */}
      {template === "community-update" && (
        <div>
          <label style={labelStyle}>Topic</label>
          <input
            style={inputStyle}
            placeholder="e.g., New partnership announcement"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
      )}

      {/* Notes/highlights for non-custom templates */}
      {template !== "custom" && (
        <div>
          <label style={labelStyle}>
            {template === "show-recap" ? "Highlights & Memorable Moments" : "Additional Notes"}
          </label>
          <textarea
            style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
            placeholder={
              template === "show-recap"
                ? "What stood out? Best moments, crowd reactions..."
                : "Any specific things to mention..."
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      )}

      {/* Freeform prompt for custom */}
      {template === "custom" && (
        <div>
          <label style={labelStyle}>Your Prompt</label>
          <textarea
            style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
            placeholder="Tell the AI what to write..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
        </div>
      )}

      {/* Generate button */}
      <Button
        variant="primary"
        size="lg"
        disabled={!canGenerate || generating}
        onClick={handleGenerate}
        style={{ width: "100%", marginTop: "8px" }}
      >
        {generating ? "Generating..." : "Generate Content"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/newsletter/TemplateInputs.tsx
git commit -m "feat: add TemplateInputs with dynamic forms per template type"
```

---

### Task 7: Create ContentPreview Component

**Files:**
- Create: `src/components/newsletter/ContentPreview.tsx`

- [ ] **Step 1: Create the component**

```typescript
"use client";

import React, { useState } from "react";

interface GeneratedPosts {
  newsletter: string;
  x: string;
  farcaster: string;
  bluesky: string;
  telegram: string;
  discord: string;
}

interface Props {
  posts: GeneratedPosts;
}

const PLATFORMS = [
  { key: "newsletter", label: "Newsletter", maxChars: null, icon: "\u{1F4E8}" },
  { key: "x", label: "X", maxChars: 280, icon: "\u{1D54F}" },
  { key: "farcaster", label: "Farcaster", maxChars: 1024, icon: "\u{1F7EA}" },
  { key: "bluesky", label: "Bluesky", maxChars: 300, icon: "\u{1F53B}" },
  { key: "telegram", label: "Telegram", maxChars: null, icon: "\u{2708}\u{FE0F}" },
  { key: "discord", label: "Discord", maxChars: null, icon: "\u{1F4AC}" },
] as const;

function charCountColor(current: number, max: number): string {
  const ratio = current / max;
  if (ratio > 1) return "#ff4444";
  if (ratio > 0.9) return "#ffaa00";
  return "var(--text-dim)";
}

export function ContentPreview({ posts: initialPosts }: Props) {
  const [activeTab, setActiveTab] = useState("newsletter");
  const [posts, setPosts] = useState<GeneratedPosts>(initialPosts);
  const [copied, setCopied] = useState<string | null>(null);

  function handleEdit(platform: string, value: string) {
    setPosts((prev) => ({ ...prev, [platform]: value }));
  }

  async function handleCopy(platform: string) {
    const text = posts[platform as keyof GeneratedPosts];
    await navigator.clipboard.writeText(text);
    setCopied(platform);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleCopyAll() {
    const all = PLATFORMS.map((p) => {
      const text = posts[p.key as keyof GeneratedPosts];
      return `=== ${p.label.toUpperCase()} ===\n\n${text}`;
    }).join("\n\n---\n\n");
    await navigator.clipboard.writeText(all);
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  }

  const activePlatform = PLATFORMS.find((p) => p.key === activeTab);
  const activeText = posts[activeTab as keyof GeneratedPosts] || "";

  return (
    <div>
      {/* Section label */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "var(--text-dim)",
          marginBottom: "12px",
        }}
      >
        Generated Content
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "16px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {PLATFORMS.map((p) => (
          <button
            key={p.key}
            onClick={() => setActiveTab(p.key)}
            style={{
              padding: "8px 14px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              background: activeTab === p.key ? "var(--yellow)" : "var(--card)",
              color: activeTab === p.key ? "var(--black)" : "var(--text-dim)",
              border: `1px solid ${activeTab === p.key ? "var(--yellow)" : "var(--border)"}`,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          padding: "16px",
        }}
      >
        <textarea
          value={activeText}
          onChange={(e) => handleEdit(activeTab, e.target.value)}
          style={{
            width: "100%",
            minHeight: activeTab === "newsletter" ? "300px" : "150px",
            background: "transparent",
            border: "none",
            color: "var(--text)",
            fontFamily: activeTab === "newsletter" ? "var(--font-body, var(--font-mono))" : "var(--font-mono)",
            fontSize: activeTab === "newsletter" ? "15px" : "13px",
            lineHeight: "1.6",
            resize: "vertical",
            outline: "none",
          }}
        />

        {/* Footer: char count + copy */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid var(--border)",
          }}
        >
          {/* Char count */}
          {activePlatform?.maxChars ? (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: charCountColor(activeText.length, activePlatform.maxChars),
              }}
            >
              {activeText.length} / {activePlatform.maxChars}
            </span>
          ) : (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-dim)",
              }}
            >
              {activeText.length} chars
            </span>
          )}

          {/* Copy button */}
          <button
            onClick={() => handleCopy(activeTab)}
            style={{
              padding: "6px 16px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              background: copied === activeTab ? "var(--cyan)" : "transparent",
              color: copied === activeTab ? "var(--black)" : "var(--cyan)",
              border: `1px solid var(--cyan)`,
              cursor: "pointer",
            }}
          >
            {copied === activeTab ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Copy All button */}
      <button
        onClick={handleCopyAll}
        style={{
          width: "100%",
          marginTop: "12px",
          padding: "12px",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          background: copied === "all" ? "var(--cyan)" : "transparent",
          color: copied === "all" ? "var(--black)" : "var(--text-dim)",
          border: "1px solid var(--border)",
          cursor: "pointer",
        }}
      >
        {copied === "all" ? "All Copied!" : "Copy All Platforms"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/newsletter/ContentPreview.tsx
git commit -m "feat: add ContentPreview with tabbed social previews, char counts, and copy buttons"
```

---

### Task 8: End-to-End Verification

**Files:** None (testing only)

- [ ] **Step 1: Add env vars**

Add to `.env.local`:
```
MINIMAX_API_KEY=your-minimax-key-here
OPENROUTER_API_KEY=your-openrouter-key-here
```

- [ ] **Step 2: Start dev server and test the full flow**

Run: `npm run dev`

1. Go to `/login`, enter admin passcode
2. Go to `/newsletter`
3. Verify: brand selector shows 3 options (COC Concertz, The ZAO, Custom)
4. Verify: 5 template cards render
5. Click "Show Announcement" template
6. Verify: event dropdown populates from Firestore
7. Select an event, add notes
8. Click "Generate Content"
9. Verify: loading state shows
10. Verify: 6 tabs appear (Newsletter, X, Farcaster, Bluesky, Telegram, Discord)
11. Verify: each tab has editable text with char count
12. Verify: Copy button works on each tab
13. Verify: "Copy All Platforms" copies all 6

- [ ] **Step 3: Test each template**

Repeat for:
- Artist Spotlight (select artist dropdown)
- Show Recap (select past event, add highlights)
- Community Update (enter topic + notes)
- Custom (enter freeform prompt)

- [ ] **Step 4: Test brand switching**

- Select "The ZAO" brand, generate -- verify lowercase casual voice
- Select "Custom" brand, enter voice description, generate -- verify custom tone

- [ ] **Step 5: Test error states**

- Remove env vars, verify error message shows
- Try generating without selecting required fields, verify button stays disabled

- [ ] **Step 6: Commit all working state**

```bash
git add -A
git commit -m "feat: newsletter builder v1 - AI content generation with multi-platform preview"
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Route protection | `middleware.ts` |
| 2 | Brand config | `concertz.config.ts` |
| 3 | API rewrite (MiniMax/OpenRouter) | `api/newsletter/generate/route.ts` |
| 4 | Newsletter page | `app/newsletter/page.tsx` |
| 5 | Template selector | `components/newsletter/TemplateSelector.tsx` |
| 6 | Template inputs | `components/newsletter/TemplateInputs.tsx` |
| 7 | Content preview | `components/newsletter/ContentPreview.tsx` |
| 8 | E2E verification | Testing only |

**Total new/modified files:** 7
**Estimated LOC:** ~850
