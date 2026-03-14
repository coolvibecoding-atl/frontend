'use client';

import { motion } from 'framer-motion';
import { 
  Binary, 
  Cpu, 
  Layers, 
  Sliders, 
  Zap,
  Music
} from 'lucide-react';

const features = [
  {
    icon: Binary,
    title: 'AI Stem Separation',
    description: 'Isolate vocals, drums, bass, and instruments with unprecedented accuracy.',
  },
  {
    icon: Cpu,
    title: 'Smart EQ Matching',
    description: 'AI analyzes reference tracks and automatically matches your EQ curve.',
  },
  {
    icon: Layers,
    title: 'Intelligent Mixing',
    description: 'Automatic level balancing, panning, and space creation for every element.',
  },
  {
    icon: Sliders,
    title: 'Pro Compression',
    description: 'Dynamic processing that preserves transients while controlling dynamics.',
  },
  {
    icon: Zap,
    title: 'Real-time Processing',
    description: 'Process audio in real-time with near-zero latency.',
  },
  {
    icon: Music,
    title: 'Multi-format Export',
    description: 'Export in WAV, MP3, FLAC, and more at any sample rate.',
  },
];

export default function FeatureRackOXI() {
  return (
    <section id="features" className="section bg-[#0a0a0a]">
      <div className="container">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-[#666666] mb-4 block">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Built for Creators
          </h2>
          <p className="text-[#888888] max-w-xl mx-auto">
            Professional-grade audio tools powered by cutting-edge artificial intelligence.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#222222]">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#0a0a0a] p-8 md:p-12 group hover:bg-[#0f0f0f] transition-colors"
            >
              {/* Icon */}
              <div className="w-12 h-12 mb-6 flex items-center justify-center border border-[#222222] group-hover:border-[#444444] transition-colors">
                <feature.icon className="w-5 h-5" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>

              {/* Description */}
              <p className="text-[#666666] text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
