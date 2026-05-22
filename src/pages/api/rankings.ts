import type { APIRoute } from 'astro';
import { rankingsService } from '../../services/rankings-service';

const CACHE_TTL = 300; // 5 minutes

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);

    const allStats = await rankingsService.getAllPredictorStats();

    const startIndex = (page - 1) * pageSize;
    const paginated = allStats.slice(startIndex, startIndex + pageSize);

    const response = new Response(
      JSON.stringify({
        rankings: paginated,
        total: allStats.length,
        page,
        pageSize,
        totalPages: Math.ceil(allStats.length / pageSize),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`,
        },
      },
    );

    return response;
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch rankings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
