import type {BuildingTypeCode} from './types.ts';

export type BuildingTypeDefinition = {
  code: BuildingTypeCode;
  label: string;
  shortLabel: string;
  gndYears: number | null;
  group: 'residential' | 'commercial' | 'social' | 'industrial' | 'other';
  automaticModel: boolean;
};

// Source: ImmoWertV Anlage 1, https://www.gesetze-im-internet.de/immowertv_2022/anlage_1.html
export const BUILDING_TYPES: readonly BuildingTypeDefinition[] = [
  {code: 'single_family', label: 'Ein- oder Zweifamilienhaus, Doppel- oder Reihenhaus', shortLabel: 'Ein-/Zweifamilienhaus', gndYears: 80, group: 'residential', automaticModel: true},
  {code: 'multi_family', label: 'Mehrfamilienhaus oder Wohnungseigentum', shortLabel: 'Mehrfamilienhaus', gndYears: 80, group: 'residential', automaticModel: true},
  {code: 'mixed_use_residential', label: 'Wohnhaus mit Mischnutzung', shortLabel: 'Wohnhaus mit Mischnutzung', gndYears: 80, group: 'residential', automaticModel: true},
  {code: 'business_building', label: 'Geschäftshaus', shortLabel: 'Geschäftshaus', gndYears: 60, group: 'commercial', automaticModel: false},
  {code: 'office_bank', label: 'Bürogebäude oder Bank', shortLabel: 'Büro / Bank', gndYears: 60, group: 'commercial', automaticModel: false},
  {code: 'community_event', label: 'Gemeindezentrum, Saal- oder Veranstaltungsgebäude', shortLabel: 'Veranstaltungsgebäude', gndYears: 40, group: 'social', automaticModel: false},
  {code: 'school_childcare', label: 'Kindergarten oder Schule', shortLabel: 'Kindergarten / Schule', gndYears: 50, group: 'social', automaticModel: false},
  {code: 'residential_care', label: 'Wohnheim, Alten- oder Pflegeheim', shortLabel: 'Wohn-/Pflegeheim', gndYears: 50, group: 'social', automaticModel: false},
  {code: 'hospital_clinic', label: 'Krankenhaus oder Tagesklinik', shortLabel: 'Krankenhaus / Klinik', gndYears: 40, group: 'social', automaticModel: false},
  {code: 'hospitality_food', label: 'Beherbergungs- oder Verpflegungseinrichtung', shortLabel: 'Hotel / Gastronomie', gndYears: 40, group: 'commercial', automaticModel: false},
  {code: 'sports_leisure', label: 'Sporthalle, Freizeit- oder Heilbad', shortLabel: 'Sport / Freizeit', gndYears: 40, group: 'commercial', automaticModel: false},
  {code: 'consumer_market_car_dealer', label: 'Verbrauchermarkt oder Autohaus', shortLabel: 'Markt / Autohaus', gndYears: 30, group: 'commercial', automaticModel: false},
  {code: 'department_store', label: 'Kauf- oder Warenhaus', shortLabel: 'Kauf-/Warenhaus', gndYears: 50, group: 'commercial', automaticModel: false},
  {code: 'single_garage', label: 'Einzelgarage', shortLabel: 'Einzelgarage', gndYears: 60, group: 'other', automaticModel: false},
  {code: 'parking_structure', label: 'Tief- oder Hochgarage als Einzelbauwerk', shortLabel: 'Parkbauwerk', gndYears: 40, group: 'other', automaticModel: false},
  {code: 'workshop_production', label: 'Betriebs-, Werkstatt- oder Produktionsgebäude', shortLabel: 'Werkstatt / Produktion', gndYears: 40, group: 'industrial', automaticModel: false},
  {code: 'warehouse_shipping', label: 'Lager- oder Versandgebäude', shortLabel: 'Lager / Versand', gndYears: 40, group: 'industrial', automaticModel: false},
  {code: 'agricultural', label: 'Landwirtschaftliches Betriebsgebäude', shortLabel: 'Landwirtschaft', gndYears: 30, group: 'industrial', automaticModel: false},
  {code: 'unknown', label: 'Gebäudeart nicht eindeutig oder nicht aufgeführt', shortLabel: 'Nicht eindeutig', gndYears: null, group: 'other', automaticModel: false},
] as const;

export const COMMON_BUILDING_TYPES = BUILDING_TYPES.filter((type) => type.group === 'residential');
export const ADDITIONAL_BUILDING_TYPES = BUILDING_TYPES.filter((type) => type.group !== 'residential');

export function getBuildingTypeDefinition(code: BuildingTypeCode) {
  return BUILDING_TYPES.find((type) => type.code === code) ?? BUILDING_TYPES[BUILDING_TYPES.length - 1];
}
