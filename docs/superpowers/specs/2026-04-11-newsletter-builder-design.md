# Newsletter Builder + Social Handle Directory — Design Spec

> **Date:** April 11, 2026
> **Project:** COC Concertz (Approach B: config-driven, portable)
> **Status:** Approved for implementation

---

## Problem

COC has 13+ promoters who need to create show announcements, artist spotlights, recaps, and community updates across X, Farcaster, Bluesky, Telegram, and Discord. Today this is manual -- write content, look up each artist's handles per platform, reformat for each platform's constraints. The @mention step alone is painful: an artist might be `@josephgoats` on X, `@josephgoats` on Farcaster, and `@josephgoats.bsky.social` on Bluesky.

## Solution

A newsletter builder page inside COC Concertz that:

1. Lets promoters pick a template and fill in key details
2. AI generates a newsletter + platform-specific social posts (MiniMax free, OpenRouter fallback)
3. @mentions auto-resolve per platform from a social handle directory
4. One-click copy per platform, future one-click publish to Paragraph
5. Social handle directory in Supabase for cross-project reuse (ZAO OS, FISHBOWLZ, etc.)

## Architecture

```
Promoter → /newsletter page (passcode-gated)
    ↓
Brand context + template + inputs
    ↓
/api/newsletter/generate (MiniMax → OpenRouter fallback)
    ↓
AI returns newsletter + 5 social posts
    ↓
/api/newsletter/resolve-mentions (Firestore artists + Supabase contacts)
    ↓
@handles swapped per platform
    ↓
Preview tabs: Newsletter | X | Farcaster | Bluesky | Telegram | Discord
    ↓
Copy buttons per platform (future: Paragraph publish)
```

---

## UI Flow

### Page: `/newsletter` (passcode-gated, same auth as `/admin`)

Single-page flow with 4 sections stacked vertically. No multi-step wizard -- promoters see everything on one scrollable page.

### Section 1: Setup

**Brand selector** (dropdown)
- COC Concertz (default)
- The ZAO
- Custom (shows custom voice input)

**Template selector** (card grid, 2x3)

| Template | Icon | Auto-pulls |
|----------|------|-----------|
| Show Announcement | megaphone | Event data: date, venue, artists, RSVP link |
| Artist Spotlight | star | Artist bio, photo, social links, past shows |
| Show Recap | camera | Event recap data: visitors, chat highlights, setlists |
| Community Update | people | Community stats, upcoming events |
| Custom | pencil | Nothing -- freeform prompt |

### Section 2: Inputs (dynamic per template)

**Show Announcement:**
- Event # (dropdown of events from Firestore, shows name + date)
- Custom notes (optional textarea, e.g., "mention the new venue")

**Artist Spotlight:**
- Artist (dropdown from Firestore artists, shows name + photo)
- Angle/hook (optional, e.g., "focus on their metaverse performances")

**Show Recap:**
- Event # (dropdown of past events)
- Highlights (textarea, e.g., "Joseph Goats' set was legendary, crowd went wild in chat")

**Community Update:**
- Topic (text input)
- Key points (textarea)

**Custom:**
- Full prompt (textarea, no auto-pull)

