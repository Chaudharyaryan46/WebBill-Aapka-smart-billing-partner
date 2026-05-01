"use client";
import React, { useMemo } from 'react';
import { useStore } from '../store';

export default function DashboardScreen() {
  const bills = useStore(s => s.bills);
  const expenses = useStore(s => s.expenses);
  const customers = useStore(s => s.customers);

  const today = new Date().toDateString();

  const stats = useMemo(() => {
    const todayBills = bills.filter(b => new Date(b.timestamp).toDateString() === today);
    const todaySales = todayBills.reduce((s, b) => s + b.grandTotal, 0);
    const todayOrders = todayBills.length;
    const totalSales = bills.reduce((s, b) => s + b.grandTotal, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const pendingCredit = customers.reduce((s, c) => s + c.credit, 0);

    // Payment distribution
    const payDist: Record<string, number> = { Cash: 0, UPI: 0, Credit: 0 };
    bills.forEach(b => { payDist[b.paymentMode] = (payDist[b.paymentMode] || 0) + b.grandTotal; });

    // Top items
    const itemCount: Record<string, number> = {};
    bills.forEach(b => b.items.forEach(i => { itemCount[i.name] = (itemCount[i.name] || 0) + i.qty; }));
    const topItems = Object.entries(itemCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Hourly sales
    const hourly = Array(24).fill(0);
    todayBills.forEach(b => { hourly[new Date(b.timestamp).getHours()] += b.grandTotal; });
    const maxH = Math.max(...hourly, 1);

    // Last 7 days trend
    const daily: { label: string; val: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const val = bills.filter(b => new Date(b.timestamp).toDateString() === ds).reduce((s, b) => s + b.grandTotal, 0);
      daily.push({ label: dayLabel, val });
    }
    const maxD = Math.max(...daily.map(d => d.val), 1);

    // Avg ticket
    const avgTicket = bills.length > 0 ? Math.round(totalSales / bills.length) : 0;

    return { todaySales, todayOrders, totalSales, totalExpenses, pendingCredit, payDist, topItems, hourly, maxH, daily, maxD, avgTicket };
  }, [bills, expenses, customers]);

  const Card = ({ icon, label, val, color, bg }: { icon: string; label: string; val: string; color: string; bg: string }) => (
    <div style={{ background: bg, borderRadius: 20, padding: '18px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #EAEDF3' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 26 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      </div>
      <p style={{ fontSize: 24, fontWeight: 900, color, letterSpacing: '-1px', margin: 0 }}>{val}</p>
    </div>
  );

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '16px', background: '#F5F6FA' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0D3370', marginBottom: 2 }}>📊 Dashboard</h1>
      <p style={{ color: '#6B7280', fontSize: 12, fontWeight: 500, marginBottom: 16 }}>Business overview · {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, marginBottom: 16 }}>
        <Card icon="💰" label="Sales" val={`₹${stats.todaySales.toLocaleString('en-IN')}`} color="#0D3370" bg="#fff" />
        <Card icon="📦" label="Orders" val={`${stats.todayOrders}`} color="#0059D6" bg="#FFF5F0" />
        <Card icon="📈" label="Ticket" val={`₹${stats.avgTicket}`} color="#1DBF73" bg="#F0FDF8" />
        <Card icon="⚠️" label="Credit" val={`₹${stats.pendingCredit.toLocaleString('en-IN')}`} color="#FF3B3B" bg="#FFF5F5" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
        {/* 7-Day Trend */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontWeight: 800, fontSize: 13, color: '#0D3370', marginBottom: 14, margin: '0 0 14px' }}>📈 7-Day Trend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
            {stats.daily.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: d.val > 0 ? 'linear-gradient(180deg,#0059D6,#FF7A45)' : '#EAEDF3', height: `${(d.val / stats.maxD) * 100}%`, minHeight: 4, transition: 'height 0.3s ease' }} />
                <span style={{ fontSize: 9, color: '#6B7280', fontWeight: 600 }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Split */}
        <div style={{ background: '#0D3370', borderRadius: 20, padding: '16px' }}>
          <h3 style={{ fontWeight: 800, fontSize: 13, color: '#fff', marginBottom: 14, margin: '0 0 14px' }}>💳 Payment Split</h3>
          {(['Cash', 'UPI', 'Credit'] as const).map(m => {
            const val = stats.payDist[m] || 0;
            const pct = stats.totalSales > 0 ? Math.round((val / stats.totalSales) * 100) : 0;
            return (
              <div key={m} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{m}</span>
                  <span style={{ color: '#0059D6' }}>₹{val.toLocaleString('en-IN')} ({pct}%)</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#0059D6,#FF7A45)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Items + Today Hourly */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontWeight: 800, fontSize: 13, color: '#0D3370', margin: '0 0 12px' }}>🔥 Top Sellers</h3>
          {stats.topItems.length === 0 ? (
            <p style={{ color: '#6B7280', fontSize: 12, textAlign: 'center', padding: '10px 0' }}>No sales data yet</p>
          ) : stats.topItems.map(([name, qty], i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: '#F5F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: i === 0 ? '#0059D6' : '#6B7280' }}>#{i + 1}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#0D3370', margin: 0 }}>{name}</p>
                <div style={{ height: 3, background: '#F5F6FA', borderRadius: 99, marginTop: 2 }}>
                  <div style={{ height: '100%', width: `${(qty / (stats.topItems[0][1] as number)) * 100}%`, background: '#0059D6', borderRadius: 99 }} />
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#0D3370' }}>{qty}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontWeight: 800, fontSize: 13, color: '#0D3370', margin: '0 0 12px' }}>⚡ Hourly (Today)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 }}>
            {stats.hourly.map((v, h) => (
              <div key={h} title={`${h}:00 — ₹${v}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ width: '100%', borderRadius: '2px 2px 0 0', background: v > 0 ? '#0059D6' : '#EAEDF3', height: `${(v / stats.maxH) * 100}%`, minHeight: 2, transition: 'height 0.3s' }} />
                {h % 6 === 0 && <span style={{ fontSize: 7, color: '#6B7280', fontWeight: 600 }}>{h}h</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
