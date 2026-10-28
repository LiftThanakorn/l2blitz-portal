interface CacheEntry<T> {
  value: T;
  updatedAtIso: string;
  expiresAtMs: number;
}

/**
 * Lightweight In-Memory TTL Cache with Stale-While-Error support.
 * Designed specifically for low-RAM VPS (<500 THB/mo) where Redis is unnecessary overhead.
 */
export class InMemoryTtlCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxEntries: number;

  constructor(maxEntries = 200) {
    this.maxEntries = maxEntries;
  }

  public getFresh<T>(key: string): { value: T; updatedAtIso: string } | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAtMs) {
      return null;
    }
    return { value: entry.value as T, updatedAtIso: entry.updatedAtIso };
  }

  /**
   * Returns stale value even if TTL has expired, so if MySQL temporarily fails,
   * we can return clearly-labeled Stale Data with its exact `updatedAt` timestamp.
   */
  public getStale<T>(key: string): { value: T; updatedAtIso: string } | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    return { value: entry.value as T, updatedAtIso: entry.updatedAtIso };
  }

  public set<T>(key: string, value: T, ttlSeconds: number): string {
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }
    const updatedAtIso = new Date().toISOString();
    this.store.set(key, {
      value,
      updatedAtIso,
      expiresAtMs: Date.now() + ttlSeconds * 1000,
    });
    return updatedAtIso;
  }

  public clear(): void {
    this.store.clear();
  }
}

export const apiCache = new InMemoryTtlCache(250);
