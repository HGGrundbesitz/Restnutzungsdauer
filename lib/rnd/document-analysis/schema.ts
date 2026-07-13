import {DOCUMENT_FIELD_KEYS, type DocumentExtractionResult, type ExtractedDocumentFact, type NormalizedFactValue} from './types.ts';
import {normalizeExtractedValue} from './normalization.ts';

export const DOCUMENT_EXTRACTION_SCHEMA_VERSION = 'rnd-document-facts-v2';

export const DOCUMENT_EXTRACTION_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['documentSummary', 'facts'],
  properties: {
    documentSummary: {type: 'string', maxLength: 1_000},
    facts: {
      type: 'array',
      maxItems: 80,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'fieldKey',
          'normalizedValue',
          'originalValue',
          'documentPath',
          'fileName',
          'pageNumber',
          'evidenceText',
          'confidence',
          'extractionNotes',
          'metadata',
          'status',
        ],
        properties: {
          fieldKey: {type: 'string', enum: DOCUMENT_FIELD_KEYS},
          normalizedValue: {
            anyOf: [{type: 'string'}, {type: 'number'}, {type: 'boolean'}],
          },
          originalValue: {type: 'string', maxLength: 2_000},
          documentPath: {type: 'string', maxLength: 500},
          fileName: {type: 'string', maxLength: 240},
          pageNumber: {type: 'integer', minimum: 1, maximum: 10_000},
          evidenceText: {type: 'string', maxLength: 2_000},
          confidence: {type: 'number', minimum: 0, maximum: 1},
          extractionNotes: {type: 'string', maxLength: 1_000},
          metadata: {
            type: 'object',
            additionalProperties: false,
            properties: {
              yearFrom: {anyOf: [{type: 'integer'}, {type: 'null'}]},
              yearTo: {anyOf: [{type: 'integer'}, {type: 'null'}]},
              scopePercent: {anyOf: [{type: 'number', minimum: 0, maximum: 100}, {type: 'null'}]},
              scopeDescription: {anyOf: [{type: 'string', maxLength: 500}, {type: 'null'}]},
              evidenceQuality: {anyOf: [{type: 'string', enum: ['high', 'medium', 'low']}, {type: 'null'}]},
              proofStatus: {anyOf: [{type: 'string', enum: ['proven', 'partially_proven', 'not_proven', 'unknown']}, {type: 'null'}]},
            },
          },
          status: {type: 'string', enum: ['pending_review']},
        },
      },
    },
  },
} as const;

type ParseContext = {
  documentPath: string;
  fileName: string;
  pageCount: number;
};

