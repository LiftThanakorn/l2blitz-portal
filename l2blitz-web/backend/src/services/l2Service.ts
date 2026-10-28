import { probeConfiguredPort } from './portProbe.js';
import {
  DEV_FIXTURE_CLANS,
  DEV_FIXTURE_HEROES,
  DEV_FIXTURE_OLYMPIAD_NOBLES,
  DEV_FIXTURE_PVP_RANKINGS,
  HIGH_FIVE_CASTLES_CATALOG,
  HIGH_FIVE_RAIDBOSS_CATALOG,
  HIGH_FIVE_SERVER_RATES,
  HIGH_FIVE_TVT_EVENT,
  InternalOlympiadNobleRecord,
} from '../data/fixtures.js';
import {
  getClassInfoById,
  HIGH_FIVE_HERO_ELIGIBLE_CLASSES,
  resolveCanonicalClassId,
} from '../data/highFiveClasses.js';
import {
  executeReadOnlyQuery,
  getActiveDataSourceMode,
  isDatabaseConfigured,
  isDevFixtureEnabled,
  withTtlCache,
} from '../db/mysqlAdapter.js';
import {
  CastleDto,
  ClanRankingRow,
  OlympiadHeroRow,
  OlympiadPublicRankingRow,
  OlympiadTopByClassResponse,
  PvpPkRankingRow,
  RaidBossDto,
  ServerRatesDto,
  ServerStatsDto,
  ServerStatusDto,
  TvtEventDto,
} from '../types/api.js';

/**
 * Official L2J Mobius CT 2.6 High Five Olympiad Minimum Requirements
 * Reference: Olympiad.java / Olympiad.properties (`AltOlyDividerClassed`, min 15 matches & 1 win for ranking/hero)
 */
const OLYMPIAD_MIN_MATCHES = 15;
const OLYMPIAD_MIN_WINS = 1;

export async function getServerStatus(): Promise<ServerStatusDto> {
  return withTtlCache('server:status', 15_000, async () => {
    if (isDatabaseConfigured()) {
      const ping = await executeReadOnlyQuery<{ ok: number }>('SELECT 1 AS ok');
      if (ping && ping.length > 0) {
        const [loginServer, gameServer] = await Promise.all([
          probeConfiguredPort('LOGIN_STATUS_PORT'),
          probeConfiguredPort('GAME_STATUS_PORT'),
        ]);
        const status = loginServer === 'offline' || gameServer === 'offline'
          ? 'offline'
          : loginServer === 'online' && gameServer === 'online' ? 'online' : 'unknown';
        return {
          status, loginServer, gameServer,
          chronicle: 'High Five (CT 2.6)',
          region: 'Thailand (GMT+7)',
          messageTh: status === 'unknown'
            ? 'เชื่อมฐานข้อมูลได้ แต่ยังไม่เปิดตรวจสอบพอร์ตเซิร์ฟเวอร์'
            : 'สถานะจากการตรวจสอบพอร์ต TCP ของเซิร์ฟเวอร์ (ไม่ใช่การยืนยันการเล่นเกม)',
          messageEn: status === 'unknown'
            ? 'Game database connected; port probes are not configured.'
            : 'Status reflects TCP port reachability, not full gameplay health.',
        };
      }
      return {
        status: 'unknown',
        loginServer: 'unknown',
        gameServer: 'unknown',
        chronicle: 'High Five (CT 2.6)',
        region: 'Thailand (GMT+7)',
        messageTh: 'ไม่สามารถติดต่อฐานข้อมูล GameServer ได้ในขณะนี้',
        messageEn: 'GameServer database is currently unreachable.',
      };
    }

    // Honest default when GameServer is not connected yet: Unknown (Never fake Online status)
    return {
      status: 'unknown',
      loginServer: 'unknown',
      gameServer: 'unknown',
      chronicle: 'High Five (CT 2.6)',
      region: 'Thailand (GMT+7)',
      messageTh: 'ไม่ทราบสถานะ (รอเชื่อมต่อฐานข้อมูล L2J Mobius GameServer จริง)',
      messageEn: 'Unknown Status (Pending live L2J Mobius GameServer connection)',
    };
  });
}

