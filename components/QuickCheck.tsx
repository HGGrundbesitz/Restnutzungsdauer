'use client';

import {type ComponentType, FormEvent, useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {
  ArrowLeft,
  Bath,
  BadgeCheck,
  Briefcase,
  Building,
  Building2,
  CheckCircle2,
  DoorOpen,
  Flame,
  Hammer,
  House,
  LayoutGrid,
  MapPin,
  Minus,
  Plus,
  Ruler,
  Sparkles,
  Store,
  UserRound,
  Wrench,
} from 'lucide-react';

type PropertyType = 'wohnung' | 'einfamilienhaus' | 'mehrfamilienhaus' | 'wohnGeschaeftshaus' | 'gewerbe';
type AgeBucket =
  | 'unter5'
  | 'unter10'
  | 'unter15'
  | 'fuenfBis10'
  | 'zehnBis15'
  | 'zehnBis20'
  | 'fuenfzehnBis20'
  | 'ueber10'
  | 'ueber15'
  | 'ueber20';
type FloorplanBucket = '1950' | '2000' | '2025';

type Answers = {
  propertyType: PropertyType | '';
  heatingAge: AgeBucket | '';
  roofAge: AgeBucket | '';
  facadeAge: AgeBucket | '';
  windowAge: AgeBucket | '';
  bathroomAge: AgeBucket | '';
  surfaceAge: AgeBucket | '';
  systemsAge: AgeBucket | '';
  floorplanAge: FloorplanBucket | '';
  address: string;
  yearBuilt: number;
  area: number;
  units: number;
};

type ContactData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  consent: boolean;
};

type CardOption = {
  value: string;
  label: string;
  shortLabel?: string;
  icon?: ComponentType<{size?: number; className?: string; strokeWidth?: number}>;
};

type Step =
  | {
      id:
        | 'propertyType'
        | 'heatingAge'
        | 'roofAge'
        | 'facadeAge'
        | 'windowAge'
        | 'bathroomAge'
        | 'surfaceAge'
        | 'systemsAge'
        | 'floorplanAge';
      kind: 'choice';
      title: string;
      subtitle?: string;
      icon?: ComponentType<{size?: number; className?: string; strokeWidth?: number}>;
      layout: 'cards' | 'pills';
      options: CardOption[];
    }
  | {
      id: 'address';
      kind: 'text';
      title: string;
      subtitle: string;
      placeholder: string;
      skipLabel: string;
    }
  | {
      id: 'yearBuilt' | 'area' | 'units';
      kind: 'number';
      title: string;
      subtitle?: string;
      min: number;
      max: number;
      step: number;
      unit?: string;
      icon: ComponentType<{size?: number; className?: string; strokeWidth?: number}>;
      cta: string;
    }
  | {
      id: 'contact';
      kind: 'contact';
      title: string;
      subtitle: string;
      cta: string;
    };

const INITIAL_ANSWERS: Answers = {
  propertyType: '',
  heatingAge: '',
  roofAge: '',
  facadeAge: '',
  windowAge: '',
  bathroomAge: '',
  surfaceAge: '',
  systemsAge: '',
  floorplanAge: '',
  address: '',
  yearBuilt: 1978,
  area: 225,
  units: 1,
};

const INITIAL_CONTACT: ContactData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  consent: false,
};

