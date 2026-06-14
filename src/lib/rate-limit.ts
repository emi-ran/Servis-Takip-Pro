type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, RateLimitEntry>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  // Clean up expired entries to prevent memory leaks
  for (const [k, e] of attempts.entries()) {
    if (e.resetAt <= now) {
      attempts.delete(k);
    }
  }

  const entry = attempts.get(key);

  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return { limited: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  attempts.set(key, entry);

  return { limited: false, retryAfter: 0 };
}

export function clearRateLimit(key: string) {
  attempts.delete(key);
}
