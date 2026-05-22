import {ArrowRight, CheckCircle2} from 'lucide-react';
import {motion} from 'motion/react';

const trustNotes = ['Digital', 'Diskret', 'Anerkannt'];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100svh-1rem)] w-full max-w-full items-center justify-center overflow-hidden px-4 pb-16 pt-32 sm:px-8 md:pb-20 md:pt-36 xl:px-12"
    >
      <motion.div
        aria-hidden="true"
        initial={{scale: 1.04, opacity: 0}}
        animate={{scale: 1, opacity: 1}}
        transition={{duration: 1.4, ease: [0.16, 1, 0.3, 1]}}
        className="absolute inset-0 bg-[url('/foto.png')] bg-cover bg-[64%_center] sm:bg-[62%_center] lg:bg-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.93)_0%,rgba(255,255,255,0.80)_48%,rgba(255,255,255,0.98)_100%),linear-gradient(90deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.84)_42%,rgba(255,255,255,0.62)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(37,99,235,0.13),transparent_46%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[var(--color-bg)] via-[rgba(255,255,255,0.88)] to-transparent" />
      <motion.div
        aria-hidden="true"
        animate={{y: [0, -12, 0], opacity: [0.3, 0.46, 0.3]}}
        transition={{duration: 8, repeat: Infinity, ease: 'easeInOut'}}
        className="absolute right-[8%] top-[22%] hidden h-44 w-44 rounded-full border border-[rgba(37,99,235,0.14)] bg-[rgba(255,255,255,0.25)] backdrop-blur-sm lg:block"
      />

      <div className="relative z-10 mx-auto flex min-w-0 w-full max-w-full flex-col items-center text-center sm:max-w-[1040px]">
        <motion.div
          initial={{opacity: 0, y: 18}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.7, ease: [0.16, 1, 0.3, 1]}}
          className="section-eyebrow mb-7 max-w-full flex-wrap justify-center text-center leading-5 shadow-[0_18px_46px_-36px_rgba(15,23,42,0.32)]"
        >
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_0_6px_var(--color-accent-soft)]" />
          Bundesweit & Finanzamtskonform
        </motion.div>

        <motion.h1
          initial={{opacity: 0, y: 24}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1]}}
          className="display-title max-w-full !text-[clamp(2.15rem,8vw,5.55rem)] leading-[0.96] drop-shadow-[0_18px_48px_rgba(255,255,255,0.82)] sm:!text-[clamp(3rem,6.4vw,5.65rem)]"
        >
          <span className="block">Restnutzungsdauergutachten</span>
          <span className="block bg-[linear-gradient(90deg,#1d4ed8,#2563eb,#0f172a)] bg-clip-text text-transparent">
            digital und zertifiziert
          </span>
        </motion.h1>

        <motion.p
          initial={{opacity: 0, y: 18}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.72, delay: 0.18, ease: [0.16, 1, 0.3, 1]}}
          className="mx-auto mt-6 w-full max-w-[52rem] px-1 text-base font-semibold leading-8 text-[#435064] md:text-lg"
        >
          Wir helfen Ihnen, die tatsächliche Restnutzungsdauer Ihrer Immobilie nachzuweisen – und damit mehr aus Ihrer jährlichen Abschreibung herauszuholen.
        </motion.p>

        <motion.div
          initial={{opacity: 0, y: 18}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.72, delay: 0.28, ease: [0.16, 1, 0.3, 1]}}
          className="mt-9 flex w-full max-w-full flex-col justify-center gap-4 sm:w-auto sm:max-w-none sm:flex-row sm:items-center"
        >
          <a href="#anfrage" className="cta-btn w-full max-w-full text-center text-sm font-semibold tracking-[0.06em] sm:w-auto">
            Jetzt Gutachten anfragen
          </a>
          <a
            href="#prozess"
            className="theme-panel inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[var(--color-ink)] shadow-[0_14px_32px_-24px_rgba(17,23,35,0.28)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--color-surface-strong)] sm:w-auto"
          >
            Prozess ansehen
            <ArrowRight size={16} className="text-[var(--color-accent)]" />
          </a>
        </motion.div>

        <motion.div
          initial={{opacity: 0, y: 16}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.72, delay: 0.38, ease: [0.16, 1, 0.3, 1]}}
          className="mt-8 flex flex-col items-center justify-center gap-3 text-sm font-semibold text-[#506176] sm:flex-row sm:flex-wrap"
        >
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
        </motion.div>
      </div>
    </section>
  );
}