import {canonicalizeFactValue} from './normalization.ts';
import {
  DOCUMENT_FIELD_LABELS,
  type ConflictSource,
  type DocumentFactRecord,
  type DocumentFieldKey,
  type NormalizedFactValue,
} from './types.ts';

export const CONFLICT_FIELD_KEYS = new Set<DocumentFieldKey>([
  'construction_year',
  'property_address',
  'living_area',
  'usable_area',
  'gross_floor_area',
  'building_type',
  'number_of_units',
  'roof_modernization_year',
  'window_modernization_year',
  'exterior_door_modernization_year',
  'heating_modernization_year',
  'plumbing_modernization_year',
  'electrical_modernization_year',
  'facade_insulation_year',
  'roof_insulation_year',
  'bathroom_modernization_year',
  'interior_modernization_year',
  'floorplan_modernization_year',
  'reference_date',
]);

export type FormFactSource = {
  fieldKey: DocumentFieldKey;
  value: NormalizedFactValue;
  label: string;
};

export type DetectedConflict = {
  fieldKey: DocumentFieldKey;
  factIds: string[];
  sources: ConflictSource[];
  summary: string;
};

export function detectDocumentConflicts(
  facts: Pick<
    DocumentFactRecord,
    'id' | 'field_key' | 'normalized_value' | 'reviewed_value' | 'review_status' | 'file_name' | 'page_number'
  >[],
  formSources: FormFactSource[],
): DetectedConflict[] {
  const grouped = new Map<DocumentFieldKey, ConflictSource[]>();

  for (const fact of facts) {
    if (fact.review_status === 'rejected' || !CONFLICT_FIELD_KEYS.has(fact.field_key)) continue;
    const value = fact.review_status === 'accepted' || fact.review_status === 'edited'
      ? fact.reviewed_value ?? fact.normalized_value
      : fact.normalized_value;
    addSource(grouped, fact.field_key, {
      kind: 'document',
      id: fact.id,
      label: `${fact.file_name}, Seite ${fact.page_number}`,
      value,
      fileName: fact.file_name,
      pageNumber: fact.page_number,
    });
  }

  for (const source of formSources) {
    if (!CONFLICT_FIELD_KEYS.has(source.fieldKey)) continue;
    addSource(grouped, source.fieldKey, {
      kind: 'form',
      id: `form:${source.fieldKey}`,
      label: source.label,
      value: source.value,
    });
  }

  const conflicts: DetectedConflict[] = [];
  for (const [fieldKey, sources] of grouped) {
    const distinctValues = new Set(
      sources
        .map((source) => canonicalizeFactValue(fieldKey, source.value))
        .filter((value): value is string => value !== null),
    );
    if (distinctValues.size <= 1) continue;

    conflicts.push({
      fieldKey,
      factIds: sources.filter((source) => source.kind === 'document').map((source) => source.id),
      sources,
      summary: `${DOCUMENT_FIELD_LABELS[fieldKey]} unterscheidet sich in den vorliegenden Angaben.`,
    });
  }

  return conflicts.sort((a, b) => DOCUMENT_FIELD_LABELS[a.fieldKey].localeCompare(DOCUMENT_FIELD_LABELS[b.fieldKey], 'de'));
}

function addSource(
  grouped: Map<DocumentFieldKey, ConflictSource[]>,
  fieldKey: DocumentFieldKey,
  source: ConflictSource,
) {
  if (canonicalizeFactValue(fieldKey, source.value) === null) return;
  const current = grouped.get(fieldKey) ?? [];
  current.push(source);
  grouped.set(fieldKey, current);
}

