"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '../store';
import { Product, Bill } from '../types';
import toast from 'react-hot-toast';
import { printLuminaReceipt, formatLuminaThermalReceipt, printCleanMonospaceReceipt } from './printReceipt';

const CATS = ['All', 'Beverages', 'Snacks', 'Food', 'Desserts'];
const MODES = ['Cash', 'UPI', 'Credit'] as const;

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return debounced;
}

export default function POSScreen() {
  const products = useStore(s => s.products);
  const cart = useStore(s => s.cart);
  const customers = useStore(s => s.customers);
  const addToCart = useStore(s => s.addToCart);
  const incrementQty = useStore(s => s.incrementQty);
  const decrementQty = useStore(s => s.decrementQty);
  const removeFromCart = useStore(s => s.removeFromCart);
  const clearCart = useStore(s => s.clearCart);
  const generateBill = useStore(s => s.generateBill);

  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [mode, setMode] = useState<'Cash' | 'UPI' | 'Credit'>('Cash');
  const [custName, setCustName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [custSearch, setCustSearch] = useState('');
  const [showCustDropdown, setShowCustDropdown] = useState(false);
  const [settling, setSettling] = useState(false);
  const [flyId, setFlyId] = useState<string | null>(null);
  const [showCartOnMobile, setShowCartOnMobile] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(search, 200);

  useEffect(() => { searchRef.current?.focus(); }, []);

  // Memoized filtered products
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return products.filter(p =>
      (cat === 'All' || p.category === cat) &&
      (q === '' || p.name.toLowerCase().includes(q))
    );
  }, [products, cat, debouncedSearch]);

  // Customer search filter
  const filteredCustomers = useMemo(() => {
    if (!custSearch) return customers.slice(0, 5);
    const q = custSearch.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 5);
  }, [customers, custSearch]);

  // Cart calculations (memoized)
  const { subTotal, totalGST, cgst, sgst, grandTotal } = useMemo(() => {
    let sub = 0, gst = 0;
    cart.forEach(i => {
      const line = i.price * i.qty;
      sub += line;
      gst += Math.round(line * (i.gstPercent / 100));
    });
    return { subTotal: sub, totalGST: gst, cgst: Math.round(gst / 2), sgst: gst - Math.round(gst / 2), grandTotal: sub + gst };
  }, [cart]);

  const handleAdd = useCallback((p: Product) => {
    setFlyId(p.id);
    setTimeout(() => setFlyId(null), 400);
    addToCart(p);
  }, [addToCart]);

  const selectCustomer = (c: typeof customers[0]) => {
    setCustName(c.name);
    setPhone(c.phone);
    setSelectedCustomerId(c.id);
    setCustSearch('');
    setShowCustDropdown(false);
  };

  const handleSettle = useCallback(async () => {
    if (cart.length === 0) return;
    setSettling(true);

    const bill = generateBill(mode, custName, phone, selectedCustomerId);
    if (!bill) { setSettling(false); return; }

    try {
      const receipt = formatLuminaThermalReceipt(bill);
      const printUrl = process.env.NEXT_PUBLIC_PRINT_AGENT_URL || 'http://localhost:3001';
      const res = await fetch(`${printUrl}/print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: receipt }),
      });
      if (!res.ok) throw new Error('Printer error');
      toast.success(`Bill #${bill.invoiceNo} generated & printed via USB!`);
    } catch { 
      toast.success(`Bill #${bill.invoiceNo} saved locally. Opening Premium Receipt...`);
      printLuminaReceipt(bill);
    }

    setCustName(''); setPhone(''); setSelectedCustomerId(undefined); setCustSearch('');
    setSettling(false);
  }, [cart, mode, custName, phone, selectedCustomerId, generateBill]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl + P to print
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') { 
        e.preventDefault(); 
        handleSettle(); 
      }
      // / to focus search
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') { 
        e.preventDefault(); 
        searchRef.current?.focus(); 
      }
    };
    window.addEventListener('keydown', handler, true); // Use capture phase to ensure we catch it before browser
    return () => window.removeEventListener('keydown', handler, true);
  }, [handleSettle]);

  return (
    <div className="pos-container">
      {/* ────── LEFT: Products ────── */}
      <div className="pos-products" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px 16px 16px 20px' }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search items... ( / focus · Ctrl+P print )" autoFocus
            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 14, border: '2px solid #EAEDF3', fontSize: 14, fontFamily: 'Poppins,sans-serif', fontWeight: 500, background: '#fff', transition: 'all 0.2s' }} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding: '7px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'Poppins,sans-serif', whiteSpace: 'nowrap', transition: 'all 0.15s',
                background: cat === c ? '#0059D6' : '#fff', color: cat === c ? '#fff' : '#6B7280',
                boxShadow: cat === c ? '0 4px 12px rgba(255,82,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
              {c}
            </button>
          ))}
        </div>

        <div className="pos-grid" style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10, paddingRight: 4, alignContent: 'start' }}>
          {filtered.map(p => {
            const isLow = p.stock <= p.lowStockThreshold;
            const isOut = p.stock <= 0;
            return (
              <button key={p.id} onClick={() => !isOut && handleAdd(p)} disabled={isOut}
                className="product-card"
                style={{ background: '#fff', border: `2px solid ${flyId === p.id ? '#0059D6' : isOut ? '#FFE0E0' : '#EAEDF3'}`, borderRadius: 18, padding: '14px 10px', cursor: isOut ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontFamily: 'Poppins,sans-serif', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', opacity: isOut ? 0.4 : 1, position: 'relative' }}>
                {isLow && !isOut && <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 8, fontWeight: 800, color: '#FF3B3B', background: '#FFF5F5', padding: '1px 6px', borderRadius: 6 }}>LOW</span>}
                {isOut && <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 8, fontWeight: 800, color: '#fff', background: '#FF3B3B', padding: '1px 6px', borderRadius: 6 }}>OUT</span>}
                <span style={{ fontSize: 32 }}>{p.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0D3370', textAlign: 'center', lineHeight: 1.3 }}>{p.name}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0059D6' }}>₹{p.price}</span>
                {!isOut && <div style={{ width: 26, height: 26, borderRadius: 8, background: '#0059D6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 900 }}>+</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ────── RIGHT: Cart ────── */}
      <div className={`pos-cart ${showCartOnMobile ? 'open' : ''}`} style={{ width: 360, background: '#fff', borderLeft: '1px solid #EAEDF3', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.04)', flexShrink: 0 }}>
        {/* Mobile Handle */}
        <div className="mobile-only" onClick={() => setShowCartOnMobile(false)} style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 4, background: '#EAEDF3', borderRadius: 2 }}></div>
        </div>

        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #EAEDF3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0D3370', margin: 0 }}>
              🛒 Cart <span style={{ background: '#0059D6', color: '#fff', borderRadius: 10, padding: '1px 8px', fontSize: 11 }}>{cart.reduce((s, i) => s + i.qty, 0)}</span>
            </h2>
            <div style={{ display: 'flex', gap: 12 }}>
              {cart.length > 0 && <button onClick={clearCart} style={{ fontSize: 11, color: '#FF3B3B', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Clear</button>}
              <button className="mobile-only" onClick={() => setShowCartOnMobile(false)} style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Close</button>
            </div>
          </div>

          {/* Customer search */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input value={custSearch || custName} onChange={e => { setCustSearch(e.target.value); setCustName(e.target.value); setSelectedCustomerId(undefined); setShowCustDropdown(true); }}
              onFocus={() => setShowCustDropdown(true)} onBlur={() => setTimeout(() => setShowCustDropdown(false), 150)}
              placeholder="👤 Customer (type to search)"
              style={{ width: '100%', padding: '9px 14px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 12, fontFamily: 'Poppins,sans-serif', fontWeight: 500 }} />
            {showCustDropdown && filteredCustomers.length > 0 && !selectedCustomerId && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #EAEDF3', borderRadius: 12, marginTop: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 20, overflow: 'hidden' }}>
                {filteredCustomers.map(c => (
                  <button key={c.id} onMouseDown={() => selectCustomer(c)}
                    style={{ width: '100%', padding: '10px 14px', border: 'none', background: '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'Poppins,sans-serif', fontSize: 12, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F6FA' }}>
                    <span style={{ fontWeight: 700 }}>{c.name}</span>
                    <span style={{ color: '#6B7280', fontSize: 11 }}>{c.phone}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="📱 Phone / WhatsApp"
            style={{ width: '100%', padding: '9px 14px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 12, fontFamily: 'Poppins,sans-serif', fontWeight: 500 }} />
        </div>

        {/* Payment mode */}
        <div style={{ display: 'flex', gap: 6, padding: '8px 14px', borderBottom: '1px solid #EAEDF3' }}>
          {MODES.map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex: 1, padding: '7px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'Poppins,sans-serif', transition: 'all 0.15s',
                background: mode === m ? '#0D3370' : '#F5F6FA', color: mode === m ? '#fff' : '#6B7280' }}>
              {m === 'Cash' ? '💵' : m === 'UPI' ? '📲' : '💳'} {m}
            </button>
          ))}
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {cart.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.25, padding: '40px 0' }}>
              <span style={{ fontSize: 48 }}>🛍️</span>
              <p style={{ fontWeight: 700, fontSize: 13, marginTop: 8 }}>Cart is empty</p>
              <p style={{ fontSize: 11, color: '#6B7280' }}>Tap items or press / to search</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="cart-item-enter" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#F5F6FA', borderRadius: 14 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#0D3370', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{item.name}</p>
                <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, margin: 0 }}>₹{item.price} × {item.qty} = <span style={{ color: '#0059D6', fontWeight: 800 }}>₹{item.price * item.qty}</span></p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#fff', borderRadius: 10, padding: '3px 5px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <button onClick={() => decrementQty(item.id)} className="btn-press" style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#F5F6FA', cursor: 'pointer', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ width: 24, textAlign: 'center', fontWeight: 800, fontSize: 13 }}>{item.qty}</span>
                <button onClick={() => incrementQty(item.id)} className="btn-press" style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#0059D6', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals + CTA */}
        <div style={{ padding: '14px 18px', background: '#0D3370', borderRadius: '24px 24px 0 0', paddingBottom: 'calc(14px + env(safe-area-inset-bottom))' }}>
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 4 }}>
                <span>Subtotal</span><span>₹{subTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 4 }}>
                <span>CGST</span><span>₹{cgst.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 8 }}>
                <span>SGST</span><span>₹{sgst.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{mode}</span>
              </div>
              <button onClick={() => { handleSettle(); setShowCartOnMobile(false); }} disabled={settling || cart.length === 0} className="btn-press"
                style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: cart.length ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 800, fontFamily: 'Poppins,sans-serif',
                  background: cart.length ? 'linear-gradient(135deg,#0059D6,#FF7A45)' : '#2A2A3E',
                  color: '#fff', boxShadow: cart.length ? '0 8px 24px rgba(255,82,0,0.4)' : 'none', transition: 'all 0.2s' }}>
                {settling ? 'Generating...' : `Print & Settle — ₹${grandTotal.toLocaleString('en-IN')}`}
              </button>
            </>
        </div>
      </div>

      {/* Mobile Cart Toggle */}
      <button className="cart-toggle" onClick={() => setShowCartOnMobile(true)}>
        🛒
        {cart.length > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: '#FF3B3B', color: 'white', borderRadius: '50%', width: 22, height: 22, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>{cart.reduce((s, i) => s + i.qty, 0)}</span>}
      </button>
    </div>
  );
}
