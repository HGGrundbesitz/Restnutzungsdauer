'use client';

import {motion} from 'motion/react';

const faqs = [
  {
    question: 'Was ist ein Restnutzungsdauer-Gutachten?',
    answer:
      'Ein Gutachten, das die tatsaechliche verbleibende Nutzungsdauer Ihrer Immobilie ermittelt, statt pauschal 50 Jahre anzusetzen. Dadurch kann sich die jaehrliche Abschreibung oft deutlich erhoehen.',
  },
  {
    question: 'Fuer wen lohnt sich ein Gutachten?',
    answer:
      'Fuer private und gewerbliche Immobilienbesitzer, deren Gebaeude aelter sind oder eine kuerzere tatsaechliche Nutzungsdauer aufweisen, als gesetzlich unterstellt wird.',
  },
  {
    question: 'Welche Unterlagen werden benoetigt?',
    answer:
      'Meist reichen im ersten Schritt grundlegende Objektdaten, ein aktueller Grundbuchauszug und Objektfotos. Weitere Unterlagen besprechen wir bei Bedarf individuell.',
  },
  {
    question: 'Wie erhalte ich das fertige Gutachten?',
    answer:
      'Nach Abschluss der Pruefung erhalten Sie Ihr Gutachten digital und koennen es strukturiert in Ihren steuerlichen Prozess uebernehmen.',
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="relative z-10 mx-auto max-w-[1200px] border-t border-[var(--color-border)] px-6 py-24">
      <motion.div
        initial={{opacity: 0, y: 20}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true, margin: '-100px'}}
        transition={{duration: 0.8}}
        className="mb-16 text-center"
      >
        <h2 className="mb-4 font-heading text-3xl font-semibold tracking-tight text-[var(--color-ink)] md:text-4xl">
          Haeufig gestellte Fragen
        </h2>
        <p className="mx-auto max-w-2xl text-lg font-light text-[var(--color-text-muted)]">
          Antworten auf die wichtigsten Fragen rund um das RND-Gutachten.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.question}
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, margin: '-100px'}}
            transition={{duration: 0.8, delay: index % 2 === 1 ? 0.1 : 0}}
            className="glass-panel rounded-3xl p-8"
          >
            <h4 className="mb-3 font-heading text-lg font-medium tracking-tight text-[var(--color-ink)]">
              {faq.question}
            </h4>
            <p className="text-sm font-light leading-relaxed text-[var(--color-text-muted)]">{faq.answer}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
