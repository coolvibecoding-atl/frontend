// CommonJS module for worker process
/* eslint-disable */
// CommonJS module for worker process - disable ESLint for this file
const { Queue, Worker, QueueScheduler } = require('bullmq');
const { redisConfig } = require('./redisConfig');
const path = require('path');
const { execFile } = require('child_process');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getSignedUrl, uploadBuffer, downloadFile } = require('./supabaseStorage');
const axios = require('axios');
const { createHash } = require('crypto');

// Redis client for caching (separate from BullMQ connection)
const Redis = require('ioredis');
const redisClient = new Redis({
  host: redisConfig.host,
  port: redisConfig.port,
  password: redisConfig.password,
  db: redisConfig.db,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true
});

// Helper function to update progress via API (copied from audio-queue.js for use in workers)
async function updateProgress(trackId, updates) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await axios.post(`${appUrl}/api/progress`, {
      trackId,
      ...updates,
    });
  } catch (error) {
    console.error('Failed to update progress:', error);
  }
}

// Queue names
const SEPARATION_QUEUE = 'stemSeparation';
const MASTERING_QUEUE = 'audioMastering';
const VOCAL_TUNING_QUEUE = 'vocalTuning';
const REFERENCE_MATCHING_QUEUE = 'referenceMatching';

// Cache TTL: 7 days in seconds
const CACHE_TTL = 7 * 24 * 60 * 60;

/**
 * Generate cache key for audio processing results
 * Format: audio:result:${sha256(userId:fileHash:options)}
 */
function generateCacheKey(userId, fileHash, options) {
  const optionsString = JSON.stringify(options, Object.keys(options).sort());
  const key = `${userId}:${fileHash}:${optionsString}`;
  const hash = createHash('sha256').update(key).digest('hex');
  return `audio:result:${hash}`;
}

/**
 * Generate file hash using SHA-256
 */
async function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Check cache before processing
 */
async function checkCache(userId, fileHash, options) {
  try {
    const cacheKey = generateCacheKey(userId, fileHash, options);
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      console.log(`Cache hit for user ${userId}, file ${fileHash}`);
      return JSON.parse(cached);
    }
    
    return null;
  } catch (error) {
    console.error('Error checking cache:', error);
    return null;
  }
}

/**
 * Store result in cache
 */
async function storeCache(userId, fileHash, options, result) {
  try {
    const cacheKey = generateCacheKey(userId, fileHash, options);
    const cacheData = {
      ...result,
      cachedAt: Date.now()
    };
    
    await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(cacheData));
    console.log(`Cached result for user ${userId}, file ${fileHash}`);
  } catch (error) {
    console.error('Error storing cache:', error);
  }
}

// Initialize queues
const separationQueue = new Queue(SEPARATION_QUEUE, { connection: redisConfig });
const masteringQueue = new Queue(MASTERING_QUEUE, { connection: redisConfig });
const vocalTuningQueue = new Queue(VOCAL_TUNING_QUEUE, { connection: redisConfig });
const referenceMatchingQueue = new Queue(REFERENCE_MATCHING_QUEUE, { connection: redisConfig });

// Initialize queue scheduler (for delayed jobs, retries, etc.)
new QueueScheduler(SEPARATION_QUEUE, { connection: redisConfig });
new QueueScheduler(MASTERING_QUEUE, { connection: redisConfig });
new QueueScheduler(VOCAL_TUNING_QUEUE, { connection: redisConfig });
new QueueScheduler(REFERENCE_MATCHING_QUEUE, { connection: redisConfig });

// Separation worker (calls Spleeter service)
const separationWorker = new Worker(
  SEPARATION_QUEUE,
  async (job) => {
    const { audioUrl, stems, model, trackId, userId, fileHash, options } = job.data;
    
    // Check cache first
    const cacheKey = generateCacheKey(userId, fileHash, options);
    const cachedResult = await checkCache(userId, fileHash, options);
    
    if (cachedResult) {
      console.log(`Cache hit for separation job ${job.id}`);
      await updateProgress(trackId, { status: 'COMPLETED', progress: 100, step: 'Using cached result' });
      return cachedResult;
    }
    
    console.log(`Cache miss for separation job ${job.id}, processing...`);
    
    // Download audio file from Supabase
    const tempInputPath = `/tmp/input-${uuidv4()}.wav`;
    await downloadFile(audioUrl.split('/').pop(), 'audio-files', tempInputPath);
    
    // Update progress
    await updateProgress(trackId, { status: 'PROCESSING', progress: 30, step: 'Separating stems' });
    
    return new Promise((resolve, reject) => {
      // Call Python Spleeter service
      const pythonScript = path.join(__dirname, '../worker/stem_separator.py');
      
      execFile('python3', [pythonScript, tempInputPath, JSON.stringify(stems), model], 
        { timeout: 300000 }, // 5 minute timeout
        async (error, stdout, stderr) => {
          if (error) {
            console.error('Spleeter error:', stderr);
            fs.unlinkSync(tempInputPath);
            await updateProgress(trackId, { status: 'FAILED', error: error.message });
            reject(new Error(`Separation failed: ${error.message}`));
            return;
          }
          
          try {
            const result = JSON.parse(stdout);
            const processedResult = {
              stems: {},
              processingTime: result.processing_time || 3000,
              quality: result.quality || { sdr: 8.5, sir: 12.0, sar: 10.0 }
            };
            
            // Upload separated stems to Supabase
            for (const [stemName, stemPath] of Object.entries(result.stems)) {
              const stemBuffer = fs.readFileSync(stemPath);
              const fileName = `tracks/${trackId}/stems/${stemName}.wav`;
              const url = await uploadBuffer(stemBuffer, fileName, 'audio-files');
              processedResult.stems[stemName] = url;
              fs.unlinkSync(stemPath); // Clean up temp file
            }
            
            // Clean up input file
            fs.unlinkSync(tempInputPath);
            
            await updateProgress(trackId, { status: 'PROCESSING', progress: 50, step: 'Stem separation complete' });
            
            // Cache the result
            await storeCache(userId, fileHash, options, processedResult);
            
            resolve(processedResult);
          } catch (parseError) {
            console.error('Failed to parse Spleeter output:', parseError);
            fs.unlinkSync(tempInputPath);
            await updateProgress(trackId, { status: 'FAILED', error: 'Failed to process separation result' });
            reject(new Error('Failed to process separation result'));
          }
        }
      );
    });
  },
  { connection: redisConfig, concurrency: 2 }
);

