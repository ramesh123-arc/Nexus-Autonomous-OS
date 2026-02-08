import React, { useState, useEffect } from 'react';
import { WebhookConfig } from '../types';

export const WebhookHub: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', method: 'POST' as 'POST' | 'PUT' });

  useEffect(() => {
    const saved = localStorage.getItem('nexus_webhooks');
    if (saved) setWebhooks(JSON.parse(saved));
  }, []);

  const saveWebhooks = (updated: WebhookConfig[]) => {
    setWebhooks(updated);
    localStorage.setItem('nexus_webhooks', JSON.stringify(updated));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newHook: WebhookConfig = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      headers: {},
      active: true
    };
    saveWebhooks([...webhooks, newHook]);
    setShowAdd(false);
    setFormData({ name: '', url: '', method: 'POST' });
  };

  const deleteHook = (id: string) => {
    saveWebhooks(webhooks.filter(h => h.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Trigger <span className="text-emerald-500">Hub</span></h2>
          <p className="text-slate-500 text-sm font-mono uppercase mt-2 tracking-widest">External Automation Bridge (Zapier / n8n / GitHub)</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20"
        >
          Add New Trigger
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webhooks.map((hook) => (
          <div key={hook.id} className="glass p-8 rounded-[2.5rem] border border-slate-800 hover:border-emerald-500/30 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <button onClick={() => deleteHook(hook.id)} className="text-slate-600 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
            <h3 className="text-xl font-black text-white uppercase italic mb-1">{hook.name}</h3>
            <p className="text-[10px] font-mono text-slate-500 truncate mb-6">{hook.url}</p>
            <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
               <span className="text-[9px] font-black uppercase text-emerald-500 px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">{hook.method}</span>
               <span className="text-[9px] font-black uppercase text-slate-600">Status: Standby</span>
            </div>
          </div>
        ))}

        {webhooks.length === 0 && (
          <div className="md:col-span-3 py-20 text-center border-2 border-dashed border-slate-800 rounded-[3rem] opacity-30">
            <p className="text-slate-500 font-black uppercase tracking-widest text-sm italic">No Automation Bridges Configured</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass max-w-lg w-full p-12 rounded-[4rem] border border-emerald-500/30">
            <h3 className="text-3xl font-black italic uppercase text-white mb-8">Link External Trigger</h3>
            <form onSubmit={handleAdd} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Trigger Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500" 
                  placeholder="e.g. Zapier Production" 
                  required 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Webhook URL</label>
                <input 
                  type="url" 
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-mono text-sm focus:outline-none focus:border-emerald-500" 
                  placeholder="https://hooks.zapier.com/..." 
                  required 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-slate-900 rounded-2xl font-black text-xs uppercase text-slate-500">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 rounded-2xl font-black text-xs uppercase text-white">Save Trigger</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
