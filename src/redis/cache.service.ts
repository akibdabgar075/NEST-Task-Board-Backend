import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

interface CacheManagerType {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, options?: { ttl: number }): Promise<void>;
  del(key: string): Promise<void>;
  delete(key: string): Promise<void>;
  reset(): Promise<void>;
  wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T>;
}
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const redis = this.cacheManager as unknown as CacheManagerType;
    const data = await redis.get<T>(key);
    return data ?? null;
  }

  async set<T>(key: string, value: T, ttl: number) {
    const redis = this.cacheManager as unknown as CacheManagerType;
    await redis.set(key, value, { ttl });
  }

  async delete(key: string): Promise<void> {
    const redis = this.cacheManager as unknown as CacheManagerType;
    await redis.del(key);
  }

  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const redis = this.cacheManager as unknown as CacheManagerType;
    return redis.wrap<T>(key, fn, ttl);
  }
}
