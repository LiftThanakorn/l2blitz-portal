import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { fetchApi } from '../lib/api';

interface Rate {
  key: string;
  labelTh: string;
  labelEn: string;
  value: string;
  noteTh: string;
  noteEn: string;
  verified: boolean;
}
interface ServerRates {
  rates: Rate[];
}
const SYSTEMS = [
  {
    key: 'starter',
    titleTh: 'Starter Pack พร้อมรบ',
    titleEn: 'Starter Pack',
    bodyTh: 'เลือกรับอาวุธ ชุดเกราะ และเครื่องประดับ +6 พร้อม Adena 50 ล้าน และยาฟื้นฟู HP / MP / CP อย่างละ 1,000 ชิ้น รับได้หนึ่งครั้งต่อตัวละคร',
    bodyEn: 'Choose +6 weapons, armor and jewelry with 50M Adena and 1,000 each of HP, MP and CP potions. One claim per character.',
  },
  {
    key: 'farm',
    titleTh: 'FARMZONE 1 และ FARMZONE 2',
    titleEn: 'Two Farm Zones',
    bodyTh: 'ทั้งสองพื้นที่มีมอนสเตอร์ Chimera สำหรับหา Adena โดยตั้งค่าดรอป 1.5–3.5 ล้านต่อมอนสเตอร์ วาร์ปได้จากกระดานชุมชนในเกม',
    bodyEn: 'Farm Chimera monsters across both zones. Their configured Adena reward range is 1.5–3.5 million per monster. Travel through the in-game Community Board.',
  },
  {
    key: 'board',
    titleTh: 'Community Board (Alt+B)',
    titleEn: 'Community Board (Alt+B)',
    bodyTh: 'เมนูหลักในเกมสำหรับบัฟ วาร์ปเมือง พื้นที่ฟาร์ม จุดเข้าถึงบอส ร้านค้า และบริการจัดการตัวละคร',
    bodyEn: 'The in-game hub for buffs, towns, farm zones, boss access points, shops and character services.',
  },
  {
    key: 'auto',
    titleTh: 'AutoFarm และ AutoPotion',
    titleEn: 'AutoFarm & AutoPotion',
    bodyTh: 'มีระบบ AutoFarm และ AutoPotion ที่พัฒนาสำหรับเกม โดยการใช้งานขึ้นกับค่าตั้งเซิร์ฟเวอร์ (สวิตช์ AutoPlay และ AutoPotions มาตรฐานปัจจุบันปิดอยู่)',
    bodyEn: 'Custom AutoFarm and AutoPotion implementations exist. Availability depends on live GameServer settings; the standard AutoPlay and AutoPotions switches are currently disabled.',
  },
  {
    key: 'equipment',
    titleTh: 'ระบบอุปกรณ์ PvP',
    titleEn: 'PvP Equipment',
    bodyTh: 'อัปเกรดอุปกรณ์เป็นแบบ PvP และจัดการธาตุภายในเกม อุปกรณ์ที่ทำ PvP แล้วยังคงรองรับการแลกเปลี่ยน',
    bodyEn: 'Upgrade equipment for PvP, manage attributes and trade upgraded items through the game systems.',
  },
  {
    key: 'events',
    titleTh: 'กิจกรรม PvP และ Daily Epic',
    titleEn: 'PvP Events & Daily Epic',
    bodyTh: 'TvT จัดทุก 2 ชั่วโมง และกิจกรรม Daily Epic สุ่ม Queen Ant, Baium หรือ Zaken วันละหนึ่งตัว เวลา 20:00 น. ตามเวลาไทย',
    bodyEn: 'TvT runs every two hours. Daily Epic selects one boss from Queen Ant, Baium or Zaken at 20:00 Thailand time.',
  },
];

