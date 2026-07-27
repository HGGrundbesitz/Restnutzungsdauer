'use client';

import {
  Building2,
  Factory,
  House,
  ParkingSquare,
  Store,
  type LucideIcon,
} from 'lucide-react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {PUBLIC_BUILDING_TYPES, type BuildingTypeDefinition} from '@/lib/rnd/gnd-table';
import type {OfficialBuildingTypeCode} from '@/lib/rnd/types';

export type PublicBuildingCategory = 'residential' | 'commercial' | 'industrial' | 'other';

type CategoryDefinition = {
  key: PublicBuildingCategory;
  label: string;
  icon: LucideIcon;
  groups: readonly BuildingTypeDefinition['group'][];
};

const CATEGORIES: readonly CategoryDefinition[] = [
  {key: 'residential', label: 'Wohnen', icon: House, groups: ['residential']},
  {key: 'commercial', label: 'Gewerbe', icon: Store, groups: ['commercial', 'social']},
  {key: 'industrial', label: 'Industrie / Lager', icon: Factory, groups: ['industrial']},
  {key: 'other', label: 'Garagen / Sonstige', icon: ParkingSquare, groups: ['other']},
];

export function getBuildingCategoryForType(
  value: OfficialBuildingTypeCode | '',
): PublicBuildingCategory | null {
  if (!value) return null;
  const buildingType = PUBLIC_BUILDING_TYPES.find((type) => type.code === value);
  return CATEGORIES.find((category) => (
    buildingType ? category.groups.includes(buildingType.group) : false
  ))?.key ?? null;
}

export default function BuildingTypeStep({
  value,
  category,
  onCategoryChange,
  onChange,
}: {
  value: OfficialBuildingTypeCode | '';
  category: PublicBuildingCategory | null;
  onCategoryChange: (value: PublicBuildingCategory) => void;
  onChange: (value: OfficialBuildingTypeCode) => void;
}) {
  const reduceMotion = useReducedMotion();
  const selectedCategory = CATEGORIES.find((item) => item.key === category);
  const types = selectedCategory
    ? PUBLIC_BUILDING_TYPES.filter((type) => selectedCategory.groups.includes(type.group))
    : [];

  return (
    <div>
      <div className="mx-auto mb-6 max-w-4xl text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] sm:h-14 sm:w-14">
          <Building2 size={27} strokeWidth={1.8} />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">Gebäudeart</p>
        <h3 className="mt-2 text-balance font-heading text-3xl font-semibold leading-[1.06] tracking-[-0.04em] text-[var(--color-ink)] sm:text-4xl lg:text-[2.75rem]">
          {selectedCategory ? 'Um welche Gebäudeart handelt es sich?' : 'Zu welcher Kategorie gehört das Gebäude?'}
        </h3>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {selectedCategory ? (
          <motion.div
            key={selectedCategory.key}
            initial={reduceMotion ? {opacity: 1} : {opacity: 0, x: 18}}
            animate={{opacity: 1, x: 0}}
            exit={reduceMotion ? {opacity: 1} : {opacity: 0, x: -18}}
            transition={{duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1]}}
            className="rnd-building-type-list mx-auto max-w-5xl"
            aria-label={`${selectedCategory.label}: Gebäudeart auswählen`}
          >
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              <selectedCategory.icon size={16} className="text-[var(--color-accent)]" />
              {selectedCategory.label}
            </div>
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
          </motion.div>
        ) : (
          <motion.div
            key="categories"
            initial={reduceMotion ? {opacity: 1} : {opacity: 0, x: -18}}
            animate={{opacity: 1, x: 0}}
            exit={reduceMotion ? {opacity: 1} : {opacity: 0, x: 18}}
            transition={{duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1]}}
            className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2"
            aria-label="Gebäudekategorie auswählen"
          >
            {CATEGORIES.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onCategoryChange(item.key)}
                  className="rnd-building-category-card"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                    <Icon size={22} strokeWidth={1.8} />
                  </span>
                  <span className="font-heading text-lg font-semibold text-[var(--color-ink)]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
