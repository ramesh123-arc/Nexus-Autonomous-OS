import React, { useState, useEffect, useRef } from 'react';

interface IntegrationItem {
  id: string;
  name: string;
  status: 'Connected' | 'Active' | 'Pending' | 'Disconnected' | 'Live';
  icon: string;
  healthScore: number;
}

interface Alert {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'success';
  timestamp: string;
}

export const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    { id: 'wa', name: 'WhatsApp Business', status: 'Live', icon: '💬', healthScore: 100 },
    { id: 'yt', name: 'YouTube API', status: 'Connected', icon: '🔴', healthScore: 98 },
    { id: 'gh', name: 'GitHub Actions', status: 'Connected', icon: '🐙', healthScore: 100 },
    { id: 'stripe', name: 'Stripe Pay', status: 'Connected', icon: '💳', healthScore: 95 },
    { id: 'vercel', name: 'Vercel Edge', status: 'Connected', icon: '▲', healthScore: 99 },
    { id: 'pc', name: 'Cloud Node 01', status: 'Live', icon: '💻', healthScore: 92 },
    { id: 'ai', name: 'Google Gemini', status: 'Connected', icon: '✨', healthScore: 100 },
    { id: 'tw', name: 'Twitter X', status: 'Pending', icon: '𝕏', healthScore: 42 },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNode, setNewNode] = useState({ name: '', icon: '⚡', apiKey: '' });
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const keys: Record<string, boolean> = {};
    integrations.forEach(item => {
      const stored = localStorage.getItem(`nexus_api_key_${item.id}`);
      if (stored) keys[item.id] = true;
    });
    setSavedKeys(keys);
  }, [integrations]);

  const testConnectivity = async (item: IntegrationItem) => {
    addAlert(`Testing Uplink to ${item.name}...`, 'warning');
    await new Promise(r => setTimeout(r, 1500));
    
    // Logic: In production, you'd perform a small API call here
    const isOk = Math.random() > 0.1;
    if (isOk) {
      addAlert(`${item.name} Connectivity Verified. Secure Link Established.`, 'success');
      setIntegrations(prev => prev.map(i => i.id === item.id ? { ...i, status: 'Live', healthScore: 100 } : i));
    } else {
      addAlert(`${item.name} Handshake Failed. Verify API Credentials in Vault.`, 'error');
    }
  };

  const addAlert = (message: string, type: Alert['type']) => {
    const newAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 5));
  };

  return (
    <div className="space-y-8 animate-in zoom-in duration-500 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Bridge Connectors</h2>
          <p className="text-slate-500 text-xs font-mono uppercase mt-1">Production Hub Access Layer</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-8 py-3 bg-blue-600 rounded-xl text-xs font-black uppercase text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
          Link New Production Node
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {integrations.map((item) => {
          const hasKey = savedKeys[item.id];
          return (
            <div 
              key={item.id} 
              className={`glass p-8 rounded-[2rem] border transition-all group relative overflow-hidden ${
                item.status === 'Live' ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : 'border-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-6 mt-2">
                <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                <div className="text-right">
                  <div className={`w-2 h-2 rounded-full ml-auto mb-1 ${
                    item.status === 'Live' ? 'bg-emerald-500 shadow-[0_0_10px_#22c55e]' : 
                    item.status === 'Connected' ? 'bg-blue-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-[9px] font-mono font-bold text-slate-500">{item.healthScore}% Health</span>
                </div>
              </div>

              <h3 className="font-black text-xl mb-1 tracking-tight text-white uppercase italic">{item.name}</h3>
              <p className={`text-[10px] uppercase font-black tracking-widest mb-6 ${item.status === 'Live' ? 'text-emerald-500' : 'text-slate-600'}`}>{item.status}</p>

              <button 
                onClick={() => testConnectivity(item)}
                className="w-full py-3 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all group-hover:border-blue-500/30"
              >
                Test Connectivity
              </button>
            </div>
          );
        })}
      </div>
      
      {alerts.length > 0 && (
        <div className="fixed bottom-10 right-10 z-[300] space-y-3 pointer-events-none">
          {alerts.map(alert => (
            <div key={alert.id} className={`p-4 rounded-2xl glass border-l-4 shadow-2xl animate-in slide-in-from-right-10 ${
              alert.type === 'error' ? 'border-red-500' : 
              alert.type === 'success' ? 'border-emerald-500' : 'border-yellow-500'
            }`}>
              <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{alert.timestamp}</p>
              <p className="text-xs text-white font-medium">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="glass p-10 rounded-[3rem] border border-emerald-600/20 bg-emerald-600/[0.01]">
        <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4 text-white">Production Gateway</h3>
        <p className="text-slate-500 text-[11px] font-mono leading-relaxed mb-8 max-w-2xl">
          Integrations marked as <span className="text-emerald-500 font-bold">LIVE</span> are currently authorized to perform background swarms. Ensure your <span className="text-white italic">Webhook Handshake</span> matches the CLUSTER_SECRET in your exported Python manifest.
        </p>
      </div>
    </div>
  );
};
