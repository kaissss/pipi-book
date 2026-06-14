import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class BookingRedisLockService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BookingRedisLockService.name);
  private redis: Redis;
  private readonly lockPrefix = 'slot_lock:';

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('redis.url');
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      lazyConnect: false,
    });

    this.redis.on('connect', () =>
      this.logger.log('Redis connected for slot locking'),
    );
    this.redis.on('error', (err) =>
      this.logger.error({ message: 'Redis error', error: err.message }),
    );
  }

  async onModuleDestroy() {
    await this.redis.quit();
    this.logger.log('Redis disconnected');
  }

  /**
   * Acquire a slot lock using SET NX EX (atomic).
   * Returns true if lock was acquired, false if already locked by another owner.
   */
  async acquireLock(slotId: string, ownerId: string): Promise<boolean> {
    const key = this.lockPrefix + slotId;
    const ttl = this.configService.get<number>('redis.slotLockTtl', 300);

    const result = await this.redis.set(key, ownerId, 'EX', ttl, 'NX');
    const acquired = result === 'OK';

    this.logger.log({
      message: acquired ? 'Slot lock acquired' : 'Slot lock failed – already locked',
      slotId,
      ownerId,
      ttlSeconds: ttl,
    });

    return acquired;
  }

  /**
   * Release a lock only if the caller is the owner (Lua script for atomicity).
   */
  async releaseLock(slotId: string, ownerId: string): Promise<boolean> {
    const key = this.lockPrefix + slotId;
    const script = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;

    const result = await this.redis.eval(script, 1, key, ownerId);
    const released = result === 1;

    this.logger.log({
      message: released ? 'Slot lock released' : 'Slot lock release skipped (not owner)',
      slotId,
      ownerId,
    });

    return released;
  }

  /**
   * Check who currently holds a lock.
   */
  async getLockOwner(slotId: string): Promise<string | null> {
    return this.redis.get(this.lockPrefix + slotId);
  }

  /**
   * Check if a slot is currently locked.
   */
  async isLocked(slotId: string): Promise<boolean> {
    const owner = await this.getLockOwner(slotId);
    return owner !== null;
  }

  /**
   * Get remaining TTL for a lock in seconds.
   */
  async getLockTtl(slotId: string): Promise<number> {
    return this.redis.ttl(this.lockPrefix + slotId);
  }

  /**
   * Force-release a lock (admin use or cleanup).
   */
  async forceRelease(slotId: string): Promise<void> {
    await this.redis.del(this.lockPrefix + slotId);
    this.logger.warn({ message: 'Slot lock force-released', slotId });
  }
}
