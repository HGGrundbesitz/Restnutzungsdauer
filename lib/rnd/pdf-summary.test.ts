import assert from 'node:assert/strict';
import test from 'node:test';
import {calculateRnd} from './calculate-rnd.ts';
import {createRndSummaryPdf} from './pdf-summary.ts';

test('creates a PDF even when optional user text contains unsupported glyphs', async () => {
  const result = calculateRnd({
    buildingTypeCode: 'multi_family',
    referenceDate: '2026-01-01',
    constructionYear: 1975,
    coreRenovation: false,
    modernization: {
      roof: 'within_5',
      windows: 'within_15',
      pipes: 'within_20',
      heating: 'within_10',
      exteriorWalls: 'within_15',
      bathrooms: 'within_10',
      interior: 'within_20',
      floorplan: 'partial',
    },
  });

  const pdf = await createRndSummaryPdf(result, {
    address: 'Musterstraße 12 – Köln � 🏠',
    area: 225,
    units: 3,
  });

  assert.ok(pdf.length > 1_000);
  assert.equal(Buffer.from(pdf.subarray(0, 5)).toString('ascii'), '%PDF-');
});
