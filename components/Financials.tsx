import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const finData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 },
  { name: 'Jun', revenue: 2390 },
  { name: 'Jul', revenue: 3490 },
];

export const Financials: React.FC = () => {
  const [wins, setWins] = useState<{id: string, name: string, amount: string, time: string}[]>([]);

  useEffect(() => {
    const generateWin = () => {
      const sources = ["YouTube Arbitrage", "Cloud Harvesting", "Ad-Sense Hack", "Metadata Flip", "Compute Rental"];
      const newWin = {
        id: Math.random().toString(36).substr(2, 9),
        name: sources[Math.floor(Math.random() * sources.length)],
        amount: `+$${(Math.random() * 50 + 5).toFixed(2)}`,
        time: new Date().toLocaleTimeString()
      };
      setWins(prev => [newWin, ...prev].slice(0, 10));
    };

    const interval = setInterval(generateWin, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.02] shadow-[0_0_30px_rgba(16,185,129,0.05)]">
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Total Managed Balance</p>
          <p className="text-5xl font-black text-emerald-400 tracking-tighter italic">$45,280.91</p>
          <div className="mt-6 flex items-center gap-3 text-[10px] text-emerald-500 font-black uppercase bg-emerald-500/10 px-3 py-1.5 rounded-full w-fit border border-emerald-500/20">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
            24/7 Yield: 18.2% Active
          </div>
        </div>
        <div className="glass p-8 rounded-3xl border border-slate-800 flex flex-col justify-center">
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Auto-Payouts Pending</p>
          <p className="text-4xl font-black text-white tracking-tighter">$1,120.50</p>
          <p className="text-[10px] font-mono text-slate-600 mt-2 uppercase">Scheduled: Every 48h</p>
        </div>
        <div className="glass p-8 rounded-3xl border border-slate-800 flex flex-col justify-center">
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Self-Funding Ad Spend</p>
          <p className="text-4xl font-black text-red-500 tracking-tighter">$450.00</p>
          <p className="text-[10px] font-mono text-slate-600 mt-2 uppercase">ROI Ratio: 4.8x Efficiency</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-10 rounded-[2.5rem] border border-slate-800">
          <h3 className="text-xl font-black uppercase tracking-tighter italic mb-10 flex items-center gap-4">
             <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
             Neural Revenue Scaling
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finData}>
                <XAxis dataKey="name" stroke="#334155" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                <Tooltip 
                   cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                   contentStyle={{ backgroundColor: '#000', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" radius={[10, 10, 0, 0]}>
                  {finData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === finData.length - 1 ? '#3b82f6' : '#111827'} stroke={index === finData.length - 1 ? 'none' : '#1e293b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-slate-800 bg-black/40">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              24/7 Arbitrage Wins
           </h3>
           <div className="space-y-4">
              {wins.length === 0 ? (
                <p className="text-center text-slate-700 font-mono text-[10px] py-20 uppercase tracking-widest">Awaiting Arbitrage Loop...</p>
              ) : (
                wins.map(win => (
                  <div key={win.id} className="flex justify-between items-center p-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-all">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white uppercase">{win.name}</span>
                        <span className="text-[8px] font-mono text-slate-600">{win.time}</span>
                     </div>
                     <span className="text-xs font-black text-emerald-400 font-mono">{win.amount}</span>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>

      <div className="glass rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-500 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="px-8 py-6">Transaction Node</th>
              <th className="px-8 py-6">Orchestration Status</th>
              <th className="px-8 py-6">Source Origin</th>
              <th className="px-8 py-6">Extraction Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-blue-500/[0.02] transition-colors group">
                <td className="px-8 py-5 font-mono text-blue-400 group-hover:text-blue-300">NX-LOOP-0{i}82-PERSIST</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">Verified</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-slate-400 group-hover:text-slate-200">YouTube Automated Adsense Loop</td>
                <td className="px-8 py-5 font-black text-white italic tracking-tighter">$142.00</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
