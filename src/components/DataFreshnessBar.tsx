import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Database, Radio, ShieldCheck } from 'lucide-react';
import type { ApiMeta } from '@shared/schema';
import { useI18n } from '@/lib/i18n';
import { formatIsoTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Primitives';

interface DataFreshnessBarProps {
  meta?: ApiMeta | null;
  onRefresh?: () => void;
  loading?: boolean;
}

/**
 * Enforces Section 6 Rules:
 * - Clearly displays DEMO MODE when using development fixtures
 * - Strictly separates `meta.updatedAt` (Last Data Sync) from current clock time
 * - Displays Stale or Unavailable states transparently without fabricating data
 */
export const DataFreshnessBar: React.FC<DataFreshnessBarProps> = ({
  meta,
  onRefresh,
  loading,
}) => {
  const { lang, t } = useI18n();
  const [nowTime, setNowTime] = useState<string>(() => new Date().toISOString());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!meta) return null;

  return (
    <div className="mb-6 rounded-xl border border-slate-800/90 bg-[#0a0f1c] px-4 py-3 text-xs text-slate-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {meta.mode === 'demo' && (
            <Badge variant="warning" className="font-semibold">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              {t(
                'DEMO MODE (ข้อมูลจำลองสำหรับพัฒนา — ยังไม่ได้เชื่อม GameServer จริง)',
                'DEMO MODE (Development Fixture Data — Live GameServer Not Connected)'
              )}
            </Badge>
          )}

          {meta.mode === 'live' && (
            <Badge variant="success">
              <Radio className="h-3.5 w-3.5 text-emerald-400" />
              {t('LIVE DATA (เชื่อมต่อฐานข้อมูลจริง)', 'LIVE DATA (Synced with L2J Mobius DB)')}
            </Badge>
          )}

          {meta.mode === 'stale' && (
            <Badge variant="warning">
              <Database className="h-3.5 w-3.5 text-amber-400" />
              {t(
                'STALE CACHE (แสดงข้อมูลแคชล่าสุดเนื่องจากฐานข้อมูลไม่ตอบสนองชั่วคราว)',
                'STALE CACHE (Showing last known snapshot due to DB timeout)'
              )}
            </Badge>
          )}

          {meta.mode === 'unavailable' && (
            <Badge variant="danger">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              {t(
                'UNAVAILABLE (ไม่สามารถติดต่อ GameServer/DB — ปิดการแสดงตัวเลขสมมติ)',
                'UNAVAILABLE (GameServer/DB unreachable — Mock numbers disabled)'
              )}
            </Badge>
          )}

          <span className="inline-flex items-center gap-1 text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            {t('Read-Only API (TTL', 'Read-Only API (TTL')} {meta.cacheTtlSeconds}s)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-sky-400" />
            <span>{t('อัปเดตข้อมูลล่าสุด:', 'Last Data Sync:')}</span>
            <strong className="font-mono text-slate-200">
              {formatIsoTime(meta.updatedAt, lang)}
            </strong>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-800 pl-4">
            <span>{t('เวลาปัจจุบัน:', 'Current Time:')}</span>
            <strong className="font-mono text-slate-300">
              {formatIsoTime(nowTime, lang)}
            </strong>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-sky-300 hover:bg-slate-700 hover:text-white disabled:opacity-50 cursor-pointer"
            >
              {loading ? t('กำลังโหลด...', 'Syncing...') : t('รีเฟรชข้อมูล', 'Refresh')}
            </button>
          )}
        </div>
      </div>

      {meta.warning && (
        <p className="mt-2 border-t border-slate-800/70 pt-2 text-[11px] text-amber-300/90">
          {meta.warning}
        </p>
      )}
    </div>
  );
};
