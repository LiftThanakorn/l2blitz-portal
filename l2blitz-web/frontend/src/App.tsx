import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ServerInfoPage } from './pages/ServerInfoPage';
import { RankingsPage } from './pages/RankingsPage';
import { OlympiadPage } from './pages/OlympiadPage';
import { RaidBossPage } from './pages/RaidBossPage';
import { FarmZonesPage } from './pages/FarmZonesPage';
import { EventsPage } from './pages/EventsPage';
import { DownloadsPage } from './pages/DownloadsPage';
import { TopUpPage } from './pages/TopUpPage';
import { PUBLIC_TOPUP_ENABLED } from './publicLaunch';
import { useLanguage } from './context/LanguageContext';

function TopUpPrelaunchNotice() {
  const { t } = useLanguage();
  return (
    <section className="editorial-frame py-20" role="status">
      <h1 className="display-title">{t('ระบบเติมเงินยังไม่เปิดให้บริการ', 'Top-ups are not yet available')}</h1>
      <p className="body-copy text-[#524E48] mt-6">
        {t('L2Blitz กำลังเตรียมเปิดจริง ระบบเติมเงินสาธารณะยังปิดเพื่อความปลอดภัย โปรดติดตามประกาศอย่างเป็นทางการ', 'L2Blitz is preparing for its official launch. Public payments remain disabled for safety until formally announced.')}
      </p>
    </section>
  );
}

export function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/info" element={<ServerInfoPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/olympiad" element={<OlympiadPage />} />
        <Route path="/raidboss" element={<RaidBossPage />} />
        <Route path="/farmzones" element={<FarmZonesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/topup" element={PUBLIC_TOPUP_ENABLED ? <TopUpPage /> : <TopUpPrelaunchNotice />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LanguageProvider>
  );
}
