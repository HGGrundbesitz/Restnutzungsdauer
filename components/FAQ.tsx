'use client';

import {useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ArrowRight, ChevronDown, HelpCircle, Sparkles} from 'lucide-react';

const faqs = [
  {
    question: 'Was kostet ein Restnutzungsdauer-Gutachten?',
    answer:
      'Die Kosten hängen von Objektart, Unterlagenlage und Umfang der Prüfung ab. Nach der Ersteinschätzung erhalten Sie ein klares Angebot, bevor ein Auftrag startet.',
  },
  {
    question: 'Lohnt sich ein Restnutzungsdauer-Gutachten für meine Immobilie?',
    answer:
      'Es lohnt sich besonders bei älteren vermieteten Immobilien, wenn die tatsächliche Nutzungsdauer plausibel kürzer ist als die pauschale steuerliche Annahme. Wir prüfen zuerst, ob der Hebel realistisch ist.',
  },
  {
    question: 'Wie beeinflusst die Abschreibung den Cashflow meiner Immobilie?',
    answer:
      'Eine kürzere Restnutzungsdauer kann die jährliche Abschreibung erhöhen. Dadurch kann sich die steuerliche Belastung reduzieren und Ihr laufender Netto-Cashflow verbessern.',
  },
  {
    question: 'Ich behalte die Immobilie langfristig. Bringt mir eine verkürzte Abschreibung trotzdem etwas?',
    answer:
      'Ja, gerade bei langfristiger Vermietung kann eine höhere jährliche Abschreibung über viele Jahre Wirkung entfalten. Entscheidend ist, dass die Herleitung fachlich sauber und nachvollziehbar bleibt.',
  },
  {
    question: 'Wie läuft die Begutachtung meiner Immobilie ab?',
    answer:
      'Sie senden die wichtigsten Objektdaten und Unterlagen digital. Danach prüfen wir Zustand, Baujahr, Modernisierungen und Dokumente und leiten daraus eine nachvollziehbare Restnutzungsdauer ab.',
  },
  {
    question: 'Welche Unterlagen werden für den Start benötigt?',
    answer:
      'Für den ersten Check reichen meist Adresse, Baujahr, Objektart, Fotos und vorhandene Unterlagen wie Grundbuchauszug oder Wohnflächenangaben. Fehlende Dokumente können häufig später ergänzt werden.',
  },
  {
    question: 'Wie schnell bekomme ich eine Einschätzung?',
    answer:
      'Die digitale Ersteinschätzung geht sehr schnell. Für das vollständige Gutachten hängt die Dauer vom Objekt und der Vollständigkeit der Unterlagen ab.',
  },
  {
    question: 'Kann ich das Gutachten beim Finanzamt verwenden?',
    answer:
      'Das Gutachten wird so aufgebaut, dass die Annahmen und Bewertungslogik nachvollziehbar dokumentiert sind. Die finale steuerliche Einordnung sollten Sie zusätzlich mit Ihrer Steuerberatung abstimmen.',
  },
];

