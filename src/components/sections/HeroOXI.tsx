'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Headphones, Waves, Zap } from 'lucide-react';

export default function HeroOXI() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background - pure black with subtle grid */}
      <div className="absolute inset-0 bg-[#000000]" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Animated gradient orbs - subtle */}
      <motion.div 
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', top: '10%', left: '-10%' }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.02]"
        style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', bottom: '10%', right: '-5%' }}
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="container relative z-10 py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Eyebrow */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-[#666666]">
              Professional Audio AI
            </span>
          </motion.div>

          {/* Main headline - OXI style massive text */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="block">AI MIXER</span>
            <span className="block text-[#666666]">PRO</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-[#cccccc] max-w-2xl mx-auto mb-12 font-light"
          >
            Professional audio mixing powered by artificial intelligence. 
            Bring studio-quality mastering to your bedroom.
          </motion.p>

          {/* CTA Buttons - OXI style */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/mixer" className="btn-primary group">
              <span>Try Free</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="#how-it-works" className="btn-secondary">
              Learn More
            </Link>
          </motion.div>

          {/* Product images / visual - OXI style product shot */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-20 md:mt-32 relative"
          >
            {/* Mockup of the app interface */}
            <div className="relative mx-auto max-w-4xl aspect-video bg-[#0a0a0a] border border-[#222222]">
              {/* Top bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#222222]">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-[#333333]" />
                  <div className="w-3 h-3 rounded-full bg-[#333333]" />
                  <div className="w-3 h-3 rounded-full bg-[#333333]" />
                </div>
                <div className="text-xs text-[#666666] tracking-wider uppercase">AI Mixer Pro</div>
              </div>
              
              {/* Waveform visualization - animated */}
              <div className="flex items-center justify-center h-full gap-1 px-8">
                {[...Array(60)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-[#ffffff]"
                    animate={{
                      height: [20, Math.random() * 80 + 20, 20],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.02,
                      ease: "easeInOut"
                    }}
                    style={{ minHeight: 20, maxHeight: 100 }}
                  />
                ))}
              </div>

              {/* Floating badges */}
              <motion.div 
                className="absolute top-6 left-6 px-4 py-2 bg-[#111111] border border-[#333333]"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider">AI Powered</span>
                </div>
              </motion.div>

              <motion.div 
                className="absolute top-6 right-6 px-4 py-2 bg-[#111111] border border-[#333333]"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider">32-bit Float</span>
                </div>
              </motion.div>

              <motion.div 
                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#111111] border border-[#333333]"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider">Real-time Processing</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-[#333333] to-transparent" />
      </motion.div>
    </section>
  );
}
