import { useLanguage } from '../context/LanguageContext';

export function PrelaunchRankingsPage() {
  const { t } = useLanguage();
  return (
    <main className="editorial-frame pt-16 pb-24">
      <p className="small-note font-semibold text-[#C4531E]">L2BLITZ · CLOSE BETA</p>
      <h1 className="display-title mt-5">{t('อันดับผู้เล่น', 'Player Rankings')}<br />{t('เร็ว ๆ นี้', 'Coming Soon')}</h1>
      <div className="surface-stone mt-10 p-8 sm:p-12 max-w-3xl">
        <p className="lead-statement text-[#1A1917] m-0">{t('ข้อมูลตัวละครและผลการทดสอบจะไม่เผยแพร่ก่อนเปิดเซิร์ฟเวอร์อย่างเป็นทางการ', 'Character details and test results will remain private until the official server launch.')}</p>
        <p className="body-copy text-[#77736C] mt-4 mb-0">{t('เมื่อเปิดให้บริการจริง จะมีอันดับ PvP, PK, แคลน และโอลิมเพียดให้ติดตามที่นี่', 'After launch, PvP, PK, clan and Olympiad rankings will become available here.')}</p>
      </div>
    </main>
  );
}
