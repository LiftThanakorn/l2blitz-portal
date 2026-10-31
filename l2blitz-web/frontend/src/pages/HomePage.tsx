import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { fetchApi } from '../lib/api';
interface ServerStatus { status: 'online' | 'offline' | 'unknown' }
interface ServerStats { playersOnline: number | null; totalCharacters: number | null; status: string }
interface RatesData { rates: { key: string; value: string; verified: boolean }[] }
interface DailyBoss { bossId: number; nameTh: string; nameEn: string; status: 'alive' | 'dead' | 'unknown' }
interface TvtEvent { scheduleTimes: string[] }

function nextScheduledTime(times: string[]): string | null {
  const valid = times.filter((time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time)).sort();
  if (!valid.length) return null;
  const bangkokTime = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(11, 16);
  return valid.find((time) => time > bangkokTime) ?? valid[0];
}

function formatBangkokTime(value: string | null): string | null {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(value));
}

const DESTINATIONS = [
  { to: '/farmzones', th: 'พื้นที่ฟาร์ม', en: 'Farm Zones', descTh: 'FARMZONE 1 / FARMZONE 2 · Chimera', descEn: 'FARMZONE 1 / FARMZONE 2 · Chimera' },
  { to: '/raidboss', th: 'Daily Epic Boss', en: 'Daily Epic Boss', descTh: 'Queen Ant · Baium · Zaken · 20:00', descEn: 'Queen Ant · Baium · Zaken · 20:00' },
  { to: '/events', th: 'กิจกรรม PvP', en: 'PvP Events', descTh: 'TvT ทุก 2 ชั่วโมง · เริ่มได้ตั้งแต่ 2v2', descEn: 'TvT every two hours · from 2v2' },
  { to: '/olympiad', th: 'แกรนด์โอลิมเพียด', en: 'Grand Olympiad', descTh: 'แข่งทุกสุดสัปดาห์ · อันดับ 1–3', descEn: 'Weekly competition · Top 3 by class' },
];

