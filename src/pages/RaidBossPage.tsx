import React, { useEffect, useState, useCallback } from 'react';
import { Skull, AlertTriangle, Navigation, Clock, ShieldAlert } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { apiClient } from '@/lib/apiClient';
import { DataFreshnessBar } from '@/components/DataFreshnessBar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Skeleton } from '@/components/ui/Primitives';
import { formatEpochDateTime } from '@/lib/utils';
import type { RaidBossesResponse } from '@shared/schema';

export const RaidBossPage: React.FC = () => {
  const { lang, t } = useI18n();
  const [data, setData] = useState<RaidBossesResponse | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'grand_boss' | 'field_boss'>('all');
  const [loading, setLoading] = useState(true);

  const loadBosses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getRaidBosses();
      setData(res);
    } catch {
      // Handled via UI state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBosses();
  }, [loadBosses]);

  const items = (data?.items ?? []).filter(
    (b) => categoryFilter === 'all' || b.category === categoryFilter
  );

  return (
    <div className="space-y-6">
      <DataFreshnessBar meta={data?.meta} onRefresh={loadBosses} loading={loading} />

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="ice">GRANDBOSS_DATA & RAIDBOSS_SPAWNLIST</Badge>
          <Badge variant="warning">ZERO SPAWN TIME GUESSING POLICY</Badge>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
          <Skull className="h-7 w-7 text-sky-400" />
          <span>{t('สถานะเรดบอสและบอสใหญ่ (Raid Boss & Grand Boss Status)', 'Raid Boss & Grand Boss Status')}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t(
            'แสดงรายชื่อบอส เลเวล สถานที่ สถานะ (Alive / Dead / Unknown) และจุดวาร์ปเข้าถึงตามฐานข้อมูลจริงของ L2J Mobius High Five',
            'Live status, respawn rules, and custom warp coordinates synced directly from L2J Mobius High Five.'
          )}
        </p>
      </div>

      {/* L2Blitz Custom Respawn & Teleport Verification Notice */}
      <div className="rounded-xl border border-amber-800/70 bg-amber-950/30 p-4 text-xs text-amber-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {t(
              'ข้อกำหนดสำคัญด้านข้อมูลบอสของ L2Blitz (2–3 Days Respawn & Custom Warps)',
              'L2Blitz Custom Boss Respawn & Teleport Verification Policy'
            )}
          </span>
        </div>
        <p className="leading-relaxed">
          {lang === 'th' ? data?.policyNoticeTh : data?.policyNoticeEn}
        </p>
        <p className="text-[11px] text-amber-300/80">
          {t(
            '* หมายเหตุ: พิกัดจุดวาร์ปที่ปรับแต่งของ Queen Ant และ Baium รวมถึงระยะเวลาสุ่มเกิดใหม่ (Random Window) ต้องตรวจสอบจากไฟล์ Config ของเครื่อง GameServer จริงอีกครั้งก่อนยืนยันเป็นค่าถาวร และระบบจะไม่เดาเวลาเกิดบอสหากไม่มีค่า respawn_time ในฐานข้อมูล',
            '* Note: Custom warp coordinates for Queen Ant and Baium and exact random spawn windows will be verified against the live GameServer config before final confirmation. No spawn times are ever fabricated.'
          )}
        </p>
      </div>

      {/* Featured Grand Bosses Image Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 29001, name: 'Queen Ant', file: '/images/bosses/queen-ant.jpg', desc: 'The Ant Nest (Lv. 40)' },
          { id: 29020, name: 'Baium', file: '/images/bosses/baium.jpg', desc: 'TOI 14F (Lv. 75)' },
          { id: 29068, name: 'Antharas', file: '/images/bosses/antharas.jpg', desc: 'Antharas Lair (Lv. 85)' },
          { id: 29028, name: 'Valakas', file: '/images/bosses/valakas.jpg', desc: 'Forge of Gods (Lv. 85)' },
        ].map((gb) => (
          <div
            key={gb.id}
            className="group relative overflow-hidden rounded-xl border border-slate-800 bg-[#0d1322] hover:border-sky-500/50 transition-colors shadow-lg"
          >
            <div className="aspect-[16/10] w-full overflow-hidden bg-slate-950">
              <img
                src={gb.file}
                alt={gb.name}
                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90"
                loading="lazy"
              />
            </div>
            <div className="p-3 border-t border-slate-800/80 bg-[#0a0f1c]/90">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{gb.name}</span>
                <Badge variant="ice" className="text-[10px] px-1.5 py-0">Grand Boss</Badge>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{gb.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: t('บอสทั้งหมด (All Bosses)', 'All Bosses') },
          { id: 'grand_boss', label: t('บอสใหญ่ (Grand Bosses)', 'Grand Bosses') },
          { id: 'field_boss', label: t('เรดบอสทั่วไป (Field Raid Bosses)', 'Field Raid Bosses') },
        ].map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => setCategoryFilter(btn.id as typeof categoryFilter)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              categoryFilter === btn.id
                ? 'bg-sky-500 text-slate-950'
                : 'border border-slate-800 bg-[#0d1322] text-slate-300 hover:text-white'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Bosses Table & Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t('ตารางสถานะและการเกิดใหม่ของบอส', 'Boss Spawn & Teleport Directory')}</CardTitle>
          <CardDescription>
            {t(
              'หากฐานข้อมูลไม่ได้บันทึกเวลาตาย (Last Kill) หรือยังไม่สามารถติดต่อ GameServer ได้ ระบบจะแสดงสถานะ Unknown ทันที',
              'If Last Kill or Next Spawn is not recorded in SQL, the portal explicitly shows Not Recorded / Unknown.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t('ชื่อบอส / รหัส NPC', 'Boss Name / ID')}</th>
                    <th className="px-4 py-3 font-medium">Lv.</th>
                    <th className="px-4 py-3 font-medium">{t('สถานที่ & จุดวาร์ป', 'Location & Warp Access')}</th>
                    <th className="px-4 py-3 font-medium">{t('สถานะ', 'Status')}</th>
                    <th className="px-4 py-3 font-medium">{t('ตายล่าสุด (Last Kill)', 'Last Kill')}</th>
                    <th className="px-4 py-3 font-medium">{t('เกิดรอบถัดไป (Next Spawn)', 'Next Spawn (DB)')}</th>
                    <th className="px-4 py-3 font-medium">{t('กติกาการเกิด (Respawn Rules)', 'Respawn Rules')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {items.map((boss) => (
                    <tr key={boss.bossId} className="hover:bg-slate-900/40 align-top">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white text-sm">{boss.name}</div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="font-mono">NPC #{boss.bossId}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {boss.category === 'grand_boss' ? 'Grand Boss' : 'Field Boss'}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-sky-300">{boss.level}</td>
                      <td className="px-4 py-3.5 max-w-xs space-y-1">
                        <div className="font-medium text-slate-200">{boss.location}</div>
                        <div className="flex items-start gap-1 text-[11px] text-sky-300">
                          <Navigation className="h-3 w-3 shrink-0 mt-0.5" />
                          <span>{boss.teleportInfo}</span>
                        </div>
                        {boss.customRuleWarning && (
                          <div className="mt-1 rounded border border-amber-800/60 bg-amber-950/40 px-2 py-1 text-[10px] text-amber-300 flex items-start gap-1">
                            <ShieldAlert className="h-3 w-3 shrink-0 mt-0.5" />
                            <span>{boss.customRuleWarning}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {boss.status === 'alive' && <Badge variant="success">ALIVE</Badge>}
                        {boss.status === 'dead' && <Badge variant="danger">DEAD</Badge>}
                        {boss.status === 'unknown' && <Badge variant="outline">UNKNOWN</Badge>}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        {formatEpochDateTime(boss.lastKillTime, lang)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-200">
                        {boss.status === 'alive' ? (
                          <span className="text-emerald-400 font-semibold">
                            {t('พร้อมสู้ (Spawned)', 'Spawned Now')}
                          </span>
                        ) : boss.nextSpawnWindowStart ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-amber-300">
                              <Clock className="h-3 w-3" />
                              <span>{formatEpochDateTime(boss.nextSpawnWindowStart, lang)}</span>
                            </div>
                            {boss.nextSpawnWindowEnd && (
                              <div className="text-[10px] text-slate-400">
                                → {formatEpochDateTime(boss.nextSpawnWindowEnd, lang)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500">
                            {t('ไม่ระบุเวลาคาดเดา', 'Unknown (Not Estimated)')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs text-slate-300 leading-relaxed">
                        {boss.respawnRuleText}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
