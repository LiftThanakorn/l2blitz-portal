import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { fetchApi } from '../lib/api';

interface ServerRatesData {
  verificationStatus: 'pending_verification' | 'verified';
  chronicle: string;
  serverType: string;
  rates: {
    key: string;
    labelTh: string;
    labelEn: string;
    value: string;
    noteTh: string;
    noteEn: string;
    verified: boolean;
  }[];
  enchantLimits: {
    categoryTh: string;
    categoryEn: string;
    safeEnchant: string;
    maxEnchant: string;
    blessedRate: string;
    attributeMax: string;
    verified: boolean;
  }[];
}

export function ServerInfoPage() {
  const { t } = useLanguage();
  const [ratesData, setRatesData] = useState<ServerRatesData | null>(null);

  useEffect(() => {
    fetchApi<ServerRatesData>('/api/server/rates').then((res) => {
      if (res.data) setRatesData(res.data);
    });
  }, []);

  return (
    <div className="editorial-frame pt-10 pb-16">
      {/* Page Masthead */}
      <div className="editorial-axis-grid items-end pb-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="small-note text-[#E97540] font-semibold m-0">
            {t('เอกสารข้อมูลโครงสร้างเซิร์ฟเวอร์ (CT 2.6)', 'Chronicle Specification & Mechanics')}
          </p>
          <p className="body-copy text-[#77736C] mt-3">
            {t(
              'รายละเอียดเรทคูณ การตีบวก ระบบธาตุ ของขวัญเริ่มต้น ระบบช่วยเล่น และกฎกติกาการปะทะของ L2BLITZ PVP (ค่าตัวเลขที่รอการยืนยันจากไฟล์คอนฟิกเซิร์ฟเวอร์จริงจะมีป้ายกำกับระบุชัดเจน)',
              'Complete specification of L2BLITZ PVP rates, enchant rules, attribute caps, starter packages, Community Board services, and gameplay policies. Unverified configuration parameters are explicitly flagged.'
            )}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <h1 className="display-title">
            {t('ข้อมูลเซิร์ฟเวอร์', 'Server Spec')}
            <br />
            {t('และระบบการเล่น', '& Ruleset')}
          </h1>
        </div>
      </div>

      {/* Hero Visual Banner · S84 Equipment Knolling Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-20">
        <figure className="lg:col-span-7 m-0 surface-stone overflow-hidden">
          <picture>
            <source srcSet="/assets/images/server-features.webp" type="image/webp" />
            <img
              src="/assets/images/server-features.png"
              width={1600}
              height={1200}
              alt={t(
                'แคตตาล็อกยุทโธปกรณ์ระดับ S84 ชุดเกราะ Elegia อาวุธ Vesper และประดับบอส',
                'S84 Elegia armor, Vesper weapons, and Epic Boss jewelry catalog'
              )}
              className="w-full h-full object-cover block"
            />
          </picture>
        </figure>
        <div className="lg:col-span-5 surface-ink p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <h2 className="section-heading text-[#F7F5F0]">
              {t('สถานะการยืนยันข้อมูล', 'Configuration Status')}
            </h2>
            <p className="lead-statement text-[#E8E3DB] mt-4">
              {t(
                'กลไกพื้นฐานอ้างอิงตามมาตรฐาน L2J Mobius CT 2.6 High Five ส่วนค่าตัวคูณเฉพาะของ L2Blitz (เช่น % การตีบวก และจำนวนไอเทมดรอปสุทธิ) อยู่ในสถานะ รอยืนยันจาก GameServer',
                'Core mechanics strictly follow L2J Mobius CT 2.6 High Five. Custom L2Blitz multipliers (exact enchant percentages and custom drop tables) are marked as Pending Verification until live GameServer XML files are linked.'
              )}
            </p>
          </div>
          <div className="pt-8">
            <span className="inline-block px-3 py-1.5 bg-[#E97540] text-white small-note font-semibold">
              {ratesData?.verificationStatus === 'verified'
                ? t('ยืนยันจากเซิร์ฟเวอร์จริงแล้ว', 'VERIFIED LIVE CONFIG')
                : t('รอยืนยันค่าตั้งต้นบางส่วน (Pending Verification)', 'PENDING GAMESERVER XML VERIFICATION')}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: EXP / SP / Adena / Drop / Spoil Rates Table */}
      <section className="mt-20" data-reveal>
        <div className="editorial-axis-grid mb-8">
          <div className="col-span-12 lg:col-span-5">
            <p className="small-note text-[#77736C] m-0">
              {t('อัตราคูณและการเติบโตของตัวละคร', 'Progression & Economy Multipliers')}
            </p>
          </div>
          <div className="col-span-12 lg:col-span-7">
            <h2 className="section-heading">
              {t('เรท EXP, SP, อาเดน่า และการดรอป', 'EXP / SP, Adena & Drop Rates')}
            </h2>
          </div>
        </div>

        <div className="surface-white overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('หมวดหมู่', 'Parameter')}</th>
                <th>{t('ค่าที่กำหนด', 'Configured Value')}</th>
                <th>{t('รายละเอียดการทำงาน', 'Mechanics & Notes')}</th>
                <th>{t('สถานะข้อมูล', 'Verification')}</th>
              </tr>
            </thead>
            <tbody>
              {(ratesData?.rates || []).map((row) => (
                <tr key={row.key}>
                  <td className="font-semibold">{t(row.labelTh, row.labelEn)}</td>
                  <td className="font-semibold text-[#E97540] tabular-nums">{row.value}</td>
                  <td>{t(row.noteTh, row.noteEn)}</td>
                  <td>
                    <span className="small-note text-[#77736C]">
                      {row.verified ? t('ยืนยันแล้ว', 'Verified') : t('รอยืนยัน', 'Pending Verification')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2: Enchant & Element System */}
      <section className="mt-20" data-reveal>
        <div className="editorial-axis-grid mb-8">
          <div className="col-span-12 lg:col-span-5">
            <p className="small-note text-[#77736C] m-0">
              {t('การอัปเกรดอาวุธ ชุดเกราะ และหินธาตุ', 'Enchantment & Elemental Attributes')}
            </p>
          </div>
          <div className="col-span-12 lg:col-span-7">
            <h2 className="section-heading">
              {t('ระบบตีบวกและระบบธาตุ (Enchant & Element)', 'Enchant Limits & Attribute Caps')}
            </h2>
          </div>
        </div>

        <div className="surface-white overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('ประเภทไอเทม', 'Equipment Category')}</th>
                <th>{t('ตีบวกปลอดภัย (Safe)', 'Safe Enchant')}</th>
                <th>{t('เพดานสูงสุด (Max)', 'Max Enchant Cap')}</th>
                <th>{t('ระดับธาตุสูงสุด (Attribute)', 'Max Elemental Attribute')}</th>
                <th>{t('สถานะ', 'Status')}</th>
              </tr>
            </thead>
            <tbody>
              {(ratesData?.enchantLimits || []).map((item) => (
                <tr key={item.categoryEn}>
                  <td className="font-semibold">{t(item.categoryTh, item.categoryEn)}</td>
                  <td className="tabular-nums">{item.safeEnchant}</td>
                  <td className="font-semibold text-[#E97540] tabular-nums">{item.maxEnchant}</td>
                  <td className="tabular-nums">{item.attributeMax}</td>
                  <td>
                    <span className="small-note text-[#77736C]">
                      {item.verified ? t('ยืนยันแล้ว', 'Verified') : t('รอยืนยัน XML', 'Pending XML')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: Starter Pack, AutoFarm, AutoPotion, PvP Craft, Community Board & Premium */}
      <section className="mt-24" data-reveal>
        <div className="editorial-axis-grid mb-10">
          <div className="col-span-12 lg:col-span-5">
            <p className="small-note text-[#77736C] m-0">
              {t('สิ่งอำนวยความสะดวกและระบบสนับสนุนผู้เล่น', 'Player Systems & Quality of Life')}
            </p>
          </div>
          <div className="col-span-12 lg:col-span-7">
            <h2 className="section-heading">
              {t('ชุดเริ่มต้น ระบบช่วยเล่น และบริการ Alt+B', 'Starter Pack, Automation & Services')}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              titleTh: 'ชุดเริ่มต้นพร้อมรบ (Starter Pack)',
              titleEn: 'Instant Level 85 Starter Pack',
              bodyTh:
                'เมื่อสร้างตัวละครจะได้รับเลเวล 85 ทันที พร้อมชุดเกราะและอาวุธระดับ S80 (Dynasty / Moirai พื้นฐาน) ประดับเริ่มต้น กระสุน Soulshot / Blessed Spiritshot น้ำยาฟื้นฟู และอาเดน่าตั้งต้นสำหรับตั้งค่าสกิลและออกฟาร์มได้ทันที (รายการไอเทมละเอียดรอยืนยัน)',
              bodyEn:
                'New characters spawn at Level 85 with baseline S80 (Dynasty/Moirai) equipment, starter jewelry, Soulshots/Blessed Spiritshots, consumables, and initial Adena to jump straight into combat.',
            },
            {
              titleTh: 'ระบบฟาร์มอัตโนมัติ (AutoFarm System)',
              titleEn: 'Regulated AutoFarm System',
              bodyTh:
                'เปิดใช้งานผ่านคำสั่งในเกมหรือหน้าต่างระบบ รองรับการตั้งค่าระยะค้นหามอนสเตอร์ ลำดับการใช้สกิลโจมตี การเก็บไอเทมอัตโนมัติ และระบบหยุดทำงานเมื่อถูกผู้เล่นอื่นโจมตีในโซน PvP เพื่อรักษาสมดุล (จำกัดเฉพาะโซนฟาร์มที่อนุญาต)',
              bodyEn:
                'Configure target radius, skill rotation, and auto-loot directly in-game without external bots. Regulated in contested PvP zones to ensure active players hold territorial advantage.',
            },
            {
              titleTh: 'ระบบปั๊มยาอัตโนมัติ (AutoPotion CP / HP / MP)',
              titleEn: 'Threshold AutoPotion (CP / HP / MP)',
              bodyTh:
                'ตั้งค่าเปอร์เซ็นต์การทำงานของน้ำยา Greater CP Potion, Healing Potion และ Mana Potion ได้อย่างแม่นยำ มีดีเลย์ตามมาตรฐานเซิร์ฟเวอร์เพื่อให้ทุกอาชีพปะทะกันอย่างยุติธรรม (ปิดการใช้งานอัตโนมัติเมื่อเข้าสู่สนามโอลิมเพียด)',
              bodyEn:
                'Set exact percentage thresholds for CP, HP, and MP restoration with standardized server cooldowns. Automatically disabled inside Grand Olympiad arenas.',
            },
            {
              titleTh: 'การสร้างไอเทมสายปะทะ (PvP Craft & Upgrade)',
              titleEn: 'PvP Craft & S84 Synthesis',
              bodyTh:
                'นำเหรียญรางวัลจากการสังหารผู้เล่น (PvP Token) เหรียญกิจกรรม TvT และวัตถุดิบจากมอนสเตอร์ใน FARMZONE 1 / FARMZONE 2 มาแลกอัปเกรดเป็นชุดเกราะ Vorpal, Elegia, อาวุธ Top S84, ผ้าคลุมบอส และเข็มขัดระดับสูง',
              bodyEn:
                'Synthesize Vorpal and Elegia armor sets, Top S84 weapons, Soul Cloaks, and Top-Grade PvP Belts by combining farm zone materials with PvP and TvT tokens.',
            },
            {
              titleTh: 'บริการกระดานชุมชน (Community Board Alt+B)',
              titleEn: 'Community Board (Alt+B) Hub',
              bodyTh:
                'รวมศูนย์ทุกบริการไว้ในปุ่มเดียว: บัฟสคีมแยกสำหรับตัวละครและซัมมอน (ระยะเวลาบัฟยาวพิเศษ), เทเลพอร์ตไปยังเมือง พื้นที่ฟาร์ม และหน้าห้องบอส, ร้านค้าอาเดน่า, เปลี่ยนอาชีพ, ซับคลาส, โนเบลส และการเจาะรู/ฝังหิน Life Stone',
              bodyEn:
                'Centralized Alt+B terminal: saved buff schemes for player & servitor, direct farm/raid gatekeeper, Adena shop, class/subclass manager, Noblesse certification, and Life Stone augmentation.',
            },
            {
              titleTh: 'สิทธิประโยชน์บัญชีพรีเมียม (Premium Benefits)',
              titleEn: 'Premium Account Benefits (Fair Play)',
              bodyTh:
                'เพิ่มอัตราการดรอปอาเดน่าและวัตถุดิบฟาร์มตามสัดส่วนที่กำหนด (รอยืนยัน % จากเซิร์ฟเวอร์) โดยไม่เพิ่มค่าสเตตัสตัวละคร P.Atk / M.Atk / P.Def เกินกว่าผู้เล่นทั่วไป เพื่อให้การดวลตัดสินกันด้วยทักษะและการจัดตัวละคร',
              bodyEn:
                'Provides convenience and farming drop-rate bonuses (exact multiplier pending verification) without granting unfair P.Atk/M.Atk/P.Def stat inflation in PvP or Olympiad.',
            },
          ].map((card) => (
            <article key={card.titleEn} className="surface-stone p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-[22px] font-semibold text-[#1A1917]">
                  {t(card.titleTh, card.titleEn)}
                </h3>
                <p className="body-copy text-[#1A1917] mt-4">
                  {t(card.bodyTh, card.bodyEn)}
                </p>
              </div>
              <p className="small-note text-[#77736C] mt-6 m-0">
                L2BLITZ High Five Specification
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Section 4: Gameplay & Fair-Play Rules */}
      <section className="mt-24 surface-ink p-8 sm:p-14" data-reveal>
        <div className="editorial-axis-grid">
          <div className="col-span-12 lg:col-span-5">
            <h2 className="section-heading text-[#F7F5F0]">
              {t('กฎกติกาและการรักษามาตรฐานการแข่งขัน', 'Gameplay & Fair-Play Rules')}
            </h2>
            <p className="body-copy text-[#E8E3DB] mt-4">
              {t(
                'เพื่อรักษาคุณภาพของสังคมผู้เล่นและความโปร่งใสในการจัดอันดับ เซิร์ฟเวอร์บังคับใช้ข้อกำหนดต่อไปนี้อย่างเคร่งครัด',
                'To preserve competitive integrity across Castle Sieges, Grand Olympiad, and Raid Boss encounters, the following policies are strictly enforced.'
              )}
            </p>
          </div>

          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
            {[
              {
                ruleTh: 'ห้ามใช้โปรแกรมช่วยเล่นภายนอก (3rd-Party Bot / Packet Hack)',
                ruleEn: 'Zero Tolerance for External Bots & Packet Manipulation',
                detailTh:
                  'อนุญาตให้ใช้เฉพาะระบบ AutoFarm และ AutoPotion ที่มีให้ภายในตัวเกมเท่านั้น การใช้สคริปต์ดักแพ็กเก็ตหรือบอทภายนอกจะถูกระงับบัญชีถาวร',
                detailEn:
                  'Only the built-in in-game AutoFarm and AutoPotion features are permitted. External scripting or packet injection results in permanent HWID suspension.',
              },
              {
                ruleTh: 'ห้ามปั๊มแต้ม PvP, PK หรือฮั้วผลโอลิมเพียด (Point Feeding)',
                ruleEn: 'Prohibition of PvP / Olympiad Point Feeding',
                detailTh:
                  'ระบบตรวจสอบการสังหารซ้ำจาก IP/HWID เดียวกันและการสลับตัวละครยอมแพ้ในโอลิมเพียด หากตรวจพบจะถูกรีเซ็ตคะแนนและตัดสิทธิ์ความเป็นฮีโร่ในรอบนั้น',
                detailEn:
                  'Automated HWID/IP telemetry flags repeated self-kills or arranged Olympiad forfeits, resulting in immediate disqualification and score reset.',
              },
              {
                ruleTh: 'การจำกัดจำนวนหน้าจอในเขตสงครามและกิจกรรม (Dual-Box Limit)',
                ruleEn: 'Dual-Box Restrictions in Sieges, TvT & Epic Zones',
                detailTh:
                  'ในกิจกรรม Team vs Team, สนามโอลิมเพียด และเขตปราสาท/บอสใหญ่ จำกัดการเข้าพื้นที่ 1 ตัวละครต่อ 1 เครื่องคอมพิวเตอร์ (HWID)',
                detailEn:
                  'TvT arenas, Grand Olympiad matches, and Epic Boss sanctums enforce a strict 1 active character per hardware ID (HWID) limit.',
              },
            ].map((item) => (
              <div key={item.ruleEn} className="bg-[#252320] p-6">
                <h3 className="text-[19px] font-semibold text-[#E97540]">
                  {t(item.ruleTh, item.ruleEn)}
                </h3>
                <p className="body-copy text-[#F7F5F0] mt-2">
                  {t(item.detailTh, item.detailEn)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}