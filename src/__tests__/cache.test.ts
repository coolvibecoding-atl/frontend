/* eslint-disable @typescript-eslint/no-require-imports */
import { AudioCache, processWithCache, ProcessingOptions, ProcessingResult } from '@/lib/cache';

// Mock Redis module
jest.mock('ioredis', () => {
  // Create mock functions
  const mockGet = jest.fn();
  const mockSetex = jest.fn();
  const mockExists = jest.fn();
  const mockDel = jest.fn();
  const mockKeys = jest.fn();
  const mockInfo = jest.fn();
  
  // Export them so tests can reference them
  const mockRedis = {
    mockGet,
    mockSetex,
    mockExists,
    mockDel,
    mockKeys,
    mockInfo
  };
  
  // Store on global for test access
  (global as Record<string, unknown>).__mockRedis = mockRedis;
  
  return jest.fn().mockImplementation(() => ({
    get: mockGet,
    setex: mockSetex,
    exists: mockExists,
    del: mockDel,
    keys: mockKeys,
    info: mockInfo
  }));
});

// Helper to get mock functions
const getMockRedis = () => (global as Record<string, unknown>).__mockRedis as {
  mockGet: jest.Mock;
  mockSetex: jest.Mock;
  mockExists: jest.Mock;
  mockDel: jest.Mock;
  mockKeys: jest.Mock;
  mockInfo: jest.Mock;
};

