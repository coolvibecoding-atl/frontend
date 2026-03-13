'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Clock, Users } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }: { 
  children: React.ReactNode; 
  title: string; 
  subtitle?: string; 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-primary)]">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 opacity-[0.02]">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent-primary)] opacity-[0.02] rounded-full blur-3xl" />
          <div 
            className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[var(--accent-tertiary)] opacity-[0.015] rounded-full blur-3xl" />
        </div>
        
        {/* Floating orbs */}
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              x: [0, 50, 0], 
              y: [0, 30, 0] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-[var(--accent-primary)] opacity-[0.01] rounded-full blur-xl"
          />
          <motion.div 
            animate={{ 
              x: [0, -40, 0], 
              y: [0, -50, 0] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[var(--accent-secondary)] opacity-[0.008] rounded-full blur-3xl" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI Mixer Pro
          </div>
          <h1 
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[var(--text-secondary)] text-lg">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          {children}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-auto text-center text-[var(--text-secondary)] text-sm"
        >
          <p className="mb-2">
            By continuing, you agree to our <a href="/terms" className="text-[var(--accent-primary)] hover:underline">Terms of Service</a> and 
            <a href="/privacy" className="text-[var(--accent-primary)] hover:underline">Privacy Policy</a>
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent-tertiary)]" />
              <span>&lt; 2min Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--accent-secondary)]" />
              <span>10K+ Users</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}