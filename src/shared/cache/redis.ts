import { Redis } from '@upstash/redis';
import { env, CACHE_TTL } from '@/config';
import { cacheLogger } from '@/shared/utils';

/**
 * Redis cache client using Upstash
 * Provides caching for papers, graphs, and user data
 */

let redisClient: Redis | null = null;

/**
 * Get the Redis client singleton
 */
export function getRedis(): Redis | null {
    if (!env.REDIS_URL || !env.REDIS_TOKEN) {
        cacheLogger.warn('Redis not configured - caching disabled');
        return null;
    }

    if (!redisClient) {
        redisClient = new Redis({
            url: env.REDIS_URL,
            token: env.REDIS_TOKEN,
        });
        cacheLogger.info('Redis client initialized');
    }

    return redisClient;
}

/**
 * Cache helper functions
 */
export const cache = {
    /**
     * Get a value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        const redis = getRedis();
        if (!redis) return null;

        try {
            const value = await redis.get<T>(key);
            if (value) {
                cacheLogger.debug({ key }, 'Cache hit');
            }
            return value;
        } catch (error) {
            cacheLogger.error({ error, key }, 'Cache get failed');
            return null;
        }
    },

    /**
     * Set a value in cache with TTL
     */
    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
        const redis = getRedis();
        if (!redis) return false;

        try {
            if (ttlSeconds) {
                await redis.setex(key, ttlSeconds, value);
            } else {
                await redis.set(key, value);
            }
            cacheLogger.debug({ key, ttl: ttlSeconds }, 'Cache set');
            return true;
        } catch (error) {
            cacheLogger.error({ error, key }, 'Cache set failed');
            return false;
        }
    },

    /**
     * Delete a key from cache
     */
    async del(key: string): Promise<boolean> {
        const redis = getRedis();
        if (!redis) return false;

        try {
            await redis.del(key);
            cacheLogger.debug({ key }, 'Cache delete');
            return true;
        } catch (error) {
            cacheLogger.error({ error, key }, 'Cache delete failed');
            return false;
        }
    },

    /**
     * Delete multiple keys matching a pattern
     */
    async delPattern(pattern: string): Promise<boolean> {
        const redis = getRedis();
        if (!redis) return false;

        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await Promise.all(keys.map(key => redis.del(key)));
                cacheLogger.debug({ pattern, count: keys.length }, 'Cache pattern delete');
            }
            return true;
        } catch (error) {
            cacheLogger.error({ error, pattern }, 'Cache pattern delete failed');
            return false;
        }
    },

    /**
     * Get or set - returns cached value or computes and caches it
     */
    async getOrSet<T>(
        key: string,
        computeFn: () => Promise<T>,
        ttlSeconds?: number
    ): Promise<T> {
        // Try cache first
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // Compute value
        const value = await computeFn();

        // Cache it
        await this.set(key, value, ttlSeconds);

        return value;
    },
};

// ==============================================
// CACHE KEY BUILDERS
// ==============================================

export const cacheKeys = {
    // Papers
    paper: (id: string) => `paper:${id}`,
    paperList: (category: string, page: number) => `papers:${category}:${page}`,
    paperSearch: (queryHash: string) => `search:${queryHash}`,
    trending: () => 'trending:global',

    // Concepts
    concept: (id: string) => `concept:${id}`,
    conceptBySlug: (slug: string) => `concept:slug:${slug}`,

    // Graph
    curiosityGraph: (userId: string, depth: number) => `graph:${userId}:${depth}`,
    nodeExpand: (nodeId: string) => `node:expand:${nodeId}`,

    // User
    userFeed: (userId: string) => `feed:${userId}`,
    userSaves: (userId: string) => `saves:${userId}`,
};

export { CACHE_TTL };
