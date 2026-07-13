'use client';

import {Award, CheckCircle, ClipboardCheck, MapPinned} from 'lucide-react';
import {motion} from 'motion/react';

const inspectorImage = '/rnd/why-us-house.png';

const reasons = [
  'Erfahrung. Wir kennen die typischen Rückfragen rund um Restnutzungsdauer-Gutachten und bereiten die Unterlagen strukturiert auf.',
  'Methodik. Im Mittelpunkt steht eine nachvollziehbare, objektbezogene Herleitung statt pauschaler Behauptungen.',
  'Klarheit. Der Prozess bleibt einfach: digital vorbereitet, transparent erklärt und bundesweit nutzbar.',
];

export default function AboutUs() {
  return (
    <section id="warum-wir" className="relative overflow-hidden border-t border-[var(--color-border)] bg-white py-24 md:py-32">
      <div aria-hidden="true" className="absolute -right-40 top-12 h-[34rem] w-[34rem] rounded-full bg-[rgba(37,99,235,0.1)] blur-[110px]" />
      <div className="section-shell relative z-10">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:gap-16">
          <motion.div initial={{opacity: 0, x: 30}} whileInView={{opacity: 1, x: 0}} viewport={{once: true, margin: '-100px'}} transition={{duration: 0.8}} className="order-2 flex flex-col lg:order-2">
            <div className="section-eyebrow mb-6 w-fit"><Award size={12} className="text-[var(--color-accent)]" />Vertrauen</div>
            <h2 className="editorial-title text-4xl leading-[1.02] text-[var(--color-ink)] md:text-5xl lg:text-6xl">Warum wir die richtigen sind:</h2>
            <div className="mt-8 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {reasons.map((reason) => (
                <div key={reason} className="group flex items-start gap-4 py-5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]"><CheckCircle size={18} /></span>
                  <p className="text-base font-semibold leading-7 text-[var(--color-text-muted)] transition-colors duration-300 group-hover:text-[var(--color-ink)]">{reason}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5 text-sm leading-7 text-[var(--color-text-muted)]">TODO vor Launch: echte Qualifikation, verantwortliche Person und freigegebene Nachweise der Firma ergänzen.</div>
            <a href="#ersteinschaetzung" className="cta-btn mt-9 w-fit text-center text-sm font-semibold tracking-[0.06em]">Ersteinschätzung starten</a>
          </motion.div>

          <motion.div initial={{opacity: 0, clipPath: 'inset(12% 0 0 0 round 2.2rem)'}} whileInView={{opacity: 1, clipPath: 'inset(0% 0 0 0 round 2.2rem)'}} viewport={{once: true, margin: '-100px'}} transition={{duration: 0.9, ease: [0.22, 1, 0.36, 1]}} className="group order-1 relative min-h-[430px] overflow-hidden rounded-[2.2rem] border border-[var(--color-border)] bg-[var(--color-bg-alt)] shadow-[0_42px_100px_-50px_rgba(7,20,45,0.55)] md:min-h-[570px] lg:order-1">
            <div className="absolute inset-0 bg-cover bg-center opacity-95 transition-transform duration-1000 group-hover:scale-105" style={{backgroundImage: `url(${inspectorImage})`}} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/82 via-[#0f172a]/20 to-white/5" />
            <div className="absolute bottom-6 left-5 right-5 rounded-[1.4rem] border border-white/15 bg-[rgba(15,23,42,0.88)] p-5 shadow-[0_28px_70px_-34px_rgba(15,23,42,0.9)] backdrop-blur-xl md:bottom-10 md:left-10 md:right-10 md:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md"><ClipboardCheck size={24} className="text-white" /></div>
                <div><h4 className="font-heading text-lg font-semibold text-white">Persönlich begleitet</h4><p className="text-sm leading-6 text-white/88">Unsere Sachverständigen helfen Ihnen in allen Belangen rund um das Thema Restnutzungsdauer.</p></div>
              </div>
            </div>
            <div className="theme-panel absolute right-5 top-5 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-ink)] md:right-8 md:top-8"><MapPinned size={15} className="text-[var(--color-accent)]" />Bundesweit</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
