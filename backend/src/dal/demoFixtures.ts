import {
  type PlayerRankingItem,
  type ClanRankingItem,
  type OlympiadHeroItem,
  type CastleItem,
  type RaidBossItem,
} from '../../../shared/schema.js';
import { getClassName } from '../../../shared/l2Classes.js';
import { L2BLITZ_BOSS_CATALOG } from '../../../shared/staticGameContent.js';

/**
 * Demo Fixture Data — Used ONLY when DEMO_MODE=true in Development/Test mode.
 * Clearly labeled with `meta.isDemo = true` and `meta.mode = 'demo'` so users and developers
 * never mistake demo fixtures for live L2Blitz production numbers.
 */
export const DEMO_SERVER_STATS = {
  playersOnline: 342,
  offlineTraders: 48,
  totalAccounts: 2890,
  totalCharacters: 4615,
  totalClans: 68,
  maxLevelCount: 3810, // Lv 85 in High Five
  noblesseCount: 1940,
  activeHeroesCount: 34,
  nextSiege: {
    castleName: 'Aden',
    siegeDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
  },
};

export const DEMO_PVP_PLAYERS: PlayerRankingItem[] = [
  { rank: 1, charName: 'Zephyros', level: 85, classId: 131, className: getClassName(131), clanName: 'SiamVanguard', flagKills: 2845, pkKills: 42, fame: 98500, online: true, nobless: true },
  { rank: 2, charName: 'ValkyrieTH', level: 85, classId: 134, className: getClassName(134), clanName: 'SiamVanguard', flagKills: 2610, pkKills: 18, fame: 87400, online: true, nobless: true },
  { rank: 3, charName: 'KratosH5', level: 85, classId: 88, className: getClassName(88), clanName: 'ApexPredators', flagKills: 2390, pkKills: 105, fame: 76200, online: true, nobless: true },
  { rank: 4, charName: 'Nocturne', level: 85, classId: 110, className: getClassName(110), clanName: 'ApexPredators', flagKills: 2154, pkKills: 89, fame: 69000, online: false, nobless: true },
  { rank: 5, charName: 'AegisKnight', level: 85, classId: 90, className: getClassName(90), clanName: 'SiamVanguard', flagKills: 1988, pkKills: 5, fame: 94100, online: true, nobless: true },
  { rank: 6, charName: 'ShadowStep', level: 85, classId: 108, className: getClassName(108), clanName: 'NightStalkers', flagKills: 1875, pkKills: 312, fame: 54300, online: true, nobless: true },
  { rank: 7, charName: 'Lumina', level: 85, classId: 97, className: getClassName(97), clanName: 'SiamVanguard', flagKills: 1740, pkKills: 2, fame: 88900, online: true, nobless: true },
  { rank: 8, charName: 'Ragnarok', level: 85, classId: 113, className: getClassName(113), clanName: 'IronBlood', flagKills: 1682, pkKills: 64, fame: 61200, online: false, nobless: true },
  { rank: 9, charName: 'SoulReaperTH', level: 85, classId: 132, className: getClassName(132), clanName: 'ApexPredators', flagKills: 1590, pkKills: 47, fame: 58400, online: true, nobless: true },
  { rank: 10, charName: 'ArtemisBow', level: 85, classId: 92, className: getClassName(92), clanName: 'NightStalkers', flagKills: 1495, pkKills: 29, fame: 49800, online: true, nobless: true },
  { rank: 11, charName: 'MysticFrost', level: 85, classId: 103, className: getClassName(103), clanName: 'SiamVanguard', flagKills: 1420, pkKills: 11, fame: 52100, online: false, nobless: true },
  { rank: 12, charName: 'KhavatariFist', level: 85, classId: 114, className: getClassName(114), clanName: 'IronBlood', flagKills: 1365, pkKills: 77, fame: 46500, online: true, nobless: true },
  { rank: 13, charName: 'JudicatorX', level: 85, classId: 136, className: getClassName(136), clanName: 'SiamVanguard', flagKills: 1280, pkKills: 8, fame: 71000, online: true, nobless: true },
  { rank: 14, charName: 'ArchmageFire', level: 85, classId: 94, className: getClassName(94), clanName: 'ApexPredators', flagKills: 1210, pkKills: 55, fame: 43200, online: false, nobless: true },
  { rank: 15, charName: 'WindRunnerTH', level: 85, classId: 101, className: getClassName(101), clanName: 'NightStalkers', flagKills: 1150, pkKills: 190, fame: 39400, online: true, nobless: true },
];

