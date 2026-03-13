'use client';

import { motion } from 'framer-motion';
import { Upload, Wand2, Sliders, Download, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Track',
    description: 'Drop your WAV, MP3, or FLAC file. Get instant analysis and see your mix transform in real-time.',
  },
  {
    icon: Wand2,
    title: 'AI Analysis',
    description: 'Our genre-aware AI identifies your style—trap, R&B, boom bap—and applies the exact techniques used by Grammy-winning engineers.',
  },
  {
    icon: Sliders,
    title: 'Smart Mixing',
    description: 'Automated EQ, compression, and leveling that makes your tracks sound professional, radio-ready, and competitive on any platform.',
  },
  {
    icon: Download,
    title: 'Export & Download',
    description: 'Download your mixed track in pristine WAV or high-quality MP3. Keep full stems for unlimited creative control.',
  },
];

export default function HowItWorks() {
  return (
    <section 
      id="how-it-works" 
      className="section bg-[var(--bg-secondary)]"
      aria-labelledby="how-it-works-heading"
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
          <h2 
            id="how-it-works-heading"
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
            From upload to professional mix in four simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              {/* Card */}
              <div className="panel p-6 h-full flex flex-col">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-sm font-bold text-[var(--bg-primary)]">
                  {i + 1}
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center mb-4 border border-[var(--accent-primary)]/30">
                  <step.icon className="w-7 h-7 text-[var(--accent-primary)]" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm flex-1">{step.description}</p>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-[var(--border-hover)]" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}