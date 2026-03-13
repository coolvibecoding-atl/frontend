import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true,
    });
  }
  return redis;
}

export async function connectRedis(): Promise<Redis> {
  const client = getRedisClient();
  await client.connect();
  return client;
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export const REDIS_KEYS = {
  session: (sessionId: string) => `session:${sessionId}`,
  user: (userId: string) => `user:${userId}`,
  upload: (uploadId: string) => `upload:${uploadId}`,
  processing: (jobId: string) => `processing:${jobId}`,
  cache: (key: string) => `cache:${key}`,
  rateLimit: (userId: string) => `ratelimit:${userId}`,
  analytics: (date: string) => `analytics:${date}`,
};
