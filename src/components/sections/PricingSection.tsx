'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Rocket, Crown } from 'lucide-react';
import { PLANS, PlanType } from '@/lib/stripe';

const icons = {
  FREE: Zap,
  PRO: Rocket,
  STUDIO: Crown,
};

export default function PricingSection() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: PlanType) => {
    if (planId === 'FREE') return;
    
    setLoadingPlan(planId);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section className="py-24 px-4" id="pricing">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-[var(--accent-primary)]">Plan</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include our core AI mixing features.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {(Object.keys(PLANS) as PlanType[]).map((planId, index) => {
            const plan = PLANS[planId];
            const Icon = icons[planId];
            const isPopular = planId === 'PRO';

            return (
              <motion.div
                key={planId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative panel p-8 
                  ${isPopular ? 'border-[var(--accent-primary)] border-2' : ''}
                `}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--accent-primary)] text-[var(--bg-primary)] text-sm font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-3xl font-bold">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                      {plan.price > 0 && <span className="text-lg font-normal text-[var(--text-secondary)]">/mo</span>}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
                      <span className="text-[var(--text-secondary)]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSubscribe(planId)}
                  disabled={loadingPlan === planId}
                  className={`
                    w-full py-3 rounded-lg font-semibold transition-all
                    ${planId === 'FREE' 
                      ? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-default)]' 
                      : 'btn-primary'
                    }
                    ${loadingPlan === planId ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {loadingPlan === planId ? 'Processing...' : planId === 'FREE' ? 'Get Started' : 'Subscribe'}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
