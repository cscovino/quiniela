import { describe, expect, it } from 'vitest';

function resolveInitialTheme(saved: string | null, prefersDark: boolean): 'dark' | 'light' {
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  return prefersDark ? 'dark' : 'light';
}

describe('resolveInitialTheme', () => {
  it('saved-dark returns dark', () => {
    expect(resolveInitialTheme('dark', false)).toBe('dark');
    expect(resolveInitialTheme('dark', true)).toBe('dark');
  });

  it('saved-light returns light', () => {
    expect(resolveInitialTheme('light', false)).toBe('light');
    expect(resolveInitialTheme('light', true)).toBe('light');
  });

  it('no-save with dark OS preference returns dark', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark');
  });

  it('no-save with light OS preference returns light', () => {
    expect(resolveInitialTheme(null, false)).toBe('light');
  });
});
