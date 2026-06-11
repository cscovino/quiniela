/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

import { buildPastDeadlineEnv, seedTournament, RULES_FILE_PATH } from './setup';

const TOURNAMENT = 'world-cup-2026';

let env: RulesTestEnvironment;
let pastDeadlineEnv: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-quiniela-predictors',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore/firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
  pastDeadlineEnv = await buildPastDeadlineEnv('demo-quiniela-predictors-past');
});

beforeEach(async () => {
  await seedTournament(env, TOURNAMENT, Timestamp.fromMillis(Date.now() + 86400000 * 7));
  await seedTournament(pastDeadlineEnv, TOURNAMENT, Timestamp.fromMillis(Date.now() - 86400000));
});

afterEach(async () => {
  await env.clearFirestore();
  await pastDeadlineEnv.clearFirestore();
});

afterAll(async () => {
  await env.cleanup();
  await pastDeadlineEnv.cleanup();
});

describe('predictors — authentication', () => {
  it('rejects unauthenticated create', async () => {
    const ctx = env.unauthenticatedContext();
    await assertFails(
      setDoc(doc(ctx.firestore(), 'users/user1/predictors/p1'), {
        userId: 'user1',
        name: 'My Bracket',
      }),
    );
  });

  it('allows authenticated owner to create before tournament start', async () => {
    const ctx = env.authenticatedContext('user1');
    await assertSucceeds(
      setDoc(doc(ctx.firestore(), 'users/user1/predictors/p1'), {
        userId: 'user1',
        name: 'My Bracket',
      }),
    );
  });

  it('rejects non-owner create', async () => {
    const ctx = env.authenticatedContext('user2');
    await assertFails(
      setDoc(doc(ctx.firestore(), 'users/user1/predictors/p1'), {
        userId: 'user1',
        name: 'My Bracket',
      }),
    );
  });
});

describe('predictors — deadline enforcement (SEC-04)', () => {
  it('canary: rules loaded contain isBeforeTournamentStart', () => {
    const rules = readFileSync(RULES_FILE_PATH, 'utf8');
    expect(rules).toContain('isBeforeTournamentStart');
  });

  it('rejects create after tournament start', async () => {
    const ctx = pastDeadlineEnv.authenticatedContext('user1');
    await assertFails(
      setDoc(doc(ctx.firestore(), 'users/user1/predictors/p1'), {
        userId: 'user1',
        name: 'Late Bracket',
      }),
    );
  });

  it('rejects update after tournament start', async () => {
    // Seed a predictor first using the default env (before deadline)
    const ownerCtx = env.authenticatedContext('user1');
    await assertSucceeds(
      setDoc(doc(ownerCtx.firestore(), 'users/user1/predictors/p1'), {
        userId: 'user1',
        name: 'My Bracket',
      }),
    );
    // Attempt to update under the past-deadline env
    const pastCtx = pastDeadlineEnv.authenticatedContext('user1');
    await assertFails(
      setDoc(doc(pastCtx.firestore(), 'users/user1/predictors/p1'), {
        name: 'Renamed',
      }),
    );
  });

  it('allows owner to update their predictor before tournament start', async () => {
    const ownerCtx = env.authenticatedContext('user1');
    await assertSucceeds(
      setDoc(doc(ownerCtx.firestore(), 'users/user1/predictors/p1'), {
        userId: 'user1',
        name: 'Original',
      }),
    );
    await assertSucceeds(
      setDoc(doc(ownerCtx.firestore(), 'users/user1/predictors/p1'), {
        name: 'Renamed',
      }),
    );
  });

  it('rejects non-owner update', async () => {
    const ownerCtx = env.authenticatedContext('user1');
    await assertSucceeds(
      setDoc(doc(ownerCtx.firestore(), 'users/user1/predictors/p1'), {
        userId: 'user1',
        name: 'My Bracket',
      }),
    );
    const otherCtx = env.authenticatedContext('user2');
    await assertFails(
      setDoc(doc(otherCtx.firestore(), 'users/user1/predictors/p1'), {
        name: 'Hijacked',
      }),
    );
  });
});
