import type {
  HealthResponse,
  ServerStatusResponse,
  ServerStatsResponse,
  ServerRatesResponse,
  PlayerRankingsResponse,
  ClanRankingsResponse,
  OlympiadHeroesResponse,
  CastlesResponse,
  RaidBossesResponse,
  TvtEventResponse,
} from '../../shared/schema';
import {
  DEMO_SERVER_STATS,
  DEMO_PVP_PLAYERS,
  DEMO_PK_PLAYERS,
  DEMO_CLANS,
  DEMO_HEROES,
  DEMO_CASTLES,
  buildDemoRaidBosses,
  buildDemoOlympiadRankings,
} from '../../backend/src/dal/demoFixtures';
import { SITE_CONFIG } from '../config/siteConfig';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const ALLOW_CLIENT_DEMO_FALLBACK = import.meta.env.DEV || import.meta.env.VITE_DEMO_FALLBACK === 'true';

async function fetchJson<T>(path: string, fallbackBuilder?: () => T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (ALLOW_CLIENT_DEMO_FALLBACK && fallbackBuilder) {
      return fallbackBuilder();
    }
    throw err;
  }
}

function clientDemoMeta() {
  const now = new Date().toISOString();
  return {
    mode: 'demo' as const,
    isDemo: true,
    updatedAt: now,
    serverTime: now,
    cached: false,
    cacheTtlSeconds: 30,
    warning: 'DEMO MODE (Client Preview Fixture): Showing development fixture data.',
  };
}

