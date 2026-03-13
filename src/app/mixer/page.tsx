'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Music, Sliders, Layers, Zap, Check, 
  Loader2, FileAudio, Settings, Download,
  ChevronRight, Sparkles, Volume2, Clock,
  Mic, Headphones, Waves, Timer, Gauge
} from 'lucide-react';
import { getGenreList, getPreset } from '@/lib/ai/genrePresets';
import { simulateProcessing, MixerResult } from '@/lib/ai/audioMixer';
import { vocalTuner, VocalTuningOptions, VocalTuningResult } from '@/lib/ai/vocal/tuner';
import { referenceMatcher, ReferenceMatchOptions, ReferenceAnalysis } from '@/lib/ai/reference/matcher';
import { ReverbOptions, DelayOptions, SaturationOptions } from '@/lib/ai/effects';

type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'complete';

export default function MixerStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [genre, setGenre] = useState('pop');
  const [enableStemSeparation, setEnableStemSeparation] = useState(false);
  const [enableMastering, setEnableMastering] = useState(true);
  const [enableVocalTuning, setEnableVocalTuning] = useState(false);
  const [enableReferenceMatching, setEnableReferenceMatching] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<MixerResult | null>(null);
  const [vocalResult, setVocalResult] = useState<VocalTuningResult | null>(null);
  const [referenceResult, setReferenceResult] = useState<ReferenceAnalysis | null>(null);

  // Vocal tuning options
  const [vocalOptions, setVocalOptions] = useState<VocalTuningOptions>({
    pitchCorrection: true,
    correctionAmount: 75,
    formantShift: 0,
    harmonyEnabled: false,
    harmonyInterval: 'third',
    harmonyLevel: 50,
    vibrato: false,
    vibratoDepth: 50,
    vibratoRate: 5
  });

  // Reference matching options
  const [referenceOptions] = useState<ReferenceMatchOptions>({
    eqMatching: true,
    dynamicsMatching: true,
    spectralMatching: false,
    loudnessMatching: true,
    stereoMatching: false,
    matchStrength: 80
  });

  // Effects toggles
  const [enableReverb, setEnableReverb] = useState(false);
  const [enableDelay, setEnableDelay] = useState(false);
  const [enableSaturation, setEnableSaturation] = useState(false);

  // Effect options
  const [reverbOptions, setReverbOptions] = useState<ReverbOptions>({
    roomSize: 50,
    damping: 50,
    wetDry: 30,
    width: 100,
    freeze: 0
  });

  const [delayOptions, setDelayOptions] = useState<DelayOptions>({
    time: 500,
    feedback: 40,
    wetDry: 30,
    tempoSync: false,
    noteValue: '1/4',
    pingPong: false
  });

  const [saturationOptions, setSaturationOptions] = useState<SaturationOptions>({
    drive: 50,
    tone: 50,
    mix: 100,
    algorithm: 'soft'
  });

  const genres = getGenreList();
  const currentPreset = getPreset(genre);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }, []);

  const handleProcess = async () => {
    if (!file) return;

    setStatus('processing');
    setProgress(0);
    setCurrentStep('Preparing audio...');

    try {
      // First do the standard processing
      const processingResult = await simulateProcessing(
        { genre, enableStemSeparation, enableMastering },
        (step, prog) => {
          setCurrentStep(step);
          setProgress(Math.floor(prog * 0.4)); // First 40% for standard processing
        }
      );

      // Then apply vocal tuning if enabled
      if (enableVocalTuning) {
        setCurrentStep('Applying vocal tuning...');
        setProgress(40);
        
        const vocalResult = await vocalTuner.process(
          await file.arrayBuffer(),
          vocalOptions
        );
        
        setVocalResult(vocalResult);
        setProgress(60);
        setCurrentStep('Vocal tuning complete...');
      }

      // Then apply reference matching if enabled and reference file provided
      if (enableReferenceMatching && referenceFile) {
        setCurrentStep('Matching to reference track...');
        setProgress(60);
        
        const referenceMatchResult = await referenceMatcher.matchReference(
          await file.arrayBuffer(),
          await referenceFile.arrayBuffer(),
          referenceOptions
        );
        
        setReferenceResult(referenceMatchResult.analysis);
        setProgress(80);
        setCurrentStep('Reference matching complete...');
      }

      // Final processing
      setCurrentStep('Finalizing...');
      setProgress(90);
      
      // Combine results
      const finalResult = {
        ...processingResult,
        vocalProcessing: vocalResult,
        referenceMatching: referenceResult
      };
      
      setResult(finalResult);
      setStatus('complete');
      setProgress(100);
    } catch (error) {
      console.error('Processing error:', error);
      setStatus('idle');
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setCurrentStep('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white">
      {/* Header */}
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--bg-tertiary)]">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center">
                <Sliders className="w-5 h-5 text-[var(--bg-primary)]" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Mixer Studio</h1>
                <p className="text-xs text-[var(--text-secondary)]">Professional audio processing</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Upload Area */}
                <section
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  aria-label="Audio file upload area"
                  className={`panel p-12 text-center border-2 border-dashed transition-colors ${
                    file 
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' 
                      : 'border-[var(--bg-tertiary)] hover:border-[var(--accent-primary)]/50'
                  }`}
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center">
                        <FileAudio className="w-10 h-10 text-[var(--accent-primary)]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{file.name}</h3>
                        <p className="text-[var(--text-secondary)]">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-sm text-[var(--text-secondary)] hover:text-white"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)] mx-auto mb-6 flex items-center justify-center">
                        <Upload className="w-10 h-10 text-[var(--text-secondary)]" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Drop your audio file here
                      </h3>
                      <p className="text-[var(--text-secondary)] mb-6">
                        or click to browse • WAV, MP3, FLAC, AIFF supported
                      </p>
                      <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Choose File
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </>
                  )}
                </section>

                {/* Genre Selection */}
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="panel p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Music className="w-5 h-5 text-[var(--accent-primary)]" />
                      Select Genre
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {genres.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setGenre(g.id)}
                          className={`p-3 rounded-lg text-left transition-all ${
                            genre === g.id
                              ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'
                              : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80'
                          }`}
                        >
                          <div className="font-medium text-sm">{g.name}</div>
                          <div className={`text-xs ${genre === g.id ? 'text-[var(--bg-primary)]/70' : 'text-[var(--text-secondary)]'}`}>
                            {g.description.slice(0, 25)}...
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Genre Details */}
                    <div className="mt-6 p-4 bg-[var(--bg-tertiary)] rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{currentPreset.name} Settings</h4>
                        <span className="text-sm text-[var(--accent-primary)]">
                          Target: {currentPreset.lufs.target} LUFS
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-[var(--text-secondary)]">Compression</span>
                          <div className="font-mono">{currentPreset.compression.ratio}:1</div>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">Threshold</span>
                          <div className="font-mono">{currentPreset.compression.threshold}dB</div>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">EQ Mid</span>
                          <div className="font-mono">{currentPreset.eq.mid.frequency}Hz</div>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">Limiter</span>
                          <div className="font-mono">{currentPreset.limiter.threshold}dB</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Processing Options */}
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="panel p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-[var(--accent-primary)]" />
                      Processing Options
                    </h3>
                    <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5 text-[var(--accent-primary)]" />
                        <div>
                          <div className="font-medium">Stem Separation</div>
                          <div className="text-sm text-[var(--text-secondary)]">
                            Extract drums, bass, vocals, and other instruments
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableStemSeparation}
                        onChange={(e) => setEnableStemSeparation(e.target.checked)}
                        className="sr-only pointer-events-none"
                      />
                      <div 
                        onClick={() => setEnableStemSeparation(!enableStemSeparation)}
                        onKeyUp={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setEnableStemSeparation(!enableStemSeparation);
                          }
                        }}
                        tabIndex={0}
                        role="switch"
                        aria-checked={enableStemSeparation}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          enableStemSeparation ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)]'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          enableStemSeparation ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </div>
                    </label>

                      <label className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-[var(--accent-primary)]" />
                          <div>
                            <div className="font-medium">AI Mastering</div>
                            <div className="text-sm text-[var(--text-secondary)]">
                              Apply EQ, compression, and loudness normalization
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={enableMastering}
                          onChange={(e) => setEnableMastering(e.target.checked)}
                          className="sr-only pointer-events-none"
                        />
                        <div 
                          onClick={() => setEnableMastering(!enableMastering)}
                          onKeyUp={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setEnableMastering(!enableMastering);
                            }
                          }}
                          tabIndex={0}
                          role="switch"
                          aria-checked={enableMastering}
                          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                            enableMastering ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)]'
                          }`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            enableMastering ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}

                {/* Vocal Tuning */}
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="panel p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Mic className="w-5 h-5 text-[var(--accent-primary)]" />
                      Vocal Tuning
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Mic className="w-5 h-5 text-[var(--accent-primary)]" />
                          <div>
                            <div className="font-medium">Pitch Correction</div>
                            <div className="text-sm text-[var(--text-secondary)]">
                              Auto-tune style pitch correction
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={enableVocalTuning}
                          onChange={(e) => setEnableVocalTuning(e.target.checked)}
                          className="sr-only pointer-events-none"
                        />
                        <div 
                          onClick={() => setEnableVocalTuning(!enableVocalTuning)}
                          onKeyUp={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setEnableVocalTuning(!enableVocalTuning);
                            }
                          }}
                          tabIndex={0}
                          role="switch"
                          aria-checked={enableVocalTuning}
                          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                            enableVocalTuning ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)]'
                          }`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            enableVocalTuning ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>

                      {enableVocalTuning && (
                        <div className="space-y-3">
                          <div className="text-sm text-[var(--text-secondary)] mb-2">
                            Correction Amount:
                          </div>
                          <div className="flex items-center">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={vocalOptions.correctionAmount}
                              onChange={(e) => {
                                setVocalOptions(prev => ({...prev, correctionAmount: parseInt(e.target.value)}));
                              }}
                              className="w-24 h-1 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs font-mono">{vocalOptions.correctionAmount}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Reference Matching */}
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="panel p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Headphones className="w-5 h-5 text-[var(--accent-primary)]" />
                      Reference Matching
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Headphones className="w-5 h-5 text-[var(--accent-primary)]" />
                          <div>
                            <div className="font-medium">Enable Reference Matching</div>
                            <div className="text-sm text-[var(--text-secondary)]">
                              Match the sound profile of a reference track
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={enableReferenceMatching}
                          onChange={(e) => setEnableReferenceMatching(e.target.checked)}
                          className="sr-only pointer-events-none"
                        />
                        <div 
                          onClick={() => setEnableReferenceMatching(!enableReferenceMatching)}
                          onKeyUp={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setEnableReferenceMatching(!enableReferenceMatching);
                            }
                          }}
                          tabIndex={0}
                          role="switch"
                          aria-checked={enableReferenceMatching}
                          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                            enableReferenceMatching ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)]'
                          }`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            enableReferenceMatching ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>

                      {enableReferenceMatching && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">Reference Track:</div>
                            <button
                              type="button"
                              onClick={() => {
                                document.getElementById('reference-file-input')?.click();
                              }}
                              className="btn-secondary p-2 px-4 text-xs flex items-center gap-2"
                            >
                              {referenceFile ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span className="ml-2">{referenceFile.name}</span>
                                </>
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <input
                            type="file"
                            id="reference-file-input"
                            accept="audio/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setReferenceFile(file);
                            }}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Advanced Effects */}
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="panel p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-[var(--accent-primary)]" />
                      Advanced Effects
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Reverb */}
                      <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Waves className="w-4 h-4 text-[var(--accent-primary)]" />
                            <span className="font-medium">Reverb</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEnableReverb(!enableReverb)}
                            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                              enableReverb ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)]'
                            }`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                              enableReverb ? 'translate-x-5' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>
                        {enableReverb && (
                          <div className="space-y-3 text-xs">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span>Room Size</span>
                                <span>{reverbOptions.roomSize}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={reverbOptions.roomSize}
                                onChange={(e) => setReverbOptions(prev => ({...prev, roomSize: parseInt(e.target.value)}))}
                                className="w-full h-1 bg-[var(--bg-secondary)] rounded appearance-none cursor-pointer"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span>Wet/Dry</span>
                                <span>{reverbOptions.wetDry}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={reverbOptions.wetDry}
                                onChange={(e) => setReverbOptions(prev => ({...prev, wetDry: parseInt(e.target.value)}))}
                                className="w-full h-1 bg-[var(--bg-secondary)] rounded appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Delay */}
                      <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-[var(--accent-primary)]" />
                            <span className="font-medium">Delay</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEnableDelay(!enableDelay)}
                            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                              enableDelay ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)]'
                            }`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                              enableDelay ? 'translate-x-5' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>
                        {enableDelay && (
                          <div className="space-y-3 text-xs">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span>Time</span>
                                <span>{delayOptions.time}ms</span>
                              </div>
                              <input
                                type="range"
                                min="50"
                                max="2000"
                                step="50"
                                value={delayOptions.time}
                                onChange={(e) => setDelayOptions(prev => ({...prev, time: parseInt(e.target.value)}))}
                                className="w-full h-1 bg-[var(--bg-secondary)] rounded appearance-none cursor-pointer"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span>Feedback</span>
                                <span>{delayOptions.feedback}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="95"
                                value={delayOptions.feedback}
                                onChange={(e) => setDelayOptions(prev => ({...prev, feedback: parseInt(e.target.value)}))}
                                className="w-full h-1 bg-[var(--bg-secondary)] rounded appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Saturation */}
                      <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-[var(--accent-primary)]" />
                            <span className="font-medium">Saturation</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEnableSaturation(!enableSaturation)}
                            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                              enableSaturation ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)]'
                            }`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                              enableSaturation ? 'translate-x-5' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>
                        {enableSaturation && (
                          <div className="space-y-3 text-xs">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span>Drive</span>
                                <span>{saturationOptions.drive}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={saturationOptions.drive}
                                onChange={(e) => setSaturationOptions(prev => ({...prev, drive: parseInt(e.target.value)}))}
                                className="w-full h-1 bg-[var(--bg-secondary)] rounded appearance-none cursor-pointer"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span>Tone</span>
                                <span>{saturationOptions.tone}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={saturationOptions.tone}
                                onChange={(e) => setSaturationOptions(prev => ({...prev, tone: parseInt(e.target.value)}))}
                                className="w-full h-1 bg-[var(--bg-secondary)] rounded appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Process Button */}
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button
                      type="button"
                      onClick={handleProcess}
                      className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                    >
                      <Zap className="w-5 h-5" />
                      Process Audio
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {status === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="panel p-12 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-[var(--accent-primary)]/20 mx-auto mb-6 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-[var(--accent-primary)] animate-spin" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Processing Your Track</h3>
                <p className="text-[var(--text-secondary)] mb-8">
                  {currentStep}
                </p>
                
                {/* Progress Bar */}
                <div className="max-w-md mx-auto">
                  <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full bg-[var(--accent-primary)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {progress}% complete
                  </div>
                </div>

                {/* Processing Steps */}
                <div className="mt-8 max-w-md mx-auto text-left">
                  {[
                    'Analyzing audio...',
                    'Applying genre-specific EQ...',
                    'Compressing dynamics...',
                    'Normalizing loudness...',
                    'Finalizing...',
                  ].map((step, idx) => (
                    <div
                      key={step}
                      className={`flex items-center gap-3 py-2 ${
                        idx < Math.floor(progress / 20)
                          ? 'text-[var(--accent-primary)]'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {idx < Math.floor(progress / 20) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {status === 'complete' && result && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Success Header */}
                <div className="panel p-8 text-center bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30">
                  <div className="w-20 h-20 rounded-full bg-[var(--accent-primary)] mx-auto mb-4 flex items-center justify-center">
                    <Check className="w-10 h-10 text-[var(--bg-primary)]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Processing Complete!</h3>
                  <p className="text-[var(--text-secondary)]">
                    Your track has been professionally mixed and mastered
                  </p>
                </div>

                {/* Results */}
                <div className="panel p-6">
                  <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-[var(--accent-primary)]" />
                    Processing Results
                  </h4>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-[var(--bg-tertiary)] rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-[var(--accent-primary)] mb-1">
                        {result.processedLufs}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">LUFS</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        Target: {currentPreset.lufs.target} LUFS
                      </div>
                    </div>
                    
                    <div className="bg-[var(--bg-tertiary)] rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-[var(--accent-primary)] mb-1">
                        {result.processedPeak}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">Peak Level</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        {result.processedPeak > 0.9 ? 'Near limit' : 'Safe headroom'}
                      </div>
                    </div>
                    
                    <div className="bg-[var(--bg-tertiary)] rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-[var(--accent-primary)] mb-1">
                        {result.processedDynamicRange}dB
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">Dynamic Range</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        {result.processedDynamicRange > 8 ? 'Wide & dynamic' : 'Punchy & loud'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div className="panel p-4 border-[var(--accent-warning)]/30 bg-[var(--accent-warning)]/5">
                    <h4 className="font-medium text-[var(--accent-warning)] mb-2">Notes</h4>
                    <ul className="space-y-1">
                      {result.warnings.map((warning) => (
                        <li key={warning} className="text-sm text-[var(--text-secondary)]">
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    className="btn-primary flex-1 py-4 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Processed
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="btn-secondary flex-1 py-4 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Process Another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