export function parseDocumentExtractionOutput(raw: string, context: ParseContext): DocumentExtractionResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Die KI-Antwort ist kein gültiges JSON.');
  }

  if (!isPlainRecord(parsed) || !hasOnlyKeys(parsed, ['documentSummary', 'facts'])) {
    throw new Error('Die KI-Antwort hat ein unerwartetes Format.');
  }

  if (typeof parsed.documentSummary !== 'string' || parsed.documentSummary.length > 1_000) {
    throw new Error('Die Dokumentzusammenfassung ist ungültig.');
  }

  if (!Array.isArray(parsed.facts) || parsed.facts.length > 80) {
    throw new Error('Die Faktenliste ist ungültig.');
  }

  const facts = parsed.facts.map((value, index) => parseFact(value, index, context));
  const seen = new Set<string>();

  return {
    documentSummary: parsed.documentSummary.replace(/\s+/g, ' ').trim().slice(0, 1_000),
    facts: facts.filter((fact) => {
      const key = `${fact.fieldKey}|${fact.pageNumber}|${fact.evidenceText.toLocaleLowerCase('de-DE')}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  };
}

function parseFact(value: unknown, index: number, context: ParseContext): ExtractedDocumentFact {
  const allowedKeys = [
    'fieldKey',
    'normalizedValue',
    'originalValue',
    'documentPath',
    'fileName',
    'pageNumber',
    'evidenceText',
    'confidence',
    'extractionNotes',
    'metadata',
    'status',
  ];

  if (!isPlainRecord(value) || !hasOnlyKeys(value, allowedKeys)) {
    throw new Error(`Fakt ${index + 1} hat ein unerwartetes Format.`);
  }

  if (typeof value.fieldKey !== 'string' || !DOCUMENT_FIELD_KEYS.includes(value.fieldKey as (typeof DOCUMENT_FIELD_KEYS)[number])) {
    throw new Error(`Fakt ${index + 1} enthält einen unbekannten Feldschlüssel.`);
  }
  const fieldKey = value.fieldKey as ExtractedDocumentFact['fieldKey'];

  if (!isNormalizedValue(value.normalizedValue)) {
    throw new Error(`Fakt ${index + 1} enthält einen ungültigen normalisierten Wert.`);
  }
  const normalizedValue = normalizeExtractedValue(fieldKey, value.normalizedValue);
  if (normalizedValue === null) {
    throw new Error(`Fakt ${index + 1} konnte nicht sicher normalisiert werden.`);
  }

  if (typeof value.originalValue !== 'string' || !value.originalValue.trim() || value.originalValue.length > 2_000) {
    throw new Error(`Fakt ${index + 1} enthält keinen gültigen Originalwert.`);
  }
  if (typeof value.evidenceText !== 'string' || !value.evidenceText.trim() || value.evidenceText.length > 2_000) {
    throw new Error(`Fakt ${index + 1} enthält keine gültige Textstelle.`);
  }
  if (!Number.isInteger(value.pageNumber) || Number(value.pageNumber) < 1 || Number(value.pageNumber) > context.pageCount) {
    throw new Error(`Fakt ${index + 1} verweist auf eine ungültige PDF-Seite.`);
  }
  if (typeof value.confidence !== 'number' || !Number.isFinite(value.confidence) || value.confidence < 0 || value.confidence > 1) {
    throw new Error(`Fakt ${index + 1} enthält eine ungültige Sicherheit.`);
  }
  if (typeof value.extractionNotes !== 'string' || value.extractionNotes.length > 1_000) {
    throw new Error(`Fakt ${index + 1} enthält ungültige Prüfhinweise.`);
  }
  if (value.status !== 'pending_review') {
    throw new Error(`Fakt ${index + 1} darf nicht automatisch bestätigt werden.`);
  }
  const metadata = parseFactMetadata(value.metadata, index);

  return {
    fieldKey,
    normalizedValue,
    originalValue: value.originalValue.replace(/\s+/g, ' ').trim(),
    documentPath: context.documentPath,
    fileName: context.fileName,
    pageNumber: Number(value.pageNumber),
    evidenceText: value.evidenceText.replace(/\s+/g, ' ').trim(),
    confidence: Math.round(value.confidence * 100) / 100,
    extractionNotes: value.extractionNotes.replace(/\s+/g, ' ').trim(),
    metadata,
    status: 'pending_review',
  };
}

function parseFactMetadata(value: unknown, index: number): ExtractedDocumentFact['metadata'] {
  if (!isPlainRecord(value)) {
    throw new Error(`Fakt ${index + 1} enthält keine gültigen Metadaten.`);
  }

  const allowed = ['yearFrom', 'yearTo', 'scopePercent', 'scopeDescription', 'evidenceQuality', 'proofStatus'];
  if (!Object.keys(value).every((key) => allowed.includes(key))) {
    throw new Error(`Fakt ${index + 1} enthält unbekannte Metadaten.`);
  }

  const yearFrom = optionalInteger(value.yearFrom);
  const yearTo = optionalInteger(value.yearTo);
  const scopePercent = optionalNumber(value.scopePercent, 0, 100);
  const scopeDescription = optionalString(value.scopeDescription, 500);
  const evidenceQuality = value.evidenceQuality == null ? null : value.evidenceQuality;
  const proofStatus = value.proofStatus == null ? null : value.proofStatus;

  if (evidenceQuality !== null && !['high', 'medium', 'low'].includes(String(evidenceQuality))) {
    throw new Error(`Fakt ${index + 1} enthält eine ungültige Belegqualität.`);
  }
  if (proofStatus !== null && !['proven', 'partially_proven', 'not_proven', 'unknown'].includes(String(proofStatus))) {
    throw new Error(`Fakt ${index + 1} enthält einen ungültigen Nachweisstatus.`);
  }

  return {
    yearFrom,
    yearTo,
    scopePercent,
    scopeDescription,
    evidenceQuality: evidenceQuality as ExtractedDocumentFact['metadata']['evidenceQuality'],
    proofStatus: proofStatus as ExtractedDocumentFact['metadata']['proofStatus'],
  };
}

function optionalInteger(value: unknown) {
  if (value == null) return null;
  if (!Number.isInteger(value)) throw new Error('Jahresangabe in Metadaten ist ungültig.');
  return Number(value);
}

function optionalNumber(value: unknown, min: number, max: number) {
  if (value == null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new Error('Prozentangabe in Metadaten ist ungültig.');
  }
  return value;
}

function optionalString(value: unknown, maxLength: number) {
  if (value == null) return null;
  if (typeof value !== 'string' || value.length > maxLength) throw new Error('Text in Metadaten ist ungültig.');
  return value.replace(/\s+/g, ' ').trim() || null;
}

function isNormalizedValue(value: unknown): value is Exclude<NormalizedFactValue, null> {
  return typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value));
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: readonly string[]) {
  const keys = Object.keys(value);
  return keys.length === allowedKeys.length && keys.every((key) => allowedKeys.includes(key));
}
