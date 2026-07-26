'use client';

import {useState, type ReactNode} from 'react';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  FileText,
  FolderCheck,
  Layers3,
  ShieldCheck,
  UploadCloud,
  type LucideIcon,
} from 'lucide-react';
import {motion, useReducedMotion} from 'motion/react';

const additionalDocuments = [
  'Energieausweis',
  'Grundbuchauszug oder Baulasteninformationen',
  'Teilungserklärung bei Eigentumswohnungen',
  'bisheriger Steuerbescheid, AfA-Satz oder Restbuchwert',
  'Denkmalschutz- oder Nutzungsbeschränkungen, falls vorhanden',
  'Außenansichten des Gebäudes',
  'Dach, Dachboden oder Dämmung',
  'Keller, Heizungsanlage und Leitungen',
  'Fenster, Türen und Innenräume',
  'sichtbare Schäden wie Risse, Feuchtigkeit oder veraltete Technik',
];

const dossierSteps = [
  {
    icon: FolderCheck,
    title: 'Basisdaten',
    status: 'Startklar',
    description: 'Gebäudeart, Baujahr und Modernisierungen strukturiert erfassen.',
  },
  {
    icon: Camera,
    title: 'Objektfotos',
    status: 'Hilfreich',
    description: 'Fotos helfen, Zustand und Maßnahmen besser einzuordnen.',
  },
  {
    icon: UploadCloud,
    title: 'Später ergänzen',
    status: 'Optional',
    description: 'Unterlagen können jederzeit sicher nachgereicht werden.',
  },
] as const;

