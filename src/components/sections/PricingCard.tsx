'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out AI mixing',
    features: [
      '2 tracks per month',
      'Basic AI mixing',
      'MP3 export only',
      'Watermarked downloads',
    ],
    cta: 'Start Free',
    popular: false,
    benefit: 'Get a taste of professional AI mixing'
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For serious music creators',
    features: [
      'Unlimited tracks',
      'AI mixing & mastering',
      'Stem separation (Demucs)',
      'Priority processing',
      'WAV export',
      'Commercial license',
      'Reference matching',
    ],
    cta: 'Start Free Trial',
    popular: true,
    benefit: 'Create radio-ready tracks every time'
  },
  {
    name: 'Studio',
    price: '$49',
    period: '/month',
    description: 'For professional studios',
    features: [
      'Everything in Pro',
      'Batch processing',
      'API access',
      'Dedicated support',
      'Custom presets',
      'Team collaboration',
      'White-label export',
    ],
    cta: 'Contact Sales',
    popular: false,
    benefit: 'Scale your production to professional levels'
  },
];

export default function PricingCard() {
  return (
    <section 
      id="pricing" 
      className="section bg-[var(--bg-secondary)]"
      aria-labelledby="pricing-heading"
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
            id="pricing-heading"
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Simple, <span className="text-gradient">Transparent</span> Pricing
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
            No hidden fees. Cancel anytime.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative ${plan.popular ? 'md:-mt-4' : ''}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-4 py-1 rounded-full bg-[var(--accent-primary)] text-[var(--bg-primary)] text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Card */}
              <div 
                className={`panel p-6 h-full flex flex-col ${
                  plan.popular 
                    ? 'border-[var(--accent-primary)] shadow-glow' 
                    : 'border-[var(--border-default)]'
                }`}
              >
                {/* Plan name and benefit */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="text-[var(--text-secondary)] text-sm">{plan.description}</p>
                    <p className="text-[var(--accent-primary)] text-xs font-medium mt-1">{plan.benefit}</p>
                  </div>
                  {/* Popular ribbon */}
                  {plan.popular && (
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--bg-primary)] text-xs font-bold">
                      POPULAR
                    </div>
                  )}
                </div>
                
                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6">
                  <span 
                    className="text-5xl font-bold"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-[var(--text-secondary)]">{plan.period}</span>
                </div>
                
                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[var(--accent-primary)]" />
                      </div>
                      <span className="text-[var(--text-secondary)]">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA */}
                <button
                  type="button"
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] hover:shadow-glow-lg'
                      : 'btn-secondary'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}