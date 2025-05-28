import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const redis = this.cacheManager;
    const data = await redis.get<T>(key);
    return data ?? null;
  }

  async set<T>(key: string, value: T, ttl: number) {
    await this.cacheManager.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    const redis = this.cacheManager;
    await redis.del(key);
  }
}