export async function getServerStats(): Promise<ServerStatsDto> {
  return withTtlCache('server:stats', 20_000, async () => {
    if (isDatabaseConfigured()) {
      const charRows = await executeReadOnlyQuery<{
        onlineCount: number;
        totalChars: number;
      }>(
        'SELECT SUM(CASE WHEN online = 1 THEN 1 ELSE 0 END) AS onlineCount, COUNT(*) AS totalChars FROM characters WHERE accesslevel = 0'
      );
      const clanRows = await executeReadOnlyQuery<{ totalClans: number }>(
        'SELECT COUNT(*) AS totalClans FROM clan_data'
      );
      const nobleRows = await executeReadOnlyQuery<{ totalNobles: number }>(
        'SELECT COUNT(*) AS totalNobles FROM olympiad_nobles'
      );

      if (charRows && charRows[0]) {
        return {
          playersOnline: Number(charRows[0].onlineCount || 0),
          totalCharacters: Number(charRows[0].totalChars || 0),
          totalClans: clanRows?.[0] ? Number(clanRows[0].totalClans) : 0,
          activeOlympiadNobles: nobleRows?.[0] ? Number(nobleRows[0].totalNobles) : 0,
          status: 'verified',
        };
      }
    }

    // NEVER invent fake player numbers when GameServer is unavailable
    return {
      playersOnline: null,
      totalCharacters: null,
      totalClans: null,
      activeOlympiadNobles: null,
      status: 'unavailable',
    };
  });
}

export async function getServerRates(): Promise<ServerRatesDto> {
  return HIGH_FIVE_SERVER_RATES;
}

export async function getPvpRankings(params: {
  page: number;
  limit: number;
  search: string;
  sort?: string;
}): Promise<{
  items: PvpPkRankingRow[];
  total: number;
  page: number;
  limit: number;
}> {
  return withTtlCache(
    `rankings:pvp:${params.page}:${params.limit}:${params.search}:${params.sort || 'pvp'}`,
    30_000,
    async () => {
      if (isDatabaseConfigured()) {
        const offset = (params.page - 1) * params.limit;
        const searchLike = `%${params.search}%`;
        const rows = await executeReadOnlyQuery<{
          char_name: string;
          classid: number;
          level: number;
          pvpkills: number;
          pkkills: number;
          online: number;
          clan_name: string | null;
        }>(
          `SELECT c.char_name, c.classid, c.level, c.pvpkills, c.pkkills, c.online, cd.clan_name
           FROM characters c
           LEFT JOIN clan_data cd ON c.clanid = cd.clan_id
           WHERE c.accesslevel = 0 AND c.char_name LIKE ?
           ORDER BY c.pvpkills DESC, c.pkkills DESC
           LIMIT ? OFFSET ?`,
          [searchLike, params.limit, offset]
        );

        if (rows) {
          const items: PvpPkRankingRow[] = rows.map((r, idx) => {
            const cls = getClassInfoById(r.classid);
            return {
              rank: offset + idx + 1,
              charName: r.char_name,
              classId: r.classid,
              classNameEn: cls?.nameEn || `Class ${r.classid}`,
              classNameTh: cls?.nameTh || `คลาส ${r.classid}`,
              clanName: r.clan_name,
              level: r.level,
              pvpKills: r.pvpkills,
              pkKills: r.pkkills,
              online: r.online === 1,
            };
          });
          const countRows = await executeReadOnlyQuery<{ total: number }>('SELECT COUNT(*) AS total FROM characters WHERE accesslevel = 0 AND char_name LIKE ?', [searchLike]);
          return { items, total: Number(countRows?.[0]?.total ?? items.length), page: params.page, limit: params.limit };
        }
      }

      if (isDevFixtureEnabled()) {
        let filtered = [...DEV_FIXTURE_PVP_RANKINGS];
        if (params.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(
            (r) =>
              r.charName.toLowerCase().includes(q) ||
              (r.clanName && r.clanName.toLowerCase().includes(q)) ||
              r.classNameEn.toLowerCase().includes(q)
          );
        }
        filtered.sort((a, b) => b.pvpKills - a.pvpKills);
        const reranked = filtered.map((item, idx) => ({ ...item, rank: idx + 1 }));
        const start = (params.page - 1) * params.limit;
        return {
          items: reranked.slice(start, start + params.limit),
          total: reranked.length,
          page: params.page,
          limit: params.limit,
        };
      }

      return { items: [], total: 0, page: params.page, limit: params.limit };
    }
  );
}

