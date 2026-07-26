import {CalendarDays} from 'lucide-react';
import type {FormEvent, KeyboardEvent} from 'react';

export default function ConstructionYearStep({
  value,
  referenceYear,
  onChange,
  onContinue,
}: {
  value: number | '';
  referenceYear: number;
  onChange: (value: number | '') => void;
  onContinue: (value: number | '') => void;
}) {
  const continueWithValue = (rawValue: string) => {
    onContinue(rawValue === '' ? '' : Number(rawValue));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submittedValue = new FormData(event.currentTarget).get('constructionYear');
    continueWithValue(typeof submittedValue === 'string' ? submittedValue : '');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    continueWithValue(event.currentTarget.value);
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <CalendarDays size={30} strokeWidth={1.8} />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">Baujahr</p>
      <h3 className="mt-3 text-balance font-heading text-3xl font-semibold leading-[1.06] tracking-[-0.04em] text-[var(--color-ink)] sm:text-5xl">
        Wann wurde das Gebäude gebaut?
      </h3>
      <p className="mt-4 text-base text-[var(--color-text-muted)]">Ungefähres Jahr reicht.</p>

      <div className="mx-auto mt-9 max-w-sm">
        <label htmlFor="rnd-construction-year" className="sr-only">Baujahr</label>
        <input
          id="rnd-construction-year"
          name="constructionYear"
          type="number"
          inputMode="numeric"
          min={1800}
          max={referenceYear}
          step={1}
          required
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
          onKeyDown={handleKeyDown}
          placeholder="z. B. 1975"
          className="rnd-year-input"
        />
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">Zulässig: 1800 bis {referenceYear}</p>
      </div>

      <button type="submit" className="cta-btn mx-auto mt-8 min-w-48 px-7 py-4 text-sm">
        Weiter
      </button>
    </form>
  );
}
