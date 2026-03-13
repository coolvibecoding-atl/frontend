/* eslint-disable */
const { separationQueue, masteringQueue, vocalTuningQueue, referenceMatchingQueue } = require('./queue.mjs');
const { getSignedUrl, uploadFile } = require('./supabaseStorage');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const prisma = new PrismaClient();

// Helper function to update progress via API
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

/**
 * Add an audio processing job to the appropriate queues
 * @param {Object} jobData - Data for the audio processing job
 * @param {string} jobData.trackId - ID of the track to process
 * @param {string} jobData.userId - ID of the user who owns the track
 * @param {string} jobData.filename - Original filename
 * @param {string} jobData.storedFilename - Stored filename in storage
 * @param {string} jobData.fileType - MIME type of the file
 * @param {Object} jobData.options - Processing options
 * @returns {Promise<string>} Job ID
 */
async function addAudioJob(jobData) {
  const { trackId, userId, filename, storedFilename, fileType, options = {} } = jobData;
  
  // Get the signed URL for the input file
  const inputUrl = await getSignedUrl(storedFilename);
  
  // Create a job that encompasses the full processing pipeline
  // For simplicity, we're creating a single job that will orchestrate the subprocesses
  // In a more complex implementation, each step could be a separate job
  
  const job = await separationQueue.add('process-track', {
    trackId,
    userId,
    filename,
    storedFilename,
    fileType,
    inputUrl,
    options: {
      enableStemSeparation: options.enableStemSeparation || false,
      enableMastering: options.enableMastering || false,
      enableVocalTuning: options.enableVocalTuning || false,
      enableReferenceMatching: options.enableReferenceMatching || false,
      stemSeparationOptions: options.stemSeparationOptions || {},
      masteringPreset: options.masteringPreset || 'transparent',
      vocalOptions: options.vocalOptions || {},
      referenceOptions: options.referenceOptions || {},
      referenceFileUrl: options.referenceFileUrl || null
    }
  }, {
    // Job options
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000 // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
      count: 500 // Keep max 500 failed jobs
    }
  });
  
  return job.id;
}

/**
 * Process a track through the full audio processing pipeline
 * This function would be called by a worker that processes the separationQueue
 * In a real implementation, this would be in a separate worker process
 */
async function processTrackJob(job) {
  const { trackId, userId, filename, storedFilename, fileType, inputUrl, options } = job.data;
  
  try {
    // Update track status to processing
    await prisma.track.update({
      where: { id: trackId },
      data: { status: 'PROCESSING' }
    });
    
    await updateProgress(trackId, { status: 'PROCESSING', progress: 10, step: 'Starting processing' });
    
    let currentAudioUrl = inputUrl;
    
    // Step 1: Stem separation (if enabled)
    if (options.enableStemSeparation) {
      await updateProgress(trackId, { status: 'PROCESSING', progress: 20, step: 'Separating stems' });
      
      const separationJobId = await separationQueue.add('separate-stems', {
        trackId,
        audioUrl: currentAudioUrl,
        stems: options.stemSeparationOptions?.stems || ['vocals', 'drums', 'bass', 'other'],
        model: options.stemSeparationOptions?.model || 'spleeter:4stems'
      }, {
        jobId: `${trackId}-separation-${Date.now()}`
      });
      
      // In a real implementation, we would wait for the separation job to complete
      // For now, we'll simulate that it returns stem files
      // The actual implementation would need to handle job completion events
    }
    
    // Step 2: Mastering (if enabled)
    if (options.enableMastering) {
      await updateProgress(trackId, { status: 'PROCESSING', progress: 40, step: 'Applying mastering' });
      
      const masteringJobId = await masteringQueue.add('master-audio', {
        trackId,
        audioUrl: currentAudioUrl,
        preset: options.masteringPreset || 'transparent'
      }, {
        jobId: `${trackId}-mastering-${Date.now()}`
      });
    }
    
    // Step 3: Vocal tuning (if enabled)
    if (options.enableVocalTuning) {
      await updateProgress(trackId, { status: 'PROCESSING', progress: 60, step: 'Tuning vocals' });
      
      const vocalTuningJobId = await vocalTuningQueue.add('tune-vocals', {
        trackId,
        audioUrl: currentAudioUrl,
        options: options.vocalOptions || {}
      }, {
        jobId: `${trackId}-vocal-${Date.now()}`
      });
    }
    
    // Step 4: Reference matching (if enabled and reference provided)
    if (options.enableReferenceMatching && options.referenceFileUrl) {
      await updateProgress(trackId, { status: 'PROCESSING', progress: 80, step: 'Matching to reference' });
      
      const referenceJobId = await referenceMatchingQueue.add('match-reference', {
        trackId,
        targetAudioUrl: currentAudioUrl,
        referenceAudioUrl: options.referenceFileUrl,
        options: options.referenceOptions || {}
      }, {
        jobId: `${trackId}-reference-${Date.now()}`
      });
    }
    
    // Update track to indicate processing is queued (actual processing happens in workers)
    await prisma.track.update({
      where: { id: trackId },
      data: { 
        status: 'PROCESSING',
        updatedAt: new Date()
      }
    });
    
    await updateProgress(trackId, { status: 'PROCESSING', progress: 90, step: 'Finalizing' });
    
    return { success: true };
  } catch (error) {
    console.error(`Error processing track ${trackId}:`, error);
    
    // Update track status to failed
    await prisma.track.update({
      where: { id: trackId },
      data: { 
        status: 'FAILED',
        updatedAt: new Date()
      }
    });
    
    await updateProgress(trackId, { status: 'FAILED', error: error.message });
    
    throw error;
  }
}

module.exports = { addAudioJob };