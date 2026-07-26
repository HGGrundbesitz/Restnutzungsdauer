import assert from 'node:assert/strict';
import test from 'node:test';
import {calculateRndV2} from './calculate-rnd.ts';
import {createCustomerEmailHtml, createInternalEmailHtml} from './email-copy.ts';
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

test('customer email exposes the estimate but no internal calculation details', () => {
  const html = createCustomerEmailHtml({firstName: '<Josef>'}, result);

  assert.match(html, /unverbindliche Ersteinschätzung/);
  assert.match(html, new RegExp(`ca\\. ${result.modifiedRnd} Jahre`));
  assert.match(html, /&lt;Josef&gt;/);
  assert.doesNotMatch(html, /Modernisierungspunkte/);
  assert.doesNotMatch(html, /\bGND\b/);
  assert.doesNotMatch(html, /immowertv-clickflow-v2/);
  assert.doesNotMatch(html, /immowertv_formula/);
});

test('internal email retains the auditable calculation details', () => {
  const html = createInternalEmailHtml({
    contact: {
      firstName: 'Josef',
      lastName: 'Muster',
      email: 'josef@example.test',
      consent: true,
    },
    property: {
      address: 'Musterstraße 1',
      area: 240,
      units: 4,
    },
    result,
    requestId: 'request-123',
    documentCount: 2,
  });

  assert.match(html, /Modernisierungspunkte/);
  assert.match(html, /\bGND\b/);
  assert.match(html, /immowertv-clickflow-v2/);
  assert.match(html, /immowertv_formula/);
  assert.match(html, /Dokumente:<\/strong> 2/);
});
