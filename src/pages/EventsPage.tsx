import React, { useEffect, useState, useCallback } from 'react';
import { Flame, Clock, Award, CheckCircle2, Shield, Users } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { apiClient } from '@/lib/apiClient';
import { DataFreshnessBar } from '@/components/DataFreshnessBar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Skeleton } from '@/components/ui/Primitives';
import type { TvtEventResponse } from '@shared/schema';

export const EventsPage: React.FC = () => {
  const { t } = useI18n();
  const [tvt, setTvt] = useState<TvtEventResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTvt = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getTvtEvent();
      setTvt(res);
    } catch {
      // handled via UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTvt();
  }, [loadTvt]);

  return (
    <div className="space-y-8">
      <DataFreshnessBar meta={tvt?.meta} onRefresh={loadTvt} loading={loading} />

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="ice">AUTOMATED HIGH FIVE EVENT</Badge>
          <Badge variant="outline">TEAM VERSUS TEAM (TVT)</Badge>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
          <Flame className="h-7 w-7 text-sky-400" />
          <span>{t('กิจกรรมสงครามแบ่งฝ่าย Team vs Team (TvT Event)', 'Team vs Team (TvT) Automated Event')}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t(
            'ศึกปะทะ 2 ฝ่าย (ทีมน้ำเงิน vs ทีมแดง) แบบอัตโนมัติตามรอบเวลา พร้อมกติกา วิธีเข้าร่วม รางวัล และผลการแข่งขัน',
            'Scheduled Red vs Blue team combat in L2J Mobius High Five — rules, registration window, rewards, and match results.'
          )}
        </p>
      </div>

      {/* TvT Visual Event Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1322]">
        <div className="relative h-48 sm:h-64 w-full overflow-hidden">
          <img
            src="/images/events/tvt-banner.jpg"
            alt="Team vs Team Event Clash"
            className="h-full w-full object-cover object-center brightness-90 hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1322] via-transparent to-transparent opacity-85" />
          <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="ice">BLUE TEAM</Badge>
                <span className="text-xs font-bold text-slate-300">VS</span>
                <Badge variant="danger">RED TEAM</Badge>
              </div>
              <h2 className="mt-1 text-base sm:text-lg font-bold text-white">
                {t('สมรภูมิแบ่งฝ่ายประลองเดือด 40 vs 40', 'Colosseum 40 vs 40 Arena Combat')}
              </h2>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-sky-300 font-mono">
              Noblesse Blessing • No EXP Loss
            </div>
          </div>
        </div>
      </div>

      {/* Schedule & Match Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{t('รอบเวลาจัดกิจกรรม (GMT+7)', 'Daily Schedule (GMT+7)')}</span>
              <Clock className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-2 font-mono text-base font-bold text-sky-300">
              {(tvt?.scheduleTimes ?? ['03:00', '09:00', '15:00', '21:00']).join(' • ')}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {t('เปิดทุกวัน 4 รอบต่อวัน', 'Runs automatically 4 times daily')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{t('ระยะเวลาลงทะเบียน / แข่งขัน', 'Registration / Combat Time')}</span>
              <Users className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-2 font-mono text-base font-bold text-white">
              {tvt?.registrationDurationMinutes ?? 10} {t('นาที', 'm')} /{' '}
              {tvt?.eventDurationMinutes ?? 15} {t('นาที', 'm')}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {t('เลเวลขั้นต่ำ Lv.80 (สูงสุด 40 vs 40)', 'Min Lv. 80 (Max 40 vs 40 players)')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{t('ผลการแข่งขันรอบล่าสุด', 'Latest Match Result')}</span>
              <Award className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-2 text-base font-bold text-white">
              {loading ? '...' : tvt?.lastMatchWinner ?? 'Unknown'}
            </div>
            <p className="mt-1 font-mono text-[11px] text-slate-300">
              {tvt?.lastMatchScoreBlue !== null && tvt?.lastMatchScoreRed !== null
                ? `Blue ${tvt?.lastMatchScoreBlue} : ${tvt?.lastMatchScoreRed} Red`
                : t('รอเชื่อมต่อผลจาก GameServer', 'Awaiting live GameServer match feed')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{t('การป้องกัน Dual-Box (HWID)', 'Anti-Dualbox Protection')}</span>
              <Shield className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-base font-bold text-emerald-300">
              1 PC / 1 IP Limit
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {t('จำกัด 1 ตัวละครต่อเครื่องเพื่อความยุติธรรม', 'Strictly 1 character per HWID/IP')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rules, How to Join, Rewards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('1. วิธีเข้าร่วมกิจกรรม (How to Join)', '1. How to Register & Join')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-slate-300">
            {[
              t(
                'เมื่อถึงเวลาเปิดรับสมัคร จะมีประกาศแจ้งเตือนทั่วเซิร์ฟเวอร์ (ระยะเวลาสมัคร 10 นาที)',
                'Global announcement appears 10 minutes before combat starts.'
              ),
              t(
                'พิมพ์คำสั่ง .tvtjoin หรือกดลงทะเบียนผ่านหน้าต่าง Community Board (Alt+B > Events)',
                'Type .tvtjoin in chat or register via Community Board (Alt+B > Events).'
              ),
              t(
                'ห้ามอยู่ในสถานะหัวแดง (PK Karma), กำลังลงทะเบียน Olympiad หรืออยู่ในคุก/ดันเจี้ยนส่วนตัว',
                'Characters with Karma, active Olympiad registration, or inside instances cannot join.'
              ),
              t(
                'เมื่อหมดเวลาสมัคร ระบบจะสุ่มแบ่งทีม น้ำเงิน (Blue) และ แดง (Red) อย่างสมดุลแล้ววาร์ปเข้าสนามทันที',
                'Players are automatically balanced into Blue and Red teams and teleported to the arena.'
              ),
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('2. กติกาการแข่งขัน (Combat Rules)', '2. Arena Combat Rules')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-slate-300">
            {[
              t(
                'ทุกครั้งที่สังหารผู้เล่นฝ่ายตรงข้ามได้ จะเพิ่มคะแนนให้ทีม +1 คะแนน',
                'Every opposing player kill grants +1 point to your team score.'
              ),
              t(
                'เมื่อตายในสนาม TvT จะไม่เสียค่าประสบการณ์ (EXP) และจะถูกชุบชีวิตกลับจุดเกิดของทีมภายใน 10 วินาทีพร้อมบัฟ Noblesse อัตโนมัติ',
                'Dying inside TvT incurs zero EXP loss; you respawn at your team base after 10 seconds with Noblesse Blessing.'
              ),
              t(
                'ไม่อนุญาตให้ตั้งปาร์ตี้ข้ามทีม หรือโจมตีผู้เล่นทีมเดียวกัน',
                'Cross-team parties and friendly fire are disabled by the engine.'
              ),
              t(
                'ผู้เล่นต้องมียอดสังหารอย่างน้อย 1 ครั้ง หรือมีส่วนร่วมในการต่อสู้ (ป้องกันการยืน AFK รับของรางวัล)',
                'Active participation (minimum 1 kill/assist) is required to qualify for end-of-match rewards.'
              ),
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('3. รางวัลกิจกรรม (Event Rewards)', '3. Match Rewards')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-slate-300">
            {[
              t(
                'ทีมที่ชนะ: รับ TvT Event Medal x20, แต้มชื่อเสียงตัวละคร (Fame) +1,500 และกล่องสุ่มหินธาตุ/ใบตีบวกเบลส',
                'Winning Team: 20x TvT Event Medals, +1,500 Character Fame, and Elemental/Blessed Scroll Box.'
              ),
              t(
                'ทีมที่แพ้ (ที่มีส่วนร่วมต่อสู้): รับรางวัลปลอบใจ TvT Event Medal x8 และแต้ม Fame +500',
                'Participating Losing Team: 8x TvT Event Medals and +500 Character Fame.'
              ),
              t(
                'ผู้เล่นที่สังหารสูงสุดประจำรอบ (Top Killer MVP): รับโบนัสพิเศษ Top Killer Trophy และ Fame เพิ่มเติม +1,000',
                'Match Top Killer (MVP): Bonus Top Killer Trophy and +1,000 extra Fame.'
              ),
              t(
                '* จำนวนไอเทมรางวัลอ้างอิงจากไฟล์ TeamVersusTeam.ini ของเซิร์ฟเวอร์',
                '* Reward quantities are configured via TeamVersusTeam.ini on the GameServer.'
              ),
            ].map((rw, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{rw}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* TvT Top Players Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>{t('ทำเนียบผู้เล่นยอดเยี่ยมกิจกรรม TvT (TvT Match Leaders)', 'TvT Match Leaderboard')}</CardTitle>
          <CardDescription>
            {t(
              'แสดงสถิติเมื่อระบบเกมเปิดบันทึกผลการแข่งขันลงฐานข้อมูล SQL (ในโหมดพัฒนาแสดงข้อมูลตัวอย่าง)',
              'Displays historical TvT leaders when SQL persistence is enabled on the GameServer.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : tvt && tvt.rankingsAvailable && tvt.topPlayers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">{t('ชื่อตัวละคร', 'Character')}</th>
                    <th className="px-4 py-3 font-medium">{t('อาชีพ (H5)', 'Class')}</th>
                    <th className="px-4 py-3 text-right font-medium">{t('สังหารสะสมใน TvT', 'TvT Kills')}</th>
                    <th className="px-4 py-3 text-right font-medium">{t('จำนวนรอบที่ชนะ', 'Matches Won')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tvt.topPlayers.map((p) => (
                    <tr key={p.charName} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-mono font-bold text-sky-400">#{p.rank}</td>
                      <td className="px-4 py-3 font-semibold text-white">{p.charName}</td>
                      <td className="px-4 py-3 text-slate-300">{p.className}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-sky-300">
                        {p.kills}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-300">
                        {p.wins}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              {t(
                'ขณะนี้ระบบบันทึกสถิติ TvT ลง SQL ยังไม่เปิดใช้งานบน GameServer (แสดงเฉพาะตารางเวลากิจกรรม)',
                'TvT SQL persistence is not yet enabled on the live GameServer.'
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