export function HomePage() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [rates, setRates] = useState<RatesData['rates']>([]);
  const [bosses, setBosses] = useState<DailyBoss[]>([]);
  const [tvt, setTvt] = useState<TvtEvent | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void Promise.all([
        fetchApi<ServerStatus>('/api/server/status'),
        fetchApi<ServerStats>('/api/server/stats'),
        fetchApi<RatesData>('/api/server/rates'),
        fetchApi<DailyBoss[]>('/api/raidbosses'),
        fetchApi<TvtEvent>('/api/events/tvt'),
      ]).then(([s, p, r, b, v]) => {
        if (!active) return;
        setStatus(s.ok && s.source === 'live_mysql' ? s.data : null);
        setStats(p.ok && p.source === 'live_mysql' && p.data?.status === 'verified' ? p.data : null);
        setRates(r.ok ? r.data?.rates.filter((item) => item.verified) ?? [] : []);
        setBosses(b.ok && b.source === 'live_mysql' && Array.isArray(b.data) ? b.data : []);
        setTvt(v.ok && v.source === 'live_mysql' ? v.data : null);
        setLastUpdated(p.ok && p.source === 'live_mysql' ? p.updatedAt : s.ok ? s.updatedAt : null);
      });
    };
    refresh();
    const timer = window.setInterval(refresh, 45_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const exp = rates.find((item) => item.key === 'exp_sp')?.value ?? '—';
  const raid = rates.find((item) => item.key === 'raid_drop')?.value ?? '—';
  const statusLabel = status?.status === 'online'
    ? t('ออนไลน์', 'Online')
    : status?.status === 'offline'
      ? t('ออฟไลน์', 'Offline')
      : t('ยังตรวจสอบไม่ได้', 'Unavailable');
  const nextTvt = nextScheduledTime(tvt?.scheduleTimes ?? []);
  const activeBoss = bosses.find((boss) => boss.status === 'alive');
  const bossLabel = activeBoss
    ? t(activeBoss.nameTh, activeBoss.nameEn)
    : bosses.length ? t('ยังไม่ยืนยันสถานะ', 'Status unverified') : '—';
  const checkedAt = formatBangkokTime(lastUpdated);
  const count = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? '—' : value.toLocaleString();

  return (
    <div className="pb-20">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-2 px-2">
        <div className="lg:col-span-5 surface-stone p-8 sm:p-12 flex flex-col justify-between min-h-[420px]">
          <div>
            <p className="small-note font-semibold text-[#E97540] mb-5">LINEAGE II · HIGH FIVE</p>
            <h1 className="display-title text-[#1A1917]">L2BLITZ<br />PVP</h1>
            <p className="lead-statement text-[#524E48] mt-6">
              {t('เซิร์ฟเวอร์ Instant PvP สำหรับการฟาร์ม ต่อสู้ และชิงความเป็นหนึ่งใน High Five', 'High Five Instant PvP built around farming, combat and competition.')}
            </p>
          </div>
          <div className="pt-8">
            <div className="flex flex-wrap gap-3">
              <Link to="/info" className="btn-primary">{t('ข้อมูลเซิร์ฟเวอร์', 'Server Information')}</Link>
              <Link to="/downloads" className="btn-ink">{t('ดาวน์โหลด / ติดตั้ง', 'Download / Install')}</Link>
            </div>
            <p className="small-note text-[#524E48] mt-5 mb-0">
              {t('สถานะเซิร์ฟเวอร์', 'Server status')}: <strong className="text-[#1A1917]">{statusLabel}</strong>
              <span className="ml-3 text-[#77736C]">· Close Beta</span>
            </p>
            <p className="small-note text-[#77736C] mt-2 mb-0">
              {checkedAt ? t('อัปเดตล่าสุด ', 'Last checked ') + checkedAt + ' (GMT+7)' : t('กำลังตรวจสอบข้อมูลล่าสุด', 'Checking latest information')}
              {' · '}{t('ตรวจสอบทุก 45 วินาที', 'Refreshes every 45 seconds')}
            </p>
          </div>
        </div>
        <figure className="lg:col-span-7 m-0 min-h-[420px] overflow-hidden surface-ink">
          <img src="/assets/images/hero-pvp.webp" width={1920} height={1080} fetchPriority="high" alt={t('ภาพประกอบสนามรบ L2Blitz', 'L2Blitz battle artwork')} className="w-full h-full object-cover block" />
        </figure>
      </section>

      <section className="editorial-frame mt-20">
        <div className="editorial-axis-grid mb-7">
          <div className="col-span-12 lg:col-start-6 lg:col-span-7">
            <h2 className="section-heading">{t('ภาพรวมเซิร์ฟเวอร์', 'At a Glance')}</h2>
            <p className="body-copy text-[#77736C] mt-2">
              {t('ข้อมูลล่าสุดของเซิร์ฟเวอร์ อัปเดตอัตโนมัติทุก 45 วินาที', 'Latest server information, updated automatically every 45 seconds.')}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { key: 'online', th: 'ตัวละครออนไลน์', en: 'Characters Online', value: count(stats?.playersOnline) },
            { key: 'characters', th: 'ตัวละครทั้งหมด', en: 'Total Characters', value: count(stats?.totalCharacters) },
            { key: 'exp', th: 'EXP / SP', en: 'EXP / SP', value: exp },
            { key: 'raid', th: 'ไอเทมดรอปจากบอส', en: 'Boss Item Drops', value: raid },
            { key: 'tvt', th: 'TvT รอบถัดไป', en: 'Next TvT Round', value: nextTvt ? nextTvt + ' (GMT+7)' : '—' },
            { key: 'boss', th: 'สถานะ Daily Epic', en: 'Daily Epic Status', value: bossLabel },
          ].map((card) => (
            <div key={card.key} className="surface-white p-5 sm:p-7 min-w-0">
              <p className="small-note text-[#77736C] m-0">{t(card.th, card.en)}</p>
              <p className="text-[25px] sm:text-[32px] font-semibold text-[#1A1917] tabular-nums mt-4 mb-0 break-words">{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="editorial-frame mt-20">
        <div className="editorial-axis-grid mb-7">
          <div className="col-span-12 lg:col-start-6 lg:col-span-7">
            <h2 className="section-heading">{t('สำรวจ L2Blitz', 'Explore L2Blitz')}</h2>
            <p className="body-copy text-[#77736C] mt-2">{t('ข้อมูลพื้นที่ฟาร์ม บอส กิจกรรม และอันดับผู้เล่นของเซิร์ฟเวอร์', 'Farm zones, bosses, events and player rankings.')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DESTINATIONS.map((item) => (
            <Link to={item.to} key={item.to} className="surface-stone p-7 sm:p-9 no-underline group">
              <h3 className="text-[22px] font-semibold text-[#1A1917] m-0 group-hover:text-[#E97540]">{t(item.th, item.en)}</h3>
              <p className="body-copy text-[#77736C] mt-3 mb-0">{t(item.descTh, item.descEn)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="editorial-frame mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <figure className="lg:col-span-6 surface-stone m-0 overflow-hidden">
            <img src="/assets/images/farm-zone.webp" width={1600} height={1200} loading="lazy" alt={t('ภาพประกอบพื้นที่ฟาร์ม High Five', 'High Five farm-zone artwork')} className="w-full h-full object-cover block" />
          </figure>
          <div className="lg:col-span-6 surface-ink p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <p className="small-note font-semibold text-[#E97540] mb-5">START HERE</p>
              <h2 className="section-heading text-[#F7F5F0]">{t('เริ่มต้นด้วย Starter Pack', 'Start with the Starter Pack')}</h2>
              <p className="lead-statement text-[#E8E3DB] mt-5">{t('เลือกอุปกรณ์ +6 และรับ 50 ล้าน Adena พร้อมยาฟื้นฟู จากนั้นเข้าสู่ FARMZONE ผ่าน Alt+B', 'Claim +6 starter equipment, 50M Adena and potions, then travel to a FARMZONE through Alt+B.')}</p>
            </div>
            <Link to="/info" className="btn-primary self-start mt-8">{t('ดูรายละเอียด', 'View Details')}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
