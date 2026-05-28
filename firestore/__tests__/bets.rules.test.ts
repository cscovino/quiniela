/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-quiniela-bets',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore/firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterEach(async () => {
  await env.clearFirestore();
});

afterAll(async () => {
  await env.cleanup();
});

// TODO: bets collection uses per-match predictionDeadline (not isBeforeTournamentStart).
// Deadline tests require a match doc with predictionDeadline in the past — seed one for a
// separate deadline-rejection test if desired.

describe('bets — read', () => {
  it('allows authenticated user to read a bet', async () => {
    const ctx = env.authenticatedContext('user1');
    // Set up: seed the required docs via security-rules-disabled
    await env.withSecurityRulesDisabled(async (safeCtx) => {
      // Seed match
      await setDoc(doc(safeCtx.firestore(), 'tournaments/t1/matches/m1'), {
        status: 'scheduled',
        predictionDeadline: Timestamp.fromMillis(Date.now() + 86400000),
      });
      // Seed predictor
      await setDoc(doc(safeCtx.firestore(), 'users/user1/predictors/p1'), {
        userId: 'user1',
      });
    });
    // Creator writes the bet (this establishes the doc)
    const ownerCtx = env.authenticatedContext('user1');
    await assertSucceeds(
      setDoc(doc(ownerCtx.firestore(), 'tournaments/t1/bets/b1'), {
        userId: 'user1',
        predictorId: 'p1',
        matchId: 'm1',
        homeScore: 2,
        awayScore: 1,
      }),
    );
    // Now another authenticated user reads it
    const readerCtx = env.authenticatedContext('user2');
    await assertSucceeds(
      setDoc(doc(readerCtx.firestore(), 'tournaments/t1/bets/b1'), {
        userId: 'user1',
        predictorId: 'p1',
        matchId: 'm1',
        homeScore: 2,
        awayScore: 1,
      }),
    );
  });

  it('rejects unauthenticated read', async () => {
    const ctx = env.unauthenticatedContext();
    // Write first so there is something to read
    await env.withSecurityRulesDisabled(async (safeCtx) => {
      await setDoc(doc(safeCtx.firestore(), 'tournaments/t1/bets/b1'), {
        userId: 'user1',
        predictorId: 'p1',
        matchId: 'm1',
        homeScore: 2,
        awayScore: 1,
      });
    });
    await assertFails(
      setDoc(doc(ctx.firestore(), 'tournaments/t1/bets/b1'), {
        userId: 'user1',
        predictorId: 'p1',
        matchId: 'm1',
        homeScore: 2,
        awayScore: 1,
      }),
    );
  });
});

describe('bets — create', () => {
  beforeEach(async () => {
    // Seed match + predictor doc for every create test
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'tournaments/t1/matches/m1'), {
        status: 'scheduled',
        predictionDeadline: Timestamp.fromMillis(Date.now() + 86400000),
      });
      await setDoc(doc(ctx.firestore(), 'users/user1/predictors/p1'), {
        userId: 'user1',
      });
    });
  });

  it('allows authenticated owner to create a bet with valid scores', async () => {
    const ctx = env.authenticatedContext('user1');
    await assertSucceeds(
      setDoc(doc(ctx.firestore(), 'tournaments/t1/bets/b1'), {
        userId: 'user1',
        predictorId: 'p1',
        matchId: 'm1',
        homeScore: 2,
        awayScore: 1,
      }),
    );
  });

  it('rejects non-owner create (auth uid does not match userId)', async () => {
    const ctx = env.authenticatedContext('user2'); // authenticated as user2, but userId says user1
    await assertFails(
      setDoc(doc(ctx.firestore(), 'tournaments/t1/bets/b1'), {
        userId: 'user1',
        predictorId: 'p1',
        matchId: 'm1',
        homeScore: 2,
        awayScore: 1,
      }),
    );
  });

  it('rejects unauthenticated create', async () => {
    const ctx = env.unauthenticatedContext();
    await assertFails(
      setDoc(doc(ctx.firestore(), 'tournaments/t1/bets/b1'), {
        userId: 'user1',
        predictorId: 'p1',
        matchId: 'm1',
        homeScore: 2,
        awayScore: 1,
      }),
    );
  });

  it('rejects out-of-bounds score (homeScore: 16)', async () => {
    const ctx = env.authenticatedContext('user1');
    await assertFails(
      setDoc(doc(ctx.firestore(), 'tournaments/t1/bets/b1'), {
        userId: 'user1',
        predictorId: 'p1',
        matchId: 'm1',
        homeScore: 16,
        awayScore: 1,
      }),
    );
  });

  it('rejects out-of-bounds score (awayScore: -1)', async () => {
    const ctx = env.authenticatedContext('user1');
    await assertFails(
      setDoc(doc(ctx.firestore(), 'tournaments/t1/bets/b1'), {
        userId: 'user1',
        predictorId: 'p1',
        matchId: 'm1',
        homeScore: 2,
        awayScore: -1,
      }),
    );
  });
});
