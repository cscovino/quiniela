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

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-quiniela-fcm',
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

describe('fcm_tokens — owner-only access (SEC-05)', () => {
  it('allows owner to read own token', async () => {
    const ctx = env.authenticatedContext('user1');
    await assertSucceeds(
      setDoc(doc(ctx.firestore(), 'users/user1/fcm_tokens/tok1'), {
        token: 'exponent-push-token-abc123',
        platform: 'ios',
      }),
    );
  });

  it('allows owner to write own token', async () => {
    const ctx = env.authenticatedContext('user1');
    await assertSucceeds(
      setDoc(doc(ctx.firestore(), 'users/user1/fcm_tokens/tok1'), {
        token: 'exponent-push-token-abc123',
        platform: 'ios',
      }),
    );
  });

  it('rejects non-owner write', async () => {
    // user2 tries to write to user1's token
    const ctx = env.authenticatedContext('user2');
    await assertFails(
      setDoc(doc(ctx.firestore(), 'users/user1/fcm_tokens/tok1'), {
        token: 'exponent-push-token-xyz',
        platform: 'ios',
      }),
    );
  });

  it('rejects unauthenticated write', async () => {
    const ctx = env.unauthenticatedContext();
    await assertFails(
      setDoc(doc(ctx.firestore(), 'users/user1/fcm_tokens/tok1'), {
        token: 'exponent-push-token-xyz',
        platform: 'ios',
      }),
    );
  });

  it('rejects unauthenticated read', async () => {
    const ctx = env.unauthenticatedContext();
    await assertFails(
      setDoc(doc(ctx.firestore(), 'users/user1/fcm_tokens/tok1'), {
        token: 'exponent-push-token-abc123',
        platform: 'ios',
      }),
    );
  });
});
