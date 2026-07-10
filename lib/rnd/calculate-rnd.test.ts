import assert from 'node:assert/strict';
import test from 'node:test';
import {calculateRnd} from './calculate-rnd.ts';
import {BUILDING_TYPES, getBuildingTypeDefinition} from './gnd-table.ts';
import {roundModernizationPoints, scoreModernizations, sumModernizationPoints} from './modernization-rules.ts';
import type {RndInput} from './types.ts';

const EMPTY_MODERNIZATION = {
  roof: 'older_or_never',
  windows: 'older_or_never',
  pipes: 'older_or_never',
  heating: 'older_or_never',
  exteriorWalls: 'older_or_never',
  bathrooms: 'older_or_never',
  interior: 'older_or_never',
  floorplan: 'none',
} as const;

function createInput(overrides: Partial<RndInput> = {}): RndInput {
  return {
    buildingTypeCode: 'multi_family',
    referenceDate: '2026-01-01',
    constructionYear: 1975,
    modernization: EMPTY_MODERNIZATION,
    coreRenovation: false,
    ...overrides,
  };
}

test('all official building types have a defined GND except unknown', () => {
  for (const buildingType of BUILDING_TYPES) {
    if (buildingType.code === 'unknown') {
      assert.equal(buildingType.gndYears, null);
    } else {
      assert.equal(typeof buildingType.gndYears, 'number');
      assert.ok((buildingType.gndYears ?? 0) > 0);
    }
  }
});

test('maps the common residential categories to 80 years GND', () => {
  assert.equal(getBuildingTypeDefinition('single_family').gndYears, 80);
  assert.equal(getBuildingTypeDefinition('multi_family').gndYears, 80);
  assert.equal(getBuildingTypeDefinition('mixed_use_residential').gndYears, 80);
});

test('calculates building age and preliminary RND from Stichtag and Baujahr', () => {
  const result = calculateRnd(createInput());
  assert.equal(result.actualAge, 51);
  assert.equal(result.preliminaryRnd, 29);
});

test('scores the ImmoWertA modernization periods deterministically', () => {
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
});

test('documents the pending 5.75 to 6 rounding policy', () => {
  assert.equal(roundModernizationPoints(5.75), 6);
});

test('uses GND minus age below the relative-age threshold', () => {
  const result = calculateRnd(createInput({constructionYear: 2000}));
  assert.equal(result.calculationMethod, 'preliminary');
  assert.equal(result.modifiedRnd, 54);
});

test('caps formula age at GND and reproduces the 12-year zero-point example', () => {
  const result = calculateRnd(createInput({constructionYear: 1900}));
  assert.equal(result.ageForFormula, 80);
  assert.equal(result.modifiedRnd, 12);
  assert.ok(result.warnings.some((warning) => warning.code === 'BUILDING_OLDER_THAN_GND'));
});

test('returns manual review for core renovation', () => {
  const result = calculateRnd(createInput({coreRenovation: true}));
  assert.equal(result.status, 'manual_review');
  assert.ok(result.warnings.some((warning) => warning.code === 'CORE_RENOVATION_MANUAL_REVIEW'));
});

test('returns manual review for non-residential buildings', () => {
  const result = calculateRnd(createInput({buildingTypeCode: 'office_bank'}));
  assert.equal(result.status, 'manual_review');
  assert.equal(result.gndYears, 60);
});

test('returns manual review without a calculated result for unknown types', () => {
  const result = calculateRnd(createInput({buildingTypeCode: 'unknown'}));
  assert.equal(result.status, 'manual_review');
  assert.equal(result.modifiedRnd, null);
});
