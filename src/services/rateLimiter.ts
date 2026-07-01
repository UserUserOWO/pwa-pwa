/**
 * Rate Limiter Service
 *
 * In-memory rate limiter for development.
 * For production, use Redis with sliding window.
 *
 * Limits:
 * - Registration: 5 per hour per IP
 * - Reviews: 20 per day per user
 * - Reports: 10 per hour per user
 * - Login: 10 per minute per IP
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();

  async checkLimit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      const resetAt = now + windowMs;
      this.store.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: maxRequests - 1, resetAt };
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const rateLimiter = new RateLimiter();

// ==================== SPECIFIC LIMITERS ====================

export async function checkRegistrationLimit(ip: string) {
  return rateLimiter.checkLimit(`register:${ip}`, 5, 60 * 60 * 1000);
}

export async function checkReviewLimit(userId: string) {
  return rateLimiter.checkLimit(`review:${userId}`, 20, 24 * 60 * 60 * 1000);
}

export async function checkReportLimit(userId: string) {
  return rateLimiter.checkLimit(`report:${userId}`, 10, 60 * 60 * 1000);
}

export async function checkLoginLimit(ip: string) {
  return rateLimiter.checkLimit(`login:${ip}`, 10, 60 * 1000);
}