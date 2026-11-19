import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/api-auth";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: SESSION_MAX_AGE_SECONDS,
  path: "/",
};

// In-memory per-IP rate limit on passcode attempts (best-effort; resets on cold
// start, which is fine for slowing brute force). Without this, an attacker could
// fire thousands of guesses/sec at ADMIN_PASSCODE / ARTIST_PASSCODES.
const isRateLimited = createRateLimiter();

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a minute." },
      { status: 429 },
    );
  }

  let passcode: unknown;
  try {
    ({ passcode } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (typeof passcode !== "string") {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
  }

  if (!process.env.SESSION_SECRET) {
    console.error("SESSION_SECRET not configured — admin auth disabled");
    return NextResponse.json(
      { error: "Admin auth not configured. Set SESSION_SECRET in Vercel env." },
      { status: 503 },
    );
  }

  const adminCode = process.env.ADMIN_PASSCODE;
  if (adminCode && passcode === adminCode) {
    const response = NextResponse.json({ role: "admin" });
    response.cookies.set(SESSION_COOKIE, createSessionToken({ role: "admin", artistSlug: null }), COOKIE_OPTS);
    clearLegacyCookies(response);
    return response;
  }

  // Per-artist passcodes: ARTIST_PASSCODES={"xkmpq":"joseph-goats","rvtnw":"stilo"}
  const rawPasscodes = process.env.ARTIST_PASSCODES;
  if (rawPasscodes) {
    try {
      const passcodeMap: unknown = JSON.parse(rawPasscodes);
      const artistSlug = passcodeMap && typeof passcodeMap === "object"
        && !Array.isArray(passcodeMap)
        && Object.prototype.hasOwnProperty.call(passcodeMap, passcode)
        ? (passcodeMap as Record<string, unknown>)[passcode] : undefined;
      if (typeof artistSlug === "string" && artistSlug.trim()) {
        const response = NextResponse.json({ role: "artist", artistSlug });
        response.cookies.set(SESSION_COOKIE, createSessionToken({ role: "artist", artistSlug }), COOKIE_OPTS);
        clearLegacyCookies(response);
        return response;
      }
    } catch {
      console.error("Failed to parse ARTIST_PASSCODES env var");
    }
  }

  return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  clearLegacyCookies(response);
  return response;
}

// Remove the old unsigned cookies so a lingering `coc-role=admin` can never be
// honored again after this ships.
function clearLegacyCookies(response: NextResponse): void {
  response.cookies.delete("coc-role");
  response.cookies.delete("coc-artist-slug");
}
