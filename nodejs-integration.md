# Node.js Integration with BullMQ

This document explains how to integrate the Python stem separator worker with a Node.js backend using BullMQ for job queuing.

## Overview

1. Node.js backend accepts audio separation requests
2. Requests are queued as jobs in BullMQ
3. A separate worker process listens to the queue and executes the Python stem separator
4. Results are stored and callbacks/notifications are sent

## Installation

```bash
# Install BullMQ and Redis (required for BullMQ)
npm install bullmq ioredis
```

## Node.js Job Producer

Create a service that enqueues stem separation jobs:

```javascript
// stemSeparationService.js
const { Queue } = require('bullmq');
const { createClient } = require('redis');
const path = require('path');
const fs = require('fs');

// Redis connection
const redisClient = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// BullMQ queue
const separationQueue = new Queue('stem-separation', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

/**
 * Enqueue a stem separation job
 * @param {Object} jobData - Job data containing audio file info and options
 * @returns {Promise<Object>} Job information
 */
async function enqueueStemSeparationJob(jobData) {
  // Validate input
  if (!jobData.inputPath || !fs.existsSync(jobData.inputPath)) {
    throw new Error('Input audio file path is required and must exist');
  }
  
  // Set default options
  const options = {
    stems: jobData.stems || 4, // Default to 4 stems
    outputDir: jobData.outputDir || path.join(__dirname, 'separated_stems'),
    callbackUrl: jobData.callbackUrl || null
  };
  
  // Add job to queue
  const job = await separationQueue.add('separate-stems', {
    inputPath: jobData.inputPath,
    options: options
  }, {
    // Job options
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000 // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 24 * 3600 // Keep failed jobs for 24 hours
    }
  });
  
  return {
    jobId: job.id,
    status: 'queued',
    queue: 'stem-separation'
  };
}

module.exports = {
  enqueueStemSeparationJob,
  separationQueue
};
```

## Node.js Worker Process

Create a worker that processes jobs from the BullMQ queue:

```javascript
// stemSeparationWorker.js
const { Worker } = require('bullmq');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

// Worker configuration
const worker = new Worker('stem-separation', async (job) => {
  console.log(`Processing job ${job.id}`);
  
  const { inputPath, options } = job.data;
  
  // Validate input file
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }
  
  // Prepare command arguments for Python worker
  const pythonScript = path.join(__dirname, 'stem_separator.py');
  const args = [
    '--input', inputPath,
    '--output', options.outputDir,
    '--stems', options.stems.toString()
  ];
  
  // Execute Python worker
  return new Promise((resolve, reject) => {
    const pythonProcess = execFile('python3', [pythonScript, ...args], {
      timeout: 300000 // 5 minute timeout
    }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Job ${job.id} failed:`, error);
        reject(new Error(`Stem separation failed: ${error.message}`));
        return;
      }
      
      if (stderr) {
        console.error(`Job ${job.id} stderr:`, stderr);
      }
      
      try {
        const result = JSON.parse(stdout.trim());
        
        if (!result.success) {
          reject(new Error(result.error || 'Unknown error in stem separation'));
          return;
        }
        
        // Add additional metadata
        result.jobId = job.id;
        result.completedAt = new Date().toISOString();
        
        // Call callback URL if provided
        if (options.callbackUrl) {
          // In a real implementation, you would make an HTTP request here
          console.log(`Would call callback URL: ${options.callbackUrl}`);
        }
        
        resolve(result);
      } catch (parseError) {
        console.error(`Job ${job.id} failed to parse output:`, parseError);
        reject(new Error('Failed to parse stem separation output'));
      }
    });
    
    // Handle process output
    let stdoutData = '';
    let stderrData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
  });
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  concurrency: 2, // Number of concurrent jobs
  limiter: {
    max: 10, // Max jobs per duration
    duration: 60000 // Per minute
  }
});

// Event handlers
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

worker.on('error', (error) => {
  console.error('Worker error:', error);
});

console.log('Stem separation worker started');
```

## Express API Endpoints

Example Express routes for the stem separation service:

```javascript
// stemSeparationRoutes.js
const express = require('express');
const router = express.Router();
const { enqueueStemSeparationJob } = require('./stemSeparationService');

// POST /api/stem-separate - Enqueue a stem separation job
router.post('/stem-separate', async (req, res) => {
  try {
    const jobData = {
      inputPath: req.body.inputPath,
      stems: req.body.stems,
      outputDir: req.body.outputDir,
      callbackUrl: req.body.callbackUrl
    };
    
    const jobInfo = await enqueueStemSeparationJob(jobData);
    
    res.status(202).json({
      message: 'Stem separation job queued',
      jobId: jobInfo.jobId,
      status: jobInfo.status
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

// GET /api/stem-separate/:jobId - Check job status
router.get('/stem-separate/:jobId', async (req, res) => {
  // In a real implementation, you would check job status from BullMQ
  // or store results in a database
  res.json({
    message: 'Job status endpoint - implement based on your storage solution'
  });
});

module.exports = router;
```

## Usage Example

```javascript
// Example usage
const { enqueueStemSeparationJob } = require('./stemSeparationService');

// Enqueue a job
const jobData = {
  inputPath: '/path/to/audio/song.mp3',
  stems: 4, // vocals, drums, bass, other
  outputDir: '/tmp/separated_stems',
  callbackUrl: 'https://your-api.com/separation-complete'
};

enqueueStemSeparationJob(jobData)
  .then(jobInfo => {
    console.log('Job enqueued:', jobInfo);
  })
  .catch(error => {
    console.error('Failed to enqueue job:', error);
  });
```

## Deployment Considerations

1. **Redis**: Ensure Redis is running and accessible to both Node.js services
2. **Python Environment**: Install required Python dependencies on worker machines
3. **Scaling**: Run multiple worker processes to handle concurrent jobs
4. **Monitoring**: Use BullMQ dashboard or custom monitoring to track job progress
5. **Storage**: Consider using cloud storage (S3, Google Cloud) for input/output files
6. **Security**: Validate and sanitize file paths to prevent directory traversal attacks
7. **Timeouts**: Adjust timeouts based on expected processing times for different audio lengths