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
      '8d5524',
      'a86540',
      'c68642',
      'e0ac69',
      'f1c27d',
      'ffdbac',
    ]);
  });

  it('has expected curated values for hair', () => {
    expect(AVATAR_PRESETS.hair).toEqual([
      'short01',
      'short07',
      'short16',
      'long01',
      'long09',
      'long15',
    ]);
  });

  it('has expected curated values for clothing', () => {
    expect(AVATAR_PRESETS.clothing).toEqual([
      'variant01',
      'variant05',
      'variant09',
      'variant14',
      'variant19',
      'variant23',
    ]);
  });

  it('has expected curated values for glasses', () => {
    expect(AVATAR_PRESETS.glasses).toEqual(['dark01', 'dark03', 'light02', 'light05']);
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
    // glasses array length is 4, so [...glasses, undefined] length is 5
    // index 4 → undefined; rng returning 0.9 → Math.floor(0.9 * 5) = 4
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
  });
});
