import {Bath, DoorOpen, Flame, House, LayoutGrid, Paintbrush, Pipette, SquareStack} from 'lucide-react';
import {FLOORPLAN_LABELS, MODERNIZATION_PERIOD_LABELS} from '@/lib/rnd/modernization-rules';
import type {FloorplanImprovement, ModernizationAnswers, ModernizationPeriod} from '@/lib/rnd/types';

const periodFields: readonly {
  key: Exclude<keyof ModernizationAnswers, 'floorplan'>;
  label: string;
  icon: typeof House;
}[] = [
  {key: 'roof', label: 'Dach mit Wärmedämmung', icon: House},
  {key: 'windows', label: 'Fenster und Außentüren', icon: DoorOpen},
  {key: 'pipes', label: 'Leitungssysteme', icon: Pipette},
  {key: 'heating', label: 'Heizungsanlage', icon: Flame},
  {key: 'exteriorWalls', label: 'Außenwanddämmung', icon: SquareStack},
  {key: 'bathrooms', label: 'Bäder', icon: Bath},
  {key: 'interior', label: 'Innenausbau', icon: Paintbrush},
];

export default function ModernizationStep({
  value,
  coreRenovation,
  onChange,
  onCoreRenovationChange,
}: {
  value: ModernizationAnswers;
  coreRenovation: boolean;
  onChange: (value: ModernizationAnswers) => void;
  onCoreRenovationChange: (value: boolean) => void;
}) {
  return (
    <div>
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <h3 className="text-balance font-heading text-3xl font-semibold leading-[1.06] tracking-[-0.04em] text-[var(--color-ink)] sm:text-5xl">Wann wurde wesentlich modernisiert?</h3>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">Wählen Sie je Bereich den passenden Zeitraum. „Nicht bekannt“ ist möglich.</p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-3 lg:grid-cols-2">
        {periodFields.map((field) => (
          <ModernizationField key={field.key} icon={field.icon} label={field.label}>
            <select
              value={value[field.key]}
              onChange={(event) => onChange({...value, [field.key]: event.target.value as ModernizationPeriod})}
              className="rnd-select"
            >
              {Object.entries(MODERNIZATION_PERIOD_LABELS).map(([optionValue, label]) => (
                <option key={optionValue} value={optionValue}>{label}</option>
              ))}
            </select>
          </ModernizationField>
        ))}

        <ModernizationField icon={LayoutGrid} label="Grundrissgestaltung">
          <select
            value={value.floorplan}
            onChange={(event) => onChange({...value, floorplan: event.target.value as FloorplanImprovement})}
            className="rnd-select"
          >
            {Object.entries(FLOORPLAN_LABELS).map(([optionValue, label]) => (
              <option key={optionValue} value={optionValue}>{label}</option>
            ))}
          </select>
        </ModernizationField>
      </div>

      <div className="mx-auto mt-4 flex max-w-5xl flex-col gap-4 rounded-[1.35rem] border border-[var(--color-border)] bg-white/80 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading text-lg font-semibold text-[var(--color-ink)]">Wurde das Gebäude kernsaniert?</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">Kernsanierungen werden nicht automatisch berechnet.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[false, true].map((option) => (
            <button
              key={String(option)}
              type="button"
              aria-pressed={coreRenovation === option}
              onClick={() => onCoreRenovationChange(option)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${coreRenovation === option ? 'bg-[var(--color-btn-bg)] text-[var(--color-btn-text)]' : 'theme-panel text-[var(--color-ink)]'}`}
            >
              {option ? 'Ja' : 'Nein'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModernizationField({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof House;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-3 rounded-[1.3rem] border border-[var(--color-border)] bg-white/78 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex min-w-0 items-center gap-3 text-sm font-semibold text-[var(--color-ink)]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]"><Icon size={19} /></span>
        {label}
      </span>
      <span className="sm:w-[15.5rem]">{children}</span>
    </label>
  );
}
