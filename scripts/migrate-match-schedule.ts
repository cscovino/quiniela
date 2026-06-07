import admin from 'firebase-admin';

const TOURNAMENT_ID = 'world-cup-2026';

const IS_EMULATOR = process.env.USE_FIREBASE_EMULATOR === 'true';
// Writes to production are gated behind an explicit --execute flag. Without it
// (and when not pointed at the emulator) the script runs read-only and logs the
// changes it WOULD make, so an accidental run can never mutate prod data.
const DRY_RUN = !IS_EMULATOR && !process.argv.includes('--execute');

// Uses the Admin SDK so writes bypass Firestore security rules (match writes are
// admin-only). Mirrors src/lib/firebase-admin.ts: service-account JSON in prod,
// project id + emulator host when targeting the emulator, ADC otherwise.
function initAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0] as admin.app.App;

  if (IS_EMULATOR) {
    process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
    const projectId =
      process.env.PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID ?? 'demo-quiniela';
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

interface ScheduleFix {
  slug: string;
  date: string;
  stadium: string;
}

const SCHEDULE_FIX: ScheduleFix[] = [
  { slug: 'match-a1', date: '2026-06-11T19:00:00Z', stadium: 'Mexico City Stadium' },
  { slug: 'match-a2', date: '2026-06-12T02:00:00Z', stadium: 'Estadio Guadalajara' },
  { slug: 'match-a3', date: '2026-06-19T01:00:00Z', stadium: 'Estadio Guadalajara' },
  { slug: 'match-a4', date: '2026-06-18T16:00:00Z', stadium: 'Atlanta Stadium' },
  { slug: 'match-a5', date: '2026-06-25T01:00:00Z', stadium: 'Mexico City Stadium' },
  { slug: 'match-a6', date: '2026-06-25T01:00:00Z', stadium: 'Estadio Monterrey' },

  { slug: 'match-b1', date: '2026-06-12T19:00:00Z', stadium: 'Toronto Stadium' },
  { slug: 'match-b2', date: '2026-06-13T19:00:00Z', stadium: 'San Francisco Bay Area Stadium' },
  { slug: 'match-b3', date: '2026-06-18T22:00:00Z', stadium: 'BC Place Vancouver' },
  { slug: 'match-b4', date: '2026-06-18T19:00:00Z', stadium: 'Los Angeles Stadium' },
  { slug: 'match-b5', date: '2026-06-24T19:00:00Z', stadium: 'BC Place Vancouver' },
  { slug: 'match-b6', date: '2026-06-24T19:00:00Z', stadium: 'Seattle Stadium' },

  { slug: 'match-c1', date: '2026-06-13T22:00:00Z', stadium: 'New York New Jersey Stadium' },
  { slug: 'match-c2', date: '2026-06-14T01:00:00Z', stadium: 'Boston Stadium' },
  { slug: 'match-c3', date: '2026-06-20T00:30:00Z', stadium: 'Philadelphia Stadium' },
  { slug: 'match-c4', date: '2026-06-19T22:00:00Z', stadium: 'Boston Stadium' },
  { slug: 'match-c5', date: '2026-06-24T22:00:00Z', stadium: 'Miami Stadium' },
  { slug: 'match-c6', date: '2026-06-24T22:00:00Z', stadium: 'Atlanta Stadium' },

  { slug: 'match-d1', date: '2026-06-13T01:00:00Z', stadium: 'Los Angeles Stadium' },
  { slug: 'match-d2', date: '2026-06-14T04:00:00Z', stadium: 'BC Place Vancouver' },
  { slug: 'match-d3', date: '2026-06-19T19:00:00Z', stadium: 'Seattle Stadium' },
  { slug: 'match-d4', date: '2026-06-20T04:00:00Z', stadium: 'San Francisco Bay Area Stadium' },
  { slug: 'match-d5', date: '2026-06-26T02:00:00Z', stadium: 'Los Angeles Stadium' },
  { slug: 'match-d6', date: '2026-06-26T02:00:00Z', stadium: 'San Francisco Bay Area Stadium' },

  { slug: 'match-e1', date: '2026-06-14T17:00:00Z', stadium: 'Houston Stadium' },
  { slug: 'match-e2', date: '2026-06-14T23:00:00Z', stadium: 'Philadelphia Stadium' },
  { slug: 'match-e3', date: '2026-06-20T20:00:00Z', stadium: 'Toronto Stadium' },
  { slug: 'match-e4', date: '2026-06-21T00:00:00Z', stadium: 'Kansas City Stadium' },
  { slug: 'match-e5', date: '2026-06-25T20:00:00Z', stadium: 'New York New Jersey Stadium' },
  { slug: 'match-e6', date: '2026-06-25T20:00:00Z', stadium: 'Philadelphia Stadium' },

  { slug: 'match-f1', date: '2026-06-14T20:00:00Z', stadium: 'Dallas Stadium' },
  { slug: 'match-f2', date: '2026-06-15T02:00:00Z', stadium: 'Estadio Monterrey' },
  { slug: 'match-f3', date: '2026-06-20T17:00:00Z', stadium: 'Houston Stadium' },
  { slug: 'match-f4', date: '2026-06-21T04:00:00Z', stadium: 'Estadio Monterrey' },
  { slug: 'match-f5', date: '2026-06-25T23:00:00Z', stadium: 'Kansas City Stadium' },
  { slug: 'match-f6', date: '2026-06-25T23:00:00Z', stadium: 'Dallas Stadium' },

  { slug: 'match-g1', date: '2026-06-15T19:00:00Z', stadium: 'Seattle Stadium' },
  { slug: 'match-g2', date: '2026-06-16T01:00:00Z', stadium: 'Los Angeles Stadium' },
  { slug: 'match-g3', date: '2026-06-21T19:00:00Z', stadium: 'Los Angeles Stadium' },
  { slug: 'match-g4', date: '2026-06-22T01:00:00Z', stadium: 'BC Place Vancouver' },
  { slug: 'match-g5', date: '2026-06-27T03:00:00Z', stadium: 'BC Place Vancouver' },
  { slug: 'match-g6', date: '2026-06-27T03:00:00Z', stadium: 'Seattle Stadium' },

  { slug: 'match-h1', date: '2026-06-15T16:00:00Z', stadium: 'Atlanta Stadium' },
  { slug: 'match-h2', date: '2026-06-15T22:00:00Z', stadium: 'Miami Stadium' },
  { slug: 'match-h3', date: '2026-06-21T16:00:00Z', stadium: 'Atlanta Stadium' },
  { slug: 'match-h4', date: '2026-06-21T22:00:00Z', stadium: 'Miami Stadium' },
  { slug: 'match-h5', date: '2026-06-27T00:00:00Z', stadium: 'Estadio Guadalajara' },
  { slug: 'match-h6', date: '2026-06-26T23:00:00Z', stadium: 'Houston Stadium' },

  { slug: 'match-i1', date: '2026-06-16T19:00:00Z', stadium: 'New York New Jersey Stadium' },
  { slug: 'match-i2', date: '2026-06-16T22:00:00Z', stadium: 'Boston Stadium' },
  { slug: 'match-i3', date: '2026-06-22T21:00:00Z', stadium: 'Philadelphia Stadium' },
  { slug: 'match-i4', date: '2026-06-23T00:00:00Z', stadium: 'New York New Jersey Stadium' },
  { slug: 'match-i5', date: '2026-06-26T19:00:00Z', stadium: 'Boston Stadium' },
  { slug: 'match-i6', date: '2026-06-26T19:00:00Z', stadium: 'Toronto Stadium' },

  { slug: 'match-j1', date: '2026-06-17T01:00:00Z', stadium: 'Kansas City Stadium' },
  { slug: 'match-j2', date: '2026-06-17T04:00:00Z', stadium: 'San Francisco Bay Area Stadium' },
  { slug: 'match-j3', date: '2026-06-22T17:00:00Z', stadium: 'Dallas Stadium' },
  { slug: 'match-j4', date: '2026-06-23T03:00:00Z', stadium: 'San Francisco Bay Area Stadium' },
  { slug: 'match-j5', date: '2026-06-28T02:00:00Z', stadium: 'Dallas Stadium' },
  { slug: 'match-j6', date: '2026-06-28T02:00:00Z', stadium: 'Kansas City Stadium' },

  { slug: 'match-k1', date: '2026-06-17T17:00:00Z', stadium: 'Houston Stadium' },
  { slug: 'match-k2', date: '2026-06-18T02:00:00Z', stadium: 'Mexico City Stadium' },
  { slug: 'match-k3', date: '2026-06-23T17:00:00Z', stadium: 'Houston Stadium' },
  { slug: 'match-k4', date: '2026-06-24T02:00:00Z', stadium: 'Estadio Guadalajara' },
  { slug: 'match-k5', date: '2026-06-27T23:30:00Z', stadium: 'Miami Stadium' },
  { slug: 'match-k6', date: '2026-06-27T23:30:00Z', stadium: 'Atlanta Stadium' },

  { slug: 'match-l1', date: '2026-06-17T20:00:00Z', stadium: 'Dallas Stadium' },
  { slug: 'match-l2', date: '2026-06-17T23:00:00Z', stadium: 'Toronto Stadium' },
  { slug: 'match-l3', date: '2026-06-23T20:00:00Z', stadium: 'Boston Stadium' },
  { slug: 'match-l4', date: '2026-06-23T23:00:00Z', stadium: 'Toronto Stadium' },
  { slug: 'match-l5', date: '2026-06-27T21:00:00Z', stadium: 'New York New Jersey Stadium' },
  { slug: 'match-l6', date: '2026-06-27T21:00:00Z', stadium: 'Philadelphia Stadium' },
];

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
  let missing = 0;
  const issues: string[] = [];

  for (const fix of SCHEDULE_FIX) {
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
    if (stadiumChanged) changes.push(`stadium "${data.stadium ?? '<missing>'}" → "${fix.stadium}"`);
    if (deadlineChanged) changes.push(`predictionDeadline → ${newDeadline}`);

    console.log(`  ${DRY_RUN ? 'WOULD FIX' : 'FIXING'} ${fix.slug}: ${changes.join(', ')}`);
    planned++;

    if (issues.length === 0) {
      batch.update(ref, {
        date: admin.firestore.Timestamp.fromDate(new Date(fix.date)),
        stadium: fix.stadium,
        predictionDeadline: admin.firestore.Timestamp.fromDate(new Date(newDeadline)),
      });
    }
  }

  if (missing > 0) {
    issues.push(`${missing} match doc(s) missing — re-run pnpm seed first if these need to be created.`);
  }

  if (planned === 0) {
    console.log(`\nAll ${SCHEDULE_FIX.length} matches already match the official schedule.`);
    if (unchanged === SCHEDULE_FIX.length) {
      console.log('No writes needed.');
    } else {
      console.log(`(${unchanged} already correct, ${missing} missing)`);
    }
  } else if (DRY_RUN) {
    console.log(
      `\n[dry-run] Would update ${planned} match doc(s) — re-run with --execute to apply.`,
    );
  } else {
    if (issues.length > 0) {
      console.log(`\nABORTING: ${issues.join(' ')}`);
      process.exit(1);
    }
    await batch.commit();
    console.log(`\nUpdated ${planned} match doc(s) in Firestore.`);
    console.log(`(${unchanged} already correct, ${missing} missing)`);
  }

  console.log('\nFields updated: date, stadium, predictionDeadline');
  console.log('Fields preserved: slug, phase, groupId, homeTeamId, awayTeamId, result, status, tbd, tbdHome, tbdAway, createdAt, updatedAt');
  console.log('\nDone');
}

main().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
