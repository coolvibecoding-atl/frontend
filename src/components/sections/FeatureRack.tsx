'use client';

import { motion } from 'framer-motion';
import { Sliders, Zap, Volume2, Mic, Layers, Headphones, Sparkles, Waves, Timer, Gauge } from 'lucide-react';

const features = [
  { 
    icon: Layers, 
    title: 'Stem Separation', 
    description: 'Extract vocals, drums, bass, and instruments from any track with surgical precision—perfect for remixes, samples, or fixing mix issues.',
    tag: 'NEW'
  },
  { 
    icon: Sliders, 
    title: 'AI Smart Mixing', 
    description: 'Get radio-ready, competitive mixes in seconds—our AI applies the exact EQ, compression, and balancing used by top engineers on your genre.',
    tag: null
  },
  { 
    icon: Zap, 
    title: 'Instant Mastering', 
    description: 'Loudness, clarity, and punch that matches commercial releases—optimized for Spotify, Apple Music, YouTube, and club systems.',
    tag: 'POPULAR'
  },
  { 
    icon: Volume2, 
    title: 'Before/After', 
    description: 'A/B compare your original vs AI mixed version instantly with parallel playback—hear the difference before you commit.',
    tag: null
  },
  { 
    icon: Mic, 
    title: 'Vocal Enhancement', 
    description: 'Crystal-clear vocals that cut through the mix—auto-tune correction, de-essing, and presence boosting that sounds natural, not processed.',
    tag: null
  },
  { 
    icon: Headphones, 
    title: 'Reference Matching', 
    description: 'Match the sonic signature of your favorite recordings—get that classic vocal warmth or modern drum punch with one click.',
    tag: null
  },
  { 
    icon: Waves, 
    title: 'Reverb & Effects', 
    description: 'Professional space and dimension—from intimate room ambience to epic hall reverb, all intelligently matched to your track.',
    tag: 'NEW'
  },
  { 
    icon: Timer, 
    title: 'Batch Processing', 
    description: 'Process entire albums or sample packs at once—consistent quality across all tracks with automatic genre detection.',
    tag: null
  },
  { 
    icon: Gauge, 
    title: 'Real-time Preview', 
    description: 'Hear every adjustment instantly with zero latency—no more waiting for renders to tweak your mix.',
    tag: 'PRO'
  },
];

export default function FeatureRack() {
  return (
    <section 
      id="features" 
      className="section"
      aria-labelledby="features-heading"
    >
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Features
          </div>
          <h2 
            id="features-heading"
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Studio-Quality <span className="text-gradient">Tools</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
            Professional mixing tools powered by cutting-edge AI
          </p>
        </motion.div>

        {/* Feature grid - rack style */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <div className="panel p-6 h-full border-[var(--border-default)] hover:border-[var(--accent-primary)]/50 transition-all bg-[var(--surface-solid)] relative overflow-hidden">
                {/* Tag */}
                {feature.tag && (
                  <div className={`absolute top-4 right-4 px-2 py-0.5 rounded text-xs font-bold ${
                    feature.tag === 'NEW' 
                      ? 'bg-[var(--accent-tertiary)]/20 text-[var(--accent-tertiary)]'
                      : feature.tag === 'POPULAR'
                      ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                      : 'bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]'
                  }`}>
                    {feature.tag}
                  </div>
                )}
                
                {/* Rack mount indicator */}
                <div className="flex gap-1 mb-4">
                  <div className="w-2 h-1 rounded-full bg-[var(--border-default)]" />
                  <div className="w-2 h-1 rounded-full bg-[var(--border-default)]" />
                </div>
                
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--accent-primary)]/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-[var(--accent-primary)]" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm">{feature.description}</p>
                
                {/* LED indicator */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="LED w-4 h-4" />
                  <span className="text-xs text-[var(--text-muted)] font-mono">ACTIVE</span>
                </div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/0 to-[var(--accent-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}