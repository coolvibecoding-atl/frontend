import { referenceMatcher, ReferenceMatchOptions } from '@/lib/ai/reference/matcher';

describe('Reference Matcher', () => {
  test('should exist', () => {
    expect(referenceMatcher).toBeDefined();
  });

  test('should analyze reference audio', () => {
    // Create a dummy audio buffer
    const audioBuffer = new ArrayBuffer(48000 * 2 * 2); // 48kHz, stereo, 16-bit, 2 seconds
    
    const analysis = referenceMatcher.analyzeReference(audioBuffer);
    
    expect(analysis).toHaveProperty('lufs');
    expect(analysis).toHaveProperty('peak');
    expect(analysis).toHaveProperty('dynamicRange');
    expect(analysis).toHaveProperty('spectralCentroid');
    expect(analysis).toHaveProperty('spectralRolloff');
    expect(analysis).toHaveProperty('mfcc');
    expect(analysis).toHaveProperty('stereoWidth');
    expect(analysis).toHaveProperty('eqCurve');
    expect(analysis).toHaveProperty('compression');
    
    // Check types and reasonable ranges
    expect(typeof analysis.lufs).toBe('number');
    expect(typeof analysis.peak).toBe('number');
    expect(analysis.peak).toBeGreaterThanOrEqual(0);
    expect(analysis.peak).toBeLessThanOrEqual(1);
    expect(Array.isArray(analysis.mfcc)).toBe(true);
    expect(analysis.mfcc).toHaveLength(13);
  });

  test('should match reference with options', async () => {
    const sourceBuffer = new ArrayBuffer(48000 * 2 * 2);
    const referenceBuffer = new ArrayBuffer(48000 * 2 * 2);
    
    const options: ReferenceMatchOptions = {
      eqMatching: true,
      dynamicsMatching: true,
      spectralMatching: false,
      loudnessMatching: true,
      stereoMatching: false,
      matchStrength: 80
    };
    
    const result = await referenceMatcher.matchReference(
      sourceBuffer,
      referenceBuffer,
      options
    );
    
    expect(result).toHaveProperty('matched');
    expect(result.matched).toBe(true);
    expect(result).toHaveProperty('analysis');
    expect(result).toHaveProperty('adjustments');
    expect(result).toHaveProperty('notes');
    
    expect(Array.isArray(result.adjustments.eq)).toBe(true);
    expect(result.adjustments).toHaveProperty('dynamics');
    expect(typeof result.adjustments.loudness).toBe('number');
    expect(typeof result.adjustments.stereo).toBe('number');
    expect(Array.isArray(result.notes)).toBe(true);
  });
});