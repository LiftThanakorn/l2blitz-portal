/**
 * L2BLITZ PVP — GameServer-confirmed configuration & isolated test fixtures
 *
 * CRITICAL PRODUCTION SAFETY:
 * - In Production (`NODE_ENV=production` or `USE_DEV_FIXTURES !== 'true'`),
 *   player rankings, online counts, and live boss statuses NEVER return these fixtures.
 * - Only GameServer-confirmed rates are published. Unverified enchant values are omitted.
 */

import {
  CastleDto,
  ClanRankingRow,
  OlympiadHeroRow,
  PvpPkRankingRow,
  RaidBossDto,
  ServerRatesDto,
  TvtEventDto,
} from '../types/api.js';
import { getClassInfoById } from './highFiveClasses.js';

export const HIGH_FIVE_SERVER_RATES: ServerRatesDto = {
  verificationStatus: 'verified',
  chronicle: 'Lineage II High Five (CT 2.6)',
  serverType: 'L2Blitz Instant PvP',
  rates: [
    { key: 'exp_sp', labelTh: 'EXP / SP', labelEn: 'EXP / SP',
      value: 'x1000 / x1000', noteTh: 'ค่าประสบการณ์และแต้มสกิล',
      noteEn: 'Experience and skill points', verified: true },
    { key: 'adena_drop', labelTh: 'อาเดน่าจากคิเมร่า', labelEn: 'Chimera Adena',
      value: '1.5M–3.5M', noteTh: 'อาเดน่าที่ได้รับจากคิเมร่าแต่ละตัว',
      noteEn: 'Adena earned per Chimera', verified: true },
    { key: 'raid_drop', labelTh: 'ไอเทมดรอปจากบอส', labelEn: 'Boss Item Drops',
      value: 'x2', noteTh: 'จำนวนไอเทมที่ดรอปจากบอส',
      noteEn: 'Boss item drop quantity', verified: true },
  ],
  enchantLimits: [],
};

/**
 * Internal Olympiad Noble structure matching L2J Mobius `olympiad_nobles` / `olympiad_nobles_eom`
 * Points, matches played, and wins are kept strictly internal for server-side sorting & eligibility.
 */
export interface InternalOlympiadNobleRecord {
  charId: number;
  charName: string;
  classId: number;
  clanName: string | null;
  olympiadPoints: number;
  competitionsDone: number;
  competitionsWon: number;
  competitionsLost: number;
  cycle: 'current' | 'previous';
}

