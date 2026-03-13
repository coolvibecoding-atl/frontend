import { vocalTuner } from '@/lib/ai/vocal/tuner';
import { VocalTuningOptions } from '@/lib/ai/vocal/tuner';

describe('Vocal Tuner', () => {
  test('should exist', () => {
    expect(vocalTuner).toBeDefined();
  });

  test('should apply pitch correction', async () => {
    const options: VocalTuningOptions = {
      pitchCorrection: true,
      correctionAmount: 50,
      formantShift: 0,
      harmonyEnabled: false,
      harmonyInterval: 'third',
      harmonyLevel: 50,
      vibrato: false,
      vibratoDepth: 50,
      vibratoRate: 5
    };

    // Create a simple test buffer (sine wave)
    const sampleRate = 48000;
    const duration = 1; // 1 second
    const frequency = 440; // A4
    const samples = new Float32Array(sampleRate * duration);
    
    for (let i = 0; i < samples.length; i++) {
      samples[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.5;
    }
    
    const audioBuffer = samples.buffer;
    const result = await vocalTuner.process(audioBuffer, options);
    
    expect(result).toHaveProperty('processed');
    expect(result.processed).toBe(true);
    expect(result).toHaveProperty('corrections');
    expect(result.corrections.pitch).toBeGreaterThan(0);
  });

  test('should not process when pitch correction disabled', async () => {
    const options: VocalTuningOptions = {
      pitchCorrection: false,
      correctionAmount: 50,
      formantShift: 0,
      harmonyEnabled: false,
      harmonyInterval: 'third',
      harmonyLevel: 50,
      vibrato: false,
      vibratoDepth: 50,
      vibratoRate: 5
    };

    const sampleRate = 48000;
    const duration = 1;
    const frequency = 440;
    const samples = new Float32Array(sampleRate * duration);
    
    for (let i = 0; i < samples.length; i++) {
      samples[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.5;
    }
    
    const audioBuffer = samples.buffer;
    const result = await vocalTuner.process(audioBuffer, options);
    
    expect(result).toHaveProperty('processed');
    expect(result.processed).toBe(true); // Still processed but no pitch correction
    expect(result.corrections.pitch).toBe(0);
  });
});