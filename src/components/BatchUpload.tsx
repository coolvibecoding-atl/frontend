"use client";

import { useState, useEffect } from 'react';
import { Upload, FileAudio, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyState from '@/components/ui/EmptyState';

interface Track {
  id: string;
  name: string;
  status: string;
  progress: number;
  stemCount?: number;
  createdAt: Date;
  processedAt?: Date | null;
  fileSize?: number;
}

interface BatchUploadProps {
  tracks: Track[];
  onProcessBatch: (trackIds: string[]) => Promise<void>;
  isProcessing: boolean;
}

export function BatchUpload({ tracks, onProcessBatch, isProcessing }: BatchUploadProps) {
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [batchProgress, setBatchProgress] = useState<{[key: string]: number}>({});
  const [batchStatus, setBatchStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');

  // Filter pending tracks
  const pendingTracks = tracks.filter(t => t.status === 'UPLOADED');
  const processingTracks = tracks.filter(t => t.status === 'PROCESSING');
  const completedTracks = tracks.filter(t => t.status === 'COMPLETED');

  const toggleTrackSelection = (trackId: string) => {
    const newSelection = new Set(selectedTracks);
    if (newSelection.has(trackId)) {
      newSelection.delete(trackId);
    } else {
      newSelection.add(trackId);
    }
    setSelectedTracks(newSelection);
  };

  const selectAllPending = () => {
    const allPendingIds = pendingTracks.map(t => t.id);
    setSelectedTracks(new Set(allPendingIds));
  };

  const clearSelection = () => {
    setSelectedTracks(new Set());
  };

  const handleProcessBatch = async () => {
    if (selectedTracks.size === 0) return;

    setBatchStatus('processing');
    try {
      await onProcessBatch(Array.from(selectedTracks));
      setBatchStatus('completed');
      
      // Clear selection after successful processing
      setTimeout(() => {
        clearSelection();
        setBatchStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Batch processing failed:', error);
      setBatchStatus('error');
    }
  };

  // Track progress for processing items
  useEffect(() => {
    const interval = setInterval(() => {
      processingTracks.forEach(track => {
        if (track.progress < 100) {
          setBatchProgress(prev => ({
            ...prev,
            [track.id]: Math.min(prev[track.id] || 0 + Math.random() * 10, 100)
          }));
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [processingTracks]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PROCESSING':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Batch Processing
        </CardTitle>
        <CardDescription>
          Process multiple tracks at once for efficient workflow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAllPending}
            disabled={pendingTracks.length === 0}
          >
            Select All Pending ({pendingTracks.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearSelection}
            disabled={selectedTracks.size === 0}
          >
            Clear Selection
          </Button>
        </div>

        {/* Track List */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {tracks.length === 0 ? (
            <EmptyState
              icon={FileAudio}
              title="No tracks ready"
              description="Upload audio files to add them to your batch for processing."
              variant="centered"
            />
          ) : (
            tracks.map(track => (
              <button
                key={track.id}
                type="button"
                className={`w-full flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-left ${
                  selectedTracks.has(track.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                } ${track.status === 'PROCESSING' ? 'opacity-75' : ''}`}
                onClick={() => toggleTrackSelection(track.id)}
                onKeyUp={(e) => e.key === 'Enter' && toggleTrackSelection(track.id)}
                onKeyDown={(e) => e.key === ' ' && toggleTrackSelection(track.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(track.status)}
                    <span className="font-medium truncate">{track.name}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {track.status === 'PROCESSING' && (
                      <Progress value={batchProgress[track.id] || track.progress} className="h-1 mt-1" />
                    )}
                    <span className="ml-2">
                      {track.status === 'PROCESSING' 
                        ? `${Math.round(batchProgress[track.id] || track.progress)}%` 
                        : track.status}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {track.stemCount && track.stemCount > 0 && `${track.stemCount} stems`}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Process Button */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleProcessBatch}
            disabled={selectedTracks.size === 0 || isProcessing || batchStatus === 'processing'}
            className="flex-1"
          >
            {batchStatus === 'processing' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Process {selectedTracks.size} Track{selectedTracks.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
          
          {batchStatus === 'completed' && (
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Completed!
            </span>
          )}
          
          {batchStatus === 'error' && (
            <span className="text-red-600 flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              Failed
            </span>
          )}
        </div>

        {/* Summary */}
        {tracks.length > 0 && (
          <div className="text-sm text-gray-500 pt-2 border-t">
            <div className="flex justify-between">
              <span>Pending:</span>
              <span>{pendingTracks.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Processing:</span>
              <span>{processingTracks.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed:</span>
              <span>{completedTracks.length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}