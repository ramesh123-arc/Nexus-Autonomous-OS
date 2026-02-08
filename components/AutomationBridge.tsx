import React, { useState, useEffect } from 'react';
import { ClusterNode } from '../types';

interface AutomationBridgeProps {
  addLog: (msg: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
  activeCluster: ClusterNode | null;
  onSetActiveCluster: (cluster: ClusterNode | null) => void;
}

export const AutomationBridge: React.FC<AutomationBridgeProps> = ({ addLog, activeCluster, onSetActiveCluster }) => {
  const [clusters, setClusters] = useState<ClusterNode[]>([]);
  const [showDeployGuide, setShowDeployGuide] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [sysHealth, setSysHealth] = useState({ vault: false, workers: 0, env: false });

  useEffect(() => {
    const saved = localStorage.getItem('nexus_clusters');
    if (saved) setClusters(JSON.parse(saved));
    
    // Check Production Readiness
    const vault = !!localStorage.getItem('nexus_vault_v2');
    const env = !!process.env.API_KEY;
    setSysHealth({ vault, workers: JSON.parse(saved || '[]').length, env });
  }, []);

  const pingCluster = async (cluster: ClusterNode) => {
    try {
      const res = await fetch(`${cluster.url}/status`, {
        headers: { 'X-Nexus-Secret': cluster.secret || '' }
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const generateHeadlessCode = () => {
    if (!activeCluster) return "# ERROR: Select a Cluster Node first.";
    const apiKey = "process.env.API_KEY"; // Placeholder for documentation
    return `
# NEXUS OS PRODUCTION WORKER V2.0
# Deployment: pip install google-generativeai requests flask
import os, time, requests
from google.generativeai import GoogleGenerativeAI

# PRODUCTION CONFIG
CLUSTER_SECRET = "${activeCluster.secret}"
API_KEY = os.getenv("API_KEY") # NEVER hardcode in production
OS_ENDPOINT = "${activeCluster.url}"

def run_worker():
    print(f"--- Nexus OS Connected: ${activeCluster.name} ---")
    while True:
        try:
            # Fetch pending swarm from frontend bridge
            response = requests.get(f"{OS_ENDPOINT}/queue", headers={"X-Secret": CLUSTER_SECRET})
            if response.status_code == 200:
                task = response.json()
                print(f"Executing Mission: {task['id']}")
                # Business logic for Google GenAI would go here
                requests.post(f"{OS_ENDPOINT}/callback", json={"status": "completed", "id": task['id']})
            
            time.sleep(10) # 10s Heartbeat
        except Exception as e:
            print(f"Cloud Fault: {e}")
            time.sleep(30)

if __name__ == "__main__":
    run_worker()
    `;
  };

  const handleCloudLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProvisioning(true);
    const formData = new FormData(e.currentTarget);
    const node: ClusterNode = {
      id: `cloud-${Date.now()}`,
      name: formData.get('name') as string,
      url: formData.get('url') as string,
      secret: formData.get('secret') as string,
      status: 'Online',
      uptime: 'Active',
      successRate: 100,
      region: formData.get('region') as string
    };

    addLog(`Initiating Handshake with Production Node: ${node.name}...`, "warn");
    const isAlive = await pingCluster(node);

    if (isAlive) {
      const updated = [...clusters, node];
      setClusters(updated);
      localStorage.setItem('nexus_clusters', JSON.stringify(updated));
      onSetActiveCluster(node);
      addLog(`PRODUCTION LINK ESTABLISHED.`, "success");
      setShowDeployGuide(false);
    } else {
      addLog(`Connection Failed. Using local simulation for node.`, "error");
      // For demo, we add it anyway but flag it
      const updated = [...clusters, { ...node, status: 'Simulated' }];
      setClusters(updated);
      localStorage.setItem('nexus_clusters', JSON.stringify(updated));
      onSetActiveCluster(updated[updated.length - 1]);
    }
    setProvisioning(false);
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">Cloud <span className="text-blue-500">Node</span></h2>
          <p className="text-slate-500 text-sm font-mono uppercase mt-2 tracking-widest italic">24/7 Persistent Production Bridge</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => activeCluster && setShowExport(true)}
            className="px-8 py-5 bg-slate-900 text-blue-500 border border-blue-500/20 rounded-3xl font-black text-xs uppercase hover:bg-blue-500 hover:text-white transition-all shadow-2xl"
          >
            Export Worker Code
          </button>
          <button 
            onClick={() => setShowDeployGuide(true)}
            className="px-10 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            Link Cluster
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-10 rounded-[4rem] border border-slate-800 bg-slate-900/20">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest italic mb-10">Active Infrastructure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clusters.map(cluster => (
                  <div key={cluster.id} className={`p-8 rounded-[3.5rem] border transition-all cursor-pointer group ${activeCluster?.id === cluster.id ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700'}`} onClick={() => onSetActiveCluster(cluster)}>
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2m-2 4h.01M17 16h.01" /></svg>
                        </div>
                        <span className={`text-[8px] font-black px-2 py-1 rounded-md ${cluster.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {cluster.status.toUpperCase()}
                        </span>
                    </div>
                    <h4 className="text-xl font-black text-white uppercase italic truncate">{cluster.name}</h4>
                    <p className="text-[10px] font-mono text-slate-500 truncate mb-6">{cluster.url}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                        <span className="text-[9px] font-black text-slate-600 uppercase">Region: {cluster.region}</span>
                        <button onClick={(e) => {e.stopPropagation(); onSetActiveCluster(null); setClusters(clusters.filter(c => c.id !== cluster.id));}} className="text-[9px] font-black text-red-500 uppercase hover:underline">Unlink</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="glass p-12 rounded-[4rem] border border-cyan-500/10 bg-cyan-500/[0.01]">
            <h3 className="text-xl font-black italic uppercase text-white mb-8">Production Pre-Flight</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Environment API", status: sysHealth.env, desc: "process.env.API_KEY check" },
                  { label: "Neural Vault", status: sysHealth.vault, desc: "Encrypted keys found" },
                  { label: "Worker Sync", status: sysHealth.workers > 0, desc: "Cloud nodes registered" }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-black/40 border border-slate-800 rounded-3xl">
                    <div className="flex items-center gap-3 mb-3">
                       <div className={`w-2 h-2 rounded-full ${item.status ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500'}`}></div>
                       <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{item.label}</span>
                    </div>
                    <p className="text-[11px] font-bold text-white">{item.status ? 'VERIFIED' : 'PENDING'}</p>
                    <p className="text-[9px] font-mono text-slate-600 mt-1 uppercase">{item.desc}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="glass p-10 rounded-[4rem] border border-slate-800 bg-black/40 space-y-8">
           <h3 className="text-xs font-black uppercase text-blue-500 tracking-widest">Production Roadmap</h3>
           <div className="space-y-6">
              {[
                { step: "01", title: "Docker Host", desc: "Spin up a dedicated VPS with 4GB RAM minimum.", done: true },
                { step: "02", title: "Environment Variables", desc: "Set API_KEY and CLUSTER_SECRET on your host.", done: sysHealth.env },
                { step: "03", title: "Python Run", desc: "Execute the worker code in a persistent tmux session.", done: sysHealth.workers > 0 },
                { step: "04", title: "Scale Matrix", desc: "Link multiple regions for 100% uptime redundancy.", done: sysHealth.workers > 1 }
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                   <span className={`text-[10px] font-black ${item.done ? 'text-emerald-500' : 'text-slate-700'}`}>{item.step}</span>
                   <div>
                      <h5 className={`text-[11px] font-black uppercase ${item.done ? 'text-white' : 'text-slate-500'}`}>{item.title}</h5>
                      <p className="text-[9px] font-mono text-slate-600 mt-1">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {showExport && (
        <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
           <div className="glass max-w-2xl w-full p-12 rounded-[4rem] border border-blue-500/30">
              <h3 className="text-3xl font-black italic uppercase text-white mb-2">Worker Manifest</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-8">Copy this to your production VPS (e.g., worker.py)</p>
              
              <div className="bg-black/60 rounded-3xl p-6 border border-slate-800 mb-8 max-h-[400px] overflow-y-auto custom-scrollbar">
                 <pre className="text-[10px] font-mono text-blue-400 leading-relaxed whitespace-pre-wrap">
                    {generateHeadlessCode()}
                 </pre>
              </div>
              
              <div className="flex gap-4">
                 <button onClick={() => setShowExport(false)} className="flex-1 py-5 bg-slate-900 text-slate-500 rounded-2xl font-black uppercase text-xs">Close</button>
                 <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generateHeadlessCode());
                    addLog("Production Manifest Copied.", "success");
                  }}
                  className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-600/20"
                 >
                   Copy Code
                 </button>
              </div>
           </div>
        </div>
      )}

      {showDeployGuide && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
           <div className="glass max-w-xl w-full p-12 rounded-[4rem] border border-blue-500/30">
              <h3 className="text-4xl font-black italic uppercase text-white mb-2">Bridge Connection</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-10 text-center">Sync App with Production Cloud Compute</p>
              
              <form onSubmit={handleCloudLink} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-600 ml-1">Alias</label>
                       <input name="name" type="text" placeholder="Prod-Node-Alpha" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all" required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-600 ml-1">Region</label>
                       <select name="region" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all">
                          <option>US-EAST-1</option>
                          <option>EU-CENTRAL-1</option>
                          <option>AS-SOUTH-1</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-600 ml-1">Production Endpoint</label>
                    <input name="url" type="url" placeholder="https://api.yourdomain.com" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-mono focus:outline-none focus:border-blue-500 transition-all" required />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-600 ml-1">Handshake Secret</label>
                    <input name="secret" type="password" placeholder="••••••••••••" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-mono focus:outline-none focus:border-blue-500 transition-all" required />
                 </div>

                 <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setShowDeployGuide(false)} className="flex-1 py-5 bg-slate-950 text-slate-600 rounded-2xl font-black uppercase text-xs">Abort</button>
                    <button type="submit" disabled={provisioning} className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-600/20">
                       {provisioning ? 'Authenticating...' : 'Link Production Node'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
