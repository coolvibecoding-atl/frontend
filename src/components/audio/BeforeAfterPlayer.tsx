'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Split, Layers, Download } from 'lucide-react';

interface AudioSource {
  name: string;
  url: string;
  color: string;
}

interface BeforeAfterPlayerProps {
  original?: AudioSource;
  processed?: AudioSource;
  stems?: {
    drums?: AudioSource;
    bass?: AudioSource;
    vocals?: AudioSource;
    other?: AudioSource;
  };
}

export default function BeforeAfterPlayer({ original, processed, stems }: BeforeAfterPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'compare' | 'stems'>('compare');
  const [originalVolume, setOriginalVolume] = useState(80);
  const [processedVolume, setProcessedVolume] = useState(80);

  const [mixBalance, setMixBalance] = useState(50); // 0 = original, 100 = processed
  
  const originalRef = useRef<HTMLAudioElement>(null);
  const processedRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (originalRef.current) {
      originalRef.current.volume = originalVolume / 100;
    }
    if (processedRef.current) {
      processedRef.current.volume = processedVolume / 100;
    }
  }, [originalVolume, processedVolume]);

  const togglePlay = () => {
    if (isPlaying) {
      originalRef.current?.pause();
      processedRef.current?.pause();
    } else {
      originalRef.current?.play();
      processedRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playStem = () => {
    setActiveTab('stems');
  };

  const renderCompareTab = () => (
    <div className="space-y-6">
      {/* A/B Toggle */}
      <div className="panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--accent-primary)]" />
            A/B Comparison
          </h3>
          <button
            type="button"
            onClick={togglePlay}
            className="btn-primary"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>

        {/* Mix Balance Slider */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--text-secondary)]">Original</span>
            <span className="text-[var(--accent-primary)] font-mono">{mixBalance === 0 ? '100%' : mixBalance === 100 ? '100%' : `${100 - mixBalance}% / ${mixBalance}%`}</span>
            <span className="text-[var(--text-secondary)]">Processed</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={mixBalance}
            onChange={(e) => setMixBalance(parseInt(e.target.value))}
            className="w-full h-2 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Original Track */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Original</span>
            <div className="flex items-center gap-2">
              {originalVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-[var(--text-secondary)]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[var(--accent-primary)]" />
              )}
              <input
                type="range"
                min="0"
                max="100"
                value={originalVolume}
                onChange={(e) => setOriginalVolume(parseInt(e.target.value))}
                className="w-20 h-1 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          <div className="h-12 bg-[var(--bg-tertiary)] rounded-lg relative overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-[var(--accent-secondary)]/30 transition-all"
              style={{ width: `${100 - mixBalance}%` }}
            />
            {/* Waveform visualization mock */}
            <div className="absolute inset-0 flex items-center justify-center gap-0.5 px-2">
              {Array.from({ length: 50 }).map((_, idx) => (
                <div
                  key={`wave-${idx}`}
                  className="w-0.5 bg-[var(--accent-secondary)] rounded-full"
                  style={{ height: `${Math.random() * 60 + 10}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Processed Track */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Processed</span>
            <div className="flex items-center gap-2">
              {processedVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-[var(--text-secondary)]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[var(--accent-primary)]" />
              )}
              <input
                type="range"
                min="0"
                max="100"
                value={processedVolume}
                onChange={(e) => setProcessedVolume(parseInt(e.target.value))}
                className="w-20 h-1 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          <div className="h-12 bg-[var(--bg-tertiary)] rounded-lg relative overflow-hidden">
            <div 
              className="absolute inset-y-0 right-0 bg-[var(--accent-primary)]/30 transition-all"
              style={{ width: `${mixBalance}%` }}
            />
            {/* Waveform visualization mock */}
            <div className="absolute inset-0 flex items-center justify-center gap-0.5 px-2">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={`wave-processed-${i}`}
                  className="w-0.5 bg-[var(--accent-primary)] rounded-full"
                  style={{ height: `${Math.random() * 60 + 10}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="panel p-4 text-center">
          <div className="text-2xl font-bold text-[var(--accent-primary)]">+3dB</div>
          <div className="text-sm text-[var(--text-secondary)]">Loudness</div>
        </div>
        <div className="panel p-4 text-center">
          <div className="text-2xl font-bold text-[var(--accent-primary)]">-2dB</div>
          <div className="text-sm text-[var(--text-secondary)]">Peak Level</div>
        </div>
        <div className="panel p-4 text-center">
          <div className="text-2xl font-bold text-[var(--accent-primary)]">EQ</div>
          <div className="text-sm text-[var(--text-secondary)]">Enhanced</div>
        </div>
      </div>
    </div>
  );

  const renderStemsTab = () => (
    <div className="space-y-6">
      <div className="panel p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Split className="w-5 h-5 text-[var(--accent-primary)]" />
          Individual Stems
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {stems && Object.entries(stems).map(([name]) => (
            <button
              key={name}
              type="button"
              onClick={() => playStem()}
              className="panel p-4 text-left hover:border-[var(--accent-primary)] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{name}</span>
                <Play className="w-4 h-4" />
              </div>
                <div className="h-8 bg-[var(--bg-tertiary)] rounded overflow-hidden">
                  <div className="h-full flex items-center justify-center gap-0.5 px-1">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={`wave-mini-${i}`}
                        className="w-0.5 bg-[var(--accent-tertiary)] rounded-full"
                        style={{ height: `${Math.random() * 80 + 10}%` }}
                      />
                    ))}
                  </div>
                </div>
            </button>
          ))}
        </div>

        {!stems && (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <Split className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No stems available yet</p>
            <p className="text-sm">Process your track to generate stems</p>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="panel p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-[var(--accent-primary)]" />
          Export Options
        </h3>
        
        <div className="space-y-3">
          <button type="button" className="btn-secondary w-full justify-between">
            <span>Download Full Mix</span>
            <span className="text-sm opacity-70">WAV • 44.1kHz • 24bit</span>
          </button>
          <button type="button" className="btn-secondary w-full justify-between">
            <span>Download Stems (All)</span>
            <span className="text-sm opacity-70">4 stems • ZIP</span>
          </button>
          <button type="button" className="btn-secondary w-full justify-between">
            <span>Download Individual Stems</span>
            <span className="text-sm opacity-70">Select in stem player</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('compare')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'compare'
              ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          Compare
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stems')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'stems'
              ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          Stems
        </button>
      </div>

      {/* Content */}
      {activeTab === 'compare' ? renderCompareTab() : renderStemsTab()}

      {/* Hidden audio elements for playback */}
      {original?.url && (
        <audio ref={originalRef} src={original.url}>
          <track kind="captions" />
        </audio>
      )}
      {processed?.url && (
        <audio ref={processedRef} src={processed.url}>
          <track kind="captions" />
        </audio>
      )}
    </div>
  );
}
