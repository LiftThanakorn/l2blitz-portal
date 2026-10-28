import type { Request, Response, NextFunction } from 'express';

interface RateBucket {
  count: number;
  resetAtMs: number;
}

/**
 * Lightweight In-Memory IP Rate Limiter to protect the VPS and MySQL database
 * from scraping or flood requests without adding external dependencies.
 */
export function createRateLimiter(options: { windowMs: number; maxRequests: number }) {
  const buckets = new Map<string, RateBucket>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    // Periodic cleanup if map grows over 2000 IPs
    if (buckets.size > 2000) {
      for (const [k, v] of buckets.entries()) {
        if (now > v.resetAtMs) buckets.delete(k);
      }
    }

    let bucket = buckets.get(ip);
    if (!bucket || now > bucket.resetAtMs) {
      bucket = { count: 1, resetAtMs: now + options.windowMs };
      buckets.set(ip, bucket);
    } else {
      bucket.count += 1;
    }

    res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, options.maxRequests - bucket.count)));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAtMs / 1000)));

    if (bucket.count > options.maxRequests) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'คำขอเกินขีดจำกัด กรุณารอสักครู่แล้วลองใหม่อีกครั้ง (Rate limit exceeded)',
        retryAfterSeconds: Math.ceil((bucket.resetAtMs - now) / 1000),
      });
      return;
    }

    next();
  };
}
