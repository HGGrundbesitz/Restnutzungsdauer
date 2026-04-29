import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {motion, useMotionValue, useSpring} from 'motion/react';

const metrics = [
  {value: '48h', label: 'erstes Feedback'},
  {value: '100%', label: 'digitaler Ablauf'},
  {value: 'klar', label: 'kommuniziertes Pricing'},
];

const trustNotes = [
  'Finanzamtsnahe Argumentation',
  'Verschlüsselter Upload',
  'Persönliche Rückmeldung statt Ticketsystem',
];

const checklist = [
  {icon: Clock3, label: 'Unterlagen geordnet', tone: '92%'},
  {icon: ShieldCheck, label: 'Argumentation vorbereitet', tone: '88%'},
  {icon: CheckCircle2, label: 'Auslieferung digital', tone: '100%'},
];

export default function Hero() {
  const cardOffsetX = useMotionValue(0);
  const cardOffsetY = useMotionValue(0);
  const smoothCardX = useSpring(cardOffsetX, {stiffness: 130, damping: 18, mass: 0.45});
  const smoothCardY = useSpring(cardOffsetY, {stiffness: 130, damping: 18, mass: 0.45});

  const handleCardMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;

    cardOffsetX.set(relativeX * 16);
    cardOffsetY.set(relativeY * 14);
  };

  const resetCardMove = () => {
    cardOffsetX.set(0);
    cardOffsetY.set(0);
  };

  return (
    <section className="relative flex w-full items-start justify-center overflow-hidden px-6 pb-[4.5rem] pt-[5.5rem] sm:px-8 sm:pt-24 md:pb-20 md:pt-28 xl:px-12 xl:pt-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,var(--color-accent-soft),transparent_58%)] opacity-80" />
      <div className="pointer-events-none absolute right-[6%] top-24 h-64 w-64 rounded-full bg-[var(--color-accent-soft)] blur-[110px] opacity-70" />

      <div className="relative z-10 grid w-full max-w-[1360px] items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(430px,520px)] xl:gap-12">
        <motion.div
          initial={{opacity: 0, y: 28}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.9, ease: [0.16, 1, 0.3, 1]}}
          className="relative flex flex-col items-start"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-14 top-10 h-52 w-52 rounded-full bg-[var(--color-accent-soft)] blur-[70px] opacity-90"
          />

          <div className="relative flex w-full flex-col items-start">
            <div className="section-eyebrow mb-7">
              <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_0_6px_var(--color-accent-soft)]" />
              Digitale Premium-Prüfung für Immobilien
            </div>

            <h1 className="display-title max-w-[10.9ch] !text-[clamp(2.7rem,5.8vw,4.95rem)]">
              Mehr Ruhe im Prozess.
              <br />
              Mehr Hebel in der
              <br />
              <span className="text-[var(--color-accent)]">Abschreibung.</span>
            </h1>

            <p className="mt-5 max-w-[39rem] text-[clamp(0.98rem,1.2vw,1.08rem)] font-medium leading-[1.78] text-[var(--color-text-muted)]">
              Wir gestalten Restnutzungsdauer-Gutachten wie einen klaren digitalen Mandatsprozess:
              diskret, schnell, nachvollziehbar und so gestaltet, dass Eigentümer nicht noch einen zweiten Vollzeitjob daraus machen muessen.
            </p>

            <div className="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
              <a href="#schnellcheck" className="cta-btn w-full text-center text-sm font-semibold tracking-[0.08em] sm:w-auto">
                Jetzt Gutachten anfragen
              </a>
              <a
                href="#ablauf"
                className="theme-panel inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[var(--color-ink)] shadow-[0_14px_32px_-24px_rgba(17,23,35,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-surface-strong)] sm:w-auto"
              >
                Prozess ansehen
                <ArrowRight size={16} className="text-[var(--color-accent)]" />
              </a>
            </div>

            <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{opacity: 0, y: 14}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.14 + index * 0.08}}
                  className="metric-card"
                >
                  <div className="text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">{metric.value}</div>
                  <div className="mt-2 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{metric.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 text-sm font-semibold text-[var(--color-text-muted)]">
              {trustNotes.map((note, index) => (
                <motion.div
                  key={note}
                  initial={{opacity: 0, x: -10}}
                  animate={{opacity: 1, x: 0}}
                  transition={{delay: 0.28 + index * 0.08}}
                  className="flex items-center gap-3"
                >
                  <span className="theme-panel flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-accent)] shadow-[0_12px_26px_-18px_rgba(17,23,35,0.28)]">
                    <CheckCircle2 size={16} />
                  </span>
                  {note}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{opacity: 0, y: 24, scale: 0.98}}
          animate={{opacity: 1, y: 0, scale: 1}}
          transition={{duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.08}}
          onPointerMove={handleCardMove}
          onPointerLeave={resetCardMove}
          style={{x: smoothCardX, y: smoothCardY}}
          className="relative mx-auto w-full max-w-[520px] xl:ml-auto"
        >
          <div className="theme-panel-strong rounded-[2rem] p-3.5 shadow-[var(--shadow-lift)] sm:p-4">
            <div className="theme-panel rounded-[1.7rem] p-4 sm:p-[1.125rem]">
              <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                    Analyse cockpit
                  </div>
                  <h2 className="mt-2 font-heading text-[clamp(1.72rem,3.45vw,2.75rem)] leading-[0.94] text-[var(--color-ink)]">
                    Restnutzungsdauer
                    <br />
                    im Blick
                  </h2>
                </div>
                <span className="theme-panel w-fit rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  live workflow
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
                <div className="theme-contrast-panel rounded-[1.45rem] p-[1.125rem] shadow-[0_24px_46px_-30px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--color-contrast-ink)]/60">
                      Neuer Satz
                    </div>
                    <BarChart3 size={18} className="text-[var(--color-contrast-ink)]/70" />
                  </div>
                  <div className="mt-4 text-[3.35rem] font-extrabold tracking-tight">3,8%</div>
                  <p className="mt-3 max-w-[15rem] text-[0.96rem] leading-6 text-[var(--color-contrast-ink)]/72">
                    plausibel hergeleitet und vorbereitet für eine saubere steuerliche Einordnung.
                  </p>
                  <div className="mt-6 flex items-center gap-3 rounded-[1.2rem] bg-[var(--color-contrast-ink)]/10 px-3 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-contrast-ink)]/12">
                      <Sparkles size={16} />
                    </div>
                    <div className="text-sm font-semibold text-[var(--color-contrast-ink)]/85">
                      digitale Bearbeitung ohne Medienbruch
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="theme-panel rounded-[1.35rem] p-3.5 shadow-[0_18px_38px_-32px_rgba(17,23,35,0.28)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                        Ersparnis-Szenario
                      </span>
                      <TrendingUp size={16} className="text-[var(--color-accent)]" />
                    </div>
                    <div className="mt-4 flex items-end gap-[6px]">
                      <div className="h-10 flex-1 rounded-t-[8px] bg-[var(--color-accent-soft)]" />
                      <div className="h-14 flex-1 rounded-t-[8px] bg-[var(--color-accent-soft)]" />
                      <div className="h-20 flex-1 rounded-t-[8px] bg-[var(--color-accent-soft)]" />
                      <div className="h-28 flex-1 rounded-t-[8px] bg-[var(--color-accent)]" />
                      <div className="h-16 flex-1 rounded-t-[8px] bg-[var(--color-accent-soft)]" />
                    </div>
                  </div>

                  <div className="theme-panel rounded-[1.35rem] p-3.5 shadow-[0_18px_38px_-32px_rgba(17,23,35,0.28)]">
                    <div className="flex items-center gap-3">
                      <span className="theme-panel flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--color-accent)]">
                        <FileText size={18} />
                      </span>
                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                          Dokumenten-Check
                        </div>
                        <div className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                          Grundbuch, Fotos, Baujahr, Zustand
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {checklist.map((item) => (
                        <div key={item.label} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                          <span className="theme-panel flex h-8 w-8 items-center justify-center rounded-xl text-[var(--color-accent)]">
                            <item.icon size={15} />
                          </span>
                          <span className="text-sm font-semibold text-[var(--color-text-muted)]">{item.label}</span>
                          <span className="text-sm font-extrabold text-[var(--color-ink)]">{item.tone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


