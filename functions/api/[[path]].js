// Cloudflare Pages Function: same-origin read-only gateway to L2Blitz VPS.
// The upstream origin is fixed: callers cannot choose a target host.
const API_ORIGIN = 'https://154-215-14-70.sslip.io';
const ROUTES = new Set([
  '/api/health', '/api/server/status', '/api/server/stats', '/api/server/rates',
  '/api/rankings/pvp', '/api/rankings/pk', '/api/rankings/clans',
  '/api/olympiad/rankings', '/api/olympiad/top-by-class',
  '/api/olympiad/heroes', '/api/castles', '/api/raidbosses', '/api/events/tvt',
]);
export async function onRequest({ request }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  const incoming = new URL(request.url);
  if (!ROUTES.has(incoming.pathname)) {
    return new Response('Not found', { status: 404 });
  }
  const url = API_ORIGIN + incoming.pathname + incoming.search;
  try {
    const upstream = await fetch(url, {
      method: request.method,
      headers: { Accept: 'application/json' },
      redirect: 'manual',
      signal: AbortSignal.timeout(6500),
    });
    if (upstream.status >= 300 && upstream.status < 400) {
      return new Response('Unexpected upstream redirect', { status: 502 });
    }
    const response = new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
    return response;
  } catch {
    return Response.json({ ok: false, source: 'unavailable', data: null, error: 'API temporarily unavailable' }, {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
