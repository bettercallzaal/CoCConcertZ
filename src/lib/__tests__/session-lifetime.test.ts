import { createHmac } from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionToken, verifySessionToken } from "../api-auth";

const KEY = "test-only-session-signing-key";
const ISSUED_AT = 1767225600;
function signed(payload: unknown) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${createHmac("sha256", KEY).update(body).digest("base64url")}`;
}

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", KEY);
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

describe("server-side session lifetime", () => {
  it.each(["admin", "artist"] as const)("expires %s tokens at exactly 30 days", (role) => {
    const auth = { role, artistSlug: role === "artist" ? "test-artist" : null };
    const token = createSessionToken(auth);
    vi.setSystemTime(new Date("2026-01-30T23:59:59Z"));
    expect(verifySessionToken(token)).toEqual(auth);
    vi.setSystemTime(new Date("2026-01-31T00:00:00Z"));
    expect(verifySessionToken(token)).toBeNull();
    vi.setSystemTime(new Date("2026-02-01T00:00:00Z"));
    expect(verifySessionToken(token)).toBeNull();
  });

  it("rejects correctly signed legacy tokens without a lifetime", () => {
    expect(verifySessionToken(signed({ role: "admin", artistSlug: null }))).toBeNull();
  });

  it.each([
    { iat: null, exp: ISSUED_AT + 100 },
    { iat: ISSUED_AT, exp: "1767225700" },
    { iat: ISSUED_AT, exp: null },
    { iat: ISSUED_AT, exp: ISSUED_AT },
    { iat: ISSUED_AT + 1, exp: ISSUED_AT + 100 },
    { iat: ISSUED_AT - 10, exp: ISSUED_AT - 1 },
    { iat: ISSUED_AT + 0.5, exp: ISSUED_AT + 100 },
    { iat: ISSUED_AT, exp: ISSUED_AT + 2592001 },
  ])("rejects invalid signed lifetime %j", (claims) => {
    expect(verifySessionToken(signed({ role: "admin", artistSlug: null, ...claims }))).toBeNull();
  });

  it.each([null, "", "   ", 42, {}])("rejects a signed artist session with invalid slug %j", (artistSlug) => {
    expect(verifySessionToken(signed({ role: "artist", artistSlug, iat: ISSUED_AT, exp: ISSUED_AT + 100 }))).toBeNull();
  });
});