const steps: Step[] = [
  {
    id: 'propertyType',
    kind: 'choice',
    title: 'Um welche Immobilienart handelt es sich?',
    layout: 'cards',
    options: [
      {value: 'wohnung', label: 'Eigentumswohnung', shortLabel: 'Eigentumswohnung', icon: Building2},
      {value: 'einfamilienhaus', label: 'Einfamilienhaus', shortLabel: 'Einfamilienhaus', icon: House},
      {value: 'mehrfamilienhaus', label: 'Mehrfamilienhaus', shortLabel: 'Mehrfamilienhaus', icon: Building},
      {value: 'wohnGeschaeftshaus', label: 'Wohn- und Geschäftshaus', shortLabel: 'Wohn- & Geschäftshaus', icon: Store},
      {value: 'gewerbe', label: 'Gewerbeobjekt', shortLabel: 'Gewerbeobjekt', icon: Briefcase},
    ],
  },
  {
    id: 'heatingAge',
    kind: 'choice',
    title: 'Wie alt ist die Heizungsanlage?',
    layout: 'pills',
    icon: Flame,
    options: [
      {value: 'unter10', label: 'Neuer als 10 Jahre'},
      {value: 'zehnBis15', label: '10-15 Jahre'},
      {value: 'ueber15', label: 'Älter als 15 Jahre'},
    ],
  },
  {
    id: 'roofAge',
    kind: 'choice',
    title: 'Wie alt ist die Dämmung des Daches?',
    layout: 'pills',
    icon: House,
    options: [
      {value: 'unter10', label: 'Neuer als 10 Jahre'},
      {value: 'zehnBis20', label: '10-20 Jahre'},
      {value: 'ueber20', label: 'Älter als 20 Jahre'},
    ],
  },
  {
    id: 'facadeAge',
    kind: 'choice',
    title: 'Wie alt ist die Dämmung der Fassade?',
    subtitle: 'Nur vollständige Wärmedämmung der Außenwände, keine Teilmodernisierung.',
    layout: 'pills',
    icon: Building2,
    options: [
      {value: 'unter10', label: 'Neuer als 10 Jahre'},
      {value: 'zehnBis20', label: '10-20 Jahre'},
      {value: 'ueber20', label: 'Älter als 20 Jahre'},
    ],
  },
  {
    id: 'windowAge',
    kind: 'choice',
    title: 'Wie alt sind die Fenster und Türen?',
    subtitle: 'Im Durchschnitt.',
    layout: 'pills',
    icon: DoorOpen,
    options: [
      {value: 'unter10', label: 'Neuer als 10 Jahre'},
      {value: 'zehnBis15', label: '10-15 Jahre'},
      {value: 'ueber15', label: 'Älter als 15 Jahre'},
    ],
  },
  {
    id: 'bathroomAge',
    kind: 'choice',
    title: 'Wie alt sind die Bäder?',
    subtitle: 'Im Durchschnitt.',
    layout: 'pills',
    icon: Bath,
    options: [
      {value: 'unter5', label: 'Neuer als 5 Jahre'},
      {value: 'fuenfBis10', label: '5-10 Jahre'},
      {value: 'ueber10', label: 'Älter als 10 Jahre'},
    ],
  },
  {
    id: 'surfaceAge',
    kind: 'choice',
    title: 'Wie alt sind Wände, Decken und Fußböden?',
    subtitle: 'Im Durchschnitt.',
    layout: 'pills',
    icon: Sparkles,
    options: [
      {value: 'unter15', label: 'Neuer als 15 Jahre'},
      {value: 'fuenfzehnBis20', label: '15-20 Jahre'},
      {value: 'ueber20', label: 'Älter als 20 Jahre'},
    ],
  },
  {
    id: 'systemsAge',
    kind: 'choice',
    title: 'Wann wurden Strom, Gas, Wasser und Abwasser zuletzt modernisiert?',
    layout: 'pills',
    icon: Wrench,
    options: [
      {value: 'unter15', label: 'Neuer als 15 Jahre'},
      {value: 'fuenfzehnBis20', label: '15-20 Jahre'},
      {value: 'ueber20', label: 'Älter als 20 Jahre'},
    ],
  },
  {
    id: 'floorplanAge',
    kind: 'choice',
    title: 'Wann wurde der Grundriss zuletzt wesentlich verändert?',
    subtitle:
      'Moderne Grundrisse umfassen offene Küchen, zeitgemäße Bäder und eine bessere Anpassung an den lokalen Mietmarkt.',
    layout: 'pills',
    icon: LayoutGrid,
    options: [
      {value: '1950', label: '1950'},
      {value: '2000', label: '2000'},
      {value: '2025', label: '2025'},
    ],
  },
  {
    id: 'address',
    kind: 'text',
    title: 'Wie lautet die Adresse Ihrer vermieteten Immobilie?',
    subtitle:
      'Mit der Adresse können wir öffentliche Datenquellen besser einordnen und die Ersteinschätzung präziser vorbereiten.',
    placeholder: 'z. B. Weinbergstraße 45, 50667 Köln',
    skipLabel: 'Weiter ohne Adresse',
  },
  {
    id: 'yearBuilt',
    kind: 'number',
    title: 'Wie lautet das Baujahr des Objekts?',
    min: 1850,
    max: new Date().getFullYear(),
    step: 1,
    icon: Hammer,
    cta: 'Weiter',
  },
  {
    id: 'area',
    kind: 'number',
    title: 'Welche Wohn- und Nutzfläche hat das Objekt?',
    min: 20,
    max: 5000,
    step: 5,
    unit: 'm²',
    icon: Ruler,
    cta: 'Weiter',
  },
  {
    id: 'units',
    kind: 'number',
    title: 'Wie viele Nutzungseinheiten hat die Immobilie?',
    min: 1,
    max: 250,
    step: 1,
    icon: Building,
    cta: 'Weiter',
  },
  {
    id: 'contact',
    kind: 'contact',
    title: 'Wohin dürfen wir die Ersteinschätzung schicken?',
    subtitle:
      'Zum Schluss brauchen wir nur Ihre Kontaktdaten. Wir senden Ihnen die Zusammenfassung per E-Mail und melden uns bei Rückfragen direkt.',
    cta: 'Ersteinschätzung anfragen',
  },
];

