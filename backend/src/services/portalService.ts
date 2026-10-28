import { env } from '../config/env.js';
import { apiCache } from '../utils/cache.js';
import { checkTcpPort } from '../utils/tcpProbe.js';
import { pingDatabase } from '../dal/database.js';
import {
  queryOnlineCounts,
  queryServerAggregateStats,
  queryPlayerRankings,
  queryClanRankings,
  queryOlympiadHeroes,
  queryOlympiadRankings,
  queryCastles,
  queryRaidBosses,
} from '../dal/mobiusRepository.js';
import {
  DEMO_SERVER_STATS,
  DEMO_PVP_PLAYERS,
  DEMO_PK_PLAYERS,
  DEMO_CLANS,
  DEMO_HEROES,
  DEMO_CASTLES,
  buildDemoRaidBosses,
  buildDemoOlympiadRankings,
} from '../dal/demoFixtures.js';
import { L2BLITZ_BOSS_CATALOG } from '../../../shared/staticGameContent.js';
import type {
  ApiMeta,
  HealthResponse,
  ServerStatusResponse,
  ServerStatsResponse,
  ServerRatesResponse,
  PlayerRankingsResponse,
  ClanRankingsResponse,
  OlympiadHeroesResponse,
  OlympiadRankingsResponse,
  CastlesResponse,
  RaidBossesResponse,
  TvtEventResponse,
  ServerState,
} from '../../../shared/schema.js';

function createMeta(params: {
  mode: 'live' | 'stale' | 'demo' | 'unavailable';
  updatedAt: string;
  cached: boolean;
  cacheTtlSeconds: number;
  warning?: string;
}): ApiMeta {
  return {
    mode: params.mode,
    isDemo: params.mode === 'demo',
    updatedAt: params.updatedAt,
    serverTime: new Date().toISOString(),
    cached: params.cached,
    cacheTtlSeconds: params.cacheTtlSeconds,
    warning: params.warning,
  };
}

/**
 * Checks live infrastructure state (Database, GameServer TCP 7777, LoginServer TCP 2106).
 * Cached for 15 seconds to prevent TCP/DB ping storms.
 */
export async function probeInfrastructure(): Promise<{
  database: ServerState;
  gameServer: ServerState;
  loginServer: ServerState;
  updatedAt: string;
  cached: boolean;
}> {
  const cacheKey = 'infra:probe';
  const fresh = apiCache.getFresh<{
    database: ServerState;
    gameServer: ServerState;
    loginServer: ServerState;
  }>(cacheKey);

  if (fresh) {
    return { ...fresh.value, updatedAt: fresh.updatedAtIso, cached: true };
  }

  if (!env.DB_ENABLED) {
    const val = {
      database: 'unknown' as ServerState,
      gameServer: 'unknown' as ServerState,
      loginServer: 'unknown' as ServerState,
    };
    const updatedAt = apiCache.set(cacheKey, val, 15);
    return { ...val, updatedAt, cached: false };
  }

  const [dbOk, gsOk, lsOk] = await Promise.all([
    pingDatabase(),
    checkTcpPort(env.GAMESERVER_HOST, env.GAMESERVER_PORT, env.TCP_PROBE_TIMEOUT_MS),
    checkTcpPort(env.LOGINSERVER_HOST, env.LOGINSERVER_PORT, env.TCP_PROBE_TIMEOUT_MS),
  ]);

  const val = {
    database: (dbOk ? 'online' : 'offline') as ServerState,
    gameServer: (gsOk ? 'online' : 'offline') as ServerState,
    loginServer: (lsOk ? 'online' : 'offline') as ServerState,
  };
  const updatedAt = apiCache.set(cacheKey, val, 15);
  return { ...val, updatedAt, cached: false };
}

export async function getHealthStatus(): Promise<HealthResponse> {
  const infra = await probeInfrastructure();
  const isDemo = env.DEMO_MODE && env.NODE_ENV !== 'production';

  const status =
    infra.database === 'online' && infra.gameServer === 'online'
      ? 'ok'
      : isDemo
        ? 'ok'
        : infra.database === 'online'
          ? 'degraded'
          : 'down';

  return {
    status,
    api: 'online',
    database: infra.database,
    gameServer: infra.gameServer,
    loginServer: infra.loginServer,
    demoMode: isDemo,
    uptimeSeconds: Math.floor(process.uptime()),
    meta: createMeta({
      mode: isDemo ? 'demo' : infra.database === 'online' ? 'live' : 'unavailable',
      updatedAt: infra.updatedAt,
      cached: infra.cached,
      cacheTtlSeconds: 15,
      warning: isDemo
        ? 'Development Demo Mode active — GameServer & Database connections are simulated with fixtures.'
        : infra.gameServer !== 'online'
          ? 'GameServer is currently unreachable or offline.'
          : undefined,
    }),
  };
}

