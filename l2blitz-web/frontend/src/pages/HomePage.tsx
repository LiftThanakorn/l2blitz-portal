import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { fetchApi, HIGH_FIVE_CLASSES } from '../lib/api';

interface ServerStatusData {
  status: 'online' | 'offline' | 'unknown';
  loginServer: 'online' | 'offline' | 'unknown';
  gameServer: 'online' | 'offline' | 'unknown';
  chronicle: string;
  region: string;
  messageTh: string;
  messageEn: string;
}

interface ServerStatsData {
  playersOnline: number | null;
  totalCharacters: number | null;
  totalClans: number | null;
  activeOlympiadNobles: number | null;
  status: string;
}

export function HomePage() {
  const { t } = useLanguage();
  const [serverStatus, setServerStatus] = useState<ServerStatusData | null>(null);
  const [serverStats, setServerStats] = useState<ServerStatsData | null>(null);
  const [selectedRace, setSelectedRace] = useState<
    'Human' | 'Elf' | 'Dark Elf' | 'Orc' | 'Dwarf' | 'Kamael'
  >('Kamael');
  const [selectedClassId, setSelectedClassId] = useState<number>(132);

  useEffect(() => {
    fetchApi<ServerStatusData>('/api/server/status').then((res) => {
      if (res.data) setServerStatus(res.data);
    });
    fetchApi<ServerStatsData>('/api/server/stats').then((res) => {
      if (res.data) setServerStats(res.data);
    });
  }, []);

  const raceClasses = HIGH_FIVE_CLASSES.filter((c) => c.race === selectedRace);
  const activeClass =
    HIGH_FIVE_CLASSES.find((c) => c.id === selectedClassId) || raceClasses[0] || HIGH_FIVE_CLASSES[0];

  const handleRaceSelect = (race: 'Human' | 'Elf' | 'Dark Elf' | 'Orc' | 'Dwarf' | 'Kamael') => {
    setSelectedRace(race);
    const first = HIGH_FIVE_CLASSES.find((c) => c.race === race);
    if (first) setSelectedClassId(first.id);
  };

  const statusLabel =
    serverStatus?.status === 'online'
      ? t('สถานะ: ออนไลน์', 'Status: Online')
      : serverStatus?.status === 'offline'
        ? t('สถานะ: ออฟไลน์', 'Status: Offline')
        : t('สถานะ: ไม่ทราบค่า (รอเชื่อมต่อ GameServer)', 'Status: Unknown (Pending GameServer)');

  return (
    <div>
      {/* 1. HERO — Taste Skill Blueprint 6: Two-by-Two Editorial Board (No Eyebrow Above H1) */}
      <section className="px-2 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
          {/* Top-Left Tile: H1 First, Supporting Sentence Beneath, Action & Telemetry Below */}
          <div className="lg:col-span-5 surface-stone p-6 sm:p-10 flex flex-col justify-between min-h-[340px] lg:min-h-[430px]">
            <div>
              <h1 className="display-title text-[#1A1917]">
                {t('สมรภูมิไฮไฟว์', 'L2BLITZ PVP')}
                <br />
                {t('พร้อมรบทันที', 'High Five Arena')}
              </h1>
              <p className="lead-statement text-[#1A1917] mt-5">
                {t(
                  'พอร์ทัลข้อมูลเซิร์ฟเวอร์ Lineage II High Five (CT 2.6) รูปแบบ Instant PvP ประเทศไทย เริ่มต้นเลเวล 85 คลาสสามครบทุกสายอาชีพ',
                  'The Lineage II High Five (CT 2.6) Instant PvP portal for Thailand. Level 85 entry, full 3rd-class transfers, and Grand Olympiad parity.'
                )}
              </p>
            </div>

            <div className="pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/downloads" className="btn-primary">
                  {t('ดาวน์โหลดไคลเอนต์ H5', 'Download H5 Client')}
                </Link>
                <Link to="/info" className="btn-ink">
                  {t('อ่านโครงสร้างเซิร์ฟเวอร์', 'Inspect Server Spec')}
                </Link>
              </div>
              <p className="small-note text-[#1A1917] font-semibold mt-4 mb-0">
                ● {statusLabel}
              </p>
            </div>
          </div>

          {/* Top-Right Tile: Main Homepage Hero Illustration (16:9) with Shutter Move */}
          <figure className="lg:col-span-7 m-0 shutter-frame relative min-h-[300px] lg:min-h-[430px]">
            <picture>
              <source srcSet="/assets/images/hero-pvp.webp" type="image/webp" />
              <img
                src="/assets/images/hero-pvp.webp"
                width={1920}
                height={1080}
                fetchPriority="high"
                decoding="async"
                alt={t(
                  'ภาพประกอบตัวละครทั้ง 6 เผ่าใน Lineage II High Five สวมชุดเกราะ Elegia, Vorpal และ Vesper ในลานปราสาทอาเดน',
                  'Lineage II High Five playable races in Elegia, Vorpal, and Vesper armor across the Aden Castle courtyard'
                )}
                className="w-full h-full object-cover block slow-drift"
              />
            </picture>
          </figure>

          {/* Bottom-Left Tile: Secondary Visual Plate (Olympiad Arena Duel) */}
          <figure className="lg:col-span-5 m-0 surface-stone overflow-hidden min-h-[260px] lg:min-h-[300px]">
            <picture>
              <source srcSet="/assets/images/olympiad-duel.webp" type="image/webp" />
              <img
                src="/assets/images/olympiad-duel.webp"
                width={1600}
                height={1200}
                loading="lazy"
                decoding="async"
                alt={t(
                  'การดวลแกรนด์โอลิมเพียดระหว่างดูเอลลิสต์และคามาเอลโซลฮาวด์ในสนามประลอง',
                  'Grand Olympiad 1v1 duel between a Human Duelist and Kamael Soul Hound'
                )}
                className="w-full h-full object-cover block"
              />
            </picture>
          </figure>

          {/* Bottom-Right Split: Two Equal Statement & Telemetry Tiles */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="surface-ink p-6 sm:p-8 flex flex-col justify-between min-h-[240px]">
              <p className="lead-statement text-[#F7F5F0]">
                {t(
                  'ระบบโอลิมเพียดรวมคลาส Soul Hound ชาย/หญิง (132/133) และซ่อนคะแนนต่อสู้สาธารณะตามซอร์ส L2J Mobius',
                  'Olympiad standings unite Soul Hound IDs 132/133 and hide public points per L2J Mobius.'
                )}
              </p>
              <Link
                to="/olympiad"
                className="text-[#E97540] no-underline font-medium body-copy mt-6 inline-block hover:underline"
              >
                {t('ตรวจสอบทำเนียบโอลิมเพียด →', 'Explore Olympiad Standings →')}
              </Link>
            </div>

            <div className="surface-white p-6 sm:p-8 flex flex-col justify-between min-h-[240px]">
              <p className="lead-statement text-[#1A1917]">
                {t(
                  'รายงานสถานะตามความจริง แสดงค่าไม่ทราบสถานะเมื่อยังไม่เชื่อม DB แทนการสุ่มตัวเลขผู้เล่นปลอม',
                  'Honest telemetry displays Unknown when unlinked rather than fabricating player counts.'
                )}
              </p>
              <Link
                to="/raidboss"
                className="text-[#1A1917] no-underline font-semibold body-copy mt-6 inline-block underline decoration-[#E97540] decoration-2 underline-offset-4"
              >
                {t('ดูสถานะบอส Queen Ant & Baium →', 'View Queen Ant & Baium Status →')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS & TELEMETRY — Blueprint 1: Photograph with Two Figure Tiles (Gutterless Mosaic) */}
      <section className="mt-24" data-reveal>
        <div className="editorial-frame mb-8">
          <div className="editorial-axis-grid items-end">
            <div className="col-span-12 lg:col-start-6 lg:col-span-7">
              <h2 className="section-heading">
                {t('ตัวชี้วัดเซิร์ฟเวอร์และเรทพื้นฐาน', 'Live Telemetry & Baseline Rates')}
              </h2>
              <p className="body-copy text-[#1A1917] mt-2">
                {t(
                  'ข้อมูลสถิติออนไลน์และโครงสร้างเรทพื้นฐานของเซิร์ฟเวอร์ L2BLITZ PVP',
                  'Real-time database counters and foundational progression parameters.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          <figure className="lg:col-span-8 m-0 relative min-h-[360px] lg:min-h-[540px] surface-stone">
            <picture>
              <source srcSet="/assets/images/server-features.webp" type="image/webp" />
              <img
                src="/assets/images/server-features.webp"
                width={1600}
                height={1200}
                loading="lazy"
                decoding="async"
                alt={t(
                  'การจัดวางอุปกรณ์ระดับ S84 ชุดเกราะ Elegia อาวุธ Vesper และประดับบอส Baium / Queen Ant',
                  'Catalog arrangement of High Five S84 Elegia armor, Vesper weapons, and Epic Boss rings'
                )}
                className="w-full h-full object-cover block"
              />
            </picture>
          </figure>

          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
            <div className="surface-ink p-8 sm:p-10 flex flex-col justify-between min-h-[260px]">
              <div>
                <p className="section-heading text-[#F7F5F0] tabular-nums m-0">
                  {serverStats?.playersOnline !== null && serverStats?.playersOnline !== undefined
                    ? serverStats.playersOnline.toLocaleString()
                    : t('ไม่ทราบค่า', 'UNKNOWN')}
                </p>
                <p className="body-copy text-[#E8E3DB] mt-3">
                  {t(
                    'ผู้เล่นออนไลน์ขณะนี้ และตัวละครสะสมทั้งหมดในฐานข้อมูล MySQL ของ L2J Mobius (ปัจจุบัน: รอเชื่อมต่อฐานข้อมูล)',
                    'Players currently online and total registered characters in the L2J Mobius MySQL database (currently pending DB link).'
                  )}
                </p>
              </div>
              <div className="pt-6">
                <Link
                  to="/rankings"
                  className="text-[#E97540] font-semibold body-copy no-underline hover:underline"
                >
                  {t('ตรวจสอบทำเนียบผู้เล่นและแคลน →', 'Inspect Player & Clan Standings →')}
                </Link>
              </div>
            </div>

            <div className="surface-stone p-8 sm:p-10 flex flex-col justify-between min-h-[260px]">
              <div>
                <p className="section-heading text-[#1A1917] tabular-nums m-0">
                  Lv. 85 / S84
                </p>
                <p className="body-copy text-[#1A1917] mt-3">
                  {t(
                    'เริ่มเกมเลเวล 85 ทันทีพร้อมคลาส 3 ระบบธาตุอาวุธ 300 / เกราะ 120×3 (ตัวคูณอาเดน่าและเรทตีบวกรอยืนยันจากเซิร์ฟเวอร์จริง)',
                    'Instant Level 85 with 3rd class transfer and 300/120×3 attributes (exact Adena & enchant rates pending verification).'
                  )}
                </p>
              </div>
              <div className="pt-6">
                <Link
                  to="/info"
                  className="text-[#1A1917] font-semibold body-copy no-underline hover:underline"
                >
                  {t('ดูตารางเรทและข้อกำหนดทั้งหมด →', 'View Complete Rates & Rules Table →')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE ONE LIVE THING — Interactive High Five Class & Loadout Inspector */}
      <section className="mt-28 editorial-frame" data-reveal>
        <div className="editorial-axis-grid mb-10">
          <div className="col-span-12 lg:col-start-6 lg:col-span-7">
            <h2 className="section-heading">
              {t('จำลองสายอาชีพและยุทโธปกรณ์คลาส 3', 'Third-Class Combat Loadout Matrix')}
            </h2>
            <p className="body-copy text-[#1A1917] mt-3">
              {t(
                'เลือกเผ่าและคลาสที่ต้องการตรวจสอบ เพื่อดูเซ็ตเกราะ S84 อาวุธ และชุดประดับบอสที่เหมาะสมสำหรับการประลอง',
                'Select any playable race and 3rd-class awakening to inspect its High Five S84 armor, weapon, and epic jewelry pairing.'
              )}
            </p>
          </div>
        </div>

        <div className="surface-white p-6 sm:p-10">
          {/* Race Selector Row */}
          <div data-ui className="flex flex-wrap gap-2 pb-6">
            {(
              [
                { id: 'Human', th: 'มนุษย์ (Human)' },
                { id: 'Elf', th: 'เอลฟ์ (Elf)' },
                { id: 'Dark Elf', th: 'ดาร์คเอลฟ์ (Dark Elf)' },
                { id: 'Orc', th: 'ออร์ค (Orc)' },
                { id: 'Dwarf', th: 'ดวอร์ฟ (Dwarf)' },
                { id: 'Kamael', th: 'คามาเอล (Kamael)' },
              ] as const
            ).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRaceSelect(r.id)}
                className={`px-4 py-2.5 small-note font-medium cursor-pointer border-0 transition-colors ${
                  selectedRace === r.id
                    ? 'bg-[#1A1917] text-[#F7F5F0]'
                    : 'bg-[#F0EDE7] text-[#1A1917] hover:bg-[#E8E3DB]'
                }`}
              >
                {t(r.th, r.id)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            <div data-ui className="lg:col-span-5 flex flex-col gap-2">
              {raceClasses.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`w-full text-left px-4 py-3 body-copy cursor-pointer border-0 flex items-center justify-between transition-colors ${
                    activeClass.id === cls.id
                      ? 'bg-[#1A1917] text-[#F7F5F0] font-semibold'
                      : 'bg-[#F7F5F0] text-[#1A1917] hover:bg-[#F0EDE7]'
                  }`}
                >
                  <span>{t(cls.nameTh, cls.nameEn)}</span>
                  <span className="small-note tabular-nums opacity-85">
                    ID {cls.groupedIds.join('/')}
                  </span>
                </button>
              ))}
            </div>

            <div className="lg:col-span-7 surface-stone p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-4 pb-4">
                  <div>
                    <h3 className="lead-statement font-semibold text-[#1A1917]">
                      {t(activeClass.nameTh, activeClass.nameEn)}
                    </h3>
                    <p className="small-note text-[#524E48] mt-1">
                      {t('เผ่า:', 'Race:')} {t(activeClass.raceTh, activeClass.race)} ·{' '}
                      {t('บทบาท:', 'Archetype:')} {activeClass.archetype} · Class ID{' '}
                      {activeClass.groupedIds.join(' & ')}
                    </p>
                  </div>
                  <Link
                    to={`/olympiad?classId=${activeClass.id}`}
                    className="btn-ink small-note py-2 px-4"
                  >
                    {t('ดูอันดับโอลิมเพียดคลาสนี้ →', 'Class Olympiad Ranking →')}
                  </Link>
                </div>

                <p className="body-copy text-[#1A1917] mt-4">
                  {t(activeClass.olympiadRoleTh, activeClass.olympiadRoleEn)}
                </p>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                  <div className="surface-white p-4">
                    <dt className="small-note text-[#524E48]">
                      {t('ชุดเกราะ S84 แนะนำ', 'Recommended S84 Armor Set')}
                    </dt>
                    <dd className="body-copy font-semibold text-[#1A1917] m-0 mt-1">
                      {activeClass.recommendedSet}
                    </dd>
                  </div>
                  <div className="surface-white p-4">
                    <dt className="small-note text-[#524E48]">
                      {t('อาวุธหลักและออปชัน (SA)', 'Primary Weapon & SA')}
                    </dt>
                    <dd className="body-copy font-semibold text-[#1A1917] m-0 mt-1">
                      {t(activeClass.weaponTh, activeClass.weaponEn)}
                    </dd>
                  </div>
                  <div className="sm:col-span-2 surface-white p-4">
                    <dt className="small-note text-[#524E48]">
                      {t('ชุดประดับบอสระดับสูงสุด (Epic Jewelry Loadout)', 'Endgame Epic Jewelry Setup')}
                    </dt>
                    <dd className="body-copy font-semibold text-[#1A1917] m-0 mt-1">
                      {activeClass.jewelryCombo}
                    </dd>
                  </div>
                </dl>
              </div>

              {activeClass.id === 132 && (
                <p className="small-note text-[#1A1917] font-semibold mt-6 m-0">
                  {t(
                    'หมายเหตุระบบ L2J Mobius CT 2.6: คลาส Soul Hound ชาย (132) และหญิง (133) จะถูกคำนวณรวมในตารางโอลิมเพียดและชิงตำแหน่งฮีโร่ร่วมกัน',
                    'L2J Mobius CT 2.6 Technical Note: Male (132) and Female (133) Soul Hounds compete within a single unified Olympiad ranking and Hero pool.'
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SERVER FEATURES — Blueprint 2: 50/50 Split */}
      <section className="mt-28 grid grid-cols-1 lg:grid-cols-12" data-reveal>
        <div className="lg:col-span-6 surface-stone p-8 sm:p-14 flex flex-col justify-between min-h-[520px]">
          <div className="flex flex-col gap-2">
            <h2 className="section-heading text-left text-[#1A1917]">
              {t('ออกแบบเพื่อการปะทะ', 'Engineered for')}
              <br />
              {t('ในแพตช์ High Five', 'High Five Parity')}
            </h2>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <p className="body-copy text-[#1A1917] max-w-[36ch]">
              {t(
                'ตัดภาระการเก็บเลเวลที่ยาวนานออกทั้งหมด เพื่อให้ผู้เล่นโฟกัสกับการจัดธาตุ ซับคลาส คอมโบสกิล และการควบคุมจังหวะในสนามรบ',
                'Eliminating tedious leveling grinds so clans and solo competitors can focus purely on attribute countering, subclass certifications, and arena execution.'
              )}
            </p>
            <Link to="/info" className="btn-primary shrink-0">
              {t('อ่านรายละเอียดระบบ', 'Full System Guide')}
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col">
          {[
            {
              titleTh: 'Community Board (Alt+B) ครบวงจร',
              titleEn: 'Integrated Community Board (Alt+B)',
              descTh: 'บัฟมาตรฐานครบชุด วาร์ปเข้าพื้นที่ฟาร์มและหน้าห้องบอส ร้านค้าแลกเปลี่ยนไอเทม และจัดการสกิลซับคลาสได้ทันทีจากในเมือง',
              descEn: 'One-click scheme buffer, global gatekeeper teleports, GM shop, and subclass certification management.',
              tags: ['Scheme Buffer', 'Global Gatekeeper', 'Subclass Certs'],
            },
            {
              titleTh: 'ระบบ AutoFarm และ AutoPotion มาตรฐาน',
              titleEn: 'Built-in AutoFarm & AutoPotion',
              descTh: 'รองรับการตั้งค่าฟาร์มอัตโนมัติในโซนที่กำหนด พร้อมระบบกดน้ำยา CP / HP / MP อัตโนมัติที่ยุติธรรมสำหรับทุกสายอาชีพ',
              descEn: 'Server-side regulated AutoFarm macro support and responsive CP/HP/MP AutoPotion toggles without third-party bots.',
              tags: ['Regulated Macro', 'CP/HP/MP Threshold', 'Anti-Bot Guard'],
            },
            {
              titleTh: 'PvP Craft และการอัปเกรดระดับ S84',
              titleEn: 'PvP Craft & S84 Progression',
              descTh: 'เริ่มต้นด้วยชุดพื้นฐานพร้อมรบ และสะสมเหรียญจากการสังหาร PvP กิจกรรม TvT และฟาร์มโซนเพื่อสร้างเกราะ Vorpal / Elegia',
              descEn: 'Instant starter gear with structured progression into Vorpal, Elegia, and Masterwork items via PvP and farm tokens.',
              tags: ['Starter S80/S84', 'Vorpal & Elegia', 'Attribute 300/120'],
            },
            {
              titleTh: 'แกรนด์โอลิมเพียดและศึกชิงปราสาท',
              titleEn: 'Grand Olympiad & Castle Sieges',
              descTh: 'นับผลแพ้ชนะตามกฎ High Five ขั้นต่ำ 15 แมตช์เพื่อจัดอันดับ พร้อมสงครามชิงปราสาทและ Territory War ทุกสัปดาห์',
              descEn: 'Authentic High Five Olympiad rules (15-match minimum qualification) alongside weekly Castle Sieges and Territory Wars.',
              tags: ['15-Match Rule', 'Hidden Points', 'Aden & Rune Sieges'],
            },
          ].map((row, idx) => (
            <div
              key={row.titleEn}
              className={`p-7 sm:p-9 grid grid-cols-1 md:grid-cols-12 gap-4 items-start flex-1 ${
                idx % 2 === 0 ? 'bg-[#1A1917] text-[#F7F5F0]' : 'bg-[#252320] text-[#F7F5F0]'
              }`}
            >
              <div className="md:col-span-5">
                <h3 className="lead-statement font-semibold text-[#F7F5F0]">
                  {t(row.titleTh, row.titleEn)}
                </h3>
              </div>
              <div className="md:col-span-4">
                <p className="small-note text-[#E8E3DB] m-0">
                  {t(row.descTh, row.descEn)}
                </p>
              </div>
              <div className="md:col-span-3 flex flex-wrap md:flex-col gap-1.5 small-note text-[#E97540]">
                {row.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WORLD SHOWCASE — Blueprint 3: Band of Unequal Panels */}
      <section className="mt-28" data-reveal>
        <div className="editorial-frame mb-10">
          <div className="editorial-axis-grid">
            <div className="col-span-12 lg:col-start-6 lg:col-span-7">
              <h2 className="section-heading">
                {t('สมรภูมิหลักในแพตช์ High Five', 'Signature High Five Battlegrounds')}
              </h2>
            </div>
          </div>
        </div>

        <div className="showcase-strip">
          <Link
            to="/raidboss"
            style={{ flexGrow: 5, flexBasis: '0%' }}
            className="showcase-panel no-underline"
          >
            <picture>
              <source srcSet="/assets/images/raid-bosses.webp" type="image/webp" />
              <img
                src="/assets/images/raid-bosses.webp"
                width={1600}
                height={1200}
                loading="lazy"
                decoding="async"
                alt={t(
                  'บอสใหญ่ Baium บนหอคอยโองการสวรรค์ และ Queen Ant ในรังมด',
                  'Grand Bosses Baium atop the Tower of Insolence and Queen Ant'
                )}
              />
            </picture>
            <div
              className="absolute top-0 left-0 p-6"
              style={{ backgroundColor: 'rgba(26, 25, 23, 0.78)' }}
            >
              <p className="lead-statement font-semibold text-[#F7F5F0] m-0">
                {t('เรดบอสและบอสใหญ่', 'Epic Raid Bosses')}
              </p>
              <p className="small-note text-[#E8E3DB] m-0 mt-1">
                Queen Ant · Baium · Antharas
              </p>
            </div>
          </Link>

          <Link
            to="/farmzones"
            style={{ flexGrow: 2, flexBasis: '0%' }}
            className="showcase-panel no-underline"
          >
            <picture>
              <source srcSet="/assets/images/farm-zone.webp" type="image/webp" />
              <img
                src="/assets/images/farm-zone.webp"
                width={1920}
                height={1080}
                loading="lazy"
                decoding="async"
                alt={t(
                  'พื้นที่ฟาร์มหุบเขามังกร Dragon Valley และถ้ำอันธารัส',
                  'Dragon Valley and Lair of Antharas High Five farming canyon'
                )}
              />
            </picture>
            <div
              className="absolute bottom-0 left-0 p-4"
              style={{ backgroundColor: 'rgba(26, 25, 23, 0.78)' }}
            >
              <p className="body-copy font-semibold text-[#F7F5F0] m-0">
                {t('พื้นที่ฟาร์ม S84', 'Farm Zones')}
              </p>
            </div>
          </Link>

          <Link
            to="/events"
            style={{ flexGrow: 3, flexBasis: '0%' }}
            className="showcase-panel no-underline"
          >
            <picture>
              <source srcSet="/assets/images/events-tvt.webp" type="image/webp" />
              <img
                src="/assets/images/events-tvt.webp"
                width={1920}
                height={1080}
                loading="lazy"
                decoding="async"
                alt={t(
                  'การประลอง Team vs Team ระหว่างฝ่ายสีน้ำเงินและฝ่ายสีแดง',
                  'Team vs Team arena confrontation between Blue and Red factions'
                )}
              />
            </picture>
            <div
              className="absolute bottom-0 left-0 p-4"
              style={{ backgroundColor: 'rgba(26, 25, 23, 0.78)' }}
            >
              <p className="body-copy font-semibold text-[#F7F5F0] m-0">
                {t('กิจกรรม TvT ประจำวัน', 'Daily TvT Arena')}
              </p>
            </div>
          </Link>

          <Link
            to="/olympiad"
            style={{ flexGrow: 2, flexBasis: '0%' }}
            className="showcase-panel no-underline"
          >
            <picture>
              <source srcSet="/assets/images/olympiad-duel.webp" type="image/webp" />
              <img
                src="/assets/images/olympiad-duel.webp"
                width={1600}
                height={1200}
                loading="lazy"
                decoding="async"
                alt={t(
                  'สนามประลองแกรนด์โอลิมเพียดชิงตำแหน่งฮีโร่ประจำคลาส',
                  'Grand Olympiad colosseum arena'
                )}
              />
            </picture>
            <div
              className="absolute bottom-0 left-0 p-4"
              style={{ backgroundColor: 'rgba(26, 25, 23, 0.78)' }}
            >
              <p className="body-copy font-semibold text-[#F7F5F0] m-0">
                {t('แกรนด์โอลิมเพียด', 'Olympiad')}
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 6. SCHEDULE & BOSS LEDGER — Blueprint 4: Statement, Table Pushed Right */}
      <section className="mt-28 editorial-frame" data-reveal>
        <div className="editorial-axis-grid">
          <div className="col-span-12 lg:col-start-6 lg:col-span-7">
            <h2 className="section-heading">
              {t('กำหนดการสมรภูมิและเป้าหมายประจำวัน', 'Daily Combat Schedule & Targets')}
            </h2>
          </div>
        </div>

        <div className="editorial-axis-grid mt-12 items-end">
          <div className="col-span-12 lg:col-span-5">
            <figure className="m-0 surface-stone p-4">
              <img
                src="/assets/archival/poleaxe.jpg"
                width={1059}
                height={2250}
                loading="lazy"
                decoding="async"
                alt={t(
                  'ภาพถ่ายคลังพิพิธภัณฑ์อาวุธด้ามยาวเหล็กกล้าสมัยศตวรรษที่ 19 (Public Domain CC0)',
                  '19th-century European steel and wood poleaxe museum plate (Art Institute of Chicago, CC0)'
                )}
                className="w-full aspect-[4/5] object-cover block grayscale contrast-105"
              />
              <figcaption className="small-note text-[#524E48] mt-3">
                {t(
                  'ภาพอ้างอิงวัสดุศาสตร์: ขวานด้ามยาวเหล็กกล้า (Art Institute of Chicago, CC0)',
                  'Archival material reference: European steel poleaxe (Art Institute of Chicago, CC0).'
                )}
              </figcaption>
            </figure>
          </div>

          <div className="col-span-12 lg:col-start-6 lg:col-span-7 flex flex-col gap-5">
            {[
              {
                kindTh: 'กิจกรรมทีม',
                kindEn: 'Automated Event',
                placeTh: 'Team vs Team (TvT) รอบบ่ายและค่ำ',
                placeEn: 'Team vs Team (TvT) Arena Matches',
                time: '14:00 / 18:00 / 20:30 / 22:30',
                to: '/events',
              },
              {
                kindTh: 'โอลิมเพียด',
                kindEn: 'Grand Olympiad',
                placeTh: 'เปิดลงทะเบียนประลอง 1v1 แยกคลาสและอิสระ',
                placeEn: 'Evening Olympiad Competition Window',
                time: '18:00 – 00:00 GMT+7',
                to: '/olympiad',
              },
              {
                kindTh: 'บอสประดับ',
                kindEn: 'Epic Jewelry Boss',
                placeTh: 'Queen Ant (รังมดชั้นใน · Lv. 40)',
                placeEn: 'Queen Ant (The Ant Nest Chamber)',
                time: t('ตรวจสอบสถานะสด →', 'Check Status →'),
                to: '/raidboss',
              },
              {
                kindTh: 'บอสหอคอย',
                kindEn: 'Grand Boss',
                placeTh: 'Baium (หอคอยโองการสวรรค์ ชั้น 14 · Lv. 75)',
                placeEn: 'Baium (Tower of Insolence 14F)',
                time: t('ตรวจสอบสถานะสด →', 'Check Status →'),
                to: '/raidboss',
              },
              {
                kindTh: 'บอสมังกร',
                kindEn: 'World Dragon',
                placeTh: 'Antharas & Valakas (Lv. 85 High Five)',
                placeEn: 'Antharas & Valakas Sanctums',
                time: t('ดูเงื่อนไขการเข้า →', 'Entry Rules →'),
                to: '/raidboss',
              },
              {
                kindTh: 'พื้นที่ฟาร์ม',
                kindEn: 'PvP Farm Zone',
                placeTh: 'หุบเขามังกร (Dragon Valley) & ถ้ำอันธารัส (LoA)',
                placeEn: 'Dragon Valley & Lair of Antharas',
                time: t('เปิดตลอด 24 ชม. →', 'Open 24/7 →'),
                to: '/farmzones',
              },
            ].map((item, i) => (
              <Link
                key={item.placeEn}
                to={item.to}
                className={`grid grid-cols-12 items-baseline gap-3 no-underline py-2 hover:underline ${
                  i === 3 ? 'mt-4' : ''
                }`}
              >
                <span className="col-span-4 sm:col-span-3 small-note text-[#524E48]">
                  {t(item.kindTh, item.kindEn)}
                </span>
                <span className="col-span-8 sm:col-span-5 body-copy font-medium text-[#1A1917]">
                  {t(item.placeTh, item.placeEn)}
                </span>
                <span className="col-span-12 sm:col-span-4 sm:text-right small-note font-semibold text-[#1A1917] tabular-nums">
                  {item.time}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS — Aligned to the Two Editorial Anchor Lines (Columns 1 & 6) */}
      <section className="mt-28 editorial-frame" data-reveal>
        <div className="editorial-axis-grid gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <h2 className="section-heading">
              {t('เริ่มต้นเข้าสู่สมรภูมิใน 4 ขั้นตอน', 'Four Steps to the Arena')}
            </h2>
          </div>

          <div className="col-span-12 lg:col-start-6 lg:col-span-7 flex flex-col gap-10">
            <div>
              <h3 className="lead-statement font-semibold text-[#1A1917]">
                {t('ติดตั้งไคลเอนต์ High Five และรันลอนเชอร์', 'Install the High Five client and run the updater.')}
              </h3>
              <p className="body-copy text-[#1A1917] mt-2">
                {t(
                  'ดาวน์โหลดตัวเกมเต็มรูปแบบ CT 2.6 หรือใช้ลอนเชอร์อัปเดตไฟล์ระบบให้ตรงกับเซิร์ฟเวอร์',
                  'Download the full CT 2.6 client archive or run the L2Blitz updater patch.'
                )}
              </p>
            </div>

            <div>
              <h3 className="lead-statement font-semibold text-[#1A1917]">
                {t('สร้างตัวละครรับเลเวล 85 และคลาส 3 ทันที', 'Create your Level 85 character with 3rd class transfer.')}
              </h3>
              <p className="body-copy text-[#1A1917] mt-2">
                {t(
                  'เลือกสายอาชีพที่ถนัด รับชุดเริ่มต้น บัฟสคีม และตั้งค่าสกิลซับคลาสผ่านกระดาน Alt+B',
                  'Select your class, claim starter gear, configure scheme buffs, and assign subclass certifications via Alt+B.'
                )}
              </p>
            </div>

            <div>
              <h3 className="lead-statement font-semibold text-[#1A1917]">
                {t('ฟาร์มวัตถุดิบ S84 ใน Dragon Valley และถ้ำอันธารัส', 'Farm S84 materials in Dragon Valley and Lair of Antharas.')}
              </h3>
              <p className="body-copy text-[#1A1917] mt-2">
                {t(
                  'สะสมอาเดน่า หินธาตุ 150/300 และเหรียญ PvP เพื่อแลกอุปกรณ์ Vorpal และ Elegia',
                  'Gather Adena, attribute crystals, and PvP tokens to craft Vorpal and Elegia sets.'
                )}
              </p>
            </div>

            <div>
              <h3 className="lead-statement font-semibold text-[#1A1917]">
                {t('ชิงความเป็นหนึ่งในโอลิมเพียดและบอสใหญ่', 'Compete for Hero status and Epic Boss rings.')}
              </h3>
              <p className="body-copy text-[#1A1917] mt-2">
                {t(
                  'ลงสนามโอลิมเพียดครบ 15 แมตช์เพื่อเข้าสู่อันดับคลาส และรวมพลชิงแหวน Baium / Queen Ant',
                  'Complete 15+ Olympiad matches to qualify for class rankings and contest Grand Boss spawns.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA — Blueprint 6: Three Photographs edge-to-edge, then a Flat Field */}
      <section className="mt-28" data-reveal>
        <div className="grid grid-cols-1 md:grid-cols-3">
          <figure className="m-0 h-[260px] md:h-[340px] overflow-hidden">
            <picture>
              <source srcSet="/assets/images/hero-pvp.webp" type="image/webp" />
              <img
                src="/assets/images/hero-pvp.webp"
                width={1920}
                height={1080}
                loading="lazy"
                decoding="async"
                alt={t('เหล่านักรบทั้ง 6 เผ่าในลานปราสาทอาเดน', 'Six playable races in Aden courtyard')}
                className="w-full h-full object-cover block"
              />
            </picture>
          </figure>
          <figure className="m-0 h-[260px] md:h-[340px] overflow-hidden">
            <picture>
              <source srcSet="/assets/images/farm-zone.webp" type="image/webp" />
              <img
                src="/assets/images/farm-zone.webp"
                width={1920}
                height={1080}
                loading="lazy"
                decoding="async"
                alt={t('หุบเขามังกร Dragon Valley', 'Dragon Valley farming canyon')}
                className="w-full h-full object-cover block"
              />
            </picture>
          </figure>
          <figure className="m-0 h-[260px] md:h-[340px] overflow-hidden">
            <picture>
              <source srcSet="/assets/images/events-tvt.webp" type="image/webp" />
              <img
                src="/assets/images/events-tvt.webp"
                width={1920}
                height={1080}
                loading="lazy"
                decoding="async"
                alt={t('สนามประลอง Team vs Team', 'Team vs Team colosseum match')}
                className="w-full h-full object-cover block"
              />
            </picture>
          </figure>
        </div>

        <div className="surface-stone py-16 px-4 md:px-10">
          <div className="max-w-[1280px] mx-auto editorial-axis-grid items-end">
            <div className="col-span-12 lg:col-span-5">
              <figure className="m-0 w-[140px]">
                <img
                  src="/assets/archival/albi-cathedral-gothic-statues-niches.jpg"
                  width={1920}
                  height={2880}
                  loading="lazy"
                  decoding="async"
                  alt={t('ประติมากรรมหินแกะสลักโกธิค (CC0)', 'Gothic stone carving detail (CC0)')}
                  className="w-full aspect-[4/5] object-cover block grayscale"
                />
              </figure>
            </div>

            <div className="col-span-12 lg:col-start-6 lg:col-span-7">
              <h2 className="section-heading text-[#1A1917]">
                {t('เตรียมความพร้อมก่อนเข้าสู่เซิร์ฟเวอร์', 'Prepare Your Client Installation')}
              </h2>
              <p className="lead-statement text-[#1A1917] mt-4">
                <Link
                  to="/downloads"
                  className="text-[#1A1917] underline decoration-[#E97540] decoration-4 underline-offset-8 hover:text-[#E97540] transition-colors"
                >
                  {t(
                    'ตรวจสอบคู่มือการติดตั้งและสถานะไฟล์ไคลเอนต์ High Five ได้ที่หน้าดาวน์โหลด →',
                    'Inspect the High Five installation guide and launcher status on the Downloads portal →'
                  )}
                </Link>
              </p>
              <p className="body-copy text-[#1A1917] mt-4">
                {t(
                  'หมายเหตุ: ลิงก์ดาวน์โหลดจะเปิดใช้งานเมื่อไฟล์ลอนเชอร์และแพตช์ของเซิร์ฟเวอร์จริงได้รับการยืนยันแล้วเท่านั้น ไม่มีการวางลิงก์หลอก',
                  'Note: Download endpoints remain transparently marked as pending until official L2Blitz launcher binaries are verified.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
