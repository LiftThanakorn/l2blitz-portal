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

interface OlympiadClassTopThree {
  classId: number;
  classNameEn: string;
  classNameTh: string;
  race: string;
  raceTh: string;
  rows: OlympiadPublicRow[];
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

const RACE_SECTIONS = [
  { key: 'Human', th: 'มนุษย์', en: 'Human' },
  { key: 'Elf', th: 'เอลฟ์', en: 'Elf' },
  { key: 'Dark Elf', th: 'ดาร์คเอลฟ์', en: 'Dark Elf' },
  { key: 'Orc', th: 'ออร์ค', en: 'Orc' },
  { key: 'Dwarf', th: 'ดวอร์ฟ', en: 'Dwarf' },
  { key: 'Kamael', th: 'คามาเอล', en: 'Kamael' },
] as const;

export function OlympiadPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const viewMode = searchParams.get('view') === 'heroes' ? 'heroes' : 'rankings';
  const [cycle, setCycle] = useState<'current' | 'previous'>('current');
  const [loading, setLoading] = useState(true);
  const [sourceMode, setSourceMode] = useState<'live_mysql' | 'dev_fixture' | 'unavailable'>('unavailable');
  const [classStandings, setClassStandings] = useState<OlympiadClassTopThree[]>([]);
  const [dataAvailable, setDataAvailable] = useState(false);
  const [heroes, setHeroes] = useState<OlympiadHeroRow[]>([]);
  const [heroesVerified, setHeroesVerified] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    if (viewMode === 'heroes') {
      fetchApi<{ heroes: OlympiadHeroRow[]; verified: boolean }>('/api/olympiad/heroes').then((res) => {
        if (cancelled) return;
        setSourceMode(res.source);
        setHeroes(res.data?.heroes ?? []);
        setHeroesVerified(res.data?.verified ?? false);
        setLoading(false);
      });
    } else {
      fetchApi<{ classes: OlympiadClassTopThree[]; dataAvailable: boolean }>(
        `/api/olympiad/top-by-class?cycle=${cycle}`
      ).then((res) => {
        if (cancelled) return;
        setSourceMode(res.source);
        setDataAvailable(res.data?.dataAvailable ?? false);
        // Always render every class even while the backend is unavailable.
        setClassStandings(res.data?.classes ?? HIGH_FIVE_CLASSES.map((cls) => ({
          classId: cls.id,
          classNameEn: cls.nameEn,
          classNameTh: cls.nameTh,
          race: cls.race,
          raceTh: cls.raceTh,
          rows: [],
        })));
        setLoading(false);
      });
    }

