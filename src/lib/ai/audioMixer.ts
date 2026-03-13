import { GenrePreset, getPreset } from './genrePresets';
import { masteringPresets, getMasteringPreset, MasteringResult, MasteringOptions, applyMastering } from './masteringPresets';
import { separateStems, StemSeparationResult, StemSeparationOptions } from './stemSeparator';
import type { StemType } from './stemTypes';

export interface AudioAnalysis {
  rms: number;
  peak: number;
  lufs: number;
  dynamicRange: number;
  crestFactor: number;
}

export interface MixerOptions {
  genre: string;
  enableStemSeparation: boolean;
  enableMastering: boolean;
  stemSeparationOptions?: {
    quality?: 'fast' | 'balanced' | 'high';
    separateVocals?: boolean;
    separateDrums?: boolean;
    separateBass?: boolean;
    separateOther?: boolean;
  };
  masteringPreset?: string;
}

// StemType is imported from stemSeparator.ts

export interface MixerResult {
  analysis: AudioAnalysis;
  processedLufs: number;
  processedPeak: number;
  processedDynamicRange: number;
  settings: {
    eq: GenrePreset['eq'];
    compression: GenrePreset['compression'];
    limiter: GenrePreset['limiter'];
  };
  warnings: string[];
  stemSeparation?: {
    stems: Record<StemType, ArrayBuffer>;
    processingTime: number;
    quality: {
      sdr: number;
      sir: number;
      sar: number;
    };
  };
  mastering?: MasteringResult;
}

export function analyzeAudio(): AudioAnalysis {
  return {
    rms: 0.35,
    peak: 0.92,
    lufs: -12.5,
    dynamicRange: 10.2,
    crestFactor: 2.6,
  };
}

export function calculateEqCurve(preset: GenrePreset): Array<{ frequency: number; gain: number }> {
  return [
    { frequency: 31, gain: preset.eq.lowShelf.gain * 0.5 },
    { frequency: 125, gain: preset.eq.lowShelf.gain },
    { frequency: 250, gain: preset.eq.lowMid.gain },
    { frequency: 1000, gain: preset.eq.mid.gain },
    { frequency: 4000, gain: preset.eq.highMid.gain },
    { frequency: 8000, gain: preset.eq.highShelf.gain },
    { frequency: 16000, gain: preset.eq.highShelf.gain * 0.5 },
  ];
}

export async function processAudio(
  audioData: ArrayBuffer,
  options: MixerOptions
): Promise<MixerResult> {
  const preset = getPreset(options.genre);
  const warnings: string[] = [];
  
  const analysis = analyzeAudio();
  
  if (analysis.peak > 0.95) {
    warnings.push('Input peaks are clipping. Consider reducing input level.');
  }
  
  if (analysis.lufs > -6) {
    warnings.push('Input is very loud. Output may have reduced dynamic range.');
  }
  
  // Initialize result
  const result: MixerResult = {
    analysis,
    processedLufs: preset.lufs.target,
    processedPeak: 0.95,
    processedDynamicRange: Math.max(6, analysis.dynamicRange - 2),
    settings: {
      eq: preset.eq,
      compression: preset.compression,
      limiter: preset.limiter,
    },
    warnings,
  };
  
  // Handle stem separation if enabled
  if (options.enableStemSeparation) {
    const stemOptions: StemSeparationOptions = {
      quality: options.stemSeparationOptions?.quality ?? 'balanced',
      separateVocals: options.stemSeparationOptions?.separateVocals ?? true,
      separateDrums: options.stemSeparationOptions?.separateDrums ?? true,
      separateBass: options.stemSeparationOptions?.separateBass ?? true,
      separateOther: options.stemSeparationOptions?.separateOther ?? true
    };
    
    try {
      const stemResult = await separateStems(audioData, stemOptions);
      result.stemSeparation = stemResult;
    } catch (error) {
      console.error('Stem separation failed:', error);
      warnings.push('Stem separation failed. Proceeding without stem separation.');
    }
  }
  
  // Handle mastering if enabled
  if (options.enableMastering) {
    try {
      const masteringOptions: MasteringOptions = {
        preset: options.masteringPreset ?? 'transparent',
        inputLufs: analysis.lufs,
        inputPeak: analysis.peak > 0.95 ? 0.95 : analysis.peak,
        inputDynamicRange: analysis.dynamicRange
      };
      
      const masteringResult = applyMastering(masteringOptions);
      result.mastering = masteringResult;
      
      // Update processed values based on mastering
      result.processedLufs = masteringResult.outputLufs;
      result.processedPeak = masteringResult.outputPeak;
      result.processedDynamicRange = masteringResult.outputDynamicRange;
    } catch (error) {
      console.error('Mastering failed:', error);
      warnings.push('Mastering failed. Proceeding without mastering.');
    }
  }
  
  return result;
}

export function generateProcessingSteps(preset: GenrePreset): string[] {
  return [
    `Analyzing audio: ${preset.name} genre profile`,
    `Applying parametric EQ (${preset.eq.mid.frequency}Hz center)`,
    `Compression: ${preset.compression.ratio}:1 ratio, ${preset.compression.threshold}dB threshold`,
    `LUFS normalization: target ${preset.lufs.target} LUFS`,
    `Limiter ceiling: ${preset.limiter.threshold}dB`,
    'Final processing complete',
  ];
}

export async function simulateProcessing(
  options: MixerOptions,
  onProgress: (step: string, progress: number) => void
): Promise<MixerResult> {
  const preset = getPreset(options.genre);
  let steps = generateProcessingSteps(preset);
  
  // Add stem separation steps if enabled
  if (options.enableStemSeparation) {
    steps = [
      ...steps.slice(0, 2), // Initial analysis steps
      'Separating stems: Isolating vocals, drums, bass, and other instruments',
      ...steps.slice(2) // Remaining steps
    ];
  }
  
  // Add mastering step if enabled
  if (options.enableMastering) {
    steps = [
      ...steps.slice(0, steps.length - 1), // All except last step
      `Applying ${options.masteringPreset ?? 'transparent'} mastering preset`,
      steps[steps.length - 1] // Final step
    ];
  }
  
  for (let i = 0; i < steps.length; i++) {
    onProgress(steps[i], Math.round(((i + 1) / steps.length) * 100));
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  // Create a small mock audio buffer for simulation
  const mockAudio = new ArrayBuffer(44100 * 2); // 1 second of stereo audio at 44.1kHz
  return processAudio(mockAudio, options);
}


