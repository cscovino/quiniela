import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isAppCheckError } from '../firebase';

// Hoisted to module top level (vi.mock is hoisted regardless; keeping it here
// reflects actual execution order and avoids Vitest's nested-mock warning).
vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(() => ({})),
  ReCaptchaV3Provider: vi.fn(),
  getToken: vi.fn(() => Promise.resolve({ token: 'mock' })),
}));

describe('App Check debug-token guard', () => {
  beforeEach(() => {
    vi.resetModules();
    delete (self as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does NOT set FIREBASE_APPCHECK_DEBUG_TOKEN when token is absent in dev', async () => {
    vi.stubEnv('PROD', '');
    vi.stubEnv('PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN', '');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { initFirebase } = await import('../firebase');
    await initFirebase();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN'),
    );
    expect((self as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN).toBeFalsy();

    warnSpy.mockRestore();
  });

  it('sets FIREBASE_APPCHECK_DEBUG_TOKEN to the token string when token is present in dev', async () => {
    vi.stubEnv('PROD', '');
    vi.stubEnv('PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN', 'test-uuid-1234');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { initFirebase } = await import('../firebase');
    await initFirebase();

    expect((self as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN).toBe('test-uuid-1234');
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('does not touch FIREBASE_APPCHECK_DEBUG_TOKEN in PROD regardless of token', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN', 'some-token');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { initFirebase } = await import('../firebase');
    await initFirebase();

    expect((self as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN).toBeUndefined();
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});

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

  it('returns false for "unavailable" errors (generic Firestore network outages)', () => {
    // UNAVAILABLE is returned for transient connectivity issues, not App Check
    // failures — it must not be mis-surfaced to users as a CAPTCHA error.
    expect(isAppCheckError(new Error('service unavailable'))).toBe(false);
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
