import React, { useEffect, useState } from 'react';
import { Server, Sparkles, ShieldCheck, Layers, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { apiClient } from '@/lib/apiClient';
import { SITE_CONFIG } from '@/config/siteConfig';
import { DataFreshnessBar } from '@/components/DataFreshnessBar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui/Primitives';
import type { ServerRatesResponse } from '@shared/schema';

export const ServerInfoPage: React.FC = () => {
  const { lang, t } = useI18n();
  const [ratesData, setRatesData] = useState<ServerRatesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRates = () => {
    setLoading(true);
    apiClient
      .getServerRates()
      .then(setRatesData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRates();
  }, []);

  const r = ratesData ?? {
    exp: SITE_CONFIG.serverInfo.rates.exp,
    sp: SITE_CONFIG.serverInfo.rates.sp,
    adena: SITE_CONFIG.serverInfo.rates.adena,
    drop: SITE_CONFIG.serverInfo.rates.drop,
    spoil: SITE_CONFIG.serverInfo.rates.spoil,
    questDrop: SITE_CONFIG.serverInfo.rates.questDrop,
    raidDrop: SITE_CONFIG.serverInfo.rates.raidDrop,
    maxLevel: 85,
    subClassMaxLevel: 85,
    safeEnchant: 4,
    maxEnchantWeapon: 16,
    maxEnchantArmor: 12,
    maxEnchantJewelry: 12,
    normalScrollChance: SITE_CONFIG.serverInfo.enchant.normalScrollChance,
    blessedScrollChance: SITE_CONFIG.serverInfo.enchant.blessedScrollChance,
    ancientScrollChance: SITE_CONFIG.serverInfo.enchant.ancientScrollChance,
    elementStoneChance: SITE_CONFIG.serverInfo.enchant.elementStoneMax,
    elementCrystalChance: SITE_CONFIG.serverInfo.enchant.elementCrystalMax,
    maxBuffSlots: '36 + 4 Divine Inspiration (+16 Dance/Song)',
    buffDurationMinutes: 120,
  };

  return (
    <div className="space-y-8">
      <DataFreshnessBar meta={ratesData?.meta} onRefresh={loadRates} loading={loading} />

      <div>
        <div className="flex items-center gap-2">
          <Badge variant="ice">L2J MOBIUS CT 2.6 HIGH FIVE</Badge>
          <Badge variant="outline">CONFIG-DRIVEN RATES</Badge>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white">
          {t('ข้อมูลระบบเซิร์ฟเวอร์ (Server Information)', 'Server Information & Mechanics')}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t(
            'รายละเอียดอัตราเรท การตีบวก ธาตุ ชุดเริ่มต้น และระบบอำนวยความสะดวกทั้งหมดของ L2Blitz High Five (ปรับแก้ผ่านไฟล์ Config ได้ทันที)',
            'Complete EXP/SP/Drop rates, Enchant & Element limits, Starter Pack, AutoFarm, and Community Board services.'
          )}
        </p>
      </div>

      {/* EXP / SP / Adena / Drop / Spoil Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4 text-sky-400" />
              <span>{t('อัตราเรทพื้นฐาน (Base Server Rates)', 'Base Server Rates')}</span>
            </CardTitle>
            <CardDescription>
              {t('ตั้งค่าสำหรับเซิร์ฟเวอร์แนว High Five Instant PvP & Farm', 'Configured for High Five Instant PvP & Mid-High Craft')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-slate-800/70">
                {[
                  { label: 'EXP / SP Rate', value: `x${r.exp} / x${r.sp}` },
                  { label: 'Adena Drop Rate', value: `x${r.adena}` },
                  { label: 'Normal Item Drop / Spoil', value: `x${r.drop} / x${r.spoil}` },
                  { label: 'Quest Drop / Raid Boss Drop', value: `x${r.questDrop} / x${r.raidDrop}` },
                  { label: 'Max Character / Sub-Class Level', value: `Lv. ${r.maxLevel} / Lv. ${r.subClassMaxLevel} (High Five)` },
                  { label: 'Buff Slots & Duration', value: `${r.maxBuffSlots} (${r.buffDurationMinutes} mins)` },
                ].map((row) => (
                  <tr key={row.label} className="hover:bg-slate-900/40">
                    <td className="px-5 py-3 text-slate-300 font-medium">{row.label}</td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-sky-300">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Enchant & Element Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <span>{t('ระบบตีบวกและใส่ธาตุ (Enchant & Element)', 'Enchant & Attribute Element System')}</span>
            </CardTitle>
            <CardDescription>
              {t('สมดุลการตีบวกอาวุธ ชุดเกราะ ประดับ และหินธาตุ High Five', 'Weapon, Armor, Jewelry Enchant & H5 Attribute limits')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-slate-800/70">
                {[
                  { label: t('ตีบวกปลอดภัย (Safe Enchant)', 'Safe Enchant'), value: `+${r.safeEnchant}` },
                  {
                    label: t('ตีบวกสูงสุด (Weapon / Armor / Jewelry)', 'Max Enchant (W / A / J)'),
                    value: `+${r.maxEnchantWeapon} / +${r.maxEnchantArmor} / +${r.maxEnchantJewelry}`,
                  },
                  { label: t('ใบตีบวกปกติ (Normal Scroll)', 'Normal Enchant Scroll'), value: r.normalScrollChance },
                  { label: t('ใบตีบวกเบลส (Blessed Scroll)', 'Blessed Enchant Scroll'), value: r.blessedScrollChance },
                  { label: t('ใบตีบวกโบราณ (Ancient Scroll)', 'Ancient Enchant Scroll'), value: r.ancientScrollChance },
                  { label: t('หินธาตุ (Element Stone Lv.4)', 'Element Stone (Lv.4)'), value: r.elementStoneChance },
                  { label: t('คริสตัลธาตุ (Element Crystal Lv.7)', 'Element Crystal (Lv.7)'), value: r.elementCrystalChance },
                ].map((row) => (
                  <tr key={row.label} className="hover:bg-slate-900/40">
                    <td className="px-5 py-2.5 text-slate-300 font-medium">{row.label}</td>
                    <td className="px-5 py-2.5 text-right font-mono text-slate-100">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Starter Pack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{t('ของขวัญผู้เล่นใหม่ (Starter Pack)', 'New Character Starter Pack')}</span>
          </CardTitle>
          <CardDescription>
            {t('สร้างตัวละครเข้าสู่โลก L2Blitz พร้อมออกรบและฟาร์มได้ทันที', 'Everything granted automatically upon creating your character')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {SITE_CONFIG.serverInfo.starterPack.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-[#090d16] p-3.5 text-xs text-slate-200"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{item[lang]}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Detailed Feature Modules: AutoFarm, AutoPotion, PvP Craft, Premium, Community Board, Clan */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-sky-400" />
          <span>
            {t(
              'รายละเอียดระบบสำคัญ (AutoFarm, AutoPotion, PvP Craft, Premium, Community Board, Clan)',
              'Core Gameplay Systems & Customizations'
            )}
          </span>
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SITE_CONFIG.serverInfo.systems.map((sys) => (
            <Card key={sys.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white">{sys.title[lang]}</CardTitle>
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
