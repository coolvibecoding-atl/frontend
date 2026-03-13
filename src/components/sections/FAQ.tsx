'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

const faqs = [
  {
    question: 'How does AI mixing compare to a professional human engineer?',
    answer: 'Our AI is trained on thousands of professionally mixed tracks across genres. While it won\'t replace a human engineer\'s creative decisions, it provides an excellent starting point that typically requires minimal fine-tuning. Many users report 80-90% time savings compared to manual mixing.',
  },
  {
    question: 'What genres does AI Mixer Pro support?',
    answer: 'We specialize in urban genres including trap, R&B, boom bap, drill, and hip-hop. Our models understand the specific frequency balances, drum patterns, and mixing characteristics unique to these styles. Support for rock, pop, and electronic is in development.',
  },
  {
    question: 'Do I retain full rights to my mixed tracks?',
    answer: 'Absolutely. You retain 100% ownership of all audio you upload and all tracks you download. Our AI is trained on licensed data, and we don\'t use your uploads to train our models. Commercial license is included with Pro and Studio plans.',
  },
  {
    question: 'What export formats are supported?',
    answer: 'All plans support MP3 export. Pro and Studio plans include WAV export at 44.1kHz/16-bit or 48kHz/24-bit. Studio plan adds stem exports (separated vocals, drums, bass, other) for further editing in your DAW.',
  },
  {
    question: 'How long does processing take?',
    answer: 'Processing time depends on track length and complexity. Typical tracks (3-4 minutes) process in 2-5 minutes. Free tier uses shared processing queues (5-10 min wait), while Pro gets dedicated processing for near-instant results.',
  },
  {
    question: 'Can I use AI Mixer Pro with my DAW?',
    answer: 'Yes! Studio plan includes VST/AU plugin access, allowing you to use AI mixing directly within Ableton, Logic, Pro Tools, FL Studio, and other DAWs. Pro users can export stems and import them manually.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section 
      id="faq" 
      className="section"
      aria-labelledby="faq-heading"
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
            id="faq-heading"
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
            Everything you need to know about AI Mixer Pro
          </p>
        </motion.div>

        {/* FAQ accordion */}
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="panel overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <span className="flex-shrink-0">
                  {openIndex === i ? (
                    <Minus className="w-5 h-5 text-[var(--accent-primary)]" />
                  ) : (
                    <Plus className="w-5 h-5 text-[var(--text-secondary)]" />
                  )}
                </span>
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    id={`faq-answer-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 text-[var(--text-secondary)]">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
