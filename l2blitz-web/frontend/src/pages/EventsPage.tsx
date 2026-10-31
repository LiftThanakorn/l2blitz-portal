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
            {t('กิจกรรมต่อสู้แบบทีม', 'Team vs Team (TvT)')}
          </p>
          <p className="body-copy text-[#77736C] mt-3">
            {t(
              'รวมกติกา วิธีเข้าร่วม เวลาแข่งขัน และรางวัลสำหรับกิจกรรม Team vs Team',
              'Find Team vs Team rules, registration, match times and rewards.'
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
                    'เปิดรับสมัครก่อนเริ่มกิจกรรม 5 นาที ลงทะเบียนได้ที่ NPC กิจกรรมในเกม',
                    'Registration opens 5 minutes before each match. Join through the event NPC.'
                  )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="surface-stone p-5">
              <p className="small-note text-[#32846B] font-semibold m-0">TEAM BLUE VANGUARD</p>
              <p className="text-[19px] font-semibold text-[#1A1917] m-0 mt-1">
                {t('ทีมสีน้ำเงิน', 'Blue Team')}
              </p>
              <p className="small-note text-[#77736C] m-0 mt-2">
                {t(
                  'ต่อสู้ร่วมกับทีมสีน้ำเงินเพื่อเก็บคะแนน',
                  'Fight alongside the Blue Team to earn points.'
                )}
              </p>
            </div>

            <div className="surface-stone p-5">
              <p className="small-note text-[#E97540] font-semibold m-0">TEAM RED VANGUARD</p>
              <p className="text-[19px] font-semibold text-[#1A1917] m-0 mt-1">
                {t('ทีมสีแดง', 'Red Team')}
              </p>
              <p className="small-note text-[#77736C] m-0 mt-2">
                {t(
                  'ต่อสู้ร่วมกับทีมสีแดงเพื่อเก็บคะแนน',
                  'Fight alongside the Red Team to earn points.'
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
                    'เริ่มแข่งขันได้ตั้งแต่ 2v2 โดยรางวัลจะเพิ่มขึ้นตามจำนวนผู้เล่นต่อทีม',
                    'Matches start from 2v2, with rewards increasing according to team size.'
                  )}
            </p>
          </div>
          <p className="small-note text-[#E97540] font-medium mt-6 m-0">
            {t(
              'ต้องร่วมแข่งขันตามเงื่อนไขของกิจกรรมจึงมีสิทธิ์รับรางวัล',
              'Players must meet participation requirements to receive rewards.'
            )}
          </p>
        </div>
      </div>

      <section className="mb-16" aria-label={t('อัตรารางวัล TvT', 'TvT rewards')}>
        <h2 className="section-heading mb-6">{t('รางวัลตามขนาดทีม', 'Rewards by Team Size')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { size: '2v2', th: 'ชนะ 25M · แพ้ 12.5M', en: 'Win 25M · Lose 12.5M', time: 10, mvpTh: 'ไม่มีโบนัส MVP', mvpEn: 'No MVP bonus' },
            { size: '3v3', th: 'ชนะ 50M · แพ้ 25M', en: 'Win 50M · Lose 25M', time: 15, mvpTh: 'MVP ฝ่ายชนะ 15M · ฝ่ายแพ้ 5M', mvpEn: 'MVP bonus 15M / 5M' },
            { size: '4v4+', th: 'ชนะ 100M · แพ้ 50M', en: 'Win 100M · Lose 50M', time: 20, mvpTh: 'MVP ฝ่ายชนะ 30M · ฝ่ายแพ้ 10M', mvpEn: 'MVP bonus 30M / 10M' },
          ].map((tier) => (
            <article key={tier.size} className="surface-white p-6 sm:p-7">
              <h3 className="text-[26px] font-semibold text-[#1A1917] m-0">{tier.size}</h3>
              <p className="text-[18px] font-semibold text-[#E97540] mt-3 mb-0">{t(tier.th, tier.en)} Adena</p>
              <p className="body-copy text-[#524E48] mt-3 mb-0">{t(tier.mvpTh, tier.mvpEn)}</p>
              <p className="small-note text-[#77736C] mt-4 mb-0">{tier.time} {t('นาทีต่อรอบ', 'minutes per match')}</p>
            </article>
          ))}
        </div>
        <p className="body-copy text-[#77736C] mt-5 mb-0">
          {t('ในสนาม TvT ค่าบวกอาวุธมีผลสูงสุด +8 และชุดเกราะ โล่ ซิจิล เครื่องประดับ +6 โดยไม่เปลี่ยนค่าบวกจริงของไอเทม ส่วนธาตุ สกิลบวก และถลุงยังคงเดิม',
             'TvT uses effective enchant caps of +8 for weapons and +6 for armor, shields, sigils and jewelry. Actual item enchant, elemental attributes, skill enchant and augmentation remain unchanged.')}
        </p>
      </section>

      {/* Match Results Ledger (Honest Empty State when no live match history exists) */}
      <section className="surface-white p-8">
        <h2 className="text-[24px] font-semibold text-[#1A1917]">
          {t('ผลการแข่งขันล่าสุด', 'Recent TvT Results')}
        </h2>
        {!tvtData?.resultsVerified || tvtData.recentResults.length === 0 ? (
          <div className="surface-stone p-8 mt-6 text-center">
            <p className="lead-statement mx-auto text-[#1A1917]">
              {t(
                'ยังไม่มีผลการแข่งขันให้แสดงในขณะนี้',
                'No recent match results available right now.'
              )}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}