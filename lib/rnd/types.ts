export type BuildingTypeCode =
  | 'single_family'
  | 'multi_family'
  | 'mixed_use_residential'
  | 'business_building'
  | 'office_bank'
  | 'community_event'
  | 'school_childcare'
  | 'residential_care'
  | 'hospital_clinic'
  | 'hospitality_food'
  | 'sports_leisure'
  | 'consumer_market_car_dealer'
  | 'department_store'
  | 'single_garage'
  | 'parking_structure'
  | 'workshop_production'
  | 'warehouse_shipping'
  | 'agricultural'
  | 'unknown';

export type ModernizationPeriod =
  | 'within_5'
  | 'within_10'
  | 'within_15'
  | 'within_20'
  | 'older_or_never'
  | 'unknown';

export type FloorplanImprovement = 'none' | 'partial' | 'comprehensive' | 'unknown';

export type ModernizationAnswers = {
  roof: ModernizationPeriod;
  windows: ModernizationPeriod;
  pipes: ModernizationPeriod;
  heating: ModernizationPeriod;
  exteriorWalls: ModernizationPeriod;
  bathrooms: ModernizationPeriod;
  interior: ModernizationPeriod;
  floorplan: FloorplanImprovement;
};

export type RndInput = {
  buildingTypeCode: BuildingTypeCode;
  referenceDate: string;
  constructionYear: number;
  modernization: ModernizationAnswers;
  coreRenovation: boolean;
};

export type RndWarningCode =
  | 'BUILDING_TYPE_UNKNOWN'
  | 'NON_RESIDENTIAL_MANUAL_REVIEW'
  | 'CORE_RENOVATION_MANUAL_REVIEW'
  | 'MODERNIZATION_INFORMATION_INCOMPLETE'
  | 'ROUNDING_POLICY_REQUIRES_APPROVAL'
  | 'BUILDING_OLDER_THAN_GND';

export type RndWarning = {
  code: RndWarningCode;
  message: string;
};

export type RndCoefficient = {
  points: number;
  a: number;
  b: number;
  c: number;
  minimumRelativeAge: number;
};

export type ModernizationScoreBreakdown = {
  roof: number;
  windows: number;
  pipes: number;
  heating: number;
  exteriorWalls: number;
  bathrooms: number;
  interior: number;
  floorplan: number;
};

export type RndCalculationMethod = 'preliminary' | 'immowertv_formula' | 'manual_review';
export type RndResultStatus = 'calculated' | 'manual_review';

export type RndResult = {
  modelVersion: string;
  resultCopyVersion: string;
  status: RndResultStatus;
  buildingTypeCode: BuildingTypeCode;
  buildingTypeLabel: string;
  gndYears: number | null;
  referenceDate: string;
  constructionYear: number;
  actualAge: number;
  ageForFormula: number | null;
  preliminaryRnd: number | null;
  modernizationScoreBreakdown: ModernizationScoreBreakdown;
  modernizationPointsRaw: number;
  modernizationPointsRounded: number;
  relativeAge: number | null;
  coefficient: RndCoefficient | null;
  modifiedRnd: number | null;
  calculationMethod: RndCalculationMethod;
  warnings: RndWarning[];
};

export type RndContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  consent: boolean;
};

export type RndPropertyContext = {
  address?: string;
  area?: number;
  units?: number;
};

export type RndEstimateSubmission = {
  input: RndInput;
  contact: RndContact;
  property: RndPropertyContext;
  documentPaths: string[];
  honeypot?: string;
};
