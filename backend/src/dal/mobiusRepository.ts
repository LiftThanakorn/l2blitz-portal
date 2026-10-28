import { env } from '../config/env.js';
import { executeReadOnlyQuery } from './database.js';
import { getClassName } from '../../../shared/l2Classes.js';
import { L2BLITZ_BOSS_CATALOG } from '../../../shared/staticGameContent.js';
import type {
  PlayerRankingItem,
  ClanRankingItem,
  OlympiadHeroItem,
  CastleItem,
  RaidBossItem,
  ServerState,
} from '../../../shared/schema.js';

/**
 * Builds the parameterized SQL filter clause that strictly excludes:
 * 1. GM characters (`c.accesslevel = 0`)
 * 2. Deleted characters (`(c.deletetime = 0 OR c.deletetime IS NULL)`)
 * 3. Configured test/dev accounts (`env.EXCLUDED_ACCOUNT_NAMES`)
 * 4. Configured test/GM character names (`env.EXCLUDED_CHAR_NAMES`)
 */
export function buildValidCharacterWhereClause(alias = 'c'): {
  clause: string;
  params: Array<string | number | boolean | null>;
} {
  const parts: string[] = [
    `${alias}.accesslevel = 0`,
    `(${alias}.deletetime = 0 OR ${alias}.deletetime IS NULL)`,
  ];
  const params: Array<string | number | boolean | null> = [];

  if (env.EXCLUDED_ACCOUNT_NAMES.length > 0) {
    const placeholders = env.EXCLUDED_ACCOUNT_NAMES.map(() => '?').join(', ');
    parts.push(`LOWER( IFNULL(${alias}.account_name, '') ) NOT IN (${placeholders})`);
    params.push(...env.EXCLUDED_ACCOUNT_NAMES);
  }

  if (env.EXCLUDED_CHAR_NAMES.length > 0) {
    const placeholders = env.EXCLUDED_CHAR_NAMES.map(() => '?').join(', ');
    parts.push(`${alias}.char_name NOT IN (${placeholders})`);
    params.push(...env.EXCLUDED_CHAR_NAMES);
  }

  return {
    clause: parts.join(' AND '),
    params,
  };
}

export async function queryOnlineCounts(gameServerState: ServerState): Promise<{
  playersOnline: number | null;
  offlineTraders: number | null;
}> {
  // Rule 6: Never trust `characters.online = 1` if GameServer process is offline or unknown!
  if (gameServerState !== 'online') {
    return { playersOnline: null, offlineTraders: null };
  }

  const { clause, params } = buildValidCharacterWhereClause('c');
  const onlineRows = await executeReadOnlyQuery<{ count: number }>(
    `SELECT COUNT(*) AS count FROM characters c WHERE c.online = 1 AND ${clause}`,
    params
  );

  let offlineCount = 0;
  try {
    const offlineRows = await executeReadOnlyQuery<{ count: number }>(
      `SELECT COUNT(*) AS count FROM character_offline_trade`
    );
    offlineCount = offlineRows[0]?.count ?? 0;
  } catch {
    offlineCount = 0;
  }

  return {
    playersOnline: onlineRows[0]?.count ?? 0,
    offlineTraders: offlineCount,
  };
}

