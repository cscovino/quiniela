import type { AvatarOptions } from '@app-types/firestore';

// Probability that optional traits (beard, hat, accessories) appear in randomAvatar.
// ~25% per trait — gives variety without overwhelming every avatar with accessories.
const OPTIONAL_TRAIT_PROBABILITY = 0.25;

// Single source of truth for curated pixel-art trait presets (D-02).
// All style ids verified against @dicebear/pixel-art@9.4.2 installed schema.
// All color values are bare 6-hex (no '#') — DiceBear schema pattern: ^[a-fA-F0-9]{6}$.
// Frozen: callers must never mutate this object (prevents shared-state bugs).
export const AVATAR_PRESETS: {
  readonly skinColor: readonly string[];
  readonly hair: readonly string[];
  readonly hairColor: readonly string[];
  readonly clothing: readonly string[];
  readonly clothingColor: readonly string[];
  readonly glasses: readonly string[];
  // NEW style axes:
  readonly eyes: readonly string[];
  readonly beard: readonly string[];
  readonly mouth: readonly string[];
  readonly hat: readonly string[];
  readonly accessories: readonly string[];
  // NEW color axes:
  readonly eyesColor: readonly string[];
  readonly glassesColor: readonly string[];
  readonly mouthColor: readonly string[];
  readonly hatColor: readonly string[];
  readonly accessoriesColor: readonly string[];
} = Object.freeze({
  // BROADENED skinColor: 12 values spanning Fitzpatrick scale 1–6
  skinColor: Object.freeze([
    'ffe5d9', // Fitzpatrick 1-2 (very light)
    'ffd7c4', // Fitzpatrick 1-2 (very light)
    'ffdbac', // Fitzpatrick 2 (light)
    'f1c27d', // Fitzpatrick 2-3 (light-medium)
    'e0ac69', // Fitzpatrick 3 (medium)
    'c68642', // Fitzpatrick 3-4 (medium)
    'a86540', // Fitzpatrick 4 (dark-medium)
    '916f61', // Fitzpatrick 4 (dark-medium)
    '8d5524', // Fitzpatrick 5 (dark)
    '6b4423', // Fitzpatrick 5-6 (deep)
    '4a3218', // Fitzpatrick 6 (very deep)
    '2e1e12', // Fitzpatrick 6 (deepest)
  ]),
  // EXPANDED hair: 12 of 45 (from 6 — curated short + long varieties)
  hair: Object.freeze([
    'short01',
    'short04',
    'short07',
    'short10',
    'short13',
    'short16',
    'long01',
    'long05',
    'long09',
    'long13',
    'long17',
    'long21',
  ]),
  // EXPANDED hairColor: 12 values (realistic + fantasy)
  hairColor: Object.freeze([
    '090806',
    '2c1b18',
    '71635a',
    'b7a69e',
    'd6c4c2',
    'e6cea8',
    'dcd0ba',
    'fc909f',
    'c68642',
    '8d5524',
    '2d6a4f',
    '457b9d',
  ]),
  // EXPANDED clothing: 10 of 23 (from 6)
  clothing: Object.freeze([
    'variant01',
    'variant03',
    'variant05',
    'variant07',
    'variant09',
    'variant14',
    'variant17',
    'variant19',
    'variant21',
    'variant23',
  ]),
  clothingColor: Object.freeze([
    'e63946',
    '1d3557',
    '2d6a4f',
    '06d6a0',
    'f4a261',
    '7b2d8e',
    'd4af37',
    '457b9d',
  ]),
  // EXPANDED glasses: 8 of 14 (from 4 — include more light/dark variants)
  glasses: Object.freeze([
    'dark01',
    'dark03',
    'dark05',
    'dark07',
    'light02',
    'light04',
    'light06',
    'light07',
  ]),

  // NEW style axes (curated subsets — not all variants, mobile-UX appropriate):
  // eyes: 12 of 12 (all variants available in pixel-art)
  eyes: Object.freeze([
    'variant01',
    'variant02',
    'variant03',
    'variant04',
    'variant05',
    'variant06',
    'variant07',
    'variant08',
    'variant09',
    'variant10',
    'variant11',
    'variant12',
  ]),
  // beard: 6 of 8 (curated — no color axis, style only)
  beard: Object.freeze([
    'variant01',
    'variant02',
    'variant03',
    'variant04',
    'variant05',
    'variant06',
  ]),
  // mouth: 12 of 23 (6 happy + 6 sad — balanced emotional range)
  mouth: Object.freeze([
    'happy01',
    'happy02',
    'happy03',
    'happy04',
    'happy05',
    'happy06',
    'sad01',
    'sad02',
    'sad03',
    'sad04',
    'sad05',
    'sad06',
  ]),
  // hat: 6 of 10 (curated)
  hat: Object.freeze([
    'variant01',
    'variant02',
    'variant03',
    'variant04',
    'variant05',
    'variant06',
  ]),
  // accessories: 3 of 4 (curated — excludes one variant for UX simplicity)
  accessories: Object.freeze(['variant01', 'variant02', 'variant03']),

  // NEW color axes:
  // eyesColor: 8 natural eye colors
  eyesColor: Object.freeze([
    '4a3218',
    '6b4423',
    '8d5524',
    'a86540',
    'c68642',
    'e0ac69',
    '2d6a4f',
    '457b9d',
  ]),
  // glassesColor: 6 frame colors
  glassesColor: Object.freeze(['090806', '71635a', '1d3557', 'e63946', 'd4af37', '2d6a4f']),
  // mouthColor: 6 lip/natural tones
  mouthColor: Object.freeze(['c68642', 'a86540', '8d5524', 'e0ac69', 'ffdbac', 'd6c4c2']),
  // hatColor: 8 colors (matches clothingColor pattern)
  hatColor: Object.freeze([
    'e63946',
    '1d3557',
    '2d6a4f',
    '06d6a0',
    'f4a261',
    '7b2d8e',
    'd4af37',
    '090806',
  ]),
  // accessoriesColor: 6 earring/bandana colors
  accessoriesColor: Object.freeze(['d4af37', 'e63946', '1d3557', '2d6a4f', '090806', 'f4a261']),
});

