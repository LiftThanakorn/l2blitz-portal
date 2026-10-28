import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { fetchApi } from '../lib/api';

interface Boss {
  bossId: number;
  nameEn: string;
  nameTh: string;
  locationEn: string;
  locationTh: string;
  teleportEn: string;
  teleportTh: string;
  status: 'alive' | 'dead' | 'unknown';
  keyDrops: string[];
}

export function RaidBossPage() {
  const { t } = useLanguage();
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetchApi<Boss[]>('/api/raidbosses').then((result) => {
      if (!active) return;
      setBosses(result.data ?? []);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="editorial-frame pt-10 pb-20">
      <div className="editorial-axis-grid items-end pb-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="small-note text-[#E97540] font-semibold m-0">L2BLITZ · DAILY EPIC</p>
          <p className="body-copy text-[#77736C] mt-3">
            {t('กิจกรรมบอสประจำวันของเซิร์ฟเวอร์ L2Blitz เลือกเกิดแบบสุ่มเพียงหนึ่งตัวจากสามตัว ไม่ใช่การเกิดพร้อมกันทั้งหมด', 'L2Blitz randomly selects one of three Daily Epic bosses each day. They do not all spawn together.')}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <h1 className="display-title">{t('Daily Epic Boss', 'Daily Epic Boss')}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-14">
        <figure className="lg:col-span-7 surface-stone m-0 overflow-hidden">
          <img src="/assets/images/raid-bosses.webp" width={1600} height={1200} alt={t('ภาพประกอบบอสใหญ่ High Five', 'High Five boss illustration')} className="w-full h-full object-cover block" />
        </figure>
        <div className="lg:col-span-5 surface-ink p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <p className="small-note font-semibold text-[#E97540] mb-4">ASIA/BANGKOK · GMT+7</p>
            <p className="text-[54px] sm:text-[68px] leading-none font-semibold text-[#F7F5F0] tabular-nums m-0">20:00</p>
            <h2 className="section-heading text-[#F7F5F0] mt-5">{t('สุ่มบอสวันละหนึ่งตัว', 'One Random Boss Daily')}</h2>
          </div>
          <p className="body-copy text-[#E8E3DB] mt-8 mb-0">{t('ประกาศล่วงหน้า 19:30 และ 19:50 · เปิดวาร์ปสองจุดต่อบอสผ่าน Alt+B', 'Announcements at 19:30 and 19:50 · Two Alt+B teleport points per boss.')}</p>
        </div>
      </div>

      <section>
        <h2 className="section-heading mb-7">{t('บอสที่เข้าร่วมกิจกรรม', 'Daily Epic Boss Pool')}</h2>
        {loading && <p role="status" className="body-copy text-[#77736C]">{t('กำลังโหลดข้อมูล...', 'Loading boss data...')}</p>}
        {!loading && bosses.length === 0 && <p className="body-copy text-[#77736C]">{t('ไม่สามารถโหลดข้อมูลบอสได้', 'Boss data is unavailable')}</p>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {bosses.map((boss) => (
            <article key={boss.bossId} className="surface-white p-6 sm:p-8">
              <p className="small-note font-semibold text-[#E97540] m-0">NPC {boss.bossId}</p>
              <h3 className="text-[26px] font-semibold text-[#1A1917] mt-3 mb-5">{t(boss.nameTh, boss.nameEn)}</h3>
              <p className="body-copy text-[#524E48] m-0">{t(boss.locationTh, boss.locationEn)}</p>
              <p className="body-copy text-[#1A1917] mt-3 mb-0">{t(boss.teleportTh, boss.teleportEn)}</p>
              <div className="border-t border-[#E8E3DB] mt-6 pt-5">
                <p className="small-note text-[#77736C] mb-2">{t('ไอเทมหลัก', 'Key Item')}</p>
                <p className="body-copy text-[#1A1917] m-0">{boss.keyDrops.join(', ')}</p>
                <p className="small-note text-[#77736C] mt-4 mb-0">
                  {boss.status === 'unknown'
                    ? t('ยังไม่มีข้อมูลสถานะเกิด/ตายที่ยืนยันจากระบบกิจกรรม', 'Live spawn/death status is not yet available from the event system')
                    : boss.status === 'alive' ? t('กำลังมีชีวิต', 'Alive') : t('ถูกสังหารแล้ว', 'Defeated')}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
