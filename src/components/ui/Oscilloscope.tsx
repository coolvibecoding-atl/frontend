'use client';

import { motion } from 'framer-motion';

interface OscilloscopeProps {
  className?: string;
  active?: boolean;
}

export default function Oscilloscope({ className = '', active = true }: OscilloscopeProps) {
  const bars = Array.from({ length: 32 }, (_, i) => i);

  return (
    <div 
      className={`waveform-display ${className}`}
      role="img"
      aria-label="Audio waveform visualization"
    >
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="waveform-bar"
          initial={{ height: '10%' }}
          animate={active ? {
            height: [
              `${Math.random() * 60 + 20}%`,
              `${Math.random() * 80 + 20}%`,
              `${Math.random() * 40 + 20}%`,
            ],
          } : { height: '10%' }}
          transition={{
            duration: 0.3 + Math.random() * 0.4,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.02,
          }}
          style={{
            opacity: 0.4 + (i / 32) * 0.6,
          }}
        />
      ))}
    </div>
  );
}
