import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuGroups = [
    {
      label: "Autonomous Control",
      items: [
        { id: 'dashboard', label: 'Command Hub', icon: 'M4 6h16M4 12h16M4 18h16' },
        { id: 'tasks', label: 'Mission Deck', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        { id: 'swarms', label: 'Revenue Labs', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2' },
        { id: 'brain', label: 'Neural Brain', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
      ]
    },
    {
      label: "Creative Synthesis",
      items: [
        { id: 'visual', label: 'Visual Studio', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'content', label: 'Render Factory', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
        { id: 'voice', label: 'Vocal Bridge', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
      ]
    },
    {
      label: "External Matrix",
      items: [
        { id: 'whatsapp', label: 'WhatsApp Link', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
        { id: 'social', label: 'Social Orbit', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
      ]
    },
    {
      label: "Core System",
      items: [
        { id: 'vault', label: 'Neural Vault', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
        { id: 'cloud', label: 'Cloud Clusters', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2m-2 4h.01M17 16h.01' },
      ]
    }
  ] as const;

  return (
    <aside className="w-80 glass border-r border-cyan-500/10 flex flex-col p-10 z-50 overflow-y-auto custom-scrollbar">
      <div className="mb-16 flex items-center gap-5 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30 transition-all group-hover:scale-110">
          <span className="font-black text-white text-3xl italic tracking-tighter">N</span>
        </div>
        <div>
          <span className="text-2xl font-black tracking-tighter uppercase italic text-white block leading-none">Nexus</span>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-cyan-500/60 block mt-1">Autonomous</span>
        </div>
      </div>

      <div className="flex-1 space-y-12">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-[9px] font-black uppercase text-slate-600 tracking-[0.4em] px-5">{group.label}</h3>
            <nav className="space-y-1.5">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AppTab)}
                  className={`w-full flex items-center gap-5 px-5 py-4 rounded-2xl transition-all duration-300 border ${
                    activeTab === item.id 
                    ? 'bg-cyan-600/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.1)]' 
                    : 'text-slate-500 border-transparent hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <svg className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-cyan-400' : 'text-slate-600 group-hover:text-cyan-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="font-bold text-[11px] tracking-[0.15em] uppercase italic">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        ))}
      </div>
      
      <div className="mt-12 pt-8 border-t border-cyan-500/5">
         <div className="flex items-center gap-3 px-5 text-slate-600">
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-slow-pulse"></div>
            <span className="text-[8px] font-black uppercase tracking-widest">Neural Link v5.1</span>
         </div>
      </div>
    </aside>
  );
};