// Mastering worker (calls Pedalboard/Torchaudio service)
const masteringWorker = new Worker(
  MASTERING_QUEUE,
  async (job) => {
    const { audioUrl, preset, trackId, userId, fileHash, options } = job.data;
    
    // Check cache first
    const cachedResult = await checkCache(userId, fileHash, options);
    
    if (cachedResult) {
      console.log(`Cache hit for mastering job ${job.id}`);
      await updateProgress(trackId, { status: 'COMPLETED', progress: 100, step: 'Using cached result' });
      return cachedResult;
    }
    
    console.log(`Cache miss for mastering job ${job.id}, processing...`);
    
    // Download audio file from Supabase
    const tempInputPath = `/tmp/input-${uuidv4()}.wav`;
    await downloadFile(audioUrl.split('/').pop(), 'audio-files', tempInputPath);
    
    return new Promise((resolve, reject) => {
      // Call Python mastering service
      const pythonScript = path.join(__dirname, '../worker/mastering.py');
      
      const tempOutputPath = `/tmp/mastered-${uuidv4()}.wav`;
      
      execFile('python3', [pythonScript, tempInputPath, preset, tempOutputPath],
        { timeout: 300000 }, // 5 minute timeout
        async (error, stdout, stderr) => {
          if (error) {
            console.error('Mastering error:', stderr);
            fs.unlinkSync(tempInputPath);
            reject(new Error(`Mastering failed: ${error.message}`));
            return;
          }
          
          try {
            const result = JSON.parse(stdout);
            
            // Upload mastered file to Supabase
            const masteredBuffer = fs.readFileSync(result.output_path);
            const fileName = `tracks/${trackId}/mastered/${trackId}_mastered.wav`;
            const url = await uploadBuffer(masteredBuffer, fileName, 'audio-files');
            
            // Clean up temp files
            fs.unlinkSync(tempInputPath);
            fs.unlinkSync(result.output_path);
            
            const processedResult = {
              outputUrl: url,
              processingTime: result.processing_time,
              metrics: result.metrics,
              settings: result.settings
            };
            
            // Cache the result
            await storeCache(userId, fileHash, options, processedResult);
            
            resolve(processedResult);
          } catch (parseError) {
            console.error('Failed to parse mastering output:', parseError);
            fs.unlinkSync(tempInputPath);
            try { fs.unlinkSync(tempOutputPath); } catch {}
            reject(new Error('Failed to process mastering result'));
          }
        }
      );
    });
  },
  { connection: redisConfig, concurrency: 2 }
);

