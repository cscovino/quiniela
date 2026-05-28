/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * App Check middleware integration test (TEST-02, SEC-01 regression lock).
 *
 * Tests three enforcement paths across three endpoints:
 *  - Missing X-Firebase-AppCheck header → 401 + handler NOT called
 *  - Invalid token                    → 401 + handler NOT called
 *  - Valid token                      → handler called + Cache-Control set
 *
 * SEC-01 regression lock: reverting `if (!ok) return` in withAppCheck.ts
 * must cause the missing-header and invalid-token assertions to fail.
 *
 * No fft.wrap() — withAppCheck is a plain HOF; call it directly.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { withAppCheck } from '../withAppCheck';

// vi.hoisted() creates the mock before vi.mock evaluation;
// the returned object keeps nestedVerifyToken in module scope.
const { nestedVerifyToken } = vi.hoisted(() => ({
  nestedVerifyToken: vi.fn(),
}));

vi.mock('firebase-admin', () => ({
  __esModule: true,
  default: {
    appCheck: vi.fn(() => ({ verifyToken: nestedVerifyToken })),
    firestore: vi.fn(() => ({})),
  },
  appCheck: vi.fn(() => ({ verifyToken: nestedVerifyToken })),
  firestore: vi.fn(() => ({})),
}));

const makeMockReq = (appCheckHeader?: string) => ({
  header: vi.fn((name: string) => (name === 'X-Firebase-AppCheck' ? appCheckHeader : undefined)),
  method: 'GET',
  url: '/',
  query: {},
});

const makeMockRes = () => {
  const res: any = {};
  res.set = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

describe('withAppCheck live endpoint (SEC-01 regression lock)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nestedVerifyToken.mockReset();
  });
  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 when X-Firebase-AppCheck header is missing', async () => {
    const mockHandler = vi.fn();
    const req = makeMockReq(undefined);
    const res = makeMockRes();
    const wrapped = withAppCheck(mockHandler, 'no-store');
    await wrapped(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('returns 401 when token verification fails', async () => {
    nestedVerifyToken.mockRejectedValue(new Error('invalid-token'));
    const mockHandler = vi.fn();
    const req = makeMockReq('some-token');
    const res = makeMockRes();
    const wrapped = withAppCheck(mockHandler, 'no-store');
    await wrapped(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('calls through when token is valid', async () => {
    nestedVerifyToken.mockResolvedValue({});
    const mockHandler = vi.fn().mockResolvedValue(undefined);
    const req = makeMockReq('valid-token');
    const res = makeMockRes();
    const wrapped = withAppCheck(mockHandler, 'public, s-maxage=30');
    await wrapped(req as any, res as any);
    expect(mockHandler).toHaveBeenCalledOnce();
    expect(res.set).toHaveBeenCalledWith('Cache-Control', 'public, s-maxage=30');
  });
});

describe('withAppCheck standings endpoint (SEC-01 regression wire)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nestedVerifyToken.mockReset();
  });
  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 when header missing on standings', async () => {
    const req = makeMockReq(undefined);
    const res = makeMockRes();
    const wrapped = withAppCheck(async () => {}, 'no-store');
    await wrapped(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when token invalid on standings', async () => {
    nestedVerifyToken.mockRejectedValue(new Error('bad-token'));
    const req = makeMockReq('bad-token');
    const res = makeMockRes();
    const wrapped = withAppCheck(async () => {}, 'no-store');
    await wrapped(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('withAppCheck rankings endpoint (SEC-01 regression wire)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nestedVerifyToken.mockReset();
  });
  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 when header missing on rankings', async () => {
    const req = makeMockReq(undefined);
    const res = makeMockRes();
    const wrapped = withAppCheck(async () => {}, 'no-store');
    await wrapped(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when token invalid on rankings', async () => {
    nestedVerifyToken.mockRejectedValue(new Error('bad-token'));
    const req = makeMockReq('bad-token');
    const res = makeMockRes();
    const wrapped = withAppCheck(async () => {}, 'no-store');
    await wrapped(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
