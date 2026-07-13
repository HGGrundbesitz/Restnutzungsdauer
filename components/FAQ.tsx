'use client';

import {useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ChevronDown, HelpCircle} from 'lucide-react';

const faqs = [
  {
    question: 'Wird das Gutachten vom Finanzamt anerkannt?',
    answer: 'Eine Anerkennung kann nicht garantiert werden. Wichtig ist eine nachvollziehbare, objektbezogene Herleitung. Das Gutachten wird so aufbereitet, dass die Annahmen und Bewertungslogik für die Einreichung verständlich dokumentiert sind. Die steuerliche Einordnung sollte mit Ihrer Steuerberatung erfolgen.',
  },
  {
    question: 'Welche Unterlagen muss ich beibringen?',
    answer: 'Hilfreich sind Baujahr, Grundrisse, Wohn- und Nutzflächenangaben, Kaufvertrag oder Kaufpreisaufteilung, Modernisierungsnachweise, Fotos sowie Hinweise zu Schäden oder Sanierungsstau. Für den ersten Check müssen nicht alle Dokumente sofort vorliegen.',
  },
  {
    question: 'Brauche ich eine Vor-Ort-Besichtigung?',
    answer: 'Ja. Um ein fundiertes Gutachten zu erstellen, ist eine Vor-Ort-Besichtigung nötig. Die digitale Ersteinschätzung und Ihre Unterlagen helfen uns, den Termin gezielt vorzubereiten.',
  },
  {
    question: 'Für wen lohnt sich ein Restnutzungsdauer-Gutachten eher nicht?',
    answer: 'Eher ungeeignet kann es bei sehr jungen Gebäuden, frisch kernsanierten Objekten, selbstgenutzten Immobilien oder geringem Gebäudeanteil sein. Genau deshalb startet der Prozess mit einer unverbindlichen Ersteinschätzung.',
  },
  {
    question: 'Kann ich das Gutachten rückwirkend nutzen?',
    answer: 'Das hängt vom Einzelfall und den offenen Steuerjahren ab. Bitte stimmen Sie eine rückwirkende Nutzung immer mit Ihrer Steuerberatung ab.',
  },
  {
    question: 'Ist das Steuerberatung?',
    answer: 'Nein. Das Gutachten bezieht sich auf die Restnutzungsdauer und die technische bzw. bewertungsbezogene Herleitung. Steuerliche Entscheidungen und Einreichung sollten über Ihre Steuerberatung begleitet werden.',
  },
  {
    question: 'Wie wirkt sich eine höhere AfA auf meinen Cashflow aus?',
    answer: 'Eine kürzere begründbare Restnutzungsdauer kann die jährliche Abschreibung erhöhen. Dadurch kann sich die steuerliche Belastung reduzieren. Der konkrete Effekt hängt von Ihrem Einzelfall ab.',
  },
  {
    question: 'Was kostet ein Restnutzungsdauer-Gutachten?',
    answer: 'Die Kosten hängen von Objektart, Unterlagenlage und Umfang der Prüfung ab. Nach der Ersteinschätzung erhalten Sie ein klares Angebot, bevor ein Auftrag startet.',
  },
  {
    question: 'Wie schnell bekomme ich eine Einschätzung?',
    answer: 'Der digitale Schnellcheck ist in wenigen Minuten ausgefüllt. Die Dauer eines vollständigen Gutachtens hängt anschließend vom Objekt, Rückfragen und der Vollständigkeit der Unterlagen ab.',
  },
];

const INITIAL_VISIBLE_COUNT = 5;

