'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AudioReactiveVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}

export default function AudioReactiveVisualizer({ 
  audioRef, 
  isPlaying,
  barCount = 32,
  className = ''
}: AudioReactiveVisualizerProps) {
  const animationRef = useRef<number | null>(null);
  const [audioData, setAudioData] = useState<number[]>(() => Array(barCount).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const barKeys = useMemo(() => 
    Array.from({ length: barCount }, (_, i) => `bar-${i}`),
    [barCount]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) {
      if (!isPlaying) {
        setAudioData(Array(barCount).fill(0));
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
      return;
    }

    const setupAudioContext = () => {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      
      if (!sourceRef.current && audioContextRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    };

    const updateVisualization = () => {
      if (!analyserRef.current) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      const newData: number[] = [];
      const step = Math.floor(bufferLength / barCount);
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] / 255;
        newData.push(value);
      }
      setAudioData(newData);

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(updateVisualization);
      }
    };

    const handlePlay = () => {
      setupAudioContext();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      updateVisualization();
    };

    const handlePause = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setAudioData(Array(barCount).fill(0));
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);

    if (!audio.paused) {
      handlePlay();
    }

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
    };
  }, [audioRef, isPlaying, barCount]);

  return (
    <div 
      className={`flex items-end justify-center gap-[2px] h-16 ${className}`}
      role="img"
      aria-label="Audio waveform visualization"
    >
      {audioData.map((value, i) => (
        <motion.div
          key={barKeys[i]}
          className="w-1.5 bg-gradient-to-t from-[var(--accent-primary)] to-[var(--accent-tertiary)] rounded-t"
          animate={shouldReduceMotion ? {} : {
            height: `${Math.max(4, value * 100)}%`
          }}
          transition={{
            duration: 0.1,
            ease: 'easeOut'
          }}
          style={{
            opacity: value > 0 ? 0.6 + value * 0.4 : 0.3
          }}
        />
      ))}
    </div>
  );
}
