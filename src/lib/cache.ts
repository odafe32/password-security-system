/**
 * In-memory cache for frequently accessed data that rarely changes.
 * Reduces database calls for weak passwords, rules, and dictionary entries.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const cache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttlMs: number = CACHE_TTL_MS): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}

export function invalidateAll(): void {
  cache.clear();
}

// Cache keys
export const CACHE_KEYS = {
  weakPasswords: "weak_passwords",
  passwordRules: "password_rules",
  adminStats: "admin_stats",
} as const;
