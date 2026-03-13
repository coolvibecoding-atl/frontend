'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import UploadDemo from './UploadDemo';
import Oscilloscope from '../ui/Oscilloscope';
import { Zap, Shield, Sparkles, ChevronRight, Play, Users, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function HeroConsole() {
  const uploadRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [waveformData, setWaveformData] = useState(Array(32).fill(0));
  const shouldReduceMotion = useReducedMotion();

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth', block: 'center' });
  };

  // Simulate audio level for VU meters and waveform
  useEffect(() => {
    const interval = setInterval(() => {
      // Update audio level with some smoothing
      const newLevel = Math.random() * 100;
      setAudioLevel(prev => prev * 0.7 + newLevel * 0.3);
      
      // Update waveform data
      const newWaveform = Array.from({ length: 32 }, () => 
        Math.random() * 100
      );
      setWaveformData(prev => 
        prev.map((val, idx) => val * 0.6 + newWaveform[idx] * 0.4)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      id="hero"
      className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex flex-col"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(var(--accent-primary) 1px, transparent 1px),
              linear-gradient(90deg, var(--accent-primary) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Radial gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[var(--accent-primary)] opacity-[0.02] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[var(--accent-tertiary)] opacity-[0.02] rounded-full blur-3xl" />
        
        {/* Animated gradient orbs - disabled for reduced motion */}
        {!shouldReduceMotion && (
          <>
            <motion.div 
              animate={{ 
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/4 right-1/4 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.015] rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ 
                x: [0, -30, 0],
                y: [0, 30, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-[var(--accent-secondary)] opacity-[0.01] rounded-full blur-3xl" 
            />
          </>
        )}
      </div>

      <div className="container relative z-10 flex-1 flex flex-col">
        {/* Badge with live AI indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--accent-primary)]/8 text-[var(--accent-primary)] text-sm font-medium border border-[var(--accent-primary)]/20 backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-primary)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--accent-primary)]" />
            </span>
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Audio Processing</span>
            <span className="text-[var(--accent-primary)]/60">|</span>
            <span className="text-[var(--text-secondary)]">Now with real-time stem separation</span>
          </div>
        </motion.div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Professional Mixing
            <br />
            <span className="text-gradient">Powered by AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Bring studio-quality mastering to your bedroom. 
            AI that understands trap, R&B, and boom bap like a veteran engineer.
          </p>
          
          {/* Quick CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              href="/mixer"
              className="btn-primary text-base px-8 py-4 gap-2 group"
            >
              <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Start Free
              <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              type="button"
              onClick={scrollToUpload}
              className="btn-secondary text-base px-8 py-4 gap-2"
            >
              <Play className="w-4 h-4" />
              See How It Works
            </button>
          </div>
        </motion.div>

        {/* Console-style upload area */}
        <motion.div
          ref={uploadRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          {/* Console frame */}
          <div className="panel p-1 max-w-3xl mx-auto">
            {/* Console header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-default)] rounded-t-lg">
              <div className="flex items-center gap-2">
                {/* VU meters */}
                <div className="vu-meter" role="img" aria-label="Audio level meter">
                  {/* eslint-disable-next-line react/no-array-index-key */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const level = Math.min(100, Math.max(0, audioLevel + (Math.random() - 0.5) * 20));
                    const height = Math.max(4, Math.min(24, (level / 100) * 24));
                    return (
                      <motion.div
                        key={`vu-${i}`}
                        animate={{ height }}
                        transition={{ duration: 0.1 }}
                        className={`vu-segment ${
                          i < 6 ? 'active-green' : i < 10 ? 'active-yellow' : 'active-red'
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="text-xs text-[var(--text-muted)] font-mono ml-2">AI PROCESSOR v2.0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--accent-primary)]/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                  <span className="text-xs text-[var(--accent-primary)] font-mono">LIVE</span>
                </div>
              </div>
            </div>
            
                {/* Waveform visualization */}
                <div className="px-6 py-6 bg-[var(--bg-primary)] border-b border-[var(--border-default)]">
                  <div className="waveform-display">
                    {waveformData.map((val, idx) => (
                      <motion.div 
                        key={idx}
                        style={{ height: `${val}%` }}
                        transition={{ duration: 0.1 }}
                        className="waveform-bar"
                      />
                    ))}
                  </div>
                </div>
            
            {/* Upload content */}
            <div className="p-8 bg-[var(--bg-secondary)] rounded-b-lg">
              <UploadDemo />
            </div>
          </div>
        </motion.div>

        {/* Trust badges and stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-auto"
        >
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-[var(--text-muted)] mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent-tertiary)]" />
              <span>Under 2min Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--accent-secondary)]" />
              <span>10K+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--accent-warning)]" />
              <span>99.9% Uptime</span>
            </div>
          </div>

          {/* Stats row with animated counters */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-8">
            {[
              { value: '127,345', label: 'Tracks Mixed', color: '#00ff88' },
              { value: '4.9', label: 'User Rating', color: '#00d4ff' },
              { value: '$0', label: 'To Start', color: '#ff3366' },
              { value: '24/7', label: 'Uptime', color: '#ffaa00' },
            ].map((stat) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: Math.random() * 0.5 }}
                className="text-center group"
              >
                <div className="flex flex-col items-center">
                  <motion.span 
                    whileInView={{ scale: [0.5, 1, 1.1, 1] }}
                    transition={{ duration: 1.2 }}
                    className="text-3xl md:text-4xl font-bold block"
                    style={{ 
                      color: stat.color,
                      fontFamily: 'var(--font-display)',
                      textShadow: `0 0 30px ${stat.color}30`,
                    }}
                  >
                    {stat.value}
                  </motion.span>
                  <p className="text-[var(--text-secondary)] text-sm mt-2">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}