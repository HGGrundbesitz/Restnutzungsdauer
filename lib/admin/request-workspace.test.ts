import assert from 'node:assert/strict';
import test from 'node:test';
import {buildRequestTimeline, getRequestNextAction} from './request-workspace.ts';
import type {AdminRequestRecord} from './request-types.ts';
import type {ReviewBundle} from '../rnd/document-analysis/types.ts';

const request: AdminRequestRecord = {
  id: 'request-1',
  created_at: '2026-07-26T08:00:00.000Z',
  name: 'Erika Muster',
  email: 'erika@example.com',
  phone: null,
  address: 'Musterstraße 1',
  year: 1980,
  status: 'reviewing',
  documents: ['request-1/test.pdf'],
  rnd_estimates: null,
};

function bundle(overrides: Partial<ReviewBundle> = {}): ReviewBundle {
  return {
    runs: [],
    facts: [],
    conflicts: [],
    factAudits: [],
    calculationSnapshots: [],
    statusEvents: [],
    reviewerLabels: {},
    signedDocumentUrls: {},
    ...overrides,
  };
}

test('prioritizes analysis before request completion', () => {
  assert.equal(getRequestNextAction(request, bundle()).label, 'Dokumente analysieren');
});

test('keeps conflicts and pending facts ahead of status completion', () => {
  const completedRun = {
    id: 'run-1',
    request_id: request.id,
    document_path: request.documents[0],
    file_name: 'test.pdf',
    model: 'test-model',
    prompt_version: 'v1',
    schema_version: 'v1',
    status: 'completed' as const,
    is_current: true,
    superseded_at: null,
    superseded_by_run_id: null,
    document_summary: null,
    error_message: null,
    created_at: '2026-07-26T08:30:00.000Z',
    updated_at: '2026-07-26T08:31:00.000Z',
  };
  const conflict = {
    id: 'conflict-1',
    request_id: request.id,
    field_key: 'construction_year' as const,
    fact_ids: ['fact-1'],
    source_values: [],
    conflict_summary: 'Abweichendes Baujahr',
    resolution_status: 'open' as const,
    resolved_value: null,
    resolved_by: null,
    resolved_at: null,
    created_at: '2026-07-26T09:00:00.000Z',
    updated_at: '2026-07-26T09:00:00.000Z',
  };

  assert.equal(
    getRequestNextAction(request, bundle({runs: [completedRun], conflicts: [conflict]})).label,
    'Widersprüche klären',
  );
});

test('builds a reverse chronological immutable timeline', () => {
  const timeline = buildRequestTimeline(
    request,
    bundle({
      statusEvents: [
        {
          id: 'status-1',
          request_id: request.id,
          previous_status: 'pending',
          new_status: 'reviewing',
          admin_user_id: 'admin-1',
          created_at: '2026-07-26T10:00:00.000Z',
        },
      ],
      reviewerLabels: {'admin-1': 'Max Admin'},
    }),
  );

  assert.deepEqual(
    timeline.map((entry) => entry.id),
    ['status:status-1', 'request:request-1'],
  );
  assert.equal(timeline[0].actor, 'Max Admin');
  assert.equal(timeline[0].title, 'Status: In Bearbeitung');
  assert.equal(timeline[0].description, 'Geändert von Neu');
});
