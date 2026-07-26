import {getCoefficient} from './coefficient-table.ts';
import {getBuildingTypeDefinition} from './gnd-table.ts';
import {
  scoreModernizationsV2,
  sumModernizationPointsV2,
} from './modernization-rules-v2.ts';
import type {RndInputV2, RndResult, RndWarning} from './types.ts';
import {validateRndInputV2} from './validate-input.ts';

export const RND_MODEL_VERSION_V2 = 'immowertv-clickflow-v2';
export const RND_RESULT_COPY_VERSION_V2 = '2026-07-clickflow-v2';

export function calculateRndV2(input: RndInputV2): RndResult {
  const validation = validateRndInputV2(input);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  const buildingType = getBuildingTypeDefinition(input.buildingTypeCode);
  const gndYears = buildingType.gndYears;

  if (gndYears === null) {
    throw new Error('Für die gewählte Gebäudeart ist keine GND hinterlegt.');
  }

  const referenceYear = new Date(`${input.referenceDate}T00:00:00`).getFullYear();
  const actualAge = referenceYear - input.constructionYear;
  const scoreBreakdown = scoreModernizationsV2(input.modernization);
  const modernizationPointsRaw = sumModernizationPointsV2(scoreBreakdown);
  const coefficient = getCoefficient(modernizationPointsRaw);
  const relativeAge = (actualAge / gndYears) * 100;
  const usePreliminaryFormula = relativeAge < coefficient.minimumRelativeAge;
  const formulaResult = usePreliminaryFormula
    ? gndYears - actualAge
    : coefficient.a * ((actualAge ** 2) / gndYears)
      - coefficient.b * actualAge
      + coefficient.c * gndYears;
  const modifiedRnd = Math.round(Math.max(0, Math.min(formulaResult, gndYears * 0.7)));
  const warnings: RndWarning[] = [];

  if (actualAge > gndYears) {
    warnings.push({
      code: 'BUILDING_OLDER_THAN_GND',
      message: 'Das tatsächliche Gebäudealter liegt über der modellhaften Gesamtnutzungsdauer und wird in V2 unverändert in der Formel verwendet.',
    });
  }

  return {
    modelVersion: RND_MODEL_VERSION_V2,
    resultCopyVersion: RND_RESULT_COPY_VERSION_V2,
    status: 'calculated',
    buildingTypeCode: input.buildingTypeCode,
    buildingTypeLabel: buildingType.label,
    gndYears,
    referenceDate: input.referenceDate,
    constructionYear: input.constructionYear,
    actualAge,
    ageForFormula: actualAge,
    preliminaryRnd: Math.max(0, gndYears - actualAge),
    modernizationScoreBreakdown: scoreBreakdown,
    modernizationPointsRaw,
    modernizationPointsRounded: modernizationPointsRaw,
    relativeAge,
    coefficient,
    modifiedRnd,
    calculationMethod: usePreliminaryFormula ? 'preliminary' : 'immowertv_formula',
    warnings,
  };
}
