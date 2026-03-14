'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "AI Mixer Pro has completely transformed my workflow. What used to take hours now takes minutes. The quality is indistinguishable from professional studio mixing.",
    author: "Marcus Chen",
    role: "Music Producer",
  },
  {
    quote: "As someone without formal mixing training, this tool gives me results I could never achieve on my own. It's like having a professional engineer in my pocket.",
    author: "Sarah Williams",
    role: "Independent Artist",
  },
  {
    quote: "The stem separation is incredible. I've been able to create remixes and acappellas that would have been impossible before.",
    author: "DJ Thunder",
    role: "Electronic Musician",
  },
];

export default function TestimonialsOXI() {
  return (
    <section className="section bg-[#000000]">
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
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            What Artists Say
          </h2>
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-px bg-[#222222]">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-[#0a0a0a] p-8 md:p-12"
            >
              {/* Quote */}
              <blockquote className="text-[#cccccc] leading-relaxed mb-8">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div>
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-sm text-[#666666]">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
