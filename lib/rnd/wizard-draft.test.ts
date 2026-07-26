import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseRndWizardDraft,
  RND_WIZARD_DRAFT_MAX_AGE_MS,
  RND_WIZARD_DRAFT_SCHEMA_VERSION,
} from './wizard-draft.ts';

const NOW = Date.UTC(2026, 6, 26, 12);
const VALID_DRAFT = {
  schemaVersion: RND_WIZARD_DRAFT_SCHEMA_VERSION,
  savedAt: NOW,
  step: 'contact',
  referenceDate: '2026-01-01',
  buildingTypeCode: 'single_family',
  constructionYear: 1975,
  modernization: {
    roof: 2,
    windows: 1,
    pipes: 0,
    heating: 2,
    exteriorWalls: 1,
    bathrooms: 0,
    interior: 2,
    floorplan: 1,
  },
  property: {address: 'Musterstraße 1', area: 225, units: 1},
  contact: {
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'max@example.test',
    phone: '+4915123456789',
    consent: true,
  },
};

test('restores a valid session draft with contact and property data', () => {
  const draft = parseRndWizardDraft(JSON.stringify(VALID_DRAFT), NOW);
  assert.equal(draft?.step, 'contact');
  assert.equal(draft?.contact.email, 'max@example.test');
  assert.equal(draft?.property.area, 225);
  assert.equal(draft?.modernization.roof, 2);
});

test('restores the final review step without weakening draft validation', () => {
  const draft = parseRndWizardDraft(JSON.stringify({...VALID_DRAFT, step: 'review'}), NOW);
  assert.equal(draft?.step, 'review');
  assert.equal(draft?.contact.consent, true);
});

test('rejects expired, malformed and manipulated drafts', () => {
  assert.equal(parseRndWizardDraft('{broken', NOW), null);
  assert.equal(
    parseRndWizardDraft(JSON.stringify({...VALID_DRAFT, savedAt: NOW - RND_WIZARD_DRAFT_MAX_AGE_MS - 1}), NOW),
    null,
  );
  assert.equal(
    parseRndWizardDraft(JSON.stringify({...VALID_DRAFT, buildingTypeCode: 'unknown'}), NOW),
    null,
  );
  assert.equal(
    parseRndWizardDraft(JSON.stringify({...VALID_DRAFT, modernization: {...VALID_DRAFT.modernization, roof: 9}}), NOW),
    null,
  );
});
