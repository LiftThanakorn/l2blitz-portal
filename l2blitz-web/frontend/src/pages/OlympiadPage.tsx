import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { fetchApi, HIGH_FIVE_CLASSES } from '../lib/api';

/**
 * STRICT COMPLIANCE:
 * Public Olympiad Ranking Row contains ONLY Rank, Character Name, and Clan (plus class metadata).
 * Points, matches played, and wins are NEVER exposed in the frontend or public API.
 */
interface OlympiadPublicRow {
  rank: number;
  charName: string;
  clanName: string | null;
  classId: number;
  classNameEn: string;
  classNameTh: string;
}

interface OlympiadHeroRow {
  classId: number;
  classNameEn: string;
  classNameTh: string;
  charName: string;
  clanName: string | null;
  allyName: string | null;
  heroCount: number;
  cycleVerified: boolean;
}

export function OlympiadPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const viewMode = searchParams.get('view') === 'heroes' ? 'heroes' : 'rankings';
  const initialClassParam = Number(searchParams.get('classId') || 88);
  const canonicalInitial = initialClassParam === 133 ? 132 : initialClassParam === 135 ? 136 : initialClassParam;

  const [selectedClassId, setSelectedClassId] = useState<number>(
    HIGH_FIVE_CLASSES.some((c) => c.id === canonicalInitial) ? canonicalInitial : 88
  );
  const [cycle, setCycle] = useState<'current' | 'previous'>('current');
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [sourceMode, setSourceMode] = useState<'live_mysql' | 'dev_fixture' | 'unavailable'>('unavailable');
  const [rankingRows, setRankingRows] = useState<OlympiadPublicRow[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [heroes, setHeroes] = useState<OlympiadHeroRow[]>([]);
  const [heroesVerified, setHeroesVerified] = useState<boolean>(false);

  const limit = 10; // Top 10 per page + pagination for additional pages

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    if (viewMode === 'heroes') {
      fetchApi<{ heroes: OlympiadHeroRow[]; verified: boolean }>('/api/olympiad/heroes').then((res) => {
        if (cancelled) return;
        setSourceMode(res.source);
        if (res.data) {
          setHeroes(res.data.heroes);
          setHeroesVerified(res.data.verified);
        } else {
          setHeroes([]);
          setHeroesVerified(false);
        }
        setLoading(false);
      });
    } else {
      fetchApi<{
        items: OlympiadPublicRow[];
        total: number;
        page: number;
        limit: number;
        minimumMatchesRequired: number;
      }>(
        `/api/olympiad/rankings?classId=${selectedClassId}&cycle=${cycle}&page=${page}&limit=${limit}`
      ).then((res) => {
        if (cancelled) return;
        setSourceMode(res.source);
        if (res.data) {
          setRankingRows(res.data.items);
          setTotalRows(res.data.total);
        } else {
          setRankingRows([]);
          setTotalRows(0);
        }
        setLoading(false);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [viewMode, selectedClassId, cycle, page]);

  const activeClassMeta =
    HIGH_FIVE_CLASSES.find((c) => c.id === selectedClassId) || HIGH_FIVE_CLASSES[0];
  const totalPages = Math.max(1, Math.ceil(totalRows / limit));

  return (
    <div className="editorial-frame pt-10 pb-16">
      {/* Masthead */}
      <div className="editorial-axis-grid items-end pb-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="small-note text-[#E97540] font-semibold m-0">
            {t('ทำเนียบการแข่งขันแกรนด์โอลิมเพียด (L2J Mobius CT 2.6)', 'Grand Olympiad Competitive Registry')}
          </p>
          <p className="body-copy text-[#77736C] mt-3">
            {t(
              'จัดอันดับแยกตามคลาสตามตรรกะซอร์สโค้ด L2J Mobius High Five (รวมคลาส Soul Hound 132 และ 133 เข้าด้วยกัน) ต้องผ่านเกณฑ์แข่งขันขั้นต่ำ 15 แมตช์ และชนะอย่างน้อย 1 แมตช์ โดยไม่เปิดเผยคะแนนโอลิมเพียดต่อสาธารณะ',
              'Ranked per class under official L2J Mobius High Five logic (Soul Hound IDs 132 & 133 unified). Requires ≥15 completed matches and ≥1 victory. Public Olympiad points are strictly withheld.'
            )}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <h1 className="display-title">
            {t('แกรนด์โอลิมเพียด', 'Grand Olympiad')}
            <br />
            {t('และทำเนียบฮีโร่', '& Class Heroes')}
          </h1>
        </div>
      </div>

      {/* Editorial Feature Banner with Olympiad Duel Artwork (4:3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-14">
        <figure className="lg:col-span-6 m-0 surface-stone overflow-hidden max-h-[380px]">
          <picture>
            <source srcSet="/assets/images/olympiad-duel.webp" type="image/webp" />
            <img
              src="/assets/images/olympiad-duel.png"
              width={1600}
              height={1200}
              alt={t(
                'การดวลแกรนด์โอลิมเพียดระหว่างดูเอลลิสต์และคามาเอลโซลฮาวด์',
                'Grand Olympiad 1v1 arena duel between Duelist and Soul Hound'
              )}
              className="w-full h-full object-cover block"
            />
          </picture>
        </figure>

        <div className="lg:col-span-6 surface-ink p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <h2 className="section-heading text-[#F7F5F0]">
              {t('กฎการจัดอันดับและซ่อนคะแนน', 'Ranking Calculation & Privacy')}
            </h2>
            <p className="body-copy text-[#E8E3DB] mt-4">
              {t(
                'เซิร์ฟเวอร์คำนวณลำดับจากคะแนนโอลิมเพียด จำนวนครั้งที่ชนะ และจำนวนแมตช์ภายในระบบหลังบ้านเท่านั้น หน้าเว็บไซต์และ API สาธารณะจะแสดงเฉพาะ อันดับ ชื่อตัวละคร และแคลน เพื่อรักษาความยุติธรรมในการชิงตำแหน่งฮีโร่ช่วงปลายรอบ',
                'Standings are sorted server-side using internal Olympiad points, win counts, and match totals. Both the public REST API and frontend expose exclusively Rank, Character Name, and Clan.'
              )}
            </p>
          </div>

          <div className="pt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSearchParams({ view: 'rankings', classId: String(selectedClassId) })}
              className={`px-5 py-2.5 text-[15px] font-medium cursor-pointer border-0 ${
                viewMode === 'rankings'
                  ? 'bg-[#E97540] text-white'
                  : 'bg-[#252320] text-[#F7F5F0] hover:bg-[#3A3733]'
              }`}
            >
              {t('ตารางอันดับแยกคลาส (Top 10+)', 'Class Standings (Top 10+)')}
            </button>
            <button
              type="button"
              onClick={() => setSearchParams({ view: 'heroes' })}
              className={`px-5 py-2.5 text-[15px] font-medium cursor-pointer border-0 ${
                viewMode === 'heroes'
                  ? 'bg-[#E97540] text-white'
                  : 'bg-[#252320] text-[#F7F5F0] hover:bg-[#3A3733]'
              }`}
            >
              {t('รายชื่อวีรบุรุษปัจจุบัน (Heroes)', 'Current Olympiad Heroes')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Olympiad Interactive Ledger (`data-ui`) */}
      <div data-ui className="surface-white p-6 sm:p-8">
        {viewMode === 'rankings' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar: Class Filter (All 35 Eligible High Five Classes, 132/133 grouped) */}
            <aside className="lg:col-span-4">
              <div className="surface-stone p-4 mb-4">
                <label
                  htmlFor="olympiad-class-select"
                  className="block small-note font-semibold text-[#1A1917] mb-2"
                >
                  {t('เลือกสายอาชีพคลาส 3 (35 บรากเก็ต):', 'Select High Five Class Bracket:')}
                </label>
                <select
                  id="olympiad-class-select"
                  value={selectedClassId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedClassId(id);
                    setPage(1);
                    setSearchParams({ view: 'rankings', classId: String(id) });
                  }}
                  className="w-full p-3 bg-white text-[#1A1917] text-[15px] font-medium border border-[#E8E3DB]"
                >
                  {HIGH_FIVE_CLASSES.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      [{cls.race}] {t(cls.nameTh, cls.nameEn)} (ID {cls.groupedIds.join('/')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Race / Class Buttons */}
              <div className="max-h-[420px] overflow-y-auto flex flex-col gap-1 pr-1">
                {HIGH_FIVE_CLASSES.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setPage(1);
                      setSearchParams({ view: 'rankings', classId: String(cls.id) });
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-[14px] cursor-pointer border-0 flex items-center justify-between ${
                      selectedClassId === cls.id
                        ? 'bg-[#1A1917] text-[#F7F5F0] font-semibold'
                        : 'bg-[#F7F5F0] text-[#1A1917] hover:bg-[#F0EDE7]'
                    }`}
                  >
                    <span>{t(cls.nameTh, cls.nameEn)}</span>
                    <span className="small-note opacity-75 tabular-nums">
                      {cls.groupedIds.join('/')}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {/* Right Column: Ranking Table (Rank, Character Name, Clan ONLY) */}
            <div className="lg:col-span-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
                <div>
                  <h2 className="text-[24px] font-semibold text-[#1A1917]">
                    {t(activeClassMeta.nameTh, activeClassMeta.nameEn)}
                  </h2>
                  <p className="small-note text-[#77736C] m-0 mt-1">
                    Class ID: {activeClassMeta.groupedIds.join(' + ')} ·{' '}
                    {t('เกณฑ์ขั้นต่ำ: แข่งขัน ≥15 นัด และชนะ ≥1 นัด', 'Eligibility: ≥15 matches played & ≥1 win')}
                  </p>
                </div>

                {/* Cycle Toggle: Current vs Previous Cycle */}
                <div className="flex gap-1.5" role="group" aria-label="Olympiad Cycle">
                  <button
                    type="button"
                    onClick={() => {
                      setCycle('current');
                      setPage(1);
                    }}
                    className={`px-4 py-2 text-[14px] font-medium cursor-pointer border-0 ${
                      cycle === 'current'
                        ? 'bg-[#1A1917] text-[#F7F5F0]'
                        : 'bg-[#F0EDE7] text-[#1A1917]'
                    }`}
                  >
                    {t('รอบปัจจุบัน (Current)', 'Current Cycle')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCycle('previous');
                      setPage(1);
                    }}
                    className={`px-4 py-2 text-[14px] font-medium cursor-pointer border-0 ${
                      cycle === 'previous'
                        ? 'bg-[#1A1917] text-[#F7F5F0]'
                        : 'bg-[#F0EDE7] text-[#1A1917]'
                    }`}
                  >
                    {t('รอบที่ผ่านมา (Previous)', 'Previous Cycle')}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-16 text-center text-[#77736C]">
                  {t('กำลังประมวลผลตารางโอลิมเพียด...', 'Computing Olympiad class standings...')}
                </div>
              ) : rankingRows.length === 0 ? (
                <div className="surface-stone p-10 text-center">
                  <p className="lead-statement mx-auto text-[#1A1917]">
                    {sourceMode === 'unavailable'
                      ? t(
                          'ไม่พบข้อมูลโอลิมเพียดสด (ยังไม่ได้เชื่อมต่อฐานข้อมูล L2J Mobius GameServer)',
                          'Live Olympiad standings unavailable (Pending L2J Mobius GameServer database connection).'
                        )
                      : t(
                          'ยังไม่มีตัวละครในคลาสนี้ที่ผ่านเกณฑ์แข่งขันครบ 15 แมตช์ในรอบที่เลือก',
                          'No noble in this class bracket has completed the minimum 15 matches for the selected cycle.'
                        )}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="w-24">{t('อันดับ (Rank)', 'Rank')}</th>
                        <th>{t('ชื่อตัวละคร (Character Name)', 'Character Name')}</th>
                        <th>{t('แคลน (Clan)', 'Clan')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankingRows.map((row) => (
                        <tr key={`${row.rank}-${row.charName}`}>
                          <td className="font-semibold text-[#E97540] tabular-nums">#{row.rank}</td>
                          <td className="font-semibold">{row.charName}</td>
                          <td>{row.clanName || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination (Top 10 per page + additional pages) */}
              <div className="flex items-center justify-between pt-6 mt-4">
                <span className="small-note text-[#77736C] tabular-nums">
                  {t('แสดงสูงสุด 10 อันดับต่อหน้า · หน้า', 'Top 10 per page · Page')} {page} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="btn-surface py-2 px-4 text-[14px] disabled:opacity-40"
                  >
                    {t('← ก่อนหน้า', '← Previous')}
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="btn-surface py-2 px-4 text-[14px] disabled:opacity-40"
                  >
                    {t('ถัดไป →', 'Next →')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Heroes View */
          <div>
            <div className="pb-6">
              <h2 className="text-[24px] font-semibold text-[#1A1917]">
                {t('ทำเนียบวีรบุรุษแกรนด์โอลิมเพียด (Current Cycle Heroes)', 'Grand Olympiad Heroes by Eligible Class')}
              </h2>
              <p className="small-note text-[#77736C] mt-1 m-0">
                {heroesVerified
                  ? t('ข้อมูลยืนยันจากตาราง heroes ของเซิร์ฟเวอร์จริง', 'Verified from live GameServer heroes table')
                  : t(
                      'แสดงรายชื่อฮีโร่เมื่อมีข้อมูลที่ได้รับการยืนยันจากเซิร์ฟเวอร์จริงเท่านั้น',
                      'Displays verified class heroes once an Olympiad cycle concludes on the live GameServer.'
                    )}
              </p>
            </div>

            {loading ? (
              <div className="py-16 text-center text-[#77736C]">
                {t('กำลังโหลดทำเนียบฮีโร่...', 'Loading Olympiad Heroes...')}
              </div>
            ) : heroes.length === 0 ? (
              <div className="surface-stone p-10 text-center">
                <p className="lead-statement mx-auto text-[#1A1917]">
                  {t(
                    'ยังไม่มีข้อมูลฮีโร่ที่ได้รับการยืนยันในรอบปัจจุบัน · รายชื่อฮีโร่ทั้ง 35 คลาสจะแสดงเมื่อสิ้นสุดรอบการแข่งขันโอลิมเพียดบนเซิร์ฟเวอร์จริง',
                    'No verified Olympiad Heroes recorded yet · eligible class heroes will appear here once the live GameServer completes its Olympiad cycle.'
                  )}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('สายอาชีพ (Class)', 'Eligible Class')}</th>
                      <th>{t('ชื่อวีรบุรุษ (Hero Name)', 'Character Name')}</th>
                      <th>{t('แคลน (Clan)', 'Clan')}</th>
                      <th>{t('พันธมิตร (Alliance)', 'Alliance')}</th>
                      <th className="text-right">{t('สมัยที่เป็นฮีโร่', 'Hero Count')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heroes.map((h) => (
                      <tr key={`${h.classId}-${h.charName}`}>
                        <td className="font-semibold">{t(h.classNameTh, h.classNameEn)}</td>
                        <td className="font-semibold text-[#E97540]">{h.charName}</td>
                        <td>{h.clanName || '—'}</td>
                        <td>{h.allyName || '—'}</td>
                        <td className="text-right tabular-nums">{h.heroCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
