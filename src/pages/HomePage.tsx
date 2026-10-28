import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Swords,
  Users,
  Shield,
  Skull,
  Download,
  Server,
  ChevronRight,
  Zap,
  Award,
  Activity,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { apiClient } from '@/lib/apiClient';
import { SITE_CONFIG } from '@/config/siteConfig';
import { DataFreshnessBar } from '@/components/DataFreshnessBar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Skeleton } from '@/components/ui/Primitives';
import { formatNumber, formatEpochDateTime } from '@/lib/utils';
import type {
  ServerStatsResponse,
  PlayerRankingsResponse,
  RaidBossesResponse,
} from '@shared/schema';

export const HomePage: React.FC = () => {
  const { lang, t } = useI18n();
  const [stats, setStats] = useState<ServerStatsResponse | null>(null);
  const [topPvp, setTopPvp] = useState<PlayerRankingsResponse | null>(null);
  const [topPk, setTopPk] = useState<PlayerRankingsResponse | null>(null);
  const [bosses, setBosses] = useState<RaidBossesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, pvpRes, pkRes, bossRes] = await Promise.all([
        apiClient.getServerStats(),
        apiClient.getPlayerRankings({ type: 'pvp', page: 1, limit: 5 }),
        apiClient.getPlayerRankings({ type: 'pk', page: 1, limit: 5 }),
        apiClient.getRaidBosses(),
      ]);
      setStats(sRes);
      setTopPvp(pvpRes);
      setTopPk(pkRes);
      setBosses(bossRes);
    } catch (err) {
      setError((err as Error).message || 'Failed to load portal data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const rates = SITE_CONFIG.serverInfo.rates;

  return (
    <div className="space-y-8">
      <DataFreshnessBar meta={stats?.meta} onRefresh={fetchAll} loading={loading} />

      {/* Hero Section — Ultra-Premium Dark Gaming Experience */}
      <section className="relative overflow-hidden rounded-3xl border border-sky-900/40 bg-[#080d1a] shadow-2xl shadow-sky-950/20">
        {/* Cinematic Backdrop Image */}
        <div
          className="absolute inset-0 bg-cover bg-right lg:bg-center brightness-105 contrast-110"
          style={{ backgroundImage: `url('/images/hero/hero-bg-ultra.jpg')` }}
          aria-hidden="true"
        />

        {/* Master Glassmorphism & Shadow Overlays for Crisp Typographic Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060a14] via-[#060a14]/90 to-transparent lg:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#060a14]/40 to-[#060a14]/90" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-950/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-300 backdrop-blur-md shadow-inner">
                  <Swords className="h-3.5 w-3.5 text-sky-400" />
                  Lineage II High Five (CT 2.6)
                </span>
                <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md">
                  Instant PvP Thailand
                </span>
                <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-950/60 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md">
                  Max Level 85
                </span>
              </div>

              <div>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                  L2BLITZ <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">PVP</span>
                </h1>
                <p className="mt-3 max-w-xl text-base sm:text-lg font-medium leading-relaxed text-slate-200 drop-shadow-md">
                  {SITE_CONFIG.brand.tagline[lang]}
                </p>
              </div>

              <div className="rounded-xl border border-sky-900/50 bg-[#090f1f]/85 p-3.5 text-xs text-slate-300 backdrop-blur-md max-w-xl border-l-4 border-l-sky-400 shadow-md">
                {SITE_CONFIG.brand.accountRegistrationNotice[lang]}
              </div>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/downloads"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-sky-300 hover:shadow-sky-400/40 transition-all cursor-pointer"
                >
                  <Download className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                  <span>{t('ดาวน์โหลดตัวเกม / Launcher', 'Download Launcher / Client')}</span>
                </Link>

                <Link
                  to="/server-info"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/90 px-6 py-3.5 text-sm font-semibold text-slate-100 backdrop-blur-md hover:border-sky-500/60 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                >
                  <Server className="h-4 w-4 text-sky-400" />
                  <span>{t('ข้อมูลระบบ & เรทเซิร์ฟเวอร์', 'Server Systems & Rates')}</span>
                </Link>
              </div>
            </div>

            {/* Live Server Status & Summary Stat Cards with Glassmorphism */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
              <div className="rounded-2xl border border-slate-700/60 bg-[#070b16]/90 p-4.5 backdrop-blur-md shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{t('สถานะเซิร์ฟเวอร์เกม', 'GameServer Status')}</span>
                  <Activity className="h-4 w-4 text-sky-400" />
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      stats?.gameServerStatus === 'online'
                        ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
                        : stats?.gameServerStatus === 'offline'
                          ? 'bg-rose-500'
                          : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-xl font-extrabold uppercase text-white">
                    {loading ? '...' : stats?.gameServerStatus ?? 'Unknown'}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  DB: <strong className="uppercase text-slate-200">{stats?.databaseStatus ?? 'Unknown'}</strong>
                </p>
              </div>

              <div className="rounded-2xl border border-sky-900/40 bg-[#070b16]/90 p-4.5 backdrop-blur-md shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{t('ผู้เล่นออนไลน์ขณะนี้', 'Players Online')}</span>
                  <Users className="h-4 w-4 text-sky-400" />
                </div>
                <div className="mt-2 text-3xl font-extrabold font-mono text-sky-300 drop-shadow-[0_2px_10px_rgba(56,189,248,0.3)]">
                  {loading
                    ? '...'
                    : formatNumber(
                        stats?.playersOnline,
                        t('ไม่พร้อมใช้งาน', 'Unavailable')
                      )}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {t('ตรวจสอบคู่กับ TCP พอร์ต 7777', 'Verified with TCP Port 7777')}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700/60 bg-[#070b16]/90 p-4.5 backdrop-blur-md shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{t('ตัวละครทั้งหมด', 'Total Characters')}</span>
                  <Swords className="h-4 w-4 text-sky-400" />
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-white">
                  {loading
                    ? '...'
                    : formatNumber(
                        stats?.totalCharacters,
                        t('ไม่พร้อมใช้งาน', 'Unavailable')
                      )}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {t('ตัด GM และตัวละครที่ลบแล้ว', 'Excludes GMs & deleted')}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700/60 bg-[#070b16]/90 p-4.5 backdrop-blur-md shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{t('แคลน / เลเวล 85', 'Clans / Lv.85 Chars')}</span>
                  <Award className="h-4 w-4 text-sky-400" />
                </div>
                <div className="mt-2 text-xl font-bold font-mono text-white">
                  {loading
                    ? '...'
                    : `${formatNumber(stats?.totalClans, '-')} / ${formatNumber(stats?.maxLevelCount, '-')}`}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {t('ฮีโร่โอลิมเพียด:', 'Active Heroes:')}{' '}
                  <strong className="text-amber-300">
                    {formatNumber(stats?.activeHeroesCount, '-')}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-900/80 bg-rose-950/40 p-4 text-sm text-rose-200">
          {t('เกิดข้อผิดพลาดในการโหลดข้อมูล:', 'Error loading data:')} {error}
        </div>
      )}

      {/* Server Rates Summary Strip */}
      <section aria-label="Server Rates Summary">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-sky-400" />
            <span>{t('อัตราเรทเซิร์ฟเวอร์โดยสรุป (High Five Instant PvP)', 'Server Rates Summary')}</span>
          </h2>
          <Link
            to="/server-info"
            className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300"
          >
            <span>{t('ดูเรทและการตีบวกทั้งหมด', 'Full Enchant & Element Rates')}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'EXP / SP', value: `x${rates.exp}` },
            { label: 'Adena Drop', value: `x${rates.adena}` },
            { label: 'Item Drop / Spoil', value: `x${rates.drop} / x${rates.spoil}` },
            { label: 'Safe / Max Enchant', value: `+4 / +16 (W) +12 (A)` },
            { label: 'Element Max', value: `Lv.4 (150) / Lv.7 (300)` },
            { label: 'Max Level (H5)', value: `Lv. ${rates.maxLevel} / Sub ${rates.subClassMaxLevel}` },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4"
            >
              <div className="text-xs text-slate-400">{item.label}</div>
              <div className="mt-1.5 text-base font-bold font-mono text-sky-300">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top 5 PvP & Top 5 PK Leaderboards */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top 5 PvP */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-4 w-4 text-sky-400" />
                <span>{t('Top 5 อันดับสังหาร PvP', 'Top 5 PvP Players')}</span>
              </CardTitle>
              <CardDescription className="mt-1">
                {t('อ้างอิงจากตาราง characters.pvpkills (ตัด GM และตัวละครที่ลบแล้ว)', 'Ranked by characters.pvpkills (excludes GMs)')}
              </CardDescription>
            </div>
            <Link
              to="/rankings?tab=pvp"
              className="text-xs font-medium text-sky-400 hover:text-sky-300"
            >
              {t('ดูทั้งหมด →', 'View All →')}
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-5 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : !topPvp || topPvp.items.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {t('ไม่มีข้อมูลอันดับ PvP ในขณะนี้', 'No PvP ranking data available.')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">#</th>
                      <th className="px-4 py-2.5 font-medium">{t('ชื่อตัวละคร', 'Character')}</th>
                      <th className="px-4 py-2.5 font-medium">{t('อาชีพ (H5)', 'Class')}</th>
                      <th className="px-4 py-2.5 font-medium">{t('แคลน', 'Clan')}</th>
                      <th className="px-4 py-2.5 text-right font-medium">PvP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {topPvp.items.slice(0, 5).map((p) => (
                      <tr key={p.charName} className="hover:bg-slate-900/40">
                        <td className="px-4 py-2.5 font-mono font-bold text-sky-400">
                          {p.rank}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-white">
                          <div className="flex items-center gap-1.5">
                            <span>{p.charName}</span>
                            {p.online === true && (
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                                title="Online"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-300">{p.className}</td>
                        <td className="px-4 py-2.5 text-slate-400">{p.clanName ?? '-'}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-sky-300">
                          {formatNumber(p.flagKills)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 PK */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Skull className="h-4 w-4 text-rose-400" />
                <span>{t('Top 5 อันดับสังหารหัวแดง (PK)', 'Top 5 PK Players')}</span>
              </CardTitle>
              <CardDescription className="mt-1">
                {t('อ้างอิงจากตาราง characters.pkkills (ตัด GM และตัวละครที่ลบแล้ว)', 'Ranked by characters.pkkills (excludes GMs)')}
              </CardDescription>
            </div>
            <Link
              to="/rankings?tab=pk"
              className="text-xs font-medium text-sky-400 hover:text-sky-300"
            >
              {t('ดูทั้งหมด →', 'View All →')}
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-5 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : !topPk || topPk.items.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {t('ไม่มีข้อมูลอันดับ PK ในขณะนี้', 'No PK ranking data available.')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">#</th>
                      <th className="px-4 py-2.5 font-medium">{t('ชื่อตัวละคร', 'Character')}</th>
                      <th className="px-4 py-2.5 font-medium">{t('อาชีพ (H5)', 'Class')}</th>
                      <th className="px-4 py-2.5 font-medium">{t('แคลน', 'Clan')}</th>
                      <th className="px-4 py-2.5 text-right font-medium">PK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {topPk.items.slice(0, 5).map((p) => (
                      <tr key={p.charName} className="hover:bg-slate-900/40">
                        <td className="px-4 py-2.5 font-mono font-bold text-rose-400">
                          {p.rank}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-white">
                          <div className="flex items-center gap-1.5">
                            <span>{p.charName}</span>
                            {p.online === true && (
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                                title="Online"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-300">{p.className}</td>
                        <td className="px-4 py-2.5 text-slate-400">{p.clanName ?? '-'}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-rose-300">
                          {formatNumber(p.pkKills)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Raid Boss Status Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-sky-400" />
              <span>{t('สถานะ Grand Boss & Raid Boss แบบสรุป', 'Raid Boss Status Summary')}</span>
            </CardTitle>
            <CardDescription className="mt-1">
              {t(
                'นโยบายบอสใหญ่เกิดใหม่ภายใน 2–3 วันหลังตาย และปรับจุดวาร์ป Queen Ant / Baium (ไม่คาดเดาเวลาเกิดหากไม่มีข้อมูลใน DB)',
                '2–3 day respawn policy & custom Queen Ant / Baium warps (never guesses spawn times)'
              )}
            </CardDescription>
          </div>
          <Link
            to="/raid-boss"
            className="text-xs font-medium text-sky-400 hover:text-sky-300"
          >
            {t('ดูรายละเอียดบอสทั้งหมด →', 'All Raid Bosses →')}
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                <tr>
                  <th className="px-4 py-2.5 font-medium">{t('ชื่อบอส', 'Boss Name')}</th>
                  <th className="px-4 py-2.5 font-medium">Lv.</th>
                  <th className="px-4 py-2.5 font-medium">{t('สถานที่ / จุดวาร์ป', 'Location / Teleport')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('สถานะ', 'Status')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('เวลาเกิดรอบถัดไป (DB)', 'Next Spawn (DB)')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(bosses?.items ?? []).slice(0, 6).map((b) => (
                  <tr key={b.bossId} className="hover:bg-slate-900/40">
                    <td className="px-4 py-2.5 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{b.name}</span>
                        {b.isCustomTeleport && (
                          <Badge variant="ice" className="text-[10px] px-1.5 py-0">
                            Custom Warp
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-300">{b.level}</td>
                    <td className="px-4 py-2.5 text-slate-400">{b.location}</td>
                    <td className="px-4 py-2.5">
                      {b.status === 'alive' && <Badge variant="success">ALIVE</Badge>}
                      {b.status === 'dead' && <Badge variant="danger">DEAD</Badge>}
                      {b.status === 'unknown' && <Badge variant="outline">UNKNOWN</Badge>}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-300">
                      {b.status === 'alive'
                        ? t('มีชีวิตอยู่ในขณะนี้', 'Currently Alive')
                        : formatEpochDateTime(b.nextSpawnWindowStart, lang)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Server Features Grid */}
      <section aria-label="Server Features">
        <h2 className="mb-4 text-lg font-bold text-white">
          {t('จุดเด่นระบบเกม L2BLITZ HIGH FIVE', 'Core Server Features')}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SITE_CONFIG.serverInfo.systems.map((sys) => (
            <Card key={sys.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{sys.title[lang]}</CardTitle>
                  <Badge variant="ice">{sys.badge}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3 text-xs leading-relaxed text-slate-300">
                {sys.details[lang]}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
