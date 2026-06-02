import { createAvatar } from '@dicebear/core';
import * as pixelArt from '@dicebear/pixel-art';

import type { AvatarOptions } from '@app-types/firestore';

// D-04 / RESEARCH Open Question 1: ship empty — all-undefined → seed-driven, deterministic.
// Phase 7 owns concrete swatch *values*. Colors (when added) are bare 6-hex, no '#'.
// Frozen: it is the default-parameter value below, so a caller mutating it would corrupt
// the default for every subsequent no-options call (WR-01).
export const DEFAULT_OPTIONS: AvatarOptions = Object.freeze({});

// D-02: single-value AvatarOptions field → one-element array for createAvatar.
// The pixel-art package uses strict enum unions for style keys; we cast via unknown
// because AvatarOptions intentionally stores plain string (D-01) and this util is
// the only place the conversion happens — the array form never leaks past the seam.
const wrap = <T>(v: string | undefined): T[] | undefined =>
  v === undefined ? undefined : ([v] as unknown as T[]);

export function generateAvatarDataUri(
  seed: string,
  options: AvatarOptions = DEFAULT_OPTIONS,
): string {
  return createAvatar(pixelArt, {
    seed,
    backgroundColor: ['transparent'], // D-03 transparent output
    // EXISTING 6 axes:
    skinColor: wrap(options.skinColor),
    hair: wrap(options.hair),
    hairColor: wrap(options.hairColor),
    clothing: wrap(options.clothing),
    clothingColor: wrap(options.clothingColor),
    glasses: wrap(options.glasses),
    glassesProbability: options.glasses ? 100 : undefined,
    // NEW style axes:
    eyes: wrap(options.eyes),
    beard: wrap(options.beard),
    mouth: wrap(options.mouth),
    hat: wrap(options.hat),
    hatProbability: options.hat ? 100 : undefined,
    accessories: wrap(options.accessories),
    accessoriesProbability: options.accessories ? 100 : undefined,
    // NEW color axes:
    eyesColor: wrap(options.eyesColor),
    mouthColor: wrap(options.mouthColor),
    hatColor: wrap(options.hatColor),
    accessoriesColor: wrap(options.accessoriesColor),
    glassesColor: wrap(options.glassesColor),
  }).toDataUri(); // D-05 sync string, no size set
}
