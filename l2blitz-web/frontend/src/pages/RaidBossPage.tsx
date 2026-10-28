import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { fetchApi } from '../lib/api';

interface RaidBossItem {
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

export function RaidBossPage() {
  const { t } = useLanguage();
  const [bosses, setBosses] = useState<RaidBossItem[]>([]);
  const [filterTier, setFilterTier] = useState<'all' | 'Grand Boss' | 'High Five Raid'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<RaidBossItem[]>('/api/raidbosses').then((res) => {
      if (res.data) setBosses(res.data);
      setLoading(false);
    });
  }, []);

  const filteredBosses = bosses.filter((b) =>
    filterTier === 'all' ? true : b.tier === filterTier
  );

  return (
    <div className="editorial-frame pt-10 pb-16">
      {/* Masthead */}
      <div className="editorial-axis-grid items-end pb-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="small-note text-[#E97540] font-semibold m-0">
            {t('สารบบเรดบอสและบอสใหญ่ (Grand Boss Telemetry)', 'Grand Boss & Raid Spawn Ledger')}
          </p>
          <p className="body-copy text-[#77736C] mt-3">
            {t(
              'ข้อมูลบอสสำคัญในแพตช์ High Five นำโดย Queen Ant, Baium, Antharas, Valakas, Beleth และ Freya แสดงเลเวล สถานที่ พิกัดเทเลพอร์ต เงื่อนไขการเข้า และสถานะตามจริง (ไม่สุ่มเวลาเกิดปลอมเมื่อฐานข้อมูลออฟไลน์)',
              'Complete High Five Grand Boss directory prioritizing Queen Ant, Baium, Antharas, Valakas, Beleth, and Freya. Displays level, location, teleport paths, respawn rules, and honest real-time status.'
            )}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <h1 className="display-title">
            {t('สถานะเรดบอส', 'Grand Boss &')}
            <br />
            {t('และเงื่อนไขเวลาเกิด', 'Spawn Windows')}
          </h1>
        </div>
      </div>

      {/* Feature Split: Raid Boss Illustration (4:3) + Queen Ant & Baium Priority Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-16">
        <figure className="lg:col-span-6 m-0 surface-stone overflow-hidden">
          <picture>
            <source srcSet="/assets/images/raid-bosses.webp" type="image/webp" />
            <img
              src="/assets/images/raid-bosses.png"
              width={1600}
              height={1200}
              alt={t(
                'ภาพประกอบบอสใหญ่ Baium บนยอดหอคอยโองการสวรรค์ และ Queen Ant ในรังมดชั้นใน',
                'Editorial illustration of Grand Bosses Baium and Queen Ant with Antharas relief'
              )}
              className="w-full h-full object-cover block"
            />
          </picture>
        </figure>

        <div className="lg:col-span-6 surface-ink p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <h2 className="section-heading text-[#F7F5F0]">
              {t('สองเป้าหมายหลัก: Queen Ant & Baium', 'Priority Targets: Queen Ant & Baium')}
            </h2>
            <p className="body-copy text-[#E8E3DB] mt-4">
              {t(
                'ในเมต้าของ Lineage II High Five แหวน Ring of Queen Ant และ Ring of Baium คือหัวใจสำคัญของสายกายภาพและเวทมนตร์ในการเพิ่มความแรงคริติคอล +15% ต่อวง ความแม่นยำ และความต้านทานสถานะมัดขา/พิษ',
                'In the High Five meta, Ring of Queen Ant and Ring of Baium form the mandatory foundation for physical and magical competitors · stacking +15% Critical Damage each alongside Hold and Poison resistance.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
            <div className="bg-[#252320] p-5">
              <p className="small-note text-[#E97540] font-semibold m-0">NPC ID 29001 · Lv. 40</p>
              <p className="text-[20px] font-semibold text-[#F7F5F0] m-0 mt-1">Queen Ant</p>
              <p className="small-note text-[#E8E3DB] m-0 mt-2">
                {t('ดรอป: Ring of Queen Ant (Crit Dmg +15%, Accuracy +2)', 'Drops: Ring of Queen Ant (Crit Dmg +15%, Acc +2)')}
              </p>
            </div>
            <div className="bg-[#252320] p-5">
              <p className="small-note text-[#E97540] font-semibold m-0">NPC ID 29020 · Lv. 75</p>
              <p className="text-[20px] font-semibold text-[#F7F5F0] m-0 mt-1">Baium</p>
              <p className="small-note text-[#E8E3DB] m-0 mt-2">
                {t('ดรอป: Ring of Baium (Crit Dmg +15%, Atk/Cast Spd +4%)', 'Drops: Ring of Baium (Crit Dmg +15%, Spd +4%)')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Raid Boss Directory & Status Table (`data-ui`) */}
      <div data-ui className="surface-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'all', th: 'บอสทั้งหมด (All)', en: 'All Bosses' },
                { id: 'Grand Boss', th: 'บอสใหญ่ระดับโลก (Grand Boss)', en: 'Grand Bosses' },
                { id: 'High Five Raid', th: 'บอสอินสแตนซ์ H5 (Instances)', en: 'High Five Instances' },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilterTier(btn.id)}
                className={`px-4 py-2 text-[14px] font-medium cursor-pointer border-0 ${
                  filterTier === btn.id
                    ? 'bg-[#1A1917] text-[#F7F5F0]'
                    : 'bg-[#F0EDE7] text-[#1A1917]'
                }`}
              >
                {t(btn.th, btn.en)}
              </button>
            ))}
          </div>

          <span className="small-note text-[#77736C]">
            {t(
              'สถานะสดจะเปลี่ยนเป็น มีชีวิต / สังหารแล้ว เมื่อเชื่อมต่อตาราง grandboss_data',
              'Live statuses update automatically when connected to grandboss_data.'
            )}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#77736C]">
            {t('กำลังโหลดข้อมูลบอส...', 'Loading Raid Boss directory...')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('ชื่อบอส (Boss Name)', 'Boss Name')}</th>
                  <th className="text-right">{t('เลเวล', 'Lv.')}</th>
                  <th>{t('สถานที่และเทเลพอร์ต', 'Location & Teleport')}</th>
                  <th>{t('สถานะปัจจุบัน', 'Status')}</th>
                  <th>{t('สังหารล่าสุด / เกิดรอบถัดไป', 'Last Kill / Next Spawn')}</th>
                  <th>{t('เงื่อนไขการเกิดและไอเทมหลัก', 'Respawn Condition & Key Drops')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredBosses.map((boss) => {
                  const badgeColor =
                    boss.status === 'alive'
                      ? 'bg-[#32846B] text-white'
                      : boss.status === 'dead'
                        ? 'bg-[#B95348] text-white'
                        : 'bg-[#F0EDE7] text-[#77736C]';

                  const statusText =
                    boss.status === 'alive'
                      ? t('มีชีวิต (Alive)', 'Alive')
                      : boss.status === 'dead'
                        ? t('สังหารแล้ว (Dead)', 'Dead / Respawning')
                        : t('ไม่ทราบสถานะ (Unknown)', 'Unknown (Offline DB)');

                  return (
                    <tr key={boss.bossId}>
                      <td>
                        <p className="font-semibold text-[#1A1917] m-0">
                          {t(boss.nameTh, boss.nameEn)}
                        </p>
                        <span className="small-note text-[#77736C] tabular-nums">
                          NPC ID {boss.bossId} · {boss.tier}
                        </span>
                      </td>
                      <td className="text-right font-semibold tabular-nums">{boss.level}</td>
                      <td>
                        <p className="font-medium text-[#1A1917] m-0">
                          {t(boss.locationTh, boss.locationEn)}
                        </p>
                        <p className="small-note text-[#E97540] m-0 mt-1">
                          {t(boss.teleportTh, boss.teleportEn)}
                        </p>
                      </td>
                      <td>
                        <span className={`inline-block px-3 py-1 small-note font-semibold ${badgeColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="tabular-nums small-note text-[#77736C]">
                        <div>
                          {t('สังหารล่าสุด:', 'Last Kill:')}{' '}
                          <strong className="text-[#1A1917]">
                            {boss.lastKill ? new Date(boss.lastKill).toLocaleString() : t('ไม่มีข้อมูล', 'N/A')}
                          </strong>
                        </div>
                        <div className="mt-1">
                          {t('รอบเกิดถัดไป:', 'Next Spawn:')}{' '}
                          <strong className="text-[#1A1917]">
                            {boss.nextSpawnWindow
                              ? new Date(boss.nextSpawnWindow).toLocaleString()
                              : t('รอเชื่อมต่อ DB', 'Pending DB')}
                          </strong>
                        </div>
                      </td>
                      <td>
                        <p className="small-note text-[#1A1917] m-0">
                          {t(boss.respawnRuleTh, boss.respawnRuleEn)}
                        </p>
                        <p className="small-note text-[#77736C] m-0 mt-1">
                          {boss.keyDrops.join(' · ')}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
