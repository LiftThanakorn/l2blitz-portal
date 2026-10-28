import React from 'react';
import { MapPin, Bot, Coins, Swords, Database, CheckCircle2, Ban } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { SITE_CONFIG } from '@/config/siteConfig';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui/Primitives';

export const FarmZonePage: React.FC = () => {
  const { lang, t } = useI18n();
  const zones = SITE_CONFIG.farmZones;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="ice">HIGH FIVE FARM ZONES</Badge>
          <Badge variant="outline">MOBIUS XML READ-ONLY SYNC READY</Badge>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
          <MapPin className="h-7 w-7 text-sky-400" />
          <span>{t('โซนฟาร์มและข้อมูลมอนสเตอร์ (Farm Zones & Drops)', 'Farm Zones, Monsters & Drop Guide')}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t(
            'แสดงรายชื่อโซนฟาร์ม ประเภทมอนสเตอร์ รายละเอียดการดรอป รางวัล Adena จุดวาร์ป และเงื่อนไขการใช้ AutoFarm',
            'Detailed guide to L2Blitz farming zones, monster attributes, Adena rewards, teleport paths, and AutoFarm permissions.'
          )}
        </p>
      </div>

      {/* XML Import Readiness Banner */}
      <div className="rounded-xl border border-slate-800 bg-[#0b1120] p-4 text-xs text-slate-300 flex items-start gap-3">
        <Database className="h-5 w-5 shrink-0 text-sky-400 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-white">
            {t(
              'รองรับการแปลงข้อมูลจาก XML ของ L2J Mobius (npcs / droplists / spawns) เป็นฐานข้อมูลอ่านอย่างเดียว',
              'Ready for L2J Mobius XML-to-Read-Only-JSON/SQL Pipeline'
            )}
          </div>
          <p className="text-slate-400 leading-relaxed">
            {t(
              'โครงสร้างข้อมูลโซนฟาร์มถูกออกแบบให้แยก NPC ID, ธาตุ (Element), ตัวคูณเลือด และ Item ID ตามมาตรฐาน L2J_Mobius_CT_2.6_HighFive/dist/game/data/stats/npcs/ เมื่อได้รับไฟล์ XML จริงจากเครื่อง GameServer สามารถซิงก์ตารางดรอปเข้าสู่ระบบได้ทันที',
              'Structured with authentic High Five NPC IDs, Elemental Attributes, and Item IDs compatible with L2J_Mobius_CT_2.6_HighFive XML definitions.'
            )}
          </p>
        </div>
      </div>

      {/* Zones List */}
      <div className="space-y-6">
        {zones.map((zone) => (
          <Card key={zone.id} className="overflow-hidden">
            {zone.image && (
              <div className="relative h-44 sm:h-56 w-full overflow-hidden border-b border-slate-800 bg-slate-950">
                <img
                  src={zone.image}
                  alt={lang === 'th' ? zone.nameTh : zone.nameEn}
                  className="h-full w-full object-cover object-center brightness-90 hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1322] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-4 flex flex-wrap items-center gap-2">
                  <Badge variant="ice">{zone.difficulty}</Badge>
                  <Badge variant="outline" className="bg-slate-900/80 backdrop-blur-sm">
                    {zone.recommendedLevel}
                  </Badge>
                  <Badge variant="outline" className="bg-slate-900/80 backdrop-blur-sm">
                    {zone.combatType}
                  </Badge>
                </div>
              </div>
            )}

            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                {!zone.image && (
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="ice">{zone.difficulty}</Badge>
                    <Badge variant="outline">{zone.recommendedLevel}</Badge>
                    <Badge variant="outline">{zone.combatType}</Badge>
                    {zone.pendingXmlSync && (
                      <Badge variant="warning">
                        {t('รอซิงก์อัตราจริงจาก XML', 'Pending Live XML Sync')}
                      </Badge>
                    )}
                  </div>
                )}
                <CardTitle className="text-lg">
                  {lang === 'th' ? zone.nameTh : zone.nameEn}
                </CardTitle>
                <CardDescription className="mt-1 font-mono text-sky-300">
                  {t('จุดวาร์ป:', 'Teleport:')} {lang === 'th' ? zone.teleportPathTh : zone.teleportPathEn}
                </CardDescription>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#080c16] px-4 py-2.5 text-right">
                <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  <span>{t('รางวัล Adena ต่อตัว', 'Adena Reward / Mob')}</span>
                </div>
                <div className="mt-0.5 font-mono text-xs font-bold text-amber-300">
                  {zone.adenaRewardRange}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* AutoFarm Policy Box */}
              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-[#090e1a] p-3.5 text-xs">
                <Bot className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <span>{t('นโยบายการใช้ AutoFarm (.autofarm):', 'AutoFarm Policy (.autofarm):')}</span>
                    {zone.autoFarmAllowed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t('อนุญาตให้เปิดใช้งาน', 'Allowed')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400">
                        <Ban className="h-3.5 w-3.5" />
                        {t('จำกัดการใช้งาน (เน้นควบคุมมือ)', 'Restricted (Manual PvP Zone)')}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-slate-300">
                    {lang === 'th' ? zone.autoFarmNoteTh : zone.autoFarmNoteEn}
                  </p>
                </div>
              </div>

              {/* Monsters & Drops Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Monster Information */}
                <div>
                  <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Swords className="h-3.5 w-3.5 text-sky-400" />
                    <span>{t('ข้อมูลมอนสเตอร์ประจำโซน (Monster Information)', 'Zone Monsters (Mobius XML)')}</span>
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">NPC ID</th>
                          <th className="px-3 py-2 font-medium">{t('ชื่อมอนสเตอร์', 'Monster Name')}</th>
                          <th className="px-3 py-2 font-medium">Lv.</th>
                          <th className="px-3 py-2 font-medium">HP</th>
                          <th className="px-3 py-2 font-medium">{t('ธาตุ / โจมตีก่อน', 'Element / Aggro')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {zone.monsters.map((m) => (
                          <tr key={m.npcId} className="hover:bg-slate-900/40">
                            <td className="px-3 py-2 font-mono text-slate-400">#{m.npcId}</td>
                            <td className="px-3 py-2 font-medium text-white">{m.name}</td>
                            <td className="px-3 py-2 font-mono text-sky-300">{m.level}</td>
                            <td className="px-3 py-2 font-mono text-slate-300">{m.hpMultiplier}</td>
                            <td className="px-3 py-2 text-slate-300">
                              {m.element} •{' '}
                              <span className={m.aggro ? 'text-rose-400' : 'text-emerald-400'}>
                                {m.aggro ? 'Aggro' : 'Passive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Drop Information */}
                <div>
                  <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Coins className="h-3.5 w-3.5 text-amber-400" />
                    <span>{t('ไอเทมดรอปสำคัญ (Key Drops & Rewards)', 'Key Drops & Craft Materials')}</span>
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">Item ID</th>
                          <th className="px-3 py-2 font-medium">{t('ชื่อไอเทม', 'Item Name')}</th>
                          <th className="px-3 py-2 font-medium">{t('หมวดหมู่', 'Category')}</th>
                          <th className="px-3 py-2 text-right font-medium">{t('โอกาสดรอป', 'Drop Note')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {zone.drops.map((d) => (
                          <tr key={d.itemId} className="hover:bg-slate-900/40">
                            <td className="px-3 py-2 font-mono text-slate-400">#{d.itemId}</td>
                            <td className="px-3 py-2 font-medium text-white">{d.itemName}</td>
                            <td className="px-3 py-2">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {d.category}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-sky-300">
                              {d.chanceNote}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
