export type AdminRequestStatus = 'pending' | 'reviewing' | 'completed';

export type QuickCheckAnswer = {
  label: string;
  value: string;
};

export type AdminRndEstimate = {
  id: string;
  model_version: string;
  stichtag: string;
  building_type_label: string;
  gnd_years: number | null;
  actual_age: number;
  preliminary_rnd: number | null;
  modernization_points_rounded: number;
  modified_rnd: number | null;
  calculation_method: string;
  result_status: 'calculated' | 'manual_review';
  warnings: {code: string; message: string}[];
};

export type AdminRequestRecord = {
  id: string;
  created_at: string;
  updated_at?: string;
  name: string;
  email: string;
  phone?: string | null;
  address: string;
  year: number | null;
  status: AdminRequestStatus;
  documents: string[];
  source?: string | null;
  quick_check_answers?: QuickCheckAnswer[] | null;
  rnd_estimates?: AdminRndEstimate | AdminRndEstimate[] | null;
};

export function getRequestEstimate(request: AdminRequestRecord) {
  return Array.isArray(request.rnd_estimates) ? request.rnd_estimates[0] : request.rnd_estimates;
}

export function getRequestSourceLabel(source?: string | null) {
  if (source === 'rnd_estimate') return 'RND-Ersteinschätzung';
  if (source === 'quick_check') return 'Schnellcheck';
  return 'Anfrageformular';
}

export function getRequestStatusLabel(status: AdminRequestStatus) {
  if (status === 'reviewing') return 'In Bearbeitung';
  if (status === 'completed') return 'Abgeschlossen';
  return 'Neu';
}
