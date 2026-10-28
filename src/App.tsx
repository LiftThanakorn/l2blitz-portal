import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from '@/lib/i18n';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { ServerInfoPage } from '@/pages/ServerInfoPage';
import { RankingsPage } from '@/pages/RankingsPage';
import { RaidBossPage } from '@/pages/RaidBossPage';
import { FarmZonePage } from '@/pages/FarmZonePage';
import { EventsPage } from '@/pages/EventsPage';
import { DownloadsPage } from '@/pages/DownloadsPage';

export function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/server-info" element={<ServerInfoPage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/raid-boss" element={<RaidBossPage />} />
            <Route path="/farm-zones" element={<FarmZonePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App;
