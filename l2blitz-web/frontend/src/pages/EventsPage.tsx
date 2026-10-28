import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { fetchApi } from '../lib/api';

interface TvtEventData {
  eventNameEn: string;
  eventNameTh: string;
  format: string;
  scheduleTimes: string[];
  registrationRuleTh: string;
  registrationRuleEn: string;
  arenaEn: string;
  arenaTh: string;
  levelRequirement: number;
  restrictionsTh: string[];
  restrictionsEn: string[];
  rewardsNoteTh: string;
  rewardsNoteEn: string;
  recentResults: {
    matchId: string;
    timestamp: string;
    winnerTeam: 'Blue' | 'Red' | 'Draw';
    blueScore: number;
    redScore: number;
    topKiller: string;
  }[];
  resultsVerified: boolean;
}

export function EventsPage() {
  const { t, locale } = useLanguage();
  const [tvtData, setTvtData] = useState<TvtEventData | null>(null);

  useEffect(() => {
    fetchApi<TvtEventData>('/api/events/tvt').then((res) => {
      if (res.data) setTvtData(res.data);
    });
  }, []);

  const restrictions =
    locale === 'th' ? tvtData?.restrictionsTh || [] : tvtData?.restrictionsEn || [];

  return (
    <div className="editorial-frame pt-10 pb-16">
      {/* Masthead */}
      <div className="editorial-axis-grid items-end pb-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="small-note text-[#E97540] font-semibold m-0">
            {t('ระบบศึกประลองทีมอัตโนมัติ (Automated PvP Events)', 'Automated Faction Warfare & TvT')}
          </p>
          <p className="body-copy text-[#77736C] mt-3">
            {t(
              'กติกาการแข่งขัน การแบ่งทีมน้ำเงินและแดง ขั้นตอนการลงทะเบียน ตารางเวลาประจำวัน รางวัลผู้ชนะ และผลการแข่งขันล่าสุดเมื่อเชื่อมต่อฐานข้อมูลเซิร์ฟเวอร์',
              'Complete Team vs Team (TvT) ruleset, faction balancing mechanics, registration workflow, daily schedule, rewards, and verified match logs.'
            )}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <h1 className="display-title">
            {t('กิจกรรมประลอง', 'Team vs Team')}
            <br />
            {t('Team vs Team', 'Arena Events')}
          </h1>
        </div>
      </div>

      {/* Hero Artwork: Events / TvT (16:9) */}
      <figure className="m-0 mb-16 surface-stone overflow-hidden max-h-[460px]">
        <picture>
          <source srcSet="/assets/images/events-tvt.webp" type="image/webp" />
          <img
            src="/assets/images/events-tvt.png"
            width={1920}
            height={1080}
            alt={t(
              'สองทีมคู่ปะทะ Team Blue และ Team Red เผชิญหน้ากันในสนามโคลอสเซียม',
              'Opposing Team Blue and Team Red High Five formations facing off in the colosseum'
            )}
            className="w-full h-full object-cover block"
          />
        </picture>
      </figure>

      {/* Two-Faction Contrast & Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
        {/* Team Blue vs Team Red Faction Balance */}
        <div className="lg:col-span-7 surface-white p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <h2 className="section-heading">
              {t('การจัดสมดุลทีมและขั้นตอนลงทะเบียน', 'Faction Balancing & Registration')}
            </h2>
            <p className="body-copy text-[#1A1917] mt-4">
              {tvtData
                ? t(tvtData.registrationRuleTh, tvtData.registrationRuleEn)
                : t(
                    'ระบบเปิดรับลงทะเบียนล่วงหน้า 10 นาทีก่อนเริ่มการแข่งขันแต่ละรอบ และสุ่มแยกผู้เล่นออกเป็น 2 ฝ่ายอย่างสมดุล',
                    'Registration opens 10 minutes prior to each match, balancing classes and healers across Blue and Red teams.'
                  )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="surface-stone p-5">
              <p className="small-note text-[#32846B] font-semibold m-0">TEAM BLUE VANGUARD</p>
              <p className="text-[19px] font-semibold text-[#1A1917] m-0 mt-1">
                {t('ฝ่ายสีน้ำเงิน (Order of Eva)', 'Blue Faction (Order of Eva)')}
              </p>
              <p className="small-note text-[#77736C] m-0 mt-2">
                {t(
                  'จุดเกิดฝั่งตะวันตกของโคลอสเซียม ได้รับออร่าสีน้ำเงินและบัฟมาตรฐานเท่าเทียมกัน',
                  'Western Colosseum spawn point with standardized tournament buff set.'
                )}
              </p>
            </div>

            <div className="surface-stone p-5">
              <p className="small-note text-[#E97540] font-semibold m-0">TEAM RED VANGUARD</p>
              <p className="text-[19px] font-semibold text-[#1A1917] m-0 mt-1">
                {t('ฝ่ายสีแดง (Order of Gran Kain)', 'Red Faction (Order of Gran Kain)')}
              </p>
              <p className="small-note text-[#77736C] m-0 mt-2">
                {t(
                  'จุดเกิดฝั่งตะวันออกของโคลอสเซียม นับคะแนนรวมจากจำนวนการสังหารผู้เล่นฝั่งตรงข้าม',
                  'Eastern Colosseum spawn point; victory awarded to highest total faction kills.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Daily Schedule & Arena Info */}
        <div className="lg:col-span-5 surface-ink p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <h2 className="section-heading text-[#F7F5F0]">
              {t('รอบเวลาแข่งขันประจำวัน', 'Daily Match Schedule')}
            </h2>
            <p className="small-note text-[#E8E3DB] mt-2">
              {t('เวลาประเทศไทย (GMT+7) · เลเวลขั้นต่ำ Lv. 20', 'Thailand Time (GMT+7) · Minimum Level 20')}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              {(tvtData?.scheduleTimes || ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']).map(
                (time) => (
                  <div
                    key={time}
                    className="bg-[#252320] p-4 text-center font-semibold text-[20px] text-[#E97540] tabular-nums"
                  >
                    {time}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="pt-8 mt-6">
            <p className="small-note text-[#E8E3DB] m-0">
              {t('สนามประลอง:', 'Active Arenas:')}{' '}
              <strong className="text-[#F7F5F0]">
                {tvtData
                  ? t(tvtData.arenaTh, tvtData.arenaEn)
                  : 'Coliseum'}
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* Event Rules & Rewards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
        <div className="lg:col-span-6 surface-stone p-8">
          <h2 className="text-[24px] font-semibold text-[#1A1917]">
            {t('กฎระเบียบในสนามประลอง', 'Arena Rules & Restrictions')}
          </h2>
          <ul className="mt-4 pl-5 flex flex-col gap-3 text-[#1A1917]">
            {restrictions.map((r) => (
              <li key={r} className="text-[16px] leading-relaxed">
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6 surface-stone p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-[24px] font-semibold text-[#1A1917]">
              {t('เงื่อนไขการรับรางวัล (Rewards)', 'Match Rewards & Eligibility')}
            </h2>
            <p className="body-copy text-[#1A1917] mt-4">
              {tvtData
                ? t(tvtData.rewardsNoteTh, tvtData.rewardsNoteEn)
                : t(
                    'ทีมชนะรับพื้นฐาน 120M ทีมแพ้รับ 50M Adena (มีเงื่อนไขการจ่ายรางวัล)',
                    'Base Adena rewards: 120M winning team, 50M losing team (eligibility conditions apply).'
                  )}
            </p>
          </div>
          <p className="small-note text-[#E97540] font-medium mt-6 m-0">
            {t(
              'จำนวนรางวัลขึ้นอยู่กับขนาดทีม กิจกรรมจริง และเงื่อนไขป้องกันการฟาร์มรางวัล',
              'Rewards depend on team size, valid activity and anti-abuse eligibility checks.'
            )}
          </p>
        </div>
      </div>

      {/* Match Results Ledger (Honest Empty State when no live match history exists) */}
      <section className="surface-white p-8">
        <h2 className="text-[24px] font-semibold text-[#1A1917]">
          {t('บันทึกผลการแข่งขันล่าสุด (Verified Match Results)', 'Recent TvT Match Results')}
        </h2>
        {!tvtData?.resultsVerified || tvtData.recentResults.length === 0 ? (
          <div className="surface-stone p-8 mt-6 text-center">
            <p className="lead-statement mx-auto text-[#1A1917]">
              {t(
                'ยังไม่มีบันทึกผลการแข่งขัน TvT จากเซิร์ฟเวอร์จริงในขณะนี้ · ข้อมูลคะแนนทั้งสองฝั่งและผู้เล่นที่สังหารสูงสุดจะแสดงเมื่อเชื่อมต่อฐานข้อมูล GameServer',
                'No verified match-history integration is configured for the website yet.'
              )}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}