    return () => { cancelled = true; };
  }, [viewMode, cycle]);

  const rankedClassCount = classStandings.filter((cls) => cls.rows.length > 0).length;

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
              onClick={() => setSearchParams({ view: 'rankings' })}
              className={`px-5 py-2.5 text-[15px] font-medium cursor-pointer border-0 ${
                viewMode === 'rankings'
                  ? 'bg-[#E97540] text-white'
                  : 'bg-[#252320] text-[#F7F5F0] hover:bg-[#3A3733]'
              }`}
            >
              {t('อันดับทุกอาชีพ (Top 3)', 'All Class Standings (Top 3)')}
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
          <div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 pb-7 border-b border-[#E8E3DB]">
              <div>
                <p className="small-note text-[#E97540] font-semibold mb-2">
                  {t('อันดับโอลิมเพียดแยกตามอาชีพ', 'OLYMPIAD CLASS LEADERBOARD')}
                </p>
                <h2 className="section-heading">
                  {t('ทุกอาชีพ · อันดับ 1–3', 'All Classes · Top 1–3')}
                </h2>
                <p className="body-copy text-[#77736C] mt-2">
                  {t(
                    `แสดงครบ ${classStandings.length} กลุ่มอาชีพ · มีผู้ผ่านเกณฑ์ ${rankedClassCount} อาชีพ · ไม่แสดงคะแนน`,
                    `All ${classStandings.length} class brackets · ${rankedClassCount} with qualified competitors · Points hidden`
                  )}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5" role="group" aria-label="Olympiad Cycle">
                <button
                  type="button"
                  aria-pressed={cycle === 'current'}
                  onClick={() => setCycle('current')}
                  className={`px-4 py-2.5 text-[14px] font-medium cursor-pointer border-0 ${cycle === 'current' ? 'bg-[#1A1917] text-[#F7F5F0]' : 'bg-[#F0EDE7] text-[#1A1917]'}`}
                >
                  {t('รอบปัจจุบัน', 'Current Cycle')}
                </button>
                <button
                  type="button"
                  aria-pressed={cycle === 'previous'}
                  onClick={() => setCycle('previous')}
                  className={`px-4 py-2.5 text-[14px] font-medium cursor-pointer border-0 ${cycle === 'previous' ? 'bg-[#1A1917] text-[#F7F5F0]' : 'bg-[#F0EDE7] text-[#1A1917]'}`}
                >
                  {t('รอบที่ผ่านมา', 'Previous Cycle')}
                </button>
              </div>
            </div>

            {!dataAvailable && sourceMode !== 'dev_fixture' && !loading && (
              <p className="mt-5 p-4 bg-[#F7F5F0] body-copy text-[#77736C]">
                {t('ยังเชื่อมต่อข้อมูลโอลิมเพียดจากเซิร์ฟเวอร์ไม่ได้ จึงไม่แสดงรายชื่อที่ไม่ได้ยืนยัน', 'Live Olympiad data is unavailable. No unverified player names are displayed.')}
              </p>
            )}

            {loading ? (
              <div className="py-20 text-center text-[#77736C]" role="status">
                {t('กำลังโหลดอันดับทุกอาชีพ...', 'Loading all class standings...')}
              </div>
            ) : (
              <div className="space-y-12 pt-9">
                {RACE_SECTIONS.map((race) => {
                  const classes = classStandings.filter((cls) => cls.race === race.key);
                  if (classes.length === 0) return null;
                  return (
                    <section key={race.key} aria-label={t(race.th, race.en)}>
                      <div className="flex items-baseline gap-3 border-b border-[#E8E3DB] pb-4 mb-5">
                        <h3 className="text-[23px] font-semibold text-[#1A1917] m-0">
                          {t(race.th, race.en)}
                        </h3>
                        <span className="small-note text-[#77736C] tabular-nums">
                          {classes.length} {t('อาชีพ', 'classes')}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {classes.map((cls) => (
                          <article key={cls.classId} className="border border-[#E8E3DB] bg-white min-w-0">
                            <div className="px-5 py-4 bg-[#F7F5F0] border-b border-[#E8E3DB]">
                              <h4 className="text-[17px] font-semibold text-[#1A1917] leading-snug m-0">
                                {t(cls.classNameTh, cls.classNameEn)}
                              </h4>
                              <span className="small-note text-[#77736C] mt-1 block">
                                {t('อันดับสูงสุด 3 คน', 'TOP 3')}
                              </span>
                            </div>
                            <ol className="m-0 p-0 list-none">
                              {[1, 2, 3].map((rank) => {
                                const player = cls.rows.find((entry) => entry.rank === rank);
                                return (
                                  <li key={rank} className="flex items-center gap-3 px-4 py-3.5 border-b last:border-b-0 border-[#F0EDE7] min-w-0">
                                    <span className={`flex items-center justify-center w-9 h-9 shrink-0 text-[14px] font-semibold tabular-nums ${rank === 1 ? 'bg-[#E97540] text-white' : 'bg-[#F0EDE7] text-[#57534E]'}`}>
                                      {rank}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <p className={`text-[15px] font-semibold m-0 truncate ${player ? 'text-[#1A1917]' : 'text-[#9D9992]'}`} title={player?.charName ?? undefined}>
                                        {player?.charName ?? '—'}
                                      </p>
                                      <p className="small-note text-[#77736C] m-0 mt-0.5 truncate" title={player?.clanName ?? undefined}>
                                        {player ? player.clanName || t('ไม่มีแคลน', 'No clan') : (!dataAvailable && sourceMode !== 'dev_fixture') ? t('รอเชื่อมต่อ', 'Unavailable') : t('ยังไม่มีผู้ผ่านเกณฑ์', 'No qualified player')}
                                      </p>
                                    </div>
                                  </li>
                                );
                              })}
                            </ol>
                          </article>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
            <p className="small-note text-[#77736C] mt-9">
              {t('เกณฑ์จัดอันดับ: ลงแข่งขันอย่างน้อย 15 นัด และชนะอย่างน้อย 1 นัด · จัดลำดับจากข้อมูลเซิร์ฟเวอร์ · ไม่แสดงคะแนน', 'Eligibility: at least 15 matches and 1 win · Server-side ranking · Points are hidden')}
            </p>
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