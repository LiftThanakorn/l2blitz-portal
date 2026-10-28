import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface FarmZoneSpec {
  id: string;
  nameTh: string;
  nameEn: string;
  levelRange: string;
  modeTh: string;
  modeEn: string;
  teleportTh: string;
  teleportEn: string;
  monsters: {
    nameEn: string;
    nameTh: string;
    level: number;
    traits: string;
  }[];
  dropsTh: string[];
  dropsEn: string[];
  instructionsTh: string;
  instructionsEn: string;
}

const HIGH_FIVE_FARM_ZONES: FarmZoneSpec[] = [
  {
    id: 'dragon-valley',
    nameTh: 'หุบเขามังกร (Dragon Valley · Reworked Lv. 80–85)',
    nameEn: 'Dragon Valley (High Five Reworked Lv. 80–85)',
    levelRange: 'Lv. 80 – 85',
    modeTh: 'โซนฟาร์มเดี่ยวและปาร์ตี้ขนาดเล็ก (รองรับ AutoFarm)',
    modeEn: 'Solo & Small-Party Farm Zone (AutoFarm Supported)',
    teleportTh: 'Alt+B → พื้นที่ฟาร์ม → หุบเขามังกร (ทิศเหนือ / ทิศใต้ / แยกมังกร)',
    teleportEn: 'Alt+B → Farm Zones → Dragon Valley (North / South / Necropolis Fork)',
    monsters: [
      { nameEn: 'Drakos Warrior (NPC 22822)', nameTh: 'นักรบดราคอส', level: 82, traits: 'Dragon / Weak to Dual Swords & Bow' },
      { nameEn: 'Emerald Drake (NPC 22829)', nameTh: 'เอเมอรัลด์เดรค', level: 83, traits: 'Dragon / High Morale Buff Trigger' },
      { nameEn: 'Gem Dragon (NPC 22830)', nameTh: 'มังกรอัญมณี', level: 83, traits: 'Fast Respawn / Vital Herb Drop' },
      { nameEn: 'Dust Rider (NPC 22854)', nameTh: 'ดัสต์ไรเดอร์', level: 84, traits: 'Elite / High Adena & Crystal Yield' },
    ],
    dropsTh: [
      'Adena พื้นฐานอัตราสูง (ค่าตัวคูณสุทธิรอยืนยันจาก XML ของเซิร์ฟเวอร์)',
      'หินธาตุและคริสตัลธาตุระดับ 150 / 300 (Attribute Stones & Crystals)',
      'ชิ้นส่วนและใบสูตรอุปกรณ์ Vorpal / Vesper (S84)',
      'กระดูกมังกรขนาดใหญ่ (Large Dragon Bone) สำหรับเรียกบอส 7 Raid',
    ],
    dropsEn: [
      'High-yield Adena drops (exact custom multiplier pending GameServer XML import)',
      'Elemental Attribute Stones (150) & Crystals (300)',
      'Vesper & Vorpal (S84) equipment materials',
      'Large Dragon Bone (used at Dragon Vortex to summon 7 Raid Bosses)',
    ],
    instructionsTh:
      'เมื่อจัดปาร์ตี้ที่มีสายอาชีพหลากหลายเข้าฟาร์มในหุบเขามังกร จะได้รับบัฟ Morale Boost ช่วยเร่งความเร็วโจมตี คริติคอล และพลังเวทมนตร์ เหมาะสำหรับการเริ่มต้นสะสมอาเดน่าและหินธาตุหลังจากสร้างตัวละครเลเวล 85',
    instructionsEn:
      'Forming balanced parties in Dragon Valley triggers the High Five Morale Boost (Lv. 1–3), substantially increasing Atk.Spd, Casting Spd, and Critical Rate. Ideal entry zone for fresh Lv. 85 characters.',
  },
  {
    id: 'lair-of-antharas',
    nameTh: 'ถ้ำอันธารัส (Lair of Antharas · High Five Endgame)',
    nameEn: 'Lair of Antharas (LoA · High Five Endgame Zone)',
    levelRange: 'Lv. 83 – 85',
    modeTh: 'โซนปาร์ตี้เต็มรูปแบบและการปะทะชิงพื้นที่ (Contested PvP)',
    modeEn: 'Full Party & Contested Clan PvP Zone',
    teleportTh: 'Alt+B → พื้นที่ฟาร์ม → ทางเข้าถ้ำอันธารัส / สะพานข้ามเหว / ใจกลางถ้ำ',
    teleportEn: 'Alt+B → Farm Zones → Lair of Antharas Entrance / Knoriks Bridge / Heart',
    monsters: [
      { nameEn: 'Malruk Knight (NPC 22844)', nameTh: 'อัศวินมัลรุก', level: 84, traits: 'Demon / Heavy Physical Defense' },
      { nameEn: 'Karik (NPC 22853)', nameTh: 'คาริค (มอนสเตอร์ท็อปของถ้ำ)', level: 85, traits: 'Demon / High S84 & PvP Token Drop' },
      { nameEn: 'Bloody Karinness (NPC 22848)', nameTh: 'บลัดดี้คารินเนส', level: 84, traits: 'Aggressive / Group Spawn' },
      { nameEn: 'Knoriks (NPC 22857)', nameTh: 'นอริกส์ (ตัวลาดตระเวน)', level: 85, traits: 'Patrol / Bonus Vorpal & Crystal Drop' },
    ],
    dropsTh: [
      'เหรียญอัปเกรดยุทโธปกรณ์สายปะทะ (PvP Craft Token · รอยืนยันไอดีไอเทม)',
      'ชิ้นส่วนชุดเกราะ Vorpal และวัตถุดิบแลกชุด Elegia',
      'สมุดสกิล Giant’s Codex - Mastery และ Blessed Enchant Scrolls',
      'หิน Life Stone ระดับ 84 (High-Grade / Top-Grade Life Stone Lv. 84)',
    ],
    dropsEn: [
      'PvP Craft Tokens (custom item ID pending GameServer XML sync)',
      'Vorpal armor pieces & Elegia synthesis materials',
      'Giant’s Codex - Mastery & Blessed Enchant Scrolls',
      'High-Grade & Top-Grade Life Stones (Level 84)',
    ],
    instructionsTh:
      'มอนสเตอร์ในถ้ำอันธารัสมีพลังโจมตีสูงและมีสกิลติดสตั๊น/เลือดไหล แนะนำให้จัดปาร์ตี้พร้อมฮีลเลอร์ (Cardinal / Eva’s Saint) และระวังการปะทะกับแคลนคู่อริบริเวณจุดเกิดของมอนสเตอร์ Karik และ Knoriks',
    instructionsEn:
      'Monsters inside Lair of Antharas hit hard and apply bleed/stun debuffs. Bring dedicated healers and prepare for frequent clan skirmishes around high-density Karik and Knoriks rooms.',
  },
  {
    id: 'monastery-of-silence',
    nameTh: 'อารามแห่งความเงียบชั้นบน (Monastery of Silence · Solina)',
    nameEn: 'Monastery of Silence (Upper Floors · High Five)',
    levelRange: 'Lv. 82 – 85',
    modeTh: 'โซนฟาร์มสายหอก (Polearm AoE) และสายเวทมนตร์',
    modeEn: 'Polearm AoE & Magical Farming Sanctum',
    teleportTh: 'Alt+B → พื้นที่ฟาร์ม → อารามแห่งความเงียบ (ชั้น 1 / ชั้น 2 / ห้องสมุด)',
    teleportEn: 'Alt+B → Farm Zones → Monastery of Silence (1F / 2F / Library)',
    monsters: [
      { nameEn: 'Solina Knight (NPC 22789)', nameTh: 'อัศวินโซลินา', level: 83, traits: 'Angel / Weak to Dark Element' },
      { nameEn: 'Divinity Judge (NPC 22794)', nameTh: 'ผู้พิพากษาศักดิ์สิทธิ์', level: 84, traits: 'Angel / Holy Magic Caster' },
      { nameEn: 'Divinity Protector (NPC 22798)', nameTh: 'ผู้พิทักษ์ศักดิ์สิทธิ์', level: 84, traits: 'Social Aggro / Holy Crystal Drop' },
    ],
    dropsTh: [
      'หินธาตุศักดิ์สิทธิ์ (Holy Attribute Stone / Crystal) และอาเดน่าจำนวนมาก',
      'อาวุธและชุดเกราะระดับ S80 / S84 (Moirai / Vesper)',
      'คัมภีร์ปลดล็อกเควสต์บอส Anais และหอสมุดลับ',
    ],
    dropsEn: [
      'Holy Attribute Stones/Crystals & dense Adena drops',
      'S80/S84 Moirai and Vesper weapons and armor',
      'Secret Room keys & Anais raid triggers',
    ],
    instructionsTh:
      'มอนสเตอร์ในอารามชั้นบนแพ้ธาตุมืด (Dark Attribute) อย่างชัดเจน เหมาะสำหรับอาชีพ Dreadnought (Warlord), Doombringer หรือจอมเวท Soultaker / Storm Screamer ที่ฝังธาตุมืด 300',
    instructionsEn:
      'Upper Monastery angels share a pronounced weakness to Dark elemental attacks, making this zone prime territory for 300-Dark Dreadnoughts, Doombringers, and Dark Mages.',
  },
  {
    id: 'seed-of-annihilation',
    nameTh: 'เมล็ดพันธุ์แห่งการทำลายล้าง (Seed of Annihilation · Gracia)',
    nameEn: 'Seed of Annihilation (Gracia Continent · Lv. 84–85)',
    levelRange: 'Lv. 84 – 85',
    modeTh: '3 เขตนิเวศวิทยา (Bistakon / Reptilikon / Cokrakon)',
    modeEn: 'Tri-Biome Endgame Zone (Bistakon / Reptilikon / Cokrakon)',
    teleportTh: 'Alt+B → พื้นที่ฟาร์ม → ทวีปกราเซีย → Seed of Annihilation',
    teleportEn: 'Alt+B → Farm Zones → Gracia → Seed of Annihilation Dock',
    monsters: [
      { nameEn: 'Bgurent (NPC 22746 - Bistakon)', nameTh: 'บีกูเรนท์ (เขตบิสตาคอน)', level: 85, traits: 'Physical Melee Weak' },
      { nameEn: 'Turtleslian (NPC 22754 - Reptilikon)', nameTh: 'เทอร์เทิลเลียน (เขトレปทิลิคอน)', level: 85, traits: 'Bow / Crossbow / Dagger Weak' },
      { nameEn: 'Kanibi (NPC 22760 - Cokrakon)', nameTh: 'คานิบิ (เขตโคคราคอน)', level: 85, traits: 'Magic Damage Weak' },
    ],
    dropsTh: [
      'คริสตัลธาตุระดับ 300 ทุกธาตุ (Elemental Crystals)',
      'ชิ้นส่วนชุดเกราะและอาวุธ Vesper / Vorpal ระดับสูงสุด',
      'อาเดน่าและเหรียญแลกเปลี่ยนพิเศษสำหรับอัปเกรดประดับ',
    ],
    dropsEn: [
      'All 6 Elemental Attribute Crystals (150–300)',
      'Vesper & Vorpal high-tier equipment components',
      'High-density Adena and endgame exchange tokens',
    ],
    instructionsTh:
      'แต่ละเขตใน Seed of Annihilation มีบัฟภูมิภาคที่เอื้อต่อสายอาชีพต่างกัน: Bistakon สำหรับนักรบประชิด, Reptilikon สำหรับนักธนูและมีด, และ Cokrakon สำหรับจอมเวท',
    instructionsEn:
      'Each biome rotates daily field buffs tailored to specific combat archetypes: Bistakon favors melee fighters, Reptilikon favors archers/daggers, and Cokrakon favors mages.',
  },
];

