import { z } from 'zod';

/**
 * Data source mode returned with every API response:
 * - 'live': Direct query from L2J Mobius MySQL & verified GameServer state
 * - 'stale': Cached data returned because a newer DB query failed
 * - 'demo': Development fixture data (ONLY enabled when DEMO_MODE=true in non-production)
 * - 'unavailable': Production mode when DB or GameServer is unreachable (NEVER returns fake numbers)
 */
export const DataSourceModeSchema = z.enum(['live', 'stale', 'demo', 'unavailable']);
export type DataSourceMode = z.infer<typeof DataSourceModeSchema>;

export const ServerStateSchema = z.enum(['online', 'offline', 'unknown']);
export type ServerState = z.infer<typeof ServerStateSchema>;

export const ApiMetaSchema = z.object({
  mode: DataSourceModeSchema,
  isDemo: z.boolean(),
  updatedAt: z.string(), // ISO timestamp when data was fetched/cached
  serverTime: z.string(), // Current API server ISO timestamp
  cached: z.boolean(),
  cacheTtlSeconds: z.number(),
  warning: z.string().optional(),
});
export type ApiMeta = z.infer<typeof ApiMetaSchema>;

export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'down']),
  api: z.literal('online'),
  database: ServerStateSchema,
  gameServer: ServerStateSchema,
  loginServer: ServerStateSchema,
  demoMode: z.boolean(),
  uptimeSeconds: z.number(),
  meta: ApiMetaSchema,
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ServerStatusResponseSchema = z.object({
  gameServer: ServerStateSchema,
  loginServer: ServerStateSchema,
  database: ServerStateSchema,
  playersOnline: z.number().nullable(), // null when unavailable or GameServer is offline
  offlineTraders: z.number().nullable(),
  chronicle: z.literal('High Five (CT 2.6)'),
  serverName: z.string(),
  region: z.string(),
  meta: ApiMetaSchema,
});
export type ServerStatusResponse = z.infer<typeof ServerStatusResponseSchema>;

export const ServerStatsResponseSchema = z.object({
  playersOnline: z.number().nullable(),
  totalAccounts: z.number().nullable(),
  totalCharacters: z.number().nullable(),
  totalClans: z.number().nullable(),
  maxLevelCount: z.number().nullable(), // Level 85 in High Five
  noblesseCount: z.number().nullable(),
  activeHeroesCount: z.number().nullable(),
  gameServerStatus: ServerStateSchema,
  databaseStatus: ServerStateSchema,
  nextSiege: z
    .object({
      castleName: z.string(),
      siegeDate: z.number(), // Epoch ms
    })
    .nullable(),
  meta: ApiMetaSchema,
});
export type ServerStatsResponse = z.infer<typeof ServerStatsResponseSchema>;

export const ServerRatesResponseSchema = z.object({
  exp: z.number(),
  sp: z.number(),
  adena: z.number(),
  drop: z.number(),
  spoil: z.number(),
  questDrop: z.number(),
  raidDrop: z.number(),
  maxLevel: z.number(),
  subClassMaxLevel: z.number(),
  safeEnchant: z.number(),
  maxEnchantWeapon: z.number(),
  maxEnchantArmor: z.number(),
  maxEnchantJewelry: z.number(),
  normalScrollChance: z.string(),
  blessedScrollChance: z.string(),
  ancientScrollChance: z.string(),
  elementStoneChance: z.string(),
  elementCrystalChance: z.string(),
  maxBuffSlots: z.string(),
  buffDurationMinutes: z.number(),
  meta: ApiMetaSchema,
});
export type ServerRatesResponse = z.infer<typeof ServerRatesResponseSchema>;

/**
 * Note: Uses `flagKills` instead of `pvpKills` in JSON wire format if desired,
 * or provides both to avoid aggressive browser ad-block filters while staying clear.
 */
export const PlayerRankingItemSchema = z.object({
  rank: z.number(),
  charName: z.string(),
  level: z.number(),
  classId: z.number(),
  className: z.string(),
  clanName: z.string().nullable(),
  flagKills: z.number(), // Maps from characters.pvpkills
  pkKills: z.number(),   // Maps from characters.pkkills
  fame: z.number(),      // Maps from characters.fame (High Five)
  online: z.boolean().nullable(), // Verified against GameServer online status
  nobless: z.boolean(),
});
export type PlayerRankingItem = z.infer<typeof PlayerRankingItemSchema>;

export const PlayerRankingsResponseSchema = z.object({
  type: z.enum(['pvp', 'pk']),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  classFilter: z.number().nullable(),
  searchQuery: z.string().nullable(),
  items: z.array(PlayerRankingItemSchema),
  meta: ApiMetaSchema,
});
export type PlayerRankingsResponse = z.infer<typeof PlayerRankingsResponseSchema>;

export const ClanRankingItemSchema = z.object({
  rank: z.number(),
  clanId: z.number(),
  clanName: z.string(),
  clanLevel: z.number(),
  reputationScore: z.number(),
  leaderName: z.string(),
  allyName: z.string().nullable(),
  memberCount: z.number(),
  castleName: z.string().nullable(),
});
export type ClanRankingItem = z.infer<typeof ClanRankingItemSchema>;

