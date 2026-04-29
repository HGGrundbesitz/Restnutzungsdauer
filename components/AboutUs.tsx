'use client';

import {motion} from 'motion/react';
import {Award, CheckCircle, Users, BookOpen} from 'lucide-react';

export default function AboutUs() {
  return (
    <section className="relative overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-bg)] py-24 md:py-32">
      <div className="section-shell relative z-10">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{opacity: 0, x: -30}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true, margin: '-100px'}}
            transition={{duration: 0.8}}
            className="flex flex-col"
          >
            <div className="section-eyebrow mb-6 w-fit">
              <Users size={12} className="text-[var(--color-accent)]" />
              Über uns
            </div>

            <h2 className="font-heading text-4xl leading-[1.08] tracking-tight text-[var(--color-ink)] md:text-5xl">
              Fachliche Tiefe trifft auf einen ruhigen digitalen Ablauf
            </h2>

            <p className="mb-8 mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
              Wir verbinden bautechnische Bewertung, steuerliches Verständnis und ein klares digitales Erlebnis.
              So entsteht ein Ergebnis, das nicht nur formal passt, sondern für Eigentümer auch angenehm durch den Prozess führt.
            </p>

            <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-4">
                <div className="theme-panel flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Award size={18} className="text-[var(--color-accent)]" />
                </div>
                <div>
                  <h4 className="mb-1 font-heading font-medium text-[var(--color-ink)]">Zertifiziert</h4>
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">Anerkannte Sachverständige für Immobilienbewertung.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="theme-panel flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <BookOpen size={18} className="text-[var(--color-accent)]" />
                </div>
                <div>
                  <h4 className="mb-1 font-heading font-medium text-[var(--color-ink)]">Erfahren</h4>
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">Über 15 Jahre Erfahrung in der Immobilienwirtschaft.</p>
                </div>
              </div>
            </div>

            <a href="#anfrage" className="cta-btn w-fit text-center text-sm font-medium tracking-wide">
              Jetzt Gutachten anfragen
            </a>
          </motion.div>

          <motion.div
            initial={{opacity: 0, x: 30}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true, margin: '-100px'}}
            transition={{duration: 0.8, delay: 0.2}}
            className="group relative h-[520px] overflow-hidden rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-bg-alt)] shadow-2xl md:h-[600px]"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-90 transition-transform duration-1000 group-hover:scale-105"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent"></div>

            <div className="glass-panel absolute bottom-10 left-6 right-6 rounded-2xl p-6 backdrop-blur-xl md:left-10 md:right-10">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-heading text-lg font-medium text-white">Finanzamtsnah dokumentiert</h4>
                  <p className="text-sm text-white/72">Nach klaren Richtlinien erstellt und digital sauber ausgeliefert</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