const INITIAL_VISIBLE_COUNT = 5;

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const visibleFaqs = useMemo(
    () => (showAll ? faqs : faqs.slice(0, INITIAL_VISIBLE_COUNT)),
    [showAll],
  );

  return (
    <section
      id="faq"
      className="relative z-10 mx-auto max-w-[1400px] scroll-mt-32 overflow-hidden px-4 py-20 sm:px-6 md:py-28"
    >
      <div className="pointer-events-none absolute inset-x-4 top-12 -z-10 h-[420px] rounded-[3rem] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.10),transparent_62%)]" />

      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <motion.div
          initial={{opacity: 0, y: 22}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: '-100px'}}
          transition={{duration: 0.7, ease: [0.16, 1, 0.3, 1]}}
          className="theme-panel-strong rounded-[2rem] p-6 shadow-[var(--shadow-soft)] sm:p-8 lg:sticky lg:top-28"
        >
          <div className="section-eyebrow mb-7">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_0_6px_var(--color-accent-soft)]" />
            FAQ
          </div>

          <h2 className="font-heading text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-[var(--color-ink)] sm:text-5xl lg:text-6xl">
            Fragen, die vor dem Gutachten wichtig sind.
          </h2>

          <p className="mt-6 max-w-xl text-base font-medium leading-8 text-[var(--color-text-muted)] sm:text-lg">
            Ruhige Antworten statt Fachchinesisch. Öffnen Sie, was gerade relevant ist, und springen Sie danach direkt in die Anfrage.
          </p>

          <a
            href="#anfrage"
            className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[var(--color-btn-bg)] px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-btn-text)] shadow-[0_22px_44px_-30px_rgba(15,23,42,0.5)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--color-btn-bg-hover)] sm:w-auto"
          >
            Anfrage starten
            <ArrowRight size={18} />
          </a>
        </motion.div>

        <div className="rounded-[2rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.72)] p-3 shadow-[var(--shadow-lift)] backdrop-blur-2xl sm:p-4 md:rounded-[2.4rem] md:p-5">
          <div className="mb-3 flex items-center justify-between gap-3 px-2 py-2 sm:px-3">
            <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <HelpCircle size={19} />
              </span>
              Antworten
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)] sm:flex">
              <Sparkles size={14} />
              Smooth Guide
            </div>
          </div>

          <motion.div layout className="space-y-3">
            <AnimatePresence initial={false}>
              {visibleFaqs.map((faq, index) => {
                const isOpen = openIndex === index;
                const answerId = `faq-answer-${index}`;

                return (
                  <motion.article
                    layout
                    key={faq.question}
                    initial={{opacity: 0, y: 18, scale: 0.985}}
                    animate={{opacity: 1, y: 0, scale: 1}}
                    exit={{opacity: 0, y: -12, scale: 0.985}}
                    transition={{duration: 0.34, delay: index * 0.035, ease: [0.16, 1, 0.3, 1]}}
                    className={`group overflow-hidden rounded-[1.35rem] border transition-all duration-300 sm:rounded-[1.55rem] ${
                      isOpen
                        ? 'border-[rgba(37,99,235,0.26)] bg-white shadow-[0_24px_60px_-38px_rgba(37,99,235,0.4)]'
                        : 'border-[var(--color-border)] bg-[rgba(255,255,255,0.86)] shadow-[0_16px_48px_-44px_rgba(15,23,42,0.24)] hover:-translate-y-1 hover:border-[var(--color-border-strong)] hover:bg-white hover:shadow-[0_22px_58px_-42px_rgba(15,23,42,0.26)]'
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      className="flex w-full min-w-0 items-center gap-4 px-4 py-5 text-left sm:px-6 sm:py-6"
                    >
                      <span
                        className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold transition-all duration-300 sm:flex ${
                          isOpen
                            ? 'bg-[var(--color-accent)] text-white'
                            : 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] group-hover:scale-105'
                        }`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className="min-w-0 flex-1 text-balance text-[1.05rem] font-semibold leading-6 tracking-[-0.02em] text-[var(--color-ink)] sm:text-xl sm:leading-7 lg:text-[1.35rem] lg:leading-8">
                        {faq.question}
                      </span>

                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-ink)] transition-all duration-300 ${
                          isOpen ? 'rotate-180 shadow-sm' : 'group-hover:-translate-y-0.5 group-hover:border-[var(--color-border-strong)]'
                        }`}
                      >
                        <ChevronDown size={18} />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          id={answerId}
                          key="answer"
                          initial={{height: 0, opacity: 0}}
                          animate={{height: 'auto', opacity: 1}}
                          exit={{height: 0, opacity: 0}}
                          transition={{duration: 0.32, ease: [0.16, 1, 0.3, 1]}}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-6 sm:pl-[5.75rem] sm:pr-8">
                            <p className="max-w-3xl text-[0.98rem] font-medium leading-8 text-[var(--color-text-muted)] sm:text-base">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {faqs.length > INITIAL_VISIBLE_COUNT ? (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                className="inline-flex items-center justify-center gap-3 rounded-full border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-bold text-[var(--color-ink)] shadow-[0_18px_42px_-34px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-border-strong)] hover:shadow-[0_24px_50px_-36px_rgba(15,23,42,0.32)]"
              >
                {showAll ? 'Weniger anzeigen' : 'Mehr Fragen anzeigen'}
                <ChevronDown className={`transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} size={18} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
