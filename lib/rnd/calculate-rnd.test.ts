import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateRnd,
  calculateRndV1,
  calculateRndV2,
  RND_MODEL_VERSION_V1,
  RND_MODEL_VERSION_V2,
} from './calculate-rnd.ts';
import {RND_COEFFICIENTS} from './coefficient-table.ts';
import {BUILDING_TYPES, getBuildingTypeDefinition, PUBLIC_BUILDING_TYPES} from './gnd-table.ts';
import {normalizePublicRndV2Input} from './input-version.ts';
import {MODERNIZATION_QUESTIONS} from './modernization-question-config.ts';
import {roundModernizationPoints, scoreModernizations, sumModernizationPoints} from './modernization-rules.ts';
import {scoreModernizationsV2, sumModernizationPointsV2} from './modernization-rules-v2.ts';
import {
  RND_INPUT_V2_SCHEMA_VERSION,
  type RndInputV1,
  type RndInputV2,
} from './types.ts';
import {isRndInput, validateRndInputV2} from './validate-input.ts';

const EMPTY_MODERNIZATION_V1 = {
  roof: 'older_or_never',
  windows: 'older_or_never',
  pipes: 'older_or_never',
  heating: 'older_or_never',
  exteriorWalls: 'older_or_never',
  bathrooms: 'older_or_never',
  interior: 'older_or_never',
  floorplan: 'none',
} as const;

const EMPTY_MODERNIZATION_V2 = {
  roof: 0,
  windows: 0,
  pipes: 0,
  heating: 0,
  exteriorWalls: 0,
  bathrooms: 0,
  interior: 0,
  floorplan: 0,
} as const;

function createV1Input(overrides: Partial<RndInputV1> = {}): RndInputV1 {
  return {
    buildingTypeCode: 'multi_family',
    referenceDate: '2026-01-01',
    constructionYear: 1975,
    modernization: EMPTY_MODERNIZATION_V1,
    coreRenovation: false,
    ...overrides,
  };
}

function createV2Input(overrides: Partial<RndInputV2> = {}): RndInputV2 {
  return {
    schemaVersion: RND_INPUT_V2_SCHEMA_VERSION,
    buildingTypeCode: 'multi_family',
    referenceDate: '2026-01-01',
    constructionYear: 1975,
    modernization: EMPTY_MODERNIZATION_V2,
    ...overrides,
  };
}

test('all 18 official building types have GND, stable IDs and V2 automatic calculation', () => {
  assert.equal(PUBLIC_BUILDING_TYPES.length, 18);
  assert.deepEqual(PUBLIC_BUILDING_TYPES.map((type) => type.specificationId), Array.from({length: 18}, (_, index) => index + 1));
  for (const buildingType of BUILDING_TYPES) {
    if (buildingType.code === 'unknown') {
      assert.equal(buildingType.gndYears, null);
      assert.equal(buildingType.automaticModel, false);
    } else {
      assert.equal(typeof buildingType.gndYears, 'number');
      assert.equal(buildingType.automaticModel, true);
    }
  }
});

test('maps the common residential categories to 80 years GND', () => {
  assert.equal(getBuildingTypeDefinition('single_family').gndYears, 80);
  assert.equal(getBuildingTypeDefinition('multi_family').gndYears, 80);
  assert.equal(getBuildingTypeDefinition('mixed_use_residential').gndYears, 80);
});

test('keeps the legacy V1 calculation and model version unchanged', () => {
  const result = calculateRnd(createV1Input());
  assert.equal(result.modelVersion, RND_MODEL_VERSION_V1);
  assert.equal(result.actualAge, 51);
  assert.equal(result.preliminaryRnd, 29);
});

test('scores the legacy ImmoWertA modernization periods deterministically', () => {
  const breakdown = scoreModernizations({
    roof: 'within_5',
    windows: 'within_15',
    pipes: 'within_20',
    heating: 'within_10',
    exteriorWalls: 'within_15',
    bathrooms: 'within_10',
    interior: 'within_20',
    floorplan: 'partial',
  });

  assert.deepEqual(breakdown, {
    roof: 4,
    windows: 1,
    pipes: 1,
    heating: 2,
    exteriorWalls: 2,
    bathrooms: 1,
    interior: 1,
    floorplan: 1,
  });
  assert.equal(sumModernizationPoints(breakdown), 13);
  assert.equal(roundModernizationPoints(5.75), 6);
});

test('preserves V1 age capping and manual-review behavior', () => {
  const oldBuilding = calculateRndV1(createV1Input({constructionYear: 1900}));
  assert.equal(oldBuilding.ageForFormula, 80);
  assert.equal(oldBuilding.modifiedRnd, 12);
  assert.ok(oldBuilding.warnings.some((warning) => warning.code === 'BUILDING_OLDER_THAN_GND'));

  const nonResidential = calculateRndV1(createV1Input({buildingTypeCode: 'office_bank'}));
  assert.equal(nonResidential.status, 'manual_review');

  const coreRenovation = calculateRndV1(createV1Input({coreRenovation: true}));
  assert.equal(coreRenovation.status, 'manual_review');
});

