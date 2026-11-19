import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/api-auth";

let requestId = 0;
function login(passcode: string) {
  return POST(new NextRequest("https://example.test/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `192.0.2.${++requestId}` },
    body: JSON.stringify({ passcode }),
  }));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  vi.stubEnv("SESSION_SECRET", "test-only-session-signing-key");
  vi.stubEnv("ADMIN_PASSCODE", "test-admin-code");
  vi.stubEnv("ARTIST_PASSCODES", JSON.stringify({ "test-artist-code": "test-artist" }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

describe("passcode session authorization", () => {
  it.each(["constructor", "toString", "__proto__"])("rejects inherited key %s without issuing a session", async (key) => {
    const response = await login(key);
    expect(response.status).toBe(401);
    expect(response.cookies.get(SESSION_COOKIE)).toBeUndefined();
  });

  it.each([null, 42, {}, [], "", "   "])("rejects a configured non-slug value %j", async (value) => {
    vi.stubEnv("ARTIST_PASSCODES", JSON.stringify({ "test-invalid-code": value }));
    const response = await login("test-invalid-code");
    expect(response.status).toBe(401);
    expect(response.cookies.get(SESSION_COOKIE)).toBeUndefined();
  });

  it.each([
    ["test-admin-code", { role: "admin", artistSlug: null }],
    ["test-artist-code", { role: "artist", artistSlug: "test-artist" }],
  ] as const)("preserves valid login for %s and bounds cookie lifetime", async (passcode, auth) => {
    const response = await login(passcode);
    expect(response.status).toBe(200);
    const cookie = response.cookies.get(SESSION_COOKIE)!;
    expect(cookie.maxAge).toBe(2592000);
    expect(verifySessionToken(cookie.value)).toEqual(auth);
    vi.setSystemTime(new Date("2026-01-31T00:00:00Z"));
    expect(verifySessionToken(cookie.value)).toBeNull();
  });
});