const trustNotes = [
  '100% kostenlos und unverbindlich',
  'In rund 2 Minuten beantwortet',
  'Digital vorbereitet statt Hin und Her per Telefon',
];

const ageLabels: Record<string, string> = {
  unter5: 'Neuer als 5 Jahre',
  unter10: 'Neuer als 10 Jahre',
  unter15: 'Neuer als 15 Jahre',
  fuenfBis10: '5-10 Jahre',
  zehnBis15: '10-15 Jahre',
  zehnBis20: '10-20 Jahre',
  fuenfzehnBis20: '15-20 Jahre',
  ueber10: 'Älter als 10 Jahre',
  ueber15: 'Älter als 15 Jahre',
  ueber20: 'Älter als 20 Jahre',
  '1950': '1950',
  '2000': '2000',
  '2025': '2025',
};

const propertyTypeLabels: Record<PropertyType, string> = {
  wohnung: 'Eigentumswohnung',
  einfamilienhaus: 'Einfamilienhaus',
  mehrfamilienhaus: 'Mehrfamilienhaus',
  wohnGeschaeftshaus: 'Wohn- und Geschäftshaus',
  gewerbe: 'Gewerbeobjekt',
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function QuickCheck() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [contact, setContact] = useState<ContactData>(INITIAL_CONTACT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const summary = useMemo(() => {
    return [
      ['Immobilienart', answers.propertyType ? propertyTypeLabels[answers.propertyType] : '-'],
      ['Heizungsanlage', answers.heatingAge ? ageLabels[answers.heatingAge] : '-'],
      ['Dämmung Dach', answers.roofAge ? ageLabels[answers.roofAge] : '-'],
      ['Dämmung Fassade', answers.facadeAge ? ageLabels[answers.facadeAge] : '-'],
      ['Fenster und Türen', answers.windowAge ? ageLabels[answers.windowAge] : '-'],
      ['Bäder', answers.bathroomAge ? ageLabels[answers.bathroomAge] : '-'],
      ['Wände, Decken, Fußböden', answers.surfaceAge ? ageLabels[answers.surfaceAge] : '-'],
      ['Leitungssysteme', answers.systemsAge ? ageLabels[answers.systemsAge] : '-'],
      ['Grundriss', answers.floorplanAge ? ageLabels[answers.floorplanAge] : '-'],
      ['Adresse', answers.address.trim() || 'Nicht angegeben'],
      ['Baujahr', String(answers.yearBuilt)],
      ['Wohn- und Nutzfläche', `${answers.area} m²`],
      ['Nutzungseinheiten', String(answers.units)],
    ];
  }, [answers]);

  const goNext = () => setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  const goBack = () => {
    setError(null);
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const handleChoice = (stepId: AnswersKeyChoice, value: string) => {
    setAnswers((current) => ({...current, [stepId]: value}));
    setError(null);
    window.setTimeout(() => {
      setStepIndex((current) => Math.min(current + 1, steps.length - 1));
    }, 160);
  };

  const handleNumberChange = (stepId: AnswersKeyNumber, value: number, min: number, max: number) => {
    setAnswers((current) => ({
      ...current,
      [stepId]: clamp(Number.isFinite(value) ? value : min, min, max),
    }));
  };

  const handleNumberAdjust = (stepId: AnswersKeyNumber, delta: number, min: number, max: number) => {
    setAnswers((current) => ({
      ...current,
      [stepId]: clamp(current[stepId] + delta, min, max),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const fullName = `${contact.firstName.trim()} ${contact.lastName.trim()}`.trim();
    const email = contact.email.trim();
    const phone = contact.phone.trim();

    if (!fullName || !email || !phone) {
      setError('Bitte füllen Sie Name, E-Mail und Telefonnummer aus.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    if (!contact.consent) {
      setError('Bitte bestätigen Sie die Datenschutzhinweise.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/send-quick-check-email', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: fullName,
          firstName: contact.firstName.trim(),
          email,
          phone,
          consent: contact.consent,
          address: answers.address.trim() || 'Nicht angegeben',
          year: answers.yearBuilt,
          answers: summary,
        }),
      });

      const result = (await response.json().catch(() => null)) as {error?: string} | null;

      if (!response.ok) {
        throw new Error(result?.error || 'quick_check_failed');
      }

      setIsSubmitted(true);
    } catch (submissionError) {
      console.error('Quick check submission failed:', submissionError);
      const message = submissionError instanceof Error ? submissionError.message : '';
      setError(
        message && message !== 'quick_check_failed'
          ? message
          : 'Es gab ein Problem beim Senden. Bitte versuchen Sie es später erneut.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="ersteinschaetzung" className="relative z-10 mx-auto max-w-[1200px] px-4 py-20 sm:px-6 md:py-32">
        <div className="glass-panel overflow-hidden rounded-[2rem] p-8 text-center md:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <BadgeCheck size={36} />
          </div>
          <h2 className="mb-4 font-heading text-3xl font-semibold tracking-tight text-[var(--color-ink)] md:text-4xl">
            Danke, Ihre Ersteinschätzung ist unterwegs.
          </h2>
          <p className="mx-auto max-w-2xl text-lg font-light leading-8 text-[var(--color-text-muted)]">
            Wir haben Ihren Schnellcheck erhalten und schicken die Zusammenfassung an Ihre E-Mail-Adresse.
            Wir melden uns mit der nächsten sinnvollen Einordnung bei Ihnen.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#anfrage" className="cta-btn text-sm font-semibold tracking-[0.08em]">
              Zur Anfrage
            </a>
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setStepIndex(0);
                setAnswers(INITIAL_ANSWERS);
                setContact(INITIAL_CONTACT);
                setError(null);
              }}
              className="theme-panel rounded-full px-6 py-3 text-sm font-semibold text-[var(--color-ink)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-surface-strong)]"
            >
              Neue Ersteinschätzung starten
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="ersteinschaetzung" className="relative z-10 mx-auto max-w-[1240px] px-4 py-20 sm:px-6 md:py-32">
      <div className="pointer-events-none absolute inset-x-[8%] top-10 -z-10 h-[420px] rounded-full bg-[var(--color-accent-soft)] blur-[120px] opacity-70" />

      <motion.div
        initial={{opacity: 0, y: 20}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true, margin: '-120px'}}
        transition={{duration: 0.8}}
        className="mb-14 text-center"
      >
        <div className="section-eyebrow mb-6">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_0_6px_var(--color-accent-soft)]" />
          Digitale Ersteinschätzung
        </div>
        <h2 className="mb-4 font-heading text-4xl font-semibold tracking-tight text-[var(--color-ink)] md:text-5xl">
          In 2 Minuten prüfen, ob sich ein Gutachten lohnt
        </h2>
        <p className="mx-auto max-w-3xl text-lg font-light leading-8 text-[var(--color-text-muted)]">
          Jetzt schnell herausfinden, ob sich ein Gutachten für Sie rechnet.
        </p>
      </motion.div>

      <div className="glass-panel overflow-hidden rounded-[1.5rem] p-4 shadow-[var(--shadow-lift)] sm:p-6 md:rounded-[1.75rem] md:p-8 lg:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0}
            className="theme-panel inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-[var(--color-ink)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-35 sm:w-fit"
          >
            <ArrowLeft size={16} />
            Zurück
          </button>

          <div className="theme-panel w-full rounded-full px-4 py-3 text-center text-sm font-semibold text-[var(--color-text-muted)] sm:w-auto">
            Schritt {stepIndex + 1} / {steps.length}
          </div>
        </div>

        <div className="mb-10">
          <div className="mx-auto h-2 w-full max-w-[340px] overflow-hidden rounded-full bg-[var(--color-border)]">
            <motion.div
              animate={{width: `${progress}%`}}
              transition={{duration: 0.3, ease: [0.16, 1, 0.3, 1]}}
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-accent),#7eb4dd)]"
            />
          </div>
        </div>

        <div className="min-h-[460px] sm:min-h-[500px] md:min-h-[540px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{opacity: 0, y: 18}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -18}}
              transition={{duration: 0.28, ease: [0.16, 1, 0.3, 1]}}
              className="mx-auto max-w-6xl"
            >
              <div className="mb-8 text-center sm:mb-10">
                <h3 className="mx-auto max-w-4xl text-balance font-heading text-3xl font-semibold leading-[1.08] text-[var(--color-ink)] sm:text-4xl lg:text-[3.25rem]">
                  {currentStep.title}
                </h3>
                {'subtitle' in currentStep && currentStep.subtitle ? (
                  <p className="mx-auto mt-4 max-w-3xl text-base font-light leading-7 text-[var(--color-text-muted)]">
                    {currentStep.subtitle}
                  </p>
                ) : null}
              </div>

              {currentStep.kind === 'choice' && currentStep.layout === 'cards' ? (
                <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-4 min-[430px]:grid-cols-2 sm:gap-5 md:grid-cols-3 xl:grid-cols-5">
                  {currentStep.options.map((option) => {
                    const Icon = option.icon;
                    const isActive = answers[currentStep.id] === option.value;

                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileTap={{scale: 0.98}}
                        onClick={() => handleChoice(currentStep.id, option.value)}
                        className={`group relative flex min-h-[168px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-[1.35rem] border px-5 py-6 text-center transition-all duration-300 ${
                          isActive
                            ? 'border-[var(--color-accent)] bg-[linear-gradient(180deg,#ffffff_0%,rgba(37,99,235,0.10)_100%)] shadow-[0_26px_55px_-36px_rgba(37,99,235,0.42)] ring-1 ring-[rgba(37,99,235,0.14)]'
                            : 'border-[var(--color-border)] bg-[rgba(255,255,255,0.9)] hover:-translate-y-1.5 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-strong)] hover:shadow-[0_24px_55px_-38px_rgba(15,23,42,0.26)]'
                        }`}
                      >
                        <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(37,99,235,0.26)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="mb-5 flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.15rem] bg-[var(--color-accent-soft)] text-[var(--color-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                          {Icon ? <Icon size={30} strokeWidth={1.8} /> : null}
                        </div>
                        <div className="flex min-h-[3rem] max-w-full items-center justify-center text-balance break-words text-[0.98rem] font-semibold leading-6 text-[var(--color-ink)] [overflow-wrap:anywhere] sm:text-[1.03rem]">
                          {option.shortLabel ?? option.label}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : null}

              {currentStep.kind === 'choice' && currentStep.layout === 'pills' ? (
                <div className="mx-auto max-w-3xl">
                  {currentStep.icon ? (
                    <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                      <currentStep.icon size={40} />
                    </div>
                  ) : null}
                  <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {currentStep.options.map((option) => {
                      const isActive = answers[currentStep.id] === option.value;

                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          whileTap={{scale: 0.98}}
                          onClick={() => handleChoice(currentStep.id, option.value)}
                          className={`min-h-[58px] rounded-[1rem] border px-5 py-4 text-center text-base font-semibold leading-6 transition-all duration-300 sm:rounded-full ${
                            isActive
                              ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-ink)] shadow-[0_22px_44px_-34px_rgba(37,99,235,0.32)]'
                              : 'border-[var(--color-border)] bg-[rgba(255,255,255,0.86)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-ink)]'
                          }`}
                        >
                          {option.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {currentStep.kind === 'text' ? (
                <div className="mx-auto max-w-3xl">
                  <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                    <MapPin size={40} />
                  </div>
                  <div className="theme-panel-muted mb-5 rounded-[1.5rem] p-5 text-sm font-light leading-7 text-[var(--color-text-muted)]">
                    Optional, aber hilfreich für eine genauere Einschätzung.
                  </div>
                  <input
                    type="text"
                    value={answers.address}
                    onChange={(event) => setAnswers((current) => ({...current, address: event.target.value}))}
                    placeholder={currentStep.placeholder}
                    className="mb-5 !rounded-[1.2rem] !px-5 !py-4 !text-base"
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      onClick={goNext}
                      className="theme-panel rounded-full px-6 py-4 text-sm font-semibold text-[var(--color-ink)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-surface-strong)]"
                    >
                      {currentStep.skipLabel}
                    </button>
                    <button type="button" onClick={goNext} className="cta-btn text-sm font-semibold tracking-[0.08em]">
                      Weiter
                    </button>
                  </div>
                </div>
              ) : null}

              {currentStep.kind === 'number' ? (
                <div className="mx-auto max-w-2xl text-center">
                  <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                    <currentStep.icon size={40} />
                  </div>

                  <div className="theme-panel mx-auto mb-8 flex max-w-[420px] items-center gap-2 rounded-[1.5rem] p-2 sm:max-w-[520px]">
                    <button
                      type="button"
                      onClick={() => handleNumberAdjust(currentStep.id, -currentStep.step, currentStep.min, currentStep.max)}
                      className="theme-panel-muted flex h-12 w-12 items-center justify-center rounded-[1.1rem] text-[var(--color-text-muted)] transition-all hover:text-[var(--color-ink)] sm:h-14 sm:w-14"
                    >
                      <Minus size={18} />
                    </button>

                    <label className="mb-0 flex min-w-0 flex-1 items-center justify-center gap-2 rounded-[1.1rem] bg-white px-3 py-3 sm:gap-3 sm:px-4">
                      <input
                        type="number"
                        value={answers[currentStep.id]}
                        min={currentStep.min}
                        max={currentStep.max}
                        step={currentStep.step}
                        onChange={(event) =>
                          handleNumberChange(currentStep.id, Number(event.target.value), currentStep.min, currentStep.max)
                        }
                        className="!mb-0 border-0 !bg-transparent !px-0 !py-0 text-center !text-[1.65rem] font-semibold tracking-tight !text-[var(--color-ink)] shadow-none focus:!shadow-none sm:!text-[2rem]"
                      />
                      {currentStep.unit ? <span className="text-lg font-medium text-[var(--color-text-muted)]">{currentStep.unit}</span> : null}
                    </label>

                    <button
                      type="button"
                      onClick={() => handleNumberAdjust(currentStep.id, currentStep.step, currentStep.min, currentStep.max)}
                      className="theme-panel-muted flex h-12 w-12 items-center justify-center rounded-[1.1rem] text-[var(--color-text-muted)] transition-all hover:text-[var(--color-ink)] sm:h-14 sm:w-14"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <button type="button" onClick={goNext} className="cta-btn text-sm font-semibold tracking-[0.08em]">
                    {currentStep.cta}
                  </button>
                </div>
              ) : null}

              {currentStep.kind === 'contact' ? (
                <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
                  <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                    <UserRound size={40} />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="quickcheck-firstname">Vorname</label>
                      <input
                        id="quickcheck-firstname"
                        type="text"
                        value={contact.firstName}
                        onChange={(event) => setContact((current) => ({...current, firstName: event.target.value}))}
                        placeholder="Max"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="quickcheck-lastname">Nachname</label>
                      <input
                        id="quickcheck-lastname"
                        type="text"
                        value={contact.lastName}
                        onChange={(event) => setContact((current) => ({...current, lastName: event.target.value}))}
                        placeholder="Mustermann"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="quickcheck-phone">Telefonnummer</label>
                      <input
                        id="quickcheck-phone"
                        type="tel"
                        value={contact.phone}
                        onChange={(event) => setContact((current) => ({...current, phone: event.target.value}))}
                        placeholder="+49 ..."
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="quickcheck-email">E-Mail</label>
                      <input
                        id="quickcheck-email"
                        type="email"
                        value={contact.email}
                        onChange={(event) => setContact((current) => ({...current, email: event.target.value}))}
                        placeholder="max@beispiel.de"
                        required
                      />
                    </div>
                  </div>

                  <div className="theme-panel-muted mt-6 rounded-[1.5rem] p-5">
                    <label className="mb-0 flex items-start gap-3 text-sm font-light leading-7 text-[var(--color-text-muted)]">
                      <input
                        type="checkbox"
                        checked={contact.consent}
                        onChange={(event) => setContact((current) => ({...current, consent: event.target.checked}))}
                        className="mt-1 h-5 w-5 shrink-0"
                        required
                      />
                      <span>
                        Ich habe die Datenschutzhinweise gelesen und bin mit der Verarbeitung meiner Angaben
                        zur Bearbeitung der Ersteinschätzung einverstanden.
                      </span>
                    </label>
                  </div>

                  <div className="mt-6 rounded-[1.5rem] border border-[var(--color-border)] bg-white/70 p-5">
                    <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-[var(--color-ink)]">
                      <CheckCircle2 size={18} className="text-[var(--color-accent)]" />
                      Zusammenfassung Ihrer Angaben
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {summary.map(([label, value]) => (
                        <div key={label} className="theme-panel-muted rounded-[1rem] px-4 py-3 text-sm">
                          <div className="font-semibold text-[var(--color-ink)]">{label}</div>
                          <div className="mt-1 font-light text-[var(--color-text-muted)]">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error ? (
                    <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                      {error}
                    </div>
                  ) : null}

                  <div className="mt-8 flex flex-col items-center gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="cta-btn text-sm font-semibold tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? 'Wird gesendet...' : currentStep.cta}
                    </button>
                    <p className="text-sm font-light text-[var(--color-text-muted)]">
                      Wir senden Ihre Angaben sicher ab und melden uns mit der passenden nächsten Einordnung.
                    </p>
                  </div>
                </form>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

type AnswersKeyChoice =
  | 'propertyType'
  | 'heatingAge'
  | 'roofAge'
  | 'facadeAge'
  | 'windowAge'
  | 'bathroomAge'
  | 'surfaceAge'
  | 'systemsAge'
  | 'floorplanAge';

type AnswersKeyNumber = 'yearBuilt' | 'area' | 'units';