export async function getServerStatus(): Promise<ServerStatusResponse> {
  const ttl = 30;
  const cacheKey = 'server:status';
  const fresh = apiCache.getFresh<Omit<ServerStatusResponse, 'meta'>>(cacheKey);
  const isDemo = env.DEMO_MODE && env.NODE_ENV !== 'production';

  if (fresh) {
    return {
      ...fresh.value,
      meta: createMeta({
        mode: isDemo ? 'demo' : 'live',
        updatedAt: fresh.updatedAtIso,
        cached: true,
        cacheTtlSeconds: ttl,
      }),
    };
  }

  const infra = await probeInfrastructure();

  if (env.DB_ENABLED && infra.database === 'online') {
    try {
      const counts = await queryOnlineCounts(infra.gameServer);
      const payload: Omit<ServerStatusResponse, 'meta'> = {
        gameServer: infra.gameServer,
        loginServer: infra.loginServer,
        database: infra.database,
        playersOnline: counts.playersOnline,
        offlineTraders: counts.offlineTraders,
        chronicle: 'High Five (CT 2.6)',
        serverName: 'L2BLITZ PVP (Thailand)',
        region: 'Bangkok, TH (GMT+7)',
      };
      const updatedAt = apiCache.set(cacheKey, payload, ttl);
      return {
        ...payload,
        meta: createMeta({
          mode: 'live',
          updatedAt,
          cached: false,
          cacheTtlSeconds: ttl,
          warning:
            infra.gameServer !== 'online'
              ? 'Database is online, but GameServer TCP port is offline. Online player count is marked unavailable.'
              : undefined,
        }),
      };
    } catch (err) {
      const stale = apiCache.getStale<Omit<ServerStatusResponse, 'meta'>>(cacheKey);
      if (stale) {
        return {
          ...stale.value,
          meta: createMeta({
            mode: 'stale',
            updatedAt: stale.updatedAtIso,
            cached: true,
            cacheTtlSeconds: ttl,
            warning: `Returning cached stale data due to SQL error: ${(err as Error).message}`,
          }),
        };
      }
    }
  }

  if (isDemo) {
    const payload: Omit<ServerStatusResponse, 'meta'> = {
      gameServer: 'online',
      loginServer: 'online',
      database: 'online',
      playersOnline: DEMO_SERVER_STATS.playersOnline,
      offlineTraders: DEMO_SERVER_STATS.offlineTraders,
      chronicle: 'High Five (CT 2.6)',
      serverName: 'L2BLITZ PVP (Thailand)',
      region: 'Bangkok, TH (GMT+7)',
    };
    const updatedAt = apiCache.set(cacheKey, payload, ttl);
    return {
      ...payload,
      meta: createMeta({
        mode: 'demo',
        updatedAt,
        cached: false,
        cacheTtlSeconds: ttl,
        warning: 'DEMO MODE: Showing development fixture data (GameServer not connected).',
      }),
    };
  }

  // Production / Non-Demo Unavailable State: Strictly NO fake numbers!
  return {
    gameServer: infra.gameServer,
    loginServer: infra.loginServer,
    database: infra.database,
    playersOnline: null,
    offlineTraders: null,
    chronicle: 'High Five (CT 2.6)',
    serverName: 'L2BLITZ PVP (Thailand)',
    region: 'Bangkok, TH (GMT+7)',
    meta: createMeta({
      mode: 'unavailable',
      updatedAt: new Date().toISOString(),
      cached: false,
      cacheTtlSeconds: ttl,
      warning: 'GameServer / Database connection is currently unavailable.',
    }),
  };
}

