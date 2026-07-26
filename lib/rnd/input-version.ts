import {
  RND_INPUT_V2_SCHEMA_VERSION,
  type RndInput,
  type RndInputV1,
  type RndInputV2,
} from './types.ts';
import {isRndInputV2} from './validate-input.ts';

const REFERENCE_TIME_ZONE = 'Europe/Berlin';

export function isLegacyRndInput(input: RndInput): input is RndInputV1 {
  return input.schemaVersion === undefined;
}
export function getCurrentReferenceDate(now = new Date()) {
  const yearPart = new Intl.DateTimeFormat('en', {
    timeZone: REFERENCE_TIME_ZONE,
    year: 'numeric',
  }).formatToParts(now).find((part) => part.type === 'year');
  const year = Number(yearPart?.value);

  if (!Number.isInteger(year)) {
    throw new Error('Das aktuelle Berechnungsjahr konnte nicht bestimmt werden.');
  }

  return `${year}-01-01`;
}

export function normalizePublicRndV2Input(
  value: unknown,
  now = new Date(),
): RndInputV2 | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (input.schemaVersion !== RND_INPUT_V2_SCHEMA_VERSION) return null;
  if ('coreRenovation' in input) return null;

  const normalized = {
    schemaVersion: RND_INPUT_V2_SCHEMA_VERSION,
    buildingTypeCode: input.buildingTypeCode,
    referenceDate: getCurrentReferenceDate(now),
    constructionYear: input.constructionYear,
    modernization: input.modernization,
  } as RndInputV2;

  return isRndInputV2(normalized) ? normalized : null;
}
