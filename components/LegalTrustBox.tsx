'use client';

import {BookOpenCheck, ChevronDown, Landmark, Scale, ShieldCheck} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {useState} from 'react';

const legalPoints = [
  {icon: Scale, title: 'Gesetzliche Grundlage', copy: '§ 7 Abs. 4 Satz 2 EStG ermöglicht im Einzelfall den Nachweis einer kürzeren tatsächlichen Nutzungsdauer.'},
  {icon: BookOpenCheck, title: 'Nachvollziehbare Herleitung', copy: 'Gebäudezustand, Unterlagen und Modernisierungen werden objektbezogen eingeordnet.'},
  {icon: Landmark, title: 'Steuerliche Einreichung', copy: 'Die finale steuerliche Einordnung erfolgt gemeinsam mit Ihrer Steuerberatung.'},
];

export default function LegalTrustBox() {
  const [open, setOpen] = useState(false);

  return (
    <section id="rechtsgrundlage" className="section-shell scroll-mt-32 py-16 md:py-24">
      <motion.div initial={{opacity: 0, y: 22}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: '-100px'}} transition={{duration: 0.8}} className="overflow-hidden rounded-[2.2rem] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(24,36,58,0.96))] p-6 text-white shadow-[0_34px_90px_-45px_rgba(15,23,42,0.45)] sm:p-8 md:p-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/68"><ShieldCheck size={15} className="text-blue-200" />Rechtsgrundlage</div>
          <h2 className="mt-5 font-heading text-3xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-4xl md:text-5xl">Nachvollziehbar vorbereitet.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/70">Objektbezogene Herleitung für die weitere fachliche und steuerliche Prüfung.</p>
          <button type="button" aria-expanded={open} aria-controls="legal-details" onClick={() => setOpen((current) => !current)} className="mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15">Mehr Infos<ChevronDown size={17} className={`transition-transform ${open ? 'rotate-180' : ''}`} /></button>
        </div>
        <AnimatePresence initial={false}>
          {open ? <motion.div id="legal-details" initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}} exit={{height: 0, opacity: 0}} transition={{duration: 0.38, ease: [0.16, 1, 0.3, 1]}} className="overflow-hidden"><div className="mt-8 grid gap-4 md:grid-cols-3">{legalPoints.map((point) => <article key={point.title} className="rounded-[1.3rem] border border-white/10 bg-white/[0.06] p-5 text-left"><point.icon size={20} className="text-blue-200" /><h3 className="mt-4 font-heading text-lg font-semibold text-white">{point.title}</h3><p className="mt-3 text-sm leading-7 text-white/64">{point.copy}</p></article>)}</div></motion.div> : null}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
