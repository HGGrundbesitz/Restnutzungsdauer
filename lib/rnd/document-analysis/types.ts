export const DOCUMENT_FIELD_KEYS = [
  'property_address',
  'building_type',
  'building_use',
  'construction_year',
  'reference_date',
  'living_area',
  'commercial_area',
  'total_usable_area',
  'energy_reference_area_an',
  'usable_area',
  'gross_floor_area',
  'residential_units',
  'commercial_units',
  'total_units',
  'number_of_units',
  'roof_repair_year',
  'roof_modernization_status',
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
  'known_damage',
  'maintenance_backlog',
  'heritage_status',
  'legal_restrictions',
  'document_type',
] as const;

export type DocumentFieldKey = (typeof DOCUMENT_FIELD_KEYS)[number];
export type NormalizedFactValue = string | number | boolean | null;
export type FactReviewStatus = 'pending_review' | 'accepted' | 'edited' | 'rejected';
export type ConflictResolutionStatus = 'open' | 'resolved' | 'acknowledged';
export type AnalysisRunStatus = 'running' | 'completed' | 'failed' | 'superseded';
export type EvidenceQuality = 'high' | 'medium' | 'low';
export type ProofStatus = 'proven' | 'partially_proven' | 'not_proven' | 'unknown';

export type FactMetadata = {
  yearFrom?: number | null;
  yearTo?: number | null;
  scopePercent?: number | null;
  scopeDescription?: string | null;
  evidenceQuality?: EvidenceQuality | null;
  proofStatus?: ProofStatus | null;
};

export const DOCUMENT_FIELD_LABELS: Record<DocumentFieldKey, string> = {
  property_address: 'Objektadresse',
  building_type: 'Gebäudeart',
  building_use: 'Nutzung',
  construction_year: 'Baujahr',
  reference_date: 'Stichtag',
  living_area: 'Wohnfläche',
  commercial_area: 'Gewerbefläche',
  total_usable_area: 'Wohn- und Nutzfläche gesamt',
  energy_reference_area_an: 'Gebäudenutzfläche AN',
  usable_area: 'Nutzfläche',
  gross_floor_area: 'Bruttogrundfläche',
  residential_units: 'Wohnungen',
  commercial_units: 'Gewerbeeinheiten',
  total_units: 'Nutzungseinheiten gesamt',
  number_of_units: 'Nutzungseinheiten',
  roof_repair_year: 'Dachreparatur',
  roof_modernization_status: 'Dachmodernisierung nachgewiesen',
  roof_modernization_year: 'Dach modernisiert',
  window_modernization_year: 'Fenster modernisiert',
  exterior_door_modernization_year: 'Außentüren modernisiert',
  heating_modernization_year: 'Heizung modernisiert',
  plumbing_modernization_year: 'Leitungen modernisiert',
  electrical_modernization_year: 'Elektrik modernisiert',
  facade_insulation_year: 'Fassade gedämmt',
  roof_insulation_year: 'Dach gedämmt',
  bathroom_modernization_year: 'Bäder modernisiert',
  interior_modernization_year: 'Innenausbau modernisiert',
  floorplan_modernization_year: 'Grundriss modernisiert',
  known_damage: 'Bekannte Schäden',
  maintenance_backlog: 'Instandhaltungsstau',
  heritage_status: 'Denkmalschutz',
  legal_restrictions: 'Rechtliche Einschränkungen',
  document_type: 'Dokumentart',
};

export type ExtractedDocumentFact = {
  fieldKey: DocumentFieldKey;
  normalizedValue: Exclude<NormalizedFactValue, null>;
  originalValue: string;
  documentPath: string;
  fileName: string;
  pageNumber: number;
  evidenceText: string;
  confidence: number;
  extractionNotes: string;
  metadata: FactMetadata;
  status: 'pending_review';
};

export type DocumentExtractionResult = {
  documentSummary: string;
  facts: ExtractedDocumentFact[];
};

export type DocumentFactRecord = {
  id: string;
  request_id: string;
  analysis_run_id: string;
  document_path: string;
  file_name: string;
  field_key: DocumentFieldKey;
  normalized_value: NormalizedFactValue;
  original_value: string;
  page_number: number;
  evidence_text: string;
  confidence: number;
  extraction_notes: string;
  fact_metadata: FactMetadata;
  review_status: FactReviewStatus;
  reviewed_value: NormalizedFactValue;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ConflictSource = {
  kind: 'document' | 'form';
  id: string;
  label: string;
  value: NormalizedFactValue;
  fileName?: string;
  pageNumber?: number;
};

export type DocumentConflictRecord = {
  id: string;
  request_id: string;
  field_key: DocumentFieldKey;
  fact_ids: string[];
  source_values: ConflictSource[];
  conflict_summary: string;
  resolution_status: ConflictResolutionStatus;
  resolved_value: NormalizedFactValue;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentAnalysisRunRecord = {
  id: string;
  request_id: string;
  document_path: string;
  file_name: string;
  model: string;
  prompt_version: string;
  schema_version: string;
  status: AnalysisRunStatus;
  is_current: boolean;
  superseded_at: string | null;
  superseded_by_run_id: string | null;
  document_summary: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewBundle = {
  runs: DocumentAnalysisRunRecord[];
  facts: DocumentFactRecord[];
  conflicts: DocumentConflictRecord[];
  signedDocumentUrls: Record<string, string>;
};
