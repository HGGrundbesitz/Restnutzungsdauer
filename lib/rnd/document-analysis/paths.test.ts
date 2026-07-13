import assert from 'node:assert/strict';
import test from 'node:test';
import {hasPdfMagicBytes, isAllowedDocumentPath, safePdfName} from './paths.ts';

test('accepts only private request PDF paths', () => {
  assert.equal(
    isAllowedDocumentPath('rnd-estimates/11111111-1111-4111-8111-111111111111/grundriss.pdf'),
    true,
  );
  assert.equal(isAllowedDocumentPath('requests/quick-check/test@example.com/document.pdf'), true);
  assert.equal(isAllowedDocumentPath('../private/document.pdf'), false);
  assert.equal(isAllowedDocumentPath('rnd-estimates/id/document.exe'), false);
  assert.equal(isAllowedDocumentPath('rnd-estimates\\id\\document.pdf'), false);
});

test('recognizes PDF magic bytes and sanitizes display names', () => {
  assert.equal(hasPdfMagicBytes(Buffer.from('%PDF-1.7\n')), true);
  assert.equal(hasPdfMagicBytes(Buffer.from('not-a-pdf')), false);
  assert.equal(safePdfName('rnd-estimates/id/Grundriss März.pdf'), 'Grundriss-M-rz.pdf');
});

