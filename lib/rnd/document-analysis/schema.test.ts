import assert from 'node:assert/strict';
import test from 'node:test';
import {parseDocumentExtractionOutput} from './schema.ts';

const context = {
  documentPath: 'rnd-estimates/11111111-1111-4111-8111-111111111111/bauakte.pdf',
  fileName: 'bauakte.pdf',
  pageCount: 5,
};

function validOutput(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    documentSummary: 'Bauakte mit einer eindeutig genannten Jahreszahl.',
    facts: [
      {
        fieldKey: 'construction_year',
        normalizedValue: 1975,
        originalValue: 'Das mittlere Baujahr wird mit etwa 1975 ermittelt.',
        documentPath: 'untrusted/model/path.pdf',
        fileName: 'untrusted.pdf',
        pageNumber: 4,
        evidenceText: 'Das mittlere Baujahr wird mit etwa 1975 ermittelt.',
        confidence: 0.94,
        extractionNotes: 'Im Dokument als ungefähr bezeichnet.',
        status: 'pending_review',
        ...overrides,
      },
    ],
  });
}

test('validates a structured extraction and enforces the trusted file context', () => {
  const result = parseDocumentExtractionOutput(validOutput(), context);

  assert.equal(result.facts.length, 1);
  assert.equal(result.facts[0].normalizedValue, 1975);
  assert.equal(result.facts[0].documentPath, context.documentPath);
  assert.equal(result.facts[0].fileName, context.fileName);
  assert.equal(result.facts[0].status, 'pending_review');
});

test('rejects facts without a valid PDF page or with an automatic approval', () => {
  assert.throws(
    () => parseDocumentExtractionOutput(validOutput({pageNumber: 8}), context),
    /PDF-Seite/,
  );
  assert.throws(
    () => parseDocumentExtractionOutput(validOutput({status: 'accepted'}), context),
    /automatisch bestätigt/,
  );
});

test('rejects malformed or extended AI objects instead of storing them', () => {
  const extended = JSON.parse(validOutput()) as Record<string, unknown>;
  extended.unexpected = 'not allowed';

  assert.throws(
    () => parseDocumentExtractionOutput(JSON.stringify(extended), context),
    /unerwartetes Format/,
  );
  assert.throws(
    () => parseDocumentExtractionOutput(validOutput({normalizedValue: null}), context),
    /ungültigen normalisierten Wert/,
  );
});