export default function RequiredDocuments() {
  const [showDetails, setShowDetails] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <section id="unterlagen" className="section-shell relative scroll-mt-32 py-6 md:py-10">
      <div
        aria-hidden="true"
        className="absolute -left-32 top-20 -z-10 h-80 w-80 rounded-full bg-[rgba(87,139,255,0.09)] blur-[110px]"
      />

      <div className="architectural-card relative grid items-center gap-10 overflow-hidden rounded-[2.35rem] p-6 sm:p-8 lg:grid-cols-12 lg:p-10 xl:gap-14 xl:p-12">
        <div
          aria-hidden="true"
          className="architectural-grid absolute inset-0 opacity-30 [mask-image:linear-gradient(90deg,transparent,black_62%,black)]"
        />

        <motion.div
          initial={reduceMotion ? false : {opacity: 0, y: 16}}
          whileInView={reduceMotion ? undefined : {opacity: 1, y: 0}}
          viewport={{once: true, margin: '-80px'}}
          transition={{duration: 0.58}}
          className="relative z-10 lg:col-span-5"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            <Layers3 size={14} className="text-[var(--color-accent)]" />
            Digitales Dossier
          </p>
          <h2 className="editorial-title max-w-lg text-[2.55rem] leading-[0.98] text-[var(--color-ink)] sm:text-5xl lg:text-[3.45rem]">
            Keine Textwand. Nur ein sauberer erster Check.
          </h2>

          <p className="mt-5 max-w-md text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
            Sie starten mit den wichtigsten Angaben. Fotos und weitere Unterlagen helfen bei der Einordnung, bleiben
            für die erste Berechnung aber freiwillig.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a href="#ersteinschaetzung" className="cta-btn px-6 py-3.5 text-sm">
              Ersteinschätzung starten
              <ArrowRight size={17} className="ml-2" />
            </a>
            <button
              type="button"
              aria-expanded={showDetails}
              aria-controls="unterlagen-details"
              onClick={() => setShowDetails((current) => !current)}
              className="premium-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white/84 px-6 py-3.5 text-sm font-bold text-[var(--color-ink)] shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:bg-white"
            >
              Mehr Infos
              <ChevronDown
                size={17}
                className={`transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            <Hint icon={ShieldCheck}>Upload optional</Hint>
            <Hint icon={FileText}>Liste aufklappbar</Hint>
          </div>
        </motion.div>

        <motion.article
          initial={reduceMotion ? false : {opacity: 0, y: 16}}
          whileInView={reduceMotion ? undefined : {opacity: 1, y: 0}}
          viewport={{once: true, margin: '-80px'}}
          transition={{duration: 0.62, delay: reduceMotion ? 0 : 0.06}}
          className="relative z-10 min-w-0 lg:col-span-7"
          aria-label="Ablauf des digitalen Dossiers"
        >
          <div className="overflow-hidden rounded-[1.8rem] border border-[rgba(17,40,78,0.11)] bg-white/88 p-3 shadow-[0_28px_70px_-48px_rgba(16,52,112,0.42)] sm:p-4">
            <div className="border-b border-[var(--color-border)] px-3 pb-4 pt-2 sm:px-4">
              <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Ihr digitales Dossier
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Klar priorisiert – damit Sie sofort wissen, was zuerst zählt.
              </p>
            </div>

            <ol className="relative mt-1">
              {dossierSteps.map((step, index) => (
                <DossierStep
                  key={step.title}
                  {...step}
                  index={index}
                  isLast={index === dossierSteps.length - 1}
                />
              ))}
            </ol>
          </div>
        </motion.article>
      </div>

      <motion.div
        id="unterlagen-details"
        aria-hidden={!showDetails}
        initial={false}
        animate={{
          height: showDetails ? 'auto' : 0,
          opacity: showDetails ? 1 : 0,
          marginTop: showDetails ? 20 : 0,
        }}
        transition={{duration: reduceMotion ? 0 : 0.36, ease: [0.16, 1, 0.3, 1]}}
        className="overflow-hidden"
      >
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-5 shadow-[var(--shadow-soft)] backdrop-blur-xl lg:p-6">
          <DetailList title="Zusätzlich hilfreich" icon={Camera} items={additionalDocuments} />
        </div>
      </motion.div>
    </section>
  );
}

function DossierStep({
  icon: Icon,
  title,
  status,
  description,
  index,
  isLast,
}: {
  icon: LucideIcon;
  title: string;
  status: string;
  description: string;
  index: number;
  isLast: boolean;
}) {
  return (
    <li className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-4 px-3 py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-4">
      {!isLast ? (
        <span
          aria-hidden="true"
          className="absolute bottom-[-0.8rem] left-[2.08rem] top-[4.15rem] w-px bg-[linear-gradient(var(--color-accent),rgba(37,99,235,0.08))] sm:left-[2.32rem]"
        />
      ) : null}

      <div className="relative flex h-11 w-11 items-center justify-center rounded-[0.95rem] border border-[rgba(37,99,235,0.14)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <Icon size={19} strokeWidth={1.8} />
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[var(--color-accent)] text-[0.56rem] font-extrabold text-white">
          {index + 1}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-lg font-semibold tracking-[-0.025em] text-[var(--color-ink)]">
            {title}
          </h3>
          <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[0.58rem] font-extrabold uppercase tracking-[0.15em] text-[var(--color-text-muted)] sm:hidden">
            {status}
          </span>
        </div>
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-[var(--color-text-muted)]">{description}</p>
      </div>

      <span className="hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[0.6rem] font-extrabold uppercase tracking-[0.16em] text-[var(--color-text-muted)] sm:inline-flex">
        {status}
      </span>
    </li>
  );
}

function Hint({children, icon: Icon}: {children: ReactNode; icon: LucideIcon}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-2">
      <Icon size={14} className="text-[var(--color-accent)]" />
      {children}
    </span>
  );
}

function DetailList({title, icon: Icon, items}: {title: string; icon: LucideIcon; items: string[]}) {
  return (
    <article className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--color-accent)] shadow-[0_16px_34px_-28px_rgba(15,23,42,0.4)]">
          <Icon size={19} />
        </div>
        <h3 className="font-heading text-lg font-semibold tracking-tight text-[var(--color-ink)]">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[var(--color-text-muted)]">
            <CheckCircle2 size={16} className="mt-1 shrink-0 text-[var(--color-accent)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
