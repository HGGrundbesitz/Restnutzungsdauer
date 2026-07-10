import {ArrowRight, Building2, CalendarDays, Clock3} from 'lucide-react';
import type {RndResult} from '@/lib/rnd/types';

export default function PreliminaryResultStep({result}: {result: RndResult}) {
  const values = [
    {icon: Building2, label: 'Gebäudeart', value: result.buildingTypeLabel},
    {icon: Clock3, label: 'Gesamtnutzungsdauer', value: result.gndYears ? `${result.gndYears} Jahre` : 'Individuelle Zuordnung'},
    {icon: CalendarDays, label: 'Gebäudealter', value: `${result.actualAge} Jahre`},
    {icon: ArrowRight, label: 'Vorläufige RND', value: result.preliminaryRnd === null ? 'Manuelle Prüfung' : `${result.preliminaryRnd} Jahre`},
  ];

  return (
    <div>
      <div className="mx-auto mb-9 max-w-3xl text-center">
        <h3 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] sm:text-5xl">Modellhafte Ausgangswerte</h3>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">Noch ohne Berücksichtigung Ihrer Modernisierungen.</p>
      </div>
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
        {values.map((item) => (
          <div key={item.label} className="rounded-[1.4rem] border border-[var(--color-border)] bg-white/82 p-5 sm:p-6">
            <item.icon size={20} className="text-[var(--color-accent)]" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{item.label}</p>
            <p className="mt-2 text-balance font-heading text-2xl font-semibold text-[var(--color-ink)]">{item.value}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-6 text-[var(--color-text-muted)]">
        Die GND ist eine modellhafte Orientierung. Eine fachliche Zuordnung kann im Gutachten angepasst werden.
      </p>
    </div>
  );
}
