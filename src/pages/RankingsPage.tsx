import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Trophy,
  Swords,
  Skull,
  Users,
  Crown,
  Castle,
  Flame,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { apiClient } from '@/lib/apiClient';
import { THIRD_CLASS_LIST, OLYMPIAD_CLASSES } from '@shared/l2Classes';
import { DataFreshnessBar } from '@/components/DataFreshnessBar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Skeleton } from '@/components/ui/Primitives';
import { formatNumber, formatEpochDateTime } from '@/lib/utils';
import type {
  PlayerRankingsResponse,
  ClanRankingsResponse,
  OlympiadHeroesResponse,
  OlympiadRankingsResponse,
  CastlesResponse,
  TvtEventResponse,
  ApiMeta,
} from '@shared/schema';

type RankingTab = 'pvp' | 'pk' | 'clans' | 'olympiad_rankings' | 'heroes' | 'castles' | 'tvt';

export const RankingsPage: React.FC = () => {
  const { lang, t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as RankingTab) || 'pvp';

  const [tab, setTab] = useState<RankingTab>(
    ['pvp', 'pk', 'clans', 'olympiad_rankings', 'heroes', 'castles', 'tvt'].includes(initialTab) ? initialTab : 'pvp'
  );
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [classFilter, setClassFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Olympiad Rankings specific state
  const [olympiadCycle, setOlympiadCycle] = useState<'current' | 'previous'>('current');
  const [olympiadPage, setOlympiadPage] = useState(1);
  const [olympiadSearchQuery, setOlympiadSearchQuery] = useState('');

  const [playerData, setPlayerData] = useState<PlayerRankingsResponse | null>(null);
  const [clanData, setClanData] = useState<ClanRankingsResponse | null>(null);
  const [heroData, setHeroData] = useState<OlympiadHeroesResponse | null>(null);
  const [olympiadRankingsData, setOlympiadRankingsData] = useState<OlympiadRankingsResponse | null>(null);
  const [castleData, setCastleData] = useState<CastlesResponse | null>(null);
  const [tvtData, setTvtData] = useState<TvtEventResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const handleTabChange = (nextTab: RankingTab) => {
    setTab(nextTab);
    setPage(1);
    setOlympiadPage(1);
    setSearchParams({ tab: nextTab });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'pvp' || tab === 'pk') {
        const res = await apiClient.getPlayerRankings({
          type: tab,
          page,
          limit,
          classId: classFilter,
          q: searchQuery,
        });
        setPlayerData(res);
      } else if (tab === 'clans') {
        const res = await apiClient.getClanRankings(page, limit);
        setClanData(res);
      } else if (tab === 'olympiad_rankings') {
        const res = await apiClient.getOlympiadRankings({
          classId: classFilter,
          cycle: olympiadCycle,
          page: olympiadPage,
          limit: 10,
        });
        setOlympiadRankingsData(res);
      } else if (tab === 'heroes') {
        const res = await apiClient.getOlympiadHeroes();
        setHeroData(res);
      } else if (tab === 'castles') {
        const res = await apiClient.getCastles();
        setCastleData(res);
      } else if (tab === 'tvt') {
        const res = await apiClient.getTvtEvent();
        setTvtData(res);
      }
    } catch {
      // Handled via empty/unavailable state
    } finally {
      setLoading(false);
    }
  }, [tab, page, limit, classFilter, searchQuery, olympiadCycle, olympiadPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeMeta: ApiMeta | undefined =
    tab === 'pvp' || tab === 'pk'
      ? playerData?.meta
      : tab === 'clans'
        ? clanData?.meta
        : tab === 'olympiad_rankings'
          ? olympiadRankingsData?.meta
          : tab === 'heroes'
            ? heroData?.meta
            : tab === 'castles'
              ? castleData?.meta
              : tvtData?.meta;

  const tabs: Array<{ id: RankingTab; label: string; icon: React.ElementType }> = [
    { id: 'pvp', label: t('Top PvP', 'Top PvP'), icon: Swords },
    { id: 'pk', label: t('Top PK', 'Top PK'), icon: Skull },
    { id: 'clans', label: t('อันดับแคลน', 'Clan Rankings'), icon: Users },
    { id: 'olympiad_rankings', label: t('อันดับโอลิมเพียดตามอาชีพ', 'Olympiad by Class'), icon: Trophy },
    { id: 'heroes', label: t('ฮีโร่โอลิมเพียด', 'Olympiad Heroes'), icon: Crown },
    { id: 'castles', label: t('การครองปราสาท', 'Castle Ownership'), icon: Castle },
    { id: 'tvt', label: t('สถิติ TvT', 'TvT Rankings'), icon: Flame },
  ];

  const totalPages =
    tab === 'pvp' || tab === 'pk'
      ? Math.max(1, Math.ceil((playerData?.total ?? 0) / limit))
      : tab === 'clans'
        ? Math.max(1, Math.ceil((clanData?.total ?? 0) / limit))
        : 1;

  return (
    <div className="space-y-6">
      <DataFreshnessBar meta={activeMeta} onRefresh={loadData} loading={loading} />

      <div>
        <div className="flex items-center gap-2">
          <Badge variant="ice">L2J MOBIUS H5 SQL FILTERED</Badge>
          <Badge variant="outline">GM & DELETED CHARS EXCLUDED</Badge>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
          <Trophy className="h-7 w-7 text-sky-400" />
          <span>{t('จัดอันดับผู้เล่นและแคลน (Server Rankings)', 'Server Rankings & Hall of Fame')}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t(
            'คัดกรองเฉพาะผู้เล่นจริง (accesslevel = 0, deletetime = 0) รองรับอาชีพ Kamael ขั้น 3 ครบถ้วนตามมาตรฐาน High Five',
            'Filtered for legitimate active players (accesslevel = 0, deletetime = 0) with full High Five & Kamael class support.'
          )}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabChange(item.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                active
                  ? 'bg-sky-500 text-slate-950'
                  : 'border border-slate-800 bg-[#0d1322] text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar for PvP / PK */}
      {(tab === 'pvp' || tab === 'pk') && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0d1322] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={t('ค้นหาชื่อตัวละคร หรือ แคลน...', 'Search character or clan...')}
                className="rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">
                {t('เลือกอาชีพ:', 'Select Class:')}
              </span>
              <select
                aria-label="Filter by High Five Class"
                value={classFilter ?? ''}
                onChange={(e) => {
                  setClassFilter(e.target.value === '' ? null : Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none cursor-pointer"
              >
                <option value="">
                  {t('ทุกอาชีพ (All 34 High Five Classes)', 'All 34 High Five Classes')}
                </option>
                {THIRD_CLASS_LIST.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.race}] {c.name} (Class #{c.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            {t('พบข้อมูลทั้งหมด:', 'Total Matching:')}{' '}
            <strong className="font-mono text-white">{playerData?.total ?? 0}</strong>
          </div>
        </div>
      )}

      {/* Filter & Cycle Controller Bar for Olympiad Rankings by Class */}
      {tab === 'olympiad_rankings' && (
        <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Cycle Selector Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (olympiadCycle !== 'current') {
                    setOlympiadCycle('current');
                    setOlympiadPage(1);
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  olympiadCycle === 'current'
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  {t('รอบปัจจุบัน (Current Cycle)', 'Current Cycle')}
                  {olympiadRankingsData?.cycleNumber ? ` #${olympiadRankingsData.cycleNumber}` : ''}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (olympiadCycle !== 'previous') {
                    setOlympiadCycle('previous');
                    setOlympiadPage(1);
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  olympiadCycle === 'previous'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {t('รอบก่อนหน้า (Previous Cycle)', 'Previous Cycle')}
                  {olympiadRankingsData?.cycleNumber && olympiadCycle === 'previous'
                    ? ` #${olympiadRankingsData.cycleNumber}`
                    : ''}
                </span>
              </button>
            </div>

            {/* Class Filter & Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">
                  {t('กรองอาชีพ:', 'Filter Class:')}
                </span>
                <select
                  aria-label="Filter by Olympiad Class"
                  value={classFilter ?? ''}
                  onChange={(e) => {
                    setClassFilter(e.target.value === '' ? null : Number(e.target.value));
                    setOlympiadPage(1);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none cursor-pointer"
                >
                  <option value="">
                    {t('ทุกอาชีพ (All 33 Olympiad Classes)', 'All 33 Olympiad Classes')}
                  </option>
                  {OLYMPIAD_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.race}] {c.name} {c.id === 132 ? '(Male/Female)' : `(#${c.id})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Class Search (when all classes are shown) */}
              {classFilter === null && (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={olympiadSearchQuery}
                    onChange={(e) => setOlympiadSearchQuery(e.target.value)}
                    placeholder={t('ค้นหาชื่ออาชีพ...', 'Filter class name...')}
                    className="rounded-lg border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none w-36 sm:w-44"
                  />
                </div>
              )}

              {classFilter !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setClassFilter(null);
                    setOlympiadPage(1);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-sky-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('← แสดงทุกอาชีพ', '← Show All Classes')}
                </button>
              )}
            </div>
          </div>

          {/* Rules and Privacy Badge Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px] text-sky-300 border-sky-500/30">
                {lang === 'th'
                  ? olympiadRankingsData?.periodNameTh ?? 'สถานะรอบการแข่งขัน'
                  : olympiadRankingsData?.periodNameEn ?? 'Cycle Status'}
              </Badge>
              <span>
                {t('เกณฑ์แข่งขันขั้นต่ำ:', 'Min participation:')}{' '}
                <strong className="text-white font-mono">
                  {olympiadRankingsData?.minMatchesRequired ?? 9}
                </strong>{' '}
                {t('รอบ (ตาม Mobius H5 Config)', 'matches (Mobius H5 config)')}
              </span>
              <span className="hidden md:inline text-slate-600">|</span>
              <span className="hidden md:inline">
                {t('จัดอันดับ:', 'Tie-breaker:')} คะแนน &gt; แข่งสะสม &gt; ชัยชนะ &gt; Char ID
              </span>
            </div>
            <div className="text-sky-300 font-medium">
              🔒 {t('คะแนนใช้จัดอันดับภายในระบบ (ไม่แสดงตัวเลขบนเว็บไซต์)', 'Points used internally (strictly private)')}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Table per Tab */}
      <Card>
        <CardHeader>
          <CardTitle>
            {tab === 'pvp' && t('ตารางอันดับสังหาร PvP (Top PvP)', 'Top PvP Leaderboard')}
            {tab === 'pk' && t('ตารางอันดับสังหาร PK (Top PK)', 'Top PK Leaderboard')}
            {tab === 'clans' && t('ตารางอันดับแคลน (Clan Rankings)', 'Top Clans by Level & Reputation')}
            {tab === 'olympiad_rankings' && t('อันดับผู้เข้าแข่งขันโอลิมเพียดแยกตามอาชีพ (Olympiad by Class)', 'Olympiad Rankings by Class (Current Cycle)')}
            {tab === 'heroes' && t('ทำเนียบฮีโร่โอลิมเพียด (Olympiad Heroes)', 'Current Olympiad Heroes')}
            {tab === 'castles' && t('สถานะการครอบครองปราสาททั้ง 9 แห่ง', 'Castle Ownership & Siege Schedule')}
            {tab === 'tvt' && t('อันดับผู้เล่นกิจกรรม Team vs Team (TvT)', 'TvT Event Leaderboard')}
          </CardTitle>
          <CardDescription>
            {tab === 'olympiad_rankings'
              ? t(
                  'เรียงลำดับผู้เข้าแข่งขันตามคะแนนโอลิมเพียดภายในระบบ (อันดับ 1 คือผู้มีคะแนนสูงสุดของแต่ละอาชีพ โดยไม่เปิดเผยตัวเลขคะแนนบนเว็บไซต์)',
                  'Ranked by internal Olympiad points (Rank 1 represents class leader; exact points remain private).'
                )
              : tab === 'pvp' || tab === 'pk'
                ? t(
                    'แสดงสถานะออนไลน์เฉพาะเมื่อตรวจสอบแล้วว่า GameServer ทำงานอยู่จริง',
                    'Online indicator is verified against live GameServer TCP status.'
                  )
                : t(
                    'ข้อมูลอ่านอย่างเดียวจากฐานข้อมูล L2J Mobius CT 2.6 High Five',
                    'Read-only snapshot from L2J Mobius CT 2.6 High Five database.'
                  )}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (tab === 'pvp' || tab === 'pk') ? (
            playerData && playerData.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Rank</th>
                      <th className="px-4 py-3 font-medium">{t('ชื่อตัวละคร', 'Character')}</th>
                      <th className="px-4 py-3 font-medium">{t('อาชีพ (H5)', 'Class')}</th>
                      <th className="px-4 py-3 font-medium">Lv.</th>
                      <th className="px-4 py-3 font-medium">{t('แคลน', 'Clan')}</th>
                      <th className="px-4 py-3 text-right font-medium">PvP Kills</th>
                      <th className="px-4 py-3 text-right font-medium">PK Kills</th>
                      <th className="px-4 py-3 text-right font-medium">Fame (H5)</th>
                      <th className="px-4 py-3 text-center font-medium">{t('สถานะ', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {playerData.items.map((p) => (
                      <tr key={p.charName} className="hover:bg-slate-900/40">
                        <td className="px-4 py-3 font-mono font-bold text-sky-400">#{p.rank}</td>
                        <td className="px-4 py-3 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span>{p.charName}</span>
                            {p.nobless && (
                              <Badge variant="ice" className="text-[10px] px-1.5 py-0">
                                Noble
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{p.className}</td>
                        <td className="px-4 py-3 font-mono text-slate-300">{p.level}</td>
                        <td className="px-4 py-3 text-slate-400">{p.clanName ?? '-'}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-sky-300">
                          {formatNumber(p.flagKills)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-rose-300">
                          {formatNumber(p.pkKills)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-300">
                          {formatNumber(p.fame)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.online === true ? (
                            <Badge variant="success">Online</Badge>
                          ) : p.online === false ? (
                            <Badge variant="outline">Offline</Badge>
                          ) : (
                            <Badge variant="warning">Unknown</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-sm text-slate-400">
                {t('ไม่พบข้อมูลตัวละครที่ตรงกับเงื่อนไข หรือฐานข้อมูลยังไม่พร้อมใช้งาน', 'No matching characters found or database is unavailable.')}
              </div>
            )
          ) : tab === 'clans' ? (
            clanData && clanData.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Rank</th>
                      <th className="px-4 py-3 font-medium">{t('ชื่อแคลน', 'Clan Name')}</th>
                      <th className="px-4 py-3 font-medium">Lv.</th>
                      <th className="px-4 py-3 font-medium">{t('หัวหน้าแคลน', 'Leader')}</th>
                      <th className="px-4 py-3 font-medium">{t('พันธมิตร', 'Alliance')}</th>
                      <th className="px-4 py-3 font-medium">{t('ปราสาทที่ครอง', 'Castle')}</th>
                      <th className="px-4 py-3 text-right font-medium">{t('สมาชิก', 'Members')}</th>
                      <th className="px-4 py-3 text-right font-medium">{t('คะแนนชื่อเสียง', 'Reputation')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {clanData.items.map((c) => (
                      <tr key={c.clanId} className="hover:bg-slate-900/40">
                        <td className="px-4 py-3 font-mono font-bold text-sky-400">#{c.rank}</td>
                        <td className="px-4 py-3 font-semibold text-white">{c.clanName}</td>
                        <td className="px-4 py-3 font-mono text-sky-300">{c.clanLevel}</td>
                        <td className="px-4 py-3 text-slate-300">{c.leaderName}</td>
                        <td className="px-4 py-3 text-slate-400">{c.allyName ?? '-'}</td>
                        <td className="px-4 py-3">
                          {c.castleName ? (
                            <Badge variant="ice">{c.castleName} Castle</Badge>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-300">
                          {c.memberCount}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-white">
                          {formatNumber(c.reputationScore)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-sm text-slate-400">
                {t('ยังไม่มีข้อมูลแคลนในขณะนี้', 'No clan rankings available.')}
              </div>
            )
          ) : tab === 'olympiad_rankings' ? (
            olympiadRankingsData && olympiadRankingsData.enabled ? (
              olympiadCycle === 'previous' && !olympiadRankingsData.hasPreviousData ? (
                /* Clear "No Previous Data" State */
                <div className="p-12 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-amber-400 border border-slate-700">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    {t('ยังไม่มีข้อมูลการแข่งขันของรอบก่อนหน้า', 'No Previous Cycle Data Available')}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    {t(
                      'ตารางประวัติการแข่งขันสิ้นสุดรอบ (olympiad_nobles_eom) จะถูกบันทึกโดยอัตโนมัติเมื่อ GameServer ประมวลผลสิ้นสุดรอบการแข่งขัน (End of Month)',
                      'The historical archive (olympiad_nobles_eom) will be populated automatically when the GameServer finishes the competition period.'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOlympiadCycle('current');
                      setOlympiadPage(1);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/20 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{t('กลับไปดูรอบปัจจุบัน (Current Cycle)', 'Switch to Current Cycle')}</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Class Groups Display */}
                  {(() => {
                    const displayGroups = olympiadRankingsData.classes.filter((group) => {
                      if (classFilter !== null) return group.classId === classFilter;
                      if (!olympiadSearchQuery.trim()) return true;
                      const q = olympiadSearchQuery.toLowerCase();
                      return (
                        group.className.toLowerCase().includes(q) ||
                        group.race.toLowerCase().includes(q) ||
                        String(group.classId).includes(q)
                      );
                    });

                    if (displayGroups.length === 0) {
                      return (
                        <div className="p-10 text-center text-xs text-slate-400 space-y-2">
                          <p>{t('ไม่พบข้อมูลอาชีพที่ตรงกับการค้นหา', 'No classes match your search query.')}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setOlympiadSearchQuery('');
                              setClassFilter(null);
                            }}
                            className="text-sky-400 underline hover:text-sky-300 cursor-pointer"
                          >
                            {t('ล้างตัวกรองทั้งหมด', 'Clear all filters')}
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className={classFilter !== null ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                        {displayGroups.map((group) => {
                          const isSingleClassMode = classFilter !== null;
                          const totalClassPages = Math.max(1, Math.ceil(group.totalPlayers / 10));

                          return (
                            <div
                              key={group.classId}
                              className={`rounded-xl border border-slate-800 bg-[#090d18] overflow-hidden ${
                                isSingleClassMode ? 'max-w-3xl mx-auto shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2.5 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                  <Crown className="h-4 w-4 text-sky-400" />
                                  <h4 className="font-bold text-white text-xs sm:text-sm">
                                    {group.className}
                                  </h4>
                                  {group.classId === 132 && (
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-sky-300 border-sky-500/30">
                                      Male &amp; Female Combined
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    {group.race}
                                  </Badge>
                                  <span className="font-mono text-[10px] text-slate-400">
                                    #{group.classId}
                                  </span>
                                  <span className="text-[10px] text-slate-400 ml-1">
                                    ({group.totalPlayers} {t('คน', 'players')})
                                  </span>
                                </div>
                              </div>

                              {group.players.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs">
                                    <thead className="border-b border-slate-800/80 bg-slate-900/40 text-slate-400">
                                      <tr>
                                        <th className="px-3.5 py-2 w-16 font-medium">{t('อันดับ', 'Rank')}</th>
                                        <th className="px-3.5 py-2 font-medium">{t('ชื่อตัวละคร', 'Character')}</th>
                                        <th className="px-3.5 py-2 font-medium">{t('แคลน', 'Clan')}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                      {group.players.map((player) => (
                                        <tr key={`${group.classId}-${player.charName}`} className="hover:bg-slate-900/40">
                                          <td className="px-3.5 py-2 font-mono font-bold">
                                            {player.rank === 1 ? (
                                              <span className="inline-flex items-center gap-1 text-amber-300 font-extrabold">
                                                <Crown className="h-3 w-3 text-amber-400" />
                                                1
                                              </span>
                                            ) : player.rank === 2 ? (
                                              <span className="text-slate-300 font-bold">2</span>
                                            ) : player.rank === 3 ? (
                                              <span className="text-amber-600 font-bold">3</span>
                                            ) : (
                                              <span className="text-slate-400">{player.rank}</span>
                                            )}
                                          </td>
                                          <td className="px-3.5 py-2 font-semibold text-white">
                                            {player.charName}
                                          </td>
                                          <td className="px-3.5 py-2 text-slate-300">
                                            {player.clanName || '-'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="py-6 px-4 text-center text-xs text-slate-500 italic">
                                  {t('ไม่มีผู้เข้าแข่งขันที่มีสิทธิ์ในอาชีพนี้ (ยังไม่ผ่านเกณฑ์ขั้นต่ำ)', 'No eligible contestants for this class yet.')}
                                </div>
                              )}

                              {/* Card Footer: View More / Pagination Controls */}
                              {isSingleClassMode ? (
                                totalClassPages > 1 && (
                                  <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-900/40 px-4 py-2.5 text-xs text-slate-400">
                                    <span>
                                      {t('หน้า', 'Page')} <strong className="text-white">{olympiadPage}</strong> / {totalClassPages}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        disabled={olympiadPage <= 1 || loading}
                                        onClick={() => setOlympiadPage((p) => Math.max(1, p - 1))}
                                        className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-200 hover:bg-slate-800 disabled:opacity-40 cursor-pointer text-xs"
                                      >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                        <span>{t('ก่อนหน้า', 'Prev')}</span>
                                      </button>
                                      <button
                                        type="button"
                                        disabled={olympiadPage >= totalClassPages || loading}
                                        onClick={() => setOlympiadPage((p) => Math.min(totalClassPages, p + 1))}
                                        className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-200 hover:bg-slate-800 disabled:opacity-40 cursor-pointer text-xs"
                                      >
                                        <span>{t('ถัดไป', 'Next')}</span>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                )
                              ) : (
                                group.totalPlayers > 10 && (
                                  <div className="border-t border-slate-800/60 bg-slate-900/30 px-3.5 py-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setClassFilter(group.classId);
                                        setOlympiadPage(1);
                                      }}
                                      className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                                    >
                                      <span>
                                        {t('ดูอันดับเพิ่มเติม', 'View More Ranks')} ({group.totalPlayers} {t('คน', 'players')})
                                      </span>
                                      <ChevronRight className="h-3 w-3" />
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )
            ) : (
              <div className="p-10 text-center text-sm text-slate-400">
                {t('ระบบ Olympiad ยังไม่เปิดใช้งานหรือยังไม่มีข้อมูลการแข่งขัน', 'Olympiad data is currently unavailable.')}
              </div>
            )
          ) : tab === 'heroes' ? (
            heroData && heroData.enabled && heroData.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">{t('อาชีพ (High Five)', 'Class')}</th>
                      <th className="px-4 py-3 font-medium">{t('ชื่อฮีโร่', 'Hero Name')}</th>
                      <th className="px-4 py-3 font-medium">{t('แคลน', 'Clan')}</th>
                      <th className="px-4 py-3 text-center font-medium">{t('สมัยที่เป็นฮีโร่', 'Hero Count')}</th>
                      <th className="px-4 py-3 font-medium">{t('ข้อความประกาศ (Hero Message)', 'Hero Message')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {heroData.items.map((h) => (
                      <tr key={`${h.classId}-${h.charName}`} className="hover:bg-slate-900/40">
                        <td className="px-4 py-3 font-medium text-sky-300">{h.className}</td>
                        <td className="px-4 py-3 font-bold text-white">{h.charName}</td>
                        <td className="px-4 py-3 text-slate-300">{h.clanName ?? '-'}</td>
                        <td className="px-4 py-3 text-center font-mono text-amber-300">
                          {h.heroCount}x
                        </td>
                        <td className="px-4 py-3 italic text-slate-400">
                          {h.message || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-sm text-slate-400">
                {t('ระบบ Olympiad Heroes ยังไม่เปิดใช้งานหรือยังไม่มีผู้ได้รับตำแหน่งในรอบนี้', 'Olympiad Heroes are not yet active for the current cycle.')}
              </div>
            )
          ) : tab === 'castles' ? (
            castleData && castleData.enabled && castleData.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">{t('ปราสาท', 'Castle')}</th>
                      <th className="px-4 py-3 font-medium">{t('แคลนผู้ครอบครอง', 'Owner Clan')}</th>
                      <th className="px-4 py-3 font-medium">{t('เจ้าเมือง (Leader)', 'Lord / Leader')}</th>
                      <th className="px-4 py-3 font-medium">{t('พันธมิตร', 'Alliance')}</th>
                      <th className="px-4 py-3 text-right font-medium">{t('ภาษี', 'Tax %')}</th>
                      <th className="px-4 py-3 font-medium">{t('วันเวลาชิงปราสาทรอบถัดไป', 'Next Siege Date')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {castleData.items.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-900/40">
                        <td className="px-4 py-3 font-bold text-white">{c.name} Castle</td>
                        <td className="px-4 py-3">
                          {c.ownerClan ? (
                            <Badge variant="ice">{c.ownerClan}</Badge>
                          ) : (
                            <span className="text-slate-500">{t('NPC ปกครอง (ว่าง)', 'NPC Controlled')}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{c.leaderName ?? '-'}</td>
                        <td className="px-4 py-3 text-slate-400">{c.allyName ?? '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-300">
                          {c.taxPercent}%
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">
                          {formatEpochDateTime(c.siegeDate, lang)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-sm text-slate-400">
                {t('ยังไม่มีข้อมูลการครอบครองปราสาทในขณะนี้', 'Castle ownership information is currently unavailable.')}
              </div>
            )
          ) : (
            /* TvT Rankings Tab */
            <div className="p-6">
              {tvtData && tvtData.rankingsAvailable && tvtData.topPlayers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Rank</th>
                        <th className="px-4 py-3 font-medium">{t('ชื่อตัวละคร', 'Character')}</th>
                        <th className="px-4 py-3 font-medium">{t('อาชีพ', 'Class')}</th>
                        <th className="px-4 py-3 text-right font-medium">{t('สังหารใน TvT', 'TvT Kills')}</th>
                        <th className="px-4 py-3 text-right font-medium">{t('ชนะสะสม', 'Matches Won')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {tvtData.topPlayers.map((tp) => (
                        <tr key={tp.charName} className="hover:bg-slate-900/40">
                          <td className="px-4 py-3 font-mono font-bold text-sky-400">#{tp.rank}</td>
                          <td className="px-4 py-3 font-semibold text-white">{tp.charName}</td>
                          <td className="px-4 py-3 text-slate-300">{tp.className}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-sky-300">
                            {tp.kills}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-300">
                            {tp.wins}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                  <p className="font-semibold text-slate-200">
                    {t(
                      'รอเปิดใช้งานตารางบันทึกสถิติ TvT จาก GameServer จริง',
                      'Pending Custom TvT SQL Table Verification on Live GameServer'
                    )}
                  </p>
                  <p>
                    {t(
                      'ในระบบมาตรฐาน L2J Mobius CT 2.6 High Five กิจกรรม TvT จะประมวลผลในหน่วยความจำ (TeamVersusTeam.ini) เมื่อเชื่อมต่อตารางสถิติเสริมแล้ว อันดับจะแสดงที่นี่โดยอัตโนมัติ',
                      'In standard L2J Mobius CT 2.6 High Five, TvT runs in-memory via TeamVersusTeam.ini. Once custom SQL persistence is enabled on the GameServer, live rankings will appear here.'
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pagination Footer for PvP / PK / Clans */}
          {(tab === 'pvp' || tab === 'pk' || tab === 'clans') && (
            <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3 text-xs text-slate-400">
              <span>
                {t('หน้า', 'Page')} <strong className="text-white">{page}</strong> / {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-200 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>{t('ก่อนหน้า', 'Prev')}</span>
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-200 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <span>{t('ถัดไป', 'Next')}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
