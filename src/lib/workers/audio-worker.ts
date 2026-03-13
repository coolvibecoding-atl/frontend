import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

interface AudioJobData {
  trackId: string;
  userId: string;
  filename: string;
  storedFilename: string;
  fileType: string;
}

async function updateTrackStatus(
  trackId: string,
  status: string,
  progress: number,
  step?: string
) {
  await prisma.track.update({
    where: { id: trackId },
    data: {
      status: status,
      progress,
      ...(step && { stemCount: step === 'STEM_SEPARATION' ? 4 : undefined }),
      ...(status === 'COMPLETED' && { processedAt: new Date() }),
    },
  });

  if (step) {
    await prisma.processingLog.create({
      data: {
        trackId,
        step,
        status: progress === 100 ? 'completed' : 'started',
        progress,
        completedAt: progress === 100 ? new Date() : null,
      },
    });
  }
}

async function validateAudio(_filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
}

async function performStemSeparation(_filePath: string): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return ['drums', 'bass', 'vocals', 'other'];
}

async function performMixing(_stems: string[]): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return 'mixed_audio.wav';
}

async function performMastering(_mixedFile: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return 'mastered_audio.wav';
}

async function processJob(job: Job<AudioJobData>) {
  const { trackId, storedFilename } = job.data;
  
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const filePath = path.join(uploadsDir, storedFilename);

  try {
    await updateTrackStatus(trackId, 'VALIDATING', 10, 'VALIDATING');
    
    const isValid = await validateAudio(filePath);
    if (!isValid) {
      throw new Error('Invalid audio file');
    }

    await job.updateProgress(25);
    await updateTrackStatus(trackId, 'STEM_SEPARATION', 25, 'STEM_SEPARATION');
    
    const stems = await performStemSeparation(filePath);
    
    await job.updateProgress(50);
    await updateTrackStatus(trackId, 'MIXING', 50, 'MIXING');
    
    const mixedAudio = await performMixing(stems);
    
    await job.updateProgress(75);
    await updateTrackStatus(trackId, 'MASTERING', 75, 'MASTERING');
    
    await performMastering(mixedAudio);
    
    await job.updateProgress(100);
    await updateTrackStatus(trackId, 'COMPLETED', 100, 'COMPLETED');
    
    console.log(`Track ${trackId} processing completed successfully`);
    
  } catch (error) {
    console.error(`Track ${trackId} processing failed:`, error);
    await updateTrackStatus(trackId, 'FAILED', 0, 'FAILED');
    throw error;
  }
}

export const worker = new Worker<AudioJobData>('audio-processing', processJob, {
  connection,
  concurrency: 2,
  limiter: {
    max: 5,
    duration: 60000,
  },
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed for track ${job.data.trackId}`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log('Audio processing worker started');

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
