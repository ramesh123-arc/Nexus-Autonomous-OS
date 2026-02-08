import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ServerMonitorProps {
  authorized: boolean;
}

export const ServerMonitor: React.FC<ServerMonitorProps> = ({ authorized }) => {
  const [stats, setStats] = useState({ cpu: 12, ram: 24, bandwidth: 45, db: 99 });
  const [latencyHistory, setLatencyHistory] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      latency: Math.floor(Math.random() * 10) + 5
    }))
  );

  useEffect(() => {
    if (!authorized) return;
    const interval = setInterval(() => {
      setStats(prev => ({
        cpu: Math.floor(Math.random() * 5) + 8,
        ram: Math.floor(Math.random() * 10) + 20,
        bandwidth: Math.floor(Math.random() * 20) + 30,
        db: 99
      }));
      setLatencyHistory(prev => [...prev.slice(1), { time: prev[prev.length - 1].time + 1, latency: Math.floor(Math.random() * 15) + 5 }]);
    }, 5000);
    return () => clearInterval(interval);
  }, [authorized]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Global <span className="text-blue-500">Telemetry</span></h2>
          <p className="text-slate-500 text-sm font-mono uppercase mt-2 tracking-widest italic">24/7 Infrastructure Core Status</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Headless Worker: PERSISTENT</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'CPU Load', value: `${stats.cpu}%`, color: 'text-blue-500' },
          { label: 'MEM Usage', value: `${stats.ram}%`, color: 'text-blue-500' },
          { label: 'Net Inbound', value: `${stats.bandwidth} MB/s`, color: 'text-emerald-500' },
          { label: 'Node Health', value: 'OPTIMAL', color: 'text-emerald-500' }
        ].map((s, i) => (
          <div key={i} className="glass p-8 rounded-3xl border border-slate-800 group hover:border-blue-500/30 transition-all">
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">{s.label}</p>
             <p className={`text-3xl font-black ${s.color} tracking-tighter italic group-hover:scale-105 transition-transform`}>{s.value}</p>
             <div className="h-1 w-full bg-slate-950 rounded-full mt-4 overflow-hidden">
                <div className={`h-full ${s.color.replace('text', 'bg')}`} style={{ width: s.value.includes('%') ? s.value : '100%' }}></div>
             </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-[4rem] p-12 border border-slate-800 bg-slate-900/20">
         <h3 className="text-xl font-black uppercase tracking-tighter italic mb-12 text-white">Cloud Node Latency (ms)</h3>
         <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#334155" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #1e293b', borderRadius: '16px' }} />
                <Area type="monotone" dataKey="latency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};
