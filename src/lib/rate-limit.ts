const DEFAULT_MAX = 5;
const DEFAULT_WINDOW_MS = 60_000;

/** Extract the real client IP from Next.js request headers. */
export function clientIp(request: { headers: { get(name: string): string | null } }): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : "").trim() || request.headers.get("x-real-ip") || "unknown";
}

/**
 * Returns an isRateLimited() function backed by its own Map so callers get
 * isolated state — useful for tests (each test creates its own limiter) and
 * for module-level singletons in API routes.
 */
export function createRateLimiter(maxAttempts = DEFAULT_MAX, windowMs = DEFAULT_WINDOW_MS) {
  const map = new Map<string, { count: number; resetAt: number }>();
  return function isRateLimited(ip: string, now = Date.now()): boolean {
    const rec = map.get(ip);
    if (!rec || now > rec.resetAt) {
      map.set(ip, { count: 1, resetAt: now + windowMs });
      return false;
    }
    rec.count += 1;
    return rec.count > maxAttempts;
  };
}
