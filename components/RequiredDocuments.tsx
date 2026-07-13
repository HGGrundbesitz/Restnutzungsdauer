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
import {motion, useReducedMotion} from 'motion/react';

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

const dossierSlides = [
  {
    image: '/rnd/dossier-building-thumb.png',
    icon: FolderCheck,
    title: 'Basisdaten',
    tag: 'Startklar',
  },
  {
    image: '/rnd/dossier-interior-thumb.png',
    icon: Camera,
    title: 'Objektfotos',
    tag: 'Hilfreich',
  },
  {
    image: '/foto.png',
    icon: UploadCloud,
    title: 'Später ergänzen',
    tag: 'Optional',
  },
];

export default function RequiredDocuments() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <section id="unterlagen" className="section-shell relative scroll-mt-32 py-6 md:py-10">
      <div aria-hidden="true" className="absolute -left-32 top-20 -z-10 h-80 w-80 rounded-full bg-[rgba(87,139,255,0.11)] blur-[110px]" />

      <div className="architectural-card relative grid items-center gap-8 overflow-hidden rounded-[2.35rem] p-6 sm:p-8 lg:grid-cols-[0.62fr_1.38fr] lg:p-10 xl:gap-10 xl:p-12">
        <div aria-hidden="true" className="architectural-grid absolute inset-0 opacity-45 [mask-image:linear-gradient(90deg,transparent,black_55%,black)]" />

        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: '-80px'}}
          transition={{duration: 0.68}}
          className="relative z-20"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/76 px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            <Layers3 size={14} className="text-[var(--color-accent)]" />
            Digitales Dossier
          </p>
          <h2 className="editorial-title max-w-lg text-[2.55rem] leading-[0.98] text-[var(--color-ink)] sm:text-5xl lg:text-[3.45rem]">
            Keine Textwand. Nur ein sauberer erster Check.
          </h2>

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
              className="premium-focus inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-6 py-3.5 text-sm font-bold text-[var(--color-ink)] shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:bg-white"
            >
              Mehr Infos
              <ChevronDown size={17} className={`transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            <Hint icon={ShieldCheck}>Upload optional</Hint>
            <Hint icon={FileText}>Liste aufklappbar</Hint>
          </div>
        </motion.div>

        <DocumentDossier />
      </div>

      <motion.div
        id="unterlagen-details"
        initial={false}
        animate={{height: showDetails ? 'auto' : 0, opacity: showDetails ? 1 : 0, marginTop: showDetails ? 20 : 0}}
        transition={{duration: 0.42, ease: [0.16, 1, 0.3, 1]}}
        className="overflow-hidden"
      >
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[var(--color-border)] bg-white/86 p-5 shadow-[var(--shadow-soft)] backdrop-blur-xl lg:p-6">
          <DetailList title="Zusätzlich hilfreich" icon={Camera} items={additionalDocuments} />
        </div>
      </motion.div>
    </section>
  );
}

function DocumentDossier() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const reduceMotion = useReducedMotion();

  const scrollToSlide = (index: number) => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const safeIndex = (index + dossierSlides.length) % dossierSlides.length;
    const slide = scroller.children.item(safeIndex) as HTMLElement | null;
    scroller.scrollTo({left: slide?.offsetLeft ?? 0, behavior: reduceMotion ? 'auto' : 'smooth'});
    setActiveSlide(safeIndex);
  };

  const updateActiveSlide = (event: UIEvent<HTMLDivElement>) => {
    const scroller = event.currentTarget;
    const slides = Array.from(scroller.children) as HTMLElement[];
    const nextIndex = slides.reduce((nearest, slide, index) => {
      const currentDistance = Math.abs(slide.offsetLeft - scroller.scrollLeft);
      const nearestDistance = Math.abs(slides[nearest].offsetLeft - scroller.scrollLeft);
      return currentDistance < nearestDistance ? index : nearest;
    }, 0);
    setActiveSlide(nextIndex);
  };

  return (
    <motion.article
      initial={{opacity: 0, y: 20}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, margin: '-80px'}}
      transition={{duration: 0.72, delay: 0.08}}
      className="relative z-10 min-w-0 py-2 lg:py-0"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-20 top-[-4rem] hidden w-[24rem] opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_46%,transparent_80%)] lg:block">
        <Image src="/rnd/folder-stack.png" alt="" fill sizes="380px" className="object-contain [filter:brightness(1.24)_contrast(0.8)_saturate(1.2)]" />
      </div>

      <div
        ref={scrollRef}
        onScroll={updateActiveSlide}
        className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
      >
        {dossierSlides.map((slide, index) => (
          <DossierCard key={slide.title} {...slide} index={index} />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <button type="button" onClick={() => scrollToSlide(activeSlide - 1)} aria-label="Vorheriges Dokument anzeigen" className="premium-focus flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/88 text-[var(--color-ink)] shadow-[0_14px_32px_-24px_rgba(15,23,42,0.45)] transition hover:border-[rgba(37,99,235,0.22)] hover:text-[var(--color-accent)]">
          <ArrowLeft size={17} />
        </button>
        <div className="flex items-center gap-1.5 px-1">
          {dossierSlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`${slide.title} anzeigen`}
              aria-current={activeSlide === index ? 'true' : undefined}
              onClick={() => scrollToSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${activeSlide === index ? 'w-6 bg-[var(--color-accent)]' : 'w-2.5 bg-[rgba(15,23,42,0.16)] hover:bg-[rgba(37,99,235,0.45)]'}`}
            />
          ))}
        </div>
        <button type="button" onClick={() => scrollToSlide(activeSlide + 1)} aria-label="Nächstes Dokument anzeigen" className="premium-focus flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/88 text-[var(--color-ink)] shadow-[0_14px_32px_-24px_rgba(15,23,42,0.45)] transition hover:border-[rgba(37,99,235,0.22)] hover:text-[var(--color-accent)]">
          <ArrowRight size={17} />
        </button>
      </div>
    </motion.article>
  );
}

