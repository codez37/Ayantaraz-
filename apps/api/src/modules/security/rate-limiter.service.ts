import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RateLimiterService implements OnModuleDestroy {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly redis: RedisClientType;
  private connected = false;

  constructor(private config: ConfigService) {
    const redisUrl = this.config.getOrThrow<string>('REDIS_URL');
    this.redis = createClient({ url: redisUrl });

    this.redis.on('error', (err: Error) => {
      this.logger.error('Redis connection error', err.message);
    });

    this.redis
      .connect()
      .then(() => {
        this.connected = true;
        this.logger.log('Redis rate limiter connected');
      })
      .catch((err: Error) => {
        this.logger.error('Redis initial connection failed', err.message);
      });
  }

  async isAllowed(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<boolean> {
    if (!this.connected) {
      this.logger.warn('Redis not connected, allowing request');
      return true;
    }

    const now = Date.now();
    const windowKey = Math.floor(now / windowMs);
    const redisKey = `ratelimit:${key}:${windowKey}`;

    try {
      const pipeline = this.redis.multi();
      pipeline.incr(redisKey);
      pipeline.pExpire(redisKey, windowMs);
      const results = await pipeline.exec();

      if (!results) {
        this.logger.warn('Redis pipeline returned null');
        return true;
      }

      const count = (results[0] as unknown as number) || 0;
      return count <= limit;
    } catch (err) {
      this.logger.error('Rate limiter Redis error', (err as Error).message);
      return true;
    }
  }

  async reset(key: string): Promise<void> {
    if (!this.connected) return;
    const pattern = `ratelimit:${key}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.redis.quit();
    }
  }
}