export function FarmZonesPage() {
  const { t } = useLanguage();
  const [selectedZoneId, setSelectedZoneId] = useState<string>(HIGH_FIVE_FARM_ZONES[0].id);

  const activeZone =
    HIGH_FIVE_FARM_ZONES.find((z) => z.id === selectedZoneId) || HIGH_FIVE_FARM_ZONES[0];

  return (
    <div className="editorial-frame pt-10 pb-16">
      {/* Masthead */}
      <div className="editorial-axis-grid items-end pb-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="small-note text-[#E97540] font-semibold m-0">
            {t('คู่มือพื้นที่ฟาร์มและเศรษฐกิจ S84', 'High Five Farming & Economy Guide')}
          </p>
          <p className="body-copy text-[#77736C] mt-3">
            {t(
              'ข้อมูลพื้นที่ฟาร์มหลักในแพตช์ Lineage II High Five รายชื่อมอนสเตอร์ จุดเทเลพอร์ต ไอเทมดรอป และคำแนะนำการจัดสายอาชีพ พร้อมโครงสร้างรองรับการนำเข้าข้อมูลจากไฟล์ XML ของ L2J Mobius โดยตรง',
              'Detailed directory of High Five farming zones, monster NPC IDs, drop tables, teleport paths, and party composition guidelines · structured for direct L2J Mobius XML spawn/droplist import.'
            )}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <h1 className="display-title">
            {t('พื้นที่ฟาร์มอาเดน่า', 'Farm Zones &')}
            <br />
            {t('และวัตถุดิบ S84', 'Drop Tables')}
          </h1>
        </div>
      </div>

      {/* Hero Artwork: Dragon Valley & Lair of Antharas (16:9) */}
      <figure className="m-0 mb-16 surface-stone overflow-hidden max-h-[460px]">
        <picture>
          <source srcSet="/assets/images/farm-zone.webp" type="image/webp" />
          <img
            src="/assets/images/farm-zone.png"
            width={1920}
            height={1080}
            alt={t(
              'ภาพประกอบพื้นที่ฟาร์มหุบเขามังกร Dragon Valley และโครงกระดูกมังกรโบราณ',
              'Dragon Valley limestone canyon with ancient dragon ribcage fossils and Drake silhouettes'
            )}
            className="w-full h-full object-cover block"
          />
        </picture>
      </figure>

      {/* Interactive Farm Zone Selector & Detail Sheet (`data-ui`) */}
      <div data-ui className="surface-white p-6 sm:p-10">
        <div className="flex flex-wrap gap-2 pb-8">
          {HIGH_FIVE_FARM_ZONES.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setSelectedZoneId(z.id)}
              className={`px-5 py-3 text-[15px] font-medium cursor-pointer border-0 transition-colors ${
                selectedZoneId === z.id
                  ? 'bg-[#1A1917] text-[#F7F5F0]'
                  : 'bg-[#F0EDE7] text-[#1A1917] hover:bg-[#E8E3DB]'
              }`}
            >
              {t(z.nameTh, z.nameEn)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Zone Overview, Teleport & Instructions */}
          <div className="lg:col-span-5 surface-stone p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-[#E97540] text-white small-note font-semibold">
                {activeZone.levelRange}
              </span>
              <h2 className="text-[26px] font-semibold text-[#1A1917] mt-4">
                {t(activeZone.nameTh, activeZone.nameEn)}
              </h2>
              <p className="small-note text-[#77736C] mt-1">
                {t(activeZone.modeTh, activeZone.modeEn)}
              </p>

              <div className="surface-white p-4 mt-6">
                <p className="small-note text-[#77736C] m-0">
                  {t('เส้นทางเทเลพอร์ต (Community Board):', 'Teleport Route (Alt+B):')}
                </p>
                <p className="text-[16px] font-semibold text-[#E97540] m-0 mt-1">
                  {t(activeZone.teleportTh, activeZone.teleportEn)}
                </p>
              </div>

              <h3 className="text-[18px] font-semibold text-[#1A1917] mt-6">
                {t('คำแนะนำการฟาร์มและจัดปาร์ตี้', 'Tactical Farming Instructions')}
              </h3>
              <p className="body-copy text-[#1A1917] mt-2">
                {t(activeZone.instructionsTh, activeZone.instructionsEn)}
              </p>
            </div>

            <div className="pt-6 mt-6">
              <p className="small-note text-[#77736C] m-0">
                {t(
                  'หมายเหตุ: อัตราดรอปสุทธิพร้อมซิงค์จาก data/stats/npcs/ ของ L2J Mobius ทันทีเมื่อเชื่อมเซิร์ฟเวอร์',
                  'Note: Exact drop probabilities are structured to import directly from L2J Mobius data/stats/npcs XMLs.'
                )}
              </p>
            </div>
          </div>

          {/* Right Column: Monster Table & Drop Rewards */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-8">
            <div>
              <h3 className="text-[20px] font-semibold text-[#1A1917] mb-4">
                {t('รายชื่อมอนสเตอร์หลักในพื้นที่ (L2J Mobius NPC Reference)', 'Key Zone Monsters & Weaknesses')}
              </h3>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('มอนสเตอร์ (NPC ID)', 'Monster (NPC ID)')}</th>
                      <th className="text-right">{t('เลเวล', 'Lv.')}</th>
                      <th>{t('คุณลักษณะและจุดอ่อน', 'Race & Weakness')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeZone.monsters.map((m) => (
                      <tr key={m.nameEn}>
                        <td>
                          <p className="font-semibold m-0">{t(m.nameTh, m.nameEn)}</p>
                          <span className="small-note text-[#77736C]">{m.nameEn}</span>
                        </td>
                        <td className="text-right font-semibold tabular-nums">{m.level}</td>
                        <td>{m.traits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="surface-ink p-6 sm:p-8">
              <h3 className="text-[20px] font-semibold text-[#F7F5F0]">
                {t('ไอเทมดรอปและรางวัลประจำพื้นที่', 'Adena, Materials & Key Drops')}
              </h3>
              <ul className="mt-4 pl-5 flex flex-col gap-2.5 text-[#E8E3DB]">
                {(t('th', 'en') === 'th' ? activeZone.dropsTh : activeZone.dropsEn).map((d) => (
                  <li key={d} className="text-[16px]">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
