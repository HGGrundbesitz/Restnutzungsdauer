'use client';

import {Award, CheckCircle, ClipboardCheck, MapPinned} from 'lucide-react';
import {motion} from 'motion/react';

const inspectorImage = '/bild1.png';

const reasons = [
  'Erfahrung. Wir wissen seit über 15 Jahren, worauf Finanzämter bei Restnutzungsdauer-Gutachten achten.',
  'Methodik. Wir stehen für Gutachten, die einer Prüfung standhalten – fachlich und inhaltlich.',
  'Klarheit. Wir machen den Prozess einfach: zertifiziert, digital, bundesweit.',
];

export default function AboutUs() {
  return (
    <section id="warum-wir" className="relative overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-bg)] py-24 md:py-32">
      <div className="section-shell relative z-10">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{opacity: 0, x: -30}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true, margin: '-100px'}}
            transition={{duration: 0.8}}
            className="flex flex-col"
          >
            <div className="section-eyebrow mb-6 w-fit">
              <Award size={12} className="text-[var(--color-accent)]" />
              Vertrauen
            </div>

            <h2 className="font-heading text-4xl leading-[1.02] tracking-tight text-[var(--color-ink)] md:text-5xl">
              Warum wir die richtigen sind:
            </h2>

            <div className="mt-8 space-y-4">
              {reasons.map((reason) => (
                <div key={reason} className="theme-panel flex items-start gap-4 rounded-[1.4rem] p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.28)]">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                    <CheckCircle size={18} />
                  </span>
                  <p className="text-base font-semibold leading-7 text-[var(--color-text-muted)]">
                    {reason}
                  </p>
                </div>
              ))}
            </div>

            <a href="#ersteinschaetzung" className="cta-btn mt-9 w-fit text-center text-sm font-semibold tracking-[0.06em]">
              Ersteinschätzung starten
            </a>
          </motion.div>

          <motion.div
            initial={{opacity: 0, x: 30}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true, margin: '-100px'}}
            transition={{duration: 0.8, delay: 0.2}}
            className="group relative min-h-[460px] overflow-hidden rounded-[2.2rem] border border-[var(--color-border)] bg-[var(--color-bg-alt)] shadow-2xl md:min-h-[560px]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-95 transition-transform duration-1000 group-hover:scale-105"
              style={{backgroundImage: `url(${inspectorImage})`}}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/82 via-[#0f172a]/20 to-white/5" />

            <div className="glass-panel absolute bottom-6 left-5 right-5 rounded-2xl p-5 backdrop-blur-xl md:bottom-10 md:left-10 md:right-10 md:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                  <ClipboardCheck size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-heading text-lg font-semibold text-white">Professionelle Prüfung vor Ort</h4>
                  <p className="text-sm leading-6 text-white/74">Bildplatzhalter für Sachverständige mit Haus und Tablet</p>
                </div>
              </div>
            </div>

            <div className="theme-panel absolute right-5 top-5 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-ink)] md:right-8 md:top-8">
              <MapPinned size={15} className="text-[var(--color-accent)]" />
              Bundesweit
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}