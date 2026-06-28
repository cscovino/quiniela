import admin from 'firebase-admin';

if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();
const TOURNAMENT_ID = 'world-cup-2026';

interface GroupStandings {
  first: string;
  second: string;
  third: string;
  fourth: string;
}

interface GroupData {
  matches: Array<{ slug: string; homeTeamId: string; awayTeamId: string }>;
  standings: GroupStandings;
}

const PREDICTOR_ID = 'WSUsFCw8z1hMpBLYBMQcCi4bAv62-1781202782907';

const groups: Record<string, GroupData> = {
  'group-b': {
    matches: [
      { slug: 'match-b1', homeTeamId: 'CAN', awayTeamId: 'BIH' },
      { slug: 'match-b2', homeTeamId: 'QAT', awayTeamId: 'SUI' },
      { slug: 'match-b3', homeTeamId: 'CAN', awayTeamId: 'QAT' },
      { slug: 'match-b4', homeTeamId: 'BIH', awayTeamId: 'SUI' },
      { slug: 'match-b5', homeTeamId: 'CAN', awayTeamId: 'SUI' },
      { slug: 'match-b6', homeTeamId: 'BIH', awayTeamId: 'QAT' },
    ],
    standings: { first: 'SUI', second: 'CAN', third: 'QAT', fourth: 'BIH' },
  },
  'group-f': {
    matches: [
      { slug: 'match-f1', homeTeamId: 'NED', awayTeamId: 'JPN' },
      { slug: 'match-f2', homeTeamId: 'SWE', awayTeamId: 'TUN' },
      { slug: 'match-f3', homeTeamId: 'NED', awayTeamId: 'SWE' },
      { slug: 'match-f4', homeTeamId: 'JPN', awayTeamId: 'TUN' },
      { slug: 'match-f5', homeTeamId: 'NED', awayTeamId: 'TUN' },
      { slug: 'match-f6', homeTeamId: 'JPN', awayTeamId: 'SWE' },
    ],
    standings: { first: 'NED', second: 'JPN', third: 'SWE', fourth: 'TUN' },
  },
  'group-g': {
    matches: [
      { slug: 'match-g1', homeTeamId: 'BEL', awayTeamId: 'EGY' },
      { slug: 'match-g2', homeTeamId: 'IRN', awayTeamId: 'NZL' },
      { slug: 'match-g3', homeTeamId: 'BEL', awayTeamId: 'IRN' },
      { slug: 'match-g4', homeTeamId: 'EGY', awayTeamId: 'NZL' },
      { slug: 'match-g5', homeTeamId: 'BEL', awayTeamId: 'NZL' },
      { slug: 'match-g6', homeTeamId: 'EGY', awayTeamId: 'IRN' },
    ],
    standings: { first: 'BEL', second: 'IRN', third: 'EGY', fourth: 'NZL' },
  },
  'group-h': {
    matches: [
      { slug: 'match-h1', homeTeamId: 'ESP', awayTeamId: 'CPV' },
      { slug: 'match-h2', homeTeamId: 'KSA', awayTeamId: 'URU' },
      { slug: 'match-h3', homeTeamId: 'ESP', awayTeamId: 'KSA' },
      { slug: 'match-h4', homeTeamId: 'CPV', awayTeamId: 'URU' },
      { slug: 'match-h5', homeTeamId: 'ESP', awayTeamId: 'URU' },
      { slug: 'match-h6', homeTeamId: 'CPV', awayTeamId: 'KSA' },
    ],
    standings: { first: 'ESP', second: 'URU', third: 'KSA', fourth: 'CPV' },
  },
  'group-i': {
    matches: [
      { slug: 'match-i1', homeTeamId: 'FRA', awayTeamId: 'SEN' },
      { slug: 'match-i2', homeTeamId: 'IRQ', awayTeamId: 'NOR' },
      { slug: 'match-i3', homeTeamId: 'FRA', awayTeamId: 'IRQ' },
      { slug: 'match-i4', homeTeamId: 'SEN', awayTeamId: 'NOR' },
      { slug: 'match-i5', homeTeamId: 'FRA', awayTeamId: 'NOR' },
      { slug: 'match-i6', homeTeamId: 'SEN', awayTeamId: 'IRQ' },
    ],
    standings: { first: 'FRA', second: 'NOR', third: 'SEN', fourth: 'IRQ' },
  },
  'group-j': {
    matches: [
      { slug: 'match-j1', homeTeamId: 'ARG', awayTeamId: 'ALG' },
      { slug: 'match-j2', homeTeamId: 'AUT', awayTeamId: 'JOR' },
      { slug: 'match-j3', homeTeamId: 'ARG', awayTeamId: 'AUT' },
      { slug: 'match-j4', homeTeamId: 'ALG', awayTeamId: 'JOR' },
      { slug: 'match-j5', homeTeamId: 'ARG', awayTeamId: 'JOR' },
      { slug: 'match-j6', homeTeamId: 'ALG', awayTeamId: 'AUT' },
    ],
    standings: { first: 'ARG', second: 'AUT', third: 'ALG', fourth: 'JOR' },
  },
  'group-k': {
    matches: [
      { slug: 'match-k1', homeTeamId: 'POR', awayTeamId: 'COD' },
      { slug: 'match-k2', homeTeamId: 'UZB', awayTeamId: 'COL' },
      { slug: 'match-k3', homeTeamId: 'POR', awayTeamId: 'UZB' },
      { slug: 'match-k4', homeTeamId: 'COD', awayTeamId: 'COL' },
      { slug: 'match-k5', homeTeamId: 'POR', awayTeamId: 'COL' },
      { slug: 'match-k6', homeTeamId: 'COD', awayTeamId: 'UZB' },
    ],
    standings: { first: 'POR', second: 'COL', third: 'UZB', fourth: 'COD' },
  },
  'group-l': {
    matches: [
      { slug: 'match-l1', homeTeamId: 'ENG', awayTeamId: 'CRO' },
      { slug: 'match-l2', homeTeamId: 'GHA', awayTeamId: 'PAN' },
      { slug: 'match-l3', homeTeamId: 'ENG', awayTeamId: 'GHA' },
      { slug: 'match-l4', homeTeamId: 'CRO', awayTeamId: 'PAN' },
      { slug: 'match-l5', homeTeamId: 'ENG', awayTeamId: 'PAN' },
      { slug: 'match-l6', homeTeamId: 'CRO', awayTeamId: 'GHA' },
    ],
    standings: { first: 'ENG', second: 'CRO', third: 'GHA', fourth: 'PAN' },
  },
};

