import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

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

  // Fall back to Application Default Credentials (`gcloud auth application-default login`).
  console.warn(
    'WARNING: FIREBASE_SERVICE_ACCOUNT not set — falling back to Application Default Credentials.',
  );
  return admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

const db = admin.firestore(initAdmin());

type Phase =
  | 'group'
  | 'round-of-32'
  | 'round-of-16'
  | 'quarterfinals'
  | 'semifinals'
  | 'third-place'
  | 'final';

interface KnockoutMatchDef {
  slug: string;
  phase: Phase;
  tbdHome: string;
  tbdAway: string;
}

interface MatchDoc {
  slug: string;
  phase: Phase;
  homeTeamId: string | null;
  awayTeamId: string | null;
  tbd: boolean;
  tbdHome?: string;
  tbdAway?: string;
}

interface GroupStanding {
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

const EXPECTED_KNOCKOUT_MATCHES: KnockoutMatchDef[] = [
  { slug: 'r32-1', phase: 'round-of-32', tbdHome: '1A', tbdAway: '3C/D/E' },
  { slug: 'r32-2', phase: 'round-of-32', tbdHome: '1C', tbdAway: '3A/B/F' },
  { slug: 'r32-3', phase: 'round-of-32', tbdHome: '1E', tbdAway: '3G/H/K' },
  { slug: 'r32-4', phase: 'round-of-32', tbdHome: '1G', tbdAway: '3I/J/L' },
  { slug: 'r32-5', phase: 'round-of-32', tbdHome: '1B', tbdAway: '3A/B/F' },
  { slug: 'r32-6', phase: 'round-of-32', tbdHome: '1D', tbdAway: '3C/D/E' },
  { slug: 'r32-7', phase: 'round-of-32', tbdHome: '1F', tbdAway: '3G/H/K' },
  { slug: 'r32-8', phase: 'round-of-32', tbdHome: '1H', tbdAway: '3I/J/L' },
  { slug: 'r32-9', phase: 'round-of-32', tbdHome: '1I', tbdAway: '3G/H/K' },
  { slug: 'r32-10', phase: 'round-of-32', tbdHome: '1K', tbdAway: '3I/J/L' },
  { slug: 'r32-11', phase: 'round-of-32', tbdHome: '1A', tbdAway: '3A/B/F' },
  { slug: 'r32-12', phase: 'round-of-32', tbdHome: '1C', tbdAway: '3C/D/E' },
  { slug: 'r32-13', phase: 'round-of-32', tbdHome: '1E', tbdAway: '3I/J/L' },
  { slug: 'r32-14', phase: 'round-of-32', tbdHome: '1G', tbdAway: '3A/B/F' },
  { slug: 'r32-15', phase: 'round-of-32', tbdHome: '1B', tbdAway: '3C/D/E' },
  { slug: 'r32-16', phase: 'round-of-32', tbdHome: '1D', tbdAway: '3G/H/K' },
  { slug: 'r16-1', phase: 'round-of-16', tbdHome: 'W-R32-1', tbdAway: 'W-R32-2' },
  { slug: 'r16-2', phase: 'round-of-16', tbdHome: 'W-R32-3', tbdAway: 'W-R32-4' },
  { slug: 'r16-3', phase: 'round-of-16', tbdHome: 'W-R32-5', tbdAway: 'W-R32-6' },
  { slug: 'r16-4', phase: 'round-of-16', tbdHome: 'W-R32-7', tbdAway: 'W-R32-8' },
  { slug: 'r16-5', phase: 'round-of-16', tbdHome: 'W-R32-9', tbdAway: 'W-R32-10' },
  { slug: 'r16-6', phase: 'round-of-16', tbdHome: 'W-R32-11', tbdAway: 'W-R32-12' },
  { slug: 'r16-7', phase: 'round-of-16', tbdHome: 'W-R32-13', tbdAway: 'W-R32-14' },
  { slug: 'r16-8', phase: 'round-of-16', tbdHome: 'W-R32-15', tbdAway: 'W-R32-16' },
  { slug: 'qf-1', phase: 'quarterfinals', tbdHome: 'W-R16-1', tbdAway: 'W-R16-2' },
  { slug: 'qf-2', phase: 'quarterfinals', tbdHome: 'W-R16-3', tbdAway: 'W-R16-4' },
  { slug: 'qf-3', phase: 'quarterfinals', tbdHome: 'W-R16-5', tbdAway: 'W-R16-6' },
  { slug: 'qf-4', phase: 'quarterfinals', tbdHome: 'W-R16-7', tbdAway: 'W-R16-8' },
  { slug: 'sf-1', phase: 'semifinals', tbdHome: 'W-QF-1', tbdAway: 'W-QF-2' },
  { slug: 'sf-2', phase: 'semifinals', tbdHome: 'W-QF-3', tbdAway: 'W-QF-4' },
  { slug: 'third-place', phase: 'third-place', tbdHome: 'L-SF-1', tbdAway: 'L-SF-2' },
  { slug: 'final', phase: 'final', tbdHome: 'W-SF-1', tbdAway: 'W-SF-2' },
];

// FIFA 2026 Round of 32 — third-place qualification slots (maps M-slot to R32 slug)
const THIRD_PLACE_SLOTS: Record<string, string> = {
  M74: 'r32-2',
  M77: 'r32-5',
  M79: 'r32-7',
  M80: 'r32-8',
  M81: 'r32-9',
  M82: 'r32-10',
  M85: 'r32-13',
  M87: 'r32-15',
};

const R32_MATCHES = EXPECTED_KNOCKOUT_MATCHES.filter(m => m.phase === 'round-of-32');
const GROUP_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

function matchRef(slug: string) {
  return db.doc(`tournaments/${TOURNAMENT_ID}/matches/${slug}`);
}

async function getMatch(slug: string): Promise<MatchDoc | null> {
  const snap = await matchRef(slug).get();
  return snap.exists ? (snap.data() as MatchDoc) : null;
}

async function getAllMatches(): Promise<MatchDoc[]> {
  const snap = await db.collection(`tournaments/${TOURNAMENT_ID}/matches`).get();
  return snap.docs.map((d) => d.data() as MatchDoc);
}

async function getGroupStandings(groupId: string): Promise<GroupStanding[]> {
  const snap = await db.collection(`tournaments/${TOURNAMENT_ID}/group_standings`).get();
  for (const d of snap.docs) {
    const data = d.data();
    if (data.groupId === groupId) {
      return (data.standings || []) as GroupStanding[];
    }
  }
  return [];
}

interface GroupStandingsData {
  byPosition: { first: string; second: string; third: string; fourth: string };
  raw: Record<string, GroupStanding>;
}

async function getAllGroupStandings(): Promise<Record<string, GroupStandingsData>> {
  const result: Record<string, GroupStandingsData> = {};
  for (const label of GROUP_LABELS) {
    const groupId = `group-${label.toLowerCase()}`;
    const standings = await getGroupStandings(groupId);
    if (standings.length === 4) {
      const sorted = [...standings].sort((a, b) => a.position - b.position);
      result[label] = {
        byPosition: {
          first: sorted[0].teamId,
          second: sorted[1].teamId,
          third: sorted[2].teamId,
          fourth: sorted[3].teamId,
        },
        raw: Object.fromEntries(sorted.map(s => [s.teamId, s])),
      };
    }
  }
  return result;
}

function resolveTeamId(tbd: string, standings: Record<string, GroupStandingsData>): string | null {
  const match = tbd.match(/^([0-9]+)([A-Z])$/);
  if (!match) return null;
  const position = parseInt(match[1], 10);
  const groupLabel = match[2];
  const group = standings[groupLabel];
  if (!group) return null;
  const posMap: Record<number, 'first' | 'second' | 'third'> = { 1: 'first', 2: 'second', 3: 'third' };
  const key = posMap[position];
  if (!key) return null;
  return group.byPosition[key] || null;
}

type ThirdPlaceMatrix = Record<string, Record<string, string>>;

function loadThirdPlaceMatrix(): ThirdPlaceMatrix {
  const path = resolve('public/data/third-place-matrix.json');
  const raw = readFileSync(path, 'utf-8');
  return JSON.parse(raw);
}

async function phase1Verify() {
  console.log('=== Phase 1: Verify knockout bracket structure ===\n');
  const allMatches = await getAllMatches();
  const knockoutMatches = allMatches.filter(m => m.phase !== 'group');
  console.log(`Found ${knockoutMatches.length} knockout matches in Firestore`);
  let fixed = 0;
  let ok = 0;
  for (const expected of EXPECTED_KNOCKOUT_MATCHES) {
    const actual = knockoutMatches.find(m => m.slug === expected.slug);
    if (!actual) {
      console.log(`  MISSING: ${expected.slug} (${expected.phase}) — needs to be created`);
      continue;
    }
    const issues: string[] = [];
    if (actual.tbdHome !== expected.tbdHome) issues.push(`tbdHome: "${actual.tbdHome}" → "${expected.tbdHome}"`);
    if (actual.tbdAway !== expected.tbdAway) issues.push(`tbdAway: "${actual.tbdAway}" → "${expected.tbdAway}"`);
    if (!actual.tbd) issues.push('tbd flag missing');
    if (issues.length > 0) {
      console.log(`  ${DRY_RUN ? 'WOULD FIX' : 'FIXING'} ${expected.slug}: ${issues.join(', ')}`);
      if (!DRY_RUN) {
        await matchRef(expected.slug).update({
          tbdHome: expected.tbdHome,
          tbdAway: expected.tbdAway,
          tbd: true,
        });
      }
      fixed++;
    } else {
      ok++;
    }
  }
  const missing = EXPECTED_KNOCKOUT_MATCHES.length - knockoutMatches.length;
  console.log(`\nResults: ${ok} correct, ${fixed} fixed, ${missing} missing`);
  if (missing > 0) {
    console.log('WARNING: Missing matches need to be created via seed script re-run.');
  }
  return { ok, fixed, missing };
}

function sortThirdPlaceTeams(standings: Record<string, GroupStandingsData>): string[] {
  const entries: { group: string; pts: number; gd: number; gf: number }[] = [];
  for (const [label, data] of Object.entries(standings)) {
    const thirdTeamId = data.byPosition.third;
    const raw = data.raw[thirdTeamId];
    entries.push({
      group: label,
      pts: raw?.points ?? 0,
      gd: raw?.goalDifference ?? 0,
      gf: raw?.goalsFor ?? 0,
    });
  }
  entries.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  return entries.slice(0, 8).map(e => e.group);
}

async function phase2FillTeams() {
  console.log('=== Phase 2: Fill R32 team IDs from group standings + third-place matrix ===\n');
  const allStandings = await getAllGroupStandings();
  const resolvedGroups = Object.keys(allStandings);
  if (resolvedGroups.length < 12) {
    console.log(`WARNING: Only ${resolvedGroups.length}/12 groups have standings. Need all 12 to proceed.`);
    console.log('Resolved groups:', resolvedGroups.join(', '));
    return;
  }
  console.log(`Group standings loaded for all 12 groups\n`);

  const matrix = loadThirdPlaceMatrix();
  const advancingGroups = sortThirdPlaceTeams(allStandings);
  const comboKey = advancingGroups.join('');
  const thirdPlaceMapping = matrix[comboKey] || {};
  console.log(`Top 8 third-place groups: ${advancingGroups.join(', ')}`);
  console.log(`Third-place slots assigned via matrix: ${Object.keys(thirdPlaceMapping).length}`);

  const batch = db.batch();
  let updateCount = 0;

  for (const match of R32_MATCHES) {
    const slug = match.slug;
    const homeTeamId = resolveTeamId(match.tbdHome, allStandings);
    if (!homeTeamId) {
      console.log(`  SKIP ${slug}: cannot resolve tbdHome "${match.tbdHome}"`);
      continue;
    }

    let awayTeamId: string | null;
    const mSlot = Object.entries(THIRD_PLACE_SLOTS).find(([, s]) => s === slug)?.[0];

    if (mSlot) {
      const assignedGroup = thirdPlaceMapping[mSlot];
      if (!assignedGroup) {
        console.log(`  SKIP ${slug}: no third-place assignment for slot ${mSlot}`);
        continue;
      }
      awayTeamId = allStandings[assignedGroup]?.byPosition?.third || null;
      if (!awayTeamId) {
        console.log(`  SKIP ${slug}: no third-place team in group ${assignedGroup}`);
        continue;
      }
    } else {
      console.log(`  SKIP ${slug}: non-third-place slot — manual bracket logic needed (tbdAway: "${match.tbdAway}")`);
      continue;
    }

    const existing = await getMatch(slug);
    if (existing?.homeTeamId === homeTeamId && existing?.awayTeamId === awayTeamId) {
      console.log(`  OK    ${slug}: ${homeTeamId} vs ${awayTeamId}`);
      continue;
    }

    batch.update(matchRef(slug), {
      homeTeamId,
      awayTeamId,
      tbd: false,
      tbdHome: null,
      tbdAway: null,
    });
    console.log(`  SET   ${slug}: ${homeTeamId} vs ${awayTeamId}`);
    updateCount++;
  }

  if (updateCount > 0) {
    if (DRY_RUN) {
      console.log(`\n[dry-run] Would update ${updateCount} R32 matches (no writes performed)`);
    } else {
      await batch.commit();
      console.log(`\nUpdated ${updateCount} R32 matches`);
    }
  } else {
    console.log('\nAll 8 third-place slots already up to date');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isPhase2 = args.includes('--phase2');

  if (DRY_RUN) {
    console.log(
      '*** DRY RUN — no writes will be made. Re-run with --execute (and real ' +
        'credentials) or USE_FIREBASE_EMULATOR=true to apply changes. ***\n',
    );
  } else if (!IS_EMULATOR) {
    console.log('*** EXECUTE MODE against PRODUCTION Firestore — writes WILL be made. ***\n');
  }

  if (isPhase2) {
    await phase2FillTeams();
  } else {
    await phase1Verify();
  }

  console.log('\nDone');
}

main().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
