import Redis from 'ioredis';
import { createHash } from 'crypto';

// Initialize Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

export interface ProcessingOptions {
  genre?: string;
  enableStemSeparation?: boolean;
  enableMastering?: boolean;
  stemSeparationOptions?: {
    quality?: 'fast' | 'balanced' | 'high';
    separateVocals?: boolean;
    separateDrums?: boolean;
    separateBass?: boolean;
    separateOther?: boolean;
  };
  masteringPreset?: string;
}

export interface ProcessingResult {
  // Generic result interface for caching any processing result
  data: unknown;
  processingTime: number;
  cachedAt: number;
}

export class AudioCache {
  // 7 days TTL as per industry recommendations
  private static readonly TTL = 7 * 24 * 60 * 60; // 7 days in seconds

  /**
   * Generate a cache key based on userId, fileHash, and processing options
   * Format: audio:result:${sha256(userId:fileHash:options)}
   */
  static async getCacheKey(
    userId: string,
    fileHash: string,
    options: ProcessingOptions
  ): Promise<string> {
    // Create a deterministic string representation of the options
    const optionsString = JSON.stringify(options, Object.keys(options).sort());
    const key = `${userId}:${fileHash}:${optionsString}`;
    
    // Hash the key using SHA-256
    const hash = createHash('sha256').update(key).digest('hex');
    
    return `audio:result:${hash}`;
  }

  /**
   * Get a cached result if available
   */
  static async getCachedResult(
    userId: string,
    fileHash: string,
    options: ProcessingOptions
  ): Promise<ProcessingResult | null> {
    try {
      const cacheKey = await this.getCacheKey(userId, fileHash, options);
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached result:', error);
      return null;
    }
  }

  /**
   * Cache a processing result
   */
  static async cacheResult(
    userId: string,
    fileHash: string,
    options: ProcessingOptions,
    result: ProcessingResult
  ): Promise<void> {
    try {
      const cacheKey = await this.getCacheKey(userId, fileHash, options);
      const cacheData: ProcessingResult = {
        ...result,
        cachedAt: Date.now()
      };
      
      await redis.setex(cacheKey, this.TTL, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching result:', error);
    }
  }

  /**
   * Generate hash for a file buffer (SHA-256)
   */
  static async hashFile(buffer: Buffer): Promise<string> {
    return createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Check if a result is cached without retrieving the full result
   */
  static async isCached(
    userId: string,
    fileHash: string,
    options: ProcessingOptions
  ): Promise<boolean> {
    try {
      const cacheKey = await this.getCacheKey(userId, fileHash, options);
      return await redis.exists(cacheKey) === 1;
    } catch (error) {
      console.error('Error checking cache:', error);
      return false;
    }
  }

  /**
   * Invalidate a cached result
   */
  static async invalidateCache(
    userId: string,
    fileHash: string,
    options: ProcessingOptions
  ): Promise<void> {
    try {
      const cacheKey = await this.getCacheKey(userId, fileHash, options);
      await redis.del(cacheKey);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
  }> {
    try {
      const keys = await redis.keys('audio:result:*');
      const info = await redis.info('memory');
      
      // Extract memory usage from Redis info
      const memoryMatch = info.match(/used_memory_human:(\d+\.\d+[KMG]?)/);
      const memoryUsage = memoryMatch ? memoryMatch[1] : '0';
      
      return {
        totalKeys: keys.length,
        memoryUsage
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalKeys: 0, memoryUsage: '0' };
    }
  }

  /**
   * Clear all audio cache entries (for testing/development)
   */
  static async clearAllAudioCache(): Promise<void> {
    try {
      const keys = await redis.keys('audio:result:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

/**
 * Worker-side caching wrapper for processing jobs
 * Checks cache before processing and stores result after processing
 */
export async function processWithCache<T>(
  job: {
    id: string;
    data: {
      userId: string;
      fileHash: string;
      options: ProcessingOptions;
      audioUrl?: string;
      trackId?: string;
    };
  },
  processor: (job: { id: string; data: Record<string, unknown> }) => Promise<T>
): Promise<T> {
  // Check cache first
  const cachedResult = await AudioCache.getCachedResult(
    job.data.userId,
    job.data.fileHash,
    job.data.options
  );

  if (cachedResult) {
    console.log(`Cache hit for job ${job.id}`);
    return cachedResult.data as T;
  }

  console.log(`Cache miss for job ${job.id}, processing...`);
  
  // Process the job
  const result = await processor(job);

  // Cache the result
  await AudioCache.cacheResult(
    job.data.userId,
    job.data.fileHash,
    job.data.options,
    {
      data: result,
      processingTime: 0, // Will be calculated by the processor
      cachedAt: Date.now()
    }
  );

  return result;
}

// Export Redis instance for direct use if needed
export { redis };
