import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from './_worker.js';

const realNow = Date.now;
const realFetch = globalThis.fetch;
const env = {
  PUBLIC_LAUNCH_CONFIRMED: 'true', PUBLIC_TOPUP_ENABLED: 'true',
  PUBLIC_CHARACTER_DATA_ENABLED: 'false', EDGE_SECRET: 'test-edge-secret',
  ASSETS: { fetch: async () => new Response('asset') },
};
const call = (path, init) => worker.fetch(new Request('https://l2blitz.pages.dev' + path, init), env);

test('time fence blocks launch status and payments before 18:19 ICT', async () => {
  Date.now = () => Date.parse('2026-11-14T11:18:59Z');
  const status = await (await call('/api/server/status')).json();
  assert.equal(status.source, 'operator_prelaunch');
  assert.equal((await call('/api/local/health')).status, 503);
  Date.now = realNow;
});

test('edge requires secure ticket, ignores spoofed edge secret', async () => {
  Date.now = () => Date.parse('2026-11-14T11:19:01Z');
  let observed;
  globalThis.fetch = async (_url, opts) => {
    observed = opts;
    return Response.json({ ok: true, data: { status: 'online' } });
  };
  try {
    assert.equal((await call('/api/server/status')).status, 200);
    assert.equal((await call('/api/local/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ character: 'GM' }) })).status, 401);
    const ok = await call('/api/local/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Edge-Secret': 'spoofed' }, body: JSON.stringify({ ticket: 'A'.repeat(43) }) });
    assert.equal(ok.status, 200);
    assert.equal(observed.headers.get('X-Edge-Secret'), 'test-edge-secret');
    env.PUBLIC_TOPUP_ENABLED = 'false';
    assert.equal((await call('/api/local/health')).status, 503);
    env.PUBLIC_TOPUP_ENABLED = 'true';
  } finally { Date.now = realNow; globalThis.fetch = realFetch; }
});
