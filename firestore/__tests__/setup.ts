import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';

const RULES_FILE = resolve(__dirname, '../../firestore.rules');

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
 * Build a RulesTestEnvironment where the tournament-start deadline is shifted to
 * the past (2020-01-01), so "after deadline" rule assertions can pass even when
 * the real clock is before 2026-06-11.
 */
export async function buildPastDeadlineEnv(
  projectId = 'demo-quiniela-past',
): Promise<RulesTestEnvironment> {
  const rulesSource = readFileSync(RULES_FILE, 'utf8');
  const pastDeadlineRules = rulesSource.replace(
    'timestamp.date(2026, 6, 11)',
    'timestamp.date(2020, 1, 1)',
  );
  return initializeTestEnvironment({
    projectId,
    firestore: {
      rules: pastDeadlineRules,
      host: '127.0.0.1',
      port: 8080,
    },
  });
}

/** Expose the resolved rules file path so test files can pass it to canary checks. */
export const RULES_FILE_PATH = RULES_FILE;