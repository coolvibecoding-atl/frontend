export interface ReverbOptions {
  roomSize: number;      // 0-100, default 50
  damping: number;       // 0-100, default 50
  wetDry: number;        // 0-100, percentage of wet signal
  width: number;         // 0-100, stereo width
  freeze: number;        // 0-100, freeze amount (0 = off)
}

export interface ReverbResult {
  buffer: ArrayBuffer;
  parameters: ReverbOptions;
  processingTime: number;
}

const DEFAULT_REVERB: ReverbOptions = {
  roomSize: 50,
  damping: 50,
  wetDry: 30,
  width: 100,
  freeze: 0
};

export class ReverbProcessor {
  private sampleRate: number = 48000;
  private channels: number = 2;

  async process(
    audioBuffer: ArrayBuffer,
    options: Partial<ReverbOptions> = {}
  ): Promise<ReverbResult> {
    const startTime = Date.now();
    const params = { ...DEFAULT_REVERB, ...options };
    
    const inputData = new Float32Array(audioBuffer);
    const length = inputData.length;
    
    // Determine sample rate and channels from buffer
    if (length >= 4) {
      // Try to detect from buffer header if available
      this.sampleRate = 48000;
      this.channels = length > 2 ? 2 : 1;
    }

    // Create output buffer
    const outputData = new Float32Array(length);
    
    // Create delay lines for reverb (Schroeder reverb algorithm)
    const combDelays = [1557, 1617, 1491, 1422, 1277, 1356, 1188, 1116];
    const allPassDelays = [225, 556, 441, 341];
    
    const combBuffers = combDelays.map(d => new Float32Array(d));
    const allPassBuffers = allPassDelays.map(d => new Float32Array(d));
    const combIndices = new Array(combDelays.length).fill(0);
    const allPassIndices = new Array(allPassDelays.length).fill(0);
    
    // Calculate parameters
    const roomSize = 0.28 + (params.roomSize / 100) * 0.7;
    const damp = (params.damping / 100) * 0.4;
    const wetLevel = (params.wetDry / 100) * 0.5;
    const dryLevel = 1 - wetLevel * 0.5;
    const freezeLevel = params.freeze / 100;
    
    // Process each sample
    for (let i = 0; i < length; i++) {
      const input = inputData[i];
      let output = input * dryLevel;
      
      // Process through comb filters (parallel)
      let combSum = 0;
      for (let c = 0; c < combDelays.length; c++) {
        const buffer = combBuffers[c];
        const index = combIndices[c];
        
        // Read from delay line
        const delayed = buffer[index];
        
        // Low-pass filter for damping
        const filtered = delayed * (1 - damp) + (combBuffers[c][(index + 1) % combDelays[c]] || 0) * damp;
        
        // Write feedback
        buffer[index] = input + filtered * roomSize * (1 - freezeLevel);
        
        // Mix
        combSum += delayed;
        
        // Advance index
        combIndices[c] = (index + 1) % combDelays[c];
      }
      
      // Process through all-pass filters (series)
      let allPassInput = combSum / combDelays.length;
      for (let a = 0; a < allPassDelays.length; a++) {
        const buffer = allPassBuffers[a];
        const index = allPassIndices[a];
        
        const delayed = buffer[index];
        const output = allPassInput * 0.5 + delayed * 0.5;
        buffer[index] = allPassInput + delayed * -0.5;
        
        allPassInput = output;
        allPassIndices[a] = (index + 1) % allPassDelays[a];
      }
      
      // Mix wet signal
      output += allPassInput * wetLevel;
      
      // Apply stereo width (simplified)
      if (i % 2 === 1 && this.channels > 1) {
        outputData[i] = output * (params.width / 100);
      } else {
        outputData[i] = output;
      }
    }
    
    // Create output ArrayBuffer
    const outputBuffer = outputData.buffer.slice(
      outputData.byteOffset,
      outputData.byteOffset + outputData.byteLength
    );
    
    return {
      buffer: outputBuffer,
      parameters: params,
      processingTime: Date.now() - startTime
    };
  }
}

export const reverbProcessor = new ReverbProcessor();

export async function applyReverb(
  audioBuffer: ArrayBuffer,
  options: Partial<ReverbOptions> = {}
): Promise<ReverbResult> {
  return reverbProcessor.process(audioBuffer, options);
}