export async function queryServerAggregateStats(gameServerState: ServerState) {
  const { clause, params } = buildValidCharacterWhereClause('c');

  const [charRows, maxLvRows, nobleRows, clanRows, heroRows, siegeRows] = await Promise.all([
    executeReadOnlyQuery<{ count: number }>(
      `SELECT COUNT(*) AS count FROM characters c WHERE ${clause}`,
      params
    ),
    // High Five max level is 85 (not 80 like Interlude!)
    executeReadOnlyQuery<{ count: number }>(
      `SELECT COUNT(*) AS count FROM characters c WHERE ${clause} AND c.level >= 85`,
      params
    ),
    executeReadOnlyQuery<{ count: number }>(
      `SELECT COUNT(*) AS count FROM characters c WHERE ${clause} AND c.nobless = 1`,
      params
    ),
    executeReadOnlyQuery<{ count: number }>(`SELECT COUNT(*) AS count FROM clan_data`),
    executeReadOnlyQuery<{ count: number }>(
      `SELECT COUNT(*) AS count FROM heroes h INNER JOIN characters c ON c.charId = h.charId WHERE h.played = 1 AND ${clause}`,
      params
    ),
    executeReadOnlyQuery<{ name: string; siegeDate: number }>(
      `SELECT name, siegeDate FROM castle WHERE siegeDate > ? ORDER BY siegeDate ASC LIMIT 1`,
      [Date.now()]
    ),
  ]);

  let totalAccounts: number | null = null;
  try {
    const accRows = await executeReadOnlyQuery<{ count: number }>(
      `SELECT COUNT(*) AS count FROM \`${env.DB_LOGIN_NAME}\`.accounts WHERE accessLevel = 0`
    );
    totalAccounts = accRows[0]?.count ?? null;
  } catch {
    // Fallback to distinct account_name in characters table if Login DB is on separate permissions
    const distinctAcc = await executeReadOnlyQuery<{ count: number }>(
      `SELECT COUNT(DISTINCT c.account_name) AS count FROM characters c WHERE ${clause}`,
      params
    );
    totalAccounts = distinctAcc[0]?.count ?? null;
  }

  const onlineData = await queryOnlineCounts(gameServerState);

  return {
    playersOnline: onlineData.playersOnline,
    totalAccounts,
    totalCharacters: charRows[0]?.count ?? 0,
    totalClans: clanRows[0]?.count ?? 0,
    maxLevelCount: maxLvRows[0]?.count ?? 0,
    noblesseCount: nobleRows[0]?.count ?? 0,
    activeHeroesCount: heroRows[0]?.count ?? 0,
    nextSiege: siegeRows[0]
      ? { castleName: siegeRows[0].name, siegeDate: Number(siegeRows[0].siegeDate) }
      : null,
  };
}

export async function queryPlayerRankings(options: {
  type: 'pvp' | 'pk';
  page: number;
  limit: number;
  classFilter: number | null;
  searchQuery: string | null;
  gameServerState: ServerState;
}): Promise<{ total: number; items: PlayerRankingItem[] }> {
  const { clause, params } = buildValidCharacterWhereClause('c');
  const whereParts = [clause];
  const queryParams = [...params];

  if (options.classFilter !== null) {
    whereParts.push(`c.classid = ?`);
    queryParams.push(options.classFilter);
  }

  if (options.searchQuery && options.searchQuery.trim().length > 0) {
    whereParts.push(`c.char_name LIKE ?`);
    queryParams.push(`%${options.searchQuery.trim()}%`);
  }

  const fullWhere = whereParts.join(' AND ');
  const orderBy =
    options.type === 'pvp'
      ? `c.pvpkills DESC, c.pkkills DESC, c.fame DESC`
      : `c.pkkills DESC, c.pvpkills DESC, c.fame DESC`;

  const countRows = await executeReadOnlyQuery<{ total: number }>(
    `SELECT COUNT(*) AS total FROM characters c WHERE ${fullWhere}`,
    queryParams
  );
  const total = countRows[0]?.total ?? 0;

  const offset = (options.page - 1) * options.limit;

  interface RawCharRow {
    char_name: string;
    level: number;
    classid: number;
    clan_name: string | null;
    flag_kills: number;
    pk_kills: number;
    fame: number;
    online: number;
    nobless: number;
  }

  const rows = await executeReadOnlyQuery<RawCharRow>(
    `SELECT
      c.char_name,
      IFNULL(c.level, 1) AS level,
      IFNULL(c.classid, 0) AS classid,
      cd.clan_name,
      IFNULL(c.pvpkills, 0) AS flag_kills,
      IFNULL(c.pkkills, 0) AS pk_kills,
      IFNULL(c.fame, 0) AS fame,
      IFNULL(c.online, 0) AS online,
      IFNULL(c.nobless, 0) AS nobless
    FROM characters c
    LEFT JOIN clan_data cd ON cd.clan_id = c.clanid
    WHERE ${fullWhere}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?`,
    [...queryParams, options.limit, offset]
  );

  const items: PlayerRankingItem[] = rows.map((r, idx) => ({
    rank: offset + idx + 1,
    charName: r.char_name,
    level: Number(r.level),
    classId: Number(r.classid),
    className: getClassName(Number(r.classid)),
    clanName: r.clan_name || null,
    flagKills: Number(r.flag_kills),
    pkKills: Number(r.pk_kills),
    fame: Number(r.fame),
    // Rule 6: Verify character `online` against GameServer state
    online:
      options.gameServerState === 'online'
        ? Number(r.online) === 1
        : options.gameServerState === 'offline'
          ? false
          : null,
    nobless: Number(r.nobless) === 1,
  }));

  return { total, items };
}

