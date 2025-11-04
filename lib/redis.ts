import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Cache keys
export const CACHE_KEYS = {
  LIVE_MATCH: 'arsenal:live_match',
  FIXTURES: (season: number) => `arsenal:fixtures:${season}`,
  STANDINGS: (season: number) => `arsenal:standings:${season}`,
  SQUAD: 'arsenal:squad',
  LEADERBOARD: (type: string) => `leaderboard:${type}`,
  MATCH_CHECKINS: (matchId: string) => `match:${matchId}:checkins`,
};

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  LIVE_MATCH: 30, // 30 seconds during live matches
  FIXTURES: 3600, // 1 hour
  STANDINGS: 3600, // 1 hour
  SQUAD: 604800, // 1 week
  LEADERBOARD: 60, // 1 minute
};

export default redis;
