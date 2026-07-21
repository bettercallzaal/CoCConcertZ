import type { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

// Signed session auth. Previously the role lived in a plain `coc-role` cookie
// whose value was the literal string "admin" - unsigned, so anyone could send
// `Cookie: coc-role=admin` and be treated as admin (httpOnly only blocks browser
// JS, not a forged request). Now the role is carried in a single HMAC-signed
// `coc-session` cookie the server can verify. Old unsigned cookies are ignored,
// so existing users re-enter their passcode once.
//
// Requires SESSION_SECRET. If it is unset, verification fails closed (no admin),
// which is the safe posture - set SESSION_SECRET in the environment before deploy.

export type CookieAuth = {
  role: "admin" | "artist";
  artistSlug: string | null;
};

export const SESSION_COOKIE = "coc-session";

function secret(): string | null {
  return process.env.SESSION_SECRET || null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

/** Build a signed session token for a Set-Cookie value. Throws if SESSION_SECRET
 * is missing so a misconfigured deploy fails loudly at login rather than issuing
 * unverifiable tokens. */
export function createSessionToken(auth: CookieAuth): string {
  const key = secret();
  if (!key) throw new Error("SESSION_SECRET not configured");
  const body = Buffer.from(JSON.stringify(auth)).toString("base64url");
  return `${body}.${sign(body, key)}`;
}

/** Verify a session token. Returns the auth payload only if the signature is
 * valid; null on any tampering, missing secret, or malformed token. */
export function verifySessionToken(token: string | undefined): CookieAuth | null {
  const key = secret();
  if (!token || !key) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(body, key);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as CookieAuth;
    if (parsed.role !== "admin" && parsed.role !== "artist") return null;
    return { role: parsed.role, artistSlug: parsed.artistSlug ?? null };
  } catch {
    return null;
  }
}

export function getCookieAuth(req: NextRequest): CookieAuth | null {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

export function isAdmin(req: NextRequest): boolean {
  return getCookieAuth(req)?.role === "admin";
}
