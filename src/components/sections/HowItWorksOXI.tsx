'use client';

import { motion } from 'framer-motion';
import { Upload, Wand2, Download } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload',
    description: 'Drop your audio file into the mixer. Supports WAV, MP3, FLAC, and more.',
  },
  {
    icon: Wand2,
    title: 'AI Processing',
    description: 'Our AI analyzes your track and applies professional-grade mixing instantly.',
  },
  {
    icon: Download,
    title: 'Download',
    description: 'Get your professionally mixed track in studio-quality 32-bit float WAV.',
  },
];

export default function HowItWorksOXI() {
  return (
    <section id="how-it-works" className="section bg-[#000000]">
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
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Three Steps to<br />Professional Sound
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              {/* Step number */}
              <span className="text-xs tracking-[0.3em] uppercase text-[#444444] mb-4 block">
                0{index + 1}
              </span>

              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[#222222]">
                <step.icon className="w-6 h-6" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>

              {/* Description */}
              <p className="text-[#888888] text-sm leading-relaxed">
                {step.description}
              </p>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 left-full w-[calc(100%-4rem)] h-[1px] bg-[#222222] -translate-y-1/2" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
