/**
 * Cache Service
 *
 * Currently uses in-memory Map. Replace with Redis in production.
 * Future: swap MemoryCache with RedisCache — single import change.
 */

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  del(key: string): Promise<void>;
  flush(): Promise<void>;
}

class MemoryCache implements CacheService {
  private store = new Map<string, { value: unknown; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs = 300_000): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async flush(): Promise<void> {
    this.store.clear();
  }
}

/** TODO: Implement Redis cache */
class RedisCache implements CacheService {
  async get<T>(_key: string): Promise<T | null> {
    throw new Error("Redis not implemented yet");
  }
  async set<T>(_key: string, _value: T, _ttlMs?: number): Promise<void> {
    throw new Error("Redis not implemented yet");
  }
  async del(_key: string): Promise<void> {
    throw new Error("Redis not implemented yet");
  }
  async flush(): Promise<void> {
    throw new Error("Redis not implemented yet");
  }
}

export const cache: CacheService = new MemoryCache();