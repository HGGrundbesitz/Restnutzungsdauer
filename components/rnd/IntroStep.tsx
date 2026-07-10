import {ArrowRight, Calculator, CheckCircle2} from 'lucide-react';

const notes = ['Kostenlose Ersteinschätzung', 'Keine Beauftragung', 'Ergebnis unter fachlichem Vorbehalt'];

export default function IntroStep({onStart}: {onStart: () => void}) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
      <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <Calculator size={36} strokeWidth={1.8} />
      </div>
      <h3 className="text-balance font-heading text-3xl font-semibold leading-[1.04] tracking-[-0.045em] text-[var(--color-ink)] sm:text-5xl">
        Kostenlose Ersteinschätzung der Restnutzungsdauer
      </h3>
      <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-text-muted)] sm:text-lg">
        Ermitteln Sie in wenigen Schritten eine rechnerische Orientierung nach dem ImmoWertV-Modell.
      </p>
      <button type="button" onClick={onStart} className="cta-btn mt-9 gap-3 px-7 py-4 text-sm">
        Berechnung starten
        <ArrowRight size={18} />
      </button>
      <div className="mt-9 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
        {notes.map((note) => (
          <div key={note} className="theme-panel-muted flex min-h-20 items-center gap-3 rounded-[1.2rem] px-4 py-3 text-left text-sm font-semibold leading-5 text-[var(--color-text-muted)]">
            <CheckCircle2 size={18} className="shrink-0 text-[var(--color-accent)]" />
            {note}
          </div>
        ))}
      </div>
      <p className="mt-7 max-w-3xl text-xs leading-6 text-[var(--color-text-muted)]">
        Die Berechnung ersetzt weder ein Gutachten noch eine sachverständige Einzelfallprüfung oder Steuerberatung.
      </p>
    </div>
  );
}
