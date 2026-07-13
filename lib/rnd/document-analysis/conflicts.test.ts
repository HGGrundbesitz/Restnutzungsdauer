import assert from 'node:assert/strict';
import test from 'node:test';
import {detectDocumentConflicts} from './conflicts.ts';
import type {DocumentFactRecord} from './types.ts';

function fact(
  id: string,
  value: number | string,
  reviewStatus: DocumentFactRecord['review_status'] = 'pending_review',
  reviewedValue: number | string | null = null,
): Pick<
  DocumentFactRecord,
  'id' | 'field_key' | 'normalized_value' | 'reviewed_value' | 'review_status' | 'file_name' | 'page_number'
> {
  return {
    id,
    field_key: 'construction_year',
    normalized_value: value,
    reviewed_value: reviewedValue,
    review_status: reviewStatus,
    file_name: `${id}.pdf`,
    page_number: 2,
  };
}

test('detects unequal normalized values across documents and form input', () => {
  const conflicts = detectDocumentConflicts(
    [fact('bauzeichnung', 1968), fact('kaufvertrag', 1972)],
    [{fieldKey: 'construction_year', value: 1975, label: 'Angabe im Formular'}],
  );

  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].fieldKey, 'construction_year');
  assert.deepEqual(conflicts[0].factIds, ['bauzeichnung', 'kaufvertrag']);
  assert.equal(conflicts[0].sources.length, 3);
});

test('uses an edited review value and ignores rejected facts', () => {
  const conflicts = detectDocumentConflicts(
    [fact('edited', 1968, 'edited', 1975), fact('rejected', 1972, 'rejected')],
    [{fieldKey: 'construction_year', value: 1975, label: 'Angabe im Formular'}],
  );

  assert.equal(conflicts.length, 0);
});

