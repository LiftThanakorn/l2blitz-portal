import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../app.js';
import { clearMemoryCache } from '../db/mysqlAdapter.js';
import { computePublicOlympiadRankings } from '../services/l2Service.js';
import { DEV_FIXTURE_OLYMPIAD_NOBLES } from '../data/fixtures.js';

describe('L2BLITZ PVP — High Five CT 2.6 Backend API & Olympiad Rules', () => {
  beforeEach(() => {
    clearMemoryCache();
    delete process.env.DB_ENABLE;
    delete process.env.USE_DEV_FIXTURES;
  });

  it('1. Unifies Soul Hound Male (132) and Female (133) into canonical bracket 132', () => {
    const result132 = computePublicOlympiadRankings(DEV_FIXTURE_OLYMPIAD_NOBLES, {
      classId: 132,
      cycle: 'current',
      page: 1,
      limit: 10,
    });
    const result133 = computePublicOlympiadRankings(DEV_FIXTURE_OLYMPIAD_NOBLES, {
      classId: 133,
      cycle: 'current',
      page: 1,
      limit: 10,
    });

    assert.equal(result132.canonicalClassId, 132);
    assert.equal(result133.canonicalClassId, 132);
    assert.deepEqual(result132.items, result133.items);

    // Must contain both KaelenVex (132) and SeraphinaNoir (133) in rank order
    assert.equal(result132.items[0]?.charName, 'KaelenVex');
    assert.equal(result132.items[1]?.charName, 'SeraphinaNoir');
  });

  it('2. Excludes characters with fewer than 15 matches and NEVER exposes olympiadPoints in public DTO', () => {
    const result = computePublicOlympiadRankings(DEV_FIXTURE_OLYMPIAD_NOBLES, {
      classId: 132,
      cycle: 'current',
      page: 1,
      limit: 10,
    });

    // UnrankedHound has 210 points but only 8 matches (< 15), so must be excluded
    const unrankedPresent = result.items.some((r) => r.charName === 'UnrankedHound');
    assert.equal(unrankedPresent, false);

    // Verify public DTO never leaks olympiadPoints, competitionsDone, or competitionsWon
    for (const row of result.items) {
      assert.equal('olympiadPoints' in row, false);
      assert.equal('olympiad_points' in row, false);
      assert.equal('competitionsDone' in row, false);
      assert.equal('competitionsWon' in row, false);
      assert.ok(typeof row.rank === 'number');
      assert.ok(typeof row.charName === 'string');
    }
  });

  it('3. Returns Unknown / Unavailable (never fake numbers) when GameServer DB is offline in production mode', async () => {
    process.env.NODE_ENV = 'production';
    process.env.USE_DEV_FIXTURES = 'false';

    const app = createApp();
    const server = app.listen(0);
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    try {
      const statusRes = await fetch(`http://127.0.0.1:${port}/api/server/status`);
      const statusJson = (await statusRes.json()) as {
        ok: boolean;
        source: string;
        data: { status: string };
      };
      assert.equal(statusJson.ok, true);
      assert.equal(statusJson.source, 'unavailable');
      assert.equal(statusJson.data.status, 'unknown');

      const statsRes = await fetch(`http://127.0.0.1:${port}/api/server/stats`);
      const statsJson = (await statsRes.json()) as {
        data: { playersOnline: number | null; totalCharacters: number | null };
      };
      assert.equal(statsJson.data.playersOnline, null);
      assert.equal(statsJson.data.totalCharacters, null);

      const raidRes = await fetch(`http://127.0.0.1:${port}/api/raidbosses`);
      const raidJson = (await raidRes.json()) as {
        data: { nameEn: string; status: string }[];
      };
      const queenAnt = raidJson.data.find((b) => b.nameEn === 'Queen Ant');
      const baium = raidJson.data.find((b) => b.nameEn === 'Baium');
      assert.ok(queenAnt);
      assert.ok(baium);
      assert.equal(queenAnt.status, 'unknown');
      assert.equal(baium.status, 'unknown');
    } finally {
      server.close();
    }
  });
});
