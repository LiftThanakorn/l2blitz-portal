import React from 'react';
import {
  Download,
  AlertTriangle,
  HardDrive,
  Wrench,
  CheckCircle2,
  HelpCircle,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { SITE_CONFIG } from '@/config/siteConfig';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui/Primitives';

export const DownloadsPage: React.FC = () => {
  const { lang, t } = useI18n();
  const { items, systemRequirements, troubleshooting } = SITE_CONFIG.downloads;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="ice">LINEAGE II HIGH FIVE CLIENT</Badge>
          <Badge variant="warning">VERIFIED LINKS ONLY POLICY</Badge>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
          <Download className="h-7 w-7 text-sky-400" />
          <span>{t('ดาวน์โหลดตัวเกมและคู่มือการติดตั้ง (Downloads & Setup Guide)', 'Downloads, Patcher & Setup Guide')}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t(
            'ดาวน์โหลด L2Blitz Launcher, ตัวเกมเต็ม Lineage II High Five (CT 2.6), วิธีซ่อมแซมไฟล์ และความต้องการของระบบ',
            'Download the official L2Blitz Launcher, Full High Five Client, installation steps, and troubleshooting guides.'
          )}
        </p>
      </div>

      {/* Strict No-Fake-Links Notice */}
      <div className="rounded-xl border border-amber-800/70 bg-amber-950/30 p-4 text-xs text-amber-200 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-300 text-sm">
            {t(
              'สถานะลิงก์ดาวน์โหลด: รออัปเดตลิงก์ CDN / Mirror จริง (ไม่มีการใส่ลิงก์ปลอม)',
              'Download Mirror Status: Pending Official CDN URL Configuration (Zero Fake Links Policy)'
            )}
          </div>
          <p className="leading-relaxed">
            {t(
              'ตามข้อกำหนดความถูกต้องของระบบ ปุ่มดาวน์โหลดด้านล่างจะถูกปิดการทำงานไว้ชั่วคราว (Disabled) จนกว่าผู้ดูแลระบบจะนำลิงก์ไฟล์จริงและค่าตรวจสอบ SHA-256 มาใส่ในไฟล์ src/config/siteConfig.ts เพื่อป้องกันไม่ให้ผู้เล่นกดลิงก์เสียหรือลิงก์หลอก',
              'In strict compliance with portal integrity rules, download buttons remain disabled until verified official CDN URLs and SHA-256 checksums are configured in src/config/siteConfig.ts.'
            )}
          </p>
        </div>
      </div>

      {/* Download Cards: Launcher, Full Client, Patch */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {items.map((item) => {
          const hasRealLink = Boolean(item.url && item.url.trim().startsWith('https://'));

          return (
            <Card key={item.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="ice">{item.size}</Badge>
                  <span className="font-mono text-[11px] text-slate-400">{item.version}</span>
                </div>
                <CardTitle className="mt-2 text-base">{item.title[lang]}</CardTitle>
                <CardDescription className="mt-1 leading-relaxed">
                  {item.description[lang]}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-lg border border-slate-800 bg-[#080c15] p-2.5 text-[11px] font-mono text-slate-400">
                  <span className="text-slate-500">SHA-256: </span>
                  <span className="break-all text-slate-300">{item.sha256}</span>
                </div>

                {hasRealLink ? (
                  <a
                    href={item.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-sky-400 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>{t('ดาวน์โหลดไฟล์ (Official Link)', 'Download File')}</span>
                  </a>
                ) : (
                  <div
                    aria-disabled="true"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-xs font-semibold text-slate-400 select-none"
                  >
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <span>
                      {t(
                        'รออัปเดตลิงก์ดาวน์โหลดจริง (เร็ว ๆ นี้)',
                        'Pending Official Download Link'
                      )}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Installation & Patch/Repair Guide */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{t('ขั้นตอนการติดตั้งและเข้าเล่น (Installation Guide)', 'Step-by-Step Installation Guide')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-300">
            {[
              t(
                '1. ดาวน์โหลดไฟล์ตัวเกมเต็ม Lineage II High Five Full Client แล้วแตกไฟล์ไว้ในไดรฟ์ SSD (แนะนำให้หลีกเลี่ยงโฟลเดอร์ชื่อภาษาไทย)',
                '1. Extract the Lineage II High Five Full Client archive to an SSD directory (avoid non-ASCII folder names).'
              ),
              t(
                '2. นำไฟล์ L2Blitz Launcher ไปวางในโฟลเดอร์หลักของตัวเกม แล้วเปิดโปรแกรมด้วยสิทธิ์ผู้ดูแลระบบ (Run as Administrator)',
                '2. Place L2Blitz Launcher in the root game directory and run it as Administrator.'
              ),
              t(
                '3. กดปุ่ม "Update / Check Files" เพื่อให้ Launcher ตรวจสอบไฟล์แพตช์ล่าสุดและฟอนต์ภาษาไทย',
                '3. Click "Update / Check Files" to verify all L2Blitz patches and Thai localization files.'
              ),
              t(
                '4. กดเริ่มเกม แล้วพิมพ์ไอดีและรหัสผ่านที่ต้องการในหน้าล็อกอินของตัวเกม ระบบจะสร้างบัญชีให้อัตโนมัติ (หรือตามระบบในเกม)',
                '4. Launch the game and log in directly inside the client — no website registration is required.'
              ),
            ].map((step, idx) => (
              <div key={idx} className="rounded-lg border border-slate-800/80 bg-[#090d16] p-3">
                {step}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-sky-400" />
              <span>{t('การอัปเดตแพตช์และซ่อมแซมไฟล์ (Patch & File Repair)', 'Patching & File Repair Information')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              {t(
                'หากคุณมีตัวเกม Lineage II High Five ของเซิร์ฟเวอร์อื่นอยู่ก่อนแล้ว แนะนำให้ลบโฟลเดอร์ system เดิมออกทั้งหมดก่อนเปิดใช้ L2Blitz Launcher เพื่อป้องกันไฟล์ตารางไอเทมหรือสกิลชนกัน',
                'If you are reusing an existing High Five client, delete the old /system folder before running the L2Blitz Launcher to prevent item/skill table conflicts.'
              )}
            </p>
            <div className="rounded-lg border border-slate-800 bg-[#090d16] p-3.5 space-y-2">
              <div className="font-semibold text-white">
                {t('เมื่อใดควรใช้ปุ่ม Full Check / Repair?', 'When to run Full File Repair:')}
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>{t('เมื่อเห็นไอเทมเป็นไอคอนสีดำ (NoItemName)', 'Items appear as black icons or NoItemName')}</li>
                <li>{t('เมื่อกดวาร์ปไปโซนฟาร์มแล้วเด้งหลุด (Critical Error)', 'Client crashes when teleporting to custom Farm Zones')}</li>
                <li>{t('หลังการปิดปรับปรุงเซิร์ฟเวอร์ประจำสัปดาห์', 'After scheduled server maintenance updates')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Requirements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-sky-400" />
            <span>{t('ความต้องการของระบบ (System Requirements)', 'System Requirements')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">{t('อุปกรณ์', 'Component')}</th>
                  <th className="px-5 py-3 font-medium">{t('ขั้นต่ำ (Minimum)', 'Minimum')}</th>
                  <th className="px-5 py-3 font-medium">{t('แนะนำสำหรับ Mass PvP / Siege', 'Recommended (Mass PvP)')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {systemRequirements.map((req, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="px-5 py-3 font-semibold text-white">{req.component[lang]}</td>
                    <td className="px-5 py-3 text-slate-300">{req.minimum}</td>
                    <td className="px-5 py-3 text-sky-300 font-medium">{req.recommended}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-sky-400" />
            <span>{t('การแก้ไขปัญหาเบื้องต้น (Troubleshooting)', 'Common Client Troubleshooting')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {troubleshooting.map((item, i) => (
            <div key={i} className="rounded-lg border border-slate-800 bg-[#090d16] p-4 space-y-2 text-xs">
              <h4 className="font-bold text-white">{item.issue[lang]}</h4>
              <p className="text-slate-300 leading-relaxed">{item.solution[lang]}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
