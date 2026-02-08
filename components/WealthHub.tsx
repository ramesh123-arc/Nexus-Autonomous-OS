import React, { useState, useEffect } from 'react';

interface GrowthStrategy {
  id: string;
  title: string;
  roi: string;
  difficulty: 'Low' | 'Medium' | 'High';
  description: string;
  icon: string;
  color: string;
  cta: string;
}

export const WealthHub: React.FC<{ onDeploy: (desc: string) => void }> = ({ onDeploy }) => {
  const [signals, setSignals] = useState<{id: number, text: string, time: string}[]>([]);
  
  const strategies: GrowthStrategy[] = [
    {
      id: 'arb-loop',
      title: 'Arbitrage Loop',
      roi: '5-10x',
      difficulty: 'Low',
      description: 'The Arbitrage Signal Bot identifies high-budget Python automation jobs on platforms like Upwork. Use the AI to generate full technical manifests and bid strategies in minutes.',
      icon: '⚖️',
      color: 'from-blue-600 to-indigo-600',
      cta: 'Start Arbitrage'
    },
    {
      id: 'faceless-lab',
      title: 'Faceless Content Lab',
      roi: 'Compound',
      difficulty: 'Medium',
      description: 'Generate cinematic futuristic thumbnails and viral AI-SaaS scripts. Build automated channels for Creator Fund revenue and high-ticket affiliate compound growth.',
      icon: '🎞️',
      color: 'from-purple-600 to-pink-600',
      cta: 'Deploy Content'
    },
    {
      id: 'saas-deploy',
      title: 'Micro-SaaS Engine',
      roi: '25x+',
      difficulty: 'High',
      description: 'Deploy subscription-based AI tools with GitHub/Vercel automation. Set up recurring revenue via Stripe and launch the lead-gen swarm.',
      icon: '🚀',
      color: 'from-emerald-500 to-emerald-700',
      cta: 'Deploy SaaS'
    },
    {
      id: 'lead-gen',
      title: 'Tactical Lead Swarm',
      roi: 'Equity',
      difficulty: 'Medium',
      description: 'Scrape digital forums for "pain points". Auto-craft hyper-personalized offers to sell your micro-SaaS tool as the ultimate solution.',
      icon: '🎯',
      color: 'from-amber-500 to-orange-600',
      cta: 'Launch Swarm'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const msgs = [
        "SIGNAL: $2,400 project found matching 'Python Automation'",
        "TREND: 14% increase in 'AI SaaS' search volume detected",
        "ALERT: Vercel Node ready for deployment",
        "LEAD: User complaining about manual data entry detected",
        "SYNC: Subscription logic verified"
      ];
      const newSignal = {
        id: Date.now(),
        text: msgs[Math.floor(Math.random() * msgs.length)],
        time: new Date().toLocaleTimeString()
      };
      setSignals(prev => [newSignal, ...prev].slice(0, 5));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Wealth <span className="text-blue-500">Expansion</span> Hub</h2>
          <p className="text-slate-500 text-sm font-mono uppercase mt-2 tracking-widest">Growth Nodes Optimized for Rapid Deployment</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 glass border border-blue-500/20 rounded-2xl flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase">Avg Cluster ROI</span>
            <span className="text-xl font-black text-blue-400 italic">14.2X</span>
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-[2.5rem] border border-blue-500/30 bg-blue-500/[0.02] overflow-hidden relative">
        <div className="absolute top-0 left-0 p-2 bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest">Live Multi-Bridge Signals</div>
        <div className="flex flex-col gap-3 mt-4">
          {signals.map(s => (
            <div key={s.id} className="flex items-center justify-between text-[11px] font-mono animate-in slide-in-from-left-4">
              <span className="text-blue-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                {s.text}
              </span>
              <span className="text-slate-600">{s.time}</span>
            </div>
          ))}
          {signals.length === 0 && <p className="text-slate-700 text-xs font-mono py-4">Scanning global indices for revenue gaps...</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {strategies.map((strat) => (
          <div key={strat.id} className="glass rounded-[3.5rem] border border-slate-800 overflow-hidden group transition-all flex flex-col hover:border-blue-500/40">
            <div className={`h-2 w-full bg-gradient-to-r ${strat.color}`}></div>
            <div className="p-10 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                  <div className="text-5xl">{strat.icon}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Efficiency</div>
                  <div className="text-3xl font-black text-blue-400 italic tracking-tighter">{strat.roi}</div>
                </div>
              </div>

              <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic mb-2 group-hover:text-blue-400 transition-colors">
                {strat.title}
              </h3>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[9px] font-black uppercase bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-400">Difficulty: {strat.difficulty}</span>
                <div className="h-1 w-1 bg-slate-800 rounded-full"></div>
                <span className="text-[9px] font-black uppercase text-blue-500">Autonomous Ready</span>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-10 flex-1">
                {strat.description}
              </p>

              <button 
                onClick={() => onDeploy(strat.description)}
                className="w-full py-5 font-black uppercase text-xs rounded-2xl transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 bg-white text-black hover:bg-blue-600 hover:text-white"
              >
                {strat.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="glass p-10 rounded-[3.5rem] border border-slate-800 bg-blue-950/5 flex flex-col md:flex-row items-center gap-10">
        <div className="w-24 h-24 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(59,130,246,0.1)]">
           ⚡
        </div>
        <div>
          <h4 className="text-xl font-black uppercase italic text-white tracking-tight">System Velocity Protocol</h4>
          <p className="text-slate-500 text-xs font-mono leading-relaxed mt-2 max-w-2xl">
            Nexus operates on high-velocity autonomous scaling. We generate capital through arbitrage, build distribution via content labs, and convert that into recurring asset equity.
          </p>
        </div>
      </div>
    </div>
  );
};