export async function queryClanRankings(options: {
  page: number;
  limit: number;
}): Promise<{ total: number; items: ClanRankingItem[] }> {
  const countRows = await executeReadOnlyQuery<{ total: number }>(
    `SELECT COUNT(*) AS total FROM clan_data`
  );
  const total = countRows[0]?.total ?? 0;
  const offset = (options.page - 1) * options.limit;

  interface RawClanRow {
    clan_id: number;
    clan_name: string;
    clan_level: number;
    reputation_score: number;
    ally_name: string | null;
    leader_name: string | null;
    castle_name: string | null;
    member_count: number;
  }

  const rows = await executeReadOnlyQuery<RawClanRow>(
    `SELECT
      cd.clan_id,
      cd.clan_name,
      IFNULL(cd.clan_level, 0) AS clan_level,
      IFNULL(cd.reputation_score, 0) AS reputation_score,
      cd.ally_name,
      leader.char_name AS leader_name,
      cas.name AS castle_name,
      (SELECT COUNT(*) FROM characters m WHERE m.clanid = cd.clan_id AND (m.deletetime = 0 OR m.deletetime IS NULL)) AS member_count
    FROM clan_data cd
    LEFT JOIN characters leader ON leader.charId = cd.leader_id
    LEFT JOIN castle cas ON cas.id = cd.hasCastle
    ORDER BY cd.clan_level DESC, cd.reputation_score DESC
    LIMIT ? OFFSET ?`,
    [options.limit, offset]
  );

  const items: ClanRankingItem[] = rows.map((r, idx) => ({
    rank: offset + idx + 1,
    clanId: Number(r.clan_id),
    clanName: r.clan_name || 'Unknown Clan',
    clanLevel: Number(r.clan_level),
    reputationScore: Number(r.reputation_score),
    leaderName: r.leader_name || 'Unknown',
    allyName: r.ally_name || null,
    memberCount: Number(r.member_count),
    castleName: r.castle_name || null,
  }));

  return { total, items };
}

export async function queryOlympiadHeroes(): Promise<{
  currentCycle: number | null;
  items: OlympiadHeroItem[];
}> {
  const { clause, params } = buildValidCharacterWhereClause('c');

  let currentCycle: number | null = null;
  try {
    const cycleRows = await executeReadOnlyQuery<{ current_cycle: number }>(
      `SELECT current_cycle FROM olympiad_data LIMIT 1`
    );
    currentCycle = cycleRows[0]?.current_cycle ?? null;
  } catch {
    currentCycle = null;
  }

  interface RawHeroRow {
    char_name: string;
    class_id: number;
    level: number;
    clan_name: string | null;
    count: number;
    message: string;
  }

  const rows = await executeReadOnlyQuery<RawHeroRow>(
    `SELECT
      c.char_name,
      h.class_id,
      IFNULL(c.level, 85) AS level,
      cd.clan_name,
      IFNULL(h.count, 1) AS count,
      IFNULL(h.message, '') AS message
    FROM heroes h
    INNER JOIN characters c ON c.charId = h.charId
    LEFT JOIN clan_data cd ON cd.clan_id = c.clanid
    WHERE h.played = 1 AND ${clause}
    ORDER BY h.class_id ASC`,
    params
  );

  const items: OlympiadHeroItem[] = rows.map((r) => ({
    charName: r.char_name,
    classId: Number(r.class_id),
    className: getClassName(Number(r.class_id)),
    level: Number(r.level),
    clanName: r.clan_name || null,
    heroCount: Number(r.count),
    message: r.message || '',
  }));

  return { currentCycle, items };
}

