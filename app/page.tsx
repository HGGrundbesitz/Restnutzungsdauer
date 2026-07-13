'use client';

import {useRef} from 'react';
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
import {motion, useReducedMotion, useScroll, useSpring, useTransform} from 'motion/react';

export default function Home() {
  const quickCheckRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const {scrollYProgress} = useScroll();
  const {scrollYProgress: quickCheckProgress} = useScroll({
    target: quickCheckRef,
    offset: ['start end', 'start 58%'],
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const quickCheckY = useTransform(quickCheckProgress, [0, 1], [88, 0]);
  const quickCheckScale = useTransform(quickCheckProgress, [0, 1], [0.985, 1]);
  const quickCheckOpacity = useTransform(quickCheckProgress, [0, 0.7, 1], [0.76, 0.96, 1]);

  return (
    <main className="overflow-x-hidden text-[var(--color-ink)]">
      <motion.div className="fixed left-0 right-0 top-0 z-[100] h-1 origin-left bg-[var(--color-accent)]" style={{scaleX}} />
      <Header />
      <Hero />
      <div
        ref={quickCheckRef}
        className="relative z-10 w-full bg-white pt-24 sm:pt-32 lg:pt-40"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.075),transparent_66%)]"
        />
        <motion.div
          style={
            reduceMotion
              ? undefined
              : {y: quickCheckY, scale: quickCheckScale, opacity: quickCheckOpacity}
          }
        >
          <QuickCheck />
        </motion.div>
        <RequiredDocuments />
        <LegalTrustBox />
        <HowItWorks />
        <AboutUs />
        <div className="section-shell grid items-start gap-5 py-16 md:py-24 lg:grid-cols-[0.88fr_1.12fr] lg:gap-6">
          <RequestForm embedded />
          <FAQ embedded />
        </div>
        <Footer />
      </div>
    </main>
  );
}
