'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, X, Zap, User, LogIn } from 'lucide-react';
import Link from 'next/link';
// import { usePathname } from 'next/navigation'; // Unused

export default function LandingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // const pathname = usePathname(); // Unused for now

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#faq', label: 'FAQ' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-[var(--surface-glass)] backdrop-blur-xl border-b border-[var(--border-default)]/50 py-3' 
            : 'bg-transparent py-5'
        }`}
        aria-label="Main navigation"
      >
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="AI Mixer Pro Home">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-tertiary)] flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
                <Sparkles className="w-5 h-5 text-[var(--bg-primary)]" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent-primary)] rounded-full animate-pulse" />
            </div>
            <span 
              className="text-xl font-bold tracking-tight" 
              style={{ fontFamily: 'var(--font-display)' }}
            >
              AI Mixer Pro
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex gap-5 text-sm font-medium">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--accent-primary)] group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/sign-in"
                className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <Link
                href="/mixer"
                className="btn-primary text-sm gap-2"
              >
                <Zap className="w-4 h-4" />
                Try Free
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden min-w-[48px] min-h-[48px] flex items-center justify-center text-[var(--text-primary)] -mr-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              id="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-[var(--bg-secondary)]/95 backdrop-blur-xl z-50 md:hidden border-l border-[var(--border-default)]"
            >
              <div className="p-6 pt-20">
                {/* User section */}
                <div className="flex items-center gap-3 p-4 bg-[var(--bg-tertiary)] rounded-xl mb-6">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Guest User</p>
                    <p className="text-xs text-[var(--text-secondary)]">Sign in for more features</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="min-h-[48px] flex items-center text-lg text-[var(--text-secondary)] hover:text-[var(--accent-primary)] px-4 rounded-lg hover:bg-[var(--bg-tertiary)] transition-all"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    href="/sign-in"
                    onClick={() => setIsOpen(false)}
                    className="min-h-[48px] btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                  <Link
                    href="/mixer"
                    onClick={() => setIsOpen(false)}
                    className="min-h-[48px] btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Try Free
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