function DossierCard({image, icon: Icon, title, tag, index}: {image: string; icon: LucideIcon; title: string; tag: string; index: number}) {
  return (
    <motion.div
      initial={{opacity: 0, y: 18}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, margin: '-60px'}}
      transition={{duration: 0.55, delay: index * 0.06}}
      className="group relative min-h-[15rem] min-w-[82%] snap-start overflow-hidden rounded-[1.55rem] border border-white/80 bg-white/72 shadow-[0_28px_70px_-42px_rgba(16,52,112,0.52)] backdrop-blur-xl sm:min-w-[47%] xl:min-w-[calc((100%-2rem)/3)]"
    >
      <Image src={image} alt="" fill sizes="(max-width: 640px) 78vw, (max-width: 1280px) 36vw, 220px" className="object-cover transition duration-700 group-hover:scale-[1.035]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(229,239,255,0.22)_45%,rgba(255,255,255,0.93)_82%)]" />
      <div className="absolute inset-x-3 bottom-3 rounded-[1.15rem] border border-white/80 bg-white/76 p-4 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.5)] backdrop-blur-xl">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]"><Icon size={19} /></div>
        <h3 className="font-heading text-lg font-semibold tracking-tight text-[var(--color-ink)]">{title}</h3>
        <p className="mt-1 text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{tag}</p>
      </div>
    </motion.div>
  );
}

function Hint({children, icon: Icon}: {children: ReactNode; icon: LucideIcon}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/76 px-3 py-2">
      <Icon size={14} className="text-[var(--color-accent)]" />
      {children}
    </span>
  );
}

function DetailList({title, icon: Icon, items}: {title: string; icon: LucideIcon; items: string[]}) {
  return (
    <article className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--color-accent)] shadow-[0_16px_34px_-28px_rgba(15,23,42,0.4)]"><Icon size={19} /></div>
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
