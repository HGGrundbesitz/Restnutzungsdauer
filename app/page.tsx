'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TrustedBy from '@/components/TrustedBy';
import ValueProposition from '@/components/ValueProposition';
import HowItWorks from '@/components/HowItWorks';
import AboutUs from '@/components/AboutUs';
import QuickCheck from '@/components/QuickCheck';
import RequestForm from '@/components/RequestForm';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import {motion, useScroll, useSpring} from 'motion/react';

export default function Home() {
  const {scrollYProgress} = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <main className="overflow-x-hidden text-[var(--color-ink)]">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[var(--color-accent)] origin-left z-[100]"
        style={{scaleX}}
      />
      <Header />

      <Hero />

      <div className="relative z-10 w-full">
        <QuickCheck />
        <TrustedBy />
        <ValueProposition />
        <HowItWorks />
        <AboutUs />
        <RequestForm />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}