export async function getServerStats(): Promise<ServerStatsResponse> {
  const ttl = 60;
  const cacheKey = 'server:stats';
  const isDemo = env.DEMO_MODE && env.NODE_ENV !== 'production';
  const fresh = apiCache.getFresh<Omit<ServerStatsResponse, 'meta'>>(cacheKey);

  if (fresh) {
    return {
      ...fresh.value,
      meta: createMeta({
        mode: isDemo ? 'demo' : 'live',
        updatedAt: fresh.updatedAtIso,
        cached: true,
        cacheTtlSeconds: ttl,
      }),
    };
  }

  const infra = await probeInfrastructure();

  if (env.DB_ENABLED && infra.database === 'online') {
    try {
      const stats = await queryServerAggregateStats(infra.gameServer);
      const payload: Omit<ServerStatsResponse, 'meta'> = {
        ...stats,
        gameServerStatus: infra.gameServer,
        databaseStatus: infra.database,
      };
      const updatedAt = apiCache.set(cacheKey, payload, ttl);
      return {
        ...payload,
        meta: createMeta({
          mode: 'live',
          updatedAt,
          cached: false,
          cacheTtlSeconds: ttl,
        }),
      };
    } catch (err) {
      const stale = apiCache.getStale<Omit<ServerStatsResponse, 'meta'>>(cacheKey);
      if (stale) {
        return {
          ...stale.value,
          meta: createMeta({
            mode: 'stale',
            updatedAt: stale.updatedAtIso,
            cached: true,
            cacheTtlSeconds: ttl,
            warning: `Stale data returned due to SQL error: ${(err as Error).message}`,
          }),
        };
      }
    }
  }

  if (isDemo) {
    const payload: Omit<ServerStatsResponse, 'meta'> = {
      playersOnline: DEMO_SERVER_STATS.playersOnline,
      totalAccounts: DEMO_SERVER_STATS.totalAccounts,
      totalCharacters: DEMO_SERVER_STATS.totalCharacters,
      totalClans: DEMO_SERVER_STATS.totalClans,
      maxLevelCount: DEMO_SERVER_STATS.maxLevelCount,
      noblesseCount: DEMO_SERVER_STATS.noblesseCount,
      activeHeroesCount: DEMO_SERVER_STATS.activeHeroesCount,
      gameServerStatus: 'online',
      databaseStatus: 'online',
      nextSiege: DEMO_SERVER_STATS.nextSiege,
    };
    const updatedAt = apiCache.set(cacheKey, payload, ttl);
    return {
      ...payload,
      meta: createMeta({
        mode: 'demo',
        updatedAt,
        cached: false,
        cacheTtlSeconds: ttl,
        warning: 'DEMO MODE: Showing development fixture statistics.',
      }),
    };
  }

  return {
    playersOnline: null,
    totalAccounts: null,
    totalCharacters: null,
    totalClans: null,
    maxLevelCount: null,
    noblesseCount: null,
    activeHeroesCount: null,
    gameServerStatus: infra.gameServer,
    databaseStatus: infra.database,
    nextSiege: null,
    meta: createMeta({
      mode: 'unavailable',
      updatedAt: new Date().toISOString(),
      cached: false,
      cacheTtlSeconds: ttl,
      warning: 'Live server statistics are currently unavailable.',
    }),
  };
}

export async function getServerRates(): Promise<ServerRatesResponse> {
  const isDemo = env.DEMO_MODE && env.NODE_ENV !== 'production';
  const nowIso = new Date().toISOString();

  return {
    exp: env.RATE_EXP,
    sp: env.RATE_SP,
    adena: env.RATE_ADENA,
    drop: env.RATE_DROP,
    spoil: env.RATE_SPOIL,
    questDrop: env.RATE_QUEST_DROP,
    raidDrop: env.RATE_RAID_DROP,
    maxLevel: 85,
    subClassMaxLevel: 85,
    safeEnchant: env.SAFE_ENCHANT,
    maxEnchantWeapon: env.MAX_ENCHANT_WEAPON,
    maxEnchantArmor: env.MAX_ENCHANT_ARMOR,
    maxEnchantJewelry: env.MAX_ENCHANT_JEWELRY,
    normalScrollChance: '65% (แตกเป็นผลึก Crystal)',
    blessedScrollChance: '75% (ล้มเหลวกลับเป็น +4 Safe Enchant)',
    ancientScrollChance: '35% (ล้มเหลวระดับตีบวกคงเดิม ไม่ลด)',
    elementStoneChance: '55% (Lv.1 – Lv.4 / Max 150)',
    elementCrystalChance: '40% (Lv.5 – Lv.7 / Max 300)',
    maxBuffSlots: '36 + 4 Divine Inspiration (+16 Dance/Song)',
    buffDurationMinutes: 120,
    meta: createMeta({
      mode: isDemo ? 'demo' : 'live',
      updatedAt: nowIso,
      cached: true,
      cacheTtlSeconds: 300,
    }),
  };
}

