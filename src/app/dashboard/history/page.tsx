'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { History, Download, Play, Filter, Clock, CheckCircle, XCircle, Loader2, Upload } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

interface ProcessingLog {
  id: string;
  step: string;
  status: string;
  message: string | null;
  progress: number;
  startedAt: Date;
  completedAt: Date | null;
}

interface Track {
  id: string;
  name: string;
  status: string;
  progress: number;
  createdAt: Date;
  processedAt: Date | null;
  processingLogs: ProcessingLog[];
}

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchTracks() {
      if (!user?.id) return;
      
      try {
        const res = await fetch('/api/tracks?includeLogs=true');
        const data = await res.json();
        setTracks(data.tracks || []);
      } catch (error) {
        console.error('Error fetching tracks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTracks();
  }, [user?.id]);

  const filteredTracks = tracks.filter(track => {
    if (filter === 'all') return true;
    if (filter === 'completed') return track.status === 'COMPLETED';
    if (filter === 'processing') return ['PROCESSING', 'VALIDATING', 'STEM_SEPARATION', 'MIXING', 'MASTERING'].includes(track.status);
    if (filter === 'failed') return track.status === 'FAILED';
    return true;
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-[var(--accent-primary)]" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-[var(--accent-secondary)]" />;
      default:
        return <Loader2 className="w-4 h-4 text-[var(--accent-warning)] animate-spin" />;
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <History className="w-8 h-8 text-[var(--accent-primary)]" />
            Processing History
          </h1>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[var(--text-secondary)]" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
            >
              <option value="all">All Tracks</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {filteredTracks.length === 0 ? (
          <EmptyState
            icon={History}
            title="No tracks yet"
            description="Start by uploading your first track to see it appear here. We'll process it with AI-powered mixing and mastering."
            action={{
              label: 'Upload Your First Track',
              href: '/mixer'
            }}
            variant="centered"
          />
        ) : (
          <div className="space-y-4">
            {filteredTracks.map((track) => (
              <div key={track.id} className="panel p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/20 flex items-center justify-center">
                      {getStatusIcon(track.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{track.name}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Created {formatDate(track.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      track.status === 'COMPLETED' 
                        ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                        : track.status === 'FAILED'
                          ? 'bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]'
                          : 'bg-[var(--accent-warning)]/20 text-[var(--accent-warning)]'
                    }`}>
                      {track.status.replace('_', ' ')}
                    </span>
                    
                    {track.status === 'COMPLETED' && (
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          className="btn-secondary px-3 py-2"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          className="btn-secondary px-3 py-2"
                          title="Play Preview"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-secondary)]">Progress</span>
                    <span className="text-[var(--accent-primary)] font-mono">{track.progress}%</span>
                  </div>
                  <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-tertiary)]"
                      style={{ width: `${track.progress}%` }}
                    />
                  </div>
                </div>

                {/* Processing Steps */}
                {track.processingLogs && track.processingLogs.length > 0 && (
                  <div className="border-t border-[var(--border-default)] pt-4">
                    <h4 className="text-sm font-medium mb-3 text-[var(--text-secondary)]">Processing Steps</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {track.processingLogs.map((log) => (
                        <div 
                          key={log.id} 
                          className={`p-3 rounded-lg ${
                            log.status === 'completed' 
                              ? 'bg-[var(--accent-primary)]/10' 
                              : log.status === 'started'
                                ? 'bg-[var(--accent-warning)]/10'
                                : 'bg-[var(--bg-tertiary)]'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {log.status === 'completed' ? (
                              <CheckCircle className="w-3 h-3 text-[var(--accent-primary)]" />
                            ) : log.status === 'started' ? (
                              <Loader2 className="w-3 h-3 text-[var(--accent-warning)] animate-spin" />
                            ) : (
                              <Clock className="w-3 h-3 text-[var(--text-secondary)]" />
                            )}
                            <span className="text-xs font-medium">{log.step}</span>
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {log.progress}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {track.processedAt && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-default)] text-sm text-[var(--text-secondary)]">
                    Completed {formatDate(track.processedAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
