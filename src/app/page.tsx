'use client';


import LandingNavOXI from '@/components/sections/LandingNavOXI';
import HeroOXI from '@/components/sections/HeroOXI';
import HowItWorksOXI from '@/components/sections/HowItWorksOXI';
import FeatureRackOXI from '@/components/sections/FeatureRackOXI';
import TestimonialsOXI from '@/components/sections/TestimonialsOXI';
import PricingOXI from '@/components/sections/PricingOXI';
import FAQOXI from '@/components/sections/FAQOXI';
import FooterOXI from '@/components/sections/FooterOXI';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <LandingNavOXI />
      
      <main id="main-content">
        <HeroOXI />
        <HowItWorksOXI />
        <FeatureRackOXI />
        <TestimonialsOXI />
        <PricingOXI />
        <FAQOXI />
      </main>
      
      <FooterOXI />
    </div>
  );
}
