import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Swords,
  Server,
  Trophy,
  Skull,
  MapPin,
  Flame,
  Download,
  Menu,
  X,
  Globe,
  ShieldAlert,
  Activity,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { apiClient } from '@/lib/apiClient';
import { SITE_CONFIG } from '@/config/siteConfig';
import type { ServerStatusResponse } from '@shared/schema';
import { formatNumber } from '@/lib/utils';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang, t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [statusData, setStatusData] = useState<ServerStatusResponse | null>(null);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    const loadStatus = () => {
      apiClient
        .getServerStatus()
        .then((res) => {
          if (active) setStatusData(res);
        })
        .catch(() => {});
    };
    loadStatus();
    const interval = setInterval(loadStatus, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { to: '/', label: t('หน้าแรก', 'Home'), icon: Swords },
    { to: '/server-info', label: t('ข้อมูลเซิร์ฟเวอร์', 'Server Info'), icon: Server },
    { to: '/rankings', label: t('จัดอันดับ', 'Rankings'), icon: Trophy },
    { to: '/raid-boss', label: t('เรดบอส', 'Raid Boss'), icon: Skull },
    { to: '/farm-zones', label: t('โซนฟาร์ม', 'Farm Zones'), icon: MapPin },
    { to: '/events', label: t('กิจกรรม TvT', 'Events'), icon: Flame },
    { to: '/downloads', label: t('ดาวน์โหลด', 'Downloads'), icon: Download },
  ];

  const gsState = statusData?.gameServer ?? 'unknown';
  const dbState = statusData?.database ?? 'unknown';

  return (
    <div className="min-h-screen flex flex-col bg-[#080b11] text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Status Strip — Distinguishes GameServer TCP 7777 from MySQL Database */}
      <div className="border-b border-slate-800/80 bg-[#05070b] px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold tracking-wider text-sky-400">
              L2BLITZ HIGH FIVE (CT 2.6)
            </span>

            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  gsState === 'online'
                    ? 'bg-emerald-400'
                    : gsState === 'offline'
                      ? 'bg-rose-500'
                      : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-400">GameServer:</span>
              <strong className="uppercase text-slate-200">{gsState}</strong>
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  dbState === 'online'
                    ? 'bg-emerald-400'
                    : dbState === 'offline'
                      ? 'bg-rose-500'
                      : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-400">Database:</span>
              <strong className="uppercase text-slate-200">{dbState}</strong>
            </div>

            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
              <Activity className="h-3.5 w-3.5 text-sky-400" />
              <span className="text-slate-400">{t('ผู้เล่นออนไลน์:', 'Online:')}</span>
              <strong className="font-mono text-sky-300">
                {statusData?.playersOnline !== null && statusData?.playersOnline !== undefined
                  ? formatNumber(statusData.playersOnline)
                  : t('ไม่พร้อมใช้งาน', 'Unavailable')}
              </strong>
              {statusData?.meta.isDemo && (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-amber-300">
                  DEMO
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-slate-400">
              {t(
                'สมัครไอดีอัตโนมัติในตัวเกม (ไม่มีระบบล็อกอินหรือเติมเงินบนเว็บ)',
                'In-Game Account Creation Only (No Web Login / Top-up)'
              )}
            </span>

            <button
              type="button"
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-slate-200 hover:border-sky-500/60 hover:text-sky-300 cursor-pointer"
              aria-label="Switch Language"
            >
              <Globe className="h-3.5 w-3.5 text-sky-400" />
              <span>{lang === 'th' ? 'TH / EN' : 'EN / TH'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#080b11]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-500/40 bg-[#0d1526] text-sky-400 group-hover:border-sky-400">
              <Swords className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  L2BLITZ <span className="text-sky-400">PVP</span>
                </span>
                <span className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                  H5 TH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Lineage II High Five Instant PvP Portal
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-sky-950/70 text-sky-300 border border-sky-800/60'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:text-white lg:hidden cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <nav className="border-t border-slate-800 bg-[#0a0f1c] px-4 py-3 lg:hidden">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        isActive
                          ? 'bg-sky-950/80 text-sky-300 border border-sky-800/60'
                          : 'text-slate-300 hover:bg-slate-900'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-[#05070b] py-10 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Swords className="h-4 w-4 text-sky-400" />
                <span>L2BLITZ PVP — HIGH FIVE THAILAND</span>
              </div>
              <p className="mt-2 leading-relaxed text-slate-400">
                {SITE_CONFIG.brand.tagline[lang]}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded border border-slate-800 bg-slate-900/70 px-2.5 py-1 text-[11px] text-slate-300">
                <ShieldAlert className="h-3.5 w-3.5 text-sky-400" />
                <span>
                  {t(
                    'เว็บไซต์อ่านข้อมูลอย่างเดียว (Read-Only) ไม่มีการเชื่อมต่อสิทธิ์แก้ไขฐานข้อมูลเกม',
                    'Strictly Read-Only Portal — Zero write privileges to the game database'
                  )}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold uppercase tracking-wider text-slate-200">
                {t('ทางลัดข้อมูลสำคัญ', 'Quick Links')}
              </h4>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="hover:text-sky-300 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold uppercase tracking-wider text-slate-200">
                {t('นโยบายบัญชีและความปลอดภัย', 'Account & Security Policy')}
              </h4>
              <p className="mt-3 leading-relaxed">
                {SITE_CONFIG.brand.accountRegistrationNotice[lang]}
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                Lineage II is a registered trademark of NCSOFT Corporation. L2Blitz is an independent private server portal built for L2J Mobius CT 2.6 High Five.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
