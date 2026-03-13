export interface DelayOptions {
  time: number;          // 0-2000, delay time in ms
  feedback: number;      // 0-95, feedback percentage
  wetDry: number;        // 0-100, wet/dry mix
  tempoSync: boolean;    // Sync to BPM
  noteValue: string;     // 1/4, 1/8, 1/16, 1/32, etc.
  pingPong: boolean;     // Ping-pong stereo effect
}

export interface DelayResult {
  buffer: ArrayBuffer;
  parameters: DelayOptions;
  processingTime: number;
}

const DEFAULT_DELAY: DelayOptions = {
  time: 500,
  feedback: 40,
  wetDry: 30,
  tempoSync: false,
  noteValue: '1/4',
  pingPong: false
};

const NOTE_VALUES: Record<string, number> = {
  '1/1': 4000,    // Whole note
  '1/2': 2000,    // Half note
  '1/4': 1000,    // Quarter note
  '1/8': 500,     // Eighth note
  '1/16': 250,    // Sixteenth note
  '1/32': 125,    // Thirty-second note
  '1/4T': 666,    // Quarter triplet
  '1/8T': 333,    // Eighth triplet
  '1/16T': 166   // Sixteenth triplet
};

export class DelayProcessor {
  private sampleRate: number = 48000;
  private channels: number = 2;

  async process(
    audioBuffer: ArrayBuffer,
    options: Partial<DelayOptions> = {}
  ): Promise<DelayResult> {
    const startTime = Date.now();
    const params = { ...DEFAULT_DELAY, ...options };
    
    const inputData = new Float32Array(audioBuffer);
    const length = inputData.length;
    
    // Calculate delay time in samples
    let delaySamples: number;
    if (params.tempoSync && params.noteValue) {
      delaySamples = Math.floor((NOTE_VALUES[params.noteValue] || 1000) * this.sampleRate / 1000);
    } else {
      delaySamples = Math.floor(params.time * this.sampleRate / 1000);
    }
    
    // Max delay is 2 seconds
    delaySamples = Math.min(delaySamples, this.sampleRate * 2);
    
    // Create delay buffer (stereo)
    const delayBufferSize = delaySamples + length;
    const delayBuffer = new Float32Array(delayBufferSize * this.channels);
    
    // Feedback coefficient
    const feedback = params.feedback / 100 * 0.95;
    const wetLevel = params.wetDry / 100;
    const dryLevel = 1 - wetLevel * 0.5;
    
    const outputData = new Float32Array(length);
    
    // Process
    for (let i = 0; i < length; i++) {
      const channel = i % this.channels;
      const input = inputData[i];
      
      // Read from delay buffer
      const delayIndex = i + delaySamples * this.channels;
      const delayed = delayBufferSize > delayIndex ? delayBuffer[delayIndex] : 0;
      
      // Write to delay buffer with feedback
      if (delayIndex < delayBufferSize) {
        delayBuffer[delayIndex] = input + delayed * feedback;
      }
      
      // Mix dry and wet
      let output = input * dryLevel + delayed * wetLevel;
      
      // Apply ping-pong effect
      if (params.pingPong && this.channels > 1) {
        const pan = (Math.sin(i * 0.001) + 1) / 2; // Slow pan
        output = output * (channel === 0 ? 1 - pan : pan);
      }
      
      outputData[i] = output;
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

export const delayProcessor = new DelayProcessor();

export async function applyDelay(
  audioBuffer: ArrayBuffer,
  options: Partial<DelayOptions> = {}
): Promise<DelayResult> {
  return delayProcessor.process(audioBuffer, options);
}