export const DEV_FIXTURE_OLYMPIAD_NOBLES: InternalOlympiadNobleRecord[] = [
  // Soul Hound Male (132) & Female (133) — tested together in one unified bracket!
  { charId: 1001, charName: 'KaelenVex', classId: 132, clanName: 'Sovereign', olympiadPoints: 184, competitionsDone: 28, competitionsWon: 24, competitionsLost: 4, cycle: 'current' },
  { charId: 1002, charName: 'SeraphinaNoir', classId: 133, clanName: 'VanguardTH', olympiadPoints: 171, competitionsDone: 25, competitionsWon: 20, competitionsLost: 5, cycle: 'current' },
  { charId: 1003, charName: 'zephyrWing', classId: 132, clanName: 'Eclipse', olympiadPoints: 149, competitionsDone: 19, competitionsWon: 14, competitionsLost: 5, cycle: 'current' },
  { charId: 1004, charName: 'NyxValerius', classId: 133, clanName: 'Sovereign', olympiadPoints: 132, competitionsDone: 16, competitionsWon: 11, competitionsLost: 5, cycle: 'current' },
  // Below minimum 15 matches requirement — should be excluded when enforcing official minimum matches
  { charId: 1005, charName: 'UnrankedHound', classId: 132, clanName: null, olympiadPoints: 210, competitionsDone: 8, competitionsWon: 8, competitionsLost: 0, cycle: 'current' },

  // Duelist (88)
  { charId: 1010, charName: 'AureliusBlade', classId: 88, clanName: 'Sovereign', olympiadPoints: 196, competitionsDone: 31, competitionsWon: 27, competitionsLost: 4, cycle: 'current' },
  { charId: 1011, charName: 'KenshinTH', classId: 88, clanName: 'VanguardTH', olympiadPoints: 162, competitionsDone: 24, competitionsWon: 18, competitionsLost: 6, cycle: 'current' },
  { charId: 1012, charName: 'ValeriusSonic', classId: 88, clanName: 'CrimsonOrder', olympiadPoints: 138, competitionsDone: 18, competitionsWon: 12, competitionsLost: 6, cycle: 'current' },

  // Phoenix Knight (90)
  { charId: 1020, charName: 'SolarixAegis', classId: 90, clanName: 'VanguardTH', olympiadPoints: 208, competitionsDone: 34, competitionsWon: 30, competitionsLost: 4, cycle: 'current' },
  { charId: 1021, charName: 'IronVow', classId: 90, clanName: 'Sovereign', olympiadPoints: 155, competitionsDone: 21, competitionsWon: 15, competitionsLost: 6, cycle: 'current' },

  // Adventurer (93)
  { charId: 1030, charName: 'SilentMirage', classId: 93, clanName: 'Eclipse', olympiadPoints: 179, competitionsDone: 26, competitionsWon: 21, competitionsLost: 5, cycle: 'current' },
  { charId: 1031, charName: 'DuskStep', classId: 93, clanName: 'CrimsonOrder', olympiadPoints: 144, competitionsDone: 17, competitionsWon: 12, competitionsLost: 5, cycle: 'current' },

  // Archmage (94)
  { charId: 1040, charName: 'IgnisVortex', classId: 94, clanName: 'Sovereign', olympiadPoints: 168, competitionsDone: 22, competitionsWon: 17, competitionsLost: 5, cycle: 'current' },

  // Cardinal (97)
  { charId: 1050, charName: 'SanctumGrace', classId: 97, clanName: 'VanguardTH', olympiadPoints: 189, competitionsDone: 29, competitionsWon: 24, competitionsLost: 5, cycle: 'current' },

  // Mystic Muse (103)
  { charId: 1060, charName: 'FrostAria', classId: 103, clanName: 'Eclipse', olympiadPoints: 192, competitionsDone: 30, competitionsWon: 25, competitionsLost: 5, cycle: 'current' },

  // Ghost Hunter (108)
  { charId: 1070, charName: 'LethalVein', classId: 108, clanName: 'Sovereign', olympiadPoints: 181, competitionsDone: 27, competitionsWon: 22, competitionsLost: 5, cycle: 'current' },

  // Storm Screamer (110)
  { charId: 1080, charName: 'TempestGale', classId: 110, clanName: 'CrimsonOrder', olympiadPoints: 174, competitionsDone: 23, competitionsWon: 18, competitionsLost: 5, cycle: 'current' },

  // Titan (113)
  { charId: 1090, charName: 'GrommashFury', classId: 113, clanName: 'VanguardTH', olympiadPoints: 186, competitionsDone: 25, competitionsWon: 21, competitionsLost: 4, cycle: 'current' },

  // Grand Khavatari (114)
  { charId: 1100, charName: 'AsuraFist', classId: 114, clanName: 'Sovereign', olympiadPoints: 201, competitionsDone: 32, competitionsWon: 28, competitionsLost: 4, cycle: 'current' },

  // Dominator (115)
  { charId: 1110, charName: 'ArchonSeal', classId: 115, clanName: 'VanguardTH', olympiadPoints: 195, competitionsDone: 28, competitionsWon: 24, competitionsLost: 4, cycle: 'current' },

  // Trickster (134)
  { charId: 1120, charName: 'BoltShift', classId: 134, clanName: 'Eclipse', olympiadPoints: 167, competitionsDone: 20, competitionsWon: 15, competitionsLost: 5, cycle: 'current' },

  // Previous Cycle Records (`olympiad_nobles_eom`)
  { charId: 1002, charName: 'SeraphinaNoir', classId: 133, clanName: 'VanguardTH', olympiadPoints: 214, competitionsDone: 36, competitionsWon: 31, competitionsLost: 5, cycle: 'previous' },
  { charId: 1001, charName: 'KaelenVex', classId: 132, clanName: 'Sovereign', olympiadPoints: 198, competitionsDone: 33, competitionsWon: 27, competitionsLost: 6, cycle: 'previous' },
  { charId: 1020, charName: 'SolarixAegis', classId: 90, clanName: 'VanguardTH', olympiadPoints: 220, competitionsDone: 38, competitionsWon: 34, competitionsLost: 4, cycle: 'previous' },
  { charId: 1010, charName: 'AureliusBlade', classId: 88, clanName: 'Sovereign', olympiadPoints: 205, competitionsDone: 35, competitionsWon: 30, competitionsLost: 5, cycle: 'previous' },
];

