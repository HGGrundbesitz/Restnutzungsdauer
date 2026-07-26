'use client';

import Image from 'next/image';
import {ArrowRight, CheckCircle2} from 'lucide-react';
import {motion, useReducedMotion} from 'motion/react';

export default function RequestForm({embedded = false}: {embedded?: boolean}) {
  const reduceMotion = useReducedMotion();

  return (
    <section id="anfrage" className={embedded ? 'relative z-10 h-full scroll-mt-32' : 'relative z-10 mx-auto max-w-[1180px] px-4 py-24 sm:px-6 md:py-32'}>
      {!embedded ? <div className="pointer-events-none absolute inset-x-[8%] top-16 -z-10 h-[360px] rounded-full bg-[var(--color-accent-soft)] opacity-70 blur-[120px]" /> : null}
      <motion.div initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: '-100px'}} transition={{duration: 0.8}} className="dark-architecture blueprint-lines relative flex h-full min-h-[36rem] flex-col justify-between overflow-hidden rounded-[2.2rem] border border-white/10 p-7 text-left shadow-[0_42px_100px_-52px_rgba(7,20,45,0.75)] sm:p-9 lg:p-10">
        <div aria-hidden="true" className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-[rgba(49,107,255,0.28)] blur-[70px]" />
        <div className="relative z-10">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-blue-200"><CheckCircle2 size={26} /></div>
          <h2 className="editorial-title max-w-lg text-4xl leading-[1.02] text-white md:text-5xl">Unverbindlich anfragen</h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/68 sm:text-lg">Starten Sie mit einer schnellen digitalen Ersteinschätzung. Danach lässt sich einordnen, ob ein Gutachten für Ihre Immobilie sinnvoll ist.</p>
          <a href="#ersteinschaetzung" className="premium-focus mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-[var(--color-accent)] px-7 py-4 text-sm font-semibold tracking-[0.04em] text-white shadow-[0_20px_45px_-20px_rgba(37,99,235,0.8)] transition duration-300 hover:-translate-y-1 hover:bg-[#3972f2]">
            Zur Ersteinschätzung
            <ArrowRight size={18} />
          </a>
        </div>

        <motion.div
          aria-hidden="true"
          animate={reduceMotion ? undefined : {y: [0, -6, 0], opacity: [0.92, 1, 0.92]}}
          transition={reduceMotion ? undefined : {duration: 7, repeat: Infinity, ease: 'easeInOut'}}
          className="relative z-10 mt-10 min-h-52 w-full overflow-hidden rounded-[1.7rem] border border-white/8 bg-[#0b1f3f] sm:min-h-64"
        >
          <Image
            src="/rnd/faq-answer-illustration.png"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover object-center"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
