import { describe, expect, it } from 'vitest';

import { buildBackfillPixelArt, needsBackfill } from '../avatar-migration';

describe('needsBackfill', () => {
  it('returns true when pixelArt is absent (undefined)', () => {
    expect(needsBackfill({ pixelArt: undefined })).toBe(true);
  });

  it('returns true when pixelArt is null', () => {
    expect(needsBackfill({ pixelArt: null as never })).toBe(true);
  });

  it('returns false when pixelArt is present', () => {
    expect(needsBackfill({ pixelArt: { seed: 'abc', options: {} } })).toBe(false);
  });
});

describe('buildBackfillPixelArt', () => {
  it('returns seed equal to predictorId', () => {
    expect(buildBackfillPixelArt('pred-123').seed).toBe('pred-123');
  });

  it('returns options deep-equal to {}', () => {
    expect(buildBackfillPixelArt('pred-123').options).toEqual({});
  });
});
