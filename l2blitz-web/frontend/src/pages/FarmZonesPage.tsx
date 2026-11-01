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
    id: 'farmzone-1',
    nameTh: 'FARMZONE 1 — ทุ่งคิเมร่า',
    nameEn: 'FARMZONE 1 — Chimera Field',
    levelRange: 'Chimera Lv. 81',
    modeTh: 'พื้นที่ฟาร์มหลักของ L2Blitz · PvP และ AutoFarm',
    modeEn: 'L2Blitz primary farming area · PvP and AutoFarm',
    teleportTh: 'Alt+B → วาร์ป → FARMZONE 1',
    teleportEn: 'Alt+B → Teleport → FARMZONE 1',
    monsters: [
      { nameEn: 'Chimera of Earth', nameTh: 'คิเมร่าธาตุดิน', level: 81, traits: 'Earth' },
      { nameEn: 'Chimera of Darkness', nameTh: 'คิเมร่าธาตุมืด', level: 81, traits: 'Darkness' },
      { nameEn: 'Chimera of Wind', nameTh: 'คิเมร่าธาตุลม', level: 81, traits: 'Wind' },
      { nameEn: 'Chimera of Fire', nameTh: 'คิเมร่าธาตุไฟ', level: 81, traits: 'Fire' },
    ],
    dropsTh: ['อาเดน่า 1.5–3.5 ล้านต่อคิเมร่า 1 ตัว', 'ไอเทมอื่นให้ตรวจสอบจากรายการดรอปในเกม'],
    dropsEn: ['1.5–3.5 million Adena per Chimera', 'Check in-game monster drops for other items'],
    instructionsTh: 'วาร์ปได้จาก Community Board (Alt+B) พื้นที่นี้เปิดให้ปะทะ PvP และใช้ AutoFarm ได้ตามกฎเซิร์ฟเวอร์',
    instructionsEn: 'Teleport through Community Board (Alt+B). PvP and AutoFarm are supported under L2Blitz server rules.',
  },
  {
    id: 'farmzone-2',
    nameTh: 'FARMZONE 2 — ทวีปรอยแผล',
    nameEn: 'FARMZONE 2 — Battered Lands',
    levelRange: 'Chimera Lv. 81',
    modeTh: 'พื้นที่ฟาร์มสำรอง · กระจายผู้เล่นจากโซนแรก',
    modeEn: 'Secondary farm area · alternative to Zone 1',
    teleportTh: 'Alt+B → วาร์ป → FARMZONE 2',
    teleportEn: 'Alt+B → Teleport → FARMZONE 2',
    monsters: [
      { nameEn: 'Chimera of Earth', nameTh: 'คิเมร่าธาตุดิน', level: 81, traits: 'Earth' },
      { nameEn: 'Chimera of Darkness', nameTh: 'คิเมร่าธาตุมืด', level: 81, traits: 'Darkness' },
      { nameEn: 'Chimera of Wind', nameTh: 'คิเมร่าธาตุลม', level: 81, traits: 'Wind' },
      { nameEn: 'Chimera of Fire', nameTh: 'คิเมร่าธาตุไฟ', level: 81, traits: 'Fire' },
    ],
    dropsTh: ['Adena 1,500,000–3,500,000 ต่อ Chimera เช่นเดียวกับ FARMZONE 1', 'รายการดรอปอื่นอ้างอิงข้อมูลในเกม'],
    dropsEn: ['1,500,000–3,500,000 Adena per Chimera, same as FARMZONE 1', 'See in-game drop information for other items'],
    instructionsTh: 'ใช้ปุ่ม FARMZONE 2 ใน Community Board (Alt+B) สำหรับฟาร์มและต่อสู้ในพื้นที่ทางเลือก',
    instructionsEn: 'Choose FARMZONE 2 in Community Board (Alt+B) for farming and PvP in the alternate area.',
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
            {t('พื้นที่ฟาร์ม L2Blitz', 'L2Blitz Farm Zones')}
          </p>
          <p className="body-copy text-[#77736C] mt-3">
            {t(
              'แนะนำพื้นที่ฟาร์มทั้งสองโซน มอนสเตอร์ที่พบ และวิธีเดินทางไปยังพื้นที่',
              'Explore both farm zones, their monsters and how to get there.'
            )}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <h1 className="display-title">
            {t('พื้นที่ฟาร์มอาเดน่า', 'Adena Farm Zones')}
            <br />
            {t('ของ L2Blitz', 'of L2Blitz')}
          </h1>
        </div>
      </div>

      {/* Editorial fantasy artwork; not presented as an in-game zone screenshot. */}
      <figure className="m-0 mb-16 surface-stone overflow-hidden max-h-[460px]">
        <picture>
          <source srcSet="/assets/images/farm-zone.webp" type="image/webp" />
          <img
            src="/assets/images/farm-zone.png"
            width={1920}
            height={1080}
            alt={t(
              'ภาพประกอบแนวแฟนตาซีสำหรับพื้นที่ฟาร์ม L2Blitz',
              'Fantasy artwork accompanying the L2Blitz farm zone guide'
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
                {t('วิธีเดินทางและการฟาร์ม', 'Tactical Farming Instructions')}
              </h3>
              <p className="body-copy text-[#1A1917] mt-2">
                {t(activeZone.instructionsTh, activeZone.instructionsEn)}
              </p>
            </div>

            <div className="pt-6 mt-6">
              <p className="small-note text-[#77736C] m-0">
                {t(
                  'ไอเทมดรอปอื่นให้ดูรายละเอียดจากตัวเกมจริง',
                  'For other monster drops, check current in-game information.'
                )}
              </p>
            </div>
          </div>

          {/* Right Column: Monster Table & Drop Rewards */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-8">
            <div>
              <h3 className="text-[20px] font-semibold text-[#1A1917] mb-4">
                {t('มอนสเตอร์ในพื้นที่', 'Monsters in This Zone')}
              </h3>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('มอนสเตอร์', 'Monster')}</th>
                      <th className="text-right">{t('เลเวล', 'Lv.')}</th>
                      <th>{t('ธาตุ', 'Element')}</th>
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
                {t('อาเดน่าและข้อมูลการดรอป', 'Adena & Drop Information')}
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
