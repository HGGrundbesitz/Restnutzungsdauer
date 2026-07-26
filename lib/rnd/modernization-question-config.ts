import type {ModernizationAnswersV2, RndAnswerIndex} from './types.ts';

export type ModernizationQuestionKey = keyof ModernizationAnswersV2;
export type ModernizationIconKey =
  | 'roof'
  | 'windows'
  | 'pipes'
  | 'heating'
  | 'exteriorWalls'
  | 'bathrooms'
  | 'interior'
  | 'floorplan';

export type ModernizationQuestion = {
  key: ModernizationQuestionKey;
  step: number;
  eyebrow: string;
  question: string;
  icon: ModernizationIconKey;
  options: readonly [string, string, string];
  points: readonly [number, number, number];
};

const PERIOD_OPTIONS = [
  'Nie / vor über 15 Jahren',
  'Vor 10–15 Jahren',
  'Vor weniger als 10 Jahren',
] as const;

export const MODERNIZATION_QUESTIONS: readonly ModernizationQuestion[] = [
  {
    key: 'roof',
    step: 3,
    eyebrow: 'Dach',
    question: 'Wann wurde das Dach zuletzt erneuert (inkl. Dämmung)?',
    icon: 'roof',
    options: PERIOD_OPTIONS,
    points: [0, 2, 4],
  },
  {
    key: 'windows',
    step: 4,
    eyebrow: 'Fenster und Außentüren',
    question: 'Wann wurden Fenster und Außentüren zuletzt erneuert?',
    icon: 'windows',
    options: PERIOD_OPTIONS,
    points: [0, 1, 2],
  },
  {
    key: 'pipes',
    step: 5,
    eyebrow: 'Leitungen',
    question: 'Wann wurden Strom-, Gas-, Wasser- und Abwasserleitungen zuletzt erneuert?',
    icon: 'pipes',
    options: PERIOD_OPTIONS,
    points: [0, 1, 2],
  },
  {
    key: 'heating',
    step: 6,
    eyebrow: 'Heizungsanlage',
    question: 'Wie alt ist die Heizungsanlage?',
    icon: 'heating',
    options: ['Älter als 15 Jahre', '10–15 Jahre', 'Neuer als 10 Jahre'],
    points: [0, 1, 2],
  },
  {
    key: 'exteriorWalls',
    step: 7,
    eyebrow: 'Außenwanddämmung',
    question: 'Wann wurde eine Wärmedämmung der Außenwände angebracht?',
    icon: 'exteriorWalls',
    options: PERIOD_OPTIONS,
    points: [0, 2, 4],
  },
  {
    key: 'bathrooms',
    step: 8,
    eyebrow: 'Bäder',
    question: 'Wann wurden die Bäder zuletzt modernisiert?',
    icon: 'bathrooms',
    options: PERIOD_OPTIONS,
    points: [0, 1, 2],
  },
  {
    key: 'interior',
    step: 9,
    eyebrow: 'Innenausbau',
    question: 'Wann wurden Decken, Fußböden oder Treppen zuletzt erneuert?',
    icon: 'interior',
    options: PERIOD_OPTIONS,
    points: [0, 1, 2],
  },
  {
    key: 'floorplan',
    step: 10,
    eyebrow: 'Grundriss',
    question: 'Wurde der Grundriss wesentlich verändert (z. B. Wände versetzt, Räume vergrößert)?',
    icon: 'floorplan',
    options: ['Nein', 'Teilweise', 'Ja, deutlich'],
    points: [0, 1, 2],
  },
] as const;

export const MODERNIZATION_QUESTION_BY_KEY = new Map(
  MODERNIZATION_QUESTIONS.map((question) => [question.key, question]),
);

export function getModernizationAnswerLabel(
  key: ModernizationQuestionKey,
  answer: RndAnswerIndex,
) {
  return MODERNIZATION_QUESTION_BY_KEY.get(key)?.options[answer] ?? `Option ${answer + 1}`;
}
