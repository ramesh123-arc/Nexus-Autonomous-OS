import React from 'react';
import { Task, LogEntry, AgentStatus, MemoryFragment } from '../types';

interface DashboardProps {
  tasks: Task[];
  logs: LogEntry[];
  totalYield: number;
  // Fix: Added memory prop to match usage in App.tsx
  memory: MemoryFragment[];
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, logs, totalYield, memory }) => {
  const activeTasks = tasks.filter(t => t.status !== AgentStatus.COMPLETED && t.status !== AgentStatus.FAILED).length;
  
  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="glass p-12 rounded-[4rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.05] to-transparent transition-all group relative overflow-hidden md:col-span-2 shadow-[0_0_50px_rgba(0,0,0,0.4)]">
          <div className="absolute top-0 right-0 p-8">
             <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/20">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
             </div>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
             <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse syon-glow"></span>
             Aggregated Yield Matrix
          </p>
          <p className="text-8xl font-black text-white tracking-tighter italic group-hover:scale-105 transition-transform duration-1000 syon-text-glow">
            ${totalYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-8 flex items-center gap-4">
            <p className="text-cyan-500 text-[10px] font-mono uppercase italic font-bold tracking-widest bg-cyan-500/10 px-4 py-2 rounded-xl border border-cyan-500/20">24/7 Global Arbitrage Active</p>
            <span className="text-slate-700 text-[9px] font-black uppercase tracking-widest">Network Speed: 1.2GB/s</span>
          </div>
        </div>
        
        <div className="glass p-10 rounded-[3.5rem] border border-cyan-500/10 hover:border-cyan-500/30 transition-all group shadow-xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Active Missions</p>
          <p className="text-6xl font-black text-cyan-400 tracking-tighter italic group-hover:syon-text-glow transition-all">{activeTasks}</p>
          <p className="text-slate-600 text-[9px] mt-4 font-mono uppercase italic tracking-widest">Parallel Swarms</p>
        </div>
        
        <div className="glass p-10 rounded-[3.5rem] border border-slate-800 hover:border-cyan-500/20 transition-all group">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Node Health</p>
          <p className="text-6xl font-black text-slate-200 tracking-tighter italic">99.9%</p>
          <p className="text-slate-600 text-[9px] mt-4 font-mono uppercase italic tracking-widest">Zero Latency Buffer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 glass rounded-[4.5rem] p-16 border border-cyan-500/5 bg-black/40">
          <div className="flex justify-between items-center mb-14">
            <div>
              <h2 className="text-5xl font-black uppercase tracking-tighter italic text-white leading-none">Swarm Matrix</h2>
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.4em] mt-4">Research • Strategy • Execution • Payout</p>
            </div>
            <button className="text-[10px] font-black uppercase text-cyan-500 tracking-widest hover:text-white transition-colors border-b border-cyan-500/30 pb-1">View Full Log</button>
          </div>
          
          <div className="space-y-8">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="p-10 bg-slate-900/20 border border-cyan-500/5 rounded-[3.5rem] space-y-8 hover:border-cyan-500/20 transition-all group glass-hover">
                 <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-2xl font-black italic uppercase text-white truncate max-w-[400px] mb-2 group-hover:text-cyan-400 transition-colors tracking-tight">{task.title}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">{task.timestamp}</span>
                        <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                        <span className="text-[9px] font-black text-cyan-500/60 uppercase">Node-ID: {task.id.slice(-6)}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-5 py-2 rounded-2xl border transition-all ${
                      task.status === AgentStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse'
                    }`}>{task.status}</span>
                 </div>
                 
                 <div className="grid grid-cols-4 gap-8">
                    {task.swarmSteps?.map(step => (
                      <div key={step.id} className="space-y-3">
                         <div className="flex justify-between items-center px-1">
                            <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">{step.agent}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${step.status === 'done' ? 'bg-emerald-500' : step.status === 'running' ? 'bg-cyan-500 animate-pulse syon-glow' : 'bg-slate-900'}`}></div>
                         </div>
                         <div className="h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div className={`h-full transition-all duration-1000 ${step.status === 'done' ? 'bg-emerald-500' : step.status === 'running' ? 'bg-cyan-500' : 'bg-transparent'}`} style={{ width: step.status === 'done' ? '100%' : step.status === 'running' ? '50%' : '0%' }}></div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-center py-32 text-slate-800 font-mono text-xs italic uppercase tracking-[0.5em]">System Standby • Handshake Pending</p>}
          </div>
        </div>

        <div className="glass rounded-[4.5rem] p-12 border border-slate-800 flex flex-col bg-black/40">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-10 flex items-center gap-4">
              <span className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse syon-glow"></span>
              Pulse Telemetry
           </h2>
           <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-8 pr-4 custom-scrollbar">
              {logs.map((log) => (
                <div key={log.id} className="pb-6 border-b border-cyan-500/5 group hover:border-cyan-500/20 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-black uppercase text-[9px] tracking-widest ${
                      log.level === 'error' ? 'text-rose-500' : 
                      log.level === 'warn' ? 'text-cyan-500' : 
                      log.level === 'success' ? 'text-emerald-500' : 'text-slate-600'
                    }`}>{log.level}</span>
                    <span className="text-slate-700 text-[8px]">{log.timestamp}</span>
                  </div>
                  <div className="text-slate-500 group-hover:text-slate-200 transition-colors leading-relaxed italic">
                    {log.message}
                  </div>
                </div>
              ))}
              {logs.length === 0 && <div className="text-center py-20 text-slate-800 italic uppercase text-[9px] tracking-widest">No Active Streams</div>}
           </div>
        </div>
      </div>
    </div>
  );
};
