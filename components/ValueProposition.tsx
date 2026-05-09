'use client';

import {BadgeCheck, Banknote, CheckCircle, Stamp} from 'lucide-react';
import {motion} from 'motion/react';

export default function ValueProposition() {
  return (
    <section id="vorteile" className="section-shell pb-28 pt-16 md:pb-32 md:pt-20">
      <motion.div
        initial={{opacity: 0, y: 20}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true, margin: '-100px'}}
        transition={{duration: 0.8}}
        className="mb-14 text-center"
      >
        <div className="section-eyebrow mb-6">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          Ihr Vorteil
        </div>
        <h2 className="section-title mx-auto mb-4 max-w-5xl !text-[clamp(2.4rem,5vw,4.5rem)]">
          Klarer Prozess, saubere Argumentation
        </h2>
        <p className="section-copy mx-auto max-w-3xl">
          Das Gutachten soll wirtschaftlich Sinn ergeben, nachvollziehbar aufbereitet sein und sich für Sie im Alltag nicht nach Zusatzstress anfühlen.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <motion.article
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: '-100px'}}
          transition={{duration: 0.8}}
          className="glass-panel group rounded-[2rem] p-7 transition-all duration-700 sm:p-10"
        >
          <div className="theme-panel-muted flex h-12 w-12 items-center justify-center rounded-full shadow-sm">
            <Banknote size={24} className="text-[var(--color-ink)]" />
          </div>
          <h3 className="mt-5 font-heading text-3xl font-medium tracking-tight text-[var(--color-primary)]">
            Mehr Klarheit für die Abschreibung
          </h3>
          <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-muted)]">
            Statt bei einer pauschalen Betrachtung stehenzubleiben, wird der Zustand der Immobilie fachlich eingeordnet und verständlich dokumentiert.
          </p>

          <div className="mt-9 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Einordnung</span>
              <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-accent)]">nachvollziehbar</span>
            </div>
            <div className="flex h-32 items-end gap-4">
              <div className="flex h-[38%] flex-1 items-start justify-center rounded-t-xl bg-[var(--color-surface-muted)] pt-3 text-xs font-semibold text-[var(--color-text-muted)] transition-all duration-500 group-hover:h-[32%]">
                Standard
              </div>
              <div className="theme-contrast-panel flex h-[78%] flex-1 items-start justify-center rounded-t-xl pt-3 text-xs font-semibold transition-all duration-500 group-hover:h-[90%]">
                Gutachten
              </div>
            </div>
          </div>
        </motion.article>

        <motion.article
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: '-100px'}}
          transition={{duration: 0.8, delay: 0.1}}
          className="glass-panel group rounded-[2rem] p-7 transition-all duration-700 sm:p-10"
        >
          <div className="theme-panel-muted flex h-12 w-12 items-center justify-center rounded-full shadow-sm">
            <BadgeCheck size={24} className="text-[var(--color-ink)]" />
          </div>
          <h3 className="mt-5 font-heading text-3xl font-medium tracking-tight text-[var(--color-primary)]">
            Professionelle Bearbeitung
          </h3>
          <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-muted)]">
            Ihre Anfrage wird ruhig, seriös und finanzamtsnah vorbereitet. Nicht laut, sondern sauber und nachvollziehbar.
          </p>

          <div className="relative mt-9 flex h-44 w-full items-end justify-center overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5 shadow-sm">
            <div className="absolute bottom-20 h-20 w-[82%] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-700 group-hover:-translate-y-3" />
            <div className="absolute bottom-12 h-20 w-[90%] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-700 group-hover:-translate-y-2" />
            <div className="relative z-10 flex h-24 w-full items-center gap-5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface-strong)] px-6 shadow-sm">
              <div className="theme-contrast-panel flex h-12 w-12 items-center justify-center rounded-xl shadow-inner">
                <Stamp size={24} />
              </div>
              <div className="flex-1 space-y-3">
                <div className="h-2.5 w-2/3 rounded-full bg-[var(--color-surface-muted)]" />
                <div className="h-2 w-1/3 rounded-full bg-[var(--color-surface-muted)]" />
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle size={15} className="text-emerald-500" />
              </div>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