export async function getPkRankings(params: {
  page: number;
  limit: number;
  search: string;
}): Promise<{
  items: PvpPkRankingRow[];
  total: number;
  page: number;
  limit: number;
}> {
  return withTtlCache(
    `rankings:pk:${params.page}:${params.limit}:${params.search}`,
    30_000,
    async () => {
      if (isDatabaseConfigured()) {
        const offset = (params.page - 1) * params.limit;
        const searchLike = `%${params.search}%`;
        const rows = await executeReadOnlyQuery<{
          char_name: string;
          classid: number;
          level: number;
          pvpkills: number;
          pkkills: number;
          online: number;
          clan_name: string | null;
        }>(
          `SELECT c.char_name, c.classid, c.level, c.pvpkills, c.pkkills, c.online, cd.clan_name
           FROM characters c
           LEFT JOIN clan_data cd ON c.clanid = cd.clan_id
           WHERE c.accesslevel = 0 AND c.char_name LIKE ?
           ORDER BY c.pkkills DESC, c.pvpkills DESC
           LIMIT ? OFFSET ?`,
          [searchLike, params.limit, offset]
        );

        if (rows) {
          const items: PvpPkRankingRow[] = rows.map((r, idx) => {
            const cls = getClassInfoById(r.classid);
            return {
              rank: offset + idx + 1,
              charName: r.char_name,
              classId: r.classid,
              classNameEn: cls?.nameEn || `Class ${r.classid}`,
              classNameTh: cls?.nameTh || `คลาส ${r.classid}`,
              clanName: r.clan_name,
              level: r.level,
              pvpKills: r.pvpkills,
              pkKills: r.pkkills,
              online: r.online === 1,
            };
          });
          const countRows = await executeReadOnlyQuery<{ total: number }>('SELECT COUNT(*) AS total FROM characters WHERE accesslevel = 0 AND char_name LIKE ?', [searchLike]);
          return { items, total: Number(countRows?.[0]?.total ?? items.length), page: params.page, limit: params.limit };
        }
      }

      if (isDevFixtureEnabled()) {
        let filtered = [...DEV_FIXTURE_PVP_RANKINGS];
        if (params.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(
            (r) =>
              r.charName.toLowerCase().includes(q) ||
              (r.clanName && r.clanName.toLowerCase().includes(q)) ||
              r.classNameEn.toLowerCase().includes(q)
          );
        }
        filtered.sort((a, b) => b.pkKills - a.pkKills || b.pvpKills - a.pvpKills);
        const reranked = filtered.map((item, idx) => ({ ...item, rank: idx + 1 }));
        const start = (params.page - 1) * params.limit;
        return {
          items: reranked.slice(start, start + params.limit),
          total: reranked.length,
          page: params.page,
          limit: params.limit,
        };
      }

      return { items: [], total: 0, page: params.page, limit: params.limit };
    }
  );
}

export async function getClanRankings(params: {
  page: number;
  limit: number;
  search: string;
}): Promise<{
  items: ClanRankingRow[];
  total: number;
  page: number;
  limit: number;
}> {
  return withTtlCache(
    `rankings:clans:${params.page}:${params.limit}:${params.search}`,
    45_000,
    async () => {
      if (isDatabaseConfigured()) {
        const offset = (params.page - 1) * params.limit;
        const searchLike = `%${params.search}%`;
        const rows = await executeReadOnlyQuery<{
          clan_name: string;
          clan_level: number;
          reputation_score: number;
          ally_name: string | null;
          leader_name: string;
          castle_name: string | null;
          members: number;
        }>(
          `SELECT cd.clan_name, cd.clan_level, cd.reputation_score, cd.ally_name,
                  c.char_name AS leader_name, cs.name AS castle_name,
                  (SELECT COUNT(*) FROM characters m WHERE m.clanid = cd.clan_id) AS members
           FROM clan_data cd
           LEFT JOIN characters c ON cd.leader_id = c.charId
           LEFT JOIN castle cs ON cd.hasCastle = cs.id
           WHERE cd.clan_name LIKE ?
           ORDER BY cd.clan_level DESC, cd.reputation_score DESC
           LIMIT ? OFFSET ?`,
          [searchLike, params.limit, offset]
        );

        if (rows) {
          const items: ClanRankingRow[] = rows.map((r, idx) => ({
            rank: offset + idx + 1,
            clanName: r.clan_name,
            leaderName: r.leader_name || 'Unknown',
            clanLevel: r.clan_level,
            reputationScore: r.reputation_score,
            memberCount: Number(r.members || 0),
            castleName: r.castle_name,
            allyName: r.ally_name,
          }));
          const countRows = await executeReadOnlyQuery<{ total: number }>('SELECT COUNT(*) AS total FROM clan_data WHERE clan_name LIKE ?', [searchLike]);
          return { items, total: Number(countRows?.[0]?.total ?? items.length), page: params.page, limit: params.limit };
        }
      }

      if (isDevFixtureEnabled()) {
        let filtered = [...DEV_FIXTURE_CLANS];
        if (params.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c.clanName.toLowerCase().includes(q) ||
              c.leaderName.toLowerCase().includes(q)
          );
        }
        const start = (params.page - 1) * params.limit;
        return {
          items: filtered.slice(start, start + params.limit),
          total: filtered.length,
          page: params.page,
          limit: params.limit,
        };
      }

      return { items: [], total: 0, page: params.page, limit: params.limit };
    }
  );
}

