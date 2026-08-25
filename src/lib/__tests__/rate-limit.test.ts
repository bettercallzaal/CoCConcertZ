import { describe, it, expect } from "vitest";
import { clientIp, createRateLimiter } from "../rate-limit";

// ── clientIp ──────────────────────────────────────────────────────────────────

function req(headers: Record<string, string | null>) {
  return { headers: { get: (k: string) => headers[k.toLowerCase()] ?? null } };
}

describe("clientIp", () => {
  it("returns first IP from x-forwarded-for when multiple are present", () => {
    expect(clientIp(req({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("1.2.3.4");
  });

  it("trims whitespace from x-forwarded-for", () => {
    expect(clientIp(req({ "x-forwarded-for": "  9.9.9.9  " }))).toBe("9.9.9.9");
  });

  it("returns x-real-ip when x-forwarded-for is absent", () => {
    expect(clientIp(req({ "x-real-ip": "10.0.0.1" }))).toBe("10.0.0.1");
  });

  it("falls back to 'unknown' when both headers are missing", () => {
    expect(clientIp(req({}))).toBe("unknown");
  });

  it("prefers x-forwarded-for over x-real-ip", () => {
    expect(clientIp(req({ "x-forwarded-for": "1.1.1.1", "x-real-ip": "2.2.2.2" }))).toBe("1.1.1.1");
  });

  it("returns 'unknown' when x-forwarded-for is an empty string", () => {
    expect(clientIp(req({ "x-forwarded-for": "" }))).toBe("unknown");
  });
});

// ── createRateLimiter ─────────────────────────────────────────────────────────

describe("createRateLimiter", () => {
  it("allows the first request", () => {
    const isLimited = createRateLimiter(3, 60_000);
    expect(isLimited("1.2.3.4", 1000)).toBe(false);
  });

  it("allows up to maxAttempts within the window", () => {
    const isLimited = createRateLimiter(3, 60_000);
    const ip = "1.2.3.4";
    expect(isLimited(ip, 1000)).toBe(false); // 1
    expect(isLimited(ip, 2000)).toBe(false); // 2
    expect(isLimited(ip, 3000)).toBe(false); // 3
    expect(isLimited(ip, 4000)).toBe(true);  // 4 > max
  });

  it("resets the window after it expires", () => {
    const isLimited = createRateLimiter(2, 1000);
    const ip = "2.3.4.5";
    isLimited(ip, 0);   // 1
    isLimited(ip, 100); // 2
    isLimited(ip, 200); // 3 — now limited
    // 2000ms later the window has expired
    expect(isLimited(ip, 2000)).toBe(false); // fresh window
  });

  it("does not share state between different IPs", () => {
    const isLimited = createRateLimiter(1, 60_000);
    expect(isLimited("a.a.a.a", 0)).toBe(false);
    expect(isLimited("b.b.b.b", 0)).toBe(false);
    expect(isLimited("a.a.a.a", 1)).toBe(true); // a is limited after 2nd attempt
    expect(isLimited("b.b.b.b", 1)).toBe(true); // b is limited after 2nd attempt
    // a fresh IP is not affected
    expect(isLimited("c.c.c.c", 1)).toBe(false);
  });

  it("each createRateLimiter() call has isolated state", () => {
    const lim1 = createRateLimiter(1, 60_000);
    const lim2 = createRateLimiter(1, 60_000);
    const ip = "x.x.x.x";
    lim1(ip, 0); // 1st attempt on lim1
    lim1(ip, 1); // 2nd — lim1 is now limited
    expect(lim1(ip, 2)).toBe(true);
    expect(lim2(ip, 2)).toBe(false); // lim2 has no state for this IP
  });
});