export async function queryCastles(): Promise<CastleItem[]> {
  interface RawCastleRow {
    id: number;
    name: string;
    taxPercent: number;
    siegeDate: number;
    clan_name: string | null;
    ally_name: string | null;
    leader_name: string | null;
  }

  const rows = await executeReadOnlyQuery<RawCastleRow>(
    `SELECT
      c.id,
      c.name,
      IFNULL(c.taxPercent, 0) AS taxPercent,
      IFNULL(c.siegeDate, 0) AS siegeDate,
      cd.clan_name,
      cd.ally_name,
      leader.char_name AS leader_name
    FROM castle c
    LEFT JOIN clan_data cd ON cd.hasCastle = c.id
    LEFT JOIN characters leader ON leader.charId = cd.leader_id
    ORDER BY c.id ASC`
  );

  return rows.map((r) => ({
    id: Number(r.id),
    name: r.name,
    ownerClan: r.clan_name || null,
    leaderName: r.leader_name || null,
    allyName: r.ally_name || null,
    taxPercent: Number(r.taxPercent),
    siegeDate: Number(r.siegeDate) > 0 ? Number(r.siegeDate) : null,
  }));
}

export async function queryRaidBosses(): Promise<RaidBossItem[]> {
  interface RawGrandBossRow {
    boss_id: number;
    respawn_time: number;
    status: number;
  }

  interface RawFieldBossRow {
    boss_id: number;
    respawn_time: number;
  }

  const bossIds = Object.keys(L2BLITZ_BOSS_CATALOG).map(Number);
  const placeholders = bossIds.map(() => '?').join(', ');

  const [grandRows, fieldRows] = await Promise.all([
    executeReadOnlyQuery<RawGrandBossRow>(
      `SELECT boss_id, respawn_time, status FROM grandboss_data WHERE boss_id IN (${placeholders})`,
      bossIds
    ),
    executeReadOnlyQuery<RawFieldBossRow>(
      `SELECT boss_id, respawn_time FROM raidboss_spawnlist WHERE boss_id IN (${placeholders})`,
      bossIds
    ),
  ]);

  const grandMap = new Map(grandRows.map((r) => [Number(r.boss_id), r]));
  const fieldMap = new Map(fieldRows.map((r) => [Number(r.boss_id), r]));
  const now = Date.now();

  return Object.values(L2BLITZ_BOSS_CATALOG).map((meta) => {
    const gRow = grandMap.get(meta.bossId);
    const fRow = fieldMap.get(meta.bossId);

    let status: 'alive' | 'dead' | 'unknown' = 'unknown';
    let nextSpawnWindowStart: number | null = null;

    if (gRow) {
      const respawnTime = Number(gRow.respawn_time);
      if (respawnTime > now || Number(gRow.status) >= 2) {
        status = 'dead';
        nextSpawnWindowStart = respawnTime > now ? respawnTime : null;
      } else {
        status = 'alive';
      }
    } else if (fRow) {
      const respawnTime = Number(fRow.respawn_time);
      if (respawnTime > now) {
        status = 'dead';
        nextSpawnWindowStart = respawnTime;
      } else {
        status = 'alive';
      }
    }

    return {
      bossId: meta.bossId,
      name: meta.name,
      level: meta.level,
      category: meta.category,
      image: meta.image,
      location: meta.locationTh,
      teleportInfo: meta.teleportInfoTh,
      status,
      // L2J Mobius does not store exact lastKillTime in vanilla tables; never fabricate it
      lastKillTime: null,
      nextSpawnWindowStart,
      nextSpawnWindowEnd: null,
      respawnRuleText: meta.respawnRuleTh,
      customRuleWarning: meta.customRuleWarningTh,
      isCustomTeleport: meta.isCustomTeleport,
    };
  });
}
