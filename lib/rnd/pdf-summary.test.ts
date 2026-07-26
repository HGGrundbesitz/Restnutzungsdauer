import assert from 'node:assert/strict';
import test from 'node:test';
import {calculateRndV2} from './calculate-rnd.ts';
import {createRndSummaryPdf, getPublicSummaryRows} from './pdf-summary.ts';
import {RND_INPUT_V2_SCHEMA_VERSION} from './types.ts';

const result = calculateRndV2({
  schemaVersion: RND_INPUT_V2_SCHEMA_VERSION,
  buildingTypeCode: 'multi_family',
  referenceDate: '2026-01-01',
  constructionYear: 1975,
  modernization: {
    roof: 2,
    windows: 1,
    pipes: 0,
    heating: 2,
    exteriorWalls: 1,
    bathrooms: 1,
    interior: 0,
    floorplan: 1,
  },
});

test('creates a customer PDF even when optional user text contains unsupported glyphs', async () => {
  const pdf = await createRndSummaryPdf(result, {
    address: 'Musterstraße 12 – Köln � 🏠',
    area: 225,
    units: 3,
  });

  assert.ok(pdf.length > 1_000);
  assert.equal(Buffer.from(pdf.subarray(0, 5)).toString('ascii'), '%PDF-');
});

test('public PDF rows exclude internal calculation details', () => {
  const rows = getPublicSummaryRows(result, {
    address: 'Musterstraße 12',
    area: 225,
    units: 3,
  });
  const labels = rows.map(([label]) => label);

  assert.deepEqual(labels, [
    'Gebäudeart',
    'Baujahr',
    'Objekt',
    'Fläche',
    'Nutzungseinheiten',
  ]);
  for (const hiddenLabel of ['GND', 'Punkte', 'Koeffizient', 'Methode', 'Stichtag', 'Modellversion']) {
    assert.equal(labels.includes(hiddenLabel), false);
  }
});
