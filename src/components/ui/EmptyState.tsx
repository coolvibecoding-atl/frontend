'use client';

import { motion } from 'framer-motion';
import { LucideIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: 'default' | 'centered';
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  variant = 'default' 
}: EmptyStateProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col ${variant === 'centered' ? 'items-center justify-center text-center' : ''}`}
    >
      {/* Icon container with subtle glow */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-primary)]/20">
          <Icon className="w-10 h-10 text-[var(--accent-primary)]" />
        </div>
        {/* Decorative sparkle */}
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-5 h-5 text-[var(--accent-tertiary)] opacity-60" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </h3>

      {/* Description */}
      <p className="text-[var(--text-secondary)] max-w-sm mb-6">
        {description}
      </p>

      {/* Action button */}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="btn-primary inline-flex items-center gap-2"
            onClick={action.onClick}
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            className="btn-primary inline-flex items-center gap-2"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )
      )}
    </motion.div>
  );

  if (variant === 'centered') {
    return (
      <div className="panel p-12 flex flex-col items-center justify-center text-center">
        {content}
      </div>
    );
  }

  return (
    <div className="panel p-8">
      {content}
    </div>
  );
}
