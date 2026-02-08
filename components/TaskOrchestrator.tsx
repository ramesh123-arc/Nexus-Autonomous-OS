import React, { useState, useEffect } from 'react';
import { Task, AgentStatus, AIProvider, WebhookConfig, AgentSwarmStep, MemoryFragment } from '../types';
import { GoogleGenAI } from '@google/genai';

interface TaskOrchestratorProps {
  onRunTask: (objective: string, provider: AIProvider, apiKey?: string, grounding?: { search: boolean, maps: boolean }, webhook?: WebhookConfig, useSwarm?: boolean) => void;
  isProcessing: boolean;
  tasks: Task[];
  isAuthorized: boolean;
  autoPilot: boolean;
  setAutoPilot: (val: boolean) => void;
  memory: MemoryFragment[];
}

export const TaskOrchestrator: React.FC<TaskOrchestratorProps> = ({ onRunTask, isProcessing, tasks, isAuthorized, autoPilot, setAutoPilot, memory }) => {
  const [objective, setObjective] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AIProvider.GOOGLE);
  const [useSwarm, setUseSwarm] = useState(true);
  const [useWebhook, setUseWebhook] = useState(false);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [selectedWebhookId, setSelectedWebhookId] = useState('');
  const [grounding, setGrounding] = useState({ search: true, maps: false });
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_webhooks');
    if (saved) setWebhooks(JSON.parse(saved));
  }, []);

  const handleSuggest = async () => {
    setIsSuggesting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given these recent memory fragments: ${JSON.stringify(memory.slice(0, 10))}. Suggest ONE highly efficient autonomous revenue-generating mission objective. Return only the objective text, max 15 words.`,
      });
      setObjective(response.text?.trim() || "Analyze market gaps for AI automation agents.");
    } catch (e) {
      setObjective("Scale YouTube arbitrage for high-CPM niches.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (objective.trim()) {
      const webhook = useWebhook ? webhooks.find(w => w.id === selectedWebhookId) : undefined;
      onRunTask(objective, selectedProvider, undefined, grounding, webhook, useSwarm);
      setObjective('');
    }
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-12 duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className={`glass p-16 rounded-[5rem] border transition-all duration-1000 ${isAuthorized ? 'border-cyan-500/20 bg-cyan-500/[0.02]' : 'border-slate-800 opacity-50 pointer-events-none'}`}>
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">Mission <span className="text-cyan-500">Deck</span></h2>
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.4em] mt-4">Command Neural Matrix</p>
              </div>
              <div className="flex gap-4">
                 <button 
                  onClick={() => setUseSwarm(!useSwarm)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase border transition-all duration-500 ${useSwarm ? 'bg-cyan-600 border-cyan-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                 >
                   Swarm Protocol: {useSwarm ? 'ONLINE' : 'OFFLINE'}
                 </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="flex flex-wrap gap-6 items-center justify-between">
                 <div className="flex gap-3 p-1.5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                    {Object.values(AIProvider).map(p => (
                      <button 
                        key={p} type="button" 
                        onClick={() => setSelectedProvider(p)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${selectedProvider === p ? 'bg-cyan-600 text-white syon-glow' : 'text-slate-600 hover:text-white'}`}
                      >
                        {p}
                      </button>
                    ))}
                 </div>

                 <div className="flex gap-4">
                   <button 
                     type="button"
                     onClick={handleSuggest}
                     disabled={isSuggesting}
                     className="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase border border-purple-500/40 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-all flex items-center gap-3"
                   >
                     {isSuggesting ? 'Thinking...' : 'Neural Suggest'}
                   </button>
                   <button 
                     type="button"
                     onClick={() => setGrounding(prev => ({ ...prev, search: !prev.search }))}
                     className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase border transition-all flex items-center gap-3 ${grounding.search ? 'bg-cyan-600/10 border-cyan-500/40 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                   >
                     <div className={`w-1.5 h-1.5 rounded-full ${grounding.search ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`}></div>
                     Grounding {grounding.search ? 'SYNCED' : 'OFF'}
                   </button>
                 </div>
              </div>

              {useWebhook && (
                <select 
                  value={selectedWebhookId}
                  onChange={(e) => setSelectedWebhookId(e.target.value)}
                  className="w-full bg-black/40 border border-slate-800 rounded-3xl px-8 py-5 text-[11px] font-mono text-white focus:outline-none focus:border-cyan-500 appearance-none transition-all shadow-inner"
                >
                  {webhooks.length > 0 ? webhooks.map(w => <option key={w.id} value={w.id}>{w.name} • {w.url.substring(0, 50)}...</option>) : <option disabled>No Matrix Hooks Found</option>}
                </select>
              )}

              <div className="relative group">
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder={useSwarm ? "Initiate complex multi-agent mission... (e.g. 'Audit AI market trends and render video manifest')" : "Enter immediate objective..."}
                  className="w-full h-56 bg-black/30 border border-slate-800/50 rounded-[3.5rem] p-10 text-2xl focus:outline-none focus:border-cyan-500/40 transition-all resize-none font-light placeholder:text-slate-800 group-hover:bg-black/40 shadow-inner"
                />
                <div className="absolute top-8 right-8 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
                   <svg className="w-10 h-10 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isProcessing || !objective.trim()}
                className="w-full py-8 rounded-3xl font-black text-xs uppercase tracking-[0.3em] bg-white text-black hover:bg-cyan-500 hover:text-white transition-all duration-700 shadow-2xl active:scale-[0.98] syon-glow group"
              >
                <div className="flex items-center justify-center gap-6">
                  {isProcessing ? 'Sourcing Intelligence...' : useSwarm ? 'Deploy Swarm Protocol' : 'Dispatch Lone Agent'}
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </div>
              </button>
            </form>
          </div>

          <div className="glass p-12 rounded-[4rem] border border-slate-800 bg-black/40 h-96 overflow-y-auto custom-scrollbar shadow-inner relative">
             <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 flex items-center gap-3">
                 <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse syon-glow"></span>
                 System Telemetry
               </h3>
               <span className="text-[8px] font-mono text-slate-800">CONNECTED VIA CLUSTER-ALPHA</span>
             </div>
             <div className="font-mono text-[11px] text-slate-600 space-y-4">
                {tasks.map(t => (
                  <div key={t.id} className={`${t.status === AgentStatus.EXECUTING || t.status === AgentStatus.THINKING ? 'text-cyan-500/80' : t.status === AgentStatus.COMPLETED ? 'text-emerald-500/80' : 'text-slate-700'} flex justify-between group`}>
                    <span className="group-hover:text-white transition-colors">>>> Mission_{t.id.slice(-4)}: [{t.status}] — {t.title.substring(0, 40)}...</span>
                    <span className="font-black italic">{t.progress}%</span>
                  </div>
                ))}
                {tasks.length === 0 && <div className="italic py-12 text-center opacity-20">Link established. Standing by for neural manifest...</div>}
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="glass p-10 rounded-[3.5rem] border border-cyan-500/10 bg-cyan-500/[0.01] shadow-xl">
              <h3 className="text-[10px] font-black uppercase text-slate-600 mb-8 tracking-[0.2em] italic">Network Grid</h3>
              <div className="space-y-6">
                 {[
                   { label: 'Google Edge Node', status: 'ACTIVE', color: 'text-emerald-400', latency: '12ms' },
                   { label: 'Neural Synthesizer', status: 'SYNCHED', color: 'text-cyan-400', latency: '24ms' },
                   { label: 'Headless Cluster', status: 'PERSISTENT', color: 'text-emerald-400', latency: '5ms' }
                 ].map((node, i) => (
                   <div key={i} className="flex justify-between items-center group">
                      <div className="flex flex-col">
                        <span className="text-slate-500 font-black text-[9px] uppercase tracking-widest">{node.label}</span>
                        <span className="text-[7px] font-mono text-slate-800 mt-1 uppercase">Latency: {node.latency}</span>
                      </div>
                      <span className={`${node.color} text-[9px] font-black uppercase italic tracking-tighter syon-text-glow group-hover:scale-105 transition-transform`}>{node.status}</span>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="glass p-12 rounded-[4rem] border border-cyan-500/5 bg-gradient-to-br from-cyan-500/10 to-transparent">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20">
                 <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="text-[11px] font-black uppercase text-cyan-400 mb-3 tracking-widest">Market Feed</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed font-mono italic">Nexus Swarms are currently scaling 1.4B in automated liquidity. Your mission parameters contribute to global arbitrage pools.</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-32">
        {tasks.map((task) => (
          <div key={task.id} className="glass p-16 rounded-[4.5rem] border border-cyan-500/5 hover:border-cyan-500/20 transition-all duration-700 flex flex-col group relative overflow-hidden bg-black/40 shadow-2xl">
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h4 className="font-black text-3xl text-white uppercase tracking-tighter italic truncate pr-8 group-hover:text-cyan-400 transition-colors">Mission: {task.id.slice(-4)}</h4>
                  <p className="text-[9px] font-mono text-slate-700 uppercase mt-2">{task.timestamp}</p>
               </div>
               <div className={`px-5 py-2 text-[9px] font-black rounded-2xl uppercase tracking-[0.2em] border shadow-xl ${
                 task.status === AgentStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                 task.status === AgentStatus.FAILED ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse'
               }`}>
                 {task.status}
               </div>
            </div>
            
            <div className="flex-1 bg-black/50 p-10 rounded-[3.5rem] border border-white/5 mb-10 font-mono text-[11px] text-slate-500 h-96 overflow-y-auto custom-scrollbar leading-relaxed shadow-inner">
              <div className="text-cyan-500/60 font-black mb-6 uppercase border-b border-cyan-500/10 pb-3 tracking-widest flex justify-between items-center">
                <span>Neural Manifest</span>
                <span className="text-[8px] italic text-slate-800">ENCRYPTED LINK 00X4</span>
              </div>
              <div className="whitespace-pre-wrap mb-8 text-slate-400">
                {task.status === AgentStatus.THINKING ? 'Establishing secure handshake with Nexus kernel... Sourcing intelligence manifest from edge nodes.' : task.description}
              </div>

              {task.swarmSteps && task.swarmSteps.length > 0 && (
                <div className="space-y-4">
                  {task.swarmSteps.map(step => (
                    <div key={step.id} className="flex items-center gap-5 p-4 bg-slate-900/40 rounded-2xl border border-white/5 group/step hover:border-cyan-500/20 transition-all">
                       <div className={`w-2 h-2 rounded-full ${step.status === 'done' ? 'bg-emerald-500' : step.status === 'running' ? 'bg-cyan-500 animate-pulse syon-glow' : 'bg-slate-800'}`}></div>
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{step.agent}:</span>
                       <span className="text-[10px] text-slate-400 truncate group-hover/step:text-slate-200 transition-colors italic">{step.prompt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8">
               <div className="grid grid-cols-3 gap-6">
                  {task.subTasks?.map((st) => (
                    <div key={st.id} className="space-y-2">
                       <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-600 tracking-widest">
                          <span>{st.label}</span>
                       </div>
                       <div className="h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
                          <div className={`h-full transition-all duration-700 ${st.status === 'done' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-cyan-600 shadow-[0_0_10px_#06b6d4]'}`} style={{ width: `${st.progress}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>

              <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div className={`h-full transition-all duration-1000 ${task.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-600 to-cyan-400 syon-glow'}`} style={{ width: `${task.progress}%` }}></div>
              </div>
            </div>
            
            <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
