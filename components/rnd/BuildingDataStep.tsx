import {Building, CalendarDays, MapPin, Ruler} from 'lucide-react';
import type {RndInput, RndPropertyContext} from '@/lib/rnd/types';

export default function BuildingDataStep({
  input,
  property,
  onInputChange,
  onPropertyChange,
}: {
  input: RndInput;
  property: RndPropertyContext;
  onInputChange: (patch: Partial<RndInput>) => void;
  onPropertyChange: (patch: Partial<RndPropertyContext>) => void;
}) {
  const parsedReferenceYear = input.referenceDate ? new Date(`${input.referenceDate}T00:00:00`).getFullYear() : NaN;
  const referenceYear = Number.isInteger(parsedReferenceYear) ? parsedReferenceYear : new Date().getFullYear();
  const hasValidConstructionYear = Number.isInteger(input.constructionYear)
    && input.constructionYear >= 1500
    && input.constructionYear <= referenceYear;
  const age = hasValidConstructionYear ? referenceYear - input.constructionYear : null;

  return (
    <div>
      <div className="mx-auto mb-9 max-w-3xl text-center">
        <h3 className="text-balance font-heading text-3xl font-semibold leading-[1.06] tracking-[-0.04em] text-[var(--color-ink)] sm:text-5xl">
          Stichtag und Gebäudedaten
        </h3>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">Das Gebäudealter wird automatisch berechnet.</p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
        <Field icon={CalendarDays} label="Stichtag der Ersteinschätzung">
          <input
            type="date"
            value={input.referenceDate}
            onChange={(event) => onInputChange({referenceDate: event.target.value})}
            className="rnd-input"
          />
        </Field>
        <Field icon={Building} label="Baujahr des Gebäudes">
          <input
            type="number"
            min={1500}
            max={referenceYear}
            required
            value={input.constructionYear || ''}
            onChange={(event) => onInputChange({constructionYear: event.target.value === '' ? 0 : Number(event.target.value)})}
            className="rnd-input"
          />
        </Field>
        <Field icon={MapPin} label="Adresse - optional">
          <input
            type="text"
            value={property.address ?? ''}
            onChange={(event) => onPropertyChange({address: event.target.value})}
            placeholder="Straße, Hausnummer, PLZ, Ort"
            className="rnd-input"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field icon={Ruler} label="Fläche">
            <div className="relative">
              <input
                type="number"
                min={1}
                max={100000}
                value={property.area ?? ''}
                onChange={(event) => onPropertyChange({area: event.target.value ? Number(event.target.value) : undefined})}
                placeholder="m²"
                className="rnd-input pr-12"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">m²</span>
            </div>
          </Field>
          <Field icon={Building} label="Einheiten">
            <input
              type="number"
              min={1}
              max={1000}
              value={property.units ?? ''}
              onChange={(event) => onPropertyChange({units: event.target.value ? Number(event.target.value) : undefined})}
              placeholder="1"
              className="rnd-input"
            />
          </Field>
        </div>
      </div>

      <div className="mx-auto mt-5 flex max-w-4xl items-center justify-between rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4">
        <span className="text-sm font-semibold text-[var(--color-text-muted)]">Rechnerisches Gebäudealter</span>
        <strong className="font-heading text-xl text-[var(--color-ink)] sm:text-2xl">
          {age === null ? 'Bitte Baujahr eingeben' : `${age} Jahre`}
        </strong>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarDays;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="rounded-[1.35rem] border border-[var(--color-border)] bg-white/78 p-4 sm:p-5">
      <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
        <Icon size={17} className="text-[var(--color-accent)]" />
        {label}
      </span>
      {children}
    </label>
  );
}
