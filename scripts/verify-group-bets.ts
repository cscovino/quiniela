import admin from 'firebase-admin';

if (admin.apps.length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

const db = admin.firestore();
const TOURNAMENT_ID = 'world-cup-2026';

function parseArgs(): { predictorId?: string; groupId?: string; fix: boolean; all: boolean } {
  const args = process.argv.slice(2);
  const predictorId = args.find((a) => !a.startsWith('--')) ?? undefined;
  const groupArg = args.find((a) => a.startsWith('--group='));
  const groupId = groupArg ? groupArg.split('=')[1] : undefined;
  const fix = args.includes('--fix');
  const all = args.includes('--all');
  return { predictorId, groupId, fix, all };
}

interface PredictedStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

interface MatchInfo {
  id: string;
  groupId: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  phase: string;
}

function calculateGroupStandings(
  matches: MatchInfo[],
  predictions: Record<string, { home?: number; away?: number }>,
  groupId: string,
): PredictedStanding[] {
  const groupMatches = matches.filter((m) => m.groupId === groupId && m.phase === 'group');
  const standings: Record<string, PredictedStanding> = {};

  const initTeam = (teamId: string) => {
    if (!standings[teamId]) {
      standings[teamId] = {
        teamId,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      };
    }
  };

  for (const match of groupMatches) {
    const pred = predictions[match.id];
    if (!pred || pred.home == null || pred.away == null) continue;
    if (!match.homeTeamId || !match.awayTeamId) continue;

    initTeam(match.homeTeamId);
    initTeam(match.awayTeamId);

    const home = standings[match.homeTeamId];
    const away = standings[match.awayTeamId];

    home.played++;
    away.played++;
    home.goalsFor += pred.home;
    home.goalsAgainst += pred.away;
    away.goalsFor += pred.away;
    away.goalsAgainst += pred.home;

    if (pred.home > pred.away) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (pred.home < pred.away) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
    }
  }

  return Object.values(standings).sort(
    (a, b) => b.points - a.points || b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst),
  );
}

async function getMatches(): Promise<MatchInfo[]> {
  const snap = await db.collection(`tournaments/${TOURNAMENT_ID}/matches`).get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      groupId: data.groupId as string,
      homeTeamId: data.homeTeamId as string | null,
      awayTeamId: data.awayTeamId as string | null,
      phase: data.phase as string,
    };
  });
}

async function getPredictorBets(predictorId: string): Promise<Record<string, { home?: number; away?: number }>> {
  const snap = await db
    .collection(`tournaments/${TOURNAMENT_ID}/bets`)
    .where('predictorId', '==', predictorId)
    .get();

  const predictions: Record<string, { home?: number; away?: number }> = {};
  for (const doc of snap.docs) {
    const data = doc.data();
    predictions[data.matchId as string] = { home: data.homeScore, away: data.awayScore };
  }
  return predictions;
}

async function getGroupBets(predictorId: string): Promise<Record<string, string[]>> {
  const snap = await db
    .collection(`tournaments/${TOURNAMENT_ID}/group_bets`)
    .where('predictorId', '==', predictorId)
    .get();

  const bets: Record<string, string[]> = {};
  for (const doc of snap.docs) {
    const data = doc.data();
    bets[data.groupId as string] = data.positions as string[];
  }
  return bets;
}

async function getAllPredictorIds(): Promise<string[]> {
  const snap = await db.collectionGroup('predictors').get();
  return snap.docs.map((d) => d.id);
}

async function fixPredictorGroupBets(
  predictorId: string,
  groupId: string,
  predictedOrder: string[],
): Promise<void> {
  if (predictedOrder.length === 0) {
    console.log(`  ⏭️  Skipped group ${groupId}: no match predictions to derive standings`);
    return;
  }

  await db
    .collection(`tournaments/${TOURNAMENT_ID}/group_bets`)
    .where('predictorId', '==', predictorId)
    .where('groupId', '==', groupId)
    .get()
    .then((snap) => {
      if (snap.empty) {
        console.log(`  No group_bets doc found for group ${groupId}`);
        return;
      }
      for (const doc of snap.docs) {
        doc.ref.update({ positions: predictedOrder });
      }
      console.log(`  ✅ Fixed group ${groupId}: [${predictedOrder.join(', ')}]`);
    });
}

interface VerifyResult {
  predictorId: string;
  errors: Array<{ groupId: string; stored: string[]; predicted: string[] }>;
}

