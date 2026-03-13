'use client';


import LandingNav from '@/components/sections/LandingNav';
import HeroConsole from '@/components/sections/HeroConsole';
import HowItWorks from '@/components/sections/HowItWorks';
import FeatureRack from '@/components/sections/FeatureRack';
import PricingCard from '@/components/sections/PricingCard';
import FAQ from '@/components/sections/FAQ';
import Footer from '@/components/sections/Footer';
import Testimonials from '@/components/sections/Testimonials';
import PressSection from '@/components/sections/PressSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white wood-grain">
      <LandingNav />
      
      <main id="main-content">
        <HeroConsole />
        <HowItWorks />
        <FeatureRack />
        <Testimonials />
        <PressSection />
        <PricingCard />
        <FAQ />
      </main>
      
      <Footer />
    </div>
  );
}
