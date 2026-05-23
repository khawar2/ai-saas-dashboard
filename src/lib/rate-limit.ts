type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(
  request: Request,
  options: {
    key: string;
    limit: number;
    windowMs: number;
  },
) {
  const now = Date.now();
  const bucketKey = `${options.key}:${getClientIp(request)}`;

  if (buckets.size > 10000) {
    for (const [key, value] of buckets.entries()) {
      if (value.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }

  const bucket = buckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + options.windowMs });
    return { ok: true as const };
  }

  if (bucket.count >= options.limit) {
    return {
      ok: false as const,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true as const };
}
