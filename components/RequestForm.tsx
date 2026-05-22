'use client';

import {ArrowRight, CheckCircle2} from 'lucide-react';
import {motion} from 'motion/react';

export default function RequestForm() {
  return (
    <section id="anfrage" className="relative z-10 mx-auto max-w-[1180px] px-4 py-24 sm:px-6 md:py-32">
      <div className="pointer-events-none absolute inset-x-[8%] top-16 -z-10 h-[360px] rounded-full bg-[var(--color-accent-soft)] blur-[120px] opacity-70" />

      <motion.div
        initial={{opacity: 0, y: 20}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true, margin: '-100px'}}
        transition={{duration: 0.8}}
        className="glass-panel overflow-hidden rounded-[2.2rem] p-8 text-center shadow-[var(--shadow-lift)] sm:p-10 md:p-14"
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <CheckCircle2 size={26} />
        </div>

        <h2 className="font-heading text-4xl font-semibold tracking-tight text-[var(--color-ink)] md:text-5xl">
          Unverbindlich anfragen
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--color-text-muted)]">
          Starten Sie mit einer schnellen digitalen Ersteinschätzung. Danach sehen wir gemeinsam, ob sich ein Gutachten für Ihre Immobilie lohnt.
        </p>

        <div className="mt-8 flex justify-center">
          <a href="#ersteinschaetzung" className="cta-btn w-full max-w-sm gap-3 text-center text-sm font-semibold tracking-[0.06em] sm:w-auto">
            Zur Ersteinschätzung
            <ArrowRight size={18} />
          </a>
        </div>
      </motion.div>
    </section>
  );
}