export const DEMO_PK_PLAYERS: PlayerRankingItem[] = [
  { rank: 1, charName: 'CrimsonExecutioner', level: 85, classId: 108, className: getClassName(108), clanName: 'RedSkulls', flagKills: 940, pkKills: 842, fame: 21000, online: true, nobless: true },
  { rank: 2, charName: 'VenomDagger', level: 85, classId: 93, className: getClassName(93), clanName: 'RedSkulls', flagKills: 815, pkKills: 695, fame: 18500, online: true, nobless: true },
  { rank: 3, charName: 'DarkPhantom', level: 85, classId: 109, className: getClassName(109), clanName: 'NightStalkers', flagKills: 1120, pkKills: 530, fame: 34200, online: false, nobless: true },
  { rank: 4, charName: 'BloodBerserker', level: 85, classId: 131, className: getClassName(131), clanName: 'RedSkulls', flagKills: 780, pkKills: 468, fame: 15900, online: true, nobless: true },
  { rank: 5, charName: 'ShadowStep', level: 85, classId: 108, className: getClassName(108), clanName: 'NightStalkers', flagKills: 1875, pkKills: 312, fame: 54300, online: true, nobless: true },
  { rank: 6, charName: 'SoulTakerPK', level: 85, classId: 95, className: getClassName(95), clanName: 'RedSkulls', flagKills: 640, pkKills: 289, fame: 19400, online: false, nobless: true },
  { rank: 7, charName: 'WindRunnerTH', level: 85, classId: 101, className: getClassName(101), clanName: 'NightStalkers', flagKills: 1150, pkKills: 190, fame: 39400, online: true, nobless: true },
  { rank: 8, charName: 'KratosH5', level: 85, classId: 88, className: getClassName(88), clanName: 'ApexPredators', flagKills: 2390, pkKills: 105, fame: 76200, online: true, nobless: true },
  { rank: 9, charName: 'Nocturne', level: 85, classId: 110, className: getClassName(110), clanName: 'ApexPredators', flagKills: 2154, pkKills: 89, fame: 69000, online: false, nobless: true },
  { rank: 10, charName: 'KhavatariFist', level: 85, classId: 114, className: getClassName(114), clanName: 'IronBlood', flagKills: 1365, pkKills: 77, fame: 46500, online: true, nobless: true },
];

export const DEMO_CLANS: ClanRankingItem[] = [
  { rank: 1, clanId: 268435456, clanName: 'SiamVanguard', clanLevel: 11, reputationScore: 485200, leaderName: 'Zephyros', allyName: 'RoyalThai', memberCount: 118, castleName: 'Aden' },
  { rank: 2, clanId: 268435457, clanName: 'ApexPredators', clanLevel: 11, reputationScore: 392400, leaderName: 'KratosH5', allyName: 'Dominion', memberCount: 104, castleName: 'Rune' },
  { rank: 3, clanId: 268435458, clanName: 'NightStalkers', clanLevel: 10, reputationScore: 274100, leaderName: 'ShadowStep', allyName: 'Dominion', memberCount: 86, castleName: 'Giran' },
  { rank: 4, clanId: 268435459, clanName: 'IronBlood', clanLevel: 10, reputationScore: 218900, leaderName: 'Ragnarok', allyName: 'RoyalThai', memberCount: 79, castleName: 'Goddard' },
  { rank: 5, clanId: 268435460, clanName: 'RedSkulls', clanLevel: 9, reputationScore: 145000, leaderName: 'CrimsonExecutioner', allyName: null, memberCount: 54, castleName: null },
  { rank: 6, clanId: 268435461, clanName: 'ImmortalLotus', clanLevel: 9, reputationScore: 119500, leaderName: 'GrandDominator', allyName: null, memberCount: 48, castleName: 'Schuttgart' },
];

