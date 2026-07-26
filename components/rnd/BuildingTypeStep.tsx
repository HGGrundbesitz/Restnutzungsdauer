import {
  Building2,
  Factory,
  HeartPulse,
  House,
  ParkingSquare,
  Store,
} from 'lucide-react';
import {PUBLIC_BUILDING_TYPES, type BuildingTypeDefinition} from '@/lib/rnd/gnd-table';
import type {OfficialBuildingTypeCode} from '@/lib/rnd/types';

const GROUPS: readonly {
  key: BuildingTypeDefinition['group'];
  label: string;
  icon: typeof House;
}[] = [
  {key: 'residential', label: 'Wohnen', icon: House},
  {key: 'commercial', label: 'Gewerbe', icon: Store},
  {key: 'social', label: 'Soziales / Gesundheit', icon: HeartPulse},
  {key: 'industrial', label: 'Industrie / Lager', icon: Factory},
  {key: 'other', label: 'Garagen / Sonstige', icon: ParkingSquare},
];

export default function BuildingTypeStep({
  value,
  onChange,
}: {
  value: OfficialBuildingTypeCode | '';
  onChange: (value: OfficialBuildingTypeCode) => void;
}) {
  return (
    <div>
      <div className="mx-auto mb-6 max-w-4xl text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] sm:h-14 sm:w-14">
          <Building2 size={27} strokeWidth={1.8} />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">Gebäudeart</p>
        <h3 className="mt-2 text-balance font-heading text-3xl font-semibold leading-[1.06] tracking-[-0.04em] text-[var(--color-ink)] sm:text-4xl lg:text-[2.75rem]">
          Was für ein Gebäude ist es?
        </h3>
      </div>

      <div className="rnd-building-type-list mx-auto max-w-5xl" aria-label="Gebäudeart auswählen">
        {GROUPS.map((group) => {
          const types = PUBLIC_BUILDING_TYPES.filter((type) => type.group === group.key);
          if (types.length === 0) return null;
          const Icon = group.icon;

          return (
            <section key={group.key} aria-labelledby={`building-group-${group.key}`}>
              <h4
                id={`building-group-${group.key}`}
                className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]"
              >
                <Icon size={16} className="text-[var(--color-accent)]" />
                {group.label}
              </h4>
              <div className="rnd-building-type-grid">
                {types.map((type) => {
                  const active = value === type.code;
                  return (
                    <button
                      key={type.code}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChange(type.code)}
                      className={`rnd-building-type-card ${active ? 'rnd-building-type-card-selected' : ''}`}
                    >
                      <span className="text-balance font-heading text-base font-semibold leading-6 text-[var(--color-ink)]">
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
