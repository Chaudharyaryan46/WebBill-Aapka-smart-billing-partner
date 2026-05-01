"use client";
import React from 'react';

const TABS = [
  {id:'pos',      icon:'🏪', label:'Billing'},
  {id:'dashboard',icon:'📊', label:'Dashboard'},
  {id:'inventory',icon:'📦', label:'Inventory'},
  {id:'customers',icon:'👤', label:'Customers'},
  {id:'orders',   icon:'📜', label:'Orders'},
];

export default function Sidebar({tab,setTab}:{tab:string,setTab:(t:any)=>void}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{marginBottom:16,textAlign:'center'}}>
        <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#0059D6,#FF7A45)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>⚡</div>
      </div>
      {TABS.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} title={t.label} 
          className={`sidebar-btn ${tab === t.id ? 'active' : ''}`} 
          style={{
            width:52,height:52,borderRadius:14,border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,fontSize:20,transition:'all 0.2s ease',
            background: tab===t.id ? 'linear-gradient(135deg,#0059D6,#FF7A45)' : 'transparent',
            boxShadow: tab===t.id ? '0 8px 20px rgba(255,82,0,0.4)' : 'none',
            color: tab===t.id ? 'white' : 'rgba(255,255,255,0.4)',
            transform: tab===t.id ? 'scale(1.05)' : 'scale(1)',
          }}>
          <span>{t.icon}</span>
        </button>
      ))}
    </aside>
  );
}
