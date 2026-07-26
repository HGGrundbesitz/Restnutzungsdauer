import {canonicalizeFactValue, normalizeBuildingType, normalizeExtractedValue} from './document-analysis/normalization.ts';
import {
  DOCUMENT_FIELD_LABELS,
  type DocumentConflictRecord,
  type DocumentFactRecord,
  type DocumentFieldKey,
  type NormalizedFactValue,
} from './document-analysis/types.ts';
import type {ModernizationQuestionKey} from './modernization-question-config.ts';
import type {
  ModernizationPeriod,
  RndAnswerIndex,
  RndInput,
  RndPropertyContext,
} from './types.ts';
import {isRndInputV2} from './validate-input.ts';

export type MappingChange = {
  fieldKey: DocumentFieldKey;
  target: string;
  originalValue: NormalizedFactValue;
  acceptedValue: NormalizedFactValue;
  sourceFactIds: string[];
  changed: boolean;
  modernizationKey?: ModernizationQuestionKey;
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
  'floorplan_modernization_year',
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
  applyFloorplanFact();

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
    modernizationKey: Exclude<ModernizationQuestionKey, 'floorplan'>,
  ) {
    const accepted = getAccepted(fieldKey);
    if (!accepted || typeof accepted.value !== 'number') return;
    const sourceFacts = acceptedFacts.filter((fact) => accepted.factIds.includes(fact.id));
    if (sourceFacts.some((fact) => ['not_proven', 'unknown'].includes(fact.fact_metadata?.proofStatus ?? ''))) {
      warnings.push(`${target}: Eine nicht nachgewiesene Angabe wurde nicht in den Rechner übernommen.`);
      return;
    }
    const year = sourceFacts[0]?.fact_metadata?.yearTo ?? sourceFacts[0]?.fact_metadata?.yearFrom ?? accepted.value;
    const converted = isRndInputV2(input)
      ? modernizationAnswerFromYear(year, input.referenceDate)
      : modernizationPeriodFromYear(year, input.referenceDate);
    if (converted === null) {
      warnings.push(`${target}: Das bestätigte Jahr liegt nach dem Stichtag und wurde nicht übernommen.`);
      return;
    }
    const originalValue = input.modernization[modernizationKey];
    if (isRndInputV2(input)) {
      input.modernization[modernizationKey] = converted as RndAnswerIndex;
    } else {
      input.modernization[modernizationKey] = converted as ModernizationPeriod;
    }
    if (sourceFacts.some((fact) => fact.fact_metadata?.proofStatus === 'partially_proven')) {
      warnings.push(`${target}: Die übernommene Modernisierung ist laut Dokument nur teilweise nachgewiesen.`);
    }
    addChange(
      fieldKey,
      `Modernisierung ${target}`,
      originalValue,
      converted,
      accepted.factIds,
      undefined,
      modernizationKey,
    );
  }

  function applyFloorplanFact() {
    const accepted = getAccepted('floorplan_modernization_year');
    if (!accepted) return;
    const sourceFacts = acceptedFacts.filter((fact) => accepted.factIds.includes(fact.id));
    if (sourceFacts.some((fact) => ['not_proven', 'unknown'].includes(fact.fact_metadata?.proofStatus ?? ''))) {
      warnings.push('Grundriss: Eine nicht nachgewiesene Angabe wurde nicht in den Rechner übernommen.');
      return;
    }
    if (!isRndInputV2(input)) {
      warnings.push('Grundriss: Der bestätigte Dokumenthinweis bleibt für die fachliche V1-Prüfung sichtbar.');
      return;
    }
    const answer = floorplanAnswerFromFacts(sourceFacts);
    if (answer === null) {
      warnings.push('Grundriss: Der Beleg beschreibt nicht eindeutig, ob die Änderung teilweise oder deutlich war.');
      return;
    }
    const originalValue = input.modernization.floorplan;
    input.modernization.floorplan = answer;
    addChange(
      'floorplan_modernization_year',
      'Modernisierung Grundriss',
      originalValue,
      answer,
      accepted.factIds,
      undefined,
      'floorplan',
    );
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
    modernizationKey?: ModernizationQuestionKey,
  ) {
    changes.push({fieldKey, target, originalValue, acceptedValue, sourceFactIds, changed, modernizationKey});
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

export function modernizationAnswerFromYear(year: number, referenceDate: string): RndAnswerIndex | null {
  const referenceYear = new Date(`${referenceDate}T00:00:00`).getFullYear();
  if (!Number.isInteger(year) || !Number.isInteger(referenceYear) || year > referenceYear) return null;
  const age = referenceYear - year;
  if (age > 15) return 0;
  if (age >= 10) return 1;
  return 2;
}

function floorplanAnswerFromFacts(
  facts: Array<Pick<DocumentFactRecord, 'fact_metadata'>>,
): RndAnswerIndex | null {
  for (const fact of facts) {
    const metadata = fact.fact_metadata;
    const description = metadata?.scopeDescription?.trim().toLocaleLowerCase('de-DE') ?? '';
    if (/\b(keine|nicht verändert|unverändert)\b/.test(description) || metadata?.scopePercent === 0) return 0;
    if (/\b(teilweise|in teilen)\b/.test(description)) return 1;
    if (/\b(wesentlich|deutlich|umfassend|vollständig)\b/.test(description)) return 2;
    if (metadata?.scopePercent === 100) return 2;
    if (typeof metadata?.scopePercent === 'number' && metadata.scopePercent > 0) return 1;
  }
  return null;
}

function serializeComparable(value: NormalizedFactValue) {
  return JSON.stringify(value);
}
