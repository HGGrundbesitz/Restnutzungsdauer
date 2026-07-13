'use client';

import {ArrowRight, CheckCircle2} from 'lucide-react';
import {motion} from 'motion/react';

export default function RequestForm({embedded = false}: {embedded?: boolean}) {
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

        <div aria-hidden="true" className="relative z-10 mt-12 h-48 w-full">
          <div className="absolute bottom-0 right-1 h-36 w-[78%] rotate-[5deg] rounded-[1.8rem] border border-white/14 bg-[linear-gradient(145deg,rgba(55,112,255,0.72),rgba(255,255,255,0.08))] shadow-[0_28px_70px_-28px_rgba(0,0,0,0.62)]" />
          <div className="absolute bottom-3 right-[8%] h-40 w-[78%] rotate-[-3deg] rounded-[1.8rem] border border-white/18 bg-[linear-gradient(145deg,rgba(230,239,255,0.36),rgba(74,130,255,0.18))] backdrop-blur-xl before:absolute before:-top-7 before:left-8 before:h-9 before:w-28 before:rounded-t-2xl before:border before:border-b-0 before:border-white/18 before:bg-[rgba(104,149,255,0.34)]" />
          <div className="absolute bottom-8 right-[16%] flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-white/16 bg-white/10 text-blue-200 backdrop-blur-xl"><CheckCircle2 size={34} /></div>
        </div>
      </motion.div>
    </section>
  );
}
