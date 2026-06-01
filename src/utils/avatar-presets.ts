import type { AvatarOptions } from '@app-types/firestore';

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
} = Object.freeze({
  skinColor: Object.freeze(['8d5524', 'a86540', 'c68642', 'e0ac69', 'f1c27d', 'ffdbac']),
  hair: Object.freeze(['short01', 'short07', 'short16', 'long01', 'long09', 'long15']),
  hairColor: Object.freeze([
    '090806',
    '2c1b18',
    '71635a',
    'b7a69e',
    'd6c4c2',
    'e6cea8',
    'dcd0ba',
    'fc909f',
  ]),
  clothing: Object.freeze([
    'variant01',
    'variant05',
    'variant09',
    'variant14',
    'variant19',
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
  // Glasses "None" is represented as undefined (not a member of this array).
  // randomAvatar picks from [...AVATAR_PRESETS.glasses, undefined] to allow None.
  glasses: Object.freeze(['dark01', 'dark03', 'light02', 'light05']),
});

// Pure random avatar generator. Picks one value per trait from the curated presets
// and generates a fresh seed. Glasses may resolve to undefined (= "None").
// Injectable rng + uuid for deterministic testing (Pattern 3 from RESEARCH).
export function randomAvatar(
  rng: () => number = Math.random,
  uuid: () => string = () => crypto.randomUUID(),
): { seed: string; options: AvatarOptions } {
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];

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
    },
  };
}
