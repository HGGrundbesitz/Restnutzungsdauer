import {getBuildingTypeDefinition} from './gnd-table.ts';
import type {RndInput} from './types.ts';

export type RndValidationResult = {valid: true} | {valid: false; errors: string[]};

export function validateRndInput(input: RndInput): RndValidationResult {
  const errors: string[] = [];
  const referenceDate = new Date(`${input.referenceDate}T00:00:00`);
  const definition = getBuildingTypeDefinition(input.buildingTypeCode);

  if (Number.isNaN(referenceDate.getTime())) {
    errors.push('Bitte wählen Sie einen gültigen Stichtag.');
  }

  if (!Number.isInteger(input.constructionYear) || input.constructionYear < 1500) {
    errors.push('Bitte geben Sie ein gültiges Baujahr ein.');
  }

  if (!Number.isNaN(referenceDate.getTime()) && input.constructionYear > referenceDate.getFullYear()) {
    errors.push('Das Baujahr darf nicht nach dem Stichtag liegen.');
  }

  if (!definition) {
    errors.push('Bitte wählen Sie eine gültige Gebäudeart.');
  }

  const periods = new Set(['within_5', 'within_10', 'within_15', 'within_20', 'older_or_never', 'unknown']);
  const floorplans = new Set(['none', 'partial', 'comprehensive', 'unknown']);
  const periodAnswers = [
    input.modernization?.roof,
    input.modernization?.windows,
    input.modernization?.pipes,
    input.modernization?.heating,
    input.modernization?.exteriorWalls,
    input.modernization?.bathrooms,
    input.modernization?.interior,
  ];

  if (periodAnswers.some((answer) => !periods.has(answer))) {
    errors.push('Mindestens eine Modernisierungsangabe ist ungültig.');
  }

  if (!floorplans.has(input.modernization?.floorplan)) {
    errors.push('Die Angabe zur Grundrissgestaltung ist ungültig.');
  }

  if (typeof input.coreRenovation !== 'boolean') {
    errors.push('Die Angabe zur Kernsanierung ist ungültig.');
  }

  return errors.length > 0 ? {valid: false, errors} : {valid: true};
}

export function isRndInput(value: unknown): value is RndInput {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as RndInput;
  return validateRndInput(candidate).valid;
}
