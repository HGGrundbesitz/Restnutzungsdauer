import {calculateRndV1, RND_MODEL_VERSION_V1, RND_RESULT_COPY_VERSION_V1} from './calculate-rnd-v1.ts';
import {calculateRndV2, RND_MODEL_VERSION_V2, RND_RESULT_COPY_VERSION_V2} from './calculate-rnd-v2.ts';
import type {RndInput} from './types.ts';

export {
  calculateRndV1,
  calculateRndV2,
  RND_MODEL_VERSION_V1,
  RND_MODEL_VERSION_V2,
  RND_RESULT_COPY_VERSION_V1,
  RND_RESULT_COPY_VERSION_V2,
};

export const RND_MODEL_VERSION = RND_MODEL_VERSION_V2;
export const RND_RESULT_COPY_VERSION = RND_RESULT_COPY_VERSION_V2;

export function calculateRnd(input: RndInput) {
  return input.schemaVersion === 'rnd-clickflow-v2'
    ? calculateRndV2(input)
    : calculateRndV1(input);
}
