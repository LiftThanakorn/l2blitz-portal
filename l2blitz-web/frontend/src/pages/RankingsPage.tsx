import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { fetchApi } from '../lib/api';

interface PvpPkRow {
  rank: number;
  charName: string;
  classId: number;
  classNameEn: string;
  classNameTh: string;
  clanName: string | null;
  level: number;
  pvpKills: number;
  pkKills: number;
  online: boolean;
}

interface ClanRow {
  rank: number;
  clanName: string;
  leaderName: string;
  clanLevel: number;
  reputationScore: number;
  memberCount: number;
  castleName: string | null;
  allyName: string | null;
}

export function RankingsPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'pvp' | 'pk' | 'clans') || 'pvp';

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sourceMode, setSourceMode] = useState<'live_mysql' | 'dev_fixture' | 'unavailable'>('unavailable');
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [pvpRows, setPvpRows] = useState<PvpPkRow[]>([]);
  const [clanRows, setClanRows] = useState<ClanRow[]>([]);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const endpoint =
      activeTab === 'clans'
        ? `/api/rankings/clans?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
        : `/api/rankings/${activeTab}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;

    fetchApi<{
      items: (PvpPkRow & ClanRow)[];
      total: number;
      page: number;
      limit: number;
    }>(endpoint).then((res) => {
      if (cancelled) return;
      setSourceMode(res.source);
      setUpdatedAt(res.updatedAt);
      if (res.data && res.source !== 'dev_fixture') {
        if (activeTab === 'clans') {
          setClanRows(res.data.items as ClanRow[]);
        } else {
          setPvpRows(res.data.items as PvpPkRow[]);
        }
        setTotal(res.data.total);
      } else {
        setPvpRows([]);
        setClanRows([]);
        setTotal(0);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [activeTab, page, search]);

  const switchTab = (tab: 'pvp' | 'pk' | 'clans') => {
    setPage(1);
    setSearchParams({ tab });
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="editorial-frame pt-10 pb-16">
      {/* Masthead */}
      <div className="editorial-axis-grid items-end pb-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="small-note text-[#E97540] font-semibold m-0">
            {t('บันทึกสถิติการรบและทำเนียบแคลน', 'Combat Standings & Clan Ledger')}
          </p>
          <p className="body-copy text-[#77736C] mt-3">
            {t(
              'ติดตามอันดับ PvP, PK และแคลนที่มีผลงานโดดเด่นใน L2Blitz',
              'Explore PvP, PK and clan rankings in L2Blitz.'
            )}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <h1 className="display-title">
            {t('อันดับผู้เล่น', 'Combat & Clan')}
            <br />
            {t('และทำเนียบแคลน', 'Leaderboards')}
          </h1>
        </div>
      </div>

      {/* Quick Navigation Banner to Olympiad Rankings & Heroes */}
      <div className="surface-ink p-6 sm:p-8 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold text-[#F7F5F0]">
            {t('ต้องการดูอันดับแกรนด์โอลิมเพียดแยกตามคลาส และรายชื่อฮีโร่หรือไม่?', 'Looking for class-specific Grand Olympiad rankings and Heroes?')}
          </h2>
          <p className="small-note text-[#E8E3DB] mt-1 m-0">
            {t(
              'ดูอันดับ 1–3 ของทุกอาชีพและรายชื่อฮีโร่ในหน้าโอลิมเพียด',
              'See the top three players in every class and current Heroes.'
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link to="/olympiad" className="btn-primary text-[15px] py-2.5 px-5">
            {t('อันดับโอลิมเพียด →', 'Olympiad Rankings →')}
          </Link>
          <Link to="/olympiad?view=heroes" className="btn-surface text-[15px] py-2.5 px-5">
            {t('ทำเนียบฮีโร่ →', 'Olympiad Heroes →')}
          </Link>
        </div>
      </div>

      {/* Interactive Controls Bar (`data-ui`) */}
      <div data-ui className="surface-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
          <div className="flex flex-wrap gap-2" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'pvp'}
              onClick={() => switchTab('pvp')}
              className={`px-5 py-2.5 text-[15px] font-medium cursor-pointer border-0 ${
                activeTab === 'pvp'
                  ? 'bg-[#1A1917] text-[#F7F5F0]'
                  : 'bg-[#F0EDE7] text-[#1A1917] hover:bg-[#E8E3DB]'
              }`}
            >
              {t('อันดับสังหาร PvP', 'PvP Rankings')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'pk'}
              onClick={() => switchTab('pk')}
              className={`px-5 py-2.5 text-[15px] font-medium cursor-pointer border-0 ${
                activeTab === 'pk'
                  ? 'bg-[#1A1917] text-[#F7F5F0]'
                  : 'bg-[#F0EDE7] text-[#1A1917] hover:bg-[#E8E3DB]'
              }`}
            >
              {t('อันดับสังหาร PK', 'PK Rankings')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'clans'}
              onClick={() => switchTab('clans')}
              className={`px-5 py-2.5 text-[15px] font-medium cursor-pointer border-0 ${
                activeTab === 'clans'
                  ? 'bg-[#1A1917] text-[#F7F5F0]'
                  : 'bg-[#F0EDE7] text-[#1A1917] hover:bg-[#E8E3DB]'
              }`}
            >
              {t('อันดับแคลน', 'Clan Standings')}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="ranking-search" className="sr-only">
              {t('ค้นหาชื่อตัวละครหรือแคลน', 'Search character or clan')}
            </label>
            <input
              id="ranking-search"
              type="search"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder={t('ค้นหาชื่อตัวละคร / แคลน...', 'Search character or clan...')}
              className="px-4 py-2.5 bg-[#F0EDE7] text-[#1A1917] text-[15px] border-0 min-w-[240px]"
            />
          </div>
        </div>

        {/* Status & Source Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-3 px-4 bg-[#F7F5F0] mb-4 small-note text-[#77736C]">
          <span>
            {t('ข้อมูลอันดับ:', 'Standings:')}{' '}
            <strong className="text-[#1A1917]">
              {sourceMode === 'live_mysql'
                ? t('อัปเดตแล้ว', 'Updated')
                : sourceMode === 'dev_fixture'
                  ? t('ยังไม่มีข้อมูล', 'No standings yet')
                  : t('ยังไม่มีข้อมูล', 'No standings yet')}
            </strong>
          </span>
          {updatedAt && (
            <span className="tabular-nums">
              {t('อัปเดตล่าสุด:', 'Last checked:')} {new Date(updatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-16 text-center text-[#77736C]">
            {t('กำลังโหลดอันดับ...', 'Loading rankings...')}
          </div>
        ) : activeTab === 'clans' ? (
          clanRows.length === 0 ? (
            <div className="py-16 px-6 text-center surface-stone">
              <p className="lead-statement mx-auto text-[#1A1917]">
                {t(
                  'ยังไม่มีอันดับแคลนที่แสดงได้ในขณะนี้',
                  'No clan standings available right now.'
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('อันดับ', 'Rank')}</th>
                    <th>{t('ชื่อแคลน', 'Clan Name')}</th>
                    <th>{t('หัวหน้าแคลน', 'Leader')}</th>
                    <th className="text-right">{t('เลเวลแคลน', 'Level')}</th>
                    <th className="text-right">{t('คะแนนชื่อเสียง', 'Reputation')}</th>
                    <th className="text-right">{t('สมาชิก', 'Members')}</th>
                    <th>{t('ปราสาทที่ครอง', 'Castle Held')}</th>
                  </tr>
                </thead>
                <tbody>
                  {clanRows.map((row) => (
                    <tr key={row.clanName}>
                      <td className="font-semibold tabular-nums">#{row.rank}</td>
                      <td className="font-semibold">{row.clanName}</td>
                      <td>{row.leaderName}</td>
                      <td className="text-right tabular-nums">{row.clanLevel}</td>
                      <td className="text-right font-semibold text-[#E97540] tabular-nums">
                        {row.reputationScore.toLocaleString()}
                      </td>
                      <td className="text-right tabular-nums">{row.memberCount}</td>
                      <td>{row.castleName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : pvpRows.length === 0 ? (
          <div className="py-16 px-6 text-center surface-stone">
            <p className="lead-statement mx-auto text-[#1A1917]">
              {t(
                'ยังไม่มีอันดับผู้เล่นให้แสดงในขณะนี้',
                'No player rankings available right now.'
              )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('อันดับ', 'Rank')}</th>
                  <th>{t('ชื่อตัวละคร', 'Character')}</th>
                  <th>{t('สายอาชีพ (High Five)', 'Class')}</th>
                  <th>{t('แคลน', 'Clan')}</th>
                  <th className="text-right">{t('สังหาร PvP', 'PvP Kills')}</th>
                  <th className="text-right">{t('สังหาร PK', 'PK Kills')}</th>
                </tr>
              </thead>
              <tbody>
                {pvpRows.map((row) => (
                  <tr key={row.charName}>
                    <td className="font-semibold tabular-nums">#{row.rank}</td>
                    <td className="font-semibold">{row.charName}</td>
                    <td>{t(row.classNameTh, row.classNameEn)}</td>
                    <td>{row.clanName || '—'}</td>
                    <td
                      className={`text-right tabular-nums ${
                        activeTab === 'pvp' ? 'font-semibold text-[#E97540]' : ''
                      }`}
                    >
                      {row.pvpKills.toLocaleString()}
                    </td>
                    <td
                      className={`text-right tabular-nums ${
                        activeTab === 'pk' ? 'font-semibold text-[#E97540]' : ''
                      }`}
                    >
                      {row.pkKills.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-6 mt-4">
          <span className="small-note text-[#77736C] tabular-nums">
            {t('หน้า', 'Page')} {page} / {totalPages}
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
  );
}