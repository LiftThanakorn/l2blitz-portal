import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(64).optional().default(''),
  sort: z.string().trim().optional(),
});

export const OlympiadRankingQuerySchema = z.object({
  classId: z.coerce.number().int().min(88).max(136).optional(),
  cycle: z.enum(['current', 'previous']).default('current'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type DataSourceMode = 'live_mysql' | 'dev_fixture' | 'unavailable';

export interface ApiEnvelope<T> {
  ok: boolean;
  source: DataSourceMode;
  updatedAt: string;
  verificationNotice?: string;
  data: T;
}

export interface ServerStatusDto {
  status: 'online' | 'offline' | 'unknown';
  loginServer: 'online' | 'offline' | 'unknown';
  gameServer: 'online' | 'offline' | 'unknown';
  chronicle: string;
  region: string;
  messageTh: string;
  messageEn: string;
}

export interface ServerStatsDto {
  playersOnline: number | null;
  totalCharacters: number | null;
  totalClans: number | null;
  activeOlympiadNobles: number | null;
  status: 'verified' | 'unavailable' | 'dev_fixture';
}

export interface ServerRatesDto {
  verificationStatus: 'pending_verification' | 'verified';
  chronicle: string;
  serverType: string;
  rates: {
    key: string;
    labelTh: string;
    labelEn: string;
    value: string;
    noteTh: string;
    noteEn: string;
    verified: boolean;
  }[];
  enchantLimits: {
    categoryTh: string;
    categoryEn: string;
    safeEnchant: string;
    maxEnchant: string;
    blessedRate: string;
    attributeMax: string;
    verified: boolean;
  }[];
}

export interface PvpPkRankingRow {
  rank: number;
  charName: string;
  classId: number;
  classNameEn: string;
  classNameTh: string;
  clanName: string | null;
  level: number;
  pvpKills: number;
  pkKills: number;
  online: boolean;
}

export interface ClanRankingRow {
  rank: number;
  clanName: string;
  leaderName: string;
  clanLevel: number;
  reputationScore: number;
  memberCount: number;
  castleName: string | null;
  allyName: string | null;
}

/**
 * STRICT REQUIREMENT:
 * Olympiad public ranking response MUST ONLY contain rank, character name, clan, and class identifiers.
 * DO NOT include olympiad_points, matches played, or win counts in the public DTO.
 */
export interface OlympiadPublicRankingRow {
  rank: number;
  charName: string;
  clanName: string | null;
  classId: number;
  classNameEn: string;
  classNameTh: string;
}

export interface OlympiadHeroRow {
  classId: number;
  classNameEn: string;
  classNameTh: string;
  charName: string;
  clanName: string | null;
  allyName: string | null;
  heroCount: number;
  cycleVerified: boolean;
}

export interface CastleDto {
  castleId: number;
  nameEn: string;
  nameTh: string;
  ownerClan: string | null;
  leaderName: string | null;
  taxPercent: number | null;
  siegeDate: string | null;
  status: 'verified' | 'unknown' | 'dev_fixture';
}

export interface RaidBossDto {
  bossId: number;
  nameEn: string;
  nameTh: string;
  level: number;
  tier: 'Grand Boss' | 'High Five Raid';
  locationEn: string;
  locationTh: string;
  teleportEn: string;
  teleportTh: string;
  status: 'alive' | 'dead' | 'unknown';
  lastKill: string | null;
  nextSpawnWindow: string | null;
  respawnRuleEn: string;
  respawnRuleTh: string;
  keyDrops: string[];
}

export interface TvtEventDto {
  eventNameEn: string;
  eventNameTh: string;
  format: string;
  scheduleTimes: string[];
  registrationRuleTh: string;
  registrationRuleEn: string;
  arenaEn: string;
  arenaTh: string;
  levelRequirement: number;
  restrictionsTh: string[];
  restrictionsEn: string[];
  rewardsNoteTh: string;
  rewardsNoteEn: string;
  recentResults: {
    matchId: string;
    timestamp: string;
    winnerTeam: 'Blue' | 'Red' | 'Draw';
    blueScore: number;
    redScore: number;
    topKiller: string;
  }[];
  resultsVerified: boolean;
}
