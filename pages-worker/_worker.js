// Cloudflare Pages Function: same-origin read-only gateway to L2Blitz VPS.
// The upstream origin is fixed: callers cannot choose a target host.
const API_ORIGIN = 'https://154-215-14-70.sslip.io';
const ROUTES = new Set([
  '/api/health', '/api/server/status', '/api/server/stats', '/api/server/rates',
  '/api/rankings/pvp', '/api/rankings/pk', '/api/rankings/clans',
  '/api/olympiad/rankings', '/api/olympiad/top-by-class',
  '/api/olympiad/heroes', '/api/castles', '/api/raidbosses', '/api/events/tvt',
]);
export default {
  async fetch(request, env) {
    if (!new URL(request.url).pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  const incoming = new URL(request.url);
  const publicLaunch = env.PUBLIC_CHARACTER_DATA_ENABLED === 'true';
  // Fail closed during Close Beta, including direct API requests.
  if (!publicLaunch && (/^\/api\/(rankings|olympiad)(\/|$)/.test(incoming.pathname) || incoming.pathname === '/api/castles')) {
    return Response.json({ ok: false, source: 'unavailable', data: null, code: 'PUBLIC_LAUNCH_PENDING', error: 'Character rankings are not public before the official launch.' }, {
      status: 403, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
  }
  if (!publicLaunch && incoming.pathname === '/api/server/stats') {
    return Response.json({ ok: true, source: 'unavailable', updatedAt: new Date().toISOString(), data: {
      playersOnline: null, totalCharacters: null, totalClans: null, activeOlympiadNobles: null, status: 'pending_launch',
    } }, { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  }
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
    // TvT schedules stay public; individual match results and character names do not.
    if (!publicLaunch && incoming.pathname === '/api/events/tvt' && upstream.ok) {
      const payload = await upstream.json();
      if (payload && payload.data) {
        payload.data.recentResults = [];
        payload.data.resultsVerified = false;
        payload.data.topPlayers = [];
      }
      return Response.json(payload, { status: upstream.status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
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
};