describe('AudioCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mocks = getMockRedis();
    if (mocks) {
      mocks.mockGet.mockReset();
      mocks.mockSetex.mockReset();
      mocks.mockExists.mockReset();
      mocks.mockDel.mockReset();
      mocks.mockKeys.mockReset();
      mocks.mockInfo.mockReset();
    }
  });

  describe('getCacheKey', () => {
    it('should generate consistent cache keys for same inputs', async () => {
      const userId = 'user-123';
      const fileHash = 'abc123';
      const options: ProcessingOptions = {
        genre: 'pop',
        enableStemSeparation: true,
        enableMastering: false
      };

      const key1 = await AudioCache.getCacheKey(userId, fileHash, options);
      const key2 = await AudioCache.getCacheKey(userId, fileHash, options);

      expect(key1).toBe(key2);
      expect(key1).toMatch(/^audio:result:/);
    });

    it('should generate different cache keys for different options', async () => {
      const userId = 'user-123';
      const fileHash = 'abc123';
      const options1: ProcessingOptions = {
        genre: 'pop',
        enableStemSeparation: true,
        enableMastering: false
      };
      const options2: ProcessingOptions = {
        genre: 'rock',
        enableStemSeparation: true,
        enableMastering: false
      };

      const key1 = await AudioCache.getCacheKey(userId, fileHash, options1);
      const key2 = await AudioCache.getCacheKey(userId, fileHash, options2);

      expect(key1).not.toBe(key2);
    });

    it('should generate different cache keys for different user IDs', async () => {
      const fileHash = 'abc123';
      const options: ProcessingOptions = {
        genre: 'pop',
        enableStemSeparation: true
      };

      const key1 = await AudioCache.getCacheKey('user-123', fileHash, options);
      const key2 = await AudioCache.getCacheKey('user-456', fileHash, options);

      expect(key1).not.toBe(key2);
    });

    it('should generate different cache keys for different file hashes', async () => {
      const userId = 'user-123';
      const options: ProcessingOptions = {
        genre: 'pop',
        enableStemSeparation: true
      };

      const key1 = await AudioCache.getCacheKey(userId, 'hash1', options);
      const key2 = await AudioCache.getCacheKey(userId, 'hash2', options);

      expect(key1).not.toBe(key2);
    });
  });

  describe('hashFile', () => {
    it('should generate SHA-256 hash for file buffer', async () => {
      const buffer = Buffer.from('test audio content');
      const hash = await AudioCache.hashFile(buffer);

      expect(hash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 is 64 hex characters
    });

    it('should generate consistent hashes for same content', async () => {
      const buffer1 = Buffer.from('test audio content');
      const buffer2 = Buffer.from('test audio content');
      
      const hash1 = await AudioCache.hashFile(buffer1);
      const hash2 = await AudioCache.hashFile(buffer2);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different content', async () => {
      const buffer1 = Buffer.from('test audio content');
      const buffer2 = Buffer.from('different audio content');
      
      const hash1 = await AudioCache.hashFile(buffer1);
      const hash2 = await AudioCache.hashFile(buffer2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('getCachedResult and cacheResult', () => {
    it('should return null when cache miss', async () => {
      getMockRedis().mockGet.mockResolvedValue(null);

      const result = await AudioCache.getCachedResult(
        'user-123',
        'abc123',
        { genre: 'pop' }
      );

      expect(result).toBeNull();
    });

    it('should return cached result when available', async () => {
      const cachedData = {
        data: { outputUrl: 'test-url' },
        processingTime: 1000,
        cachedAt: Date.now()
      };
      getMockRedis().mockGet.mockResolvedValue(JSON.stringify(cachedData));

      const result = await AudioCache.getCachedResult(
        'user-123',
        'abc123',
        { genre: 'pop' }
      );

      expect(result).toEqual(cachedData);
    });

    it('should cache result with correct TTL', async () => {
      getMockRedis().mockSetex.mockResolvedValue('OK');

      const result: ProcessingResult = {
        data: { outputUrl: 'test-url' },
        processingTime: 1000,
        cachedAt: Date.now()
      };

      await AudioCache.cacheResult(
        'user-123',
        'abc123',
        { genre: 'pop' },
        result
      );

      expect(getMockRedis().mockSetex).toHaveBeenCalledWith(
        expect.stringMatching(/^audio:result:/),
        7 * 24 * 60 * 60, // 7 days TTL
        expect.any(String)
      );
    });
  });

  describe('isCached', () => {
    it('should return false when cache miss', async () => {
      getMockRedis().mockExists.mockResolvedValue(0);

      const isCached = await AudioCache.isCached(
        'user-123',
        'abc123',
        { genre: 'pop' }
      );

      expect(isCached).toBe(false);
    });

    it('should return true when cache hit', async () => {
      getMockRedis().mockExists.mockResolvedValue(1);

      const isCached = await AudioCache.isCached(
        'user-123',
        'abc123',
        { genre: 'pop' }
      );

      expect(isCached).toBe(true);
    });
  });

  describe('invalidateCache', () => {
    it('should delete cache entry', async () => {
      getMockRedis().mockDel.mockResolvedValue(1);

      await AudioCache.invalidateCache(
        'user-123',
        'abc123',
        { genre: 'pop' }
      );

      expect(getMockRedis().mockDel).toHaveBeenCalledWith(expect.stringMatching(/^audio:result:/));
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      getMockRedis().mockKeys.mockResolvedValue(['audio:result:1', 'audio:result:2', 'audio:result:3']);
      getMockRedis().mockInfo.mockResolvedValue('used_memory_human:1.23M');

      const stats = await AudioCache.getCacheStats();

      expect(stats.totalKeys).toBe(3);
      expect(stats.memoryUsage).toBe('1.23M');
    });
  });

  describe('clearAllAudioCache', () => {
    it('should delete all audio cache entries', async () => {
      getMockRedis().mockKeys.mockResolvedValue(['audio:result:1', 'audio:result:2']);
      getMockRedis().mockDel.mockResolvedValue(2);

      await AudioCache.clearAllAudioCache();

      expect(getMockRedis().mockKeys).toHaveBeenCalledWith('audio:result:*');
      expect(getMockRedis().mockDel).toHaveBeenCalledWith('audio:result:1', 'audio:result:2');
    });
  });
});

describe('processWithCache', () => {
  it('should return cached result when available', async () => {
    const cachedData = {
      data: { outputUrl: 'cached-url' },
      processingTime: 500,
      cachedAt: Date.now()
    };
    getMockRedis().mockGet.mockResolvedValue(JSON.stringify(cachedData));

    const job = {
      id: 'job-123',
      data: {
        userId: 'user-123',
        fileHash: 'abc123',
        options: { genre: 'pop' }
      }
    };

    const mockProcessor = jest.fn();
    const result = await processWithCache(job, mockProcessor);

    expect(result).toEqual({ outputUrl: 'cached-url' });
    expect(mockProcessor).not.toHaveBeenCalled();
  });

  it('should call processor on cache miss and cache result', async () => {
    getMockRedis().mockGet.mockResolvedValue(null);
    getMockRedis().mockSetex.mockResolvedValue('OK');

    const job = {
      id: 'job-123',
      data: {
        userId: 'user-123',
        fileHash: 'abc123',
        options: { genre: 'pop' }
      }
    };

    const processedResult = { outputUrl: 'new-url' };
    const mockProcessor = jest.fn().mockResolvedValue(processedResult);
    
    const result = await processWithCache(job, mockProcessor);

    expect(result).toEqual(processedResult);
    expect(mockProcessor).toHaveBeenCalledWith(job);
    expect(getMockRedis().mockSetex).toHaveBeenCalled();
  });
});
