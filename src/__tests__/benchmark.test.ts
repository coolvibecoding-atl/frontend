import { processAudio } from '@/lib/ai/audioMixer';
import { vocalTuner, VocalTuningOptions } from '@/lib/ai/vocal/tuner';
import { referenceMatcher } from '@/lib/ai/reference/matcher';

function createTestBuffer(duration = 10, sampleRate = 48000, channels = 2): ArrayBuffer {
  const bytesPerSample = 2;
  const bufferSize = duration * sampleRate * channels * bytesPerSample;
  const audioBuffer = new ArrayBuffer(bufferSize);
  
  const samples = new Float32Array(audioBuffer);
  for (let i = 0; i < samples.length; i += channels) {
    const t = i / (sampleRate * channels);
    samples[i] = 
      Math.sin(2 * Math.PI * 110 * t) * 0.3 +
      Math.sin(2 * Math.PI * 220 * t) * 0.25 +
      Math.sin(2 * Math.PI * 440 * t) * 0.2 +
      Math.random() * 0.1;
    
    if (channels > 1) samples[i + 1] = samples[i];
  }
  
  return audioBuffer;
}

describe('Performance Benchmarks', () => {
  const testBuffer = createTestBuffer(5);
  
  it('genre processing should complete in reasonable time', async () => {
    const startTime = Date.now();
    
    const result = await processAudio(testBuffer, {
      genre: 'pop',
      enableStemSeparation: false,
      enableMastering: true
    });
    
    const elapsed = Date.now() - startTime;
    
    expect(result).toBeDefined();
    expect(typeof result.processedLufs).toBe('number');
    expect(elapsed).toBeLessThan(5000); // Should complete within 5 seconds
  }, 10000);
  
  it('vocal tuning should complete in reasonable time', async () => {
    const startTime = Date.now();
    
    const result = await vocalTuner.process(testBuffer, {
      pitchCorrection: true,
      correctionAmount: 50,
      harmonyEnabled: false,
      vibrato: false
    } as VocalTuningOptions);
    
    const elapsed = Date.now() - startTime;
    
    expect(result).toBeDefined();
    expect(elapsed).toBeLessThan(3000);
  }, 10000);
  
  it('reference matching should complete in reasonable time', async () => {
    const startTime = Date.now();
    
    const result = await referenceMatcher.matchReference(testBuffer, testBuffer, {
      eqMatching: true,
      dynamicsMatching: true,
      spectralMatching: false,
      stereoMatching: false,
      loudnessMatching: true,
      matchStrength: 75
    });
    
    const elapsed = Date.now() - startTime;
    
    expect(result).toBeDefined();
    expect(result.notes).toBeDefined();
    expect(elapsed).toBeLessThan(3000);
  }, 10000);
  
  it('full pipeline should complete within acceptable time', async () => {
    const startTime = Date.now();
    
    // Genre processing
    await processAudio(testBuffer, {
      genre: 'hip-hop',
      enableStemSeparation: false,
      enableMastering: true
    });
    
    // Vocal processing
    await vocalTuner.process(testBuffer, {
      pitchCorrection: true,
      correctionAmount: 50
    } as VocalTuningOptions);
    
    // Reference matching
    await referenceMatcher.matchReference(testBuffer, testBuffer, {
      eqMatching: true,
      dynamicsMatching: false,
      spectralMatching: false,
      stereoMatching: false,
      loudnessMatching: true,
      matchStrength: 75
    });
    
    const elapsed = Date.now() - startTime;
    
    expect(elapsed).toBeLessThan(10000); // Full pipeline under 10 seconds
  }, 15000);
});
