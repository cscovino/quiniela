import { describe, expect, it } from 'vitest';

import { AVATAR_PRESETS, randomAvatar } from '../avatar-presets';

describe('AVATAR_PRESETS', () => {
  it('skinColor entries are bare 6-hex (no #)', () => {
    for (const v of AVATAR_PRESETS.skinColor) {
      expect(v).toMatch(/^[a-fA-F0-9]{6}$/);
    }
  });

  it('hairColor entries are bare 6-hex (no #)', () => {
    for (const v of AVATAR_PRESETS.hairColor) {
      expect(v).toMatch(/^[a-fA-F0-9]{6}$/);
    }
  });

  it('clothingColor entries are bare 6-hex (no #)', () => {
    for (const v of AVATAR_PRESETS.clothingColor) {
      expect(v).toMatch(/^[a-fA-F0-9]{6}$/);
    }
  });

  it('hair entries have short* or long* prefix', () => {
    for (const v of AVATAR_PRESETS.hair) {
      expect(v).toMatch(/^(short|long)\d+$/);
    }
  });

  it('clothing entries have variant* prefix', () => {
    for (const v of AVATAR_PRESETS.clothing) {
      expect(v).toMatch(/^variant\d+$/);
    }
  });

  it('glasses entries have dark* or light* prefix', () => {
    for (const v of AVATAR_PRESETS.glasses) {
      expect(v).toMatch(/^(dark|light)\d+$/);
    }
  });

  it('glasses array does NOT include undefined (None is represented at randomAvatar level)', () => {
    for (const v of AVATAR_PRESETS.glasses) {
      expect(v).toBeDefined();
    }
  });

  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(AVATAR_PRESETS)).toBe(true);
  });

  it('has expected curated values for skinColor', () => {
    expect(AVATAR_PRESETS.skinColor).toEqual([
      'ffe5d9',
      'ffd7c4',
      'ffdbac',
      'f1c27d',
      'e0ac69',
      'c68642',
      'a86540',
      '916f61',
      '8d5524',
      '6b4423',
      '4a3218',
      '2e1e12',
    ]);
  });

  it('has expected curated values for hair', () => {
    expect(AVATAR_PRESETS.hair).toEqual([
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
    ]);
  });

  it('has expected curated values for clothing', () => {
    expect(AVATAR_PRESETS.clothing).toEqual([
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
    ]);
  });

  it('has expected curated values for glasses', () => {
    expect(AVATAR_PRESETS.glasses).toEqual([
      'dark01',
      'dark03',
      'dark05',
      'dark07',
      'light02',
      'light04',
      'light06',
      'light07',
    ]);
  });
});