export async function getPlayerRankings(params: {
  type: 'pvp' | 'pk';
  page: number;
  limit: number;
  classFilter: number | null;
  searchQuery: string | null;
}): Promise<PlayerRankingsResponse> {
  const ttl = 60;
  const cacheKey = `rankings:${params.type}:p${params.page}:l${params.limit}:c${params.classFilter ?? 'all'}:q${params.searchQuery ?? ''}`;
  const isDemo = env.DEMO_MODE && env.NODE_ENV !== 'production';

  const fresh = apiCache.getFresh<Omit<PlayerRankingsResponse, 'meta'>>(cacheKey);
  if (fresh) {
    return {
      ...fresh.value,
      meta: createMeta({
        mode: isDemo ? 'demo' : 'live',
        updatedAt: fresh.updatedAtIso,
        cached: true,
        cacheTtlSeconds: ttl,
      }),
    };
  }

  const infra = await probeInfrastructure();

  if (env.DB_ENABLED && infra.database === 'online') {
    try {
      const result = await queryPlayerRankings({
        ...params,
        gameServerState: infra.gameServer,
      });
      const payload: Omit<PlayerRankingsResponse, 'meta'> = {
        type: params.type,
        page: params.page,
        limit: params.limit,
        total: result.total,
        classFilter: params.classFilter,
        searchQuery: params.searchQuery,
        items: result.items,
      };
      const updatedAt = apiCache.set(cacheKey, payload, ttl);
      return {
        ...payload,
        meta: createMeta({
          mode: 'live',
          updatedAt,
          cached: false,
          cacheTtlSeconds: ttl,
        }),
      };
    } catch (err) {
      const stale = apiCache.getStale<Omit<PlayerRankingsResponse, 'meta'>>(cacheKey);
      if (stale) {
        return {
          ...stale.value,
          meta: createMeta({
            mode: 'stale',
            updatedAt: stale.updatedAtIso,
            cached: true,
            cacheTtlSeconds: ttl,
            warning: `Stale rankings returned due to SQL error: ${(err as Error).message}`,
          }),
        };
      }
    }
  }

  if (isDemo) {
    const sourceList = params.type === 'pvp' ? DEMO_PVP_PLAYERS : DEMO_PK_PLAYERS;
    let filtered = [...sourceList];

    if (params.classFilter !== null) {
      filtered = filtered.filter((p) => p.classId === params.classFilter);
    }
    if (params.searchQuery && params.searchQuery.trim() !== '') {
      const q = params.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.charName.toLowerCase().includes(q) ||
          (p.clanName && p.clanName.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const offset = (params.page - 1) * params.limit;
    const paged = filtered.slice(offset, offset + params.limit).map((item, idx) => ({
      ...item,
      rank: offset + idx + 1,
    }));

    const payload: Omit<PlayerRankingsResponse, 'meta'> = {
      type: params.type,
      page: params.page,
      limit: params.limit,
      total,
      classFilter: params.classFilter,
      searchQuery: params.searchQuery,
      items: paged,
    };
    const updatedAt = apiCache.set(cacheKey, payload, ttl);
    return {
      ...payload,
      meta: createMeta({
        mode: 'demo',
        updatedAt,
        cached: false,
        cacheTtlSeconds: ttl,
        warning: 'DEMO MODE: Showing fixture rankings (GM and deleted characters excluded).',
      }),
    };
  }

  return {
    type: params.type,
    page: params.page,
    limit: params.limit,
    total: 0,
    classFilter: params.classFilter,
    searchQuery: params.searchQuery,
    items: [],
    meta: createMeta({
      mode: 'unavailable',
      updatedAt: new Date().toISOString(),
      cached: false,
      cacheTtlSeconds: ttl,
      warning: 'Rankings database is currently unavailable.',
    }),
  };
}

export async function getClanRankings(params: {
  page: number;
  limit: number;
}): Promise<ClanRankingsResponse> {
  const ttl = 120;
  const cacheKey = `rankings:clans:p${params.page}:l${params.limit}`;
  const isDemo = env.DEMO_MODE && env.NODE_ENV !== 'production';

  const fresh = apiCache.getFresh<Omit<ClanRankingsResponse, 'meta'>>(cacheKey);
  if (fresh) {
    return {
      ...fresh.value,
      meta: createMeta({
        mode: isDemo ? 'demo' : 'live',
        updatedAt: fresh.updatedAtIso,
        cached: true,
        cacheTtlSeconds: ttl,
      }),
    };
  }

  const infra = await probeInfrastructure();

  if (env.DB_ENABLED && infra.database === 'online') {
    try {
      const result = await queryClanRankings(params);
      const payload: Omit<ClanRankingsResponse, 'meta'> = {
        page: params.page,
        limit: params.limit,
        total: result.total,
        items: result.items,
      };
      const updatedAt = apiCache.set(cacheKey, payload, ttl);
      return {
        ...payload,
        meta: createMeta({
          mode: 'live',
          updatedAt,
          cached: false,
          cacheTtlSeconds: ttl,
        }),
      };
    } catch (err) {
      const stale = apiCache.getStale<Omit<ClanRankingsResponse, 'meta'>>(cacheKey);
      if (stale) {
        return {
          ...stale.value,
          meta: createMeta({
            mode: 'stale',
            updatedAt: stale.updatedAtIso,
            cached: true,
            cacheTtlSeconds: ttl,
            warning: `Stale clan rankings returned due to SQL error: ${(err as Error).message}`,
          }),
        };
      }
    }
  }

  if (isDemo) {
    const offset = (params.page - 1) * params.limit;
    const items = DEMO_CLANS.slice(offset, offset + params.limit);
    const payload: Omit<ClanRankingsResponse, 'meta'> = {
      page: params.page,
      limit: params.limit,
      total: DEMO_CLANS.length,
      items,
    };
    const updatedAt = apiCache.set(cacheKey, payload, ttl);
    return {
      ...payload,
      meta: createMeta({
        mode: 'demo',
        updatedAt,
        cached: false,
        cacheTtlSeconds: ttl,
      }),
    };
  }

  return {
    page: params.page,
    limit: params.limit,
    total: 0,
    items: [],
    meta: createMeta({
      mode: 'unavailable',
      updatedAt: new Date().toISOString(),
      cached: false,
      cacheTtlSeconds: ttl,
      warning: 'Clan database is currently unavailable.',
    }),
  };
}

export async function getOlympiadHeroes(): Promise<OlympiadHeroesResponse> {
  const ttl = 300;
  const cacheKey = 'olympiad:heroes';
  const isDemo = env.DEMO_MODE && env.NODE_ENV !== 'production';

  if (!env.ENABLE_OLYMPIAD_HEROES) {
    return {
      enabled: false,
      currentCycle: null,
      items: [],
      meta: createMeta({
        mode: isDemo ? 'demo' : 'live',
        updatedAt: new Date().toISOString(),
        cached: true,
        cacheTtlSeconds: ttl,
        warning: 'Olympiad Heroes feature is currently disabled in server configuration.',
      }),
    };
  }

  const fresh = apiCache.getFresh<Omit<OlympiadHeroesResponse, 'meta'>>(cacheKey);
  if (fresh) {
    return {
      ...fresh.value,
      meta: createMeta({
        mode: isDemo ? 'demo' : 'live',
        updatedAt: fresh.updatedAtIso,
        cached: true,
        cacheTtlSeconds: ttl,
      }),
    };
  }

  const infra = await probeInfrastructure();

  if (env.DB_ENABLED && infra.database === 'online') {
    try {
      const result = await queryOlympiadHeroes();
      const payload: Omit<OlympiadHeroesResponse, 'meta'> = {
        enabled: true,
        currentCycle: result.currentCycle,
        items: result.items,
      };
      const updatedAt = apiCache.set(cacheKey, payload, ttl);
      return {
        ...payload,
        meta: createMeta({
          mode: 'live',
          updatedAt,
          cached: false,
          cacheTtlSeconds: ttl,
        }),
      };
    } catch (err) {
      const stale = apiCache.getStale<Omit<OlympiadHeroesResponse, 'meta'>>(cacheKey);
      if (stale) {
        return {
          ...stale.value,
          meta: createMeta({
            mode: 'stale',
            updatedAt: stale.updatedAtIso,
            cached: true,
            cacheTtlSeconds: ttl,
            warning: `Stale heroes returned due to SQL error: ${(err as Error).message}`,
          }),
        };
      }
    }
  }

  if (isDemo) {
    const payload: Omit<OlympiadHeroesResponse, 'meta'> = {
      enabled: true,
      currentCycle: 4,
      items: DEMO_HEROES,
    };
    const updatedAt = apiCache.set(cacheKey, payload, ttl);
    return {
      ...payload,
      meta: createMeta({
        mode: 'demo',
        updatedAt,
        cached: false,
        cacheTtlSeconds: ttl,
      }),
    };
  }

  return {
    enabled: true,
    currentCycle: null,
    items: [],
    meta: createMeta({
      mode: 'unavailable',
      updatedAt: new Date().toISOString(),
      cached: false,
      cacheTtlSeconds: ttl,
      warning: 'Olympiad database is currently unavailable.',
    }),
  };
}

export async function getOlympiadRankings(params: {
  cycleType: 'current' | 'previous';
  selectedClassId: number | null;
  page: number;
  limit: number;
}): Promise<OlympiadRankingsResponse> {
  const ttl = 180; // 3 minutes cache as specified
  const cacheKey = `olympiad:rankings:cycle:${params.cycleType}:class:${params.selectedClassId ?? 'all'}:p${params.page}:l${params.limit}`;
  const isDemo = env.DEMO_MODE && env.NODE_ENV !== 'production';

  if (!env.ENABLE_OLYMPIAD_HEROES) {
    return {
      enabled: false,
      cycleType: params.cycleType,
      currentCycle: null,
      cycleNumber: null,
      period: null,
      periodNameTh: 'ปิดใช้งาน',
      periodNameEn: 'Disabled',
      minMatchesRequired: env.OLYMPIAD_MIN_MATCHES,
      hasPreviousData: false,
      page: params.page,
      limit: params.limit,
      selectedClassId: params.selectedClassId,
      classes: [],
      meta: createMeta({
        mode: isDemo ? 'demo' : 'live',
        updatedAt: new Date().toISOString(),
        cached: true,
        cacheTtlSeconds: ttl,
        warning: 'Olympiad feature is currently disabled in server configuration.',
      }),
    };
  }

  const fresh = apiCache.getFresh<Omit<OlympiadRankingsResponse, 'meta'>>(cacheKey);
  if (fresh) {
    return {
      ...fresh.value,
      meta: createMeta({
        mode: isDemo ? 'demo' : 'live',
        updatedAt: fresh.updatedAtIso,
        cached: true,
        cacheTtlSeconds: ttl,
      }),
    };
  }

  const infra = await probeInfrastructure();

  if (env.DB_ENABLED && infra.database === 'online') {
    try {
      const result = await queryOlympiadRankings(params);
      const payload: Omit<OlympiadRankingsResponse, 'meta'> = {
        enabled: true,
        cycleType: params.cycleType,
        currentCycle: result.currentCycle,
        cycleNumber: result.cycleNumber,
        period: result.period,
        periodNameTh: result.periodNameTh,
        periodNameEn: result.periodNameEn,
        minMatchesRequired: env.OLYMPIAD_MIN_MATCHES,
        hasPreviousData: result.hasPreviousData,
        page: params.page,
        limit: params.limit,
        selectedClassId: params.selectedClassId,
        classes: result.classes,
      };
      const updatedAt = apiCache.set(cacheKey, payload, ttl);
      return {
        ...payload,
        meta: createMeta({
          mode: 'live',
          updatedAt,
          cached: false,
          cacheTtlSeconds: ttl,
          warning:
            params.cycleType === 'previous' && !result.hasPreviousData
              ? 'Previous cycle snapshot (olympiad_nobles_eom) contains no data yet.'
              : undefined,
        }),
      };
    } catch (err) {
      const stale = apiCache.getStale<Omit<OlympiadRankingsResponse, 'meta'>>(cacheKey);
      if (stale) {
        return {
          ...stale.value,
          meta: createMeta({
            mode: 'stale',
            updatedAt: stale.updatedAtIso,
            cached: true,
            cacheTtlSeconds: ttl,
            warning: `Stale Olympiad rankings returned due to SQL error: ${(err as Error).message}`,
          }),
        };
      }
    }
  }

  if (isDemo) {
    const payload: Omit<OlympiadRankingsResponse, 'meta'> = {
      enabled: true,
      cycleType: params.cycleType,
      currentCycle: 4,
      cycleNumber: params.cycleType === 'previous' ? 3 : 4,
      period: 0,
      periodNameTh: 'ช่วงแข่งขันประจำรอบ (Competition Period)',
      periodNameEn: 'Active Competition Period',
      minMatchesRequired: env.OLYMPIAD_MIN_MATCHES,
      hasPreviousData: true,
      page: params.page,
      limit: params.limit,
      selectedClassId: params.selectedClassId,
      classes: buildDemoOlympiadRankings(params),
    };
    const updatedAt = apiCache.set(cacheKey, payload, ttl);
    return {
      ...payload,
      meta: createMeta({
        mode: 'demo',
        updatedAt,
        cached: false,
        cacheTtlSeconds: ttl,
        warning: 'DEMO MODE: Showing fixture Olympiad rankings (Scores remain strictly private).',
      }),
    };
  }

  // Production unavailable mode: Zero fake data
  return {
    enabled: true,
    cycleType: params.cycleType,
    currentCycle: null,
    cycleNumber: null,
    period: null,
    periodNameTh: 'ไม่สามารถติดต่อฐานข้อมูล',
    periodNameEn: 'Database Unavailable',
    minMatchesRequired: env.OLYMPIAD_MIN_MATCHES,
    hasPreviousData: false,
    page: params.page,
    limit: params.limit,
    selectedClassId: params.selectedClassId,
    classes: [],
    meta: createMeta({
      mode: 'unavailable',
      updatedAt: new Date().toISOString(),
      cached: false,
      cacheTtlSeconds: ttl,
      warning: 'Olympiad database is currently unavailable.',
    }),
  };
}

export async function getCastles(): Promise<CastlesResponse> {
  const ttl = 300;
  const cacheKey = 'server:castles';
  const isDemo = env.DEMO_MODE && env.NODE_ENV !== 'production';

  if (!env.ENABLE_CASTLE_OWNERSHIP) {
    return {
      enabled: false,
      items: [],
      meta: createMeta({
        mode: isDemo ? 'demo' : 'live',
        updatedAt: new Date().toISOString(),
        cached: true,
        cacheTtlSeconds: ttl,
      }),
    };
  }

  const fresh = apiCache.getFresh<Omit<CastlesResponse, 'meta'>>(cacheKey);
  if (fresh) {
    return {
      ...fresh.value,
      meta: createMeta({
        mode: isDemo ? 'demo' : 'live',
        updatedAt: fresh.updatedAtIso,
        cached: true,
        cacheTtlSeconds: ttl,
      }),
    };
  }

  const infra = await probeInfrastructure();

  if (env.DB_ENABLED && infra.database === 'online') {
    try {
      const items = await queryCastles();
      const payload: Omit<CastlesResponse, 'meta'> = {
        enabled: true,
        items,
      };
      const updatedAt = apiCache.set(cacheKey, payload, ttl);
      return {
        ...payload,
        meta: createMeta({
          mode: 'live',
          updatedAt,
          cached: false,
          cacheTtlSeconds: ttl,
        }),
      };
    } catch (err) {
      const stale = apiCache.getStale<Omit<CastlesResponse, 'meta'>>(cacheKey);
      if (stale) {
        return {
          ...stale.value,
          meta: createMeta({
            mode: 'stale',
            updatedAt: stale.updatedAtIso,
            cached: true,
            cacheTtlSeconds: ttl,
            warning: `Stale castle data returned due to SQL error: ${(err as Error).message}`,
          }),
        };
      }
    }
  }

  if (isDemo) {
    const payload: Omit<CastlesResponse, 'meta'> = {
      enabled: true,
      items: DEMO_CASTLES,
    };
    const updatedAt = apiCache.set(cacheKey, payload, ttl);
    return {
      ...payload,
      meta: createMeta({
        mode: 'demo',
        updatedAt,
        cached: false,
        cacheTtlSeconds: ttl,
      }),
    };
  }

  return {
    enabled: true,
    items: [],
    meta: createMeta({
      mode: 'unavailable',
      updatedAt: new Date().toISOString(),
      cached: false,
      cacheTtlSeconds: ttl,
      warning: 'Castle database is currently unavailable.',
    }),
  };
}

export async function getRaidBosses(): Promise<RaidBossesResponse> {
  const ttl = 60;
  const cacheKey = 'server:raidbosses';
  const isDemo = env.DEMO_MODE && env.NODE_ENV !== 'production';

  const policyNoticeTh =
    'L2Blitz มีนโยบายให้บอสใหญ่ (Grand Boss) และบอสบางประเภทเกิดใหม่ภายใน 2–3 วันหลังจากตาย และมีการปรับจุดวาร์ปพิเศษสำหรับ Queen Ant และ Baium ทั้งนี้ ระบบจะแสดงเฉพาะเวลาเกิดที่บันทึกในฐานข้อมูลจริงเท่านั้น (ห้ามคาดเดาเวลาเกิดเด็ดขาด)';
  const policyNoticeEn =
    'L2Blitz policy configures select Grand Bosses to respawn within 2–3 days after death, with custom teleport points for Queen Ant and Baium. Spawn times are strictly read from the live database and never guessed.';

  const fresh = apiCache.getFresh<Omit<RaidBossesResponse, 'meta'>>(cacheKey);
  if (fresh) {
    return {
      ...fresh.value,
      meta: createMeta({
        mode: isDemo ? 'demo' : 'live',
        updatedAt: fresh.updatedAtIso,
        cached: true,
        cacheTtlSeconds: ttl,
      }),
    };
  }

  const infra = await probeInfrastructure();

  if (env.DB_ENABLED && infra.database === 'online') {
    try {
      const items = await queryRaidBosses();
      const payload: Omit<RaidBossesResponse, 'meta'> = {
        policyNoticeTh,
        policyNoticeEn,
        items,
      };
      const updatedAt = apiCache.set(cacheKey, payload, ttl);
      return {
        ...payload,
        meta: createMeta({
          mode: 'live',
          updatedAt,
          cached: false,
          cacheTtlSeconds: ttl,
        }),
      };
    } catch (err) {
      const stale = apiCache.getStale<Omit<RaidBossesResponse, 'meta'>>(cacheKey);
      if (stale) {
        return {
          ...stale.value,
          meta: createMeta({
            mode: 'stale',
            updatedAt: stale.updatedAtIso,
            cached: true,
            cacheTtlSeconds: ttl,
            warning: `Stale raidboss data returned due to SQL error: ${(err as Error).message}`,
          }),
        };
      }
    }
  }

  if (isDemo) {
    const payload: Omit<RaidBossesResponse, 'meta'> = {
      policyNoticeTh,
      policyNoticeEn,
      items: buildDemoRaidBosses(),
    };
    const updatedAt = apiCache.set(cacheKey, payload, ttl);
    return {
      ...payload,
      meta: createMeta({
        mode: 'demo',
        updatedAt,
        cached: false,
        cacheTtlSeconds: ttl,
      }),
    };
  }

  // Unavailable in Production: Return static boss catalog with status = 'unknown' and NO fake timestamps!
  const unknownItems = Object.values(L2BLITZ_BOSS_CATALOG).map((meta) => ({
    bossId: meta.bossId,
    name: meta.name,
    level: meta.level,
    category: meta.category,
    location: meta.locationTh,
    teleportInfo: meta.teleportInfoTh,
    status: 'unknown' as const,
    lastKillTime: null,
    nextSpawnWindowStart: null,
    nextSpawnWindowEnd: null,
    respawnRuleText: meta.respawnRuleTh,
    customRuleWarning: meta.customRuleWarningTh,
    isCustomTeleport: meta.isCustomTeleport,
  }));

  return {
    policyNoticeTh,
    policyNoticeEn,
    items: unknownItems,
    meta: createMeta({
      mode: 'unavailable',
      updatedAt: new Date().toISOString(),
      cached: false,
      cacheTtlSeconds: ttl,
      warning: 'Database unavailable — all Raid Boss statuses are marked Unknown without guessing.',
    }),
  };
}

export async function getTvtEventInfo(): Promise<TvtEventResponse> {
  const isDemo = env.DEMO_MODE && env.NODE_ENV !== 'production';
  const scheduleTimes = ['03:00', '09:00', '15:00', '21:00'];

  // Calculate next scheduled time in GMT+7 (or server time)
  const now = new Date();
  const nextDate = new Date(now.getTime() + 2 * 3600 * 1000);

  return {
    eventName: 'Team vs Team (TvT) — High Five Instant Combat',
    scheduleTimes,
    nextStartTimeIso: nextDate.toISOString(),
    registrationDurationMinutes: 10,
    eventDurationMinutes: 15,
    minLevel: 80,
    maxParticipantsPerTeam: 40,
    lastMatchWinner: isDemo ? 'Blue Team' : 'Unknown',
    lastMatchScoreBlue: isDemo ? 68 : null,
    lastMatchScoreRed: isDemo ? 54 : null,
    // In vanilla L2J Mobius CT 2.6 High Five, TvT runs in-memory via TeamVersusTeam.ini
    // Rankings are only enabled if custom SQL persistence is verified on the live GameServer
    rankingsAvailable: env.ENABLE_TVT_RANKINGS || isDemo,
    topPlayers: isDemo
      ? [
          { rank: 1, charName: 'Zephyros', className: 'Doombringer', kills: 24, wins: 19 },
          { rank: 2, charName: 'ValkyrieTH', className: 'Trickster', kills: 21, wins: 18 },
          { rank: 3, charName: 'KratosH5', className: 'Duelist', kills: 19, wins: 15 },
          { rank: 4, charName: 'Nocturne', className: 'Storm Screamer', kills: 17, wins: 14 },
          { rank: 5, charName: 'ShadowStep', className: 'Ghost Hunter', kills: 15, wins: 12 },
        ]
      : [],
    meta: createMeta({
      mode: isDemo ? 'demo' : env.ENABLE_TVT_RANKINGS ? 'live' : 'unavailable',
      updatedAt: now.toISOString(),
      cached: false,
      cacheTtlSeconds: 60,
      warning: !env.ENABLE_TVT_RANKINGS
        ? 'L2J Mobius CT 2.6 High Five TvT runs in-memory by default; historical TvT SQL rankings await custom GameServer table verification.'
        : undefined,
    }),
  };
}
