import type { APIRoute } from 'astro';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { Match } from '../../types/firestore';

const TOURNAMENT_ID = 'world-cup-2026';
const CACHE_TTL = 300; // 5 minutes

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const phase = url.searchParams.get('phase');
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    const constraints = [orderBy('date')];
    const q = query(collection(db, 'tournaments', TOURNAMENT_ID, 'matches'), ...constraints);
    const snapshot = await getDocs(q);

    let matches = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Match & { id: string })[];

    if (status) {
      matches = matches.filter((m) => m.status === status);
    }

    if (phase) {
      matches = matches.filter((m) => m.phase === phase);
    }

    matches = matches.slice(0, limit);

    const response = new Response(JSON.stringify(matches), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`,
      },
    });

    return response;
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch matches' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
