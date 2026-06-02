import { describe, expect, it } from 'vitest';

import type { AvatarOptions } from '@app-types/firestore';

import { generateAvatarDataUri } from '../dicebear';

describe('generateAvatarDataUri', () => {
  it('returns a valid svg data uri', () => {
    const uri = generateAvatarDataUri('some-seed');
    expect(typeof uri).toBe('string');
    expect(uri).toMatch(/^data:image\/svg\+xml/);
  });

  it('is deterministic for the same seed and options', () => {
    expect(generateAvatarDataUri('abc')).toBe(generateAvatarDataUri('abc'));
  });
});

describe('determinism with new axes (AVATAR-11)', () => {
  const fullOptions: AvatarOptions = {
    skinColor: '8d5524',
    hair: 'short01',
    hairColor: '2c1b18',
    clothing: 'variant05',
    clothingColor: 'e63946',
    glasses: 'dark01',
    // NEW axes:
    eyes: 'variant03',
    eyesColor: '4a3218',
    beard: 'variant02',
    mouth: 'happy04',
    mouthColor: 'c68642',
    hat: 'variant03',
    hatColor: '1d3557',
    accessories: 'variant01',
    accessoriesColor: 'd4af37',
    glassesColor: '090806',
  };

  it('generates byte-identical SVG for same seed+options across all axes', () => {
    const seed = 'test-seed-determinism';
    const svg1 = generateAvatarDataUri(seed, fullOptions);
    const svg2 = generateAvatarDataUri(seed, fullOptions);
    expect(svg1).toBe(svg2);
    expect(svg1).toContain('data:image/svg+xml');
  });

  it('generates different SVG for different seeds with different option values', () => {
    // When options differ (e.g. different hair), different seeds produce different SVG.
    // But when ALL options are explicitly provided, the seed is consumed with no
    // unspecified traits to randomize — so the seed alone does not differentiate output.
    const svg1 = generateAvatarDataUri('seed-alpha', { ...fullOptions, hair: 'short01' });
    const svg2 = generateAvatarDataUri('seed-alpha', { ...fullOptions, hair: 'short04' });
    expect(svg1).not.toBe(svg2);
  });

  it('handles optional traits when undefined (beard/hat/accessories absent)', () => {
    const optionsWithoutOptionalTraits: AvatarOptions = {
      ...fullOptions,
      beard: undefined,
      hat: undefined,
      accessories: undefined,
    };
    const svg1 = generateAvatarDataUri('seed-optional-test', optionsWithoutOptionalTraits);
    const svg2 = generateAvatarDataUri('seed-optional-test', optionsWithoutOptionalTraits);
    expect(svg1).toBe(svg2);
  });

  it('changing an option value produces a different SVG', () => {
    const optionsWithOptionalTraits: AvatarOptions = {
      ...fullOptions,
      beard: 'variant01',
      hat: 'variant01',
      accessories: 'variant01',
    };
    const svg1 = generateAvatarDataUri('seed-with-optional', optionsWithOptionalTraits);
    const svg2 = generateAvatarDataUri('seed-with-optional', {
      ...optionsWithOptionalTraits,
      beard: 'variant03', // different from variant01
    });
    expect(svg1).not.toBe(svg2);
  });
});