// Pure random avatar generator. Picks one value per trait from the curated presets
// and generates a fresh seed. Glasses may resolve to undefined (= "None").
// Injectable rng + uuid for deterministic testing (Pattern 3 from RESEARCH).
export function randomAvatar(
  rng: () => number = Math.random,
  uuid: () => string = () => crypto.randomUUID(),
): { seed: string; options: AvatarOptions } {
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
  const maybe = (trait: readonly string[]): string | undefined =>
    rng() < OPTIONAL_TRAIT_PROBABILITY ? pick(trait) : undefined;

  return {
    seed: uuid(),
    options: {
      skinColor: pick(AVATAR_PRESETS.skinColor),
      hair: pick(AVATAR_PRESETS.hair),
      hairColor: pick(AVATAR_PRESETS.hairColor),
      clothing: pick(AVATAR_PRESETS.clothing),
      clothingColor: pick(AVATAR_PRESETS.clothingColor),
      // Include undefined as a possible pick to represent glasses "None" (D-02).
      glasses: pick([...AVATAR_PRESETS.glasses, undefined]),
      // NEW: optional traits included in Randomize at ~25% each
      eyes: pick(AVATAR_PRESETS.eyes),
      eyesColor: pick(AVATAR_PRESETS.eyesColor),
      beard: maybe(AVATAR_PRESETS.beard),
      mouth: pick(AVATAR_PRESETS.mouth),
      mouthColor: pick(AVATAR_PRESETS.mouthColor),
      hat: maybe(AVATAR_PRESETS.hat),
      hatColor: pick(AVATAR_PRESETS.hatColor),
      accessories: maybe(AVATAR_PRESETS.accessories),
      accessoriesColor: pick(AVATAR_PRESETS.accessoriesColor),
      glassesColor: pick(AVATAR_PRESETS.glassesColor),
    },
  };
}
