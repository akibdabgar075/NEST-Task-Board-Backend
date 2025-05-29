import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';
import { CacheService } from './cache.service';

@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get<string>('REDIS_HOST') || 'localhost',
        port: config.get<number>('REDIS_PORT') || 6379,
        password: config.get<string>('REDIS_PASSWORD') || null,
        ttl: config.get<number>('REDIS_TTL') || 60,
      }),
    }),
  ],

  providers: [CacheService],
  exports: [CacheModule, CacheService],
})
export class RedisModule {}
