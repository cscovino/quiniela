import { describe, expect, it } from 'vitest';

import { isAppCheckError } from '../firebase';

describe('isAppCheckError', () => {
  it('returns true for app-check related errors', () => {
    expect(isAppCheckError(new Error('app-check token invalid'))).toBe(true);
    expect(isAppCheckError(new Error('App Check error: token expired'))).toBe(true);
    expect(isAppCheckError(new Error('firebase app-check failed'))).toBe(true);
  });

  it('returns true for captcha related errors', () => {
    expect(isAppCheckError(new Error('CAPTCHA verification failed'))).toBe(true);
    expect(isAppCheckError(new Error('captcha error'))).toBe(true);
    expect(isAppCheckError(new Error('Recaptcha token invalid'))).toBe(true);
  });

  it('returns true for unavailable errors', () => {
    expect(isAppCheckError(new Error('service unavailable'))).toBe(true);
  });

  it('returns false for non-app-check errors', () => {
    expect(isAppCheckError(new Error('network error'))).toBe(false);
    expect(isAppCheckError(new Error('permission denied'))).toBe(false);
    expect(isAppCheckError(new Error('document not found'))).toBe(false);
  });

  it('returns false for non-Error inputs', () => {
    expect(isAppCheckError('string error')).toBe(false);
    expect(isAppCheckError(null)).toBe(false);
    expect(isAppCheckError(undefined)).toBe(false);
    expect(isAppCheckError({ message: 'error' })).toBe(false);
  });
});
