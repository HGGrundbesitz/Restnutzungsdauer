import {PUBLIC_BUILDING_TYPES} from './gnd-table.ts';
import {MODERNIZATION_QUESTIONS, type ModernizationQuestionKey} from './modernization-question-config.ts';
import type {
  ModernizationAnswersV2,
  OfficialBuildingTypeCode,
  RndContact,
  RndPropertyContext,
} from './types.ts';

export const RND_WIZARD_DRAFT_STORAGE_KEY = 'rnd-v2-wizard-draft';
export const RND_WIZARD_DRAFT_SCHEMA_VERSION = 'rnd-v2-wizard-draft-v1';
export const RND_WIZARD_DRAFT_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export type PersistedWizardStep =
  | 'buildingType'
  | 'constructionYear'
  | ModernizationQuestionKey
  | 'result'
  | 'contact'
  | 'documents'
  | 'review';

export type RndWizardDraft = {
  schemaVersion: typeof RND_WIZARD_DRAFT_SCHEMA_VERSION;
  savedAt: number;
  step: PersistedWizardStep;
  referenceDate: string;
  buildingTypeCode: OfficialBuildingTypeCode | '';
  constructionYear: number | '';
  modernization: Partial<ModernizationAnswersV2>;
  property: RndPropertyContext;
  contact: RndContact;
};

const BUILDING_TYPE_CODES = new Set(PUBLIC_BUILDING_TYPES.map((type) => type.code));
const MODERNIZATION_KEYS = new Set(MODERNIZATION_QUESTIONS.map((question) => question.key));
const WIZARD_STEPS = new Set<PersistedWizardStep>([
  'buildingType',
  'constructionYear',
  ...MODERNIZATION_QUESTIONS.map((question) => question.key),
  'result',
  'contact',
  'documents',
  'review',
]);

export function parseRndWizardDraft(raw: string | null, now = Date.now()): RndWizardDraft | null {
  if (!raw) return null;

  try {
    const draft = JSON.parse(raw) as Record<string, unknown>;
    if (draft.schemaVersion !== RND_WIZARD_DRAFT_SCHEMA_VERSION) return null;
    if (typeof draft.savedAt !== 'number' || now - draft.savedAt > RND_WIZARD_DRAFT_MAX_AGE_MS) return null;
    if (typeof draft.step !== 'string' || !WIZARD_STEPS.has(draft.step as PersistedWizardStep)) return null;
    if (typeof draft.referenceDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(draft.referenceDate)) return null;
    if (
      draft.buildingTypeCode !== ''
      && (typeof draft.buildingTypeCode !== 'string' || !BUILDING_TYPE_CODES.has(draft.buildingTypeCode as OfficialBuildingTypeCode))
    ) return null;
    if (
      draft.constructionYear !== ''
      && (typeof draft.constructionYear !== 'number' || !Number.isInteger(draft.constructionYear))
    ) return null;

    const modernization = parseModernization(draft.modernization);
    const property = parseProperty(draft.property);
    const contact = parseContact(draft.contact);
    if (!modernization || !property || !contact) return null;

    return {
      schemaVersion: RND_WIZARD_DRAFT_SCHEMA_VERSION,
      savedAt: draft.savedAt,
      step: draft.step as PersistedWizardStep,
      referenceDate: draft.referenceDate,
      buildingTypeCode: draft.buildingTypeCode as OfficialBuildingTypeCode | '',
      constructionYear: draft.constructionYear as number | '',
      modernization,
      property,
      contact,
    };
  } catch {
    return null;
  }
}

function parseModernization(value: unknown): Partial<ModernizationAnswersV2> | null {
  if (!isRecord(value)) return null;
  const parsed: Partial<ModernizationAnswersV2> = {};

  for (const [key, answer] of Object.entries(value)) {
    if (!MODERNIZATION_KEYS.has(key as ModernizationQuestionKey)) return null;
    if (answer !== 0 && answer !== 1 && answer !== 2) return null;
    parsed[key as ModernizationQuestionKey] = answer;
  }
  return parsed;
}

function parseProperty(value: unknown): RndPropertyContext | null {
  if (!isRecord(value)) return null;
  const address = value.address;
  const area = value.area;
  const units = value.units;
  if (address !== undefined && typeof address !== 'string') return null;
  if (area !== undefined && (typeof area !== 'number' || !Number.isFinite(area))) return null;
  if (units !== undefined && (typeof units !== 'number' || !Number.isInteger(units))) return null;
  return {address, area, units} as RndPropertyContext;
}

function parseContact(value: unknown): RndContact | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.firstName !== 'string'
    || typeof value.lastName !== 'string'
    || typeof value.email !== 'string'
    || typeof value.phone !== 'string'
    || typeof value.consent !== 'boolean'
  ) return null;
  return {
    firstName: value.firstName,
    lastName: value.lastName,
    email: value.email,
    phone: value.phone,
    consent: value.consent,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