export const DEV_FIXTURE_PVP_RANKINGS: PvpPkRankingRow[] = [
  { rank: 1, charName: 'AureliusBlade', classId: 88, classNameEn: 'Duelist', classNameTh: 'ดูเอลลิสต์ (Gladiator)', clanName: 'Sovereign', level: 85, pvpKills: 1420, pkKills: 34, online: true },
  { rank: 2, charName: 'LethalVein', classId: 108, classNameEn: 'Ghost Hunter', classNameTh: 'โกสต์ฮันเตอร์ (Abyss Walker)', clanName: 'Sovereign', level: 85, pvpKills: 1315, pkKills: 89, online: true },
  { rank: 3, charName: 'KaelenVex', classId: 132, classNameEn: 'Soul Hound (132/133)', classNameTh: 'โซลฮาวด์ (ชาย/หญิง รวมคลาส 132/133)', clanName: 'Sovereign', level: 85, pvpKills: 1248, pkKills: 19, online: true },
  { rank: 4, charName: 'FrostAria', classId: 103, classNameEn: 'Mystic Muse', classNameTh: 'มิสติกมิวส์ (Spellsinger)', clanName: 'Eclipse', level: 85, pvpKills: 1190, pkKills: 42, online: false },
  { rank: 5, charName: 'AsuraFist', classId: 114, classNameEn: 'Grand Khavatari', classNameTh: 'แกรนด์คาวาตาริ (Tyrant)', clanName: 'Sovereign', level: 85, pvpKills: 1104, pkKills: 67, online: true },
  { rank: 6, charName: 'SolarixAegis', classId: 90, classNameEn: 'Phoenix Knight', classNameTh: 'ฟีนิกซ์ไนท์ (Paladin)', clanName: 'VanguardTH', level: 85, pvpKills: 985, pkKills: 12, online: true },
  { rank: 7, charName: 'SeraphinaNoir', classId: 133, classNameEn: 'Soul Hound (132/133)', classNameTh: 'โซลฮาวด์ (ชาย/หญิง รวมคลาส 132/133)', clanName: 'VanguardTH', level: 85, pvpKills: 960, pkKills: 28, online: false },
  { rank: 8, charName: 'SilentMirage', classId: 93, classNameEn: 'Adventurer', classNameTh: 'แอดเวนเจอเรอร์ (Treasure Hunter)', clanName: 'Eclipse', level: 85, pvpKills: 912, pkKills: 115, online: true },
  { rank: 9, charName: 'TempestGale', classId: 110, classNameEn: 'Storm Screamer', classNameTh: 'สตอร์มสครีมเมอร์ (Spellhowler)', clanName: 'CrimsonOrder', level: 85, pvpKills: 874, pkKills: 53, online: false },
  { rank: 10, charName: 'GrommashFury', classId: 113, classNameEn: 'Titan', classNameTh: 'ไททัน (Destroyer)', clanName: 'VanguardTH', level: 85, pvpKills: 830, pkKills: 41, online: true },
  { rank: 11, charName: 'BoltShift', classId: 134, classNameEn: 'Trickster', classNameTh: 'ทริกสเตอร์ (Arbalester)', clanName: 'Eclipse', level: 85, pvpKills: 792, pkKills: 16, online: true },
  { rank: 12, charName: 'SanctumGrace', classId: 97, classNameEn: 'Cardinal', classNameTh: 'คาร์ดินัล (Bishop)', clanName: 'VanguardTH', level: 85, pvpKills: 645, pkKills: 4, online: true },
];

export const DEV_FIXTURE_CLANS: ClanRankingRow[] = [
  { rank: 1, clanName: 'Sovereign', leaderName: 'AureliusBlade', clanLevel: 11, reputationScore: 148500, memberCount: 118, castleName: 'Aden Castle', allyName: 'Imperium' },
  { rank: 2, clanName: 'VanguardTH', leaderName: 'SolarixAegis', clanLevel: 11, reputationScore: 132400, memberCount: 112, castleName: 'Rune Castle', allyName: 'NorthernPact' },
  { rank: 3, clanName: 'Eclipse', leaderName: 'FrostAria', clanLevel: 10, reputationScore: 98200, memberCount: 86, castleName: 'Giran Castle', allyName: 'Nightfall' },
  { rank: 4, clanName: 'CrimsonOrder', leaderName: 'TempestGale', clanLevel: 10, reputationScore: 76900, memberCount: 74, castleName: 'Goddard Castle', allyName: null },
  { rank: 5, clanName: 'BlackLotus', leaderName: 'KenshinTH', clanLevel: 9, reputationScore: 54100, memberCount: 52, castleName: null, allyName: null },
];

