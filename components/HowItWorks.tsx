'use client';

import {Banknote, FilePlus, PenSquare, ZoomIn} from 'lucide-react';
import {motion, useScroll, useTransform} from 'motion/react';
import {useRef} from 'react';

const steps = [
  {
    step: 'Schritt 01',
    title: 'Anfrage stellen',
    copy: 'Übermitteln Sie uns die Basisdaten Ihrer Immobilie – schnell und unkompliziert.',
    icon: PenSquare,
    align: 'right',
  },
  {
    step: 'Schritt 02',
    title: 'Unterlagen hochladen',
    copy: 'Laden Sie relevante Dokumente wie Grundbuchauszug, Fotos oder Angaben zu Modernisierungen bequem und vertraulich hoch.',
    icon: FilePlus,
    align: 'left',
  },
  {
    step: 'Schritt 03',
    title: 'Prüfung und Erstellung',
    copy: 'Unsere Gutachter prüfen die Unterlagen sorgfältig und leiten die tatsächliche Restnutzungsdauer nachvollziehbar her.',
    icon: ZoomIn,
    align: 'right',
  },
  {
    step: 'Schritt 04',
    title: 'Ihr Gutachten ist fertig',
    copy: 'Sie erhalten Ihr fertiges Gutachten und sparen damit bares Geld!',
    icon: Banknote,
    align: 'left',
  },
] as const;

export default function HowItWorks() {
  const containerRef = useRef<HTMLElement>(null);
  const {scrollYProgress} = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="prozess" ref={containerRef} className="relative overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-bg)] py-24 md:py-40">
      <motion.div
        initial={{opacity: 0, y: 20, filter: 'blur(6px)'}}
        whileInView={{opacity: 1, y: 0, filter: 'blur(0px)'}}
        viewport={{once: true, margin: '-100px'}}
        transition={{duration: 0.9}}
        className="section-shell relative z-20 mb-16 text-center md:mb-24"
      >
        <div className="section-eyebrow">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
          Prozess
        </div>
        <h2 className="mt-6 font-heading text-4xl leading-[0.95] tracking-tight text-[var(--color-ink)] md:text-5xl">
          So einfach funktioniert es
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-text-muted)] md:text-xl">
          Von der Anfrage bis zum fertigen Gutachten – vollständig digital
        </p>
      </motion.div>

      <div
        className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-[var(--color-border)] md:block"
        style={{
          maskImage: 'linear-gradient(180deg, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent, black 15%, black 85%, transparent)',
        }}
      />

      <motion.div
        style={{
          scaleY,
          maskImage: 'linear-gradient(180deg, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent, black 15%, black 85%, transparent)',
        }}
        className="absolute bottom-0 left-1/2 top-0 z-10 hidden w-px origin-top -translate-x-1/2 bg-[var(--color-accent)] md:block"
      />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-surface)] opacity-70 blur-[100px]" />

      <div className="section-shell relative z-10 flex flex-col gap-16 md:gap-28">
        {steps.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{opacity: 0, y: 20, filter: 'blur(6px)'}}
            whileInView={{opacity: 1, y: 0, filter: 'blur(0px)'}}
            viewport={{once: true, margin: '-100px'}}
            transition={{duration: 0.9, delay: index * 0.12}}
            className="group relative grid grid-cols-1 items-start gap-8 md:grid-cols-2"
          >
            <div className="absolute left-1/2 top-[3.5rem] z-20 hidden -translate-x-1/2 items-center justify-center md:flex">
              <div className="absolute h-24 w-24 rounded-full border border-[var(--color-border)]" />
              <div className="theme-panel-strong animate-breathe flex h-14 w-14 items-center justify-center rounded-full shadow-[0_4px_12px_rgba(9,9,11,0.04)] transition-transform duration-500 group-hover:scale-105">
                <item.icon size={20} className="text-[var(--color-accent)]" />
              </div>
            </div>

            {item.align === 'right' ? (
              <>
                <div className="mt-8 md:mt-0 md:pr-24 md:text-right">
                  <StepCard step={item.step} title={item.title} copy={item.copy} />
                </div>
                <div className="hidden md:block" />
              </>
            ) : (
              <>
                <div className="hidden md:block" />
                <div className="mt-8 md:mt-0 md:pl-24 md:text-left">
                  <StepCard step={item.step} title={item.title} copy={item.copy} />
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function StepCard({step, title, copy}: {step: string; title: string; copy: string}) {
  return (
    <div className="theme-panel-strong relative rounded-2xl p-8 shadow-skeuo transition-transform duration-500 group-hover:-translate-y-2 md:p-10">
      <div className="theme-panel absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full shadow-sm md:hidden">
        <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
      </div>
      <div className="mb-4 text-xs font-normal uppercase tracking-[0.25em] text-[var(--color-text-muted)]">{step}</div>
      <h3 className="mb-4 font-heading text-3xl font-medium tracking-tight text-[var(--color-ink)]">{title}</h3>
      <p className="text-lg leading-relaxed text-[var(--color-text-muted)]">{copy}</p>
    </div>
  );
}