import type {
  FloorplanImprovement,
  ModernizationAnswers,
  ModernizationPeriod,
  ModernizationScoreBreakdown,
} from './types.ts';

type PeriodScoreTable = Record<ModernizationPeriod, number>;

// Source: ImmoWertA, Hinweise zu Anlage 2, Tabelle a.
const SCORE_TABLES: Record<Exclude<keyof ModernizationAnswers, 'floorplan'>, PeriodScoreTable> = {
  roof: {within_5: 4, within_10: 3, within_15: 2, within_20: 1, older_or_never: 0, unknown: 0},
  windows: {within_5: 2, within_10: 2, within_15: 1, within_20: 0, older_or_never: 0, unknown: 0},
  pipes: {within_5: 2, within_10: 2, within_15: 2, within_20: 1, older_or_never: 0, unknown: 0},
  heating: {within_5: 2, within_10: 2, within_15: 1, within_20: 0, older_or_never: 0, unknown: 0},
  exteriorWalls: {within_5: 4, within_10: 3, within_15: 2, within_20: 1, older_or_never: 0, unknown: 0},
  bathrooms: {within_5: 2, within_10: 1, within_15: 0, within_20: 0, older_or_never: 0, unknown: 0},
  interior: {within_5: 2, within_10: 2, within_15: 2, within_20: 1, older_or_never: 0, unknown: 0},
};

const FLOORPLAN_SCORES: Record<FloorplanImprovement, number> = {
  none: 0,
  partial: 1,
  comprehensive: 2,
  unknown: 0,
};

export const MODERNIZATION_PERIOD_LABELS: Record<ModernizationPeriod, string> = {
  within_5: 'Vor höchstens 5 Jahren',
  within_10: 'Vor 6 bis 10 Jahren',
  within_15: 'Vor 11 bis 15 Jahren',
  within_20: 'Vor 16 bis 20 Jahren',
  older_or_never: 'Vor mehr als 20 Jahren / nie',
  unknown: 'Nicht bekannt',
};

export const FLOORPLAN_LABELS: Record<FloorplanImprovement, string> = {
  none: 'Keine wesentliche Verbesserung',
  partial: 'Teilweise wesentliche Verbesserung',
  comprehensive: 'Umfassende wesentliche Verbesserung',
  unknown: 'Nicht bekannt',
};

export function scoreModernizations(answers: ModernizationAnswers): ModernizationScoreBreakdown {
  return {
    roof: SCORE_TABLES.roof[answers.roof],
    windows: SCORE_TABLES.windows[answers.windows],
    pipes: SCORE_TABLES.pipes[answers.pipes],
    heating: SCORE_TABLES.heating[answers.heating],
    exteriorWalls: SCORE_TABLES.exteriorWalls[answers.exteriorWalls],
    bathrooms: SCORE_TABLES.bathrooms[answers.bathrooms],
    interior: SCORE_TABLES.interior[answers.interior],
    floorplan: FLOORPLAN_SCORES[answers.floorplan],
  };
}

export function sumModernizationPoints(breakdown: ModernizationScoreBreakdown) {
  return Object.values(breakdown).reduce((sum, points) => sum + points, 0);
}

export function roundModernizationPoints(points: number) {
  return Math.round(Math.min(Math.max(points, 0), 20));
}

export function hasUnknownModernizationAnswer(answers: ModernizationAnswers) {
  return Object.values(answers).some((answer) => answer === 'unknown');
}
