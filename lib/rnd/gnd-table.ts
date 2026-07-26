import type {BuildingTypeCode, OfficialBuildingTypeCode} from './types.ts';

export type BuildingTypeDefinition = {
  specificationId: number | null;
  code: BuildingTypeCode;
  label: string;
  shortLabel: string;
  gndYears: number | null;
  group: 'residential' | 'commercial' | 'social' | 'industrial' | 'other';
  automaticModel: boolean;
};

// Source: ImmoWertV Anlage 1, https://www.gesetze-im-internet.de/immowertv_2022/anlage_1.html
export const BUILDING_TYPES: readonly BuildingTypeDefinition[] = [
  {specificationId: 1, code: 'single_family', label: 'Freistehende Ein- und Zweifamilienhäuser, Doppelhäuser, Reihenhäuser', shortLabel: 'Ein-/Zweifamilienhaus', gndYears: 80, group: 'residential', automaticModel: true},
  {specificationId: 2, code: 'multi_family', label: 'Mehrfamilienhäuser', shortLabel: 'Mehrfamilienhaus', gndYears: 80, group: 'residential', automaticModel: true},
  {specificationId: 3, code: 'mixed_use_residential', label: 'Wohnhäuser mit Mischnutzung', shortLabel: 'Wohnhaus mit Mischnutzung', gndYears: 80, group: 'residential', automaticModel: true},
  {specificationId: 4, code: 'business_building', label: 'Geschäftshäuser', shortLabel: 'Geschäftshaus', gndYears: 60, group: 'commercial', automaticModel: true},
  {specificationId: 5, code: 'office_bank', label: 'Bürogebäude, Banken', shortLabel: 'Büro / Bank', gndYears: 60, group: 'commercial', automaticModel: true},
  {specificationId: 6, code: 'community_event', label: 'Gemeindezentren, Saalbauten, Veranstaltungsgebäude', shortLabel: 'Veranstaltungsgebäude', gndYears: 40, group: 'social', automaticModel: true},
  {specificationId: 7, code: 'school_childcare', label: 'Kindergärten, Schulen', shortLabel: 'Kindergarten / Schule', gndYears: 50, group: 'social', automaticModel: true},
  {specificationId: 8, code: 'residential_care', label: 'Wohnheime, Alten- und Pflegeheime', shortLabel: 'Wohn-/Pflegeheim', gndYears: 50, group: 'social', automaticModel: true},
  {specificationId: 9, code: 'hospital_clinic', label: 'Krankenhäuser, Tageskliniken', shortLabel: 'Krankenhaus / Klinik', gndYears: 40, group: 'social', automaticModel: true},
  {specificationId: 10, code: 'hospitality_food', label: 'Beherbergungsstätten, Verpflegungseinrichtungen', shortLabel: 'Hotel / Gastronomie', gndYears: 40, group: 'commercial', automaticModel: true},
  {specificationId: 11, code: 'sports_leisure', label: 'Sporthallen, Freizeitbäder, Heilbäder', shortLabel: 'Sport / Freizeit', gndYears: 40, group: 'commercial', automaticModel: true},
  {specificationId: 12, code: 'consumer_market_car_dealer', label: 'Verbrauchermärkte, Autohäuser', shortLabel: 'Markt / Autohaus', gndYears: 30, group: 'commercial', automaticModel: true},
  {specificationId: 13, code: 'department_store', label: 'Kauf- und Warenhäuser', shortLabel: 'Kauf-/Warenhaus', gndYears: 50, group: 'commercial', automaticModel: true},
  {specificationId: 14, code: 'single_garage', label: 'Einzelgaragen', shortLabel: 'Einzelgarage', gndYears: 60, group: 'other', automaticModel: true},
  {specificationId: 15, code: 'parking_structure', label: 'Tief- und Hochgaragen als Einzelbauwerk', shortLabel: 'Parkbauwerk', gndYears: 40, group: 'other', automaticModel: true},
  {specificationId: 16, code: 'workshop_production', label: 'Betriebs- und Werkstätten, Produktionsgebäude', shortLabel: 'Werkstatt / Produktion', gndYears: 40, group: 'industrial', automaticModel: true},
  {specificationId: 17, code: 'warehouse_shipping', label: 'Lager- und Versandgebäude', shortLabel: 'Lager / Versand', gndYears: 40, group: 'industrial', automaticModel: true},
  {specificationId: 18, code: 'agricultural', label: 'Landwirtschaftliche Betriebsgebäude', shortLabel: 'Landwirtschaft', gndYears: 30, group: 'industrial', automaticModel: true},
  {specificationId: null, code: 'unknown', label: 'Gebäudeart nicht eindeutig oder nicht aufgeführt', shortLabel: 'Nicht eindeutig', gndYears: null, group: 'other', automaticModel: false},
] as const;

export const PUBLIC_BUILDING_TYPES = BUILDING_TYPES.filter(
  (type): type is BuildingTypeDefinition & {code: OfficialBuildingTypeCode; gndYears: number} =>
    type.code !== 'unknown' && type.gndYears !== null,
);
export const COMMON_BUILDING_TYPES = BUILDING_TYPES.filter((type) => type.group === 'residential');
export const ADDITIONAL_BUILDING_TYPES = BUILDING_TYPES.filter((type) => type.group !== 'residential');

export function findBuildingTypeDefinition(code: unknown) {
  return BUILDING_TYPES.find((type) => type.code === code);
}

export function getBuildingTypeDefinition(code: BuildingTypeCode) {
  return findBuildingTypeDefinition(code) ?? BUILDING_TYPES[BUILDING_TYPES.length - 1];
}
