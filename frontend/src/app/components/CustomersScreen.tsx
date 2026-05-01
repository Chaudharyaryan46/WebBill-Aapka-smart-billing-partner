"use client";
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import toast from 'react-hot-toast';

export default function CustomersScreen() {
  const customers = useStore(s => s.customers);
  const payments = useStore(s => s.payments);
  const addCustomer = useStore(s => s.addCustomer);
  const deleteCustomer = useStore(s => s.deleteCustomer);
  const recordPayment = useStore(s => s.recordPayment);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [showLedger, setShowLedger] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [payForm, setPayForm] = useState({ amount: '', mode: 'Cash' as 'Cash' | 'UPI', note: '' });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'dues'>('all');

  const filtered = useMemo(() => {
    let list = customers;
    if (filter === 'dues') list = list.filter(c => c.credit > 0);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
    }
    return list;
  }, [customers, search, filter]);

  const totalCredit = customers.reduce((s, c) => s + c.credit, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    addCustomer(form.name, form.phone);
    toast.success(`Customer ${form.name} added`);
    setForm({ name: '', phone: '' }); setShowAddModal(false);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayModal || !payForm.amount) return;
    recordPayment(showPayModal, parseFloat(payForm.amount), payForm.mode, payForm.note);
    toast.success(`Payment of ₹${payForm.amount} recorded`);
    setPayForm({ amount: '', mode: 'Cash', note: '' }); setShowPayModal(null);
  };

  const custPayments = (id: string) => payments.filter(p => p.customerId === id);

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '16px', background: '#F5F6FA', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0D3370', margin: 0 }}>👤 Customers</h1>
          <p style={{ color: '#6B7280', fontSize: 12, fontWeight: 500, margin: '2px 0 0' }}>{customers.length} customers</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{ padding: '8px 16px', background: 'linear-gradient(135deg,#0059D6,#FF7A45)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', boxShadow: '0 6px 16px rgba(255,82,0,0.3)' }}>
          + Add Customer
        </button>
      </div>

      {/* Credit Banner */}
      {totalCredit > 0 && (
        <div style={{ background: 'linear-gradient(135deg,#FF3B3B,#FF6B6B)', borderRadius: 16, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 700, margin: 0 }}>TOTAL PENDING UDHAAR</p>
            <p style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: '2px 0 0' }}>₹{totalCredit.toLocaleString('en-IN')}</p>
          </div>
          <span style={{ fontSize: 28 }}>⚠️</span>
        </div>
      )}

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexDirection: 'column' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..."
            style={{ width: '100%', padding: '10px 16px 10px 42px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 13, fontFamily: 'Poppins,sans-serif', background: '#fff' }} />
        </div>
        <button onClick={() => setFilter(f => f === 'all' ? 'dues' : 'all')}
          style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'Poppins,sans-serif',
            background: filter === 'dues' ? '#FF3B3B' : '#fff', color: filter === 'dues' ? '#fff' : '#6B7280', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
          {filter === 'dues' ? '🔴 Dues Only' : 'Filter by Dues'}
        </button>
      </div>

      {/* Customer List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(c => (
          <div key={c.id} style={{ background: '#fff', borderRadius: 16, padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `2px solid ${c.credit > 0 ? '#FFE0E0' : '#EAEDF3'}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0D3370,#082046)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#fff', fontWeight: 800, flexShrink: 0 }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 800, fontSize: 13, color: '#0D3370', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, margin: '1px 0 0' }}>📱 {c.phone || 'No phone'}</p>
              </div>
              {c.credit === 0 && <span style={{ fontSize: 10, fontWeight: 700, color: '#1DBF73', background: '#F0FDF8', padding: '3px 8px', borderRadius: 6 }}>✅ Clear</span>}
            </div>
            
            {c.credit > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF5F5', padding: '10px 12px', borderRadius: 12 }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#FF3B3B', margin: 0 }}>UDHAAR DUE</p>
                  <p style={{ fontSize: 16, fontWeight: 900, color: '#FF3B3B', margin: 0 }}>₹{c.credit.toLocaleString('en-IN')}</p>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => { setPayForm({ amount: String(c.credit), mode: 'Cash', note: '' }); setShowPayModal(c.id); }}
                    style={{ fontSize: 10, color: '#fff', border: 'none', background: '#1DBF73', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontWeight: 700 }}>
                    💰 Pay
                  </button>
                  <button onClick={() => setShowLedger(showLedger === c.id ? null : c.id)}
                    style={{ fontSize: 10, color: '#6B7280', border: '1px solid #EAEDF3', background: '#fff', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontWeight: 700 }}>
                    📒 Ledger
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
            <p style={{ fontWeight: 700 }}>No customers found</p>
          </div>
        )}
      </div>

      {/* Payment Ledger Inline */}
      {showLedger && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '28px', width: 440, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto' }} className="animate-pop">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>📒 Payment Ledger</h2>
              <button onClick={() => setShowLedger(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#F5F6FA', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            {custPayments(showLedger).length === 0 ? (
              <p style={{ color: '#6B7280', textAlign: 'center', padding: '20px' }}>No payment records yet</p>
            ) : custPayments(showLedger).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F6FA' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#1DBF73', margin: 0 }}>+₹{p.amount.toLocaleString('en-IN')}</p>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: '2px 0 0' }}>{p.mode} · {p.date}</p>
                  {p.note && <p style={{ fontSize: 11, color: '#6B7280', margin: '2px 0 0', fontStyle: 'italic' }}>{p.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '28px', width: 400, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} className="animate-pop">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Add Customer</h2>
              <button onClick={() => setShowAddModal(false)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#F5F6FA', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name *"
                style={{ padding: '12px 16px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 14, fontFamily: 'Poppins,sans-serif', fontWeight: 500 }} />
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone / WhatsApp"
                style={{ padding: '12px 16px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 14, fontFamily: 'Poppins,sans-serif', fontWeight: 500 }} />
              <button type="submit" style={{ padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#0059D6,#FF7A45)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', boxShadow: '0 6px 20px rgba(255,82,0,0.3)' }}>
                Add Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '28px', width: 400, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} className="animate-pop">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>💰 Record Payment</h2>
              <button onClick={() => setShowPayModal(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#F5F6FA', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input required type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} placeholder="Amount ₹ *"
                style={{ padding: '12px 16px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 14, fontFamily: 'Poppins,sans-serif', fontWeight: 500 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                {(['Cash', 'UPI'] as const).map(m => (
                  <button key={m} type="button" onClick={() => setPayForm({ ...payForm, mode: m })}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      background: payForm.mode === m ? '#0D3370' : '#F5F6FA', color: payForm.mode === m ? '#fff' : '#6B7280' }}>
                    {m === 'Cash' ? '💵' : '📲'} {m}
                  </button>
                ))}
              </div>
              <input value={payForm.note} onChange={e => setPayForm({ ...payForm, note: e.target.value })} placeholder="Note (optional)"
                style={{ padding: '12px 16px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 14, fontFamily: 'Poppins,sans-serif', fontWeight: 500 }} />
              <button type="submit" style={{ padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#1DBF73,#4CD964)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', boxShadow: '0 6px 20px rgba(29,191,115,0.3)' }}>
                Record Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
