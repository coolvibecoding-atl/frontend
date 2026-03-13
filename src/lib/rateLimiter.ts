import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface RateLimitConfig {
  free: { requests: number; window: number };
  pro: { requests: number; window: number };
  studio: { requests: number; window: number };
}

const CONFIG: RateLimitConfig = {
  free: { requests: 100, window: 3600 },      // 100/hour
  pro: { requests: 1000, window: 3600 },      // 1000/hour
  studio: { requests: 5000, window: 3600 }    // 5000/hour
};

export async function checkRateLimit(
  userId: string,
  tier: keyof typeof CONFIG,
  resource: string
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const key = `rate:${userId}:${tier}:${resource}`;
  const config = CONFIG[tier];
  
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, config.window);
  }
  
  const ttl = await redis.ttl(key);
  
  return {
    allowed: current <= config.requests,
    remaining: Math.max(0, config.requests - current),
    reset: Date.now() + (ttl * 1000)
  };
}

// Middleware for Next.js App Router
export function rateLimitMiddleware(handler: (request: Request) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    // Skip rate limiting for GET requests (can be adjusted)
    if (request.method === 'GET') {
      return handler(request);
    }
    
    // Get user ID from headers (would need to be set by authentication middleware)
    const userId = request.headers.get('x-user-id');
    const tier = (request.headers.get('x-user-tier') || 'free') as keyof typeof CONFIG;
    
    if (userId) {
      const resource = new URL(request.url).pathname;
      const rateLimit = await checkRateLimit(userId, tier, resource);
      
      if (!rateLimit.allowed) {
        return new Response('Rate limit exceeded', {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString()
          }
        });
      }
      
      // Add rate limit headers to response
      const response = await handler(request);
      response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
      response.headers.set('X-RateLimit-Reset', rateLimit.reset.toString());
      return response;
    }
    
    return handler(request);
  };
}