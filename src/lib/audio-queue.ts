import { Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const audioQueue = new Queue('audio-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

export interface AudioJobData {
  trackId: string;
  userId: string;
  filename: string;
  storedFilename: string;
  fileType: string;
  step?: string;
}

export const processingSteps = {
  VALIDATING: 'VALIDATING',
  STEM_SEPARATION: 'STEM_SEPARATION',
  MIXING: 'MIXING',
  MASTERING: 'MASTERING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type ProcessingStep = typeof processingSteps[keyof typeof processingSteps];

export async function addAudioJob(data: AudioJobData): Promise<string> {
  const job = await audioQueue.add('process-audio', data, {
    priority: 1,
  });
  return job.id || '';
}

export async function getJobProgress(trackId: string): Promise<{
  status: string;
  progress: number;
  step: string;
} | null> {
  const jobs = await audioQueue.getJobs(['active', 'waiting', 'completed', 'failed']);
  const job = jobs.find((j) => j.data.trackId === trackId);
  
  if (!job) return null;
  
  return {
    status: 'unknown', // Job status not available in BullMQ Job object
    progress: (job.progress as number) || 0,
    step: (job.data.step || 'PENDING') as string,
  };
}
