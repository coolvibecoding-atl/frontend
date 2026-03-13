'use client';

import { motion } from 'framer-motion';
import { Quote, Star, Users } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Marcus Johnson',
    role: 'Producer at Top Dawg Entertainment',
    avatar: 'MJ',
    content: 'AI Mixer Pro has completely changed how I approach mixing. The stem separation is insane - I can pull vocals out of a full mix and remix them in minutes instead of hours. My clients notice the difference immediately.',
    rating: 5,
    stats: '50+ platinum tracks'
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Independent Artist',
    avatar: 'SC',
    content: 'I used to pay $200+ per track for mastering. Now I get radio-ready results in minutes for free. My streams increased 300% after using AI Mixer Pro - the clarity and punch are undeniable.',
    rating: 5,
    stats: '2M+ streams'
  },
  {
    id: 3,
    name: 'DJ Phantom',
    role: 'Beatmaker & YouTuber',
    avatar: 'DP',
    content: 'The reference matching feature is next level. I can A/B my mix against any professional track and get that professional sound consistently. My mix quality went from amateur to professional overnight.',
    rating: 5,
    stats: '100K+ subscribers'
  }
];

const brands = [
  'Spotify', 'Apple Music', 'YouTube', 'SoundCloud', 'Tidal', 'Amazon Music', 'Beatport', 'Traxsource'
];

export default function Testimonials() {
  return (
    <section 
      id="testimonials" 
      className="section bg-[var(--bg-secondary)]"
      aria-labelledby="testimonials-heading"
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
            <Users className="w-4 h-4" />
            Trusted by 10,000+ Producers
          </div>
          <h2 
            id="testimonials-heading"
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Real Results from <span className="text-gradient">Real Pros</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
            See what producers, engineers, and artists are achieving with AI Mixer Pro
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group"
            >
              <div className="panel p-6 h-full flex flex-col relative overflow-hidden">
                {/* Quote icon */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-[var(--accent-primary)]/10" />
                
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, idx) => (
                    <Star key={`${testimonial.id}-star-${idx}`} className="w-4 h-4 fill-[var(--accent-warning)] text-[var(--accent-warning)]" />
                  ))}
                </div>
                
                {/* Content */}
                <p className="text-[var(--text-secondary)] mb-6 flex-1 leading-relaxed">
                  &quot;{testimonial.content}&quot;
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-tertiary)] flex items-center justify-center text-[var(--bg-primary)] font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{testimonial.role}</p>
                  </div>
                </div>
                
                {/* Stats badge */}
                <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                  <span className="text-xs text-[var(--accent-primary)] font-mono">
                    {testimonial.stats}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Platform logos */}
        <div className="text-center">
          <p className="text-sm text-[var(--text-muted)] mb-6">Mastered for every major platform</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-70">
            {brands.map((brand) => (
              <span 
                key={brand}
                className="text-lg md:text-xl font-bold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}