import { createAvatar } from '@dicebear/core';
import * as pixelArt from '@dicebear/pixel-art';

import type { AvatarOptions } from '@app-types/firestore';

// D-04 / RESEARCH Open Question 1: ship empty — all-undefined → seed-driven, deterministic.
// Phase 7 owns concrete swatch *values*. Colors (when added) are bare 6-hex, no '#'.
export const DEFAULT_OPTIONS: AvatarOptions = {};

// D-02: single-value AvatarOptions field → one-element array for createAvatar.
// The pixel-art package uses strict enum unions for style keys; we cast via unknown
// because AvatarOptions intentionally stores plain string (D-01) and this util is
// the only place the conversion happens — the array form never leaks past the seam.
const wrap = <T>(v: string | undefined): T[] | undefined =>
  v == null ? undefined : ([v] as unknown as T[]);

export function generateAvatarDataUri(
  seed: string,
  options: AvatarOptions = DEFAULT_OPTIONS,
): string {
  return createAvatar(pixelArt, {
    seed,
    backgroundColor: ['transparent'], // D-03 transparent output
    skinColor: wrap(options.skinColor), // D-02 single value → 1-element array
    hair: wrap(options.hair),
    hairColor: wrap(options.hairColor),
    clothing: wrap(options.clothing),
    clothingColor: wrap(options.clothingColor),
    glasses: wrap(options.glasses),
    // Force glasses to always render when a style is chosen (RESEARCH Pitfall 3).
    // glassesProbability is a plain number (0–100), not an array.
    glassesProbability: options.glasses ? 100 : undefined,
  }).toDataUri(); // D-05 sync string, no size set
}