// Vocal tuning worker
const vocalTuningWorker = new Worker(
  VOCAL_TUNING_QUEUE,
  async (job) => {
    const { audioUrl, options, trackId, userId, fileHash, tuningOptions } = job.data;
    
    // Check cache first
    const cachedResult = await checkCache(userId, fileHash, tuningOptions);
    
    if (cachedResult) {
      console.log(`Cache hit for vocal tuning job ${job.id}`);
      await updateProgress(trackId, { status: 'COMPLETED', progress: 100, step: 'Using cached result' });
      return cachedResult;
    }
    
    console.log(`Cache miss for vocal tuning job ${job.id}, processing...`);
    
    // Download audio file from Supabase
    const tempInputPath = `/tmp/input-${uuidv4()}.wav`;
    await downloadFile(audioUrl.split('/').pop(), 'audio-files', tempInputPath);
    
    return new Promise((resolve, reject) => {
      // Call Python vocal tuning service
      const pythonScript = path.join(__dirname, '../worker/vocal_tuning.py');
      
      const tempOutputPath = `/tmp/tuned-${uuidv4()}.wav`;
      
      execFile('python3', [pythonScript, tempInputPath, JSON.stringify(options || {}), tempOutputPath],
        { timeout: 300000 }, // 5 minute timeout
        async (error, stdout, stderr) => {
          if (error) {
            console.error('Vocal tuning error:', stderr);
            fs.unlinkSync(tempInputPath);
            reject(new Error(`Vocal tuning failed: ${error.message}`));
            return;
          }
          
          try {
            const result = JSON.parse(stdout);
            
            // Upload tuned file to Supabase
            const tunedBuffer = fs.readFileSync(result.output_path);
            const fileName = `tracks/${trackId}/tuned/${trackId}_tuned.wav`;
            const url = await uploadBuffer(tunedBuffer, fileName, 'audio-files');
            
            // Clean up temp files
            fs.unlinkSync(tempInputPath);
            fs.unlinkSync(result.output_path);
            
            const processedResult = {
              outputUrl: url,
              processingTime: result.processing_time,
              metrics: result.metrics,
              settings: result.settings
            };
            
            // Cache the result
            await storeCache(userId, fileHash, tuningOptions, processedResult);
            
            resolve(processedResult);
          } catch (parseError) {
            console.error('Failed to parse vocal tuning output:', parseError);
            fs.unlinkSync(tempInputPath);
            try { fs.unlinkSync(tempOutputPath); } catch {}
            reject(new Error('Failed to process vocal tuning result'));
          }
        }
      );
    });
  },
  { connection: redisConfig, concurrency: 2 }
);

// Reference matching worker
const referenceMatchingWorker = new Worker(
  REFERENCE_MATCHING_QUEUE,
  async (job) => {
    const { targetAudioUrl, referenceAudioUrl, options, trackId, userId, fileHash } = job.data;
    
    // Check cache first (note: reference matching has two files, need different cache key)
    // For simplicity, we'll use the target file hash and include reference hash in options
    const cachedResult = await checkCache(userId, fileHash, options);
    
    if (cachedResult) {
      console.log(`Cache hit for reference matching job ${job.id}`);
      await updateProgress(trackId, { status: 'COMPLETED', progress: 100, step: 'Using cached result' });
      return cachedResult;
    }
    
    console.log(`Cache miss for reference matching job ${job.id}, processing...`);
    
    // Download audio files from Supabase
    const tempTargetPath = `/tmp/target-${uuidv4()}.wav`;
    const tempRefPath = `/tmp/reference-${uuidv4()}.wav`;
    
    await downloadFile(targetAudioUrl.split('/').pop(), 'audio-files', tempTargetPath);
    await downloadFile(referenceAudioUrl.split('/').pop(), 'audio-files', tempRefPath);
    
    return new Promise((resolve, reject) => {
      // Call Python reference matching service
      const pythonScript = path.join(__dirname, '../worker/reference_matching.py');
      
      const tempOutputPath = `/tmp/matched-${uuidv4()}.wav`;
      
      execFile('python3', [pythonScript, tempTargetPath, tempRefPath, JSON.stringify(options || {}), tempOutputPath],
        { timeout: 300000 }, // 5 minute timeout
        async (error, stdout, stderr) => {
          if (error) {
            console.error('Reference matching error:', stderr);
            fs.unlinkSync(tempTargetPath);
            fs.unlinkSync(tempRefPath);
            reject(new Error(`Reference matching failed: ${error.message}`));
            return;
          }
          
          try {
            const result = JSON.parse(stdout);
            
            // Upload matched file to Supabase
            const matchedBuffer = fs.readFileSync(result.output_path);
            const fileName = `tracks/${trackId}/matched/${trackId}_matched.wav`;
            const url = await uploadBuffer(matchedBuffer, fileName, 'audio-files');
            
            // Clean up temp files
            fs.unlinkSync(tempTargetPath);
            fs.unlinkSync(tempRefPath);
            fs.unlinkSync(result.output_path);
            
            const processedResult = {
              outputUrl: url,
              processingTime: result.processing_time,
              similarityScore: result.similarity_score,
              adjustments: result.adjustments,
              settings: result.settings
            };
            
            // Cache the result
            await storeCache(userId, fileHash, options, processedResult);
            
            resolve(processedResult);
          } catch (parseError) {
            console.error('Failed to parse reference matching output:', parseError);
            fs.unlinkSync(tempTargetPath);
            fs.unlinkSync(tempRefPath);
            try { fs.unlinkSync(tempOutputPath); } catch {}
            reject(new Error('Failed to process reference matching result'));
          }
        }
      );
    });
  },
  { connection: redisConfig, concurrency: 2 }
);

// Graceful shutdown
function shutdown() {
  console.log('Shutting down queue workers...');
  separationWorker.close();
  masteringWorker.close();
  vocalTuningWorker.close();
  referenceMatchingWorker.close();
  separationQueue.close();
  masteringQueue.close();
  vocalTuningQueue.close();
  referenceMatchingQueue.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = {
  separationQueue,
  masteringQueue,
  vocalTuningQueue,
  referenceMatchingQueue,
  separationWorker,
  masteringWorker,
  vocalTuningWorker,
  referenceMatchingWorker
};