/**
 * Computes Grand Olympiad Rankings according to L2J Mobius CT 2.6 High Five:
 * 1. Groups Soul Hound Male (132) & Female (133) into canonical bracket 132.
 * 2. Filters out participants who have not met the minimum 15 matches & 1 win (`competitions_done >= 15 AND competitions_won >= 1`).
 * 3. Sorts internally by `olympiad_points DESC, competitions_won DESC, competitions_done ASC`.
 * 4. Strips all points, wins, and match counts before returning the public DTO (`rank`, `charName`, `clanName`, `classId`, `classNameEn`, `classNameTh`).
 */
export function computePublicOlympiadRankings(
  records: InternalOlympiadNobleRecord[],
  options: {
    classId?: number;
    cycle: 'current' | 'previous';
    page: number;
    limit: number;
  }
): {
  items: OlympiadPublicRankingRow[];
  total: number;
  page: number;
  limit: number;
  canonicalClassId: number | null;
  minimumMatchesRequired: number;
} {
  const canonicalFilter = options.classId ? resolveCanonicalClassId(options.classId) : null;

  const eligible = records.filter((rec) => {
    if (!HIGH_FIVE_HERO_ELIGIBLE_CLASSES.some((cls) => cls.id === resolveCanonicalClassId(rec.classId))) return false;
    if (rec.cycle !== options.cycle) return false;
    if (rec.competitionsDone < OLYMPIAD_MIN_MATCHES || rec.competitionsWon < OLYMPIAD_MIN_WINS) {
      return false;
    }
    if (canonicalFilter !== null) {
      return resolveCanonicalClassId(rec.classId) === canonicalFilter;
    }
    return true;
  });

  // Sort internally using points, wins, and win rate (just like L2J Mobius Olympiad.java)
  eligible.sort((a, b) => {
    if (b.olympiadPoints !== a.olympiadPoints) {
      return b.olympiadPoints - a.olympiadPoints;
    }
    if (b.competitionsWon !== a.competitionsWon) {
      return b.competitionsWon - a.competitionsWon;
    }
    return a.competitionsDone - b.competitionsDone;
  });

  // Map to strictly sanitized public DTO (NO points, NO match counts exposed)
  const sanitized: OlympiadPublicRankingRow[] = eligible.map((rec, index) => {
    const canonicalId = resolveCanonicalClassId(rec.classId);
    const classMeta = getClassInfoById(canonicalId);
    return {
      rank: index + 1,
      charName: rec.charName,
      clanName: rec.clanName,
      classId: canonicalId,
      classNameEn: classMeta?.nameEn || `Class ${canonicalId}`,
      classNameTh: classMeta?.nameTh || `คลาส ${canonicalId}`,
    };
  });

  const start = (options.page - 1) * options.limit;
  return {
    items: sanitized.slice(start, start + options.limit),
    total: sanitized.length,
    page: options.page,
    limit: options.limit,
    canonicalClassId: canonicalFilter,
    minimumMatchesRequired: OLYMPIAD_MIN_MATCHES,
  };
}

