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

import { buildPastDeadlineEnv, RULES_FILE_PATH } from './setup';

let env: RulesTestEnvironment;
let pastDeadlineEnv: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-quiniela-final-phase',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore/firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
  pastDeadlineEnv = await buildPastDeadlineEnv('demo-quiniela-final-phase-past');
});

afterEach(async () => {
  await env.clearFirestore();
  await pastDeadlineEnv.clearFirestore();
});

afterAll(async () => {
  await env.cleanup();
  await pastDeadlineEnv.cleanup();
});

describe('final_phase_bets — authentication', () => {
  it('rejects unauthenticated create', async () => {
    const ctx = env.unauthenticatedContext();
    await assertFails(
      setDoc(doc(ctx.firestore(), 'tournaments/t1/final_phase_bets/p1'), {
        userId: 'user1',
        topScorer: 'messi',
      }),
    );
  });

  it('allows authenticated owner to create before deadline', async () => {
    const ctx = env.authenticatedContext('user1');
    await assertSucceeds(
      setDoc(doc(ctx.firestore(), 'tournaments/t1/final_phase_bets/p1'), {
        userId: 'user1',
        topScorer: 'messi',
      }),
    );
  });

  it('rejects non-owner create', async () => {
    const ctx = env.authenticatedContext('user2'); // authenticated as user2, userId says user1
    await assertFails(
      setDoc(doc(ctx.firestore(), 'tournaments/t1/final_phase_bets/p1'), {
        userId: 'user1',
        topScorer: 'messi',
      }),
    );
  });
});

describe('final_phase_bets — deadline rejection (SEC-03)', () => {
  it('rejects create after deadline via past-deadline environment', async () => {
    // Canary: ensure rules loaded isBeforeTournamentStart
    const rules = readFileSync(RULES_FILE_PATH, 'utf8');
    expect(rules).toContain('isBeforeTournamentStart');

    // pastDeadlineEnv replaces timestamp.date(2026, 6, 11) with timestamp.date(2020, 1, 1)
    const ctx = pastDeadlineEnv.authenticatedContext('user1');
    await assertFails(
      setDoc(doc(ctx.firestore(), 'tournaments/t1/final_phase_bets/p1'), {
        userId: 'user1',
        topScorer: 'mbappe',
      }),
    );
  });

  it('allows update before deadline', async () => {
    // Seed a doc first using the normal (non-past) env
    const ownerCtx = env.authenticatedContext('user1');
    await assertSucceeds(
      setDoc(doc(ownerCtx.firestore(), 'tournaments/t1/final_phase_bets/p1'), {
        userId: 'user1',
        topScorer: 'messi',
      }),
    );
    // Update it
    await assertSucceeds(
      setDoc(
        doc(ownerCtx.firestore(), 'tournaments/t1/final_phase_bets/p1'),
        { topScorer: 'mbappe' },
      ),
    );
  });

  it('rejects update after deadline via past-deadline environment', async () => {
    // Seed a doc via normal env first
    const ownerCtx = env.authenticatedContext('user1');
    await assertSucceeds(
      setDoc(doc(ownerCtx.firestore(), 'tournaments/t1/final_phase_bets/p1'), {
        userId: 'user1',
        topScorer: 'messi',
      }),
    );
    // Now try to update via past-deadline env
    const pastCtx = pastDeadlineEnv.authenticatedContext('user1');
    await assertFails(
      setDoc(
        doc(pastCtx.firestore(), 'tournaments/t1/final_phase_bets/p1'),
        { topScorer: 'haaland' },
      ),
    );
  });
});
