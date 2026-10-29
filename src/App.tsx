import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { type NavTab } from './components/layout/BottomNav';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import type { Transaction } from './db/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && (
        <DashboardPage
          onNavigateToTransactions={() => setActiveTab('transactions')}
          onNavigateToSettings={() => setActiveTab('settings')}
        />
      )}

      {activeTab === 'transactions' && <TransactionsPage />}

      {activeTab === 'analytics' && <AnalyticsPage />}

      {activeTab === 'settings' && <SettingsPage />}
    </AppShell>
  );
}
