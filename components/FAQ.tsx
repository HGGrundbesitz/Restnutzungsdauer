'use client';

import {motion} from 'motion/react';

const faqs = [
  {
    question: 'Was ist ein Restnutzungsdauer-Gutachten?',
    answer:
      'Ein Gutachten, das die tatsächliche verbleibende Nutzungsdauer Ihrer Immobilie ermittelt, statt pauschal 50 Jahre anzusetzen. Dadurch kann sich die jährliche Abschreibung oft deutlich erhöhen.',
  },
  {
    question: 'Für wen lohnt sich ein Gutachten?',
    answer:
      'Für private und gewerbliche Immobilienbesitzer, deren Gebäude älter sind oder eine kürzere tatsächliche Nutzungsdauer aufweisen, als gesetzlich unterstellt wird.',
  },
  {
    question: 'Welche Unterlagen werden benötigt?',
    answer:
      'Meist reichen im ersten Schritt grundlegende Objektdaten, ein aktueller Grundbuchauszug und Objektfotos. Weitere Unterlagen besprechen wir bei Bedarf individuell.',
  },
  {
    question: 'Wie erhalte ich das fertige Gutachten?',
    answer:
      'Nach Abschluss der Prüfung erhalten Sie Ihr Gutachten digital und können es strukturiert in Ihren steuerlichen Prozess übernehmen.',
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
          Häufig gestellte Fragen
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


