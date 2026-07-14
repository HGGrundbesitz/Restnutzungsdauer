import {canonicalizeFactValue, normalizeBuildingType, normalizeExtractedValue} from './document-analysis/normalization.ts';
import {
  DOCUMENT_FIELD_LABELS,
  type DocumentConflictRecord,
  type DocumentFactRecord,
  type DocumentFieldKey,
  type NormalizedFactValue,
} from './document-analysis/types.ts';
import type {ModernizationPeriod, RndInput, RndPropertyContext} from './types.ts';

export type MappingChange = {
  fieldKey: DocumentFieldKey;
  target: string;
  originalValue: NormalizedFactValue;
  acceptedValue: NormalizedFactValue;
  sourceFactIds: string[];
  changed: boolean;
};

export type ReviewedFactMappingPreview = {
  input: RndInput;
  property: RndPropertyContext;
  changes: MappingChange[];
  sourceFactIds: string[];
  blockedFields: DocumentFieldKey[];
  warnings: string[];
  canCalculate: boolean;
};

type MappingOptions = {
  originalInput: RndInput;
  originalProperty: RndPropertyContext;
  facts: Pick<
    DocumentFactRecord,
    'id' | 'field_key' | 'normalized_value' | 'reviewed_value' | 'review_status' | 'fact_metadata'
  >[];
  conflicts: Pick<
    DocumentConflictRecord,
    'field_key' | 'fact_ids' | 'resolution_status' | 'resolved_value'
  >[];
};

const DIRECTLY_MAPPABLE_FIELDS = new Set<DocumentFieldKey>([
  'property_address',
  'building_type',
  'construction_year',
  'reference_date',
  'living_area',
  'commercial_area',
  'total_usable_area',
  'energy_reference_area_an',
  'gross_floor_area',
  'usable_area',
  'number_of_units',
  'residential_units',
  'commercial_units',
  'total_units',
  'roof_modernization_year',
  'window_modernization_year',
  'heating_modernization_year',
  'plumbing_modernization_year',
  'facade_insulation_year',
  'bathroom_modernization_year',
  'interior_modernization_year',
]);

