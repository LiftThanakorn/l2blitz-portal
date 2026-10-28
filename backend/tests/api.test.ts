import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { apiCache } from '../src/utils/cache.js';
import { executeReadOnlyQuery } from '../src/dal/database.js';
import { buildValidCharacterWhereClause } from '../src/dal/mobiusRepository.js';
import { getClassName } from '../../shared/l2Classes.js';
import {
  HealthResponseSchema,
  ServerStatusResponseSchema,
  ServerStatsResponseSchema,
  ServerRatesResponseSchema,
  PlayerRankingsResponseSchema,
  ClanRankingsResponseSchema,
  OlympiadHeroesResponseSchema,
  CastlesResponseSchema,
  RaidBossesResponseSchema,
  TvtEventResponseSchema,
} from '../../shared/schema.js';

describe('L2Blitz Backend API & Data Integrity Suite', () => {
  const app = createApp();

  beforeEach(() => {
    apiCache.clear();
  });

  it('rejects any non-GET HTTP method on /api (Read-Only enforcement)', async () => {
    const res = await request(app).post('/api/rankings/pvp').send({ hack: true });
    expect(res.status).toBe(405);
    expect(res.body.error).toBe('Method Not Allowed');
  });

  it('rejects any non-SELECT SQL statement in Data Access Layer', async () => {
    await expect(
      executeReadOnlyQuery('UPDATE characters SET pvpkills = 9999 WHERE char_name = "Test"')
    ).rejects.toThrow(/Security Violation: Only SELECT queries are permitted/);

    await expect(
      executeReadOnlyQuery('DELETE FROM characters')
    ).rejects.toThrow(/Security Violation/);
  });

  it('constructs valid L2J Mobius High Five character filter excluding GMs, deleted chars, and test accounts', () => {
    const { clause, params } = buildValidCharacterWhereClause('c');
    expect(clause).toContain('c.accesslevel = 0');
    expect(clause).toContain('(c.deletetime = 0 OR c.deletetime IS NULL)');
    expect(clause).toContain('NOT IN');
    expect(params.length).toBeGreaterThan(0);
  });

  it('maps High Five Kamael classes (123–136) accurately', () => {
    expect(getClassName(131)).toBe('Doombringer');
    expect(getClassName(134)).toBe('Trickster');
    expect(getClassName(136)).toBe('Judicator');
    expect(getClassName(88)).toBe('Duelist');
  });

  it('GET /api/health returns valid schema and demo status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    const parsed = HealthResponseSchema.safeParse(res.body);
    expect(parsed.success).toBe(true);
    expect(res.body.meta.isDemo).toBe(true);
  });

  it('GET /api/server/status & /api/server/stats & /api/server/rates validate against Zod schemas', async () => {
    const [statusRes, statsRes, ratesRes] = await Promise.all([
      request(app).get('/api/server/status'),
      request(app).get('/api/server/stats'),
      request(app).get('/api/server/rates'),
    ]);

    expect(ServerStatusResponseSchema.safeParse(statusRes.body).success).toBe(true);
    expect(ServerStatsResponseSchema.safeParse(statsRes.body).success).toBe(true);
    expect(ServerRatesResponseSchema.safeParse(ratesRes.body).success).toBe(true);
    expect(ratesRes.body.maxLevel).toBe(85); // High Five max level
  });

  it('GET /api/rankings/pvp & /api/rankings/pk support pagination, classFilter, and search', async () => {
    const pvpRes = await request(app).get('/api/rankings/pvp?page=1&limit=5&classId=131');
    expect(pvpRes.status).toBe(200);
    expect(PlayerRankingsResponseSchema.safeParse(pvpRes.body).success).toBe(true);
    expect(pvpRes.body.items.every((p: { classId: number }) => p.classId === 131)).toBe(true);

    const pkRes = await request(app).get('/api/rankings/pk?page=1&limit=5');
    expect(pkRes.status).toBe(200);
    expect(PlayerRankingsResponseSchema.safeParse(pkRes.body).success).toBe(true);
  });

  it('GET /api/rankings/clans, /api/olympiad/heroes, /api/castles, /api/raidbosses, /api/events/tvt validate against schemas', async () => {
    const [clansRes, heroesRes, castlesRes, bossesRes, tvtRes] = await Promise.all([
      request(app).get('/api/rankings/clans'),
      request(app).get('/api/olympiad/heroes'),
      request(app).get('/api/castles'),
      request(app).get('/api/raidbosses'),
      request(app).get('/api/events/tvt'),
    ]);

    expect(ClanRankingsResponseSchema.safeParse(clansRes.body).success).toBe(true);
    expect(OlympiadHeroesResponseSchema.safeParse(heroesRes.body).success).toBe(true);
    expect(CastlesResponseSchema.safeParse(castlesRes.body).success).toBe(true);
    expect(RaidBossesResponseSchema.safeParse(bossesRes.body).success).toBe(true);
    expect(TvtEventResponseSchema.safeParse(tvtRes.body).success).toBe(true);

    // Ensure Queen Ant (29001) and Baium (29020) have custom teleport warnings
    const qa = bossesRes.body.items.find((b: { bossId: number }) => b.bossId === 29001);
    const baium = bossesRes.body.items.find((b: { bossId: number }) => b.bossId === 29020);
    expect(qa?.isCustomTeleport).toBe(true);
    expect(baium?.isCustomTeleport).toBe(true);
  });

  it('GET /api/olympiad/rankings returns classes with ranked players without exposing points', async () => {
    const res = await request(app).get('/api/olympiad/rankings');
    expect(res.status).toBe(200);

    // Verify response matches OlympiadRankingsResponseSchema
    const { OlympiadRankingsResponseSchema } = await import('../../shared/schema.js');
    expect(OlympiadRankingsResponseSchema.safeParse(res.body).success).toBe(true);

    // Crucial rule: Check that NO player object has olympiad_points or points field
    for (const group of res.body.classes) {
      expect(group).toHaveProperty('classId');
      expect(group).toHaveProperty('className');
      expect(group).toHaveProperty('race');
      for (const p of group.players) {
        expect(p).toHaveProperty('rank');
        expect(p).toHaveProperty('charName');
        expect(p).toHaveProperty('clanName');
        // STRICT CHECK: Points MUST NOT exist in public payload
        expect(p).not.toHaveProperty('olympiad_points');
        expect(p).not.toHaveProperty('points');
      }
    }

    // Filter by classId (e.g. Duelist #88)
    const duelistRes = await request(app).get('/api/olympiad/rankings?classId=88');
    expect(duelistRes.status).toBe(200);
    expect(duelistRes.body.classes.length).toBe(1);
    expect(duelistRes.body.classes[0].classId).toBe(88);
    expect(duelistRes.body.classes[0].className).toBe('Duelist');
  });

  it('unifies Male & Female Soulhound (132/133) into a single Olympiad group under Class ID 132', async () => {
    const res = await request(app).get('/api/olympiad/rankings?classId=132');
    expect(res.status).toBe(200);
    expect(res.body.classes.length).toBe(1);

    const soulhoundGroup = res.body.classes[0];
    expect(soulhoundGroup.classId).toBe(132);
    expect(soulhoundGroup.className).toBe('Soulhound');
    expect(soulhoundGroup.race).toBe('Kamael');

    // Contestants in demo include both male and female soulhound characters
    expect(soulhoundGroup.players.length).toBeGreaterThan(0);
    expect(soulhoundGroup.players[0].rank).toBe(1);
  });

  it('supports cycle selection (current vs previous) and returns cycle metadata', async () => {
    const currentRes = await request(app).get('/api/olympiad/rankings?cycle=current');
    expect(currentRes.status).toBe(200);
    expect(currentRes.body.cycleType).toBe('current');
    expect(currentRes.body.minMatchesRequired).toBe(9);
    expect(typeof currentRes.body.hasPreviousData).toBe('boolean');

    const previousRes = await request(app).get('/api/olympiad/rankings?cycle=previous');
    expect(previousRes.status).toBe(200);
    expect(previousRes.body.cycleType).toBe('previous');
  });

  it('supports pagination on Olympiad rankings with correct rank offsets', async () => {
    const res = await request(app).get('/api/olympiad/rankings?classId=132&page=2&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(2);

    const group = res.body.classes[0];
    expect(group.totalPlayers).toBeGreaterThanOrEqual(group.players.length);
    if (group.players.length > 0) {
      // Offset for page 2, limit 2 starts at rank 3
      expect(group.players[0].rank).toBe(3);
    }
  });
});
