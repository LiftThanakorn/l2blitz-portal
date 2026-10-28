export interface BossStaticMeta {
  bossId: number;
  name: string;
  level: number;
  category: 'grand_boss' | 'field_boss' | 'instance_boss';
  image?: string;
  locationTh: string;
  locationEn: string;
  teleportInfoTh: string;
  teleportInfoEn: string;
  respawnRuleTh: string;
  respawnRuleEn: string;
  customRuleWarningTh: string | null;
  customRuleWarningEn: string | null;
  isCustomTeleport: boolean;
}

/**
 * Static Boss Metadata for L2J Mobius High Five (CT 2.6).
 * Since L2J Mobius SQL tables (`grandboss_data`, `raidboss_spawnlist`) store only `boss_id`
 * and spawn/HP/status fields (names and levels reside in GameServer XML),
 * this lookup table maps `boss_id` to verified High Five names, levels, and L2Blitz policies.
 */
export const L2BLITZ_BOSS_CATALOG: Record<number, BossStaticMeta> = {
  29001: {
    bossId: 29001,
    name: 'Queen Ant',
    level: 40,
    category: 'grand_boss',
    image: '/images/bosses/queen-ant.jpg',
    locationTh: 'The Ant Nest (รังมด ชั้นใน)',
    locationEn: 'The Ant Nest (Inner Chamber)',
    teleportInfoTh: 'Community Board (Alt+B) > Teleport > Grand Boss > Queen Ant (จุดวาร์ปปรับแต่งพิเศษ)',
    teleportInfoEn: 'Community Board (Alt+B) > Teleport > Grand Boss > Queen Ant (Custom Warp Point)',
    respawnRuleTh: 'นโยบาย L2Blitz: เกิดใหม่ภายใน 2–3 วันหลังตาย (รอตรวจสอบค่าชั่วโมงสุ่มจาก GameServer จริง)',
    respawnRuleEn: 'L2Blitz Policy: Respawns within 2–3 days after death (exact random window pending live GameServer verification)',
    customRuleWarningTh: 'มีการปรับจุดวาร์ปเข้าหน้าห้องบอส Queen Ant — รอตรวจสอบพิกัดและเงื่อนไขเลเวลจาก GameServer จริง',
    customRuleWarningEn: 'Custom warp point configured for Queen Ant — exact coordinates & level restrictions pending live GameServer verification',
    isCustomTeleport: true,
  },
  29006: {
    bossId: 29006,
    name: 'Core',
    level: 50,
    category: 'grand_boss',
    locationTh: 'Cruma Tower ชั้น 3 (ห้องแกนกลาง)',
    locationEn: 'Cruma Tower 3rd Floor (Core Room)',
    teleportInfoTh: 'Community Board (Alt+B) > Teleport > Grand Boss > Core',
    teleportInfoEn: 'Community Board (Alt+B) > Teleport > Grand Boss > Core',
    respawnRuleTh: 'นโยบาย L2Blitz: เกิดใหม่ภายใน 2–3 วันหลังตาย (อ่านค่าจริงจาก grandboss_data)',
    respawnRuleEn: 'L2Blitz Policy: Respawns within 2–3 days after death (synced from grandboss_data)',
    customRuleWarningTh: null,
    customRuleWarningEn: null,
    isCustomTeleport: false,
  },
  29014: {
    bossId: 29014,
    name: 'Orfen',
    level: 50,
    category: 'grand_boss',
    locationTh: 'Sea of Spores (ทะเลสปอร์)',
    locationEn: 'Sea of Spores',
    teleportInfoTh: 'Community Board (Alt+B) > Teleport > Grand Boss > Orfen',
    teleportInfoEn: 'Community Board (Alt+B) > Teleport > Grand Boss > Orfen',
    respawnRuleTh: 'นโยบาย L2Blitz: เกิดใหม่ภายใน 2–3 วันหลังตาย (อ่านค่าจริงจาก grandboss_data)',
    respawnRuleEn: 'L2Blitz Policy: Respawns within 2–3 days after death (synced from grandboss_data)',
    customRuleWarningTh: null,
    customRuleWarningEn: null,
    isCustomTeleport: false,
  },
  29020: {
    bossId: 29020,
    name: 'Baium',
    level: 75,
    category: 'grand_boss',
    image: '/images/bosses/baium.jpg',
    locationTh: 'Tower of Insolence ชั้น 14 (หอคอยโอมาน)',
    locationEn: 'Tower of Insolence 14th Floor',
    teleportInfoTh: 'Community Board (Alt+B) > Teleport > Grand Boss > Baium (จุดวาร์ปปรับแต่งพิเศษหน้า Angelic Vortex)',
    teleportInfoEn: 'Community Board (Alt+B) > Teleport > Grand Boss > Baium (Custom Warp near Angelic Vortex)',
    respawnRuleTh: 'นโยบาย L2Blitz: เกิดใหม่ภายใน 2–3 วันหลังตาย (รอตรวจสอบค่าสุ่มจาก GameServer จริง)',
    respawnRuleEn: 'L2Blitz Policy: Respawns within 2–3 days after death (exact window pending live GameServer verification)',
    customRuleWarningTh: 'มีการปรับจุดวาร์ปและเงื่อนไขการเข้าห้อง Baium — รอตรวจสอบจาก GameServer จริงว่าต้องใช้ Blooded Fabric หรือไม่',
    customRuleWarningEn: 'Custom teleport & entry rule for Baium — pending live GameServer check whether Blooded Fabric is required',
    isCustomTeleport: true,
  },
  29068: {
    bossId: 29068,
    name: 'Antharas',
    level: 85,
    category: 'grand_boss',
    image: '/images/bosses/antharas.jpg',
    locationTh: 'Antharas\' Lair (Heart of Warding)',
    locationEn: 'Antharas\' Lair (Heart of Warding)',
    teleportInfoTh: 'Community Board (Alt+B) > Teleport > Grand Boss > Heart of Warding',
    teleportInfoEn: 'Community Board (Alt+B) > Teleport > Grand Boss > Heart of Warding',
    respawnRuleTh: 'นโยบาย L2Blitz: เกิดใหม่ภายใน 2–3 วันหลังตาย (อ่านค่าจริงจาก grandboss_data)',
    respawnRuleEn: 'L2Blitz Policy: Respawns within 2–3 days after death (synced from grandboss_data)',
    customRuleWarningTh: 'รอตรวจสอบการตั้งค่า Portal Stone และจำนวนคนขั้นต่ำจาก GameServer จริง',
    customRuleWarningEn: 'Pending live GameServer check for Portal Stone requirement and minimum party size',
    isCustomTeleport: false,
  },
  29028: {
    bossId: 29028,
    name: 'Valakas',
    level: 85,
    category: 'grand_boss',
    image: '/images/bosses/valakas.jpg',
    locationTh: 'Forge of the Gods (Klein / Hall of Flames)',
    locationEn: 'Forge of the Gods (Hall of Flames)',
    teleportInfoTh: 'Community Board (Alt+B) > Teleport > Grand Boss > Forge of the Gods (Klein)',
    teleportInfoEn: 'Community Board (Alt+B) > Teleport > Grand Boss > Forge of the Gods (Klein)',
    respawnRuleTh: 'นโยบาย L2Blitz: เกิดใหม่ภายใน 2–3 วันหลังตาย (อ่านค่าจริงจาก grandboss_data)',
    respawnRuleEn: 'L2Blitz Policy: Respawns within 2–3 days after death (synced from grandboss_data)',
    customRuleWarningTh: 'รอตรวจสอบเงื่อนไข Floating Stone จาก GameServer จริง',
    customRuleWarningEn: 'Pending live GameServer verification for Floating Stone requirement',
    isCustomTeleport: false,
  },
  29118: {
    bossId: 29118,
    name: 'Beleth',
    level: 83,
    category: 'grand_boss',
    locationTh: 'Hellbound Island (Tully\'s Workshop / Naia)',
    locationEn: 'Hellbound Island (Tower of Naia)',
    teleportInfoTh: 'Community Board (Alt+B) > Teleport > Hellbound > Beleth Entry',
    teleportInfoEn: 'Community Board (Alt+B) > Teleport > Hellbound > Beleth Entry',
    respawnRuleTh: 'นโยบาย L2Blitz: เกิดใหม่ภายใน 2–3 วันหลังตาย (อ่านค่าจริงจาก grandboss_data)',
    respawnRuleEn: 'L2Blitz Policy: Respawns within 2–3 days after death (synced from grandboss_data)',
    customRuleWarningTh: 'รอตรวจสอบว่าเปิดใช้งานโซน Hellbound ขั้นสูงสุดอัตโนมัติหรือไม่',
    customRuleWarningEn: 'Pending verification of automatic max Hellbound stage in live GameServer',
    isCustomTeleport: true,
  },
  25325: {
    bossId: 25325,
    name: 'Flame of Splendor Barakiel',
    level: 70,
    category: 'field_boss',
    locationTh: 'Valley of Saints (หุบเขานักบุญ)',
    locationEn: 'Valley of Saints',
    teleportInfoTh: 'Community Board (Alt+B) > Teleport > Raid Boss > Barakiel (Noblesse)',
    teleportInfoEn: 'Community Board (Alt+B) > Teleport > Raid Boss > Barakiel (Noblesse)',
    respawnRuleTh: 'อ้างอิงตาราง raidboss_spawnlist (ห้ามคาดเดาเวลาเกิดหากไม่มีข้อมูลใน DB)',
    respawnRuleEn: 'Synced from raidboss_spawnlist (never estimated if DB timestamp is absent)',
    customRuleWarningTh: null,
    customRuleWarningEn: null,
    isCustomTeleport: true,
  },
  25299: {
    bossId: 25299,
    name: 'Ketra\'s Hero Hekaton',
    level: 80,
    category: 'field_boss',
    locationTh: 'Ketra Orc Outpost',
    locationEn: 'Ketra Orc Outpost',
    teleportInfoTh: 'Community Board (Alt+B) > Teleport > Raid Boss > Ketra Outpost',
    teleportInfoEn: 'Community Board (Alt+B) > Teleport > Raid Boss > Ketra Outpost',
    respawnRuleTh: 'อ้างอิงตาราง raidboss_spawnlist (12–24 ชั่วโมง หรือตามค่าตั้งจริงของเซิร์ฟเวอร์)',
    respawnRuleEn: 'Synced from raidboss_spawnlist (12–24h or custom server config)',
    customRuleWarningTh: null,
    customRuleWarningEn: null,
    isCustomTeleport: false,
  },
  25309: {
    bossId: 25309,
    name: 'Varka\'s Hero Shadith',
    level: 80,
    category: 'field_boss',
    locationTh: 'Varka Silenos Stronghold',
    locationEn: 'Varka Silenos Stronghold',
    teleportInfoTh: 'Community Board (Alt+B) > Teleport > Raid Boss > Varka Stronghold',
    teleportInfoEn: 'Community Board (Alt+B) > Teleport > Raid Boss > Varka Stronghold',
    respawnRuleTh: 'อ้างอิงตาราง raidboss_spawnlist (12–24 ชั่วโมง หรือตามค่าตั้งจริงของเซิร์ฟเวอร์)',
    respawnRuleEn: 'Synced from raidboss_spawnlist (12–24h or custom server config)',
    customRuleWarningTh: null,
    customRuleWarningEn: null,
    isCustomTeleport: false,
  },
  25701: {
    bossId: 25701,
    name: 'Anakim (High Five Field)',
    level: 84,
    category: 'field_boss',
    locationTh: 'Disciples Necropolis',
    locationEn: 'Disciples Necropolis',
    teleportInfoTh: 'Community Board (Alt+B) > Teleport > Raid Boss > Anakim',
    teleportInfoEn: 'Community Board (Alt+B) > Teleport > Raid Boss > Anakim',
    respawnRuleTh: 'อ้างอิงตาราง raidboss_spawnlist (อ่านค่าจริงจากฐานข้อมูล)',
    respawnRuleEn: 'Synced from raidboss_spawnlist (read directly from database)',
    customRuleWarningTh: null,
    customRuleWarningEn: null,
    isCustomTeleport: false,
  },
  25702: {
    bossId: 25702,
    name: 'Lilith (High Five Field)',
    level: 84,
    category: 'field_boss',
    locationTh: 'Saint\'s Necropolis',
    locationEn: 'Saint\'s Necropolis',
    teleportInfoTh: 'Community Board (Alt+B) > Teleport > Raid Boss > Lilith',
    teleportInfoEn: 'Community Board (Alt+B) > Teleport > Raid Boss > Lilith',
    respawnRuleTh: 'อ้างอิงตาราง raidboss_spawnlist (อ่านค่าจริงจากฐานข้อมูล)',
    respawnRuleEn: 'Synced from raidboss_spawnlist (read directly from database)',
    customRuleWarningTh: null,
    customRuleWarningEn: null,
    isCustomTeleport: false,
  },
};

