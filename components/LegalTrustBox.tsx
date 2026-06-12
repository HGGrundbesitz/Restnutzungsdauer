'use client';

import {BookOpenCheck, Landmark, Scale, ShieldCheck} from 'lucide-react';
import {motion} from 'motion/react';

const legalPoints = [
  {
    icon: Scale,
    title: 'Gesetzliche Grundlage',
    copy: '§ 7 Abs. 4 Satz 2 EStG ermöglicht im Einzelfall den Nachweis einer kürzeren tatsächlichen Nutzungsdauer.',
  },
  {
    icon: BookOpenCheck,
    title: 'Rechtsprechung berücksichtigt',
    copy: 'Die Herleitung orientiert sich an einschlägiger BFH-Rechtsprechung zur geeigneten Nachweisführung im Einzelfall.',
  },
  {
    icon: Landmark,
    title: 'Objektbezogene Methodik',
    copy: 'Entscheidend bleibt eine nachvollziehbare Begründung anhand Gebäudezustand, Unterlagen, Modernisierungen und Schäden.',
  },
];

export default function LegalTrustBox() {
  return (
    <section id="rechtsgrundlage" className="section-shell scroll-mt-32 py-16 md:py-24">
      <motion.div initial={{opacity: 0, y: 22}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: '-100px'}} transition={{duration: 0.8}} className="overflow-hidden rounded-[2.2rem] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(24,36,58,0.96))] p-6 text-white shadow-[0_34px_90px_-45px_rgba(15,23,42,0.45)] sm:p-8 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.45fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/72">
              <ShieldCheck size={14} className="text-blue-200" />
              Rechtsgrundlage
            </div>
            <h2 className="mt-6 font-heading text-3xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-4xl md:text-5xl">
              Nachvollziehbar vorbereitet, nicht pauschal versprochen.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/68 md:text-lg">
              Unsere Gutachten werden objektbezogen hergeleitet und für die Einreichung beim Finanzamt nachvollziehbar aufbereitet. Die finale steuerliche Einordnung erfolgt mit Ihrer Steuerberatung.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {legalPoints.map((point, index) => (
              <motion.article key={point.title} initial={{opacity: 0, x: 18}} whileInView={{opacity: 1, x: 0}} viewport={{once: true, margin: '-80px'}} transition={{duration: 0.62, delay: index * 0.08}} className="rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                  <point.icon size={20} />
                </div>
                <h3 className="font-heading text-lg font-semibold tracking-[-0.02em] text-white">{point.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/64">{point.copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}