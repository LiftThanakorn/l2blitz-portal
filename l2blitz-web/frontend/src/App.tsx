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
