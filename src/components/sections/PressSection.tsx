'use client';

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const pressLogos = [
  { name: 'MusicTech', alt: 'MusicTech logo' },
  { name: 'Producer Magazine', alt: 'Producer Magazine logo' },
  { name: 'Electronic Musician', alt: 'Electronic Musician logo' },
  { name: 'DJ Mag', alt: 'DJ Mag logo' },
  { name: 'Recording Magazine', alt: 'Recording Magazine logo' },
  { name: 'Future Music', alt: 'Future Music logo' },
  { name: 'Beatport News', alt: 'Beatport News logo' },
  { name: 'Create Digital Music', alt: 'Create Digital Music logo' },
];

export default function PressSection() {
  return (
    <section 
      id="press" 
      className="section bg-[var(--bg-secondary)]"
      aria-labelledby="press-heading"
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
            <Zap className="w-4 h-4" />
            As Seen In
          </div>
          <h2 
            id="press-heading"
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Trusted by <span className="text-gradient">Industry Leaders</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
            Featured in leading music production publications and platforms
          </p>
        </motion.div>

        {/* Logos grid */}
        <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-8">
          {pressLogos.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="flex items-center justify-center"
            >
              {/* Using text logos for now; replace with actual logo images when available */}
              <div className="p-4 bg-[var(--bg-tertiary)]/50 rounded-xl hover:bg-[var(--accent-primary)]/10 transition-colors">
                <span className="text-[var(--text-secondary)] font-medium text-center block">
                  {logo.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}