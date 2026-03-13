'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileAudio, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface UploadState {
  status: 'idle' | 'validating' | 'processing' | 'complete' | 'error';
  file: File | null;
  progress: number;
  error: string | null;
  audioUrl: string | null;
}

interface UploadDemoProps {
  onUploadComplete?: (file: File, storedFilename: string) => Promise<void> | void;
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ACCEPTED_TYPES = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/flac', 'audio/x-wav'];

export default function UploadDemo({ onUploadComplete }: UploadDemoProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    file: null,
    progress: 0,
    error: null,
    audioUrl: null,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (uploadState.audioUrl) {
        URL.revokeObjectURL(uploadState.audioUrl);
      }
    };
  }, [uploadState.audioUrl]);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a WAV, MP3, or FLAC file';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File must be under 500MB';
    }
    return null;
  }, []);

  const processFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadState({
        status: 'error',
        file,
        progress: 0,
        error: validationError,
        audioUrl: null,
      });
      return;
    }

    // Create audio preview URL
    const audioUrl = URL.createObjectURL(file);

    setUploadState({
      status: 'validating',
      file,
      progress: 10,
      error: null,
      audioUrl,
    });

    // Simulate processing stages
    await new Promise(resolve => setTimeout(resolve, 800));
    setUploadState(prev => ({ ...prev, progress: 30, status: 'processing' }));
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    setUploadState(prev => ({ ...prev, progress: 60 }));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUploadState(prev => ({ ...prev, progress: 85 }));
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setUploadState(prev => ({ ...prev, progress: 100, status: 'complete' }));
    
    // Generate a stored filename for the upload
    const storedFilename = `track_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    // Notify parent of successful upload
    if (onUploadComplete) {
      onUploadComplete(file, storedFilename);
    }
   }, [validateFile, onUploadComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }, [processFile]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const resetUpload = useCallback(() => {
    if (uploadState.audioUrl) {
      URL.revokeObjectURL(uploadState.audioUrl);
    }
    setUploadState({
      status: 'idle',
      file: null,
      progress: 0,
      error: null,
      audioUrl: null,
    });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [uploadState.audioUrl]);

  const isProcessing = uploadState.status === 'validating' || uploadState.status === 'processing';

  return (
    <div className="w-full max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {uploadState.status === 'idle' || uploadState.status === 'error' ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hidden file input */}
            <input
              ref={inputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="sr-only"
              aria-label="Upload audio file"
            />

              {/* Drop zone */}
            <button
              type="button"
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer
                focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
                ${isDragging 
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10' 
                  : 'border-[var(--border-default)] hover:border-[var(--accent-primary)] bg-[var(--bg-secondary)]'
                }
              `}
              aria-label="Drop audio file here or click to browse"
            >
              {/* Animated grid background */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-30">
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(var(--border-default) 1px, transparent 1px),
                      linear-gradient(90deg, var(--border-default) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                  }}
                />
              </div>

              <div className="relative flex flex-col items-center gap-5">
                {/* Icon with glow */}
                <div className={`
                  w-20 h-20 rounded-full flex items-center justify-center transition-all
                  ${isDragging 
                    ? 'bg-[var(--accent-primary)] shadow-glow-lg' 
                    : 'bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-tertiary)] shadow-glow'
                  }
                `}>
                  <Upload className="w-10 h-10 text-[var(--bg-primary)]" />
                </div>

                <div className="text-center">
                  <p className="text-xl font-semibold mb-2">
                    {isDragging ? 'Release to upload' : 'Drop your track here'}
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm">
                    WAV, MP3, FLAC up to 500MB
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                >
                  Or click to browse
                </button>

                {/* Error message */}
                {uploadState.status === 'error' && uploadState.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-[var(--accent-secondary)] text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {uploadState.error}
                  </motion.div>
                )}
              </div>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="panel p-8"
          >
            {/* File info */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-[var(--accent-primary)]/20 flex items-center justify-center flex-shrink-0">
                <FileAudio className="w-6 h-6 text-[var(--accent-primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{uploadState.file?.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {uploadState.file ? (uploadState.file.size / (1024 * 1024)).toFixed(1) : 0} MB
                </p>
              </div>
              <button
                type="button"
                onClick={resetUpload}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar - console style */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--text-secondary)]">
                  {uploadState.status === 'validating' ? 'Analyzing...' : 
                   uploadState.status === 'processing' ? 'Processing...' : 
                   'Complete'}
                </span>
                <span className="text-[var(--accent-primary)] font-mono">{uploadState.progress}%</span>
              </div>
              <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-tertiary)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadState.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Audio preview */}
            {uploadState.audioUrl && uploadState.status === 'complete' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <audio
                    ref={audioRef}
                    src={uploadState.audioUrl}
                    controls
                    className="flex-1 h-10"
                  >
                    <track kind="captions" label="English captions" srcLang="en" default />
                  </audio>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-[var(--accent-primary)]"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Ready for AI mixing</span>
                </motion.div>
              </div>
            )}

            {/* Loading state */}
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>AI is analyzing your track...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
