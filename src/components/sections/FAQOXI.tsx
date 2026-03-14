'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: 'How does AI mixing work?',
    answer: 'Our AI analyzes your audio track and applies professional mixing techniques including EQ, compression, reverb, and more. It learns from thousands of professionally mixed tracks to deliver studio-quality results.',
  },
  {
    question: 'What audio formats do you support?',
    answer: 'We support WAV, MP3, FLAC, AIFF, OGG, and M4A. For export, we offer WAV (32-bit float), MP3, and FLAC at various quality settings.',
  },
  {
    question: 'Is my audio secure?',
    answer: 'Yes. Your audio files are encrypted in transit and at rest. We do not use your tracks to train our AI models. All files are automatically deleted after 30 days.',
  },
  {
    question: 'Can I use AI Mixer Pro for commercial projects?',
    answer: 'Yes! All tracks processed with AI Mixer Pro are 100% yours to use commercially, royalty-free.',
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day money-back guarantee for all paid plans. If you are not satisfied, contact us for a full refund.",
  },
];

export default function FAQOXI() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section bg-[#000000]">
      <div className="container">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-[#666666] mb-4 block">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Questions & Answers
          </h2>
        </motion.div>

        {/* FAQ items */}
        <div className="max-w-2xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="border-b border-[#111111]"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-6 flex items-center justify-between text-left"
              >
                <span className="text-lg font-medium pr-8">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 flex-shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-[#666666] leading-relaxed">
                      {faq.answer}
                    </p>
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
