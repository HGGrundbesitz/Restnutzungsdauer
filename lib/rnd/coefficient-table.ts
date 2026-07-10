import type {RndCoefficient} from './types.ts';

// Source: ImmoWertV Anlage 2, Tabelle 3.
export const RND_COEFFICIENTS: readonly RndCoefficient[] = [
  {points: 0, a: 1.25, b: 2.625, c: 1.525, minimumRelativeAge: 60},
  {points: 1, a: 1.25, b: 2.625, c: 1.525, minimumRelativeAge: 60},
  {points: 2, a: 1.0767, b: 2.2757, c: 1.3878, minimumRelativeAge: 55},
  {points: 3, a: 0.9033, b: 1.9263, c: 1.2505, minimumRelativeAge: 55},
  {points: 4, a: 0.73, b: 1.577, c: 1.1133, minimumRelativeAge: 40},
  {points: 5, a: 0.6725, b: 1.4578, c: 1.085, minimumRelativeAge: 35},
  {points: 6, a: 0.615, b: 1.3385, c: 1.0567, minimumRelativeAge: 30},
  {points: 7, a: 0.5575, b: 1.2193, c: 1.0283, minimumRelativeAge: 25},
  {points: 8, a: 0.5, b: 1.1, c: 1, minimumRelativeAge: 20},
  {points: 9, a: 0.466, b: 1.027, c: 0.9906, minimumRelativeAge: 19},
  {points: 10, a: 0.432, b: 0.954, c: 0.9811, minimumRelativeAge: 18},
  {points: 11, a: 0.398, b: 0.881, c: 0.9717, minimumRelativeAge: 17},
  {points: 12, a: 0.364, b: 0.808, c: 0.9622, minimumRelativeAge: 16},
  {points: 13, a: 0.33, b: 0.735, c: 0.9528, minimumRelativeAge: 15},
  {points: 14, a: 0.304, b: 0.676, c: 0.9506, minimumRelativeAge: 14},
  {points: 15, a: 0.278, b: 0.617, c: 0.9485, minimumRelativeAge: 13},
  {points: 16, a: 0.252, b: 0.558, c: 0.9463, minimumRelativeAge: 12},
  {points: 17, a: 0.226, b: 0.499, c: 0.9442, minimumRelativeAge: 11},
  {points: 18, a: 0.2, b: 0.44, c: 0.942, minimumRelativeAge: 10},
  {points: 19, a: 0.2, b: 0.44, c: 0.942, minimumRelativeAge: 10},
  {points: 20, a: 0.2, b: 0.44, c: 0.942, minimumRelativeAge: 10},
] as const;

export function getCoefficient(points: number) {
  const safePoints = Math.round(Math.min(Math.max(points, 0), 20));
  return RND_COEFFICIENTS[safePoints];
}
