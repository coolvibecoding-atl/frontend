import { applyReverb, applyDelay, applySaturation } from '@/lib/ai/effects';

function createTestBuffer(duration = 1, sampleRate = 48000, channels = 2): ArrayBuffer {
  const bytesPerSample = 2;
  const bufferSize = Math.floor(duration * sampleRate * channels * bytesPerSample);
  const audioBuffer = new ArrayBuffer(bufferSize);
  
  const samples = new Float32Array(audioBuffer);
  for (let i = 0; i < samples.length; i += channels) {
    const t = i / (sampleRate * channels);
    samples[i] = Math.sin(2 * Math.PI * 440 * t) * 0.5;
    if (channels > 1) samples[i + 1] = samples[i];
  }
  
  return audioBuffer;
}

describe('Reverb Effect', () => {
  const testBuffer = createTestBuffer(0.5);

  it('should apply reverb with default settings', async () => {
    const result = await applyReverb(testBuffer);
    
    expect(result).toBeDefined();
    expect(result.buffer).toBeDefined();
    expect(result.buffer.byteLength).toBeGreaterThan(0);
    expect(result.processingTime).toBeLessThan(5000);
    expect(result.parameters.roomSize).toBe(50);
  });

  it('should apply reverb with custom settings', async () => {
    const result = await applyReverb(testBuffer, {
      roomSize: 80,
      damping: 30,
      wetDry: 50,
      width: 75
    });
    
    expect(result.parameters.roomSize).toBe(80);
    expect(result.parameters.damping).toBe(30);
    expect(result.parameters.wetDry).toBe(50);
    expect(result.parameters.width).toBe(75);
  });

  it('should handle freeze mode', async () => {
    const result = await applyReverb(testBuffer, {
      freeze: 100
    });
    
    expect(result.parameters.freeze).toBe(100);
  });
});

describe('Delay Effect', () => {
  const testBuffer = createTestBuffer(0.5);

  it('should apply delay with default settings', async () => {
    const result = await applyDelay(testBuffer);
    
    expect(result).toBeDefined();
    expect(result.buffer).toBeDefined();
    expect(result.buffer.byteLength).toBeGreaterThan(0);
    expect(result.parameters.time).toBe(500);
    expect(result.parameters.feedback).toBe(40);
  });

  it('should apply delay with custom settings', async () => {
    const result = await applyDelay(testBuffer, {
      time: 250,
      feedback: 60,
      wetDry: 40,
      pingPong: true
    });
    
    expect(result.parameters.time).toBe(250);
    expect(result.parameters.feedback).toBe(60);
    expect(result.parameters.pingPong).toBe(true);
  });

  it('should handle tempo sync', async () => {
    const result = await applyDelay(testBuffer, {
      tempoSync: true,
      noteValue: '1/8'
    });
    
    expect(result.parameters.tempoSync).toBe(true);
    expect(result.parameters.noteValue).toBe('1/8');
  });
});

describe('Saturation Effect', () => {
  const testBuffer = createTestBuffer(0.5);

  it('should apply saturation with default settings', async () => {
    const result = await applySaturation(testBuffer);
    
    expect(result).toBeDefined();
    expect(result.buffer).toBeDefined();
    expect(result.buffer.byteLength).toBeGreaterThan(0);
    expect(result.parameters.drive).toBe(50);
    expect(result.parameters.algorithm).toBe('soft');
  });

  it('should apply all saturation algorithms', async () => {
    const algorithms = ['soft', 'hard', 'tape', 'fuzz'] as const;
    
    for (const algo of algorithms) {
      const result = await applySaturation(testBuffer, {
        algorithm: algo,
        drive: 75
      });
      
      expect(result.parameters.algorithm).toBe(algo);
    }
  });

  it('should handle tone control', async () => {
    const result = await applySaturation(testBuffer, {
      tone: 80,
      mix: 50
    });
    
    expect(result.parameters.tone).toBe(80);
    expect(result.parameters.mix).toBe(50);
  });
});
