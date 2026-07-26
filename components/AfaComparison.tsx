'use client';

import {useState} from 'react';
import {ArrowRight, Building2, CalendarRange, FileCheck2, Scale} from 'lucide-react';
import {motion, useReducedMotion} from 'motion/react';
import {
  AFA_EXAMPLE_LABEL,
  AFA_SCENARIOS,
  formatEuro,
  formatPercent,
} from '@/lib/content/afa-example';

export default function AfaComparison() {
  const [activeId, setActiveId] = useState<(typeof AFA_SCENARIOS)[number]['id']>('shorter');
  const reduceMotion = useReducedMotion();
  const active = AFA_SCENARIOS.find((scenario) => scenario.id === activeId) ?? AFA_SCENARIOS[0];
  const maxAnnualAmount = Math.max(...AFA_SCENARIOS.map((scenario) => scenario.annualAmount));

  return (
    <section
      id="afa-vergleich"
      aria-labelledby="afa-vergleich-title"
      className="relative overflow-hidden border-y border-[var(--color-border)] bg-[var(--color-bg-alt)] py-24 md:py-32"
    >
      <div className="section-shell relative">
        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div
            initial={{opacity: 0, y: reduceMotion ? 0 : 22}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, margin: '-100px'}}
            transition={{duration: reduceMotion ? 0 : 0.65}}
          >
            <div className="section-eyebrow">
              <Scale size={13} className="text-[var(--color-accent)]" />
              AfA verständlich erklärt
            </div>
            <h2
              id="afa-vergleich-title"
              className="editorial-title mt-6 max-w-3xl text-4xl leading-[1.02] text-[var(--color-ink)] sm:text-5xl lg:text-6xl"
            >
              Was eine kürzere Restnutzungsdauer bei der AfA verändern kann
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-text-muted)] sm:text-lg">
              Bleibt der abschreibungsfähige Gebäudewert gleich, kann ein kürzerer
              nachgewiesener Zeitraum den rechnerischen Abschreibungsbetrag pro Jahr
              erhöhen. Ob und in welcher Höhe das im Einzelfall gilt, muss fachlich
              und steuerlich geprüft werden.
            </p>

            <div
              className="mt-9 grid grid-cols-2 gap-2 rounded-[1.25rem] border border-[var(--color-border)] bg-white p-2"
              aria-label="Beispielszenario auswählen"
            >
              {AFA_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  aria-pressed={activeId === scenario.id}
                  onClick={() => setActiveId(scenario.id)}
                  className={`premium-focus min-h-14 rounded-[0.95rem] px-3 py-3 text-sm font-semibold transition ${
                    activeId === scenario.id
                      ? 'bg-[var(--color-ink)] text-white shadow-sm'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  {scenario.shortLabel}
                </button>
              ))}
            </div>

            <div
              role="img"
              aria-label={`Vergleich der jährlichen Abschreibung: ${AFA_SCENARIOS[0].label} ${formatEuro(AFA_SCENARIOS[0].annualAmount)}, ${AFA_SCENARIOS[1].label} ${formatEuro(AFA_SCENARIOS[1].annualAmount)}.`}
              className="mt-8 rounded-[1.7rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.28)] sm:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    Jährlicher Abschreibungsbetrag
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">{AFA_EXAMPLE_LABEL}</p>
                </div>
                <Building2 size={25} className="text-[var(--color-accent)]" />
              </div>
              <div className="mt-10 grid h-64 grid-cols-2 items-end gap-5 border-b border-[var(--color-border-strong)] px-2 sm:gap-10 sm:px-8">
                {AFA_SCENARIOS.map((scenario) => {
                  const height = Math.round((scenario.annualAmount / maxAnnualAmount) * 100);
                  const isActive = scenario.id === activeId;
                  return (
                    <div key={scenario.id} className="flex h-full flex-col justify-end text-center">
                      <motion.div
                        animate={{height: `${height}%`, opacity: isActive ? 1 : 0.42}}
                        transition={{duration: reduceMotion ? 0 : 0.48, ease: [0.16, 1, 0.3, 1]}}
                        className={`relative mx-auto flex w-full max-w-32 items-start justify-center rounded-t-[1.2rem] px-2 pt-4 ${
                          scenario.id === 'shorter'
                            ? 'bg-[var(--color-accent)] text-white'
                            : 'bg-[#dce5f1] text-[var(--color-ink)]'
                        }`}
                      >
                        <span className="text-sm font-bold sm:text-base">{formatEuro(scenario.annualAmount)}</span>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center text-xs font-semibold leading-5 text-[var(--color-text-muted)] sm:text-sm">
                {AFA_SCENARIOS.map((scenario) => <span key={scenario.id}>{scenario.shortLabel}</span>)}
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{opacity: 0, y: reduceMotion ? 0 : 22}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, margin: '-100px'}}
            transition={{duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : 0.08}}
            className="lg:sticky lg:top-28"
          >
            <div className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-white shadow-[0_36px_90px_-52px_rgba(15,23,42,0.28)]">
              <div className="border-b border-[var(--color-border)] px-6 py-6 sm:px-8">
                <p className="text-xs font-extrabold uppercase tracking-[0.19em] text-[var(--color-accent)]">
                  {AFA_EXAMPLE_LABEL}
                </p>
                <h3 className="mt-3 font-heading text-2xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
                  {active.label}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">{active.explanation}</p>
              </div>
              <dl className="divide-y divide-[var(--color-border)] px-6 sm:px-8">
                <ComparisonRow icon={Building2} label="Gebäudewert" value={formatEuro(active.buildingValue)} />
                <ComparisonRow icon={CalendarRange} label="Angenommene Nutzungsdauer" value={`${active.usefulLifeYears} Jahre`} />
                <ComparisonRow icon={Scale} label="Jährlicher AfA-Satz" value={formatPercent(active.annualRate)} />
                <ComparisonRow icon={FileCheck2} label="Jährlicher Abschreibungsbetrag" value={formatEuro(active.annualAmount)} emphasized />
              </dl>
              <div className="bg-[var(--color-surface-muted)] px-6 py-6 sm:px-8">
                <p className="text-xs leading-6 text-[var(--color-text-muted)]">
                  Hinweis: Die tatsächliche steuerliche Wirkung hängt unter anderem
                  von Objekt, Kaufpreisaufteilung, persönlicher Steuersituation und
                  der Prüfung durch die zuständigen Finanzbehörden ab. Das Beispiel
                  ist keine Steuerberatung und keine Anerkennungszusage.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="#ersteinschaetzung" className="cta-btn gap-3 px-6 py-4 text-center text-sm">
                Kostenlose Ersteinschätzung starten
                <ArrowRight size={17} />
              </a>
              <a href="#prozess" className="rnd-secondary-btn px-6 py-4 text-center">
                So funktioniert das Gutachten
              </a>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

function ComparisonRow({
  icon: Icon,
  label,
  value,
  emphasized = false,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <Icon size={18} />
      </span>
      <dt className="text-sm font-medium leading-6 text-[var(--color-text-muted)]">{label}</dt>
      <dd className={`text-right font-semibold ${emphasized ? 'text-xl text-[var(--color-accent)]' : 'text-[var(--color-ink)]'}`}>
        {value}
      </dd>
    </div>
  );
}
