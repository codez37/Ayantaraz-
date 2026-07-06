interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
}

export class IdempotencyCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private readonly maxAge: number;
  private readonly maxSize: number;

  constructor(maxAgeMs = 300_000, maxSize = 500) {
    this.maxAge = maxAgeMs;
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.store.delete(key);
      return undefined;
    }
    entry.hits++;
    return entry.value as T;
  }

  set<T>(key: string, value: T): void {
    if (this.store.size >= this.maxSize) {
      this.evict();
    }
    this.store.set(key, { value, timestamp: Date.now(), hits: 0 });
  }

  buildKey(message: string, sessionId?: string): string {
    const normalized = message.trim().toLowerCase();
    return `${sessionId || 'anon'}:${normalized}`;
  }

  private evict(): void {
    // Remove oldest entries
    const entries = [...this.store.entries()].sort(
      (a, b) => a[1].timestamp - b[1].timestamp,
    );
    const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2));
    for (const [key] of toRemove) {
      this.store.delete(key);
    }
  }
}
