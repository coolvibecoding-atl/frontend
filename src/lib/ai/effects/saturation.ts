export interface SaturationOptions {
  drive: number;         // 0-100, saturation amount
  tone: number;         // 0-100, tone control (low to high)
  mix: number;          // 0-100, dry/wet mix
  algorithm: 'soft' | 'hard' | 'tape' | 'fuzz';
}

export interface SaturationResult {
  buffer: ArrayBuffer;
  parameters: SaturationOptions;
  processingTime: number;
}

const DEFAULT_SATURATION: SaturationOptions = {
  drive: 50,
  tone: 50,
  mix: 100,
  algorithm: 'soft'
};

function softClipping(x: number): number {
  // Soft clipping sigmoid function
  return 2 / Math.PI * Math.atan(x);
}

function hardClipping(x: number, threshold: number = 1): number {
  // Hard clipping
  if (x > threshold) return threshold;
  if (x < -threshold) return -threshold;
  return x;
}

function tanhClipping(x: number): number {
  // Tanh clipping (tape-style)
  return Math.tanh(x);
}

function fuzzClipping(x: number): number {
  // Fuzz-style asymmetric clipping
  const absX = Math.abs(x);
  const sign = x >= 0 ? 1 : -1;
  if (absX < 0.5) return x * 2;
  return sign * (1 - Math.exp(-(absX - 0.5) * 4));
}

export class SaturationProcessor {
  private sampleRate: number = 48000;

  async process(
    audioBuffer: ArrayBuffer,
    options: Partial<SaturationOptions> = {}
  ): Promise<SaturationResult> {
    const startTime = Date.now();
    const params = { ...DEFAULT_SATURATION, ...options };
    
    const inputData = new Float32Array(audioBuffer);
    const length = inputData.length;
    
    // Calculate drive coefficient (0-1 to 1-10)
    const drive = 1 + (params.drive / 100) * 9;
    
    // Tone filter coefficient
    const tone = params.tone / 100;
    const lowPass = 0.9 + tone * 0.099;  // 0.9 to 0.999
    const highPass = tone * 0.1;          // 0 to 0.1
    
    // Mixing
    const wetLevel = params.mix / 100;
    const dryLevel = 1 - wetLevel;
    
    const outputData = new Float32Array(length);
    
    // Select clipping algorithm
    const clipFunction = (x: number): number => {
      const scaled = x * drive;
      switch (params.algorithm) {
        case 'hard':
          return hardClipping(scaled, 1);
        case 'tape':
          return tanhClipping(scaled);
        case 'fuzz':
          return fuzzClipping(scaled);
        case 'soft':
        default:
          return softClipping(scaled);
      }
    };
    
    // Previous sample for high-pass filter
    let prevHigh = 0;
    let prevLow = 0;
    
    // Process each sample
    for (let i = 0; i < length; i++) {
      const sample = inputData[i];
      
      // Apply tone control (simple low/high pass combination)
      // High pass
      const highPassSample = sample - prevHigh;
      prevHigh = sample;
      
      // Low pass  
      const lowPassSample = prevLow + (sample - prevLow) * lowPass;
      prevLow = lowPassSample;
      
      // Mix based on tone
      const toneAdjusted = highPassSample * highPass + lowPassSample * (1 - highPass);
      
      // Apply saturation
      const saturated = clipFunction(toneAdjusted);
      
      // Mix dry and wet
      outputData[i] = sample * dryLevel + saturated * wetLevel;
    }
    
    // Create output ArrayBuffer
    const outputBuffer = outputData.buffer.slice(
      outputData.byteOffset,
      outputData.byteLength
    );
    
    return {
      buffer: outputBuffer,
      parameters: params,
      processingTime: Date.now() - startTime
    };
  }
}

export const saturationProcessor = new SaturationProcessor();

export async function applySaturation(
  audioBuffer: ArrayBuffer,
  options: Partial<SaturationOptions> = {}
): Promise<SaturationResult> {
  return saturationProcessor.process(audioBuffer, options);
}
