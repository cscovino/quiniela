/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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

beforeEach(async () => {
  // Seed tournament doc with future kickoff so isBeforeTournamentStart passes
  await env.withSecurityRulesDisabled(async (safeCtx) => {
    await setDoc(doc(safeCtx.firestore(), 'tournaments/t1'), {
      firstMatchKickoff: Timestamp.fromMillis(Date.now() + 86400000 * 7),
    });
  });
});

afterEach(async () => {
  await env.clearFirestore();
});

afterAll(async () => {
  await env.cleanup();
});

describe('bets — read', () => {
  it('allows authenticated user to read a bet', async () => {
    // Set up: seed the required docs via security-rules-disabled
    await env.withSecurityRulesDisabled(async (safeCtx) => {
      await setDoc(doc(safeCtx.firestore(), 'tournaments/t1/matches/m1'), {
        status: 'scheduled',
        predictionDeadline: Timestamp.fromMillis(Date.now() + 86400000),
      });
      await setDoc(doc(safeCtx.firestore(), 'users/user1/predictors/p1'), {
        userId: 'user1',
      });
      await setDoc(doc(safeCtx.firestore(), 'tournaments/t1/bets/b1'), {
        userId: 'user1',
        predictorId: 'p1',
        matchId: 'm1',
        homeScore: 2,
        awayScore: 1,
      });
    });
    // Any authenticated user can read the bet (intentional: social rankings)
    const readerCtx = env.authenticatedContext('user2');
    await assertSucceeds(
      getDoc(doc(readerCtx.firestore(), 'tournaments/t1/bets/b1')),
    );
  });

  it('rejects unauthenticated read', async () => {
    await env.withSecurityRulesDisabled(async (safeCtx) => {
      await setDoc(doc(safeCtx.firestore(), 'tournaments/t1/bets/b1'), {
        userId: 'user1',
        predictorId: 'p1',
        matchId: 'm1',
        homeScore: 2,
        awayScore: 1,
      });
    });
    const ctx = env.unauthenticatedContext();
    await assertFails(
      getDoc(doc(ctx.firestore(), 'tournaments/t1/bets/b1')),
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

  it('rejects create when match predictionDeadline has passed', async () => {
    // Overwrite the seeded match with one whose deadline is in the past
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'tournaments/t1/matches/m1'), {
        status: 'scheduled',
        predictionDeadline: Timestamp.fromMillis(Date.now() - 60000),
      });
    });
    const ctx = env.authenticatedContext('user1');
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

  it('rejects create when match status is finished', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'tournaments/t1/matches/m1'), {
        status: 'finished',
        predictionDeadline: Timestamp.fromMillis(Date.now() + 86400000),
      });
    });
    const ctx = env.authenticatedContext('user1');
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

describe('bets — update', () => {
  beforeEach(async () => {
    // Seed match (future deadline, scheduled) + predictor + initial bet
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'tournaments/t1/matches/m1'), {
        status: 'scheduled',
        predictionDeadline: Timestamp.fromMillis(Date.now() + 86400000),
      });
      await setDoc(doc(ctx.firestore(), 'users/user1/predictors/p1'), {
        userId: 'user1',
      });
      await setDoc(doc(ctx.firestore(), 'tournaments/t1/bets/b1'), {
        userId: 'user1',
        predictorId: 'p1',
        matchId: 'm1',
        homeScore: 1,
        awayScore: 0,
      });
    });
  });

  it('allows owner to update scores while match is still open', async () => {
    const ctx = env.authenticatedContext('user1');
    await assertSucceeds(
      updateDoc(doc(ctx.firestore(), 'tournaments/t1/bets/b1'), {
        homeScore: 3,
        awayScore: 2,
      }),
    );
  });

  it('rejects update after match predictionDeadline has passed', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'tournaments/t1/matches/m1'), {
        status: 'scheduled',
        predictionDeadline: Timestamp.fromMillis(Date.now() - 60000),
      });
    });
    const ctx = env.authenticatedContext('user1');
    await assertFails(
      updateDoc(doc(ctx.firestore(), 'tournaments/t1/bets/b1'), {
        homeScore: 3,
        awayScore: 2,
      }),
    );
  });

  it('rejects update when match status is live', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'tournaments/t1/matches/m1'), {
        status: 'live',
        predictionDeadline: Timestamp.fromMillis(Date.now() + 86400000),
      });
    });
    const ctx = env.authenticatedContext('user1');
    await assertFails(
      updateDoc(doc(ctx.firestore(), 'tournaments/t1/bets/b1'), {
        homeScore: 3,
        awayScore: 2,
      }),
    );
  });

  it('rejects update when match status is finished', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'tournaments/t1/matches/m1'), {
        status: 'finished',
        predictionDeadline: Timestamp.fromMillis(Date.now() + 86400000),
      });
    });
    const ctx = env.authenticatedContext('user1');
    await assertFails(
      updateDoc(doc(ctx.firestore(), 'tournaments/t1/bets/b1'), {
        homeScore: 3,
        awayScore: 2,
      }),
    );
  });

  it('rejects update that changes matchId (prevents bet-swap exploit)', async () => {
    // Seed a second open match
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'tournaments/t1/matches/m2'), {
        status: 'scheduled',
        predictionDeadline: Timestamp.fromMillis(Date.now() + 86400000),
      });
    });
    const ctx = env.authenticatedContext('user1');
    await assertFails(
      updateDoc(doc(ctx.firestore(), 'tournaments/t1/bets/b1'), {
        matchId: 'm2',
        homeScore: 3,
        awayScore: 2,
      }),
    );
  });

  it('rejects non-owner update', async () => {
    const ctx = env.authenticatedContext('user2');
    await assertFails(
      updateDoc(doc(ctx.firestore(), 'tournaments/t1/bets/b1'), {
        homeScore: 3,
        awayScore: 2,
      }),
    );
  });
});

