import {Building2, HelpCircle, House, Store} from 'lucide-react';
import {ADDITIONAL_BUILDING_TYPES, COMMON_BUILDING_TYPES} from '@/lib/rnd/gnd-table';
import type {BuildingTypeCode} from '@/lib/rnd/types';

const COMMON_ICONS = [House, Building2, Store];

export default function BuildingTypeStep({
  value,
  onChange,
}: {
  value: BuildingTypeCode | '';
  onChange: (value: BuildingTypeCode) => void;
}) {
  const additionalValue = ADDITIONAL_BUILDING_TYPES.some((type) => type.code === value) ? value : '';

  return (
    <div>
      <StepHeading
        title="Welche Art von Gebäude möchten Sie prüfen?"
        copy="Wählen Sie die Nutzung, die das Gebäude als Ganzes am besten beschreibt."
      />

      <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
        {COMMON_BUILDING_TYPES.map((type, index) => {
          const Icon = COMMON_ICONS[index];
          const active = value === type.code;

          return (
            <button
              key={type.code}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(type.code)}
              className={`group flex min-h-44 flex-col items-center justify-center rounded-[1.5rem] border px-5 py-6 text-center transition duration-300 ${
                active
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] shadow-[0_24px_60px_-42px_rgba(37,99,235,0.5)]'
                  : 'border-[var(--color-border)] bg-white/82 hover:-translate-y-1 hover:border-[var(--color-border-strong)] hover:bg-white'
              }`}
            >
              <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--color-accent)] shadow-sm transition group-hover:-translate-y-1">
                <Icon size={27} strokeWidth={1.8} />
              </span>
              <span className="text-balance font-heading text-lg font-semibold leading-6 text-[var(--color-ink)]">
                {type.shortLabel}
              </span>
              <span className="mt-2 text-xs font-semibold text-[var(--color-text-muted)]">GND {type.gndYears} Jahre</span>
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-5 max-w-4xl rounded-[1.35rem] border border-[var(--color-border)] bg-white/76 p-4 sm:p-5">
        <label htmlFor="additional-building-type" className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
          <HelpCircle size={17} className="text-[var(--color-accent)]" />
          Andere oder nicht eindeutige Gebäudeart
        </label>
        <select
          id="additional-building-type"
          value={additionalValue}
          onChange={(event) => onChange(event.target.value as BuildingTypeCode)}
          className="h-14 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-soft)]"
        >
          <option value="">Bitte auswählen</option>
          {ADDITIONAL_BUILDING_TYPES.map((type) => (
            <option key={type.code} value={type.code}>
              {type.label}{type.gndYears ? ` - GND ${type.gndYears} Jahre` : ''}
            </option>
          ))}
        </select>
        <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)]">
          Nichtwohngebäude und unklare Objektarten werden vor einer Einordnung manuell geprüft.
        </p>
      </div>
    </div>
  );
}

function StepHeading({title, copy}: {title: string; copy: string}) {
  return (
    <div className="mx-auto mb-9 max-w-4xl text-center">
      <h3 className="text-balance font-heading text-3xl font-semibold leading-[1.06] tracking-[-0.04em] text-[var(--color-ink)] sm:text-4xl lg:text-5xl">
        {title}
      </h3>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--color-text-muted)]">{copy}</p>
    </div>
  );
}
