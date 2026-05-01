"use client";
import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import StatusBar from './components/StatusBar';
import POSScreen from './components/POSScreen';
import DashboardScreen from './components/DashboardScreen';
import InventoryScreen from './components/InventoryScreen';
import CustomersScreen from './components/CustomersScreen';
import OrdersScreen from './components/OrdersScreen';

import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [tab, setTab] = useState<'pos'|'dashboard'|'inventory'|'customers'|'orders'>('pos');
  const hydrate = useStore(s => s.hydrate);
  const setPrinterConnected = useStore(s => s.setPrinterConnected);
  const [offline, setOffline] = useState(typeof window !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    hydrate();
    const onl = () => setOffline(false);
    const ofl = () => setOffline(true);
    window.addEventListener('online', onl);
    window.addEventListener('offline', ofl);
    return () => { window.removeEventListener('online', onl); window.removeEventListener('offline', ofl); };
  }, [hydrate]);

  useEffect(() => {
    const check = async () => {
      try {
        const printUrl = process.env.NEXT_PUBLIC_PRINT_AGENT_URL || 'http://localhost:3001';
        const r = await fetch(`${printUrl}/status`, { signal: AbortSignal.timeout(2000) });
        const d = await r.json();
        setPrinterConnected(!!d.connected);
      } catch { setPrinterConnected(false); }
    };
    check();
    const iv = setInterval(check, 5000);
    return () => clearInterval(iv);
  }, [setPrinterConnected]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'p') { e.preventDefault(); /* handled in POS */ }
      if (e.key === 'F1') { e.preventDefault(); setTab('pos'); }
      if (e.key === 'F2') { e.preventDefault(); setTab('dashboard'); }
      if (e.key === 'F3') { e.preventDefault(); setTab('inventory'); }
      if (e.key === 'F4') { e.preventDefault(); setTab('customers'); }
      if (e.key === 'F5') { e.preventDefault(); setTab('orders'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <ErrorBoundary>
      <div className="main-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F5F6FA' }}>
        <Sidebar tab={tab} setTab={setTab} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <StatusBar offline={offline} />
          <div className="content-area" style={{ flex: 1, overflow: 'hidden' }}>
            {tab === 'pos'       && <POSScreen />}
            {tab === 'dashboard' && <DashboardScreen />}
            {tab === 'inventory' && <InventoryScreen />}
            {tab === 'customers' && <CustomersScreen />}
            {tab === 'orders'    && <OrdersScreen />}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
