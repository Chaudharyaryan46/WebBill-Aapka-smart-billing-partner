"use client";
import React from 'react';
import { useStore } from '../store';

export default function StatusBar({ offline }: { offline: boolean }) {
  const printerConnected = useStore(s => s.printerConnected);
  
  return (
    <div style={{ height: 72, background: '#fff', borderBottom: '1px solid #EAEDF3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Logo container with fallback */}
        <div style={{ display: 'flex', alignItems: 'center', height: 54, position: 'relative' }}>
          <img 
            src="/logo.svg" 
            alt="WebBill Logo" 
            style={{ height: '100%', width: 'auto', objectFit: 'contain' }} 
            onError={(e) => { 
              e.currentTarget.style.display = 'none'; 
              const fallback = document.getElementById('logo-text-fallback');
              if (fallback) fallback.style.display = 'block';
            }} 
          />
          <span id="logo-text-fallback" style={{ display: 'none', fontWeight: 900, fontSize: 32, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#0D3370' }}>Web</span>
            <span style={{ color: '#0059D6' }}>Bill</span>
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {offline && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#FF3B3B', background: '#FFF0F0', padding: '4px 10px', borderRadius: 20 }}>
            ⚡ OFFLINE
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: printerConnected ? '#1DBF73' : '#FF3B3B' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: printerConnected ? '#1DBF73' : '#FF3B3B', display: 'inline-block' }} />
          {printerConnected ? 'Printer Ready' : 'Printer Offline'}
        </div>
        <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
      </div>
    </div>
  );
}
