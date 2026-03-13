import { getGenreList, getPreset } from '@/lib/ai/genrePresets';
import { analyzeAudio, processAudio } from '@/lib/ai/audioMixer';

describe('Genre Presets', () => {
  test('should return all 10 genres', () => {
    const genres = getGenreList();
    expect(genres).toHaveLength(10);
    expect(genres.map(g => g.id)).toContain('hip-hop');
    expect(genres.map(g => g.id)).toContain('pop');
    expect(genres.map(g => g.id)).toContain('jazz');
  });

  test('should return correct preset for genre', () => {
    const hipHopPreset = getPreset('hip-hop');
    expect(hipHopPreset.name).toBe('Hip-Hop');
    expect(hipHopPreset.lufs.target).toBe(-8);
    
    const popPreset = getPreset('pop');
    expect(popPreset.name).toBe('Pop');
    expect(popPreset.lufs.target).toBe(-7);
  });

  test('should return default preset for unknown genre', () => {
    const defaultPreset = getPreset('unknown-genre');
    const popPreset = getPreset('pop');
    expect(defaultPreset).toEqual(popPreset);
  });
});

describe('Audio Analysis', () => {
  test('should return valid audio analysis', () => {
    const analysis = analyzeAudio();
    expect(analysis).toHaveProperty('rms');
    expect(analysis).toHaveProperty('peak');
    expect(analysis).toHaveProperty('lufs');
    expect(analysis).toHaveProperty('dynamicRange');
    expect(analysis).toHaveProperty('crestFactor');
    
    // Check reasonable values
    expect(analysis.rms).toBeGreaterThanOrEqual(0);
    expect(analysis.rms).toBeLessThanOrEqual(1);
    expect(analysis.peak).toBeGreaterThanOrEqual(0);
    expect(analysis.peak).toBeLessThanOrEqual(1);
  });
});

describe('Audio Processing', () => {
  test('should process audio with genre preset', async () => {
    const options = {
      genre: 'pop',
      enableStemSeparation: false,
      enableMastering: false
    };

    // Create a dummy audio buffer (1 second of silence)
    const audioBuffer = new ArrayBuffer(48000 * 2 * 2); // 48kHz, stereo, 16-bit

    const result = await processAudio(audioBuffer, options);

    expect(result).toHaveProperty('analysis');
    expect(result).toHaveProperty('processedLufs');
    expect(result).toHaveProperty('processedPeak');
    expect(result).toHaveProperty('processedDynamicRange');
    expect(result).toHaveProperty('settings');
    expect(result).toHaveProperty('warnings');

    // Check that processing changed the LUFS value towards target
    const preset = getPreset('pop');
    expect(result.processedLufs).toBeCloseTo(preset.lufs.target, 1);
  });

  test('should handle hip-hop genre correctly', async () => {
    const options = {
      genre: 'hip-hop',
      enableStemSeparation: false,
      enableMastering: false
    };

    const audioBuffer = new ArrayBuffer(48000 * 2 * 2);
    const result = await processAudio(audioBuffer, options);

    const preset = getPreset('hip-hop');
    expect(result.processedLufs).toBeCloseTo(preset.lufs.target, 1);
  });
});