export const ClanRankingsResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  items: z.array(ClanRankingItemSchema),
  meta: ApiMetaSchema,
});
export type ClanRankingsResponse = z.infer<typeof ClanRankingsResponseSchema>;

export const OlympiadHeroItemSchema = z.object({
  charName: z.string(),
  classId: z.number(),
  className: z.string(),
  level: z.number(),
  clanName: z.string().nullable(),
  heroCount: z.number(),
  message: z.string(),
});
export type OlympiadHeroItem = z.infer<typeof OlympiadHeroItemSchema>;

export const OlympiadHeroesResponseSchema = z.object({
  enabled: z.boolean(),
  currentCycle: z.number().nullable(),
  items: z.array(OlympiadHeroItemSchema),
  meta: ApiMetaSchema,
});
export type OlympiadHeroesResponse = z.infer<typeof OlympiadHeroesResponseSchema>;

/**
 * Olympiad Rankings by Class (Section 1 & 2):
 * Displays player rank, character name, clan name per High Five class.
 * CRITICAL RULE:
 * - "ใช้คะแนนเพื่อจัดอันดับภายในระบบเท่านั้น ห้ามแสดงตัวเลขคะแนนบนเว็บไซต์"
 * - API strictly does NOT expose points (olympiad_points) to public JSON payload!
 */
export const OlympiadClassRankPlayerSchema = z.object({
  rank: z.number(),
  charName: z.string(),
  clanName: z.string().nullable(),
});
export type OlympiadClassRankPlayer = z.infer<typeof OlympiadClassRankPlayerSchema>;

export const OlympiadClassGroupSchema = z.object({
  classId: z.number(),
  className: z.string(),
  race: z.string(),
  players: z.array(OlympiadClassRankPlayerSchema),
});
export type OlympiadClassGroup = z.infer<typeof OlympiadClassGroupSchema>;

export const OlympiadRankingsResponseSchema = z.object({
  enabled: z.boolean(),
  currentCycle: z.number().nullable(),
  selectedClassId: z.number().nullable(), // null means "All Classes"
  classes: z.array(OlympiadClassGroupSchema),
  meta: ApiMetaSchema,
});
export type OlympiadRankingsResponse = z.infer<typeof OlympiadRankingsResponseSchema>;

export const CastleItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  ownerClan: z.string().nullable(),
  leaderName: z.string().nullable(),
  allyName: z.string().nullable(),
  taxPercent: z.number(),
  siegeDate: z.number().nullable(), // Epoch ms
});
export type CastleItem = z.infer<typeof CastleItemSchema>;

export const CastlesResponseSchema = z.object({
  enabled: z.boolean(),
  items: z.array(CastleItemSchema),
  meta: ApiMetaSchema,
});
export type CastlesResponse = z.infer<typeof CastlesResponseSchema>;

export const RaidBossStatusEnum = z.enum(['alive', 'dead', 'unknown']);
export type RaidBossStatus = z.infer<typeof RaidBossStatusEnum>;

export const RaidBossItemSchema = z.object({
  bossId: z.number(),
  name: z.string(),
  level: z.number(),
  category: z.enum(['grand_boss', 'field_boss', 'instance_boss']),
  image: z.string().optional(),
  location: z.string(),
  teleportInfo: z.string(),
  status: RaidBossStatusEnum,
  lastKillTime: z.number().nullable(), // Epoch ms if known
  nextSpawnWindowStart: z.number().nullable(), // Epoch ms (never guessed!)
  nextSpawnWindowEnd: z.number().nullable(),
  respawnRuleText: z.string(),
  customRuleWarning: z.string().nullable(),
  isCustomTeleport: z.boolean(),
});
export type RaidBossItem = z.infer<typeof RaidBossItemSchema>;

export const RaidBossesResponseSchema = z.object({
  policyNoticeTh: z.string(),
  policyNoticeEn: z.string(),
  items: z.array(RaidBossItemSchema),
  meta: ApiMetaSchema,
});
export type RaidBossesResponse = z.infer<typeof RaidBossesResponseSchema>;

export const TvtTopPlayerSchema = z.object({
  rank: z.number(),
  charName: z.string(),
  className: z.string(),
  kills: z.number(),
  wins: z.number(),
});

export const TvtEventResponseSchema = z.object({
  eventName: z.string(),
  scheduleTimes: z.array(z.string()), // e.g. ["03:00", "09:00", "15:00", "21:00"]
  nextStartTimeIso: z.string(),
  registrationDurationMinutes: z.number(),
  eventDurationMinutes: z.number(),
  minLevel: z.number(),
  maxParticipantsPerTeam: z.number(),
  lastMatchWinner: z.enum(['Blue Team', 'Red Team', 'Tie', 'Unknown']),
  lastMatchScoreBlue: z.number().nullable(),
  lastMatchScoreRed: z.number().nullable(),
  rankingsAvailable: z.boolean(),
  topPlayers: z.array(TvtTopPlayerSchema),
  meta: ApiMetaSchema,
});
export type TvtEventResponse = z.infer<typeof TvtEventResponseSchema>;