async function verifyPredictor(
  predictorId: string,
  groupId?: string,
  fix = false,
): Promise<VerifyResult> {
  const [matches, predictions, groupBets] = await Promise.all([
    getMatches(),
    getPredictorBets(predictorId),
    getGroupBets(predictorId),
  ]);

  const groupsInBets = new Set(Object.keys(groupBets));
  const groupsToCheck = groupId ? [groupId] : [...groupsInBets].sort();

  const errors: VerifyResult['errors'] = [];

  for (const g of groupsToCheck) {
    const predictedStandings = calculateGroupStandings(matches, predictions, g);
    const storedPositions = groupBets[g] ?? [];

    const predictedOrder = predictedStandings.map((s) => s.teamId);
    const bothEmpty = predictedOrder.length === 0 && storedPositions.length === 0;
    const match = bothEmpty ||
      (predictedOrder.length === storedPositions.length &&
        predictedOrder.every((teamId, i) => teamId === storedPositions[i]));

    if (!match) {
      errors.push({ groupId: g, stored: storedPositions, predicted: predictedOrder });

      console.log(`\n❌ Group ${g} — MISMATCH`);
      console.log(`  Stored positions: [${storedPositions.join(', ')}]`);
      console.log(`  Predicted order: [${predictedOrder.join(', ')}]`);

      for (const s of predictedStandings) {
        const storedIdx = storedPositions.indexOf(s.teamId);
        const marker = storedIdx === -1 ? '❓' : storedIdx === predictedStandings.indexOf(s) ? '✅' : '⚠️';
        console.log(`  ${marker} ${s.teamId}: P${s.played} W${s.won} D${s.drawn} L${s.lost} GF${s.goalsFor} GA${s.goalsAgainst} PTS${s.points} (pos ${predictedStandings.indexOf(s) + 1})`);
      }

      if (fix) {
        await fixPredictorGroupBets(predictorId, g, predictedOrder);
      }
    }
  }

  if (errors.length === 0) {
    console.log(`✅ ${predictorId}: OK`);
  } else if (!fix) {
    console.log(`⚠️  ${predictorId}: ${errors.length} error(s) — pnpm verify:group-bets -- ${predictorId} --fix`);
  }

  return { predictorId, errors };
}

async function main() {
  const { predictorId, groupId, fix, all } = parseArgs();

  if (!predictorId && !all) {
    console.log('Usage: pnpm verify:group-bets -- <predictorId> [--group=<groupId>] [--fix]');
    console.log('       pnpm verify:group-bets -- --all [--fix]');
    console.log('\nExamples:');
    console.log('  pnpm verify:group-bets -- fnP7ruoZSicJKSi5H1YQFHwIinE3-1781184008622');
    console.log('  pnpm verify:group-bets -- fnP7ruoZSicJKSi5H1YQFHwIinE3-1781184008622 --group=K');
    console.log('  pnpm verify:group-bets -- fnP7ruoZSicJKSi5H1YQFHwIinE3-1781184008622 --fix');
    console.log('  pnpm verify:group-bets -- --all');
    console.log('  pnpm verify:group-bets -- --all --fix');
    process.exit(1);
  }

  if (all) {
    console.log('Fetching all predictors...\n');
    const predictorIds = await getAllPredictorIds();
    console.log(`Verifying ${predictorIds.length} predictors...\n`);

    const results: VerifyResult[] = [];
    for (const pid of predictorIds) {
      const result = await verifyPredictor(pid);
      results.push(result);
    }

    const withErrors = results.filter((r) => r.errors.length > 0);
    const ok = results.filter((r) => r.errors.length === 0);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`Total: ${results.length} | ✅ OK: ${ok.length} | ❌ Errors: ${withErrors.length}`);
    console.log('═══════════════════════════════════════════════════════════════');

    if (withErrors.length > 0) {
      console.log('\nPredictors with errors (run --fix to repair):');
      for (const r of withErrors) {
        console.log(`  pnpm verify:group-bets -- ${r.predictorId} --fix  # ${r.errors.map((e) => e.groupId).join(', ')}`);
      }
    }

    if (fix && withErrors.length > 0) {
      console.log('\nFixing all predictors...\n');
      for (const r of withErrors) {
        await verifyPredictor(r.predictorId, undefined, true);
      }
      console.log('Done.');
    }
  } else if (predictorId) {
    await verifyPredictor(predictorId, groupId, fix);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
