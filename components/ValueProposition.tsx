'use client';

import {BadgeCheck, Banknote, ClipboardCheck, Landmark} from 'lucide-react';
import {motion} from 'motion/react';

const benefits = [
  {
    icon: Banknote,
    title: 'Raus aus der pauschalen Betrachtung',
    copy: 'Statt nur mit pauschalen Annahmen zu arbeiten, wird der tatsächliche Gebäudezustand strukturiert dokumentiert und fachlich eingeordnet.',
  },
  {
    icon: Landmark,
    title: 'Objektbezogene Methodik',
    copy: 'Die Herleitung stützt sich auf nachvollziehbare Bewertungsgrundlagen, vorhandene Unterlagen, Modernisierungen und erkennbare Zustandsmerkmale.',
  },
];

export default function ValueProposition() {
  return (
    <section id="vorteile" className="section-shell pb-24 pt-16 md:pb-32 md:pt-20">
      <motion.div initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: '-100px'}} transition={{duration: 0.8}} className="mb-14 text-center">
        <div className="section-eyebrow mb-6">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          Vorteile
        </div>
        <h2 className="section-title mx-auto mb-5 max-w-5xl !text-[clamp(2.4rem,5vw,4.6rem)]">Mehr Abschreibungspotenzial. Sauber hergeleitet.</h2>
        <p className="section-copy mx-auto max-w-3xl">
          Das Finanzamt arbeitet häufig mit pauschalen Nutzungsdauern. Wir prüfen, ob der tatsächliche Zustand Ihrer vermieteten Immobilie eine kürzere Restnutzungsdauer nachvollziehbar begründen kann.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        {benefits.map((benefit, index) => (
          <motion.article key={benefit.title} initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: '-100px'}} transition={{duration: 0.8, delay: index * 0.1}} className="glass-panel group rounded-[2rem] p-7 transition-all duration-700 sm:p-10">
            <div className="flex items-start justify-between gap-5">
              <div className="theme-panel-muted flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105">
                <benefit.icon size={25} className="text-[var(--color-accent)]" />
              </div>
              <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-accent)]">RND</span>
            </div>
            <h3 className="mt-8 font-heading text-3xl font-semibold tracking-tight text-[var(--color-primary)] md:text-4xl">{benefit.title}</h3>
            <p className="mt-5 text-lg leading-relaxed text-[var(--color-text-muted)]">{benefit.copy}</p>
            <div className="mt-9 rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                <span>Nachweisführung</span>
                <BadgeCheck size={18} className="text-[var(--color-accent)]" />
              </div>
              <div className="flex items-start gap-3 text-sm leading-7 text-[var(--color-text-muted)]">
                <ClipboardCheck size={18} className="mt-1 shrink-0 text-[var(--color-accent)]" />
                <span>Für Steuerberatung und Einreichung nachvollziehbar aufbereitet. Keine Steuerberatung, keine Anerkennungsgarantie.</span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}