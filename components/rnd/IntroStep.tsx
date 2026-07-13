import {ArrowRight, Calculator, CheckCircle2} from 'lucide-react';

const notes = ['Kostenlose Ersteinschätzung', 'Keine Beauftragung', 'Ergebnis unter fachlichem Vorbehalt'];

export default function IntroStep({onStart}: {onStart: () => void}) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          <Calculator size={20} strokeWidth={1.8} />
        </div>
        <h3 className="editorial-title max-w-2xl text-balance text-[1.8rem] leading-[1.02] text-[var(--color-ink)] sm:text-[2rem] lg:text-[2.35rem]">
          Kostenlose Ersteinschätzung der Restnutzungsdauer
        </h3>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {notes.map((note) => (
          <div
            key={note}
            className="group flex min-h-20 items-center gap-3 rounded-[1.2rem] border border-[rgba(15,23,42,0.08)] bg-white/72 p-4 text-left text-xs font-semibold leading-5 text-[var(--color-text-muted)] shadow-[0_20px_50px_-38px_rgba(15,23,42,0.25)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[rgba(37,99,235,0.2)] sm:min-h-24 sm:flex-col sm:items-start sm:justify-between"
          >
            <CheckCircle2
              size={17}
              className="shrink-0 text-[var(--color-accent)] transition-transform duration-300 group-hover:translate-x-0.5"
            />
            {note}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col items-center text-center">
        <p className="max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
          Ermitteln Sie in wenigen Schritten eine rechnerische Orientierung nach dem ImmoWertV-Modell.
        </p>
        <p className="mt-2 max-w-3xl text-[0.68rem] leading-5 text-[var(--color-text-muted)]">
          Die Berechnung ersetzt weder ein Gutachten noch eine sachverständige Einzelfallprüfung oder Steuerberatung.
        </p>
        <button type="button" onClick={onStart} className="premium-focus cta-btn mt-5 gap-3 px-6 py-3 text-sm">
          Berechnung starten
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