describe('randomAvatar', () => {
  it('returns a non-empty seed', () => {
    const { seed } = randomAvatar();
    expect(typeof seed).toBe('string');
    expect(seed.length).toBeGreaterThan(0);
  });

  it('returns options where every defined value is in the corresponding preset array', () => {
    const { options } = randomAvatar();
    if (options.skinColor !== undefined) {
      expect(AVATAR_PRESETS.skinColor).toContain(options.skinColor);
    }
    if (options.hair !== undefined) {
      expect(AVATAR_PRESETS.hair).toContain(options.hair);
    }
    if (options.hairColor !== undefined) {
      expect(AVATAR_PRESETS.hairColor).toContain(options.hairColor);
    }
    if (options.clothing !== undefined) {
      expect(AVATAR_PRESETS.clothing).toContain(options.clothing);
    }
    if (options.clothingColor !== undefined) {
      expect(AVATAR_PRESETS.clothingColor).toContain(options.clothingColor);
    }
    if (options.glasses !== undefined) {
      expect(AVATAR_PRESETS.glasses).toContain(options.glasses);
    }
  });

  it('with injected rng returns deterministic options within presets', () => {
    // rng that always returns 0 → picks first element of each array
    const deterministicRng = () => 0;
    const deterministicUuid = () => 'test-seed-fixed';

    const { seed, options } = randomAvatar(deterministicRng, deterministicUuid);

    expect(seed).toBe('test-seed-fixed');
    expect(options.skinColor).toBe(AVATAR_PRESETS.skinColor[0]);
    expect(options.hair).toBe(AVATAR_PRESETS.hair[0]);
    expect(options.hairColor).toBe(AVATAR_PRESETS.hairColor[0]);
    expect(options.clothing).toBe(AVATAR_PRESETS.clothing[0]);
    expect(options.clothingColor).toBe(AVATAR_PRESETS.clothingColor[0]);
    // glasses at index 0 of [...AVATAR_PRESETS.glasses, undefined] → 'dark01'
    expect(options.glasses).toBe(AVATAR_PRESETS.glasses[0]);
    // new style axes (always defined):
    expect(options.eyes).toBe(AVATAR_PRESETS.eyes[0]);
    expect(options.eyesColor).toBe(AVATAR_PRESETS.eyesColor[0]);
    expect(options.mouth).toBe(AVATAR_PRESETS.mouth[0]);
    expect(options.mouthColor).toBe(AVATAR_PRESETS.mouthColor[0]);
    expect(options.hatColor).toBe(AVATAR_PRESETS.hatColor[0]);
    expect(options.accessoriesColor).toBe(AVATAR_PRESETS.accessoriesColor[0]);
    expect(options.glassesColor).toBe(AVATAR_PRESETS.glassesColor[0]);
  });

  it('two calls with different injected uuid produce different seeds', () => {
    let counter = 0;
    const uuid1 = () => `seed-${++counter}`;
    const uuid2 = () => `seed-${++counter}`;

    const { seed: s1 } = randomAvatar(Math.random, uuid1);
    const { seed: s2 } = randomAvatar(Math.random, uuid2);

    expect(s1).not.toBe(s2);
  });

  it('glasses may be undefined (representing None)', () => {
    // rng just above the threshold to pick undefined (last in [...glasses, undefined])
    // glasses array length is 8, so [...glasses, undefined] length is 9
    // index 8 → undefined; rng returning 0.9 → Math.floor(0.9 * 9) = 8
    const rngPickingLast = () => 0.9;
    const { options } = randomAvatar(rngPickingLast, () => 'uuid');
    expect(options.glasses).toBeUndefined();
  });

  it('non-glasses traits always have a defined value', () => {
    const { options } = randomAvatar();
    expect(options.skinColor).toBeDefined();
    expect(options.hair).toBeDefined();
    expect(options.hairColor).toBeDefined();
    expect(options.clothing).toBeDefined();
    expect(options.clothingColor).toBeDefined();
    // new required axes:
    expect(options.eyes).toBeDefined();
    expect(options.eyesColor).toBeDefined();
    expect(options.mouth).toBeDefined();
    expect(options.mouthColor).toBeDefined();
    expect(options.hatColor).toBeDefined();
    expect(options.accessoriesColor).toBeDefined();
    expect(options.glassesColor).toBeDefined();
  });

  it('optional traits (beard, hat, accessories) may be undefined at ~25% probability', () => {
    // With OPTIONAL_TRAIT_PROBABILITY=0.25, rng returning >=0.25 picks undefined.
    // Test with rng that always returns 0 (below threshold → always defined):
    const alwaysPick = () => 0;
    const { options: optsAlways } = randomAvatar(alwaysPick, () => 'uuid');
    expect(optsAlways.beard).toBeDefined();
    expect(optsAlways.hat).toBeDefined();
    expect(optsAlways.accessories).toBeDefined();

    // Test with rng that always returns 0.5 (above threshold → undefined):
    const neverPick = () => 0.5;
    const { options: optsNever } = randomAvatar(neverPick, () => 'uuid');
    expect(optsNever.beard).toBeUndefined();
    expect(optsNever.hat).toBeUndefined();
    expect(optsNever.accessories).toBeUndefined();
  });

  it('randomAvatar may produce beard/hat/accessories (~25% each)', () => {
    // With 25% probability per optional trait, after 20 runs the chance of
    // never seeing any optional trait is (0.75)^20 ≈ 0.003 — near-certain to see at least one.
    let optionalTraitSeen = false;
    for (let i = 0; i < 20; i++) {
      const avatar = randomAvatar(Math.random, () => `seed-${i}`);
      if (avatar.options.beard || avatar.options.hat || avatar.options.accessories) {
        optionalTraitSeen = true;
        break;
      }
    }
    expect(optionalTraitSeen).toBe(true);
  });

  it('randomAvatar with fixed rng produces deterministic optional trait values', () => {
    // Two independent rng instances seeded at the same value → identical sequences
    const makeRng = () => {
      let n = 0.42;
      return () => {
        n = (n * 9301 + 49297) % 233280;
        return n / 233280;
      };
    };
    const rng1 = makeRng();
    const rng2 = makeRng();
    const a1 = randomAvatar(rng1, () => 'fixed-seed');
    const a2 = randomAvatar(rng2, () => 'fixed-seed');
    expect(a1.options.beard).toBe(a2.options.beard);
    expect(a1.options.hat).toBe(a2.options.hat);
    expect(a1.options.accessories).toBe(a2.options.accessories);
  });
});

