import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canonicalizeFactValue,
  normalizeBuildingType,
  normalizeExtractedValue,
} from './normalization.ts';

test('normalizes German dates, years and localized areas', () => {
  assert.equal(normalizeExtractedValue('construction_year', '1975'), 1975);
  assert.equal(normalizeExtractedValue('reference_date', '01.02.2026'), '2026-02-01');
  assert.equal(normalizeExtractedValue('living_area', '1.234,50 m²'), 1234.5);
  assert.equal(normalizeExtractedValue('number_of_units', '4'), 4);
});

test('rejects impossible normalized values', () => {
  assert.equal(normalizeExtractedValue('construction_year', '75'), null);
  assert.equal(normalizeExtractedValue('reference_date', '31.02.2026'), null);
  assert.equal(normalizeExtractedValue('number_of_units', '2,5'), null);
});

test('maps only supported building descriptions and canonicalizes addresses', () => {
  assert.equal(normalizeBuildingType('Wohn- und Geschäftshaus'), 'mixed_use_residential');
  assert.equal(normalizeBuildingType('Raumschiff'), null);
  assert.equal(
    canonicalizeFactValue('property_address', 'Musterstraße 1, 59302 Oelde'),
    canonicalizeFactValue('property_address', 'Musterstraße 1  59302 Oelde.'),
  );
});