export async function getOlympiadRankings(options: {
  classId?: number;
  cycle: 'current' | 'previous';
  page: number;
  limit: number;
}) {
  return withTtlCache(
    `olympiad:rankings:${options.classId || 'all'}:${options.cycle}:${options.page}:${options.limit}`,
    30_000,
    async () => {
      if (isDatabaseConfigured()) {
        const table = options.cycle === 'previous' ? 'olympiad_nobles_eom' : 'olympiad_nobles';
        const canonical = options.classId ? resolveCanonicalClassId(options.classId) : null;
        const classClause =
          canonical === 132
            ? 'AND n.class_id IN (132, 133)'
            : canonical === 136
              ? 'AND n.class_id IN (135, 136)'
              : canonical !== null
                ? `AND n.class_id = ${Number(canonical)}`
                : '';

        const rows = await executeReadOnlyQuery<{
          charId: number;
          char_name: string;
          class_id: number;
          olympiad_points: number;
          competitions_done: number;
          competitions_won: number;
          competitions_lost: number;
          clan_name: string | null;
        }>(
          `SELECT n.charId, c.char_name, n.class_id, n.olympiad_points,
                  n.competitions_done, n.competitions_won, n.competitions_lost, cd.clan_name
           FROM ${table} n
           INNER JOIN characters c ON n.charId = c.charId
           LEFT JOIN clan_data cd ON c.clanid = cd.clan_id
           WHERE n.competitions_done >= 15 AND n.competitions_won >= 1 ${classClause}
           ORDER BY n.olympiad_points DESC, n.competitions_won DESC`
        );

        if (rows) {
          const internalRecords: InternalOlympiadNobleRecord[] = rows.map((r) => ({
            charId: r.charId,
            charName: r.char_name,
            classId: r.class_id,
            clanName: r.clan_name,
            olympiadPoints: r.olympiad_points,
            competitionsDone: r.competitions_done,
            competitionsWon: r.competitions_won,
            competitionsLost: r.competitions_lost,
            cycle: options.cycle,
          }));
          return {
            ...computePublicOlympiadRankings(internalRecords, options),
            classes: HIGH_FIVE_HERO_ELIGIBLE_CLASSES,
          };
        }
      }

      if (isDevFixtureEnabled()) {
        return {
          ...computePublicOlympiadRankings(DEV_FIXTURE_OLYMPIAD_NOBLES, options),
          classes: HIGH_FIVE_HERO_ELIGIBLE_CLASSES,
        };
      }

      return {
        items: [],
        total: 0,
        page: options.page,
        limit: options.limit,
        canonicalClassId: options.classId ? resolveCanonicalClassId(options.classId) : null,
        minimumMatchesRequired: OLYMPIAD_MIN_MATCHES,
        classes: HIGH_FIVE_HERO_ELIGIBLE_CLASSES,
      };
    }
  );
}

/**
 * All 34 Hero-eligible High Five Olympiad brackets in ONE request: three public ranks per class.
 * Never serialize points, wins, or match counts. Empty classes remain visible.
 */
export function computePublicOlympiadTopByClass(
  records: InternalOlympiadNobleRecord[],
  cycle: 'current' | 'previous'
): OlympiadTopByClassResponse {
  return {
    dataAvailable: true,
    cycle,
    minimumMatchesRequired: OLYMPIAD_MIN_MATCHES,
    classes: HIGH_FIVE_HERO_ELIGIBLE_CLASSES.map((cls) => ({
      classId: cls.id,
      classNameEn: cls.nameEn,
      classNameTh: cls.nameTh,
      race: cls.race,
      raceTh: cls.raceTh,
      rows: computePublicOlympiadRankings(records, {
        classId: cls.id,
        cycle,
        page: 1,
        limit: 3,
      }).items,
    })),
  };
}

export async function getOlympiadTopByClass(
  cycle: 'current' | 'previous'
): Promise<OlympiadTopByClassResponse> {
  return withTtlCache(`olympiad:top-by-class:${cycle}`, 30_000, async () => {
    if (isDatabaseConfigured()) {
      // Exactly one read-only query for all classes (not 35 API or DB requests).
      const table = cycle === 'previous' ? 'olympiad_nobles_eom' : 'olympiad_nobles';
      const rows = await executeReadOnlyQuery<{
        charId: number;
        char_name: string;
        class_id: number;
        olympiad_points: number;
        competitions_done: number;
        competitions_won: number;
        competitions_lost: number;
        clan_name: string | null;
      }>(
        `SELECT n.charId, c.char_name, n.class_id, n.olympiad_points,
                n.competitions_done, n.competitions_won, n.competitions_lost, cd.clan_name
         FROM ${table} n
         INNER JOIN characters c ON n.charId = c.charId
         LEFT JOIN clan_data cd ON c.clanid = cd.clan_id
         WHERE n.competitions_done >= 15 AND n.competitions_won >= 1`
      );
      if (rows) {
        return computePublicOlympiadTopByClass(rows.map((r) => ({
          charId: r.charId,
          charName: r.char_name,
          classId: r.class_id,
          clanName: r.clan_name,
          olympiadPoints: r.olympiad_points,
          competitionsDone: r.competitions_done,
          competitionsWon: r.competitions_won,
          competitionsLost: r.competitions_lost,
          cycle,
        })), cycle);
      }
    }
    if (isDevFixtureEnabled()) {
      return computePublicOlympiadTopByClass(DEV_FIXTURE_OLYMPIAD_NOBLES, cycle);
    }
    return { ...computePublicOlympiadTopByClass([], cycle), dataAvailable: false };
  });
}

