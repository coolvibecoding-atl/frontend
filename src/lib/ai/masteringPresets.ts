export interface MasteringPreset {
  name: string;
  description: string;
  lufsTarget: number;
  truePeak: number;
  stereoWidth: number; // 0-100%
  harmonicExcitation: number; // 0-100%
  dynamicRangeCompression: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  limiter: {
    threshold: number;
    release: number;
  };
  characteristics: string[];
}

export const masteringPresets: Record<string, MasteringPreset> = {
  'transparent': {
    name: 'Transparent',
    description: 'Clean, natural mastering that preserves dynamics',
    lufsTarget: -14,
    truePeak: -1.0,
    stereoWidth: 100,
    harmonicExcitation: 10,
    dynamicRangeCompression: {
      threshold: -20,
      ratio: 1.2,
      attack: 30,
      release: 400
    },
    limiter: {
      threshold: -1.0,
      release: 50
    },
    characteristics: ['Natural dynamics', 'Minimal coloration', 'Transparent processing', 'Preserves transients']
  },
  'loud': {
    name: 'Loud',
    description: 'Competitive loudness for streaming platforms',
    lufsTarget: -8,
    truePeak: -0.3,
    stereoWidth: 105,
    harmonicExcitation: 25,
    dynamicRangeCompression: {
      threshold: -12,
      ratio: 1.8,
      attack: 10,
      release: 100
    },
    limiter: {
      threshold: -0.3,
      release: 30
    },
    characteristics: ['High loudness', 'Controlled dynamics', 'Enhanced presence', 'Streaming optimized']
  },
  'warm': {
    name: 'Warm',
    description: 'Analog-style warmth with gentle compression',
    lufsTarget: -16,
    truePeak: -0.5,
    stereoWidth: 95,
    harmonicExcitation: 40,
    dynamicRangeCompression: {
      threshold: -18,
      ratio: 1.5,
      attack: 50,
      release: 600
    },
    limiter: {
      threshold: -0.5,
      release: 100
    },
    characteristics: ['Analog warmth', 'Gentle compression', 'Rich harmonics', 'Smooth top-end']
  },
  'punchy': {
    name: 'Punchy',
    description: 'Emphasizes transients and impact',
    lufsTarget: -10,
    truePeak: -0.4,
    stereoWidth: 110,
    harmonicExcitation: 15,
    dynamicRangeCompression: {
      threshold: -8,
      ratio: 2.5,
      attack: 5,
      release: 50
    },
    limiter: {
      threshold: -0.4,
      release: 20
    },
    characteristics: ['Enhanced transients', 'Punchy dynamics', 'Aggressive character', 'Impact-focused']
  },
  'vocal': {
    name: 'Vocal-Focused',
    description: 'Optimized for vocal clarity and presence',
    lufsTarget: -12,
    truePeak: -0.6,
    stereoWidth: 90,
    harmonicExcitation: 30,
    dynamicRangeCompression: {
      threshold: -16,
      ratio: 1.6,
      attack: 20,
      release: 250
    },
    limiter: {
      threshold: -0.6,
      release: 75
    },
    characteristics: ['Vocal clarity', 'Forward mids', 'Controlled sibilance', 'Present highs']
  },
  'mastered-for-itunes': {
    name: 'Mastered for iTunes',
    description: 'Apple Digital Masters specification',
    lufsTarget: -16,
    truePeak: -1.0, // True peak must be <= -1.0 dBTP
    stereoWidth: 100,
    harmonicExcitation: 20,
    dynamicRangeCompression: {
      threshold: -20,
      ratio: 1.3,
      attack: 30,
      release: 400
    },
    limiter: {
      threshold: -1.0,
      release: 50
    },
    characteristics: ['Apple Digital Masters compliant', 'No true peak clipping', 'High-resolution ready', 'Studio quality']
  }
};

export const defaultMasteringPreset = masteringPresets['transparent'];

export function getMasteringPreset(presetName: string): MasteringPreset {
  return masteringPresets[presetName] || defaultMasteringPreset;
}

export function getMasteringPresetList(): Array<{ id: string; name: string; description: string }> {
  return Object.entries(masteringPresets).map(([id, preset]) => ({
    id,
    name: preset.name,
    description: preset.description
  }));
}

/**
 * Apply mastering processing to audio
 * In production, this would use actual DSP chains
 */
export interface MasteringOptions {
  preset: string;
  inputLufs: number;
  inputPeak: number;
  inputDynamicRange: number;
}

export interface MasteringResult {
  outputLufs: number;
  outputPeak: number;
  outputDynamicRange: number;
  settings: MasteringPreset;
  processingSteps: string[];
}

export function applyMastering(options: MasteringOptions): MasteringResult {
  const preset = getMasteringPreset(options.preset);
  const processingSteps = [
    `Analyzing input: ${options.inputLufs.toFixed(1)} LUFS, ${options.inputPeak} dBTP`,
    `Applying ${preset.name} mastering preset`,
    `Dynamic range compression: ${preset.dynamicRangeCompression.ratio}:1`,
    `Stereo width adjustment: ${preset.stereoWidth}%`,
    `Harmonic excitation: ${preset.harmonicExcitation}%`,
    `LUFS normalization: target ${preset.lufsTarget} LUFS`,
    `True peak limiting: ${preset.truePeak} dBTP`,
    'Mastering complete'
  ];

  // Calculate output values based on processing
  const outputLufs = preset.lufsTarget;
  const outputPeak = Math.min(options.inputPeak, preset.truePeak);
  
  // Dynamic range is reduced by compression
  const compressionReduction = Math.log10(preset.dynamicRangeCompression.ratio) * 5; // Rough estimate
  const outputDynamicRange = Math.max(3, options.inputDynamicRange - compressionReduction);

  return {
    outputLufs,
    outputPeak,
    outputDynamicRange,
    settings: preset,
    processingSteps
  };
}