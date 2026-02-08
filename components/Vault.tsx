import React, { useState, useEffect } from 'react';
import { AIProvider, ApiKeyRecord } from '../types';

// Simplified encryption simulation for demonstration
// In a real production app, this would use WebCrypto API (SubtleCrypto)
const encrypt = (text: string, pass: string) => btoa(text + ":" + pass);
const decrypt = (cipher: string, pass: string) => {
  try {
    const decoded = atob(cipher);
    const [text, p] = decoded.split(":");
    return p === pass ? text : null;
  } catch { return null; }
};

export const Vault: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [sessionPass, setSessionPass] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState({ provider: AIProvider.GOOGLE, key: '', label: '' });

  useEffect(() => {
    const saved = localStorage.getItem('nexus_vault_v2');
    if (saved) setKeys(JSON.parse(saved));
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionPass.length >= 8) {
      setIsUnlocked(true);
    } else {
      alert("Session password must be at least 8 characters.");
    }
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    const encryptedKey = encrypt(newKey.key, sessionPass);
    const record: ApiKeyRecord = {
      ...newKey,
      key: encryptedKey,
      lastUpdated: new Date().toISOString(),
      encrypted: true
    };
    const updated = [...keys, record];
    setKeys(updated);
    localStorage.setItem('nexus_vault_v2', JSON.stringify(updated));
    setShowAddModal(false);
    setNewKey({ provider: AIProvider.GOOGLE, key: '', label: '' });
  };

  const deleteKey = (index: number) => {
    if (confirm("Permanently purge this record?")) {
      const updated = [...keys];
      updated.splice(index, 1);
      setKeys(updated);
      localStorage.setItem('nexus_vault_v2', JSON.stringify(updated));
    }
  };

  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center h-[60vh] animate-in zoom-in duration-500">
        <div className="glass max-w-md w-full p-12 rounded-[4rem] border border-blue-500/30 text-center">
          <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.1)]">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-3xl font-black italic uppercase text-white mb-2">Vault Locked</h2>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-8">Enter Master Session Password to decrypt keys</p>
          <form onSubmit={handleUnlock} className="space-y-4">
            <input 
              type="password" 
              value={sessionPass}
              onChange={(e) => setSessionPass(e.target.value)}
              placeholder="Session Password"
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white text-center font-mono focus:border-blue-500 focus:outline-none transition-all"
              required
            />
            <button type="submit" className="w-full py-4 bg-blue-600 rounded-2xl font-black text-xs uppercase text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">Initialize Session</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Secret Vault <span className="text-emerald-500 text-xs font-mono ml-4 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">Unlocked</span></h2>
          <p className="text-slate-500 text-xs font-mono uppercase mt-1">End-to-End Encrypted Session Node</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsUnlocked(false)} className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black uppercase text-slate-500 hover:text-white transition-all">Lock Vault</button>
          <button onClick={() => setShowAddModal(true)} className="px-8 py-3 bg-blue-600 rounded-xl text-xs font-black uppercase text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">Add Secret</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {keys.map((record, i) => (
          <div key={i} className="glass p-8 rounded-[2.5rem] border border-slate-800 hover:border-blue-500/30 transition-all group relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-blue-500">
                {record.provider.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-lg text-white uppercase italic leading-none">{record.label}</h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">{record.provider}</p>
              </div>
            </div>
            <div className="bg-black/60 p-4 rounded-xl border border-slate-900 mb-6 font-mono text-xs text-blue-400 truncate opacity-40 group-hover:opacity-100 transition-opacity">
              {decrypt(record.key, sessionPass) ? "••••••••••••••••" : "DECRYPTION FAILED"}
            </div>
            <div className="flex justify-between items-center">
              <div className="text-[9px] font-mono text-slate-600 uppercase">Last Sync: {new Date(record.lastUpdated).toLocaleDateString()}</div>
              <button onClick={() => deleteKey(i)} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="glass max-w-md w-full p-10 rounded-[3rem] border border-blue-500/30">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 text-white text-center">Encrypt New Key</h3>
            <form onSubmit={handleAddKey} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Provider</label>
                <select 
                  value={newKey.provider}
                  onChange={e => setNewKey({...newKey, provider: e.target.value as AIProvider})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all uppercase text-[10px] font-black"
                >
                  {Object.values(AIProvider).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Alias Label</label>
                <input type="text" value={newKey.label} onChange={e => setNewKey({...newKey, label: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all" placeholder="e.g. Production Bridge" required />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Secret Key</label>
                <input type="password" value={newKey.key} onChange={e => setNewKey({...newKey, key: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-mono" placeholder="sk-••••" required />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-900 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">Abort</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-blue-500 transition-all">Secure Key</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