export default function FAQ({embedded = false}: {embedded?: boolean}) {
  const [openIndex, setOpenIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const visibleFaqs = useMemo(() => (showAll ? faqs : faqs.slice(0, INITIAL_VISIBLE_COUNT)), [showAll]);

  return (
    <section id="faq" className={embedded ? 'relative z-10 scroll-mt-32 overflow-hidden rounded-[2.2rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.76)] p-4 shadow-[0_36px_90px_-52px_rgba(15,23,42,0.3)] backdrop-blur-2xl sm:p-6' : 'relative z-10 mx-auto max-w-[1180px] scroll-mt-32 overflow-hidden px-4 py-20 sm:px-6 md:py-28'}>
      <div className="pointer-events-none absolute inset-x-4 top-10 -z-10 h-[420px] rounded-[3rem] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.10),transparent_62%)]" />
      <motion.div initial={{opacity: 0, y: 22}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: '-100px'}} transition={{duration: 0.7, ease: [0.16, 1, 0.3, 1]}} className={embedded ? 'mb-7 text-left' : 'mb-10 text-center'}>
        <div className="section-eyebrow mb-6"><span className="h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_0_6px_var(--color-accent-soft)]" />FAQ</div>
        <h2 className={`editorial-title text-4xl leading-[1.02] text-[var(--color-ink)] sm:text-5xl ${embedded ? '' : 'lg:text-6xl'}`}>Sie haben Fragen? Wir haben Antworten!</h2>
      </motion.div>
      <div className={embedded ? 'rounded-[1.7rem] border border-[var(--color-border)] bg-white/72 p-3' : 'rounded-[2rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.74)] p-3 shadow-[var(--shadow-lift)] backdrop-blur-2xl sm:p-4 md:rounded-[2.4rem] md:p-5'}>
        <div className="mb-3 flex items-center justify-center gap-3 px-2 py-2 text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)] sm:px-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]"><HelpCircle size={19} /></span>Antworten</div>
        <motion.div layout className="space-y-3">
          <AnimatePresence initial={false}>
            {visibleFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const answerId = `faq-answer-${index}`;
              return (
                <motion.article layout key={faq.question} initial={{opacity: 0, y: 18, scale: 0.985}} animate={{opacity: 1, y: 0, scale: 1}} exit={{opacity: 0, y: -12, scale: 0.985}} transition={{duration: 0.34, delay: index * 0.035, ease: [0.16, 1, 0.3, 1]}} className={`group overflow-hidden rounded-[1.35rem] border transition-all duration-300 sm:rounded-[1.55rem] ${isOpen ? 'border-[rgba(37,99,235,0.26)] bg-white shadow-[0_24px_60px_-38px_rgba(37,99,235,0.4)]' : 'border-[var(--color-border)] bg-[rgba(255,255,255,0.86)] shadow-[0_16px_48px_-44px_rgba(15,23,42,0.24)] hover:-translate-y-1 hover:border-[var(--color-border-strong)] hover:bg-white hover:shadow-[0_22px_58px_-42px_rgba(15,23,42,0.26)]'}`}>
                  <button type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setOpenIndex(isOpen ? -1 : index)} className="flex w-full min-w-0 items-center gap-4 px-4 py-5 text-left sm:px-6 sm:py-6">
                    <span className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold transition-all duration-300 sm:flex ${isOpen ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] group-hover:scale-105'}`}>{String(index + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1 text-balance text-[1.05rem] font-semibold leading-6 tracking-[-0.02em] text-[var(--color-ink)] sm:text-xl sm:leading-7 lg:text-[1.28rem] lg:leading-8">{faq.question}</span>
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-ink)] transition-all duration-300 ${isOpen ? 'rotate-180 shadow-sm' : 'group-hover:-translate-y-0.5 group-hover:border-[var(--color-border-strong)]'}`}><ChevronDown size={18} /></span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? <motion.div id={answerId} key="answer" initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}} exit={{height: 0, opacity: 0}} transition={{duration: 0.32, ease: [0.16, 1, 0.3, 1]}} className="overflow-hidden"><div className="px-4 pb-6 sm:pl-[5.75rem] sm:pr-8"><p className="max-w-3xl text-[0.98rem] font-medium leading-8 text-[var(--color-text-muted)] sm:text-base">{faq.answer}</p></div></motion.div> : null}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
        {faqs.length > INITIAL_VISIBLE_COUNT ? <div className="mt-5 flex justify-center"><button type="button" onClick={() => setShowAll((current) => !current)} className="inline-flex items-center justify-center gap-3 rounded-full border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-bold text-[var(--color-ink)] shadow-[0_18px_42px_-34px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-border-strong)] hover:shadow-[0_24px_50px_-36px_rgba(15,23,42,0.32)]">{showAll ? 'Weniger anzeigen' : 'Mehr Fragen anzeigen'}<ChevronDown className={`transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} size={18} /></button></div> : null}
      </div>
    </section>
  );
}