export async function getOlympiadHeroes(): Promise<{
  heroes: OlympiadHeroRow[];
  verified: boolean;
}> {
  return withTtlCache('olympiad:heroes', 60_000, async () => {
    if (isDatabaseConfigured()) {
      const rows = await executeReadOnlyQuery<{
        char_name: string;
        class_id: number;
        count: number;
        clan_name: string | null;
        ally_name: string | null;
      }>(
        `SELECT c.char_name, h.class_id, h.count, cd.clan_name, cd.ally_name
         FROM heroes h
         LEFT JOIN characters c ON h.charId = c.charId
         LEFT JOIN clan_data cd ON c.clanid = cd.clan_id
         WHERE h.played = 1
         ORDER BY h.class_id ASC`
      );

      if (rows) {
        const heroes: OlympiadHeroRow[] = rows.map((r) => {
          const canonical = resolveCanonicalClassId(r.class_id);
          const cls = getClassInfoById(canonical);
          return {
            classId: canonical,
            classNameEn: cls?.nameEn || `Class ${canonical}`,
            classNameTh: cls?.nameTh || `คลาส ${canonical}`,
            charName: r.char_name,
            clanName: r.clan_name,
            allyName: r.ally_name,
            heroCount: Number(r.count || 1),
            cycleVerified: true,
          };
        });
        return { heroes, verified: true };
      }
    }

    if (isDevFixtureEnabled()) {
      return { heroes: DEV_FIXTURE_HEROES, verified: false };
    }

    return { heroes: [], verified: false };
  });
}

export async function getCastles(): Promise<CastleDto[]> {
  return withTtlCache('world:castles', 60_000, async () => {
    if (isDatabaseConfigured()) {
      const rows = await executeReadOnlyQuery<{
        id: number;
        name: string;
        taxPercent: number;
        siegeDate: number;
        clan_name: string | null;
        leader_name: string | null;
      }>(
        `SELECT cs.id, cs.name, cs.taxPercent, cs.siegeDate, cd.clan_name, c.char_name AS leader_name
         FROM castle cs
         LEFT JOIN clan_data cd ON cd.hasCastle = cs.id
         LEFT JOIN characters c ON cd.leader_id = c.charId
         ORDER BY cs.id ASC`
      );
      if (rows && rows.length > 0) {
        return rows.map((r) => {
          const ref = HIGH_FIVE_CASTLES_CATALOG.find((c) => c.castleId === r.id);
          return {
            castleId: r.id,
            nameEn: ref?.nameEn || `${r.name} Castle`,
            nameTh: ref?.nameTh || `ปราสาท ${r.name}`,
            ownerClan: r.clan_name,
            leaderName: r.leader_name,
            taxPercent: r.taxPercent,
            siegeDate: r.siegeDate ? new Date(Number(r.siegeDate)).toISOString() : null,
            status: 'verified',
          };
        });
      }
    }

    return HIGH_FIVE_CASTLES_CATALOG;
  });
}

export async function getRaidBosses(): Promise<RaidBossDto[]> {
  // Custom DailyEpicBoss runtime state is NOT represented reliably by
  // Mobius grandboss_data or raidboss_spawnlist. Never invent alive/dead status.
  return HIGH_FIVE_RAIDBOSS_CATALOG;
}

export async function getTvtEventInfo(): Promise<TvtEventDto> {
  return HIGH_FIVE_TVT_EVENT;
}

export function getVerificationNotice(): string | undefined {
  const mode = getActiveDataSourceMode();
  if (mode === 'live_mysql') return undefined;
  if (mode === 'dev_fixture') {
    return 'DEVELOPMENT PREVIEW FIXTURE MODE — Live GameServer MySQL is not connected. Do not enable USE_DEV_FIXTURES in production.';
  }
  return 'LIVE GAMESERVER OFFLINE / UNCONFIGURED — Displaying verified High Five reference mechanics and UNKNOWN live telemetry.';
}