function computeMatchScores(
  matches: Array<{ slug: string; homeTeamId: string; awayTeamId: string }>,
  standings: GroupStandings
): Array<{ matchId: string; homeScore: number; awayScore: number }> {
  const s = standings;
  const t = [s.first, s.second, s.third, s.fourth];
  const pts: Record<string, number> = { [s.first]: 7, [s.second]: 5, [s.third]: 2, [s.fourth]: 1 };
  const gd: Record<string, number> = {
    [s.first]: 3, [s.second]: 1, [s.third]: -1, [s.fourth]: -3,
  };

  const results: Record<string, { gf: number; ga: number; won: number; draw: number; lost: number }> = {};
  for (const team of t) results[team] = { gf: 0, ga: 0, won: 0, draw: 0, lost: 0 };

  for (const m of matches) {
    const h = m.homeTeamId;
    const a = m.awayTeamId;
    const ph = pts[h] ?? 0;
    const pa = pts[a] ?? 0;

    if (ph > pa) {
      results[h].won++;
      results[a].lost++;
    } else if (pa > ph) {
      results[a].won++;
      results[h].lost++;
    } else {
      results[h].draw++;
      results[a].draw++;
    }
  }

  const out: Array<{ matchId: string; homeScore: number; awayScore: number }> = [];
  for (const m of matches) {
    const h = m.homeTeamId;
    const a = m.awayTeamId;
    const rh = results[h];
    const ra = results[a];

    const ph = pts[h] ?? 0;
    const pa = pts[a] ?? 0;

    let homeScore = 1;
    let awayScore = 0;

    if (rh.won > 0 && ra.lost > 0) {
      homeScore = Math.max(1, 2);
      awayScore = 0;
      rh.won--;
      ra.lost--;
    } else if (ra.won > 0 && rh.lost > 0) {
      homeScore = 0;
      awayScore = Math.max(1, 2);
      ra.won--;
      rh.lost--;
    } else if (rh.draw > 0 && ra.draw > 0) {
      homeScore = 1;
      awayScore = 1;
      rh.draw--;
      ra.draw--;
    } else {
      if (rh.won > 0) { homeScore = 1; awayScore = 0; rh.won--; }
      else if (ra.won > 0) { homeScore = 0; awayScore = 1; ra.won--; }
      else if (rh.draw > 0) { homeScore = 1; awayScore = 1; rh.draw--; }
      else if (ra.draw > 0) { homeScore = 1; awayScore = 1; ra.draw--; }
      else { homeScore = 1; awayScore = 0; }
    }

    out.push({ matchId: m.slug, homeScore, awayScore });
    results[h].gf += homeScore;
    results[h].ga += awayScore;
    results[a].gf += awayScore;
    results[a].ga += homeScore;
  }

  return out;
}

