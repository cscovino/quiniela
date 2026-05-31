import { describe, expect, it } from 'vitest';

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
