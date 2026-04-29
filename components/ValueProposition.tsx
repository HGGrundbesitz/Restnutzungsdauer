'use client';

import {BadgeCheck, Banknote, CheckCircle, Image as ImageIcon, Laptop, Ruler, Stamp, Upload} from 'lucide-react';
import {motion} from 'motion/react';

export default function ValueProposition() {
  return (
    <section id="vorteile" className="section-shell pb-28 pt-20 md:pb-32 md:pt-24">
      <motion.div
        initial={{opacity: 0, y: 20}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true, margin: '-100px'}}
        transition={{duration: 0.8}}
        className="mb-16 text-center"
      >
        <div className="section-eyebrow mb-6">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          Ihr Vorteil
        </div>
        <h2 className="section-title mb-4 !text-[clamp(2.4rem,5vw,4.5rem)]">
          Warum sich der Prozess für Eigentümer wirklich lohnt
        </h2>
        <p className="section-copy mx-auto max-w-3xl">
          Mehr als nur ein schönes PDF: Das Gutachten soll wirtschaftlich Sinn ergeben, nachvollziehbar aufbereitet sein
          und sich für Sie im Alltag nicht nach Zusatzstress anfühlen.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-2 md:min-h-[800px] md:gap-8">
        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: '-100px'}}
          transition={{duration: 0.8}}
          whileHover={{y: -5}}
          className="glass-panel group flex flex-col justify-between rounded-[2rem] p-7 transition-all duration-1000 sm:p-10 md:col-span-2"
        >
          <div>
            <div className="theme-panel-muted flex h-12 w-12 items-center justify-center rounded-full shadow-sm">
              <Banknote size={24} className="text-[var(--color-ink)]" />
            </div>
            <div className="mt-4">
              <h3 className="mb-3 font-heading text-3xl font-medium tracking-tight text-[var(--color-primary)]">
                Deutliche steuerliche Vorteile
              </h3>
              <p className="text-lg leading-relaxed text-[var(--color-text-muted)]">
                Statt bei der pauschalen Abschreibung zu bleiben, lässt sich mit einem guten Gutachten häufig ein
                deutlich realitätsnäherer Satz begruenden. Das wirkt direkt auf Steuerlast und Cashflow.
              </p>
            </div>
          </div>

          <div className="mt-10 flex h-auto flex-col gap-6 md:h-44 md:flex-row">
            <motion.div
              whileHover={{y: -5, scale: 1.02}}
              className="theme-panel-strong relative flex min-h-[160px] flex-1 flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-sm transition-all duration-300"
            >
              <div className="absolute inset-0 bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />
              <div className="relative z-10 mb-4 flex w-full items-center justify-between">
                <div className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
                  Ihre AfA Entwicklung
                </div>
              </div>
              <div className="relative z-10 flex h-full w-full items-end gap-4 pt-4">
                <div className="flex h-[30%] w-1/2 justify-center rounded-t-lg bg-[var(--color-surface-muted)] pt-2 text-[10px] font-medium text-[var(--color-text-muted)] transition-all duration-500 group-hover:h-[25%]">
                  Pauschal
                </div>
                <div className="theme-contrast-panel relative flex h-[80%] w-1/2 justify-center rounded-t-lg pt-2 text-[10px] font-medium shadow-[0_-5px_15px_rgba(9,9,11,0.1)] transition-all duration-500 group-hover:h-[95%]">
                  Mit Gutachten
                  <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 animate-pulse rounded-full border border-[var(--color-contrast-ink)] bg-[var(--color-contrast-surface)] shadow-[0_0_10px_rgba(9,9,11,0.3)]" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{y: -5, scale: 1.02}}
              className="flex w-full flex-col justify-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 shadow-sm transition-all duration-300 md:w-1/3"
            >
              <div className="mb-1 text-xs font-medium uppercase tracking-widest text-emerald-600">
                Cashflow Effekt
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-medium tracking-tight text-[var(--color-ink)]">
                  mehr Liquiditaet
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-500/20">
                <motion.div
                  initial={{width: '0%'}}
                  whileInView={{width: '85%'}}
                  transition={{duration: 1.5, delay: 0.5}}
                  className="h-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: '-100px'}}
          transition={{duration: 0.8, delay: 0.1}}
          whileHover={{y: -5}}
          className="glass-panel group flex flex-col justify-between rounded-[2rem] p-7 transition-all duration-1000 sm:p-10"
        >
          <div>
            <div className="theme-panel-muted flex h-12 w-12 items-center justify-center rounded-full shadow-sm">
              <BadgeCheck size={24} className="text-[var(--color-ink)]" />
            </div>
            <div className="mt-4">
              <h3 className="mb-3 font-heading text-2xl font-medium tracking-tight text-[var(--color-primary)]">
                Professionelle Bearbeitung
              </h3>
              <p className="text-base leading-relaxed text-[var(--color-text-muted)]">
                Unsere Gutachten werden nachvollziehbar, seriös und finanzamtsnah erstellt. Nicht laut, sondern sauber.
              </p>
            </div>
          </div>

          <div
            className="relative mt-10 flex h-44 w-full items-end justify-center perspective-[1000px]"
            style={{
              maskImage: 'linear-gradient(180deg, transparent, black 40%, black 100%, transparent)',
              WebkitMaskImage: 'linear-gradient(180deg, transparent, black 40%, black 100%, transparent)',
            }}
          >
            <div className="theme-panel absolute bottom-16 h-24 w-[85%] rounded-xl shadow-sm transition-all duration-700 ease-out group-hover:-translate-y-6 group-hover:scale-95" />
            <div className="theme-panel absolute bottom-8 h-24 w-[92%] rounded-xl shadow-sm transition-all duration-700 ease-out group-hover:-translate-y-3 group-hover:scale-[0.98]" />
            <div className="theme-panel-strong absolute bottom-0 flex h-24 w-full items-center gap-5 rounded-xl px-6 shadow-[0_10px_30px_rgba(9,9,11,0.08)]">
              <div className="theme-contrast-panel flex h-12 w-12 items-center justify-center rounded-xl shadow-inner">
                <Stamp size={24} />
              </div>
              <div className="flex-1 space-y-3">
                <div className="relative h-2.5 w-2/3 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                </div>
                <div className="h-2 w-1/3 rounded-full bg-[var(--color-surface-muted)]" />
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle size={14} className="text-emerald-500" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: '-100px'}}
          transition={{duration: 0.8, delay: 0.2}}
          whileHover={{y: -5}}
          className="glass-panel group flex flex-col justify-between rounded-[2rem] p-7 transition-all duration-1000 sm:p-10"
        >
          <div>
            <div className="theme-panel-muted flex h-12 w-12 items-center justify-center rounded-full shadow-sm">
              <Laptop size={24} className="text-[var(--color-ink)]" />
            </div>
            <div className="mt-4">
              <h3 className="mb-3 font-heading text-2xl font-medium tracking-tight text-[var(--color-primary)]">
                Einfach und digital
              </h3>
              <p className="text-base leading-relaxed text-[var(--color-text-muted)]">
                Kein unnötiger Papierkram. Ein ruhiger, strukturierter Ablauf vom Upload bis zur Auslieferung.
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-3">
            <div className="theme-panel-strong flex items-center justify-between rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="theme-panel-muted flex h-7 w-7 items-center justify-center rounded-lg">
                  <Upload size={16} className="text-[var(--color-ink)]" />
                </div>
                <div className="text-xs font-medium text-[var(--color-ink)]">Grundbuchauszug.pdf</div>
              </div>
              <CheckCircle size={16} className="text-[var(--color-text-muted)]" />
            </div>
            <div className="theme-panel flex items-center justify-between rounded-xl p-4">
              <div className="flex items-center gap-3.5">
                <div className="theme-panel-muted flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)]">
                  <ImageIcon size={16} />
                </div>
                <div className="text-xs font-medium text-[var(--color-text-muted)]">Objektfotos.zip</div>
              </div>
              <CheckCircle size={16} className="text-[var(--color-text-muted)]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: '-100px'}}
          transition={{duration: 0.8, delay: 0.3}}
          whileHover={{y: -5}}
          className="glass-panel group flex flex-col justify-between gap-6 rounded-[2rem] p-7 transition-all duration-1000 sm:p-10 md:col-span-2"
        >
          <div>
            <div className="theme-panel-muted flex h-12 w-12 items-center justify-center rounded-full shadow-sm">
              <Ruler size={24} className="text-[var(--color-ink)]" />
            </div>

            <h3 className="mb-2 mt-4 font-heading text-2xl font-medium tracking-tight text-[var(--color-ink)]">
              Realistischer Abschreibungszeitraum
            </h3>
            <p className="max-w-lg text-base leading-relaxed text-[var(--color-text-muted)]">
              Statt pauschal von 50 Jahren auszugehen, wird der tatsächliche Zustand des Objekts sauber hergeleitet.
            </p>
          </div>

          <div className="mt-4 flex h-auto flex-col gap-5 md:h-48 md:flex-row">
            <div className="theme-panel-strong flex min-h-[160px] flex-[2] items-center justify-center overflow-hidden rounded-2xl shadow-sm">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-xs font-normal uppercase tracking-wider text-[var(--color-text-muted)]">
                  Neue Nutzungsdauer
                </div>
                <div className="text-5xl font-medium tracking-tighter text-[var(--color-ink)]">
                  ~25<span className="text-xl font-light text-[var(--color-text-muted)]"> Jahre</span>
                </div>
              </div>
            </div>

            <div className="flex flex-[1] flex-col gap-4">
              <div className="theme-panel-strong flex flex-1 flex-col justify-center rounded-xl p-5 shadow-sm">
                <div className="mb-1 text-xs font-normal uppercase tracking-wider text-[var(--color-text-muted)]">
                  Ihr Aufwand
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-medium tracking-tight text-[var(--color-ink)]">&lt; 10</span>
                  <span className="text-sm font-light text-[var(--color-text-muted)]">Min</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                  <div className="h-full w-[10%] rounded-full bg-[var(--color-contrast-surface)]" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

