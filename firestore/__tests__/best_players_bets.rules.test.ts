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
    projectId: 'demo-quiniela-best-players',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
  pastDeadlineEnv = await buildPastDeadlineEnv('demo-quiniela-best-players-past');
});

afterEach(async () => {
  await env.clearFirestore();
  await pastDeadlineEnv.clearFirestore();
});

afterAll(async () => {
  await env.cleanup();
  await pastDeadlineEnv.cleanup();
});

describe('best_players_bets — authentication', () => {
  it('rejects unauthenticated create', async () => {
    const ctx = env.unauthenticatedContext();
    await assertFails(
      setDoc(doc(ctx.firestore(), 'tournaments/t1/best_players_bets/p1'), {
        userId: 'user1',
        topScorer: 'messi',
      }),
    );
  });

  it('allows authenticated owner to create before deadline', async () => {
    const ctx = env.authenticatedContext('user1');
    await assertSucceeds(
      setDoc(doc(ctx.firestore(), 'tournaments/t1/best_players_bets/p1'), {
        userId: 'user1',
        topScorer: 'messi',
      }),
    );
  });

  it('rejects non-owner create', async () => {
    const ctx = env.authenticatedContext('user2');
    await assertFails(
      setDoc(doc(ctx.firestore(), 'tournaments/t1/best_players_bets/p1'), {
        userId: 'user1',
        topScorer: 'messi',
      }),
    );
  });
});

describe('best_players_bets — deadline rejection (SEC-04)', () => {
  it('rejects create after deadline via past-deadline environment', async () => {
    // Canary: ensure rules loaded isBeforeTournamentStart
    const rules = readFileSync(RULES_FILE_PATH, 'utf8');
    expect(rules).toContain('isBeforeTournamentStart');

    const ctx = pastDeadlineEnv.authenticatedContext('user1');
    await assertFails(
      setDoc(doc(ctx.firestore(), 'tournaments/t1/best_players_bets/p1'), {
        userId: 'user1',
        topScorer: 'mbappe',
      }),
    );
  });

  it('allows update before deadline', async () => {
    const ownerCtx = env.authenticatedContext('user1');
    await assertSucceeds(
      setDoc(doc(ownerCtx.firestore(), 'tournaments/t1/best_players_bets/p1'), {
        userId: 'user1',
        topScorer: 'messi',
      }),
    );
    await assertSucceeds(
      setDoc(
        doc(ownerCtx.firestore(), 'tournaments/t1/best_players_bets/p1'),
        { topScorer: 'haaland' },
      ),
    );
  });

  it('rejects update after deadline via past-deadline environment', async () => {
    const ownerCtx = env.authenticatedContext('user1');
    await assertSucceeds(
      setDoc(doc(ownerCtx.firestore(), 'tournaments/t1/best_players_bets/p1'), {
        userId: 'user1',
        topScorer: 'messi',
      }),
    );
    const pastCtx = pastDeadlineEnv.authenticatedContext('user1');
    await assertFails(
      setDoc(
        doc(pastCtx.firestore(), 'tournaments/t1/best_players_bets/p1'),
        { topScorer: 'haaland' },
      ),
    );
  });
});
