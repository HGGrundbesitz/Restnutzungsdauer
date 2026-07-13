'use client';

import {Banknote, FilePlus, PenSquare, ShieldCheck, Video, ZoomIn} from 'lucide-react';
import {motion, useReducedMotion} from 'motion/react';

const steps = [
  {
    step: 'Schritt 01',
    title: 'Ersteinschätzung starten',
    copy: 'Übermitteln Sie uns die Basisdaten Ihrer Immobilie – schnell, unverbindlich und ohne Steuer-ID.',
    icon: PenSquare,
  },
  {
    step: 'Schritt 02',
    title: 'Unterlagen ergänzen',
    copy: 'Laden Sie vorhandene Dokumente und Fotos hoch. Fehlende Unterlagen können später nachgereicht werden.',
    icon: FilePlus,
  },
  {
    step: 'Schritt 03',
    title: 'Fachliche Prüfung',
    copy: 'Die Angaben werden geprüft, Rückfragen werden geklärt und die Restnutzungsdauer objektbezogen hergeleitet.',
    icon: ZoomIn,
  },
  {
    step: 'Schritt 04',
    title: 'Gutachten erhalten',
    copy: 'Sie erhalten ein nachvollziehbar aufbereitetes Gutachten zur Abstimmung mit Ihrer Steuerberatung und Einreichung beim Finanzamt.',
    icon: Banknote,
  },
] as const;

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="prozess" className="relative overflow-hidden border-t border-[var(--color-border)] bg-white py-24 md:py-36">
      <div aria-hidden="true" className="architectural-grid absolute inset-0 opacity-35 [mask-image:linear-gradient(180deg,transparent,black_28%,black_72%,transparent)]" />
      <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[36rem] w-[68rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(218,231,255,0.44)] blur-[120px]" />

      <div className="section-shell relative z-10">
        <motion.div initial={{opacity: 0, y: reduceMotion ? 0 : 22}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: '-100px'}} transition={{duration: reduceMotion ? 0 : 0.72}} className="mx-auto max-w-4xl text-center">
          <div className="section-eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />Prozess</div>
          <h2 className="editorial-title mt-6 text-4xl leading-[0.98] text-[var(--color-ink)] sm:text-5xl lg:text-6xl">So einfach funktioniert es</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--color-text-muted)]">Von der Anfrage bis zum fertigen Gutachten – digital vorbereitet und fachlich sauber eingeordnet.</p>
        </motion.div>

        <motion.div initial={{opacity: 0, y: reduceMotion ? 0 : 18}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: '-100px'}} transition={{duration: reduceMotion ? 0 : 0.68, delay: reduceMotion ? 0 : 0.08}} className="mx-auto mt-10 grid max-w-5xl gap-3 rounded-[1.7rem] border border-[var(--color-border)] bg-white/78 p-4 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.3)] backdrop-blur-xl md:grid-cols-2">
          <ProcessNote icon={Video} title="Digital, wenn es fachlich genügt" copy="Viele Fälle können digital vorbereitet werden, wenn Unterlagen und Fotos ausreichend aussagekräftig sind." />
          <ProcessNote icon={ShieldCheck} title="Vor Ort, wenn sinnvoll" copy="Falls Objektzustand oder Plausibilität es erfordern, wird eine Vor-Ort-Prüfung transparent empfohlen." />
        </motion.div>

        <div className="relative mx-auto mt-20 max-w-[1280px] md:mt-24">
          <div aria-hidden="true" className="absolute bottom-4 left-[1.55rem] top-4 w-px bg-[rgba(37,99,235,0.2)] md:left-[12.5%] md:right-[12.5%] md:top-[2rem] md:h-px md:w-auto">
            <motion.span initial={{scaleY: 0}} whileInView={{scaleY: 1}} viewport={{once: true}} transition={{duration: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1]}} className="block h-full w-px origin-top bg-[var(--color-accent)] md:h-px md:w-full md:origin-left md:[transform:scaleX(1)]" />
          </div>

          <div className="grid gap-9 md:grid-cols-4 md:gap-5">
            {steps.map((item, index) => (
              <motion.article key={item.title} initial={{opacity: 0, y: reduceMotion ? 0 : 20}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: '-80px'}} transition={{duration: reduceMotion ? 0 : 0.62, delay: reduceMotion ? 0 : index * 0.08}} className="group relative grid grid-cols-[3.2rem_1fr] gap-5 md:block md:text-center">
                <div className="relative z-10 flex h-13 w-13 items-center justify-center rounded-[1.15rem] border border-[rgba(37,99,235,0.2)] bg-white text-[var(--color-accent)] shadow-[0_16px_40px_-26px_rgba(37,99,235,0.42)] transition duration-300 group-hover:-translate-y-1 group-hover:border-[rgba(37,99,235,0.4)] md:mx-auto md:h-16 md:w-16 md:rounded-[1.35rem]">
                  <item.icon size={22} />
                </div>
                <div className="pt-1 md:pt-7">
                  <div className="text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-[var(--color-accent)]">{item.step}</div>
                  <h3 className="mt-3 font-heading text-xl font-semibold leading-tight text-[var(--color-ink)]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">{item.copy}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessNote({icon: Icon, title, copy}: {icon: typeof Video; title: string; copy: string}) {
  return (
    <div className="flex items-start gap-4 rounded-[1.25rem] p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]"><Icon size={20} /></span>
      <div><h3 className="font-heading text-base font-semibold text-[var(--color-ink)]">{title}</h3><p className="mt-1.5 text-sm leading-6 text-[var(--color-text-muted)]">{copy}</p></div>
    </div>
  );
}
