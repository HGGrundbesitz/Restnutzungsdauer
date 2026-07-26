import {findBuildingTypeDefinition} from './gnd-table.ts';
import {
  RND_INPUT_V2_SCHEMA_VERSION,
  type RndInput,
  type RndInputV1,
  type RndInputV2,
} from './types.ts';

export type RndValidationResult = {valid: true} | {valid: false; errors: string[]};

const LEGACY_PERIODS = new Set([
  'within_5',
  'within_10',
  'within_15',
  'within_20',
  'older_or_never',
  'unknown',
]);
const LEGACY_FLOORPLANS = new Set(['none', 'partial', 'comprehensive', 'unknown']);
const V2_ANSWER_VALUES = new Set([0, 1, 2]);
const MODERNIZATION_KEYS = [
  'roof',
  'windows',
  'pipes',
  'heating',
  'exteriorWalls',
  'bathrooms',
  'interior',
  'floorplan',
] as const;

export function validateRndInput(input: RndInput): RndValidationResult {
  return isVersionedInput(input)
    ? validateRndInputV2(input)
    : validateRndInputV1(input as RndInputV1);
}

export function validateRndInputV1(input: RndInputV1): RndValidationResult {
  const errors: string[] = [];
  const referenceYear = getReferenceYear(input?.referenceDate);
  const definition = findBuildingTypeDefinition(input?.buildingTypeCode);

  if (referenceYear === null) {
    errors.push('Bitte wählen Sie einen gültigen Stichtag.');
  }

  if (!Number.isInteger(input?.constructionYear) || input.constructionYear < 1500) {
    errors.push('Bitte geben Sie ein gültiges Baujahr ein.');
  }

  if (referenceYear !== null && input.constructionYear > referenceYear) {
    errors.push('Das Baujahr darf nicht nach dem Stichtag liegen.');
  }

  if (!definition) {
    errors.push('Bitte wählen Sie eine gültige Gebäudeart.');
  }

  const modernization = asRecord(input?.modernization);
  const periodAnswers = MODERNIZATION_KEYS
    .filter((key) => key !== 'floorplan')
    .map((key) => modernization?.[key]);

  if (periodAnswers.some(
    (answer) => typeof answer !== 'string' || !LEGACY_PERIODS.has(answer),
  )) {
    errors.push('Mindestens eine Modernisierungsangabe ist ungültig.');
  }

  if (
    typeof modernization?.floorplan !== 'string'
    || !LEGACY_FLOORPLANS.has(modernization.floorplan)
  ) {
    errors.push('Die Angabe zur Grundrissgestaltung ist ungültig.');
  }

  if (typeof input?.coreRenovation !== 'boolean') {
    errors.push('Die Angabe zur Kernsanierung ist ungültig.');
  }

  return errors.length > 0 ? {valid: false, errors} : {valid: true};
}

export function validateRndInputV2(input: RndInputV2): RndValidationResult {
  const errors: string[] = [];
  const referenceYear = getReferenceYear(input?.referenceDate);
  const definition = findBuildingTypeDefinition(input?.buildingTypeCode);

  if (input?.schemaVersion !== RND_INPUT_V2_SCHEMA_VERSION) {
    errors.push('Die Version der Berechnungsdaten ist ungültig.');
  }

  if (referenceYear === null) {
    errors.push('Das interne Berechnungsdatum ist ungültig.');
  }

  if (
    !Number.isInteger(input?.constructionYear)
    || input.constructionYear < 1800
    || (referenceYear !== null && input.constructionYear > referenceYear)
  ) {
    errors.push(
      referenceYear === null
        ? 'Bitte geben Sie ein gültiges Baujahr ab 1800 ein.'
        : `Bitte geben Sie ein ganzzahliges Baujahr zwischen 1800 und ${referenceYear} ein.`,
    );
  }

  if (!definition || definition.code === 'unknown' || definition.gndYears === null) {
    errors.push('Bitte wählen Sie eine der 18 gültigen Gebäudearten.');
  }

  const modernization = asRecord(input?.modernization);
  if (MODERNIZATION_KEYS.some((key) => {
    const answer = modernization?.[key];
    return typeof answer !== 'number' || !V2_ANSWER_VALUES.has(answer);
  })) {
    errors.push('Bitte beantworten Sie alle acht Modernisierungsfragen.');
  }

  if (Object.prototype.hasOwnProperty.call(input ?? {}, 'coreRenovation')) {
    errors.push('Eine Kernsanierungsangabe gehört nicht zur öffentlichen V2-Berechnung.');
  }

  return errors.length > 0 ? {valid: false, errors} : {valid: true};
}

export function isRndInput(value: unknown): value is RndInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return isVersionedInput(value)
    ? validateRndInputV2(value as RndInputV2).valid
    : validateRndInputV1(value as RndInputV1).valid;
}

export function isRndInputV1(value: unknown): value is RndInputV1 {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (isVersionedInput(value)) return false;
  return validateRndInputV1(value as RndInputV1).valid;
}

export function isRndInputV2(value: unknown): value is RndInputV2 {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (!isVersionedInput(value)) return false;
  return validateRndInputV2(value as RndInputV2).valid;
}

function isVersionedInput(value: unknown): value is RndInputV2 {
  return Boolean(
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && (value as Record<string, unknown>).schemaVersion === RND_INPUT_V2_SCHEMA_VERSION,
  );
}

function getReferenceYear(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date.getUTCFullYear();
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
