import {MODERNIZATION_QUESTIONS} from './modernization-question-config.ts';
import type {
  ModernizationAnswersV2,
  ModernizationScoreBreakdown,
} from './types.ts';

export function scoreModernizationsV2(
  answers: ModernizationAnswersV2,
): ModernizationScoreBreakdown {
  return Object.fromEntries(
    MODERNIZATION_QUESTIONS.map((question) => [
      question.key,
      question.points[answers[question.key]],
    ]),
  ) as ModernizationScoreBreakdown;
}
export function sumModernizationPointsV2(breakdown: ModernizationScoreBreakdown) {
  return Object.values(breakdown).reduce((sum, points) => sum + points, 0);
}
