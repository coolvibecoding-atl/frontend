'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for trying out the platform.',
    features: [
      '3 tracks per month',
      'Basic AI mixing',
      'MP3 export only',
      'Standard quality',
    ],
    cta: 'Get Started',
    href: '/sign-up',
    featured: false,
  },
  {
    name: 'Pro',
    price: '19',
    description: 'For serious music creators.',
    features: [
      'Unlimited tracks',
      'Advanced AI mixing',
      'WAV & MP3 export',
      'Studio quality (32-bit)',
      'Stem separation',
      'Priority processing',
    ],
    cta: 'Start Free Trial',
    href: '/sign-up',
    featured: true,
  },
  {
    name: 'Studio',
    price: '49',
    description: 'For professional studios.',
    features: [
      'Everything in Pro',
      'Batch processing',
      'Custom AI models',
      'API access',
      'Dedicated support',
      'White label options',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    featured: false,
  },
];

export default function PricingOXI() {
  return (
    <section id="pricing" className="section bg-[#0a0a0a]">
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
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple Pricing
          </h2>
          <p className="text-[#888888]">
            Start free, upgrade when you're ready.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-px bg-[#222222] max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-[#0a0a0a] p-8 md:p-12 ${
                plan.featured ? 'relative' : ''
              }`}
            >
              {/* Featured badge */}
              {plan.featured && (
                <div className="absolute top-0 left-0 right-0 bg-[#ffffff] text-[#000000] text-center py-2 text-xs uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.price !== '0' && <span className="text-[#666666]">/month</span>}
              </div>

              {/* Description */}
              <p className="text-sm text-[#666666] mb-8">{plan.description}</p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[#888888]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`block text-center py-4 text-sm uppercase tracking-wider transition-colors ${
                  plan.featured
                    ? 'bg-[#ffffff] text-[#000000] hover:bg-[#cccccc]'
                    : 'border border-[#333333] hover:border-[#ffffff]'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