export const apiClient = {
  getHealth: (): Promise<HealthResponse> =>
    fetchJson('/health', () => ({
      status: 'ok',
      api: 'online',
      database: 'online',
      gameServer: 'online',
      loginServer: 'online',
      demoMode: true,
      uptimeSeconds: 3600,
      meta: clientDemoMeta(),
    })),

  getServerStatus: (): Promise<ServerStatusResponse> =>
    fetchJson('/server/status', () => ({
      gameServer: 'online',
      loginServer: 'online',
      database: 'online',
      playersOnline: DEMO_SERVER_STATS.playersOnline,
      offlineTraders: DEMO_SERVER_STATS.offlineTraders,
      chronicle: 'High Five (CT 2.6)',
      serverName: 'L2BLITZ PVP (Thailand)',
      region: 'Bangkok, TH (GMT+7)',
      meta: clientDemoMeta(),
    })),

  getServerStats: (): Promise<ServerStatsResponse> =>
    fetchJson('/server/stats', () => ({
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
      meta: clientDemoMeta(),
    })),

  getServerRates: (): Promise<ServerRatesResponse> =>
    fetchJson('/server/rates', () => ({
      exp: SITE_CONFIG.serverInfo.rates.exp,
      sp: SITE_CONFIG.serverInfo.rates.sp,
      adena: SITE_CONFIG.serverInfo.rates.adena,
      drop: SITE_CONFIG.serverInfo.rates.drop,
      spoil: SITE_CONFIG.serverInfo.rates.spoil,
      questDrop: SITE_CONFIG.serverInfo.rates.questDrop,
      raidDrop: SITE_CONFIG.serverInfo.rates.raidDrop,
      maxLevel: 85,
      subClassMaxLevel: 85,
      safeEnchant: 4,
      maxEnchantWeapon: 16,
      maxEnchantArmor: 12,
      maxEnchantJewelry: 12,
      normalScrollChance: SITE_CONFIG.serverInfo.enchant.normalScrollChance,
      blessedScrollChance: SITE_CONFIG.serverInfo.enchant.blessedScrollChance,
      ancientScrollChance: SITE_CONFIG.serverInfo.enchant.ancientScrollChance,
      elementStoneChance: SITE_CONFIG.serverInfo.enchant.elementStoneMax,
      elementCrystalChance: SITE_CONFIG.serverInfo.enchant.elementCrystalMax,
      maxBuffSlots: '36 + 4 Divine Inspiration (+16 Dance/Song)',
      buffDurationMinutes: 120,
      meta: clientDemoMeta(),
    })),

  getPlayerRankings: (params: {
    type: 'pvp' | 'pk';
    page?: number;
    limit?: number;
    classId?: number | null;
    q?: string;
  }): Promise<PlayerRankingsResponse> => {
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    if (params.classId !== undefined && params.classId !== null) {
      search.set('classId', String(params.classId));
    }
    if (params.q && params.q.trim() !== '') {
      search.set('q', params.q.trim());
    }
    const qs = search.toString() ? `?${search.toString()}` : '';

    return fetchJson(`/rankings/${params.type}${qs}`, () => {
      const list = params.type === 'pvp' ? DEMO_PVP_PLAYERS : DEMO_PK_PLAYERS;
      const page = params.page ?? 1;
      const limit = params.limit ?? 15;
      let filtered = [...list];
      if (params.classId !== undefined && params.classId !== null) {
        filtered = filtered.filter((p) => p.classId === params.classId);
      }
      if (params.q && params.q.trim() !== '') {
        const q = params.q.toLowerCase();
        filtered = filtered.filter((p) => p.charName.toLowerCase().includes(q));
      }
      const offset = (page - 1) * limit;
      return {
        type: params.type,
        page,
        limit,
        total: filtered.length,
        classFilter: params.classId ?? null,
        searchQuery: params.q ?? null,
        items: filtered.slice(offset, offset + limit),
        meta: clientDemoMeta(),
      };
    });
  },

  getClanRankings: (page = 1, limit = 15): Promise<ClanRankingsResponse> =>
    fetchJson(`/rankings/clans?page=${page}&limit=${limit}`, () => ({
      page,
      limit,
      total: DEMO_CLANS.length,
      items: DEMO_CLANS.slice((page - 1) * limit, page * limit),
      meta: clientDemoMeta(),
    })),

  getOlympiadHeroes: (): Promise<OlympiadHeroesResponse> =>
    fetchJson('/olympiad/heroes', () => ({
      enabled: true,
      currentCycle: 4,
      items: DEMO_HEROES,
      meta: clientDemoMeta(),
    })),

  getOlympiadRankings: (classId?: number | null): Promise<import('@shared/schema').OlympiadRankingsResponse> => {
    const qs = classId !== undefined && classId !== null ? `?classId=${classId}` : '';
    return fetchJson(`/olympiad/rankings${qs}`, () => ({
      enabled: true,
      currentCycle: 4,
      selectedClassId: classId ?? null,
      classes: buildDemoOlympiadRankings(classId ?? null),
      meta: clientDemoMeta(),
    }));
  },

  getCastles: (): Promise<CastlesResponse> =>
    fetchJson('/castles', () => ({
      enabled: true,
      items: DEMO_CASTLES,
      meta: clientDemoMeta(),
    })),

  getRaidBosses: (): Promise<RaidBossesResponse> =>
    fetchJson('/raidbosses', () => ({
      policyNoticeTh:
        'L2Blitz มีนโยบายให้บอสใหญ่เกิดใหม่ภายใน 2–3 วันหลังตาย และปรับจุดวาร์ป Queen Ant / Baium (แสดงเฉพาะเวลาจากฐานข้อมูลจริง ไม่มีการคาดเดา)',
      policyNoticeEn:
        'L2Blitz policy sets Grand Bosses to respawn within 2–3 days after death with custom warps for Queen Ant / Baium.',
      items: buildDemoRaidBosses(),
      meta: clientDemoMeta(),
    })),

  getTvtEvent: (): Promise<TvtEventResponse> =>
    fetchJson('/events/tvt', () => ({
      eventName: 'Team vs Team (TvT) — High Five Instant Combat',
      scheduleTimes: ['03:00', '09:00', '15:00', '21:00'],
      nextStartTimeIso: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      registrationDurationMinutes: 10,
      eventDurationMinutes: 15,
      minLevel: 80,
      maxParticipantsPerTeam: 40,
      lastMatchWinner: 'Blue Team',
      lastMatchScoreBlue: 68,
      lastMatchScoreRed: 54,
      rankingsAvailable: true,
      topPlayers: [
        { rank: 1, charName: 'Zephyros', className: 'Doombringer', kills: 24, wins: 19 },
        { rank: 2, charName: 'ValkyrieTH', className: 'Trickster', kills: 21, wins: 18 },
        { rank: 3, charName: 'KratosH5', className: 'Duelist', kills: 19, wins: 15 },
      ],
      meta: clientDemoMeta(),
    })),
};