export const DEMO_HEROES: OlympiadHeroItem[] = [
  { charName: 'Zephyros', classId: 131, className: getClassName(131), level: 85, clanName: 'SiamVanguard', heroCount: 4, message: 'L2Blitz High Five — See you at LOA PvP!' },
  { charName: 'ValkyrieTH', classId: 134, className: getClassName(134), level: 85, clanName: 'SiamVanguard', heroCount: 3, message: 'Kamael Trickster Pride!' },
  { charName: 'KratosH5', classId: 88, className: getClassName(88), level: 85, clanName: 'ApexPredators', heroCount: 5, message: 'Triple Sonic Slash!' },
  { charName: 'AegisKnight', classId: 90, className: getClassName(90), level: 85, clanName: 'SiamVanguard', heroCount: 2, message: 'For SiamVanguard!' },
  { charName: 'Lumina', classId: 97, className: getClassName(97), level: 85, clanName: 'SiamVanguard', heroCount: 4, message: 'Cleanse & Balance Life!' },
  { charName: 'Nocturne', classId: 110, className: getClassName(110), level: 85, clanName: 'ApexPredators', heroCount: 3, message: 'Empower Max!' },
  { charName: 'SoulReaperTH', classId: 132, className: getClassName(132), level: 85, clanName: 'ApexPredators', heroCount: 2, message: 'Steal Divinity!' },
  { charName: 'JudicatorX', classId: 136, className: getClassName(136), level: 85, clanName: 'SiamVanguard', heroCount: 1, message: 'Appetite for Destruction ready.' },
];

export const DEMO_CASTLES: CastleItem[] = [
  { id: 1, name: 'Gludio', ownerClan: null, leaderName: null, allyName: null, taxPercent: 0, siegeDate: Date.now() + 3 * 86400000 },
  { id: 2, name: 'Dion', ownerClan: null, leaderName: null, allyName: null, taxPercent: 0, siegeDate: Date.now() + 3 * 86400000 },
  { id: 3, name: 'Giran', ownerClan: 'NightStalkers', leaderName: 'ShadowStep', allyName: 'Dominion', taxPercent: 15, siegeDate: Date.now() + 3 * 86400000 },
  { id: 4, name: 'Oren', ownerClan: null, leaderName: null, allyName: null, taxPercent: 0, siegeDate: Date.now() + 3 * 86400000 },
  { id: 5, name: 'Aden', ownerClan: 'SiamVanguard', leaderName: 'Zephyros', allyName: 'RoyalThai', taxPercent: 15, siegeDate: Date.now() + 3 * 86400000 },
  { id: 6, name: 'Innadril', ownerClan: null, leaderName: null, allyName: null, taxPercent: 0, siegeDate: Date.now() + 3 * 86400000 },
  { id: 7, name: 'Goddard', ownerClan: 'IronBlood', leaderName: 'Ragnarok', allyName: 'RoyalThai', taxPercent: 10, siegeDate: Date.now() + 3 * 86400000 },
  { id: 8, name: 'Rune', ownerClan: 'ApexPredators', leaderName: 'KratosH5', allyName: 'Dominion', taxPercent: 15, siegeDate: Date.now() + 3 * 86400000 },
  { id: 9, name: 'Schuttgart', ownerClan: 'ImmortalLotus', leaderName: 'GrandDominator', allyName: null, taxPercent: 10, siegeDate: Date.now() + 3 * 86400000 },
];

export function buildDemoRaidBosses(): RaidBossItem[] {
  const now = Date.now();
  return Object.values(L2BLITZ_BOSS_CATALOG).map((meta, idx) => {
    // Demonstrate Alive, Dead (with real DB respawn_time), and Unknown (never guessed!)
    const stateCycle = idx % 3;
    const status = stateCycle === 0 ? 'alive' : stateCycle === 1 ? 'dead' : 'unknown';

    return {
      bossId: meta.bossId,
      name: meta.name,
      level: meta.level,
      category: meta.category,
      image: meta.image,
      location: meta.locationTh,
      teleportInfo: meta.teleportInfoTh,
      status,
      lastKillTime: status === 'dead' ? now - 14 * 3600 * 1000 : null,
      // Strictly never guess spawn window if unknown or alive
      nextSpawnWindowStart: status === 'dead' ? now + 34 * 3600 * 1000 : null,
      nextSpawnWindowEnd: status === 'dead' ? now + 58 * 3600 * 1000 : null,
      respawnRuleText: meta.respawnRuleTh,
      customRuleWarning: meta.customRuleWarningTh,
      isCustomTeleport: meta.isCustomTeleport,
    };
  });
}
