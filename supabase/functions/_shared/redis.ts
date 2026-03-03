// supabase/functions/_shared/redis.ts
import { Redis } from "npm:@upstash/redis";

// Initialize Upstash Redis client
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables
export const redisUrl = Deno.env.get("UPSTASH_REDIS_REST_URL");
export const redisToken = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");

export const redis = (redisUrl && redisToken) ? new Redis({
    url: redisUrl,
    token: redisToken,
}) : null;

export async function getCache<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
        return await redis.get<T>(key);
    } catch (e) {
        console.error("Redis get error:", e);
        return null;
    }
}

export async function setCache(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    if (!redis) return;
    try {
        await redis.set(key, value, { ex: ttlSeconds });
    } catch (e) {
        console.error("Redis set error:", e);
    }
}