test('contains exactly 21 coefficient rows from zero to twenty points', () => {
  assert.equal(RND_COEFFICIENTS.length, 21);
  assert.deepEqual(RND_COEFFICIENTS.map((row) => row.points), Array.from({length: 21}, (_, index) => index));
});

test('uses the exact V2 three-choice point mapping', () => {
  const allMiddle = scoreModernizationsV2({
    roof: 1,
    windows: 1,
    pipes: 1,
    heating: 1,
    exteriorWalls: 1,
    bathrooms: 1,
    interior: 1,
    floorplan: 1,
  });
  const allMaximum = scoreModernizationsV2({
    roof: 2,
    windows: 2,
    pipes: 2,
    heating: 2,
    exteriorWalls: 2,
    bathrooms: 2,
    interior: 2,
    floorplan: 2,
  });

  assert.deepEqual(allMiddle, {
    roof: 2,
    windows: 1,
    pipes: 1,
    heating: 1,
    exteriorWalls: 2,
    bathrooms: 1,
    interior: 1,
    floorplan: 1,
  });
  assert.equal(sumModernizationPointsV2(allMiddle), 10);
  assert.equal(sumModernizationPointsV2(allMaximum), 20);
  assert.equal(MODERNIZATION_QUESTIONS.length, 8);
  assert.ok(MODERNIZATION_QUESTIONS.every((question) => question.options.length === 3));
});

test('implements the literal V2 specification for all five fixed 2026 cases', () => {
  const cases: Array<{input: RndInputV2; points: number; result: number}> = [
    {input: createV2Input({constructionYear: 2010}), points: 0, result: 56},
    {
      input: createV2Input({
        constructionYear: 1970,
        modernization: {...EMPTY_MODERNIZATION_V2, heating: 2, exteriorWalls: 2},
      }),
      points: 6,
      result: 34,
    },
    {
      input: createV2Input({
        buildingTypeCode: 'mixed_use_residential',
        constructionYear: 1915,
        modernization: {...EMPTY_MODERNIZATION_V2, windows: 1, heating: 2, bathrooms: 1},
      }),
      points: 4,
      result: 26,
    },
    {
      input: createV2Input({
        constructionYear: 1950,
        modernization: {
          roof: 2,
          windows: 2,
          pipes: 2,
          heating: 2,
          exteriorWalls: 2,
          bathrooms: 2,
          interior: 2,
          floorplan: 2,
        },
      }),
      points: 20,
      result: 56,
    },
    {
      input: createV2Input({
        buildingTypeCode: 'office_bank',
        constructionYear: 1990,
        modernization: {...EMPTY_MODERNIZATION_V2, roof: 1, exteriorWalls: 1},
      }),
      points: 4,
      result: 26,
    },
  ];

  for (const testCase of cases) {
    const result = calculateRndV2(testCase.input);
    assert.equal(result.modelVersion, RND_MODEL_VERSION_V2);
    assert.equal(result.modernizationPointsRounded, testCase.points);
    assert.equal(result.modifiedRnd, testCase.result);
    assert.equal(result.status, 'calculated');
  }
});

test('does not cap the V2 formula age at GND', () => {
  const result = calculateRndV2(createV2Input({
    buildingTypeCode: 'mixed_use_residential',
    constructionYear: 1915,
    modernization: {...EMPTY_MODERNIZATION_V2, windows: 1, heating: 2, bathrooms: 1},
  }));
  assert.equal(result.actualAge, 111);
  assert.equal(result.ageForFormula, 111);
});

test('validates V2 building type, year and all eight answer indexes', () => {
  assert.equal(validateRndInputV2(createV2Input({constructionYear: 1800})).valid, true);
  assert.equal(validateRndInputV2(createV2Input({constructionYear: 2026})).valid, true);
  assert.equal(validateRndInputV2(createV2Input({constructionYear: 1799})).valid, false);
  assert.equal(validateRndInputV2(createV2Input({constructionYear: 2027})).valid, false);
  assert.equal(validateRndInputV2({...createV2Input(), buildingTypeCode: 'unknown'} as unknown as RndInputV2).valid, false);
  assert.equal(validateRndInputV2({
    ...createV2Input(),
    modernization: {...EMPTY_MODERNIZATION_V2, roof: 3},
  } as unknown as RndInputV2).valid, false);
  assert.equal(isRndInput(createV2Input()), true);
});

test('server normalization owns the Berlin reference year and rejects public coreRenovation', () => {
  const normalized = normalizePublicRndV2Input(
    {...createV2Input({referenceDate: '1999-01-01'}), constructionYear: 2010},
    new Date('2026-07-25T12:00:00Z'),
  );
  assert.equal(normalized?.referenceDate, '2026-01-01');

  const rejected = normalizePublicRndV2Input({
    ...createV2Input(),
    coreRenovation: false,
  });
  assert.equal(rejected, null);
});
