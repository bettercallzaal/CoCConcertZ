import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/api-auth";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: "/",
};

// In-memory per-IP rate limit on passcode attempts (best-effort; resets on cold
// start, which is fine for slowing brute force). Without this, an attacker could
// fire thousands of guesses/sec at ADMIN_PASSCODE / ARTIST_PASSCODES.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : "") .trim() || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

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
      const passcodeMap: Record<string, string> = JSON.parse(rawPasscodes);
      const artistSlug = passcodeMap[passcode];
      if (artistSlug) {
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