export const DEV_FIXTURE_HEROES: OlympiadHeroRow[] = [
  { classId: 88, classNameEn: 'Duelist', classNameTh: 'ดูเอลลิสต์ (Gladiator)', charName: 'AureliusBlade', clanName: 'Sovereign', allyName: 'Imperium', heroCount: 4, cycleVerified: true },
  { classId: 90, classNameEn: 'Phoenix Knight', classNameTh: 'ฟีนิกซ์ไนท์ (Paladin)', charName: 'SolarixAegis', clanName: 'VanguardTH', allyName: 'NorthernPact', heroCount: 6, cycleVerified: true },
  { classId: 93, classNameEn: 'Adventurer', classNameTh: 'แอดเวนเจอเรอร์ (Treasure Hunter)', charName: 'SilentMirage', clanName: 'Eclipse', allyName: 'Nightfall', heroCount: 2, cycleVerified: true },
  { classId: 97, classNameEn: 'Cardinal', classNameTh: 'คาร์ดินัล (Bishop)', charName: 'SanctumGrace', clanName: 'VanguardTH', allyName: 'NorthernPact', heroCount: 5, cycleVerified: true },
  { classId: 103, classNameEn: 'Mystic Muse', classNameTh: 'มิสติกมิวส์ (Spellsinger)', charName: 'FrostAria', clanName: 'Eclipse', allyName: 'Nightfall', heroCount: 3, cycleVerified: true },
  { classId: 108, classNameEn: 'Ghost Hunter', classNameTh: 'โกสต์ฮันเตอร์ (Abyss Walker)', charName: 'LethalVein', clanName: 'Sovereign', allyName: 'Imperium', heroCount: 4, cycleVerified: true },
  { classId: 114, classNameEn: 'Grand Khavatari', classNameTh: 'แกรนด์คาวาตาริ (Tyrant)', charName: 'AsuraFist', clanName: 'Sovereign', allyName: 'Imperium', heroCount: 3, cycleVerified: true },
  { classId: 132, classNameEn: 'Soul Hound (132/133)', classNameTh: 'โซลฮาวด์ (ชาย/หญิง รวมคลาส 132/133)', charName: 'SeraphinaNoir', clanName: 'VanguardTH', allyName: 'NorthernPact', heroCount: 3, cycleVerified: true },
];

export const HIGH_FIVE_CASTLES_CATALOG: CastleDto[] = [
  { castleId: 1, nameEn: 'Gludio Castle', nameTh: 'ปราสาทกลูดิโอ', ownerClan: null, leaderName: null, taxPercent: null, siegeDate: null, status: 'unknown' },
  { castleId: 2, nameEn: 'Dion Castle', nameTh: 'ปราสาทดีออน', ownerClan: null, leaderName: null, taxPercent: null, siegeDate: null, status: 'unknown' },
  { castleId: 3, nameEn: 'Giran Castle', nameTh: 'ปราสาทกีรัน', ownerClan: null, leaderName: null, taxPercent: null, siegeDate: null, status: 'unknown' },
  { castleId: 4, nameEn: 'Oren Castle', nameTh: 'ปราสาทโอเรน', ownerClan: null, leaderName: null, taxPercent: null, siegeDate: null, status: 'unknown' },
  { castleId: 5, nameEn: 'Aden Castle', nameTh: 'ปราสาทอาเดน', ownerClan: null, leaderName: null, taxPercent: null, siegeDate: null, status: 'unknown' },
  { castleId: 6, nameEn: 'Innadril Castle', nameTh: 'ปราสาทอินนาดริล', ownerClan: null, leaderName: null, taxPercent: null, siegeDate: null, status: 'unknown' },
  { castleId: 7, nameEn: 'Goddard Castle', nameTh: 'ปราสาทกอดดาร์ด', ownerClan: null, leaderName: null, taxPercent: null, siegeDate: null, status: 'unknown' },
  { castleId: 8, nameEn: 'Rune Castle', nameTh: 'ปราสาทรูน', ownerClan: null, leaderName: null, taxPercent: null, siegeDate: null, status: 'unknown' },
  { castleId: 9, nameEn: 'Schuttgart Castle', nameTh: 'ปราสาทชุตการ์ต', ownerClan: null, leaderName: null, taxPercent: null, siegeDate: null, status: 'unknown' },
];

/**
 * Verified High Five Raid Boss & Grand Boss Reference Catalog.
 * Note: Real-time statuses (`alive` / `dead`) and spawn timestamps are NEVER invented when the DB is offline;
 * they return `status: 'unknown'`, `lastKill: null`, `nextSpawnWindow: null`.
 */
