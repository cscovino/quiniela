/**
 * Read-only verify: diffs the 32 knockout matches in Firestore against the
 * canonical schedule in ./data/knockout-schedule-official.ts.
 *
 * Exit code: 0 if all match (OK or SKIP-FINISHED), 1 if any UPDATE needed.
 * Always safe to run — no writes.
 */
import admin from 'firebase-admin';

import { KNOCKOUT_FIX } from './data/knockout-schedule-official';

const TOURNAMENT_ID = 'world-cup-2026';

function initAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0] as admin.app.App;

  const IS_EMULATOR = process.env.USE_FIREBASE_EMULATOR === 'true';
  if (IS_EMULATOR) {
    process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
    const projectId =
      process.env.PUBLIC_FIREBASE_EMULATOR_PROJECT_ID ??
      process.env.FIREBASE_PROJECT_ID ??
      'demo-quiniela';
    return admin.initializeApp({ projectId });
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }

  console.warn(
    'WARNING: FIREBASE_SERVICE_ACCOUNT not set — falling back to Application Default Credentials.',
  );
  return admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

const db = admin.firestore(initAdmin());

const PREDICTION_LEAD_MINUTES = 10;

function predictionDeadline(kickoffIso: string): string {
  const d = new Date(kickoffIso);
  d.setMinutes(d.getMinutes() - PREDICTION_LEAD_MINUTES);
  return d.toISOString();
}

interface MatchDoc {
  slug: string;
  date?: admin.firestore.Timestamp;
  stadium?: string;
  predictionDeadline?: admin.firestore.Timestamp;
  status?: string;
}

function matchRef(slug: string) {
  return db.doc(`tournaments/${TOURNAMENT_ID}/matches/${slug}`);
}

function fmtTs(ts: admin.firestore.Timestamp | undefined): string {
  if (!ts) return '<missing>';
  return ts.toDate().toISOString();
}

type Action = 'UPDATE' | 'OK' | 'SKIP-FINISHED' | 'MISSING';

interface DiffEntry {
  slug: string;
  status: string | undefined;
  currentDate: string;
  newDate: string;
  currentStadium: string | undefined;
  newStadium: string;
  currentDeadline: string;
  newDeadline: string;
  action: Action;
}

async function main() {
  console.log('=== Verify knockout schedule vs ESPN ===\n');

  const results: DiffEntry[] = [];

  for (const fix of KNOCKOUT_FIX) {
    const ref = matchRef(fix.slug);
    const snap = await ref.get();

    if (!snap.exists) {
      results.push({
        slug: fix.slug,
        status: undefined,
        currentDate: '<missing>',
        newDate: fix.date,
        currentStadium: undefined,
        newStadium: fix.stadium,
        currentDeadline: '<missing>',
        newDeadline: predictionDeadline(fix.date),
        action: 'MISSING',
      });
      continue;
    }

    const data = snap.data() as MatchDoc;
    const currentDate = fmtTs(data.date);
    const newDate = new Date(fix.date).toISOString();
    const currentDeadline = fmtTs(data.predictionDeadline);
    const newDeadline = predictionDeadline(fix.date);

    const dateChanged = currentDate !== newDate;
    const stadiumChanged = data.stadium !== fix.stadium;
    const deadlineChanged = currentDeadline !== newDeadline;

    const isFinished = data.status === 'finished' || data.status === 'live';

    const action: Action =
      !dateChanged && !stadiumChanged && !deadlineChanged
        ? isFinished
          ? 'SKIP-FINISHED'
          : 'OK'
        : isFinished
          ? 'UPDATE' // still UPDATE, but flag as finished
          : 'UPDATE';

    results.push({
      slug: fix.slug,
      status: data.status,
      currentDate,
      newDate,
      currentStadium: data.stadium,
      newStadium: fix.stadium,
      currentDeadline,
      newDeadline,
      action,
    });
  }

  // Summary counts
  const counts = {
    UPDATE: results.filter((r) => r.action === 'UPDATE').length,
    OK: results.filter((r) => r.action === 'OK').length,
    'SKIP-FINISHED': results.filter((r) => r.action === 'SKIP-FINISHED').length,
    MISSING: results.filter((r) => r.action === 'MISSING').length,
  };

  // Print SKIP-FINISHED first (important context for the override)
  const skipFinished = results.filter((r) => r.action === 'SKIP-FINISHED');
  if (skipFinished.length > 0) {
    console.log(`SKIP-FINISHED (${skipFinished.length}): ${skipFinished.map((r) => r.slug).join(', ')}`);
  }

  // Print UPDATEs
  const updates = results.filter((r) => r.action === 'UPDATE');
  if (updates.length > 0) {
    console.log(`UPDATE (${updates.length}):`);
    for (const r of updates) {
      const changes: string[] = [];
      if (r.currentDate !== r.newDate)
        changes.push(`date ${r.currentDate} → ${r.newDate}`);
      if (r.currentStadium !== r.newStadium)
        changes.push(`stadium "${r.currentStadium ?? '<missing>'}" → "${r.newStadium}"`);
      if (r.currentDeadline !== r.newDeadline)
        changes.push(`predictionDeadline → ${r.newDeadline}`);
      const tag = r.status ? `[${r.status.toUpperCase()}] ` : '';
      console.log(`  ${r.slug} ${tag}${changes.join(', ')}`);
    }
  }

  // Print OK
  const ok = results.filter((r) => r.action === 'OK');
  if (ok.length > 0) {
    console.log(`OK (${ok.length}): ${ok.map((r) => r.slug).join(', ')}`);
  }

  // Print MISSING
  const missingResults = results.filter((r) => r.action === 'MISSING');
  if (missingResults.length > 0) {
    console.log(`MISSING (${missingResults.length}): ${missingResults.map((r) => r.slug).join(', ')}`);
  }

  console.log(`\nTotal: ${results.length} matches`);
  console.log(`\nSummary: ${counts.UPDATE} UPDATE, ${counts.OK} OK, ${counts['SKIP-FINISHED']} SKIP-FINISHED, ${counts.MISSING} MISSING`);

  // Exit 0 if no UPDATE needed, exit 1 if there are updates
  process.exit(counts.UPDATE > 0 || counts.MISSING > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
