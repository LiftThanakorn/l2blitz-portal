// Cloudflare Pages Function: same-origin gateway to L2Blitz VPS.
// The upstream origin is fixed: callers cannot choose a target host.
const API_ORIGIN = 'https://154-215-14-70.sslip.io';
const ROUTES = new Set([
  '/api/health', '/api/server/status', '/api/server/stats', '/api/server/rates',
  '/api/rankings/pvp', '/api/rankings/pk', '/api/rankings/clans',
  '/api/olympiad/rankings', '/api/olympiad/top-by-class',
  '/api/olympiad/heroes', '/api/castles', '/api/raidbosses', '/api/events/tvt',
]);

const LOCAL_ROUTES = [
  { pattern: /^\/api\/local\/health$/, methods: ['GET'] },
  { pattern: /^\/api\/local\/me$/, methods: ['GET'] },
  { pattern: /^\/api\/local\/packages$/, methods: ['GET'] },
  { pattern: /^\/api\/local\/active-order$/, methods: ['GET'] },
  { pattern: /^\/api\/local\/qr\/\d+\.png$/, methods: ['GET'] },
  { pattern: /^\/api\/local\/orders$/, methods: ['GET', 'POST'] },
  { pattern: /^\/api\/local\/redeem$/, methods: ['POST'] },
  { pattern: /^\/api\/local\/login$/, methods: ['POST'] },
  { pattern: /^\/api\/local\/logout$/, methods: ['POST'] },
  { pattern: /^\/api\/local\/orders\/[0-9a-f-]{36}\/slip$/i, methods: ['POST'] },
  { pattern: /^\/api\/local\/orders\/[0-9a-f-]{36}\/cancel$/i, methods: ['POST'] },
];

export default {
  async fetch(request, env) {
    const incoming = new URL(request.url);
    if (!incoming.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    // Operator-controlled pre-launch state: TCP reachability is not proof of an open game.
    // The countdown must never automatically open status, rankings or payments.
    const launchApproved = env.PUBLIC_LAUNCH_CONFIRMED === 'true';
    if (!launchApproved && incoming.pathname === '/api/server/status') {
      return Response.json({
        ok: true,
        source: 'operator_prelaunch',
        updatedAt: new Date().toISOString(),
        data: {
          status: 'offline', loginServer: 'unknown', gameServer: 'unknown',
          chronicle: 'High Five (CT 2.6)', region: 'Thailand (GMT+7)',
          messageTh: 'ปิดเซิร์ฟเวอร์เพื่อเตรียมเปิดอย่างเป็นทางการ',
          messageEn: 'Server closed for official launch preparation.',
        },
      }, { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
    }

    // Block payments at the gateway, not only by hiding the website navigation.
    if (incoming.pathname.startsWith('/api/local/') &&
        (!launchApproved || env.PUBLIC_TOPUP_ENABLED !== 'true')) {
      return Response.json({
        ok: false, code: 'PUBLIC_TOPUP_DISABLED',
        error: 'Public payments are disabled until separately approved.',
      }, { status: 503, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
    }

    // Pass allowed TopUp API requests through to VPS origin
    if (incoming.pathname.startsWith('/api/local/')) {
      const route = LOCAL_ROUTES.find(r => r.pattern.test(incoming.pathname));
      if (!route) {
        return new Response('Not found', { status: 404 });
      }

      if (!route.methods.includes(request.method)) {
        return new Response('Method not allowed', {
          status: 405,
          headers: { Allow: route.methods.join(', ') },
        });
      }

      const url = API_ORIGIN + incoming.pathname + incoming.search;
      const headers = new Headers(request.headers);
      headers.set('X-Forwarded-Host', incoming.host);
      headers.set('X-Forwarded-Proto', incoming.protocol.replace(':', ''));

      const clientIp = request.headers.get('CF-Connecting-IP');
      if (clientIp) {
        headers.set('X-Client-IP', clientIp);
        headers.set('X-Real-IP', clientIp);
      }

      try {
        const upstream = await fetch(url, {
          method: request.method,
          headers,
          body: (request.method !== 'GET' && request.method !== 'HEAD') ? request.body : undefined,
          redirect: 'manual',
          signal: AbortSignal.timeout(30000),
        });
        return upstream;
      } catch {
        return Response.json({ ok: false, error: 'TopUp API temporarily unavailable' }, {
          status: 503,
          headers: { 'Cache-Control': 'no-store' },
        });
      }
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }

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
