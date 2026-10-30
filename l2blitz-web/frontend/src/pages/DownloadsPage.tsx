import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export function DownloadsPage() {
  const { t } = useLanguage();

  return (
    <div className="editorial-frame pt-10 pb-20">
      <div className="editorial-axis-grid items-end pb-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="small-note text-[#E97540] font-semibold m-0">L2BLITZ · HIGH FIVE CLIENT</p>
          <p className="body-copy text-[#77736C] mt-4">
            {t('ดาวน์โหลดตัวเกมและโปรแกรมเปิดเกม L2Blitz ได้ที่นี่เมื่อเปิดให้บริการ', 'Get the L2Blitz game client and launcher here when available.')}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <h1 className="display-title">{t('ดาวน์โหลดและติดตั้ง', 'Downloads & Installation')}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
        <article className="surface-ink p-8 sm:p-10">
          <p className="small-note text-[#E97540] font-semibold mb-4">L2BLITZ LAUNCHER</p>
          <h2 className="section-heading text-[#F7F5F0]">{t('ลอนเชอร์ L2Blitz', 'L2Blitz Launcher')}</h2>
          <p className="body-copy text-[#E8E3DB] mt-4">{t('ใช้เปิดเกม L2Blitz และตรวจสอบไฟล์เกมให้พร้อมเล่น', 'Launch L2Blitz and keep your game files ready.')}</p>
          <p className="small-note text-[#E8E3DB] mt-8 mb-0">{t('ยังไม่เปิดให้ดาวน์โหลด', 'Download coming soon')}</p>
        </article>
        <article className="surface-stone p-8 sm:p-10">
          <p className="small-note text-[#E97540] font-semibold mb-4">LINEAGE II HIGH FIVE</p>
          <h2 className="section-heading text-[#1A1917]">{t('ไฟล์ตัวเกม', 'Full Client')}</h2>
          <p className="body-copy text-[#524E48] mt-4">{t('ต้องใช้ไคลเอนต์ Lineage II High Five ที่เข้ากันได้กับไฟล์ของ L2Blitz', 'Requires a Lineage II High Five client compatible with L2Blitz files.')}</p>
          <p className="small-note text-[#77736C] mt-8 mb-0">{t('ยังไม่เปิดให้ดาวน์โหลด', 'Download coming soon')}</p>
        </article>
      </div>

      <section className="surface-white p-8 sm:p-10">
        <h2 className="section-heading">{t('ก่อนเข้าเล่น', 'Before You Play')}</h2>
        <p className="body-copy text-[#524E48] mt-4">{t('ติดตั้งตัวเกมและลอนเชอร์เวอร์ชันที่ประกาศอย่างเป็นทางการไว้ในโฟลเดอร์เดียวกัน เปิดลอนเชอร์เพื่อตรวจสอบความเข้ากันได้ก่อนเข้าเกม', 'Install the officially released High Five client and launcher in the same game directory, then use the launcher to check compatibility before playing.')}</p>
      </section>
    </div>
  );
}
