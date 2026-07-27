'use client';

import {ArrowRight} from 'lucide-react';
import {motion, useReducedMotion} from 'motion/react';

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative min-h-screen min-h-[100svh] overflow-hidden bg-[#f5f8ff]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(37,99,235,0.09),transparent_56%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent to-white"
      />
      <motion.div
        className="relative z-10 mx-auto flex min-h-screen min-h-[100svh] w-full max-w-[1440px] items-center px-4 pb-20 pt-28 sm:px-6 md:px-8"
      >
        <div className="mx-auto flex min-w-0 w-full max-w-[72rem] flex-col items-center text-center">
          <h1 className="editorial-title w-full max-w-full text-[clamp(3rem,13vw,5.5rem)] leading-[0.89] text-[var(--color-ink)] sm:text-[clamp(3.8rem,9vw,6.5rem)] md:text-[clamp(4.8rem,5.8vw,7rem)]">
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span
                initial={{y: reduceMotion ? 0 : '105%'}}
                animate={{y: 0}}
                transition={{duration: reduceMotion ? 0 : 0.86, ease}}
                className="block"
              >
                Restnutzungsdauer-Gutachten
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.12em] text-[var(--color-accent)]">
              <motion.span
                initial={{y: reduceMotion ? 0 : '105%'}}
                animate={{y: 0}}
                transition={{duration: reduceMotion ? 0 : 0.86, delay: reduceMotion ? 0 : 0.09, ease}}
                className="block"
              >
                für eine höhere Gebäude-AfA
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{y: reduceMotion ? 0 : 14, opacity: reduceMotion ? 1 : 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: reduceMotion ? 0 : 0.68, delay: reduceMotion ? 0 : 0.22, ease}}
            className="mt-7 w-full max-w-[42rem] text-pretty text-lg font-medium leading-8 text-[#4f6078] sm:text-xl sm:leading-9"
          >
            Wir sind Ihr Sachverständiger für fundierte Gutachten im Bereich Immobilien.
          </motion.p>

          <motion.div
            initial={{y: reduceMotion ? 0 : 14, opacity: reduceMotion ? 1 : 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: reduceMotion ? 0 : 0.68, delay: reduceMotion ? 0 : 0.3, ease}}
            className="mt-7"
          >
            <a
              href="#ersteinschaetzung"
              className="premium-focus cta-btn min-h-14 gap-2.5 px-7 py-4 text-center text-[0.8rem] font-semibold tracking-[0.02em] sm:text-sm sm:whitespace-nowrap"
            >
              Kostenlose Ersteinschätzung starten
              <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
