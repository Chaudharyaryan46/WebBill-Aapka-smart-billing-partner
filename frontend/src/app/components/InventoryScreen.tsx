"use client";
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import toast from 'react-hot-toast';

const CATS = ['Food', 'Beverages', 'Snacks', 'Desserts', 'Other'];
const EMOJIS = ['🍕', '🍔', '☕', '🧋', '🥟', '🌯', '🍲', '🍱', '🥛', '🍮', '🍜', '🍣', '🧃', '🍰', '📦', '🍛', '🍋'];

export default function InventoryScreen() {
  const products = useStore(s => s.products);
  const addProduct = useStore(s => s.addProduct);
  const deleteProduct = useStore(s => s.deleteProduct);
  const updateProduct = useStore(s => s.updateProduct);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', price: '', cost: '', emoji: '📦', category: 'Food', stock: '100', gstPercent: '5', lowStockThreshold: '10' });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const filtered = useMemo(() => {
    return products.filter(p =>
      (filterCat === 'All' || p.category === filterCat) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search, filterCat]);

  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length;
  const outCount = products.filter(p => p.stock <= 0).length;

  const resetForm = () => setForm({ name: '', price: '', cost: '', emoji: '📦', category: 'Food', stock: '100', gstPercent: '5', lowStockThreshold: '10' });

  const openAdd = () => { resetForm(); setEditId(null); setShowModal(true); };
  const openEdit = (p: typeof products[0]) => {
    setEditId(p.id);
    setForm({ name: p.name, price: String(p.price), cost: String(p.cost || ''), emoji: p.emoji, category: p.category, stock: String(p.stock), gstPercent: String(p.gstPercent), lowStockThreshold: String(p.lowStockThreshold) });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    const data = { name: form.name, price: parseFloat(form.price), cost: parseFloat(form.cost) || 0, emoji: form.emoji, category: form.category, stock: parseInt(form.stock) || 0, gstPercent: parseFloat(form.gstPercent) || 5, lowStockThreshold: parseInt(form.lowStockThreshold) || 10 };
    if (editId) { 
      updateProduct(editId, data);
      toast.success('Product updated');
    } else { 
      addProduct(data);
      toast.success('Product added');
    }
    setShowModal(false); resetForm(); setEditId(null);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '16px', background: '#F5F6FA', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0D3370', margin: 0 }}>📦 Inventory</h1>
          <p style={{ color: '#6B7280', fontSize: 12, fontWeight: 500, margin: '2px 0 0' }}>
            {products.length} items
            {lowStockCount > 0 && <span style={{ color: '#FFB800', marginLeft: 6 }}>⚠ {lowStockCount} low</span>}
          </p>
        </div>
        <button onClick={openAdd} style={{ padding: '8px 16px', background: 'linear-gradient(135deg,#0059D6,#FF7A45)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', boxShadow: '0 6px 16px rgba(255,82,0,0.3)' }}>
          + Add Item
        </button>
      </div>

      {/* Search + Category Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexDirection: 'column' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            style={{ width: '100%', padding: '10px 16px 10px 42px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 13, fontFamily: 'Poppins,sans-serif', background: '#fff' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {['All', ...CATS].map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              style={{ padding: '7px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: 'Poppins,sans-serif', whiteSpace: 'nowrap',
                background: filterCat === c ? '#0D3370' : '#fff', color: filterCat === c ? '#fff' : '#6B7280', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }}>
        {filtered.map(p => {
          const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;
          const isOut = p.stock <= 0;
          return (
            <div key={p.id} style={{ background: '#fff', borderRadius: 16, padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `2px solid ${isOut ? '#FFE0E0' : isLow ? '#FFF3E0' : '#EAEDF3'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{p.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 12, color: '#0D3370', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0059D6' }}>₹{p.price}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#6B7280', background: '#F5F6FA', padding: '1px 5px', borderRadius: 5 }}>{p.category}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: isOut ? '#FF3B3B' : isLow ? '#FFB800' : '#1DBF73', margin: 0 }}>{p.stock} left</p>
                <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                  <button onClick={() => openEdit(p)} style={{ fontSize: 9, color: '#6B7280', border: '1px solid #EAEDF3', background: '#fff', borderRadius: 6, padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                  <button onClick={() => { deleteProduct(p.id); toast.success('Product deleted'); }} style={{ fontSize: 9, color: '#FF3B3B', border: '1px solid #FFE0E0', background: '#fff', borderRadius: 6, padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}>Del</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '28px', width: 460, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} className="animate-pop">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0D3370', margin: 0 }}>{editId ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => { setShowModal(false); setEditId(null); }} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#F5F6FA', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Item name *"
                style={{ padding: '11px 16px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 14, fontFamily: 'Poppins,sans-serif', fontWeight: 500 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Price ₹ *"
                  style={{ padding: '11px 16px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 14, fontFamily: 'Poppins,sans-serif', fontWeight: 500 }} />
                <input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="Cost ₹"
                  style={{ padding: '11px 16px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 14, fontFamily: 'Poppins,sans-serif', fontWeight: 500 }} />
                <input type="number" value={form.gstPercent} onChange={e => setForm({ ...form, gstPercent: e.target.value })} placeholder="GST %"
                  style={{ padding: '11px 16px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 14, fontFamily: 'Poppins,sans-serif', fontWeight: 500 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  style={{ padding: '11px 16px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 14, fontFamily: 'Poppins,sans-serif', fontWeight: 500 }}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="Stock"
                  style={{ padding: '11px 16px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 14, fontFamily: 'Poppins,sans-serif', fontWeight: 500 }} />
                <input type="number" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} placeholder="Low threshold"
                  style={{ padding: '11px 16px', borderRadius: 12, border: '2px solid #EAEDF3', fontSize: 14, fontFamily: 'Poppins,sans-serif', fontWeight: 500 }} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>Emoji Icon:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {EMOJIS.map(em => (
                    <button key={em} type="button" onClick={() => setForm({ ...form, emoji: em })}
                      style={{ width: 34, height: 34, borderRadius: 8, border: `2px solid ${form.emoji === em ? '#0059D6' : '#EAEDF3'}`, background: form.emoji === em ? '#FFF5F0' : '#fff', fontSize: 17, cursor: 'pointer' }}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" style={{ padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#0059D6,#FF7A45)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', boxShadow: '0 6px 20px rgba(255,82,0,0.3)', marginTop: 4 }}>
                {editId ? 'Save Changes' : 'Add to Inventory'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
