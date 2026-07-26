import assert from 'node:assert/strict';
import test from 'node:test';
import {
  mapReviewedFactsToInput,
  modernizationAnswerFromYear,
  modernizationPeriodFromYear,
} from './map-reviewed-facts-to-input.ts';
import type {
  DocumentConflictRecord,
  DocumentFactRecord,
  DocumentFieldKey,
  FactMetadata,
} from './document-analysis/types.ts';
import {RND_INPUT_V2_SCHEMA_VERSION, type RndInput, type RndInputV2} from './types.ts';

const originalInput: RndInput = {
  buildingTypeCode: 'single_family',
  referenceDate: '2026-01-01',
  constructionYear: 1980,
  modernization: {
    roof: 'unknown',
    windows: 'unknown',
    pipes: 'unknown',
    heating: 'unknown',
    exteriorWalls: 'unknown',
    bathrooms: 'unknown',
    interior: 'unknown',
    floorplan: 'unknown',
  },
  coreRenovation: false,
};

const originalInputV2: RndInputV2 = {
  schemaVersion: RND_INPUT_V2_SCHEMA_VERSION,
  buildingTypeCode: 'single_family',
  referenceDate: '2026-01-01',
  constructionYear: 1980,
  modernization: {
    roof: 0,
    windows: 0,
    pipes: 0,
    heating: 0,
    exteriorWalls: 0,
    bathrooms: 0,
    interior: 0,
    floorplan: 0,
  },
};

function reviewedFact(
  id: string,
  fieldKey: DocumentFieldKey,
  value: number | string,
  reviewStatus: DocumentFactRecord['review_status'] = 'accepted',
  factMetadata: FactMetadata = {proofStatus: 'proven'},
) {
  return {
    id,
    field_key: fieldKey,
    normalized_value: value,
    reviewed_value: value,
    review_status: reviewStatus,
    fact_metadata: factMetadata,
  };
}

test('maps only accepted or edited facts and never mutates the original input', () => {
  const preview = mapReviewedFactsToInput({
    originalInput,
    originalProperty: {address: 'Alt 1', area: 100, units: 1},
    facts: [
      reviewedFact('year', 'construction_year', 1975),
      reviewedFact('area', 'living_area', 225),
      reviewedFact('pending', 'number_of_units', 4, 'pending_review'),
      reviewedFact('roof', 'roof_modernization_year', 2020),
    ],
    conflicts: [],
  });

  assert.equal(preview.input.constructionYear, 1975);
  assert.equal(preview.input.modernization.roof, 'within_10');
  assert.equal(preview.property.area, 225);
  assert.equal(preview.property.units, 1);
  assert.equal(originalInput.constructionYear, 1980);
  assert.equal(originalInput.modernization.roof, 'unknown');
  assert.deepEqual(preview.sourceFactIds.sort(), ['area', 'roof', 'year']);
});

test('blocks unresolved conflicts and does not map a resolution without an accepted source fact', () => {
  const openConflict = conflict('open', null);
  const blocked = mapReviewedFactsToInput({
    originalInput,
    originalProperty: {},
    facts: [reviewedFact('year', 'construction_year', 1975)],
    conflicts: [openConflict],
  });
  assert.equal(blocked.input.constructionYear, 1980);
  assert.equal(blocked.canCalculate, false);
  assert.deepEqual(blocked.blockedFields, ['construction_year']);

  const resolvedWithoutReview = mapReviewedFactsToInput({
    originalInput,
    originalProperty: {},
    facts: [reviewedFact('year', 'construction_year', 1975, 'pending_review')],
    conflicts: [conflict('resolved', 1975)],
  });
  assert.equal(resolvedWithoutReview.input.constructionYear, 1980);
  assert.match(resolvedWithoutReview.warnings.join(' '), /noch keine Dokumentangabe wurde übernommen/);
});

test('maps a resolved conflict after the source fact was reviewed', () => {
  const preview = mapReviewedFactsToInput({
    originalInput,
    originalProperty: {},
    facts: [reviewedFact('year', 'construction_year', 1975)],
    conflicts: [conflict('resolved', 1972)],
  });

  assert.equal(preview.input.constructionYear, 1972);
  assert.equal(preview.canCalculate, true);
  assert.deepEqual(preview.sourceFactIds, ['year']);
});

test('converts modernization years relative to the approved reference date', () => {
  assert.equal(modernizationPeriodFromYear(2024, '2026-01-01'), 'within_5');
  assert.equal(modernizationPeriodFromYear(2012, '2026-01-01'), 'within_15');
  assert.equal(modernizationPeriodFromYear(1990, '2026-01-01'), 'older_or_never');
  assert.equal(modernizationPeriodFromYear(2030, '2026-01-01'), null);
});

test('maps reviewed modernization years to exact V2 answer boundaries', () => {
  assert.equal(modernizationAnswerFromYear(2010, '2026-01-01'), 0);
  assert.equal(modernizationAnswerFromYear(2011, '2026-01-01'), 1);
  assert.equal(modernizationAnswerFromYear(2016, '2026-01-01'), 1);
  assert.equal(modernizationAnswerFromYear(2017, '2026-01-01'), 2);
  assert.equal(modernizationAnswerFromYear(2030, '2026-01-01'), null);

  const preview = mapReviewedFactsToInput({
    originalInput: originalInputV2,
    originalProperty: {},
    facts: [
      reviewedFact('roof', 'roof_modernization_year', 2010),
      reviewedFact('windows', 'window_modernization_year', 2016),
      reviewedFact('heating', 'heating_modernization_year', 2022),
      reviewedFact(
        'floorplan',
        'floorplan_modernization_year',
        2020,
        'accepted',
        {proofStatus: 'proven', scopeDescription: 'Grundriss teilweise verändert'},
      ),
    ],
    conflicts: [],
  });

  assert.equal(preview.input.modernization.roof, 0);
  assert.equal(preview.input.modernization.windows, 1);
  assert.equal(preview.input.modernization.heating, 2);
  assert.equal(preview.input.modernization.floorplan, 1);
});

test('does not map unproven V2 facts and warns on partially proven facts', () => {
  const preview = mapReviewedFactsToInput({
    originalInput: originalInputV2,
    originalProperty: {},
    facts: [
      reviewedFact(
        'roof',
        'roof_modernization_year',
        2022,
        'accepted',
        {proofStatus: 'not_proven'},
      ),
      reviewedFact(
        'windows',
        'window_modernization_year',
        2022,
        'accepted',
        {proofStatus: 'partially_proven'},
      ),
    ],
    conflicts: [],
  });

  assert.equal(preview.input.modernization.roof, 0);
  assert.equal(preview.input.modernization.windows, 2);
  assert.match(preview.warnings.join(' '), /nicht nachgewiesene Angabe/);
  assert.match(preview.warnings.join(' '), /teilweise nachgewiesen/);
});

function conflict(
  status: DocumentConflictRecord['resolution_status'],
  resolvedValue: number | null,
): Pick<DocumentConflictRecord, 'field_key' | 'fact_ids' | 'resolution_status' | 'resolved_value'> {
  return {
    field_key: 'construction_year',
    fact_ids: ['year'],
    resolution_status: status,
    resolved_value: resolvedValue,
  };
}
