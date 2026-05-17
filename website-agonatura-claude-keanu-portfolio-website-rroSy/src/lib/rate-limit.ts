/**
 * In-memory token bucket per key. Geschikt voor lichte misbruikbescherming
 * binnen een enkele Node-proces (dev / single-instance). Voor productie:
 * vervang door een gedeelde store (Upstash, Redis).
 */

type Bucket = { tokens: number; last: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { allowed: boolean; remaining: number; resetMs: number };

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const refillPerMs = limit / windowMs;
  const b = buckets.get(key) ?? { tokens: limit, last: now };
  const elapsed = Math.max(0, now - b.last);
  b.tokens = Math.min(limit, b.tokens + elapsed * refillPerMs);
  b.last = now;
  if (b.tokens < 1) {
    buckets.set(key, b);
    const resetMs = Math.ceil((1 - b.tokens) / refillPerMs);
    return { allowed: false, remaining: 0, resetMs };
  }
  b.tokens -= 1;
  buckets.set(key, b);
  return { allowed: true, remaining: Math.floor(b.tokens), resetMs: 0 };
}

export function clientIpFromHeaders(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "0.0.0.0";
}