**Generate button:** Yellow (#FFD600), full-width, prominent. "GENERATE CONTENT"

### Section 3: Preview & Edit

Tabbed interface with 6 tabs:

| Tab | Content | Features |
|-----|---------|----------|
| **Newsletter** | Full newsletter HTML preview | Editable rich text, rendered in brand style |
| **X** | 280-char post | Char counter (green/yellow/red), @handles resolved for X |
| **Farcaster** | Cast with channel tag | @handles resolved for Farcaster, channel pre-filled |
| **Bluesky** | 300-char post | @handles resolved for Bluesky (.bsky.social format) |
| **Telegram** | 1-2 sentence message | Direct, friendly tone |
| **Discord** | Community-tone message | Slightly longer, may include questions |

Each tab shows:
- **Editable text area** with the generated content
- **@mention chips** showing resolved handles (with platform icon)
- **Copy button** per tab
- **Character count** where relevant (X: 280, Bluesky: 300)

### Section 4: Actions

- **"Copy All"** -- copies all 6 versions to clipboard as formatted text
- **"Publish to Paragraph"** -- (future, greyed out with "Coming Soon" badge)
- **"Save Draft"** -- saves to localStorage for later

---

## @Mention Resolution + Social Handle Directory

### Two-Source Architecture

**Source 1: Firestore (COC Concertz artists)**
- Already exists: `artists` collection with `socialLinks` field
- Contains: X, Farcaster, YouTube, Twitch, Instagram, website
- Scoped to COC Concertz artists only

**Source 2: Supabase (global social handle directory)**
- New table: `social_contacts`
- Shared across ZAO ecosystem projects
- Contains anyone: promoters, community members, collaborators, venues, brands
- Managed via a simple UI or bulk import

### Supabase Schema: `social_contacts`

```sql
CREATE TABLE social_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  x_handle TEXT,
  farcaster_handle TEXT,
  bluesky_handle TEXT,
  lens_handle TEXT,
  telegram_handle TEXT,
  discord_handle TEXT,
  youtube_handle TEXT,
  instagram_handle TEXT,
  wallet_address TEXT,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_contacts_slug ON social_contacts(slug);
CREATE INDEX idx_social_contacts_tags ON social_contacts USING GIN(tags);
```

**Tags examples:** `['artist', 'coc-concertz']`, `['promoter', 'zao']`, `['venue']`, `['community-member']`

### Resolution Logic

```
1. AI generates content with artist/person names
2. /api/newsletter/resolve-mentions receives the content + detected names
3. For each name:
   a. Check Firestore artists (by stageName or slug) -- COC-specific
   b. Check Supabase social_contacts (by display_name or slug) -- global
   c. If found, return platform-specific handles
   d. If not found, return plain name (no @)
4. For each target platform, swap names with correct @handle format
```

### Platform Handle Formats

| Platform | Format | Example |
|----------|--------|---------|
| X | `@handle` | `@josephgoats` |
| Farcaster | `@handle` | `@josephgoats` |
| Bluesky | `@handle.bsky.social` (or custom domain) | `@josephgoats.bsky.social` |
| Lens | `@lens/handle` | `@lens/josephgoats` |
| Telegram | `@handle` | `@josephgoats` |
| Discord | `@handle` (or display name if no universal handle) | `@josephgoats` |

### Contact Directory UI (future, `/admin/contacts`)

Simple CRUD page for managing the Supabase contacts:
- Add/edit/delete contacts
- Bulk import from CSV
- Tag filtering
- Search by name or handle
- Sync from Firestore artists (one-click import of COC artists into global directory)

---

## AI Content Generation

### Provider Stack

```typescript
// Priority order:
// 1. MiniMax (free tier)
// 2. OpenRouter (fallback, pay-per-use)

// Environment variables:
// MINIMAX_API_KEY (required)
// OPENROUTER_API_KEY (fallback)
```

### MiniMax API

- **Endpoint:** `https://api.minimax.io/v1/chat/completions` (OpenAI-compatible)
- **Model:** `MiniMax-Text-01` (204K context) or `MiniMax-M2` (newer)
- **Auth:** Bearer token via `MINIMAX_API_KEY`
- **Cost:** Free tier available
- **Format:** OpenAI Chat Completions compatible -- same request/response format

### OpenRouter Fallback

- **Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
- **Model:** Best available free/cheap model (e.g., `meta-llama/llama-3.1-70b-instruct`)
- **Auth:** Bearer token via `OPENROUTER_API_KEY`

### System Prompts per Brand

**COC Concertz:**
```
You are a content writer for COC Concertz — a virtual concert series hosted inside 
the metaverse by the Community of Communities. The vibe is cyberpunk, hype, and 
community-first. "Virtual Stages. Real Music." Use energetic but not cheesy language. 
Reference the metaverse venue, the live chat, the energy of the virtual crowd. 
Sign off as "- COC Concertz Team".
```

**The ZAO:**
```
You are writing for The ZAO — an impact organization bringing profit margins, data, 
and IP rights back to independent artists. Write in lowercase casual with proper nouns 
capitalized. First person ("I"). No emojis, no hashtags. Momentum-focused: "showed up", 
"locked in", "the quiet work compounds". Short paragraphs. Sign off as 
"- BetterCallZaal on behalf of the ZABAL Team".
```

**Custom:**
```
{user-provided voice description}
```

### Output Structure

The AI returns a JSON object:

```json
{
  "newsletter": "Full newsletter body (HTML-safe markdown)",
  "socials": {
    "x": "280-char max post with @mentions as plain names",
    "farcaster": "Cast text with channel reference",
    "bluesky": "300-char max post",
    "telegram": "1-2 sentence direct message",
    "discord": "Community-tone post, slightly longer"
  }
}
```

After generation, the resolve-mentions step swaps plain names for platform-specific @handles.

---

## Brand Config Extension

```typescript
// concertz.config.ts
export const config = {
  // ... existing fields ...
  newsletter: {
    brandVoice: "cyberpunk, hype, community-first, 'virtual stages real music'",
    defaultSignature: "- COC Concertz Team",
    farcasterChannel: "cocconcertz",
    paragraphSlug: "cocconcertz",
  },
}
```

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| `NewsletterBuilder` | `src/app/newsletter/page.tsx` | Main page, manages state |
| `BrandSelector` | `src/components/newsletter/BrandSelector.tsx` | Brand context dropdown |
| `TemplateSelector` | `src/components/newsletter/TemplateSelector.tsx` | Template card grid |
| `TemplateInputs` | `src/components/newsletter/TemplateInputs.tsx` | Dynamic form per template |
| `ContentPreview` | `src/components/newsletter/ContentPreview.tsx` | Tabbed preview |
| `SocialPostCard` | `src/components/newsletter/SocialPostCard.tsx` | Single platform post |
| `MentionChip` | `src/components/newsletter/MentionChip.tsx` | Resolved @handle badge |

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/newsletter/generate` | POST | AI content generation (MiniMax/OpenRouter) |
| `/api/newsletter/resolve-mentions` | POST | Map names to platform handles |

---

## Auth

Same passcode system as `/admin`. The `/newsletter` page checks for the `coc-role` cookie. Any authenticated user (admin or artist) can access.

---

## Environment Variables

```env
# AI providers (newsletter generation)
MINIMAX_API_KEY=           # Primary: MiniMax free tier
OPENROUTER_API_KEY=        # Fallback: OpenRouter

# Future
PARAGRAPH_API_KEY=         # For direct publishing to Paragraph
SUPABASE_URL=              # For global social contacts directory
SUPABASE_ANON_KEY=         # For global social contacts directory
```

---

## What's NOT in v1

| Feature | Why deferred |
|---------|-------------|
| Paragraph direct publish | Needs API key setup + publication config |
| Post coins | Needs Paragraph coins enabled |
| ZABAL rewards | Needs wallet integration + smart contract |
| publish.new listings | Needs publish.new account |
| Contact directory CRUD UI | v1 uses Firestore artists only; Supabase contacts added in v1.1 |
| Scheduled/recurring newsletters | Complexity -- ship manual first |
| Analytics dashboard | Paragraph handles this natively |

---

## v1 Scope (What We Build Now)

1. `/newsletter` page with brand selector, template selector, dynamic inputs
2. `/api/newsletter/generate` -- MiniMax primary, OpenRouter fallback, brand-aware prompts
3. `/api/newsletter/resolve-mentions` -- Firestore artist lookup, platform-specific handle formatting
4. `ContentPreview` with 6 tabs (newsletter + 5 social platforms)
5. Copy-to-clipboard per platform
6. Cyberpunk COC Concertz styling (yellow/cyan/black, cut-corner cards)

## v1.1 Scope (Next)

1. Supabase `social_contacts` table + sync from Firestore artists
2. Contact directory UI at `/admin/contacts`
3. Paragraph API integration for direct publishing
4. Save/load drafts
