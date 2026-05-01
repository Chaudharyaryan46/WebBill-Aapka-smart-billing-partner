"use client";
import React, { useState } from 'react';
import { useStore } from '../store';

export default function OrdersScreen() {
  const bills = useStore(s => s.bills);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All'|'Cash'|'UPI'|'Credit'>('All');

  const filtered = bills.filter(b=>
    (filter==='All'||b.paymentMode===filter) &&
    (b.id.toLowerCase().includes(search.toLowerCase()) || b.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  const modeColor:{[k:string]:{bg:string;color:string}} = {
    Cash:   {bg:'#F0FDF8',color:'#1DBF73'},
    UPI:    {bg:'#EFF6FF',color:'#3B82F6'},
    Credit: {bg:'#FFF5F5',color:'#FF3B3B'},
  };

  return (
    <div style={{height:'100%',overflowY:'auto',padding:'16px',background:'#F5F6FA'}}>
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:20,fontWeight:800,color:'#0D3370',margin:0}}>📜 Order History</h1>
        <p style={{color:'#6B7280',fontSize:12,fontWeight:500,margin:'2px 0 0'}}>{bills.length} total transactions</p>
      </div>

      <div style={{display:'flex',gap:10,marginBottom:16,flexDirection:'column'}}>
        <div style={{position:'relative',width:'100%'}}>
          <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:16}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by bill ID or customer..."
            style={{width:'100%',padding:'10px 16px 10px 42px',borderRadius:12,border:'2px solid #EAEDF3',fontSize:13,fontFamily:'Poppins,sans-serif',background:'#fff'}}/>
        </div>
        <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4}}>
          {(['All','Cash','UPI','Credit'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{padding:'7px 14px',borderRadius:10,border:'none',cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:'Poppins,sans-serif',whiteSpace:'nowrap',
                background: filter===f?'#0D3370':'#fff',
                color: filter===f?'#fff':'#6B7280',
                boxShadow:'0 2px 6px rgba(0,0,0,0.05)'}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length===0 ? (
        <div style={{textAlign:'center',padding:'40px',color:'#6B7280'}}>
          <div style={{fontSize:48,marginBottom:12}}>📭</div>
          <p style={{fontWeight:700}}>{bills.length===0?'No orders yet':'No results'}</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map((b)=>(
            <div key={b.id} style={{background:'#fff',borderRadius:16,padding:'14px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',border:'1px solid #EAEDF3',display:'flex',flexDirection:'column',gap:10}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <span style={{fontSize:11,fontWeight:800,color:'#6B7280'}}>ID: {b.id}</span>
                  <p style={{fontSize:14,fontWeight:800,color:'#0D3370',margin:'2px 0 0'}}>{b.customerName}</p>
                </div>
                <span style={{padding:'3px 10px',borderRadius:8,fontSize:10,fontWeight:700,...(modeColor[b.paymentMode]||{bg:'#F5F6FA',color:'#6B7280'})}}>
                  {b.paymentMode}
                </span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',borderTop:'1px dashed #EAEDF3',paddingTop:8}}>
                <div>
                  <p style={{fontSize:11,color:'#6B7280',margin:0}}>{b.items.length} item{b.items.length!==1?'s':''} · {b.date}</p>
                </div>
                <p style={{fontSize:16,fontWeight:900,color:'#0059D6',margin:0}}>₹{b.grandTotal.toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
