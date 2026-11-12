import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';

interface CacheEntry {
  value: string;
  expiresAt: number | null;
}

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly memoryStore = new Map<string, CacheEntry>();
  private readonly setStore = new Map<string, Set<string>>();
  private readonly hashStore = new Map<string, Map<string, string>>();
  private isConnected = false;

  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {
    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Connected to Redis');
    });

    this.client.on('error', (err) => {
      if (this.isConnected) {
        this.logger.warn(`Redis connection error: ${err.message}. Falling back to in-memory store.`);
      }
      this.isConnected = false;
    });
  }

  private cleanExpired(key: string): boolean {
    const entry = this.memoryStore.get(key);
    if (!entry) return false;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memoryStore.delete(key);
      return false;
    }
    return true;
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected) {
      try {
        return await this.client.get(key);
      } catch {
        // Fallback to memory
      }
    }
    if (!this.cleanExpired(key)) return null;
    return this.memoryStore.get(key)?.value ?? null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch {
        // Fallback to memory
      }
    }
    this.memoryStore.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.del(key);
      } catch {
        // Fallback to memory
      }
    }
    this.memoryStore.delete(key);
    this.setStore.delete(key);
    this.hashStore.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    if (this.isConnected) {
      try {
        const result = await this.client.exists(key);
        return result === 1;
      } catch {
        // Fallback to memory
      }
    }
    return this.cleanExpired(key);
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const val = await this.get(key);
    if (!val) return null;
    try {
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  }

  async incr(key: string): Promise<number> {
    if (this.isConnected) {
      try {
        return await this.client.incr(key);
      } catch {
        // Fallback to memory
      }
    }
    this.cleanExpired(key);
    const current = parseInt(this.memoryStore.get(key)?.value || '0', 10);
    const next = current + 1;
    this.memoryStore.set(key, { value: next.toString(), expiresAt: null });
    return next;
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.expire(key, seconds);
        return;
      } catch {
        // Fallback to memory
      }
    }
    const entry = this.memoryStore.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + seconds * 1000;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (this.isConnected) {
      try {
        return await this.client.keys(pattern);
      } catch {
        // Fallback to memory
      }
    }
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matching: string[] = [];
    for (const key of this.memoryStore.keys()) {
      if (this.cleanExpired(key) && regex.test(key)) {
        matching.push(key);
      }
    }
    return matching;
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.hset(key, field, value);
        return;
      } catch {
        // Fallback to memory
      }
    }
    if (!this.hashStore.has(key)) {
      this.hashStore.set(key, new Map());
    }
    this.hashStore.get(key)!.set(field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    if (this.isConnected) {
      try {
        return await this.client.hget(key, field);
      } catch {
        // Fallback to memory
      }
    }
    return this.hashStore.get(key)?.get(field) ?? null;
  }

  async hdel(key: string, field: string): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.hdel(key, field);
        return;
      } catch {
        // Fallback to memory
      }
    }
    this.hashStore.get(key)?.delete(field);
  }

  async smembers(key: string): Promise<string[]> {
    if (this.isConnected) {
      try {
        return await this.client.smembers(key);
      } catch {
        // Fallback to memory
      }
    }
    const set = this.setStore.get(key);
    return set ? Array.from(set) : [];
  }

  async sadd(key: string, member: string): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.sadd(key, member);
        return;
      } catch {
        // Fallback to memory
      }
    }
    if (!this.setStore.has(key)) {
      this.setStore.set(key, new Set());
    }
    this.setStore.get(key)!.add(member);
  }

  async srem(key: string, member: string): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.srem(key, member);
        return;
      } catch {
        // Fallback to memory
      }
    }
    this.setStore.get(key)?.delete(member);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    if (this.isConnected) {
      try {
        const result = await this.client.sismember(key, member);
        return result === 1;
      } catch {
        // Fallback to memory
      }
    }
    return this.setStore.get(key)?.has(member) ?? false;
  }
}
