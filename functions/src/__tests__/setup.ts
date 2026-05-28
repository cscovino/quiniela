import { vi } from 'vitest';

process.env.GCLOUD_PROJECT = 'fake-project-id';
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: 'fake-project-id' });

const mockFirestore = vi.fn(() => ({
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({ set: vi.fn(), get: vi.fn() })),
    where: vi.fn(() => ({ get: vi.fn() })),
  })),
  batch: vi.fn(() => ({
    update: vi.fn(),
    set: vi.fn(),
    commit: vi.fn(),
  })),
}));

vi.mock('firebase-admin', () => ({
  __esModule: true,
  default: {
    firestore: mockFirestore,
    app: { firestore: mockFirestore },
  },
  firestore: mockFirestore,
}));

export const mockBatch = {
  update: vi.fn(),
  set: vi.fn(),
  commit: vi.fn().mockResolvedValue(undefined),
};

export const mockDb = {
  collection: vi.fn(),
  batch: vi.fn(() => mockBatch),
  doc: vi.fn(),
};

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
    ) => {
      return {
        before: { data: () => beforeSnap.data() },
        after: { data: () => afterSnap.data() },
      };
    },
  },
  makeChange: (
    beforeSnap: { data: () => unknown; ref: { id: string; name: string } },
    afterSnap: { data: () => unknown; ref: { id: string; name: string } },
  ) => {
    return {
      before: { data: () => beforeSnap.data() },
      after: { data: () => afterSnap.data() },
    };
  },
  cleanup: () => {},
};