export const HIGH_FIVE_RAIDBOSS_CATALOG: RaidBossDto[] = [
  {
    bossId: 29001, nameEn: 'Queen Ant', nameTh: 'ราชินีมด (Queen Ant)',
    level: 40, tier: 'Grand Boss', locationEn: 'Ant Nest', locationTh: 'รังมด',
    teleportEn: 'Alt+B → Queen Ant 1 / Queen Ant 2',
    teleportTh: 'Alt+B → QUEEN ANT 1 หรือ QUEEN ANT 2',
    status: 'unknown', lastKill: null, nextSpawnWindow: null,
    respawnRuleEn: 'One randomly selected Daily Epic boss at 20:00 (Thailand time)',
    respawnRuleTh: 'สุ่ม Queen Ant, Baium หรือ Zaken เพียง 1 ตัวต่อวัน เวลา 20:00 น.',
    keyDrops: ['Ring of Queen Ant'],
  },
  {
    bossId: 29020, nameEn: 'Baium', nameTh: 'ไบอุม (Baium)',
    level: 75, tier: 'Grand Boss', locationEn: 'Tower of Insolence',
    locationTh: 'Tower of Insolence',
    teleportEn: 'Alt+B → Baium 1 / Baium 2',
    teleportTh: 'Alt+B → BAIUM 1 หรือ BAIUM 2',
    status: 'unknown', lastKill: null, nextSpawnWindow: null,
    respawnRuleEn: 'One randomly selected Daily Epic boss at 20:00 (Thailand time)',
    respawnRuleTh: 'สุ่ม Queen Ant, Baium หรือ Zaken เพียง 1 ตัวต่อวัน เวลา 20:00 น.',
    keyDrops: ['Ring of Baium'],
  },
  {
    bossId: 94081, nameEn: 'Zaken', nameTh: 'ซาเคน (Zaken)',
    level: 85, tier: 'Grand Boss', locationEn: 'Parnassus',
    locationTh: 'Parnassus',
    teleportEn: 'Alt+B → Zaken 1 / Zaken 2',
    teleportTh: 'Alt+B → ZAKEN 1 หรือ ZAKEN 2',
    status: 'unknown', lastKill: null, nextSpawnWindow: null,
    respawnRuleEn: 'Daily 20:00 (Asia/Bangkok): randomly selected Queen Ant, Baium or Zaken',
    respawnRuleTh: 'สุ่มบอส Queen Ant, Baium หรือ Zaken เพียง 1 ตัวต่อวัน เวลา 20:00 น.',
    keyDrops: ['Earring of Zaken'],
  },
];

export const HIGH_FIVE_TVT_EVENT: TvtEventDto = {
  eventNameEn: 'L2Blitz Team vs Team', eventNameTh: 'กิจกรรมทีมปะทะทีม (TvT)',
  format: 'Blue vs Red — Coliseum',
  scheduleTimes: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
  registrationRuleTh: 'เปิดรับสมัครก่อนเริ่มแข่ง 5 นาที สมัครที่ NPC กิจกรรมในเกม',
  registrationRuleEn: 'Registration opens 5 minutes before each match. Register with the event NPC in-game.',
  arenaEn: 'Coliseum', arenaTh: 'สนามโคลอสเซียม',
  levelRequirement: 20,
  restrictionsTh: [
    'ต้องมีอย่างน้อย 4 คน (ทีมละ 2 คน) จึงเริ่มการแข่งขันได้',
    'การจ่ายรางวัลขึ้นอยู่กับจำนวนผู้เล่นและเงื่อนไขการเข้าร่วมจริง',
    'มีระบบตรวจจับการยืนนิ่งและป้องกันการเก็บแต้มซ้ำ',
  ],
  restrictionsEn: [
    'At least 4 players (2 per team) are required to start',
    'Payout is scaled by team size and valid participation',
    'AFK and repeated-kill protections apply',
  ],
  rewardsNoteTh: 'รางวัล TvT: 2v2 ชนะ 25M แพ้ 12.5M; 3v3 ชนะ 50M แพ้ 25M; 4v4 ขึ้นไป ชนะ 100M แพ้ 50M Adena · ผู้สังหารสูงสุดได้รับโบนัสตามขนาดทีม · มีเงื่อนไขการเข้าร่วมและเพดานรับรางวัลต่อวัน',
  rewardsNoteEn: 'TvT prizes: 2v2 winner 25M / loser 12.5M; 3v3 winner 50M / loser 25M; 4v4+ winner 100M / loser 50M Adena. MVP bonus varies by team size. Participation rules and daily reward cap apply.',
  recentResults: [], resultsVerified: false,
};
