import {getCoefficient} from './coefficient-table.ts';
import {getBuildingTypeDefinition} from './gnd-table.ts';
import {
  hasUnknownModernizationAnswer,
  roundModernizationPoints,
  scoreModernizations,
  sumModernizationPoints,
} from './modernization-rules.ts';
import type {RndInput, RndResult, RndWarning} from './types.ts';
import {validateRndInput} from './validate-input.ts';

export const RND_MODEL_VERSION = 'immowertv-2022-immowerta-v1';
export const RND_RESULT_COPY_VERSION = '2026-07-v1';

export function calculateRnd(input: RndInput): RndResult {
  const validation = validateRndInput(input);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  const buildingType = getBuildingTypeDefinition(input.buildingTypeCode);
  const referenceYear = new Date(`${input.referenceDate}T00:00:00`).getFullYear();
  const actualAge = Math.max(0, referenceYear - input.constructionYear);
  const gndYears = buildingType.gndYears;
  const scoreBreakdown = scoreModernizations(input.modernization);
  const modernizationPointsRaw = sumModernizationPoints(scoreBreakdown);
  const modernizationPointsRounded = roundModernizationPoints(modernizationPointsRaw);
  const warnings: RndWarning[] = [
    {
      code: 'ROUNDING_POLICY_REQUIRES_APPROVAL',
      message: 'Die kaufmännische Rundung der Modernisierungspunkte ist vor dem Produktivstart fachlich freizugeben.',
    },
  ];

  if (input.buildingTypeCode === 'unknown' || gndYears === null) {
    warnings.push({
      code: 'BUILDING_TYPE_UNKNOWN',
      message: 'Die Gebäudeart muss individuell einer vergleichbaren Gebäudeart zugeordnet werden.',
    });
  } else if (!buildingType.automaticModel) {
    warnings.push({
      code: 'NON_RESIDENTIAL_MANUAL_REVIEW',
      message: 'Für diese Gebäudeart wird die ImmoWertV-Anlage-2-Berechnung nur nach fachlicher Freigabe angewendet.',
    });
  }

  if (input.coreRenovation) {
    warnings.push({
      code: 'CORE_RENOVATION_MANUAL_REVIEW',
      message: 'Eine Kernsanierung wird nicht automatisch bewertet und erfordert eine sachverständige Prüfung.',
    });
  }

  if (hasUnknownModernizationAnswer(input.modernization)) {
    warnings.push({
      code: 'MODERNIZATION_INFORMATION_INCOMPLETE',
      message: 'Mindestens eine Modernisierungsangabe ist nicht bekannt und muss fachlich geprüft werden.',
    });
  }

  const requiresManualReview =
    gndYears === null ||
    !buildingType.automaticModel ||
    input.coreRenovation ||
    hasUnknownModernizationAnswer(input.modernization);

  if (gndYears === null) {
    return {
      modelVersion: RND_MODEL_VERSION,
      resultCopyVersion: RND_RESULT_COPY_VERSION,
      status: 'manual_review',
      buildingTypeCode: input.buildingTypeCode,
      buildingTypeLabel: buildingType.label,
      gndYears: null,
      referenceDate: input.referenceDate,
      constructionYear: input.constructionYear,
      actualAge,
      ageForFormula: null,
      preliminaryRnd: null,
      modernizationScoreBreakdown: scoreBreakdown,
      modernizationPointsRaw,
      modernizationPointsRounded,
      relativeAge: null,
      coefficient: null,
      modifiedRnd: null,
      calculationMethod: 'manual_review',
      warnings,
    };
  }

  const ageForFormula = Math.min(actualAge, gndYears);
  const preliminaryRnd = Math.max(0, gndYears - actualAge);

  if (actualAge > gndYears) {
    warnings.push({
      code: 'BUILDING_OLDER_THAN_GND',
      message: 'Das tatsächliche Gebäudealter liegt über der modellhaften Gesamtnutzungsdauer; für die Formel wird das Alter auf die GND begrenzt.',
    });
  }

  const coefficient = getCoefficient(modernizationPointsRounded);
  const relativeAge = (ageForFormula / gndYears) * 100;
  const usePreliminaryFormula = relativeAge < coefficient.minimumRelativeAge;
  const formulaResult = usePreliminaryFormula
    ? gndYears - ageForFormula
    : coefficient.a * ((ageForFormula ** 2) / gndYears) - coefficient.b * ageForFormula + coefficient.c * gndYears;
  const modifiedRnd = Math.round(Math.max(0, Math.min(formulaResult, gndYears * 0.7)));

  return {
    modelVersion: RND_MODEL_VERSION,
    resultCopyVersion: RND_RESULT_COPY_VERSION,
    status: requiresManualReview ? 'manual_review' : 'calculated',
    buildingTypeCode: input.buildingTypeCode,
    buildingTypeLabel: buildingType.label,
    gndYears,
    referenceDate: input.referenceDate,
    constructionYear: input.constructionYear,
    actualAge,
    ageForFormula,
    preliminaryRnd,
    modernizationScoreBreakdown: scoreBreakdown,
    modernizationPointsRaw,
    modernizationPointsRounded,
    relativeAge,
    coefficient,
    modifiedRnd,
    calculationMethod: requiresManualReview
      ? 'manual_review'
      : usePreliminaryFormula
        ? 'preliminary'
        : 'immowertv_formula',
    warnings,
  };
}
