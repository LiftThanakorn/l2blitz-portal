import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { locale, setLocale, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  // Trigger scroll reveals as sections enter the viewport (Taste Skill Step 9)
  useEffect(() => {
    const allRevealNodes = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-reveal], [data-reveal] h2, [data-reveal] h3, [data-reveal] p, [data-reveal] figure, [data-reveal] a'
      )
    );

    if (
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
      allRevealNodes.forEach((node) => {
        node.style.opacity = '1';
        node.style.transform = 'translateY(0px)';
      });
      return;
    }

    const revealSection = (section: Element) => {
      if (section.classList.contains('is-in')) return;
      section.classList.add('is-in');
      if (section instanceof HTMLElement) {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0px)';
      }
      const children = section.querySelectorAll<HTMLElement>('h2, h3, p, figure, a');
      children.forEach((child, idx) => {
        child.style.transitionDelay = `${Math.min(idx * 45, 220)}ms`;
        child.style.opacity = '1';
        child.style.transform = 'translateY(0px)';
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            revealSection(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );

    const targets = document.querySelectorAll('[data-reveal]');
    targets.forEach((el) => io.observe(el));

    const onScrollCheck = () => {
      const vh = window.innerHeight || 900;
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) {
          revealSection(el);
        }
      });
    };
    window.addEventListener('scroll', onScrollCheck, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScrollCheck);
    };
  }, [location.pathname, locale]);

  const navItems = [
    { to: '/info', labelTh: 'ข้อมูลเซิร์ฟเวอร์', labelEn: 'Server Info' },
    { to: '/rankings', labelTh: 'อันดับผู้เล่น', labelEn: 'Rankings' },
    { to: '/olympiad', labelTh: 'โอลิมเพียด', labelEn: 'Olympiad' },
    { to: '/raidboss', labelTh: 'เรดบอส', labelEn: 'Raid Boss' },
    { to: '/farmzones', labelTh: 'พื้นที่ฟาร์ม', labelEn: 'Farm Zones' },
    { to: '/events', labelTh: 'กิจกรรม TvT', labelEn: 'Events' },
  ];

  return (
    <div className="min-h-svh flex flex-col surface-paper">
      {/* Top Editorial Tile Bar */}
      <header className="w-full p-2">
        <div className="grid grid-cols-12 gap-2 items-stretch min-h-[58px]">
          <Link
            to="/"
            className="col-span-6 md:col-span-3 lg:col-span-2 surface-ink flex items-center justify-between px-4 py-3 no-underline"
          >
            <span className="font-semibold tracking-tight text-[#F7F5F0]">
              L2BLITZ
            </span>
            <span className="small-note text-[#E97540] font-medium">H5 PVP</span>
          </Link>

          <nav
            aria-label={t('เมนูหลัก', 'Primary Navigation')}
            className="hidden lg:flex lg:col-span-7 surface-stone items-center justify-between px-6"
          >
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `no-underline small-note transition-colors ${
                      isActive
                        ? 'text-[#1A1917] font-semibold underline decoration-[#E97540] decoration-2 underline-offset-8'
                        : 'text-[#1A1917] hover:text-[#C4531E]'
                    }`
                  }
                >
                  {t(item.labelTh, item.labelEn)}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-1" role="group" aria-label="Language Switcher">
              <button
                type="button"
                onClick={() => setLocale('th')}
                className={`px-2.5 py-1 small-note cursor-pointer border-0 ${
                  locale === 'th'
                    ? 'bg-[#1A1917] text-[#F7F5F0] font-medium'
                    : 'bg-transparent text-[#1A1917] hover:text-[#C4531E]'
                }`}
              >
                ไทย
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 small-note cursor-pointer border-0 ${
                  locale === 'en'
                    ? 'bg-[#1A1917] text-[#F7F5F0] font-medium'
                    : 'bg-transparent text-[#1A1917] hover:text-[#C4531E]'
                }`}
              >
                EN
              </button>
            </div>
          </nav>

          <div className="col-span-6 md:col-span-6 lg:hidden surface-stone flex items-center justify-end gap-2 px-3">
            <button
              type="button"
              onClick={() => setLocale(locale === 'th' ? 'en' : 'th')}
              className="px-3 py-1.5 small-note bg-[#F7F5F0] text-[#1A1917] border-0 cursor-pointer font-medium"
            >
              {locale === 'th' ? 'EN' : 'ไทย'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              className="px-3.5 py-1.5 small-note bg-[#1A1917] text-[#F7F5F0] border-0 cursor-pointer font-medium"
            >
              {mobileMenuOpen ? t('ปิดเมนู', 'Close') : t('เมนู', 'Menu')}
            </button>
          </div>

          <Link
            to="/downloads"
            className="hidden md:flex md:col-span-3 lg:col-span-3 surface-ink items-center justify-between px-5 py-3 no-underline font-medium small-note text-[#F7F5F0] hover:bg-[#E97540] transition-colors"
          >
            <span>{t('ดาวน์โหลดตัวเกม', 'Download Client')}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {mobileMenuOpen && (
          <nav
            aria-label={t('เมนูมือถือ', 'Mobile Navigation')}
            className="lg:hidden surface-ink mt-2 p-6 flex flex-col gap-4"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `no-underline body-copy py-1 ${
                    isActive ? 'text-[#E97540] font-semibold' : 'text-[#F7F5F0]'
                  }`
                }
              >
                {t(item.labelTh, item.labelEn)}
              </NavLink>
            ))}
            <Link to="/downloads" className="btn-primary w-full mt-2 text-center">
              {t('ดาวน์โหลดตัวเกม High Five', 'Download High Five Client')}
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Editorial Footer */}
      <footer className="surface-ink mt-24 pt-16 pb-14 px-4 md:px-10 overflow-hidden">
        <div className="max-w-[1280px] mx-auto">
          <div className="overflow-hidden mb-14">
            <p className="display-title text-[#F7F5F0] m-0 select-none">
              L2BLITZ HIGH FIVE
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-5 flex flex-col gap-3">
              <Link
                to="/downloads"
                className="lead-statement text-[#E97540] no-underline font-medium hover:underline"
              >
                {t('ดาวน์โหลดไคลเอนต์ CT 2.6', 'Download CT 2.6 Client')}
              </Link>
              <Link
                to="/olympiad"
                className="lead-statement text-[#F7F5F0] no-underline font-medium hover:text-[#E97540] transition-colors"
              >
                {t('ทำเนียบแกรนด์โอลิมเพียด', 'Grand Olympiad Ledger')}
              </Link>
              <Link
                to="/raidboss"
                className="lead-statement text-[#F7F5F0] no-underline font-medium hover:text-[#E97540] transition-colors"
              >
                {t('ตารางเวลาเกิดบอสใหญ่', 'Grand Boss Spawn Windows')}
              </Link>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div className="flex flex-col gap-2.5">
                <p className="text-[#F7F5F0] font-semibold small-note m-0">
                  {t('ข้อมูลหลัก', 'Core Portal')}
                </p>
                <Link to="/info" className="text-[#E8E3DB] no-underline small-note hover:text-[#E97540]">
                  {t('เรทและระบบเซิร์ฟเวอร์', 'Server Rates & Rules')}
                </Link>
                <Link to="/farmzones" className="text-[#E8E3DB] no-underline small-note hover:text-[#E97540]">
                  {t('พื้นที่ฟาร์มอาเดน่า', 'Adena Farm Zones')}
                </Link>
                <Link to="/events" className="text-[#E8E3DB] no-underline small-note hover:text-[#E97540]">
                  {t('กิจกรรม Team vs Team', 'TvT Arena Schedule')}
                </Link>
              </div>

              <div className="flex flex-col gap-2.5">
                <p className="text-[#F7F5F0] font-semibold small-note m-0">
                  {t('การจัดอันดับ', 'Leaderboards')}
                </p>
                <Link to="/rankings" className="text-[#E8E3DB] no-underline small-note hover:text-[#E97540]">
                  {t('อันดับสังหาร PvP / PK', 'PvP & PK Standings')}
                </Link>
                <Link to="/rankings?tab=clans" className="text-[#E8E3DB] no-underline small-note hover:text-[#E97540]">
                  {t('อันดับแคลนและปราสาท', 'Clan & Castle Ledger')}
                </Link>
                <Link to="/olympiad?view=heroes" className="text-[#E8E3DB] no-underline small-note hover:text-[#E97540]">
                  {t('รายชื่อวีรบุรุษ (Heroes)', 'Current Cycle Heroes')}
                </Link>
              </div>

              <div className="flex flex-col gap-2.5 col-span-2 sm:col-span-1">
                <p className="text-[#F7F5F0] font-semibold small-note m-0">
                  {t('สถาปัตยกรรม', 'Chronicle Spec')}
                </p>
                <span className="text-[#E8E3DB] small-note">Lineage II High Five</span>
                <span className="text-[#E8E3DB] small-note">L2J Mobius CT 2.6</span>
                <span className="text-[#E8E3DB] small-note">Thailand (GMT+7)</span>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 small-note text-[#E8E3DB]">
            <p className="m-0 max-w-[60ch]">
              {t(
                'L2BLITZ PVP พอร์ทัลข้อมูลเซิร์ฟเวอร์ Lineage II High Five ข้อมูลเรทที่ยังไม่ได้รับการยืนยันจากไฟล์เซิร์ฟเวอร์จริงจะแสดงสถานะรอยืนยันอย่างชัดเจน',
                'L2BLITZ PVP Lineage II High Five (CT 2.6) portal. Unverified configuration parameters are explicitly marked as pending GameServer verification.'
              )}
            </p>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[#F7F5F0] no-underline hover:text-[#E97540] shrink-0"
            >
              {t('กลับขึ้นด้านบน ↑', 'Back to top ↑')}
            </a>
          </div>

          <p className="mt-4 small-note text-[#E8E3DB] opacity-80 m-0 max-w-[62ch]">
            Archival reference plates: “Saddle” (1400–20) &amp; “Poleaxe” (19th c.), CC0 Public Domain via Art Institute of Chicago; “Sainte-Cécile Cathedral Stonework” by Marc-Julien-Photography, CC0 via Wikimedia Commons.
          </p>
        </div>
      </footer>
    </div>
  );
}
