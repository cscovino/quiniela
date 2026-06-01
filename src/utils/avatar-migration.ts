import type { AvatarOptions, Predictor } from '@app-types/firestore';

export function needsBackfill(predictor: Pick<Predictor, 'pixelArt'>): boolean {
  return predictor.pixelArt === undefined || predictor.pixelArt === null;
}

export function buildBackfillPixelArt(predictorId: string): {
  seed: string;
  options: AvatarOptions;
} {
  return { seed: predictorId, options: {} };
}