export function ServerInfoPage() {
  const { t } = useLanguage();
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchApi<ServerRates>('/api/server/rates').then((result) => {
      if (!active) return;
      setRates((result.data?.rates ?? []).filter((row) => row.verified));
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="editorial-frame pt-10 pb-20">
      <div className="editorial-axis-grid items-end pb-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="small-note text-[#E97540] font-semibold m-0">L2BLITZ · HIGH FIVE INSTANT PVP</p>
          <p className="body-copy text-[#77736C] mt-4">
            {t('ข้อมูลสำหรับผู้เล่น โดยอ้างอิงจากระบบและค่าที่ตั้งไว้บนเซิร์ฟเวอร์ L2Blitz', 'Player-facing information based on the actual L2Blitz GameServer setup.')}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <h1 className="display-title">{t('ข้อมูลเซิร์ฟเวอร์', 'Server Information')}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
        <figure className="lg:col-span-7 m-0 surface-stone overflow-hidden">
          <img src="/assets/images/server-features.webp" alt={t('ภาพประกอบอุปกรณ์ในเกม Lineage II High Five', 'Lineage II High Five equipment artwork')} width={1600} height={1200} className="w-full h-full object-cover block" loading="lazy" />
        </figure>
        <div className="lg:col-span-5 surface-ink p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <p className="small-note text-[#E97540] font-semibold mb-5">SERVER PROFILE</p>
            <h2 className="section-heading text-[#F7F5F0]">Lineage II High Five</h2>
            <p className="lead-statement text-[#E8E3DB] mt-5">{t('เซิร์ฟเวอร์แนว Instant PvP เน้นการฟาร์ม การเตรียมอุปกรณ์ และการต่อสู้ระหว่างผู้เล่น', 'Instant PvP focused on farming, equipment progression and player combat.')}</p>
          </div>
          <p className="body-copy text-[#E8E3DB] mt-10 mb-0">{t('ภูมิภาค: ประเทศไทย · เวลาเซิร์ฟเวอร์: GMT+7', 'Region: Thailand · Server time: GMT+7')}</p>
        </div>
      </div>

      <section className="mb-16">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
          <h2 className="section-heading">{t('อัตราคูณที่ใช้งาน', 'Configured Rates')}</h2>
          <p className="small-note text-[#77736C] m-0">{t('ตรวจจากการตั้งค่า GameServer ไม่ใช่ตัวเลขตัวอย่าง', 'From GameServer configuration, not sample values')}</p>
        </div>
        <div className="surface-white divide-y divide-[#E8E3DB]">
          {loading ? <p role="status" className="p-6 text-[#77736C]">{t('กำลังโหลดข้อมูล...', 'Loading server rates...')}</p> : null}
          {!loading && rates.length === 0 ? <p className="p-6 text-[#77736C]">{t('ยังโหลดข้อมูลอัตราคูณไม่ได้', 'Rate information is currently unavailable')}</p> : null}
          {rates.map((rate) => (
            <div key={rate.key} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-5 sm:p-6">
              <h3 className="sm:col-span-4 text-[16px] font-semibold text-[#1A1917] m-0">{t(rate.labelTh, rate.labelEn)}</h3>
              <p className="sm:col-span-2 text-[24px] font-semibold text-[#E97540] m-0 tabular-nums">{rate.value}</p>
              <p className="sm:col-span-6 body-copy text-[#77736C] m-0">{t(rate.noteTh, rate.noteEn)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="section-heading mb-3">{t('ระบบหลักของ L2Blitz', 'Core Game Systems')}</h2>
        <p className="body-copy text-[#77736C] mb-7">{t('แสดงเฉพาะฟีเจอร์ที่มีอยู่ในโปรเจกต์เกม ไม่ใส่ระบบหรือรางวัลสมมติ', 'Only features present in the game project are listed; no invented mechanics or rewards.')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SYSTEMS.map((item) => (
            <article key={item.key} className="surface-stone p-6 sm:p-8">
              <h3 className="text-[20px] font-semibold text-[#1A1917] m-0">{t(item.titleTh, item.titleEn)}</h3>
              <p className="body-copy text-[#524E48] mt-3 mb-0">{t(item.bodyTh, item.bodyEn)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-ink p-8 sm:p-10">
        <h2 className="section-heading text-[#F7F5F0]">{t('ไปยังข้อมูลที่เกี่ยวข้อง', 'Explore L2Blitz')}</h2>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link to="/farmzones" className="btn-primary">{t('พื้นที่ฟาร์ม', 'Farm Zones')}</Link>
          <Link to="/events" className="btn-surface">{t('กิจกรรม', 'Events')}</Link>
          <Link to="/olympiad" className="btn-surface">{t('โอลิมเพียด', 'Olympiad')}</Link>
          <Link to="/raidboss" className="btn-surface">{t('บอส', 'Bosses')}</Link>
        </div>
      </section>
    </div>
  );
}
