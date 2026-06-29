/**
 * Migrate knockout match dates and stadiums.
 *
 * Reads the canonical schedule from ./data/knockout-schedule-official.ts and
 * writes date, stadium, and predictionDeadline to the 32 knockout match docs
 * in tournaments/world-cup-2026/matches/{slug}.
 *
 * DRY-RUN by default. Re-run with --execute to apply changes to Firestore.
 * Or point at the emulator with USE_FIREBASE_EMULATOR=true.
 *
 * NOTE: This script updates ALL 32 knockout matches regardless of status
 * (live, finished, scheduled). User override confirmed.
 */
import admin from 'firebase-admin';

import { KNOCKOUT_FIX } from './data/knockout-schedule-official';

const TOURNAMENT_ID = 'world-cup-2026';

const IS_EMULATOR = process.env.USE_FIREBASE_EMULATOR === 'true';
const DRY_RUN = !IS_EMULATOR && !process.argv.includes('--execute');

function initAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0] as admin.app.App;

  if (IS_EMULATOR) {
    process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
    const projectId =
      process.env.PUBLIC_FIREBASE_EMULATOR_PROJECT_ID ??
      process.env.FIREBASE_PROJECT_ID ??
      'demo-quiniela';
    console.log(`Connected to Firebase Emulator (${process.env.FIRESTORE_EMULATOR_HOST})`);
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

async function main() {
  if (DRY_RUN) {
    console.log(
      '*** DRY RUN — no writes will be made. Re-run with --execute (and real ' +
        'credentials) or USE_FIREBASE_EMULATOR=true to apply changes. ***\n',
    );
  } else if (!IS_EMULATOR) {
    console.log('*** EXECUTE MODE against PRODUCTION Firestore — writes WILL be made. ***\n');
  }

  const batch = db.batch();
  let planned = 0;
  let unchanged = 0;
  let skipped = 0;
  let missing = 0;

  for (const fix of KNOCKOUT_FIX) {
    const ref = matchRef(fix.slug);
    const snap = await ref.get();
    if (!snap.exists) {
      console.log(`  MISSING ${fix.slug}: no match doc in Firestore`);
      missing++;
      continue;
    }

    const data = snap.data() as MatchDoc;
    const currentDate = fmtTs(data.date);
    const newDate = new Date(fix.date).toISOString();
    const newDeadline = predictionDeadline(fix.date);

    const dateChanged = currentDate !== newDate;
    const stadiumChanged = data.stadium !== fix.stadium;
    const deadlineChanged = fmtTs(data.predictionDeadline) !== newDeadline;

    if (!dateChanged && !stadiumChanged && !deadlineChanged) {
      unchanged++;
      continue;
    }

    const changes: string[] = [];
    if (dateChanged) changes.push(`date ${currentDate} → ${newDate}`);
    if (stadiumChanged)
      changes.push(`stadium "${data.stadium ?? '<missing>'}" → "${fix.stadium}"`);
    if (deadlineChanged) changes.push(`predictionDeadline → ${newDeadline}`);

    const statusTag = data.status === 'live' || data.status === 'finished'
      ? `[${data.status.toUpperCase()}] `
      : '';

    console.log(
      `  ${DRY_RUN ? 'WOULD FIX' : 'FIXING'} ${fix.slug} ${statusTag}${changes.join(', ')}`,
    );
    planned++;

    batch.update(ref, {
      date: admin.firestore.Timestamp.fromDate(new Date(fix.date)),
      stadium: fix.stadium,
      predictionDeadline: admin.firestore.Timestamp.fromDate(new Date(newDeadline)),
    });

    if (data.status === 'live' || data.status === 'finished') {
      skipped++;
    }
  }

  if (missing > 0) {
    console.log(
      `\nWARNING: ${missing} match doc(s) missing — re-run pnpm seed first if needed.`,
    );
  }

  if (planned === 0) {
    console.log(
      `\nAll ${KNOCKOUT_FIX.length} knockout matches already match the official schedule.`,
    );
    console.log(`(${unchanged} already correct, ${missing} missing)`);
  } else if (DRY_RUN) {
    console.log(
      `\n[dry-run] Would update ${planned} match doc(s) — re-run with --execute to apply.`,
    );
    if (skipped > 0) {
      console.log(`  (${skipped} of these are live/finished — user override confirmed)`);
    }
  } else {
    if (missing > 0) {
      console.log('\nABORTING: missing match docs — re-run pnpm seed first.');
      process.exit(1);
    }
    await batch.commit();
    console.log(`\nUpdated ${planned} match doc(s) in Firestore.`);
    console.log(`(${unchanged} already correct, ${skipped} live/finished)`);
  }

  console.log('\nFields updated: date, stadium, predictionDeadline');
  console.log(
    'Fields preserved: slug, phase, groupId, homeTeamId, awayTeamId, result, status, tbd, tbdHome, tbdAway, createdAt, updatedAt',
  );
  console.log('\nDone');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
