type RateLimitEntry = { count: number; resetAt: number };

const rateLimitStore = new Map<string, RateLimitEntry>();

function getRateLimitState(key: string) {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing) {
    return { count: 0, resetAt: now + 15 * 60 * 1000 };
  }

  if (existing.resetAt <= now) {
    rateLimitStore.delete(key);
    return { count: 0, resetAt: now + 15 * 60 * 1000 };
  }

  return existing;
}

async function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (existing.count >= limit) {
    return { success: false };
  }

  existing.count += 1;
  return { success: true };
}

// Login Limiter: 5 requests per 15 minutes per IP:Email combination
export const loginRateLimit = {
  async limit(key: string) {
    return checkRateLimit(key, 5, 15 * 60 * 1000);
  },
};

// Registration Limiter: 3 requests per 1 hour per IP
export const registrationRateLimit = {
  async limit(key: string) {
    return checkRateLimit(key, 3, 60 * 60 * 1000);
  },
};

// Password Reset Limiter: 3 requests per 1 hour per IP:Email
export const passwordResetRateLimit = {
  async limit(key: string) {
    return checkRateLimit(key, 3, 60 * 60 * 1000);
  },
};

// Email Verification Limiter: 3 requests per 1 hour per IP:Email
export const emailVerificationRateLimit = {
  async limit(key: string) {
    return checkRateLimit(key, 3, 60 * 60 * 1000);
  },
};

// Webhook Limiter: 100 requests per 1 minute per IP
export const webhookRateLimit = {
  async limit(key: string) {
    return checkRateLimit(key, 100, 60 * 1000);
  },
};

// General API Limiter: 100 requests per 1 minute per IP
export const apiRateLimit = {
  async limit(key: string) {
    return checkRateLimit(key, 100, 60 * 1000);
  },
};
