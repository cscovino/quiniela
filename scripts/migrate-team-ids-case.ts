import admin from 'firebase-admin';

const TOURNAMENT_ID = 'world-cup-2026';

const IS_EMULATOR = process.env.USE_FIREBASE_EMULATOR === 'true';
// Writes to production are gated behind an explicit --execute flag. Without it
// (and when not pointed at the emulator) the script runs read-only and logs the
// changes it WOULD make, so an accidental run can never mutate prod data.
const DRY_RUN = !IS_EMULATOR && !process.argv.includes('--execute');

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

interface TeamStanding {
  teamId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface GroupStandingsDoc {
  groupId: string;
  standings: TeamStanding[];
  pointsCalculated?: boolean;
}

interface MatchDoc {
  slug: string;
  phase: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
}

const needsUppercasing = (s: string | null | undefined): s is string =>
  typeof s === 'string' && s !== s.toUpperCase();

async function loadGroupStandings(): Promise<
  { ref: admin.firestore.DocumentReference; data: GroupStandingsDoc }[]
> {
  const snap = await db.collection(`tournaments/${TOURNAMENT_ID}/group_standings`).get();
  return snap.docs.map((d) => ({ ref: d.ref, data: d.data() as GroupStandingsDoc }));
}

async function loadMatches(): Promise<{ ref: admin.firestore.DocumentReference; data: MatchDoc }[]> {
  const snap = await db.collection(`tournaments/${TOURNAMENT_ID}/matches`).get();
  return snap.docs.map((d) => ({ ref: d.ref, data: d.data() as MatchDoc }));
}

async function migrateGroupStandings(): Promise<number> {
  const docs = await loadGroupStandings();
  let updateCount = 0;
  const batch = db.batch();

  for (const { ref, data } of docs) {
    let dirty = false;
    const newStandings = data.standings.map((s) => {
      if (needsUppercasing(s.teamId)) {
        dirty = true;
        return { ...s, teamId: s.teamId.toUpperCase() };
      }
      return s;
    });
    if (dirty) {
      batch.update(ref, { standings: newStandings });
      console.log(
        `  group_standings/${data.groupId}: → uppercase teamIds (${newStandings
          .map((s) => s.teamId)
          .join(', ')})`,
      );
      updateCount++;
    } else {
      console.log(`  group_standings/${data.groupId}: already uppercase — skip`);
    }
  }

  if (updateCount > 0) {
    if (DRY_RUN) {
      console.log(`\n[dry-run] Would update ${updateCount} group_standings docs`);
    } else {
      await batch.commit();
      console.log(`\nUpdated ${updateCount} group_standings docs`);
    }
  } else {
    console.log('\nAll group_standings already canonical');
  }

  return updateCount;
}

async function migrateMatches(): Promise<number> {
  const docs = await loadMatches();
  let updateCount = 0;
  const batch = db.batch();

  for (const { ref, data } of docs) {
    const home = data.homeTeamId;
    const away = data.awayTeamId;
    if (needsUppercasing(home) || needsUppercasing(away)) {
      const update: { homeTeamId?: string; awayTeamId?: string } = {};
      if (needsUppercasing(home)) update.homeTeamId = home.toUpperCase();
      if (needsUppercasing(away)) update.awayTeamId = away.toUpperCase();
      batch.update(ref, update);
      console.log(
        `  matches/${data.slug}: homeTeamId=${update.homeTeamId ?? home} → awayTeamId=${
          update.awayTeamId ?? away
        }`,
      );
      updateCount++;
    }
  }

  if (updateCount > 0) {
    if (DRY_RUN) {
      console.log(`\n[dry-run] Would update ${updateCount} match docs`);
    } else {
      await batch.commit();
      console.log(`\nUpdated ${updateCount} match docs`);
    }
  } else {
    console.log('\nAll matches already canonical');
  }

  return updateCount;
}

async function listTeamsWithLowercaseIds(): Promise<{ id: string; newId: string }[]> {
  const snap = await db.collection(`tournaments/${TOURNAMENT_ID}/teams`).get();
  const moves: { id: string; newId: string }[] = [];
  for (const doc of snap.docs) {
    if (needsUppercasing(doc.id)) {
      moves.push({ id: doc.id, newId: doc.id.toUpperCase() });
    }
  }
  return moves;
}

async function migrateTeamDocIds(): Promise<number> {
  const moves = await listTeamsWithLowercaseIds();

  if (moves.length === 0) {
    console.log('\nAll teams doc IDs already uppercase');
    return 0;
  }

  console.log(`\n  ${moves.length} team doc(s) need ID rename:`);
  for (const m of moves) {
    console.log(`    teams/${m.id} → teams/${m.newId}`);
  }

  if (DRY_RUN) {
    console.log(`\n[dry-run] Would rename ${moves.length} team doc(s) (creates new doc, deletes old)`);
    return 0;
  }

  const collectionRef = db.collection(`tournaments/${TOURNAMENT_ID}/teams`);
  const batch = db.batch();
  for (const m of moves) {
    const oldDoc = await collectionRef.doc(m.id).get();
    if (!oldDoc.exists) continue;
    const data = oldDoc.data();
    batch.set(collectionRef.doc(m.newId), data, { merge: true });
    batch.delete(collectionRef.doc(m.id));
  }
  await batch.commit();
  console.log(`\nRenamed ${moves.length} team doc(s)`);
  return moves.length;
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

  console.log('1) group_standings.standings[].teamId → uppercase');
  await migrateGroupStandings();

  console.log('\n2) matches.{slug}.homeTeamId/awayTeamId → uppercase');
  await migrateMatches();

  console.log('\n3) teams doc IDs → uppercase');
  await migrateTeamDocIds();

  console.log('\nDone. After running, re-trigger group_bets scoring by re-saving the standings.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
