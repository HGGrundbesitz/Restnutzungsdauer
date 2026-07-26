export type AfaScenario = {
  id: 'standard' | 'shorter';
  label: string;
  shortLabel: string;
  buildingValue: number;
  usefulLifeYears: number;
  annualRate: number;
  annualAmount: number;
  explanation: string;
};

export const AFA_EXAMPLE_LABEL = 'Unverbindliches Rechenbeispiel';

export const AFA_SCENARIOS: readonly AfaScenario[] = [
  {
    id: 'standard',
    label: 'Gesetzliche Standardannahme',
    shortLabel: 'Standardannahme',
    buildingValue: 300_000,
    usefulLifeYears: 50,
    annualRate: 2,
    annualAmount: 6_000,
    explanation:
      'Der beispielhafte Gebäudewert wird gleichmäßig über 50 Jahre verteilt.',
  },
  {
    id: 'shorter',
    label: 'Individuell nachgewiesene Restnutzungsdauer',
    shortLabel: 'Kürzere Restnutzungsdauer',
    buildingValue: 300_000,
    usefulLifeYears: 30,
    annualRate: 3.33,
    annualAmount: 10_000,
    explanation:
      'Im Beispiel verteilt sich derselbe Gebäudewert auf einen kürzeren, fachlich nachzuweisenden Zeitraum.',
  },
] as const;

export function formatEuro(value: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value.toLocaleString('de-DE', {maximumFractionDigits: 2})} %`;
}
