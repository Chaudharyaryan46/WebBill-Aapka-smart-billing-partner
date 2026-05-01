"use client";

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';

interface BillData {
  c: string; // customer
  i: { n: string; q: number; p: number }[]; // items
  t: number; // total
  d: string; // date
}

function EBillContent() {
  const searchParams = useSearchParams();
  const [bill, setBill] = useState<BillData | null>(null);

  useEffect(() => {
    const data = searchParams.get('d');
    if (data) {
      try {
        const decoded = JSON.parse(atob(data));
        setBill(decoded);
      } catch (e) {
        console.error("Failed to decode bill data");
      }
    }
  }, [searchParams]);

  if (!bill) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-sm bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 p-8 text-white text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-3xl">
            📋
          </div>
          <h1 className="text-2xl font-black mt-4 uppercase tracking-tighter">Digital Invoice</h1>
          <p className="text-orange-100 text-xs font-bold tracking-widest uppercase italic">WebBill Professional</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-end border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</p>
              <p className="font-bold text-lg text-slate-700">{bill.c || 'Walk-in'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
              <p className="text-xs font-medium text-slate-500">{bill.d.split(',')[0]}</p>
            </div>
          </div>

          <div className="space-y-4">
            {bill.i.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-bold text-slate-700">{item.n}</p>
                  <p className="text-xs text-slate-400 font-bold">{item.q} Unit{item.q > 1 ? 's' : ''}</p>
                </div>
                <p className="font-black text-slate-900">₹{item.q * item.p}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
            <span className="text-sm font-bold text-slate-500">Total Payable</span>
            <span className="text-2xl font-black text-orange-600">₹{bill.t}</span>
          </div>

          <div className="pt-6 text-center space-y-4">
            <div className="inline-block px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
              ✓ Paid Successfully
            </div>
            <p className="text-xs text-slate-400 leading-relaxed px-4">
              This digital invoice is a valid proof of purchase.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 p-6 text-center">
          <p className="text-white text-[10px] font-bold tracking-[0.3em] uppercase opacity-50 mb-2">Powered by</p>
          <h2 className="text-white text-xl font-black tracking-tighter">WebBill<span className="text-orange-500"> Invoice</span></h2>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-xs font-medium">Thank you for your business!</p>
    </div>
  );
}

export default function EBillPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EBillContent />
    </Suspense>
  );
}
