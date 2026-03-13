import { useState, useEffect, useCallback } from 'react';
import { logger } from './monitoring';

interface ProgressUpdate {
  trackId: string;
  progress: number;
  status: string;
  step?: string;
  error?: string;
  timestamp: string;
}

export function useProgress(trackId: string) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [step, setStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const updateProgress = useCallback(async (updates: Partial<ProgressUpdate>) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId,
          ...updates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }
    } catch (err) {
      logger.error('Failed to update progress', { error: err, trackId });
    }
  }, [trackId]);

  useEffect(() => {
    if (!trackId) return;

    const eventSource = new EventSource(`/api/progress?trackId=${trackId}`);

    eventSource.onopen = () => {
      setIsConnected(true);
      logger.info('Progress connection opened', { trackId });
    };

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressUpdate = JSON.parse(event.data);
        
        setProgress(data.progress);
        setStatus(data.status);
        if (data.step) setStep(data.step);
        if (data.error) setError(data.error);
      } catch (err) {
        logger.error('Failed to parse progress event', { error: err });
      }
    };

    eventSource.onerror = (err) => {
      logger.error('Progress connection error', { error: err, trackId });
      setIsConnected(false);
      
      // Reconnect after a delay
      setTimeout(() => {
        if (eventSource.readyState === EventSource.CLOSED) {
          eventSource.close();
          // Re-open connection
          const newEventSource = new EventSource(`/api/progress?trackId=${trackId}`);
          // Copy event handlers
          newEventSource.onopen = eventSource.onopen;
          newEventSource.onmessage = eventSource.onmessage;
          newEventSource.onerror = eventSource.onerror;
        }
      }, 3000);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [trackId]);

  return {
    progress,
    status,
    step,
    error,
    isConnected,
    updateProgress,
  };
}