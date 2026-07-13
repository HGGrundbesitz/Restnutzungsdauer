import type {BuildingTypeCode} from '../types.ts';
import type {DocumentFieldKey, NormalizedFactValue} from './types.ts';

const YEAR_FIELDS = new Set<DocumentFieldKey>([
  'construction_year',
  'roof_repair_year',
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
]);

const AREA_FIELDS = new Set<DocumentFieldKey>([
  'living_area',
  'commercial_area',
  'usable_area',
  'total_usable_area',
  'energy_reference_area_an',
  'gross_floor_area',
]);

const UNIT_FIELDS = new Set<DocumentFieldKey>([
  'number_of_units',
  'residential_units',
  'commercial_units',
  'total_units',
]);

const BUILDING_TYPE_ALIASES: Array<[RegExp, BuildingTypeCode]> = [
  [/^(single_family|ein(?:-|\s*)oder zweifamilienhaus|einfamilienhaus|zweifamilienhaus|doppelhaus|reihenhaus)$/i, 'single_family'],
  [/^(multi_family|mehrfamilienhaus|wohnungseigentum|eigentumswohnung)$/i, 'multi_family'],
  [/^(mixed_use_residential|wohnhaus mit mischnutzung|wohn- und geschäftshaus)$/i, 'mixed_use_residential'],
  [/^(business_building|geschäftshaus)$/i, 'business_building'],
  [/^(office_bank|bürogebäude|bankgebäude|büro|bank)$/i, 'office_bank'],
  [/^(workshop_production|werkstatt|produktionsgebäude|betriebsgebäude)$/i, 'workshop_production'],
  [/^(warehouse_shipping|lagergebäude|versandgebäude|lager)$/i, 'warehouse_shipping'],
  [/^(single_garage|einzelgarage|garage)$/i, 'single_garage'],
];

export function normalizeExtractedValue(
  fieldKey: DocumentFieldKey,
  value: NormalizedFactValue,
): NormalizedFactValue {
  if (value === null) return null;

  if (YEAR_FIELDS.has(fieldKey)) {
    const year = parseLocalizedNumber(value);
    if (year === null || !Number.isInteger(year) || year < 1000 || year > 2200) return null;
    return year;
  }

  if (AREA_FIELDS.has(fieldKey)) {
    const area = parseLocalizedNumber(value);
    if (area === null || area <= 0 || area > 10_000_000) return null;
    return roundTo(area, 2);
  }

  if (UNIT_FIELDS.has(fieldKey)) {
    const units = parseLocalizedNumber(value);
    if (units === null || !Number.isInteger(units) || units < 1 || units > 100_000) return null;
    return units;
  }

  if (fieldKey === 'reference_date') {
    return normalizeDate(value);
  }

  if (fieldKey === 'building_type') {
    return normalizeBuildingType(value);
  }

  if (fieldKey === 'heritage_status' && typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = normalizeWhitespace(value);
    return normalized.length > 0 ? normalized.slice(0, 2_000) : null;
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return value;
  }

  return null;
}

export function canonicalizeFactValue(fieldKey: DocumentFieldKey, value: NormalizedFactValue) {
  const normalized = normalizeExtractedValue(fieldKey, value);
  if (normalized === null) return null;
  if (typeof normalized === 'number' || typeof normalized === 'boolean') return String(normalized);

  let text = normalized.normalize('NFKC').toLocaleLowerCase('de-DE').trim();
  if (fieldKey === 'property_address') {
    text = text.replace(/[.,;:]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  return text;
}

export function normalizeBuildingType(value: NormalizedFactValue): BuildingTypeCode | null {
  if (typeof value !== 'string') return null;
  const text = normalizeWhitespace(value);
  for (const [pattern, code] of BUILDING_TYPE_ALIASES) {
    if (pattern.test(text)) return code;
  }
  return null;
}

function normalizeDate(value: NormalizedFactValue) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  const german = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text);
  const parts = iso
    ? {year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3])}
    : german
      ? {year: Number(german[3]), month: Number(german[2]), day: Number(german[1])}
      : null;

  if (!parts) return null;
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (
    date.getUTCFullYear() !== parts.year ||
    date.getUTCMonth() !== parts.month - 1 ||
    date.getUTCDate() !== parts.day
  ) {
    return null;
  }
  return `${parts.year.toString().padStart(4, '0')}-${parts.month.toString().padStart(2, '0')}-${parts.day
    .toString()
    .padStart(2, '0')}`;
}

function parseLocalizedNumber(value: NormalizedFactValue) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;

  const cleaned = value
    .replace(/\s/g, '')
    .replace(/m(?:²|2)/gi, '')
    .replace(/(\d)\.(?=\d{3}(?:\D|$))/g, '$1')
    .replace(',', '.')
    .replace(/[^0-9.+-]/g, '');
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
