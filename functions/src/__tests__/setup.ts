import firebaseFunctionsTest from 'firebase-functions-test';
import { vi } from 'vitest';

// Mock batch object — exported so test files can assert on calls
export const mockBatch = {
  update: vi.fn(),
  set: vi.fn(),
  commit: vi.fn().mockResolvedValue(undefined),
};

// Mock database — exported so test files can stub collection queries
export const mockDb = {
  collection: vi.fn(),
  batch: vi.fn(() => mockBatch),
  doc: vi.fn(),
};

// Must be top-level (hoisted by Vitest before module imports)
const mockAppCheck = vi.fn(() => ({ verifyToken: vi.fn() }));
vi.mock('firebase-admin', () => {
  const ns = {
    appCheck: mockAppCheck,
    firestore: Object.assign(
      vi.fn(() => mockDb),
      {
        Timestamp: {
          now: vi.fn(() => ({ seconds: 1700000000, nanoseconds: 0 })),
          fromMillis: vi.fn((ms: number) => ({
            seconds: Math.floor(ms / 1000),
            nanoseconds: 0,
          })),
          fromDate: vi.fn((d: Date) => ({
            seconds: Math.floor(d.getTime() / 1000),
            nanoseconds: 0,
          })),
        },
        FieldValue: {
          serverTimestamp: vi.fn(() => 'srv-ts'),
          increment: vi.fn((n: number) => n),
          arrayUnion: vi.fn(),
        },
      },
    ),
  };
  return { __esModule: true, default: ns, ...ns };
});

// firebase-functions-test offline instance (no project config, no credentials)
export const fft = firebaseFunctionsTest({ projectId: 'fake-project-id' });
export const cleanup = () => fft.cleanup();
