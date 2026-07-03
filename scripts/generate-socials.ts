/**
 * Platform-sized social post generator in the COC Concertz voice.
 * Pattern lifted from zabalnewsletterbuilder lib/socials.ts, voice from
 * concertz.config.ts newsletter.brands.coc.
 *
 * Usage:
 *   npx tsx scripts/generate-socials.ts \
 *     --theme "COC Concertz #7: WaveWarZ Takeover is LIVE July 18" \
 *     --highlight "DJ Zaal on the decks" \
 *     --highlight "WaveWarZ community battle - crowd decides" \
 *     --link "https://ticket.cocconcertz.com"
 *
 * Prints editable drafts for every surface. Never auto-posts.
 */

interface SocialPost {
  key: string;
  label: string;
  text: string;
  limit?: number;
}

const strip = (s: string) => s.trim().replace(/[.\s]+$/, "");

export function generateCocPosts(
  theme: string,
  highlights: string[],
  link: string
): SocialPost[] {
  const t = strip(theme);
  const hs = highlights.map(strip).filter(Boolean);
  const h0 = hs[0] ?? "";
  const linkPart = link.trim() ? ` ${link.trim()}` : "";
  const tagline = "Virtual Stages. Real Music.";

  // Firefly (Farcaster + X): punchy, <=280. Drop pieces until it fits.
  let firefly = `${t}. ${h0}. ${tagline}${linkPart}`;
  if (firefly.length > 280) firefly = `${t}. ${tagline}${linkPart}`;
  if (firefly.length > 280) firefly = `${t}.${linkPart}`;

  const fcChannel = `${t}.\n\n${hs.join(". ")}. Free entry, join from any browser - no headset needed.\n\n${tagline}${linkPart}`;

  const xgc = `${t}. ${hs.join(", ")}. Free from any browser.${linkPart}`;

  const telegram = `${t}\n\n${hs.map((h) => `- ${h}`).join("\n")}\n\nFree entry. Join from your laptop, phone, or VR headset.${linkPart}`;

  const discord = `${t}\n\n${hs.map((h) => `- ${h}`).join("\n")}\n\nThe virtual crowd needs you. Who is pulling up?${linkPart}`;

  const linkedin = `${t}.\n\nCOC Concertz hosts free live concerts inside the metaverse - front-row energy from anywhere in the world. ${hs.join(". ")}.\n\n${tagline}${link.trim() ? `\n\n${link.trim()}` : ""}`;

  const facebook = `${t}. ${h0}. Free to join from any browser, no downloads. ${tagline}${linkPart}`;

  return [
    { key: "firefly", label: "Firefly (Farcaster + X)", text: firefly, limit: 280 },
    { key: "fcChannel", label: "Farcaster /cocconcertz channel", text: fcChannel },
    { key: "xgc", label: "X group chat", text: xgc },
    { key: "telegram", label: "Telegram (COC + ZAO)", text: telegram },
    { key: "discord", label: "Discord", text: discord },
    { key: "linkedin", label: "LinkedIn", text: linkedin },
    { key: "facebook", label: "Facebook", text: facebook },
  ];
}

// Off-voice flags (adapted from zabalnewsletterbuilder bannedWords)
const BANNED = ["excited to announce", "leverage", "synergy", "thrilled", "game-changer", "—"];

function main() {
  const args = process.argv.slice(2);
  let theme = "";
  let link = "";
  const highlights: string[] = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--theme") theme = args[++i] ?? "";
    else if (args[i] === "--highlight") highlights.push(args[++i] ?? "");
    else if (args[i] === "--link") link = args[++i] ?? "";
  }
  if (!theme) {
    console.error(
      'Usage: generate-socials.ts --theme "<theme>" [--highlight "<h>"]... [--link <url>]'
    );
    process.exit(1);
  }

  const posts = generateCocPosts(theme, highlights, link);
  for (const post of posts) {
    const over = post.limit && post.text.length > post.limit;
    const flags = BANNED.filter((w) => post.text.toLowerCase().includes(w));
    console.log(`\n=== ${post.label}${post.limit ? ` (${post.text.length}/${post.limit}${over ? " OVER" : ""})` : ""} ===`);
    if (flags.length) console.log(`[OFF-VOICE: ${flags.join(", ")}]`);
    console.log(post.text);
  }
  console.log("");
}

main();
