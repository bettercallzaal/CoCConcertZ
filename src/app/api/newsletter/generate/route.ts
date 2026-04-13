import { NextRequest, NextResponse } from "next/server";
import { config as siteConfig } from "../../../../../concertz.config";

const TEMPLATES: Record<string, string> = {
  "show-announcement": `You are writing a show announcement for an upcoming virtual concert.
Include: the show name, date, featured artists (with their social handles), venue details, and a call to action.
Tone: Hype, inclusive, community-first. Underground music meets metaverse.`,

  "artist-spotlight": `You are writing an artist spotlight post to introduce an artist to the community.
Include: the artist's name, bio highlights, music style, links to their work, and why fans should check them out.
Tone: Genuine appreciation, discovery-oriented. Make the reader want to listen.`,

  "show-recap": `You are writing a post-show recap for a virtual concert that already happened.
Include: what happened, standout moments, artist performances, community vibes, and a teaser for what's next.
Tone: Energetic, grateful, community celebration. Make people wish they were there.`,

  "community-update": `You are writing a community update.
Include: recent developments, upcoming plans, community milestones, and calls to action.
Tone: Transparent, builder-mentality, community-first.`,

  custom: `Follow the user's custom instructions exactly.`,

  "youtube-description": `You are a YouTube content editor for COC Concertz, a live Web3 music series by the Community of Communities.

From the transcript provided, generate a YouTube-ready description block. Output as a SINGLE clean text block ready to copy-paste into YouTube — no JSON wrapping needed for this template.

STRUCTURE:
1. Hook line (under 100 chars): "COC Concertz #{number} ft. {artists} — live {genre} from the metaverse."
2. Description (3-4 paragraphs, 800-1200 chars):
   - P1: Introduce artists, background, Web3 connection
   - P2: Performance energy, style, what made it distinct
   - P3: Specific moments, tools, community context — grounded, no hype
   - P4: Artist socials + COC Concertz series description
3. Timestamps starting at 0:00 — based on transcript flow, ~1 min minimum gaps, titles under 50 chars
4. Links section with artist socials and cocconcertz.com
5. About section: "COC Concertz is a recurring live music event by the Community of Communities..."
6. Tags: comma-separated keywords (artist names, event number, genres, Web3 terms, song titles)

STYLE:
- Clear, grounded, warm but professional
- No emojis in description body
- No hashtags
- No clickbait
- Use exact song titles from transcript
- Accuracy over hype
- Assume Web3-literate audience`,
};

interface GenerateRequestBody {
  template: string;
  brand: "coc" | "zao" | "custom";
  customVoice?: string;
  customPrompt?: string;
  artistContext?: string;
  eventContext?: string;
  mentionHandles?: Record<string, Record<string, string>>;
}

interface PlatformPosts {
  newsletter: string;
  x: string;
  farcaster: string;
  bluesky: string;
  telegram: string;
  discord: string;
}

async function callLLM(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const minimaxKey = process.env.MINIMAX_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (!minimaxKey && !openrouterKey) {
    throw new Error("No LLM API key configured (MINIMAX_API_KEY or OPENROUTER_API_KEY)");
  }

  // Try MiniMax first
  if (minimaxKey) {
    try {
      const minimaxUrl = process.env.MINIMAX_API_URL || "https://api.minimax.io/v1/chat/completions";
      const minimaxModel = process.env.MINIMAX_MODEL || "MiniMax-Text-01";
      const res = await fetch(minimaxUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${minimaxKey}`,
        },
        body: JSON.stringify({
          model: minimaxModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 4096,
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      }
      console.warn("MiniMax failed, falling back to OpenRouter:", res.status);
    } catch (err) {
      console.warn("MiniMax error, falling back to OpenRouter:", err);
    }
  }

  // Fallback to OpenRouter
  if (!openrouterKey) {
    throw new Error("MiniMax failed and OPENROUTER_API_KEY not configured");
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openrouterKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty content");
  return content;
}

function parseJsonFromResponse(raw: string): PlatformPosts {
  // Strip markdown fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  return JSON.parse(cleaned) as PlatformPosts;
}

export async function POST(request: NextRequest) {
  const role = request.cookies.get("coc-role")?.value;
  if (role !== "admin" && role !== "artist") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: GenerateRequestBody = await request.json();
    const {
      template,
      brand,
      customVoice,
      customPrompt,
      artistContext,
      eventContext,
      mentionHandles,
    } = body;

    if (!template || !brand) {
      return NextResponse.json(
        { error: "template and brand are required" },
        { status: 400 }
      );
    }

    // Resolve brand voice
    let brandVoice: string;
    if (brand === "custom") {
      brandVoice = customVoice || "You are a helpful content writer.";
    } else {
      const brandConfig = siteConfig.newsletter.brands[brand];
      brandVoice = brandConfig.voice;
    }

    const templatePrompt = TEMPLATES[template] || TEMPLATES.custom;

    // Build mention context
    let mentionContext = "";
    if (mentionHandles && Object.keys(mentionHandles).length > 0) {
      mentionContext =
        "\n\nArtist social handles (use the correct handle for each platform):\n";
      for (const [name, handles] of Object.entries(mentionHandles)) {
        const h = handles as Record<string, string>;
        const parts: string[] = [];
        if (h.twitter) parts.push(`X: @${h.twitter}`);
        if (h.farcaster) parts.push(`Farcaster: @${h.farcaster}`);
        if (h.bluesky) parts.push(`Bluesky: @${h.bluesky}`);
        if (h.telegram) parts.push(`Telegram: @${h.telegram}`);
        if (h.lens) parts.push(`Lens: @${h.lens}`);
        mentionContext += `- ${name}: ${parts.join(", ")}\n`;
      }
    }

    // Build context sections
    let context = "";
    if (artistContext) {
      context += `\n\nArtist info:\n${artistContext}`;
    }
    if (eventContext) {
      context += `\n\nEvent info:\n${eventContext}`;
    }

    const systemPrompt = `${brandVoice}

${templatePrompt}

The Farcaster channel is /${siteConfig.newsletter.farcasterChannel}.
Never say "Warpcast" — always say "Farcaster".`;

    const userPrompt = `${context}${mentionContext}${customPrompt ? `\nAdditional instructions: ${customPrompt}` : ""}

Generate posts for ALL 6 platforms in a single JSON object. Return ONLY valid JSON — no explanation, no markdown fences.

Platform requirements:
- "newsletter": Full newsletter-style post with sections, rich detail, and a personal voice. Use markdown. No character limit.
- "x": Max 280 characters. Use hashtags sparingly (1-2 max). No emojis in hashtags.
- "farcaster": Max 1024 characters. More detail allowed. Reference the /${siteConfig.newsletter.farcasterChannel} channel.
- "bluesky": Max 300 characters. Clean and concise. Text-focused audience.
- "telegram": Conversational, community-style. Can be longer. Use line breaks for readability.
- "discord": Community-server style. Can use light formatting (bold, line breaks). Engaging and direct.

For @mentions: use the exact handle format for each platform. On X use @handle, on Farcaster use @handle, on Bluesky use @handle.bsky.social if known.

Return this exact JSON shape:
{
  "newsletter": "...",
  "x": "...",
  "farcaster": "...",
  "bluesky": "...",
  "telegram": "...",
  "discord": "..."
}`;

    const raw = await callLLM(systemPrompt, userPrompt);
    const posts = parseJsonFromResponse(raw);

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Newsletter generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
