'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function FooterOXI() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { href: '#features', label: 'Features' },
      { href: '#pricing', label: 'Pricing' },
      { href: '#how-it-works', label: 'How It Works' },
      { href: '/mixer', label: 'Try Free' },
    ],
    company: [
      { href: '/about', label: 'About' },
      { href: '/blog', label: 'Blog' },
      { href: '/careers', label: 'Careers' },
      { href: '/contact', label: 'Contact' },
    ],
    legal: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/cookies', label: 'Cookies' },
    ],
  };

  return (
    <footer className="bg-[#000000] border-t border-[#111111]">
      <div className="container">
        {/* Main footer */}
        <div className="py-16 md:py-24">
          <div className="grid md:grid-cols-5 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold">AI MIXER PRO</span>
              </Link>
              <p className="text-[#666666] text-sm leading-relaxed max-w-sm">
                Professional audio mixing powered by artificial intelligence. 
                Bring studio-quality mastering to your bedroom.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#444444] mb-6">
                Product
              </h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-sm text-[#888888] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#444444] mb-6">
                Company
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-sm text-[#888888] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#444444] mb-6">
                Legal
              </h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-sm text-[#888888] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-8 border-t border-[#111111] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#444444]">
            © {currentYear} AI Mixer Pro. All rights reserved.
          </p>
          <p className="text-xs text-[#444444]">
            Made with AI
          </p>
        </div>
      </div>
    </footer>
  );
}