export interface FarmZoneStaticItem {
  id: string;
  nameTh: string;
  nameEn: string;
  image?: string;
  difficulty: 'Starter' | 'Mid-Tier' | 'High-Tier' | 'Party PvP';
  recommendedLevel: string;
  combatType: 'Solo / AutoFarm' | 'Party / PvP Flag' | 'Solo High-Rate';
  teleportPathTh: string;
  teleportPathEn: string;
  autoFarmAllowed: boolean;
  autoFarmNoteTh: string;
  autoFarmNoteEn: string;
  adenaRewardRange: string;
  monsters: Array<{
    npcId: number;
    name: string;
    level: number;
    hpMultiplier: string;
    aggro: boolean;
    element: string;
  }>;
  drops: Array<{
    itemId: number;
    itemName: string;
    category: 'Currency' | 'Enchant' | 'Element' | 'Craft Material';
    chanceNote: string;
  }>;
  pendingXmlSync: boolean;
}

export const L2BLITZ_FARM_ZONES: FarmZoneStaticItem[] = [
  {
    id: 'varka-ketra-blitz',
    nameTh: 'โซนฟาร์มเริ่มต้น — Varka & Ketra Outpost',
    nameEn: 'Starter Farm Zone — Varka & Ketra Outpost',
    image: '/images/zones/varka-ketra.jpg',
    difficulty: 'Starter',
    recommendedLevel: 'Lv. 80–85 (Starter Gear)',
    combatType: 'Solo / AutoFarm',
    teleportPathTh: 'Alt+B > Teleport > Farm Zones > Starter Zone (Safe PvP)',
    teleportPathEn: 'Alt+B > Teleport > Farm Zones > Starter Zone (Safe PvP)',
    autoFarmAllowed: true,
    autoFarmNoteTh: 'รองรับคำสั่ง .autofarm เต็มรูปแบบ มอนสเตอร์เกิดไว ไม่รุมโจมตี (Non-Aggro)',
    autoFarmNoteEn: 'Full .autofarm support. Fast respawn, non-aggressive monsters.',
    adenaRewardRange: '150,000 – 280,000 Adena / ตัว (รอซิงก์ XML จริง)',
    monsters: [
      { npcId: 21350, name: 'Ketra Orc Footman (Custom H5)', level: 83, hpMultiplier: 'x1', aggro: false, element: 'Fire 150' },
      { npcId: 21353, name: 'Ketra Orc Scout (Custom H5)', level: 83, hpMultiplier: 'x1', aggro: false, element: 'Fire 150' },
      { npcId: 21375, name: 'Varka Silenos Recruit (Custom H5)', level: 83, hpMultiplier: 'x1', aggro: false, element: 'Wind 150' },
    ],
    drops: [
      { itemId: 57, itemName: 'Adena', category: 'Currency', chanceNote: '100% (Drop Rate x50)' },
      { itemId: 4037, itemName: 'Coin of Luck / Farm Coin', category: 'Currency', chanceNote: '35% – 50% (รอตรวจ XML จริง)' },
      { itemId: 9546, itemName: 'Fire/Wind Stone (Element)', category: 'Element', chanceNote: '12%' },
      { itemId: 959, itemName: 'Scroll: Enchant Weapon (S-Grade)', category: 'Enchant', chanceNote: '5%' },
    ],
    pendingXmlSync: true,
  },
  {
    id: 'hellbound-battered-chimera',
    nameTh: 'โซนฟาร์มคิเมร่า — Hellbound (Battered Lands)',
    nameEn: 'Chimera Hunting Zone — Hellbound (Battered Lands)',
    image: '/images/zones/hellbound-chimera.jpg',
    difficulty: 'High-Tier',
    recommendedLevel: 'Lv. 85 (Full Attribute 150+ / Magic Bottle)',
    combatType: 'Solo / AutoFarm',
    teleportPathTh: 'Alt+B > Teleport > Farm Zones > Hellbound > Battered Lands',
    teleportPathEn: 'Alt+B > Teleport > Farm Zones > Hellbound > Battered Lands',
    autoFarmAllowed: true,
    autoFarmNoteTh: 'รองรับ .autofarm สามารถตั้งเก็บ Life Force เมื่อมอนสเตอร์ใกล้ตาย (หรือปรับเป็น Drop ปกติ)',
    autoFarmNoteEn: '.autofarm supported. Optimal for harvesting Life Forces and S80/S84 craft materials.',
    adenaRewardRange: '450,000 – 850,000 Adena / ตัว (รอซิงก์ XML จริง)',
    monsters: [
      { npcId: 22350, name: 'Chimera of Fire', level: 85, hpMultiplier: 'x3', aggro: true, element: 'Fire 250' },
      { npcId: 22351, name: 'Chimera of Wind', level: 85, hpMultiplier: 'x3', aggro: true, element: 'Wind 250' },
      { npcId: 22352, name: 'Chimera of Darkness', level: 85, hpMultiplier: 'x3', aggro: true, element: 'Dark 280' },
    ],
    drops: [
      { itemId: 57, itemName: 'Adena', category: 'Currency', chanceNote: '100%' },
      { itemId: 9691, itemName: 'Life Force (Hellbound Craft)', category: 'Craft Material', chanceNote: '40% – 60%' },
      { itemId: 9547, itemName: 'Water/Earth/Fire Element Stone', category: 'Element', chanceNote: '22%' },
      { itemId: 9553, itemName: 'Elemental Crystal (Fire/Wind)', category: 'Element', chanceNote: '8.5%' },
    ],
    pendingXmlSync: true,
  },
  {
    id: 'dragon-valley-h5',
    nameTh: 'โซนฟาร์มระดับกลาง — Dragon Valley (High Five)',
    nameEn: 'Mid-Tier Farm Zone — Dragon Valley (High Five)',
    image: '/images/zones/dragon-valley.jpg',
    difficulty: 'Mid-Tier',
    recommendedLevel: 'Lv. 85 (Vorpals / Elegia Starter)',
    combatType: 'Solo High-Rate',
    teleportPathTh: 'Alt+B > Teleport > Farm Zones > Dragon Valley North/South',
    teleportPathEn: 'Alt+B > Teleport > Farm Zones > Dragon Valley North/South',
    autoFarmAllowed: true,
    autoFarmNoteTh: 'ใช้งาน .autofarm ได้ แนะนำให้เปิด Auto-Potion (CP/HP/MP) เนื่องจากมอนสเตอร์มีสกิลโจมตีธาตุ',
    autoFarmNoteEn: '.autofarm enabled. Enable Auto-Potion (CP/HP/MP) due to elemental monster skills.',
    adenaRewardRange: '350,000 – 650,000 Adena / ตัว (รอซิงก์ XML จริง)',
    monsters: [
      { npcId: 22822, name: 'Drakos Warrior', level: 84, hpMultiplier: 'x2', aggro: true, element: 'Dark 200' },
      { npcId: 22823, name: 'Drakos Assassin', level: 84, hpMultiplier: 'x2', aggro: true, element: 'Wind 200' },
      { npcId: 22829, name: 'Emerald Drake', level: 85, hpMultiplier: 'x2.5', aggro: true, element: 'Earth 220' },
    ],
    drops: [
      { itemId: 57, itemName: 'Adena', category: 'Currency', chanceNote: '100%' },
      { itemId: 6577, itemName: 'Blessed Scroll: Enchant Weapon (S)', category: 'Enchant', chanceNote: '4.5% (รอตรวจ XML จริง)' },
      { itemId: 6578, itemName: 'Blessed Scroll: Enchant Armor (S)', category: 'Enchant', chanceNote: '8.0%' },
      { itemId: 9552, itemName: 'Elemental Crystal Box', category: 'Element', chanceNote: '6.0%' },
    ],
    pendingXmlSync: true,
  },
  {
    id: 'loa-pvp-craft-zone',
    nameTh: 'โซนฟาร์มระดับสูง & PvP Craft — Lair of Antharas (LOA)',
    nameEn: 'High-Tier & PvP Craft Zone — Lair of Antharas (LOA)',
    image: '/images/zones/lair-of-antharas.jpg',
    difficulty: 'Party PvP',
    recommendedLevel: 'Lv. 85 (Full Attribute 300 / Party Recommended)',
    combatType: 'Party / PvP Flag',
    teleportPathTh: 'Alt+B > Teleport > Farm Zones > Lair of Antharas (PvP Hotzone)',
    teleportPathEn: 'Alt+B > Teleport > Farm Zones > Lair of Antharas (PvP Hotzone)',
    autoFarmAllowed: false,
    autoFarmNoteTh: 'จำกัดหรือปิด AutoFarm ในพื้นที่ PvP เข้มข้น เพื่อส่งเสริมการควบคุมตัวละครและการปะทะจริง (รอตรวจ Config จริง)',
    autoFarmNoteEn: 'AutoFarm restricted in high-intensity PvP zone to encourage active combat (pending live config verification).',
    adenaRewardRange: '800,000 – 1,500,000 Adena / ตัว (รอซิงก์ XML จริง)',
    monsters: [
      { npcId: 22854, name: 'Bloody Karinness', level: 85, hpMultiplier: 'x4', aggro: true, element: 'Dark 300' },
      { npcId: 22855, name: 'Bloody Rikasha', level: 85, hpMultiplier: 'x4', aggro: true, element: 'Fire 300' },
      { npcId: 22856, name: 'Maluk Knight', level: 85, hpMultiplier: 'x5', aggro: true, element: 'Dark 300' },
    ],
    drops: [
      { itemId: 57, itemName: 'Adena', category: 'Currency', chanceNote: '100%' },
      { itemId: 99901, itemName: 'PvP Craft Token (L2Blitz Custom)', category: 'Craft Material', chanceNote: '15% – 25% (รอตรวจ XML จริง)' },
      { itemId: 6622, itemName: 'Giant\'s Codex - Mastery', category: 'Enchant', chanceNote: '10%' },
      { itemId: 22221, itemName: 'Ancient Enchant Scroll (S-Grade)', category: 'Enchant', chanceNote: '1.5%' },
    ],
    pendingXmlSync: true,
  },
];
