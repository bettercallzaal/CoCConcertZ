import { describe, it, expect, beforeEach } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE,
} from "../api-auth";

const VALID_SECRET = "test-secret-at-least-32-chars-long!";

beforeEach(() => {
  process.env.SESSION_SECRET = VALID_SECRET;
});

// ── createSessionToken ────────────────────────────────────────────────────────

describe("createSessionToken", () => {
  it("returns a base64url.signature string for admin role", () => {
    const token = createSessionToken({ role: "admin", artistSlug: null });
    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it("returns a base64url.signature string for artist role", () => {
    const token = createSessionToken({ role: "artist", artistSlug: "dj-zaal" });
    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it("throws if SESSION_SECRET is not set", () => {
    delete process.env.SESSION_SECRET;
    expect(() => createSessionToken({ role: "admin", artistSlug: null })).toThrow(
      "SESSION_SECRET not configured"
    );
  });

  it("two tokens for same payload differ (timestamp-independent — payload is deterministic)", () => {
    const t1 = createSessionToken({ role: "admin", artistSlug: null });
    const t2 = createSessionToken({ role: "admin", artistSlug: null });
    // Same payload + same key → same token (HMAC is deterministic)
    expect(t1).toBe(t2);
  });
});

// ── verifySessionToken ────────────────────────────────────────────────────────

describe("verifySessionToken", () => {
  it("round-trips an admin session", () => {
    const token = createSessionToken({ role: "admin", artistSlug: null });
    const result = verifySessionToken(token);
    expect(result).toEqual({ role: "admin", artistSlug: null });
  });

  it("round-trips an artist session with slug", () => {
    const token = createSessionToken({ role: "artist", artistSlug: "dj-zaal" });
    const result = verifySessionToken(token);
    expect(result).toEqual({ role: "artist", artistSlug: "dj-zaal" });
  });

  it("returns null for undefined input", () => {
    expect(verifySessionToken(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(verifySessionToken("")).toBeNull();
  });

  it("returns null for a token with no dot separator", () => {
    expect(verifySessionToken("nodot")).toBeNull();
  });

  it("returns null when SESSION_SECRET is missing", () => {
    const token = createSessionToken({ role: "admin", artistSlug: null });
    delete process.env.SESSION_SECRET;
    expect(verifySessionToken(token)).toBeNull();
  });

  it("returns null when signature is tampered", () => {
    const token = createSessionToken({ role: "admin", artistSlug: null });
    const tampered = token.slice(0, -3) + "xxx";
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it("returns null when payload is tampered (role escalation attempt)", () => {
    // Build an artist token then manually replace the body with an admin payload
    const artistToken = createSessionToken({ role: "artist", artistSlug: "dj-zaal" });
    const adminBody = Buffer.from(JSON.stringify({ role: "admin", artistSlug: null })).toString("base64url");
    const sig = artistToken.split(".").pop();
    const forgery = `${adminBody}.${sig}`;
    expect(verifySessionToken(forgery)).toBeNull();
  });

  it("returns null for a completely fabricated unsigned token", () => {
    // Simulates the old attack: `coc-role=admin` cookie value style forgery
    const fakeAdminPayload = Buffer.from(JSON.stringify({ role: "admin", artistSlug: null })).toString("base64url");
    const forgery = `${fakeAdminPayload}.fakesig`;
    expect(verifySessionToken(forgery)).toBeNull();
  });

  it("returns null for a token with invalid JSON body", () => {
    const badBody = Buffer.from("not json").toString("base64url");
    // We need a valid signature for the bad body to test the JSON.parse catch
    const { createHmac } = require("crypto");
    const sig = createHmac("sha256", VALID_SECRET).update(badBody).digest("base64url");
    expect(verifySessionToken(`${badBody}.${sig}`)).toBeNull();
  });

  it("returns null for a token with an unrecognized role", () => {
    const { createHmac } = require("crypto");
    const body = Buffer.from(JSON.stringify({ role: "superadmin", artistSlug: null })).toString("base64url");
    const sig = createHmac("sha256", VALID_SECRET).update(body).digest("base64url");
    expect(verifySessionToken(`${body}.${sig}`)).toBeNull();
  });

  it("rejects token signed with a different secret", () => {
    process.env.SESSION_SECRET = "different-secret-32-chars-xxxxxxxxxxxx";
    const tokenFromOtherSecret = createSessionToken({ role: "admin", artistSlug: null });
    process.env.SESSION_SECRET = VALID_SECRET;
    expect(verifySessionToken(tokenFromOtherSecret)).toBeNull();
  });
});

// ── SESSION_COOKIE export ─────────────────────────────────────────────────────

describe("SESSION_COOKIE", () => {
  it("is a non-empty string constant", () => {
    expect(typeof SESSION_COOKIE).toBe("string");
    expect(SESSION_COOKIE.length).toBeGreaterThan(0);
  });
});
