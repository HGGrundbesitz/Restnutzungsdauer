import {CheckCircle2} from 'lucide-react';
import {FLOORPLAN_LABELS, MODERNIZATION_PERIOD_LABELS} from '@/lib/rnd/modernization-rules';
import type {RndInput, RndPropertyContext, RndResult} from '@/lib/rnd/types';

export default function SummaryStep({
  input,
  property,
  result,
}: {
  input: RndInput;
  property: RndPropertyContext;
  result: RndResult;
}) {
  const rows = [
    ['Gebäudeart', result.buildingTypeLabel],
    ['GND', result.gndYears ? `${result.gndYears} Jahre` : 'Individuelle Zuordnung'],
    ['Baujahr / Stichtag', `${input.constructionYear} / ${new Date(`${input.referenceDate}T00:00:00`).toLocaleDateString('de-DE')}`],
    ['Gebäudealter', `${result.actualAge} Jahre`],
    ['Vorläufige RND', result.preliminaryRnd === null ? 'Manuelle Prüfung' : `${result.preliminaryRnd} Jahre`],
    ['Modernisierungspunkte', `${result.modernizationPointsRounded} / 20`],
    ['Adresse', property.address?.trim() || 'Nicht angegeben'],
  ];

  return (
    <div>
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <h3 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] sm:text-5xl">Bitte prüfen Sie Ihre Angaben</h3>
        <p className="mt-4 text-base text-[var(--color-text-muted)]">Alle Werte bleiben vor der fachlichen Prüfung korrigierbar.</p>
      </div>
      <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-[1.2rem] border border-[var(--color-border)] bg-white/80 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{label}</p>
            <p className="mt-2 font-semibold leading-6 text-[var(--color-ink)]">{value}</p>
          </div>
        ))}
      </div>
      <details className="mx-auto mt-4 max-w-5xl rounded-[1.2rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4">
        <summary className="cursor-pointer font-semibold text-[var(--color-ink)]">Modernisierungsangaben anzeigen</summary>
        <div className="mt-4 grid gap-2 text-sm text-[var(--color-text-muted)] sm:grid-cols-2">
          <SummaryLine label="Dach" value={MODERNIZATION_PERIOD_LABELS[input.modernization.roof]} />
          <SummaryLine label="Fenster" value={MODERNIZATION_PERIOD_LABELS[input.modernization.windows]} />
          <SummaryLine label="Leitungen" value={MODERNIZATION_PERIOD_LABELS[input.modernization.pipes]} />
          <SummaryLine label="Heizung" value={MODERNIZATION_PERIOD_LABELS[input.modernization.heating]} />
          <SummaryLine label="Außenwände" value={MODERNIZATION_PERIOD_LABELS[input.modernization.exteriorWalls]} />
          <SummaryLine label="Bäder" value={MODERNIZATION_PERIOD_LABELS[input.modernization.bathrooms]} />
          <SummaryLine label="Innenausbau" value={MODERNIZATION_PERIOD_LABELS[input.modernization.interior]} />
          <SummaryLine label="Grundriss" value={FLOORPLAN_LABELS[input.modernization.floorplan]} />
        </div>
      </details>
      <div className="mx-auto mt-5 flex max-w-5xl items-start gap-3 rounded-[1.2rem] border border-[rgba(37,99,235,0.18)] bg-[var(--color-accent-soft)] px-5 py-4 text-sm leading-6 text-[var(--color-text-muted)]">
        <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
        Das offizielle Ergebnis wird beim Absenden mit derselben Modellversion auf dem Server neu berechnet.
      </div>
    </div>
  );
}

function SummaryLine({label, value}: {label: string; value: string}) {
  return <p><strong className="text-[var(--color-ink)]">{label}:</strong> {value}</p>;
}
