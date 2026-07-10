'use client';

import Image from 'next/image';
import {useRef, useState, type ReactNode, type UIEvent} from 'react';
import {
  ArrowLeft,
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
import {motion} from 'motion/react';

const coreDocuments = [
  'Baujahr des Gebäudes',
  'Grundrisse oder Bauzeichnungen',
  'Wohn- und Nutzflächenberechnung',
  'Kaufvertrag oder Kaufpreisaufteilung, falls vorhanden',
  'Baubeschreibung, Exposé oder Angaben zur Ausstattung',
  'Modernisierungen, Sanierungen, Anbauten oder Erweiterungen der letzten ca. 20 Jahre',
  'Angaben zu Schäden oder Sanierungsstau',
];

const helpfulDocuments = [
  'Energieausweis',
  'Grundbuchauszug oder Baulasteninformationen',
  'Teilungserklärung bei Eigentumswohnungen',
  'bisheriger Steuerbescheid, AfA-Satz oder Restbuchwert',
  'Denkmalschutz- oder Nutzungsbeschränkungen, falls vorhanden',
];

const additionalDocuments = [
  ...helpfulDocuments,
  'Außenansichten des Gebäudes',
  'Dach, Dachboden oder Dämmung',
  'Keller, Heizungsanlage und Leitungen',
  'Fenster, Türen und Innenräume',
  'sichtbare Schäden wie Risse, Feuchtigkeit oder veraltete Technik',
];

const quickCards = [
  {icon: FolderCheck, title: 'Basisdaten', tag: 'Startklar'},
  {icon: Camera, title: 'Objektfotos', tag: 'Hilfreich'},
  {icon: UploadCloud, title: 'Später ergänzen', tag: 'Optional'},
];

const dossierSlides = [
  {
    image: '/foto.png',
    label: 'Dossier',
    title: 'Unterlagen sichten',
    meta: 'Basisdaten reichen zum Start',
  },
  {
    image: '/bild1.png',
    label: 'Objekt',
    title: 'Zustand einordnen',
    meta: 'Fotos helfen bei der Prüfung',
  },
  {
    image: '/foto.png',
    label: 'Upload',
    title: 'Später ergänzen',
    meta: 'Keine perfekte Akte nötig',
  },
];

export default function RequiredDocuments() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <section id="unterlagen" className="section-shell scroll-mt-32 py-16 md:py-24">
      <motion.div
        initial={{opacity: 0, y: 22}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true, margin: '-100px'}}
        transition={{duration: 0.8}}
        className="mx-auto mb-10 max-w-4xl text-center"
      >
        <div className="section-eyebrow mb-6">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          Unterlagen
        </div>
        <h2 className="section-title mx-auto max-w-4xl">Kurz prüfen. Später ergänzen.</h2>
        <p className="section-copy mx-auto mt-5 max-w-xl">
          Für den Start reicht ein kurzer Überblick. Fehlende Unterlagen sind kein Hindernis.
        </p>
      </motion.div>

      <div className="grid items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <DocumentDossier />

        <motion.div
          initial={{opacity: 0, y: 24}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: '-100px'}}
          transition={{duration: 0.75, delay: 0.08}}
          className="glass-panel rounded-[2rem] p-5 sm:p-7 lg:p-8"
        >
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/70 px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                <Layers3 size={14} className="text-[var(--color-accent)]" />
                Digitales Dossier
              </p>
              <h3 className="font-heading text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl">
                Keine Textwand. Nur ein sauberer erster Check.
              </h3>
            </div>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] sm:flex">
              <FolderCheck size={24} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {quickCards.map((card, index) => (
              <MiniInfoCard key={card.title} {...card} delay={index * 0.06} />
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href="#ersteinschaetzung" className="cta-btn px-6 py-4 text-sm">
              Ersteinschätzung starten
              <ArrowRight size={18} className="ml-2" />
            </a>
            <button
              type="button"
              aria-expanded={showDetails}
              aria-controls="unterlagen-details"
              onClick={() => setShowDetails((current) => !current)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white/75 px-6 py-4 text-sm font-bold text-[var(--color-ink)] shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:bg-white"
            >
              Mehr Infos
              <ChevronDown size={18} className={`transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            <Hint icon={ShieldCheck}>Upload optional</Hint>
            <Hint icon={FileText}>Liste aufklappbar</Hint>
          </div>
        </motion.div>
      </div>

      <motion.div
        id="unterlagen-details"
        initial={false}
        animate={{
          height: showDetails ? 'auto' : 0,
          opacity: showDetails ? 1 : 0,
          marginTop: showDetails ? 24 : 0,
        }}
        transition={{duration: 0.45, ease: [0.16, 1, 0.3, 1]}}
        className="overflow-hidden"
      >
        <div className="grid gap-4 rounded-[2rem] border border-[var(--color-border)] bg-white/82 p-5 shadow-[var(--shadow-soft)] backdrop-blur-xl lg:grid-cols-2 lg:p-6">
          <DetailList title="Kernunterlagen" icon={FolderCheck} items={coreDocuments} />
          <DetailList title="Zusätzlich hilfreich - inklusive Fotos" icon={Camera} items={additionalDocuments} />
        </div>
      </motion.div>
    </section>
  );
}

function DocumentDossier() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const scrollToSlide = (index: number) => {
    const scroller = scrollRef.current;

    if (!scroller) {
      return;
    }

    const safeIndex = (index + dossierSlides.length) % dossierSlides.length;
    scroller.scrollTo({left: safeIndex * scroller.clientWidth, behavior: 'smooth'});
    setActiveSlide(safeIndex);
  };

  const updateActiveSlide = (event: UIEvent<HTMLDivElement>) => {
    const scroller = event.currentTarget;
    const nextIndex = Math.round(scroller.scrollLeft / scroller.clientWidth);
    setActiveSlide(Math.min(Math.max(nextIndex, 0), dossierSlides.length - 1));
  };

  return (
    <motion.article
      initial={{opacity: 0, y: 24, rotateX: 5}}
      whileInView={{opacity: 1, y: 0, rotateX: 0}}
      whileHover={{y: -6, rotateX: 2, rotateY: -3}}
      viewport={{once: true, margin: '-100px'}}
      transition={{duration: 0.8, ease: [0.16, 1, 0.3, 1]}}
      className="group relative mx-auto min-h-[28rem] w-full max-w-[35rem] overflow-hidden rounded-[2.2rem] border border-[var(--color-border)] bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(239,245,252,0.88))] p-5 shadow-[0_34px_90px_-50px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:p-7"
    >
      <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-[rgba(37,99,235,0.12)] blur-3xl" />
      <div className="absolute -right-20 bottom-6 h-48 w-48 rounded-full bg-[rgba(15,23,42,0.08)] blur-3xl" />

      <div className="relative h-[24rem] sm:h-[25rem]" style={{perspective: '1100px'}}>
        <div className="absolute left-1/2 top-12 h-[17rem] w-[70%] -translate-x-1/2 rotate-[-7deg] rounded-[1.8rem] border border-[var(--color-border)] bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.55)] transition duration-500 group-hover:-translate-y-2 group-hover:rotate-[-10deg]" />
        <div className="absolute left-1/2 top-[4.25rem] h-[17rem] w-[74%] -translate-x-1/2 rotate-[5deg] rounded-[1.8rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] shadow-[0_24px_70px_-44px_rgba(15,23,42,0.48)] transition duration-500 group-hover:translate-x-[-48%] group-hover:rotate-[8deg]" />

        <div className="absolute left-1/2 top-5 h-[19rem] w-[80%] -translate-x-1/2 overflow-hidden rounded-[2rem] border border-[var(--color-border-strong)] bg-white shadow-[0_34px_80px_-42px_rgba(15,23,42,0.6)] transition duration-500 group-hover:-translate-y-3 group-hover:rotate-[-1.5deg]">
          <div
            ref={scrollRef}
            onScroll={updateActiveSlide}
            className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {dossierSlides.map((slide) => (
              <div key={slide.title} className="relative h-full min-w-full snap-center overflow-hidden">
                <Image src={slide.image} alt={slide.title} fill sizes="(max-width: 768px) 85vw, 430px" className="object-cover" priority={false} />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.76)] via-[rgba(15,23,42,0.12)] to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                  <p className="mb-2 inline-flex rounded-full bg-white/88 px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                    {slide.label}
                  </p>
                  <h3 className="font-heading text-2xl font-semibold leading-none tracking-tight text-white">{slide.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-white/78">{slide.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute left-1/2 top-[21.2rem] flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/88 p-1 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.42)] backdrop-blur-xl">
          <button type="button" onClick={() => scrollToSlide(activeSlide - 1)} aria-label="Vorheriges Dokument anzeigen" className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ink)] transition hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            {dossierSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`${slide.title} anzeigen`}
                aria-current={activeSlide === index ? 'true' : undefined}
                onClick={() => scrollToSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${activeSlide === index ? 'w-6 bg-[var(--color-accent)]' : 'w-2.5 bg-[rgba(15,23,42,0.18)] hover:bg-[rgba(37,99,235,0.45)]'}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => scrollToSlide(activeSlide + 1)} aria-label="Nächstes Dokument anzeigen" className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ink)] transition hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function MiniInfoCard({icon: Icon, title, tag, delay}: {icon: LucideIcon; title: string; tag: string; delay: number}) {
  return (
    <motion.div
      initial={{opacity: 0, y: 16}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, margin: '-80px'}}
      transition={{duration: 0.55, delay}}
      className="theme-panel-muted rounded-[1.35rem] p-4"
    >
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <Icon size={21} />
      </div>
      <h4 className="font-heading text-lg font-semibold tracking-tight text-[var(--color-ink)]">{title}</h4>
      <p className="mt-2 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{tag}</p>
    </motion.div>
  );
}

function Hint({children, icon: Icon}: {children: ReactNode; icon: LucideIcon}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/70 px-3 py-2">
      <Icon size={15} className="text-[var(--color-accent)]" />
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
