import {ArrowRight, CheckCircle2} from 'lucide-react';
import {motion} from 'motion/react';

const trustNotes = [
  'Finanzamtsnah vorbereitet',
  'Verschlüsselter Upload',
  'Persönliche Rückmeldung',
];

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-1rem)] w-full max-w-full items-center justify-center overflow-hidden px-4 pb-16 pt-32 sm:px-8 md:pb-20 md:pt-36 xl:px-12">
      <motion.div
        aria-hidden="true"
        initial={{scale: 1.04, opacity: 0}}
        animate={{scale: 1, opacity: 1}}
        transition={{duration: 1.4, ease: [0.16, 1, 0.3, 1]}}
        className="absolute inset-0 bg-[url('/foto.png')] bg-cover bg-[64%_center] sm:bg-[62%_center] lg:bg-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.90)_0%,rgba(255,255,255,0.78)_52%,rgba(255,255,255,0.98)_100%),linear-gradient(90deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.82)_42%,rgba(255,255,255,0.56)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(37,99,235,0.12),transparent_46%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[var(--color-bg)] via-[rgba(255,255,255,0.86)] to-transparent" />
      <motion.div
        aria-hidden="true"
        animate={{y: [0, -12, 0], opacity: [0.34, 0.48, 0.34]}}
        transition={{duration: 8, repeat: Infinity, ease: 'easeInOut'}}
        className="absolute right-[8%] top-[22%] hidden h-44 w-44 rounded-full border border-[rgba(37,99,235,0.14)] bg-[rgba(255,255,255,0.22)] backdrop-blur-sm lg:block"
      />

      <div className="relative z-10 mx-auto flex min-w-0 w-full max-w-full flex-col items-center text-center sm:max-w-[980px]">
        <div className="section-eyebrow mb-7 max-w-full flex-wrap justify-center text-center leading-5 shadow-[0_18px_46px_-36px_rgba(15,23,42,0.32)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_0_6px_var(--color-accent-soft)]" />
          <span className="sm:hidden">Digitale Prüfung</span><span className="hidden sm:inline">Digitale Premium-Prüfung für Immobilien</span>
        </div>

        <h1 className="display-title max-w-full !text-[clamp(1.78rem,7vw,5.45rem)] leading-[0.96] drop-shadow-[0_18px_48px_rgba(255,255,255,0.82)] sm:!text-[clamp(3rem,6.6vw,5.65rem)]">
          <span className="block">Restnutzungsdauer</span>
          <span className="block">Gutachten</span>
          <span className="block bg-[linear-gradient(90deg,#1d4ed8,#2563eb,#0f172a)] bg-clip-text text-transparent sm:inline">
            digital &
          </span>
          <span className="block bg-[linear-gradient(90deg,#2563eb,#1d4ed8,#0f172a)] bg-clip-text text-transparent sm:inline">
            <span className="hidden sm:inline"> </span>
            nachvollziehbar.
          </span>
        </h1>

        <p className="mx-auto mt-6 w-full max-w-[48rem] px-1 text-base font-semibold leading-8 text-[#435064] md:text-lg">
          Wir strukturieren Ihre Anfrage so, dass Objektdaten, Unterlagen und Argumentation schnell prüfbar werden.
          Diskret, klar und ohne unnötiges Hin und Her.
        </p>

        <div className="mt-9 flex w-full max-w-full flex-col justify-center gap-4 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
          <a href="#schnellcheck" className="cta-btn w-full max-w-full text-center text-sm font-semibold tracking-[0.06em] sm:w-auto">
            Jetzt Gutachten anfragen
          </a>
          <a
            href="#ablauf"
            className="theme-panel inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[var(--color-ink)] shadow-[0_14px_32px_-24px_rgba(17,23,35,0.28)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--color-surface-strong)] sm:w-auto"
          >
            Prozess ansehen
            <ArrowRight size={16} className="text-[var(--color-accent)]" />
          </a>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm font-semibold text-[#506176] sm:flex-row sm:flex-wrap">
          {trustNotes.map((note) => (
            <motion.div
              key={note}
              whileHover={{y: -4, scale: 1.02}}
              transition={{duration: 0.28, ease: [0.16, 1, 0.3, 1]}}
              className="theme-panel flex items-center justify-center gap-2 rounded-full px-4 py-2.5 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.28)]"
            >
              <CheckCircle2 size={15} className="text-[var(--color-accent)]" />
              {note}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}