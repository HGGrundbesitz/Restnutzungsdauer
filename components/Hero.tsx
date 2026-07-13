'use client';

import {useRef, useState} from 'react';
import Image from 'next/image';
import {ArrowRight} from 'lucide-react';
import {motion, useReducedMotion, useScroll, useTransform} from 'motion/react';

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const {scrollYProgress} = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], [0, 54]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.035]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -18]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen min-h-[100svh] overflow-hidden bg-white"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={reduceMotion ? undefined : {y: mediaY, scale: mediaScale}}
      >
        {reduceMotion || videoFailed ? (
          <Image
            src="/rnd/hero-building.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_bottom] sm:object-[64%_bottom] md:object-[center_bottom]"
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={() => setVideoReady(true)}
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
            className={`absolute inset-0 h-full w-full object-cover object-[72%_bottom] transition-opacity duration-1000 ease-out sm:object-[64%_bottom] md:object-[center_bottom] ${
              videoReady ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src="/rnd/hero-cinematic.mp4" type="video/mp4" />
          </video>
        )}

        {!reduceMotion && !videoFailed ? (
          <motion.div
            initial={false}
            animate={{opacity: videoReady ? 0 : 1}}
            transition={{duration: 0.72, ease}}
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(218,229,248,0.72),transparent_34%),linear-gradient(120deg,#ffffff_12%,#f1f5fb_54%,#dfe8f5_100%)]"
          >
            <motion.div
              animate={{x: ['-35%', '135%']}}
              transition={{duration: 1.8, ease: 'easeInOut', repeat: Infinity}}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-2xl"
            />
          </motion.div>
        ) : null}
      </motion.div>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.94)_48%,rgba(255,255,255,0.58)_72%,rgba(255,255,255,0.16)_100%)] md:bg-[linear-gradient(90deg,rgba(255,255,255,0.99)_0%,rgba(255,255,255,0.96)_31%,rgba(255,255,255,0.78)_48%,rgba(255,255,255,0.22)_70%,rgba(255,255,255,0.06)_100%)]"
      />
      <div
        aria-hidden="true"
        className="architectural-grid absolute inset-0 opacity-30 [mask-image:linear-gradient(90deg,black,transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent via-white/30 to-white"
      />

      <motion.div
        className="relative z-10 mx-auto flex min-h-screen min-h-[100svh] w-full max-w-[1440px] items-start px-4 pb-24 pt-32 sm:px-6 sm:pt-36 md:items-center md:px-8 md:pb-20 md:pt-28"
        style={reduceMotion ? undefined : {y: contentY}}
      >
        <div className="flex min-w-0 w-full max-w-[42rem] flex-col items-start">
          <h1 className="editorial-title w-full max-w-full text-[clamp(2.75rem,13vw,5.15rem)] leading-[0.89] text-[var(--color-ink)] sm:text-[clamp(3.15rem,8vw,5.15rem)] md:text-[clamp(3.15rem,4.35vw,5.15rem)]">
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
            initial={{y: reduceMotion ? 0 : 14}}
            animate={{y: 0}}
            transition={{duration: reduceMotion ? 0 : 0.68, delay: reduceMotion ? 0 : 0.22, ease}}
            className="mt-6 w-full max-w-[35rem] text-pretty text-base font-medium leading-7 text-[#4f6078] sm:text-lg sm:leading-8"
          >
            Wir sind Ihr Sachverständiger für fundierte Gutachten im Bereich Immobilien.
          </motion.p>

          <motion.div
            initial={{y: reduceMotion ? 0 : 14}}
            animate={{y: 0}}
            transition={{duration: reduceMotion ? 0 : 0.68, delay: reduceMotion ? 0 : 0.3, ease}}
            className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center"
          >
            <a
              href="#ersteinschaetzung"
              className="premium-focus cta-btn min-h-12 w-full gap-2 px-5 py-3 text-center text-[0.73rem] font-semibold tracking-[0.02em] sm:w-auto sm:whitespace-nowrap"
            >
              Kostenlose Ersteinschätzung starten
              <ArrowRight size={16} />
            </a>
            <a
              href="#rechtsgrundlage"
              className="premium-focus inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[rgba(15,23,42,0.1)] bg-white/88 px-5 py-3 text-center text-[0.73rem] font-semibold text-[var(--color-ink)] shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white sm:w-auto sm:whitespace-nowrap"
            >
              Anerkennungsvoraussetzungen ansehen
              <ArrowRight size={16} className="text-[var(--color-accent)]" />
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
