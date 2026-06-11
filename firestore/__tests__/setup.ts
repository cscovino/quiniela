import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

const RULES_FILE = resolve(__dirname, '../../firestore/firestore.rules');

/**
 * Build a RulesTestEnvironment connected to the Firestore emulator on port 8080.
 * Rules are loaded from firestore.rules at module load time.
 */
export async function buildTestEnv(
  projectId = 'demo-quiniela-test',
): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync(RULES_FILE, 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
}

/**
 * Create a second, isolated test env (used for "past deadline" scenarios).
 * Unlike buildTestEnv, no string replacement is needed — the "past" behavior
 * is achieved by seeding a tournament doc with an expired firstMatchKickoff.
 */
export async function buildPastDeadlineEnv(
  projectId = 'demo-quiniela-past',
): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync(RULES_FILE, 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
}

/**
 * Seed the tournament document with a firstMatchKickoff Timestamp.
 */
export async function seedTournament(
  env: RulesTestEnvironment,
  tournamentId: string,
  kickoff: Timestamp,
): Promise<void> {
  await env.withSecurityRulesDisabled(async (safeCtx) => {
    await setDoc(doc(safeCtx.firestore(), `tournaments/${tournamentId}`), {
      firstMatchKickoff: kickoff,
    });
  });
}

/** Expose the resolved rules file path so test files can pass it to canary checks. */
export const RULES_FILE_PATH = RULES_FILE;
