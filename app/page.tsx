'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import AboutUs from '@/components/AboutUs';
import QuickCheck from '@/components/QuickCheck';
import RequestForm from '@/components/RequestForm';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import LegalTrustBox from '@/components/LegalTrustBox';
import RequiredDocuments from '@/components/RequiredDocuments';
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
      <motion.div className="fixed left-0 right-0 top-0 z-[100] h-1 origin-left bg-[var(--color-accent)]" style={{scaleX}} />
      <Header />
      <Hero />
      <div className="relative z-10 w-full">
        <QuickCheck />
        <RequiredDocuments />
        <LegalTrustBox />
        <HowItWorks />
        <AboutUs />
        <RequestForm />
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}