describe('validatePixelArt coverage for all 16 axes (AVATAR-11)', () => {
  // validatePixelArt is internal to predictor-service and not directly exported.
  // Its validation logic relies on AVATAR_PRESETS as the allow-list source of truth.
  // We verify the preset structure here so that when predictor-service tests call
  // updatePredictor with good/bad values, the validation has correct data to check against.

  const ALL_16_AXES = [
    'skinColor',
    'hair',
    'hairColor',
    'clothing',
    'clothingColor',
    'glasses',
    'eyes',
    'beard',
    'mouth',
    'hat',
    'accessories',
    'eyesColor',
    'glassesColor',
    'mouthColor',
    'hatColor',
    'accessoriesColor',
  ] as const;

  it('AVATAR_PRESETS has all 16 axes defined', () => {
    for (const axis of ALL_16_AXES) {
      expect(AVATAR_PRESETS).toHaveProperty(axis);
      expect(Array.isArray(AVATAR_PRESETS[axis])).toBe(true);
      expect((AVATAR_PRESETS[axis] as readonly string[]).length).toBeGreaterThan(0);
    }
  });

  it('all new style axis values have correct format', () => {
    // eyes: variant01-variant12
    for (const value of AVATAR_PRESETS.eyes) {
      expect(value).toMatch(/^variant\d+$/);
    }
    // beard: variant01-variant06
    for (const value of AVATAR_PRESETS.beard) {
      expect(value).toMatch(/^variant\d+$/);
    }
    // mouth: happy01-happy06, sad01-sad06
    for (const value of AVATAR_PRESETS.mouth) {
      expect(value).toMatch(/^(happy|sad)\d+$/);
    }
    // hat: variant01-variant06
    for (const value of AVATAR_PRESETS.hat) {
      expect(value).toMatch(/^variant\d+$/);
    }
    // accessories: variant01-variant03
    for (const value of AVATAR_PRESETS.accessories) {
      expect(value).toMatch(/^variant\d+$/);
    }
  });

  it('all new color axis values are bare 6-hex (no #)', () => {
    const colorAxes: (keyof typeof AVATAR_PRESETS)[] = [
      'eyesColor',
      'glassesColor',
      'mouthColor',
      'hatColor',
      'accessoriesColor',
    ];
    for (const axis of colorAxes) {
      for (const value of AVATAR_PRESETS[axis]) {
        expect(value).toMatch(/^[a-fA-F0-9]{6}$/);
      }
    }
  });

  it('AVATAR_PRESETS is frozen (immutable)', () => {
    expect(Object.isFrozen(AVATAR_PRESETS)).toBe(true);
  });
});
