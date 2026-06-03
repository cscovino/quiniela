import { vi } from 'vitest';

process.env.GCLOUD_PROJECT = 'fake-project-id';
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: 'fake-project-id' });

export const mockBatch = {
  update: vi.fn().mockReturnThis(),
  set: vi.fn(),
  commit: vi.fn().mockResolvedValue(undefined),
};

class Timestamp {
  seconds: number;
  nanoseconds: number;
  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  toMillis() {
    return this.seconds * 1000 + this.nanoseconds / 1_000_000;
  }
  static now() {
    return new Timestamp(Math.floor(Date.now() / 1000), 0);
  }
  static fromMillis(n: number) {
    return new Timestamp(Math.floor(n / 1000), 0);
  }
}

// Queries with .limit() hit the debounce check → return empty.
// Queries without .limit() are the stats fetch → return two predictor docs.
function makeQuery(limited = false): Record<string, unknown> {
  const statsSnap = {
    empty: false,
    forEach: (cb: (doc: unknown) => void) => {
      cb({
        ref: { id: 'p1', path: 'stats/p1' },
        data: () => ({ totalPoints: 50, predictorId: 'p1', tournamentId: 'tournament-1' }),
      });
      cb({
        ref: { id: 'p2', path: 'stats/p2' },
        data: () => ({ totalPoints: 30, predictorId: 'p2', tournamentId: 'tournament-1' }),
      });
    },
  };
  return {
    where: vi.fn(() => makeQuery(limited)),
    limit: vi.fn(() => makeQuery(true)),
    get: vi.fn(() => Promise.resolve(limited ? { empty: true } : statsSnap)),
  };
}

export const mockDb = {
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({ set: vi.fn(), get: vi.fn() })),
    where: vi.fn(() => ({ get: vi.fn() })),
  })),
  batch: vi.fn(() => mockBatch),
  doc: vi.fn(),
  collectionGroup: vi.fn(() => makeQuery()),
};

vi.mock('firebase-admin', () => ({
  __esModule: true,
  default: vi.fn(() => mockDb),
  firestore: Object.assign(
    vi.fn(() => mockDb),
    { Timestamp },
  ),
  app: { firestore: mockDb },
  initializeApp: vi.fn(),
  appCheck: vi.fn(() => ({ verifyToken: vi.fn().mockResolvedValue({ token: 'ok' }) })),
}));

export const fft = {
  wrap: (fn: unknown) => fn,
  firestore: {
    makeDocumentSnapshot: (data: unknown, path: string) => ({
      data: () => data,
      ref: { id: path.split('/').pop(), name: path },
    }),
    makeChange: (
      beforeSnap: { data: () => unknown; ref: { id: string; name: string } },
      afterSnap: { data: () => unknown; ref: { id: string; name: string } },
    ) => ({
      before: { data: () => beforeSnap.data() },
      after: { data: () => afterSnap.data() },
    }),
  },
  makeChange: (
    beforeSnap: { data: () => unknown; ref: { id: string; name: string } },
    afterSnap: { data: () => unknown; ref: { id: string; name: string } },
  ) => ({
    before: { data: () => beforeSnap.data() },
    after: { data: () => afterSnap.data() },
  }),
  cleanup: () => {},
};
