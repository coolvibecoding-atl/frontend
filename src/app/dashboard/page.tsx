'use client';

import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import UploadDemo from '@/components/sections/UploadDemo';
import { BatchUpload } from '@/components/BatchUpload';
import EmptyState from '@/components/ui/EmptyState';
import { Check, Play, Layers, X, BarChart, CheckCircle, Loader2, XCircle, Music } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  status: string;
  progress: number;
  fileSize: number;
  createdAt: Date;
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);

  // Fetch tracks from database
  useEffect(() => {
    const fetchTracks = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch('/api/tracks');
        const data = await response.json();
        setTracks(data.tracks || []);
      } catch (error) {
        console.error('Error fetching tracks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [user?.id]);

  // Calculate analytics stats
  const stats = {
    total: tracks.length,
    completed: tracks.filter(t => t.status === 'COMPLETED').length,
    processing: tracks.filter(t => ['PROCESSING', 'VALIDATING', 'PENDING'].includes(t.status)).length,
    failed: tracks.filter(t => ['FAILED', 'CANCELLED'].includes(t.status)).length,
  };

  const recentProjects = tracks.slice(0, 5); // Show 5 most recent

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleUploadComplete = async (file: File, storedFilename: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('storedFilename', storedFilename);
      
      await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      // Refresh tracks
      const response = await fetch('/api/tracks');
      const data = await response.json();
      setTracks(data.tracks || []);
    } catch (error) {
      console.error('Error creating track record:', error);
    }
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const selectAllTracks = () => {
    if (selectedTracks.length === tracks.length) {
      setSelectedTracks([]);
    } else {
      setSelectedTracks(tracks.map(t => t.id));
    }
  };

  const handleBatchProcess = async (trackIds: string[]) => {
    setBatchProcessing(true);
    try {
      const response = await fetch('/api/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackIds }),
      });
      
      if (!response.ok) {
        throw new Error('Batch processing failed');
      }
      
      const result = await response.json();
      console.log('Batch processing result:', result);
      
      // Refresh tracks
      const tracksResponse = await fetch('/api/tracks');
      const tracksData = await tracksResponse.json();
      setTracks(tracksData.tracks || []);
    } catch (error) {
      console.error('Batch processing error:', error);
    } finally {
      setBatchProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[var(--bg-secondary)]">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-secondary)]">Hello, </span>
            <span className="font-medium">{user.firstName || 'User'}</span>
          </div>
          <UserButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Analytics Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BarChart className="w-6 h-6" />
            Analytics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="panel p-6">
              <div className="text-[var(--text-secondary)] text-sm mb-1">Total Tracks</div>
              <div className="text-3xl font-bold">{stats.total}</div>
            </div>
            <div className="panel p-6">
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-1">
                <CheckCircle className="w-4 h-4 text-[var(--accent-primary)]" />
                Completed
              </div>
              <div className="text-3xl font-bold text-[var(--accent-primary)]">{stats.completed}</div>
            </div>
            <div className="panel p-6">
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-1">
                <Loader2 className="w-4 h-4 text-[var(--accent-warning)] animate-spin" />
                Processing
              </div>
              <div className="text-3xl font-bold text-[var(--accent-warning)]">{stats.processing}</div>
            </div>
            <div className="panel p-6">
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-1">
                <XCircle className="w-4 h-4 text-[var(--accent-secondary)]" />
                Failed
              </div>
              <div className="text-3xl font-bold text-[var(--accent-secondary)]">{stats.failed}</div>
            </div>
          </div>
        </section>

        {/* Recent Projects Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Recent Projects</h2>
          {recentProjects.length === 0 ? (
            <div className="panel p-8 text-center">
              <p className="text-[var(--text-secondary)]">No recent projects. Start by uploading a track!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((track) => (
                <div key={track.id} className="panel p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold truncate">{track.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      track.status === 'COMPLETED' 
                        ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                        : track.status === 'PROCESSING' || track.status === 'VALIDATING' 
                          ? 'bg-[var(--accent-warning)]/20 text-[var(--accent-warning)]'
                          : track.status === 'FAILED' || track.status === 'CANCELLED'
                            ? 'bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]'
                            : 'bg-[var(--accent-tertiary)]/20 text-[var(--accent-tertiary)]'
                    }`}>
                      {track.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm mb-4">
                    {track.status === 'COMPLETED' ? 'Ready for download' : 
                      track.progress > 0 ? `Processing: ${track.progress}%` : 
                      'Waiting to process'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      className="btn-secondary px-3 py-1 text-sm"
                      onClick={() => alert(`Track details for ${track.name}`)}
                    >
                      Details
                    </button>
                    {track.status === 'COMPLETED' && (
                      <button 
                        type="button" 
                        className="btn-primary px-3 py-1 text-sm"
                        onClick={() => alert(`Download ${track.name}`)}
                      >
                        Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upload Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Upload New Track</h2>
          <UploadDemo onUploadComplete={handleUploadComplete} />
        </section>

        {/* Batch Processing Section */}
        <section className="mb-12">
          <BatchUpload 
            tracks={tracks} 
            onProcessBatch={handleBatchProcess}
            isProcessing={batchProcessing}
          />
        </section>

        {/* Tracks Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All Tracks</h2>
            {tracks.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={selectAllTracks}
                  className="btn-secondary px-4 py-2 flex items-center gap-2"
                >
                  {selectedTracks.length === tracks.length ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {selectedTracks.length === tracks.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchProcess(selectedTracks)}
                  disabled={selectedTracks.length === 0 || batchProcessing}
                  className="btn-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {batchProcessing ? (
                    <div className="w-4 h-4 border-2 border-white rounded-full animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Process {selectedTracks.length > 0 ? `(${selectedTracks.length})` : 'Selected'}
                </button>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-[var(--accent-primary)] rounded-full animate-spin" />
              <p className="mt-2 text-[var(--text-secondary)]">Loading tracks...</p>
            </div>
          ) : tracks.length === 0 ? (
            <EmptyState
              icon={Music}
              title="Your studio is empty"
              description="Upload your first track to start creating professional-quality mixes with AI. It only takes a few seconds."
              action={{
                label: 'Upload Your First Track',
                href: '/mixer'
              }}
            />
          ) : (
            <div className="space-y-4">
              {tracks.map(track => (
                <div key={track.id} className="panel p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => toggleTrackSelection(track.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedTracks.includes(track.id)
                          ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
                          : 'border-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
                      }`}
                    >
                      {selectedTracks.includes(track.id) && <Check className="w-4 h-4 text-[var(--bg-primary)]" />}
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/20 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{track.name}</h3>
                      <p className="text-[var(--text-secondary)] text-sm">
                        {track.status === 'COMPLETED' ? 'Ready' : 
                          track.progress > 0 ? `${track.progress}%` : 
                          'Not processed'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      track.status === 'COMPLETED' 
                        ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                        : track.status === 'PROCESSING' || track.status === 'VALIDATING' 
                          ? 'bg-[var(--accent-warning)]/20 text-[var(--accent-warning)]'
                          : track.status === 'FAILED' || track.status === 'CANCELLED'
                            ? 'bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]'
                            : 'bg-[var(--accent-tertiary)]/20 text-[var(--accent-tertiary)]'
                    }`}>
                      {track.status.toLowerCase().replace('_', ' ')}
                    </span>
                    <button 
                      type="button" 
                      className="btn-secondary px-4 py-2"
                      onClick={() => {
                        alert(`Track details for ${track.name}`);
                      }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}