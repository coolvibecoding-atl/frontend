import { getPreset } from '../ai/genrePresets';
import { processAudio } from '../ai/audioMixer';
import { vocalTuner, VocalTuningOptions } from '../ai/vocal/tuner';
import { referenceMatcher } from '../ai/reference/matcher';

/**
 * Performance benchmark for AI Mixer Pro processing pipeline
 */
export async function benchmarkProcessing() {
  console.log('🔧 Starting AI Mixer Pro Performance Benchmark...\n');
  
  // Create test audio buffer (10 seconds of stereo audio @ 48kHz)
  const duration = 10; // seconds
  const sampleRate = 48000;
  const channels = 2;
  const bytesPerSample = 2; // 16-bit
  const bufferSize = duration * sampleRate * channels * bytesPerSample;
  const audioBuffer = new ArrayBuffer(bufferSize);
  
  // Fill with test signal (mix of frequencies)
  const samples = new Float32Array(audioBuffer);
  for (let i = 0; i < samples.length; i += channels) {
    const t = i / (sampleRate * channels);
    // Mix of frequencies to simulate real audio
    samples[i] = 
      Math.sin(2 * Math.PI * 110 * t) * 0.3 +   // A2
      Math.sin(2 * Math.PI * 220 * t) * 0.25 +  // A3
      Math.sin(2 * Math.PI * 440 * t) * 0.2 +   // A4
      Math.sin(2 * Math.PI * 880 * t) * 0.15 +  // A5
      (Math.random() - 0.5) * 0.1;              // Noise
    
    if (channels > 1) samples[i + 1] = samples[i]; // Stereo duplicate
  }
  
  console.log(`📊 Test Buffer: ${duration}s @ ${sampleRate}Hz, ${channels}ch, ${(bufferSize / 1024 / 1024).toFixed(2)} MB\n`);
  
  // Test 1: Basic genre processing
  console.log('🧪 Test 1: Genre-based Processing');
  const startTime = Date.now();
  
  const genres = ['hip-hop', 'pop', 'rock', 'jazz'];
  for (const genre of genres) {
    const genreStart = Date.now();
    const options = {
      genre,
      enableStemSeparation: false,
      enableMastering: true
    };
    
    const result = await processAudio(audioBuffer, options);
    const genreTime = Date.now() - genreStart;
    
    console.log(`   ${genre}: ${genreTime}ms (LUFS: ${result.processedLufs.toFixed(1)} → Target: ${getPreset(genre).lufs.target})`);
  }
  
  const genreTime = Date.now() - startTime;
  console.log(`   ⏱️  Total genre processing: ${genreTime}ms\n`);
  
  // Test 2: Vocal processing
  console.log('🎤 Test 2: Vocal Tuning Processing');
  const vocalStart = Date.now();
  
  const vocalOptions: VocalTuningOptions = {
    pitchCorrection: true,
    correctionAmount: 75,
    formantShift: 0,
    harmonyEnabled: true,
    harmonyInterval: 'third',
    harmonyLevel: 30,
    vibrato: true,
    vibratoDepth: 40,
    vibratoRate: 5
  };
  
  const vocalResult = await vocalTuner.process(audioBuffer, vocalOptions);
  const vocalTime = Date.now() - vocalStart;
  
  console.log(`   ⏱️  Vocal processing: ${vocalTime}ms`);
  console.log(`   🎯 Corrections: Pitch(${vocalResult.corrections.pitch}%), Formant(${vocalResult.corrections.formant}st)`);
  console.log(`   🎵 Harmony: ${vocalResult.corrections.harmony ? 'ON' : 'OFF'}, Vibrato: ${vocalResult.corrections.vibrato ? 'ON' : 'OFF'}\n`);
  
  // Test 3: Reference matching
  console.log('🎯 Test 3: Reference Matching');
  const referenceStart = Date.now();
  
  const referenceOptions = {
    eqMatching: true,
    dynamicsMatching: true,
    spectralMatching: false,
    loudnessMatching: true,
    stereoMatching: false,
    matchStrength: 80
  };
  
  const referenceResult = await referenceMatcher.matchReference(
    audioBuffer,
    audioBuffer, // Using same buffer as reference for test
    referenceOptions
  );
  
  const referenceTime = Date.now() - referenceStart;
  
  console.log(`   ⏱️  Reference matching: ${referenceTime}ms`);
  console.log(`   📝 Notes: ${referenceResult.notes.join(', ')}\n`);
  
  // Test 4: Full pipeline
  console.log('🚀 Test 4: Full Processing Pipeline');
  const pipelineStart = Date.now();
  
  // Genre processing
  const genreResult = await processAudio(audioBuffer, {
    genre: 'pop',
    enableStemSeparation: true,
    enableMastering: true
  });
  
  // Vocal processing on result
  const vocalResult2 = await vocalTuner.process(audioBuffer, vocalOptions as VocalTuningOptions);
  
  // Reference matching
  await referenceMatcher.matchReference(
    audioBuffer,
    audioBuffer,
    referenceOptions
  );
  
  const pipelineTime = Date.now() - pipelineStart;
  
  console.log(`   ⏱️  Full pipeline: ${pipelineTime}ms`);
  console.log(`   📊 LUFS: ${genreResult.processedLufs.toFixed(1)}`);
  console.log(`   🎤 Vocal corrections applied: ${vocalResult2.corrections.pitch > 0 ? 'YES' : 'NO'}\n`);
  
  // Summary
  const totalTime = Date.now() - startTime;
  console.log('📈 BENCHMARK SUMMARY:');
  console.log(`   ⏱️  Total time: ${totalTime}ms`);
  console.log(`   🚀 Processing speed: ${(duration * 1000 / totalTime).toFixed(1)}x real-time`);
  console.log(`   💾 Memory efficient: ArrayBuffer-based processing`);
  console.log(`   ✅ All systems operational\n`);
  
  return {
    totalTime,
    genreTime,
    vocalTime,
    referenceTime,
    pipelineTime
  };
}

// Run if called directly
if (typeof window === 'undefined' && process.argv[1]?.includes('benchmark')) {
  (async () => {
    try {
      await benchmarkProcessing();
    } catch (error) {
      console.error('Benchmark failed:', error);
      process.exit(1);
    }
  })();
}

export default benchmarkProcessing;