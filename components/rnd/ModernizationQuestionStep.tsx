import {
  Bath,
  DoorOpen,
  Flame,
  House,
  LayoutGrid,
  Paintbrush,
  Pipette,
  SquareStack,
} from 'lucide-react';
import type {
  ModernizationIconKey,
  ModernizationQuestion,
} from '@/lib/rnd/modernization-question-config';
import type {RndAnswerIndex} from '@/lib/rnd/types';

const ICONS: Record<ModernizationIconKey, typeof House> = {
  roof: House,
  windows: DoorOpen,
  pipes: Pipette,
  heating: Flame,
  exteriorWalls: SquareStack,
  bathrooms: Bath,
  interior: Paintbrush,
  floorplan: LayoutGrid,
};

export default function ModernizationQuestionStep({
  config,
  selectedValue,
  onSelect,
}: {
  config: ModernizationQuestion;
  selectedValue?: RndAnswerIndex;
  onSelect: (value: RndAnswerIndex) => void;
}) {
  const Icon = ICONS[config.icon];

  return (
    <div className="mx-auto max-w-4xl text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <Icon size={30} strokeWidth={1.8} />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">{config.eyebrow}</p>
      <h3 className="mx-auto mt-3 max-w-3xl text-balance font-heading text-3xl font-semibold leading-[1.06] tracking-[-0.04em] text-[var(--color-ink)] sm:text-5xl">
        {config.question}
      </h3>

      <div className="rnd-answer-grid mt-10" role="group" aria-label={config.question}>
        {config.options.map((option, index) => {
          const answer = index as RndAnswerIndex;
          const active = selectedValue === answer;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(answer)}
              className={`rnd-answer-card ${active ? 'rnd-answer-card-selected' : ''}`}
            >
              <span className="rnd-answer-index" aria-hidden="true">{index + 1}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