export function mapReviewedFactsToInput({
  originalInput,
  originalProperty,
  facts,
  conflicts,
}: MappingOptions): ReviewedFactMappingPreview {
  const input = structuredClone(originalInput);
  const property = {...originalProperty};
  const changes: MappingChange[] = [];
  const warnings: string[] = [];
  const blockedFields = conflicts
    .filter((conflict) => conflict.resolution_status === 'open' && DIRECTLY_MAPPABLE_FIELDS.has(conflict.field_key))
    .map((conflict) => conflict.field_key);
  const blockedSet = new Set(blockedFields);
  const acceptedFacts = facts.filter(
    (fact) => fact.review_status === 'accepted' || fact.review_status === 'edited',
  );
  const acceptedFactIds = new Set(acceptedFacts.map((fact) => fact.id));
  const grouped = new Map<DocumentFieldKey, typeof acceptedFacts>();
  for (const fact of acceptedFacts) {
    const current = grouped.get(fact.field_key) ?? [];
    current.push(fact);
    grouped.set(fact.field_key, current);
  }

  const resolvedByField = new Map(
    conflicts
      .filter((conflict) => conflict.resolution_status === 'resolved')
      .map((conflict) => [conflict.field_key, conflict]),
  );

  const getAccepted = (fieldKey: DocumentFieldKey) => {
    if (blockedSet.has(fieldKey)) return null;
    const resolved = resolvedByField.get(fieldKey);
    if (resolved && resolved.resolved_value !== null) {
      const reviewedSourceFactIds = resolved.fact_ids.filter((id) => acceptedFactIds.has(id));
      if (reviewedSourceFactIds.length === 0) {
        warnings.push(
          `${DOCUMENT_FIELD_LABELS[fieldKey]}: Der Widerspruch ist bearbeitet, aber noch keine Dokumentangabe wurde übernommen.`,
        );
        return null;
      }
      return {value: resolved.resolved_value, factIds: reviewedSourceFactIds};
    }

    const fieldFacts = grouped.get(fieldKey) ?? [];
    if (fieldFacts.length === 0) return null;
    const distinct = new Map<string, {value: NormalizedFactValue; factIds: string[]}>();
    for (const fact of fieldFacts) {
      const value = fact.reviewed_value ?? fact.normalized_value;
      const canonical = canonicalizeFactValue(fieldKey, value);
      if (canonical === null) continue;
      const existing = distinct.get(canonical);
      if (existing) existing.factIds.push(fact.id);
      else distinct.set(canonical, {value, factIds: [fact.id]});
    }
    if (distinct.size > 1) {
      blockedSet.add(fieldKey);
      return null;
    }
    return Array.from(distinct.values())[0] ?? null;
  };

  applyDirect('reference_date', 'Stichtag', input.referenceDate, (value) => {
    if (typeof value === 'string') input.referenceDate = value;
  });
  applyDirect('construction_year', 'Baujahr', input.constructionYear, (value) => {
    if (typeof value === 'number') input.constructionYear = value;
  });
  applyDirect('building_type', 'Gebäudeart', input.buildingTypeCode, (value) => {
    const buildingType = normalizeBuildingType(value);
    if (buildingType) input.buildingTypeCode = buildingType;
  });
  applyDirect('property_address', 'Objektadresse', property.address ?? null, (value) => {
    if (typeof value === 'string') property.address = value;
  });

  const livingArea = getAccepted('living_area');
  const commercialArea = getAccepted('commercial_area');
  const totalArea = getAccepted('total_usable_area');
  const usableArea = getAccepted('usable_area');
  const preferredArea = totalArea ?? usableArea ?? livingArea;
  if (livingArea && usableArea && livingArea.value !== usableArea.value) {
    warnings.push('Wohnfläche und Nutzfläche sind getrennte Angaben. Für das Formular wird die bestätigte Wohnfläche verwendet.');
  }
  if (preferredArea && typeof preferredArea.value === 'number') {
    addChange(
      livingArea ? 'living_area' : 'usable_area',
      'Fläche im Anfragekontext',
      property.area ?? null,
      preferredArea.value,
      preferredArea.factIds,
    );
    property.area = preferredArea.value;
    property.totalUsableArea = preferredArea.value;
  }
  if (livingArea && typeof livingArea.value === 'number') property.livingArea = livingArea.value;
  if (commercialArea && typeof commercialArea.value === 'number') property.commercialArea = commercialArea.value;
  applyContextNumber('energy_reference_area_an', 'energyReferenceAreaAn');
  applyContextNumber('gross_floor_area', 'grossFloorAreaBgf');

  applyContextNumber('residential_units', 'residentialUnits');
  applyContextNumber('commercial_units', 'commercialUnits');
  const totalUnits = getAccepted('total_units') ?? getAccepted('number_of_units');
  if (totalUnits && typeof totalUnits.value === 'number') {
    property.units = totalUnits.value;
    property.totalUnits = totalUnits.value;
  } else if (property.residentialUnits != null && property.commercialUnits != null) {
    property.units = property.totalUnits = property.residentialUnits + property.commercialUnits;
  }

  applyModernizationYear('roof_modernization_year', 'Dach', 'roof');
  applyModernizationYear('window_modernization_year', 'Fenster', 'windows');
  applyModernizationYear('plumbing_modernization_year', 'Leitungen', 'pipes');
  applyModernizationYear('heating_modernization_year', 'Heizung', 'heating');
  applyModernizationYear('facade_insulation_year', 'Außenwände', 'exteriorWalls');
  applyModernizationYear('bathroom_modernization_year', 'Bäder', 'bathrooms');
  applyModernizationYear('interior_modernization_year', 'Innenausbau', 'interior');

  for (const fact of acceptedFacts) {
    if (!DIRECTLY_MAPPABLE_FIELDS.has(fact.field_key)) {
      warnings.push(
        `${DOCUMENT_FIELD_LABELS[fact.field_key]} ist bestätigt, hat aber im aktuellen Rechner noch kein direktes Eingabefeld.`,
      );
    }
  }

  const allBlockedFields = Array.from(blockedSet);
  if (allBlockedFields.length > 0) {
    warnings.push(
      `Bitte prüfen Sie noch: ${allBlockedFields.map((field) => DOCUMENT_FIELD_LABELS[field]).join(', ')}.`,
    );
  }
  const sourceFactIds = Array.from(new Set(changes.flatMap((change) => change.sourceFactIds)));
  return {
    input,
    property,
    changes,
    sourceFactIds,
    blockedFields: allBlockedFields,
    warnings: Array.from(new Set(warnings)),
    canCalculate: allBlockedFields.length === 0,
  };

  function applyDirect(
    fieldKey: DocumentFieldKey,
    target: string,
    originalValue: NormalizedFactValue,
    apply: (value: NormalizedFactValue) => void,
  ) {
    const accepted = getAccepted(fieldKey);
    if (!accepted) return;
    const normalized = normalizeExtractedValue(fieldKey, accepted.value);
    if (normalized === null) {
      warnings.push(`${target} konnte nicht sicher in den Rechner übernommen werden.`);
      return;
    }
    const before = serializeComparable(originalValue);
    apply(normalized);
    addChange(fieldKey, target, originalValue, normalized, accepted.factIds, before !== serializeComparable(normalized));
  }

  function applyModernizationYear(
    fieldKey: DocumentFieldKey,
    target: string,
    modernizationKey: keyof Omit<RndInput['modernization'], 'floorplan'>,
  ) {
    const accepted = getAccepted(fieldKey);
    if (!accepted || typeof accepted.value !== 'number') return;
    const sourceFacts = acceptedFacts.filter((fact) => accepted.factIds.includes(fact.id));
    if (sourceFacts.some((fact) => ['not_proven', 'unknown'].includes(fact.fact_metadata?.proofStatus ?? ''))) return;
    const year = sourceFacts[0]?.fact_metadata?.yearTo ?? sourceFacts[0]?.fact_metadata?.yearFrom ?? accepted.value;
    const period = modernizationPeriodFromYear(year, input.referenceDate);
    if (!period) {
      warnings.push(`${target}: Das bestätigte Jahr liegt nach dem Stichtag und wurde nicht übernommen.`);
      return;
    }
    const originalValue = input.modernization[modernizationKey];
    input.modernization[modernizationKey] = period;
    addChange(fieldKey, `Modernisierung ${target}`, originalValue, period, accepted.factIds);
  }

  function applyContextNumber(fieldKey: DocumentFieldKey, key: keyof RndPropertyContext) {
    const accepted = getAccepted(fieldKey);
    if (accepted && typeof accepted.value === 'number') (property[key] as number | undefined) = accepted.value;
  }

  function addChange(
    fieldKey: DocumentFieldKey,
    target: string,
    originalValue: NormalizedFactValue,
    acceptedValue: NormalizedFactValue,
    sourceFactIds: string[],
    changed = serializeComparable(originalValue) !== serializeComparable(acceptedValue),
  ) {
    changes.push({fieldKey, target, originalValue, acceptedValue, sourceFactIds, changed});
  }
}

export function modernizationPeriodFromYear(year: number, referenceDate: string): ModernizationPeriod | null {
  const referenceYear = new Date(`${referenceDate}T00:00:00`).getFullYear();
  if (!Number.isInteger(year) || !Number.isInteger(referenceYear) || year > referenceYear) return null;
  const age = referenceYear - year;
  if (age <= 5) return 'within_5';
  if (age <= 10) return 'within_10';
  if (age <= 15) return 'within_15';
  if (age <= 20) return 'within_20';
  return 'older_or_never';
}

function serializeComparable(value: NormalizedFactValue) {
  return JSON.stringify(value);
}