async function setDoc(path: string, data: Record<string, unknown>) {
  await db.doc(path).set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
}

async function main() {
  for (const [groupId, data] of Object.entries(groups)) {
    console.log(`\n=== ${groupId.toUpperCase()} ===`);
    console.log(`Standings: ${data.standings.first} > ${data.standings.second} > ${data.standings.third} > ${data.standings.fourth}`);

    await setDoc(`tournaments/${TOURNAMENT_ID}/group_bets/${PREDICTOR_ID}`, {
      predictorId: PREDICTOR_ID,
      groupId,
      ...data.standings,
      points: 0,
    });
    console.log(`  ✓ group_bets written`);

    const matchScores = computeMatchScores(data.matches, data.standings);
    for (const bet of matchScores) {
      const m = data.matches.find((m) => m.slug === bet.matchId)!;
      const docId = `${PREDICTOR_ID}-${bet.matchId}`;
      await setDoc(`tournaments/${TOURNAMENT_ID}/bets/${docId}`, {
        predictorId: PREDICTOR_ID,
        matchId: bet.matchId,
        homeScore: bet.homeScore,
        awayScore: bet.awayScore,
        points: 0,
        isExact: false,
        isWinner: false,
      });
      console.log(`  ✓ ${m.homeTeamId} ${bet.homeScore} - ${bet.awayScore} ${m.awayTeamId} (${bet.matchId})`);
    }
  }

  console.log('\n=== Final Phase + Best Players ===');
  await setDoc(`tournaments/${TOURNAMENT_ID}/final_phase_bets/${PREDICTOR_ID}`, {
    predictorId: PREDICTOR_ID,
    first: 'ESP',
    second: 'FRA',
    third: 'ENG',
    fourth: 'ARG',
    points: 0,
  });
  console.log('  ✓ final_phase_bets: ESP > FRA > ENG > ARG');

  await setDoc(`tournaments/${TOURNAMENT_ID}/best_players_bets/${PREDICTOR_ID}`, {
    predictorId: PREDICTOR_ID,
    bestScorer: 'Mbappe',
    bestGoalkeeper: 'Pickford',
  });
  console.log('  ✓ best_players_bets: Mbappe (scorer), Pickford (goalkeeper)');
}

main().catch(console.error);