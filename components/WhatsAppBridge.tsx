import React, { useState, useEffect } from 'react';

interface WhatsAppBridgeProps {
  addLog: (msg: string, level?: any) => void;
  onNewTask: (objective: string) => void;
}

export const WhatsAppBridge: React.FC<WhatsAppBridgeProps> = ({ addLog, onNewTask }) => {
  const [messages, setMessages] = useState<{id: string, text: string, time: string}[]>([]);

  const simulateIncoming = () => {
    const tasks = [
      "Find top 10 products for Shopify dropshipping",
      "Draft an AI automation plan for digital agency",
      "Research the best crypto signals for the next hour",
      "Automate a content swarm for tech news on TikTok"
    ];
    const text = tasks[Math.floor(Math.random() * tasks.length)];
    const newMessage = { id: Date.now().toString(), text, time: new Date().toLocaleTimeString() };
    
    setMessages(prev => [newMessage, ...prev].slice(0, 10));
    addLog(`Incoming WhatsApp Signal: "${text}"`, "info");
    onNewTask(text);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">WhatsApp <span className="text-emerald-500">Bridge</span></h2>
          <p className="text-slate-500 text-sm font-mono uppercase mt-2 tracking-widest italic opacity-60">Real-time Task Reception Gateway</p>
        </div>
        <button 
          onClick={simulateIncoming}
          className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20"
        >
          Simulate Incoming Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-[3rem] border border-slate-800 p-10 bg-black/40">
           <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest italic mb-8">Signal Stream</h3>
           <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
              {messages.map(m => (
                <div key={m.id} className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex justify-between items-center group hover:border-emerald-500/40 transition-all">
                  <div className="flex gap-4 items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-white font-mono text-sm">Task Received: <span className="text-slate-400">"{m.text}"</span></p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">{m.time}</span>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-20 opacity-30 italic font-mono text-sm uppercase">Standing by for WhatsApp triggers...</div>
              )}
           </div>
        </div>

        <div className="glass rounded-[3rem] border border-slate-800 p-10 bg-emerald-500/[0.02]">
           <h3 className="text-xs font-black uppercase text-emerald-500 tracking-widest italic mb-8">Bridge Config</h3>
           <div className="space-y-8">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase">Webhook Endpoint</p>
                 <p className="text-xs font-mono text-white">https://nexus-os.io/wa-hook/7x29</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase">Task Mapping</p>
                 <p className="text-xs font-mono text-white">Natural Language -> Swarm Objective</p>
              </div>
              <div className="pt-6 border-t border-slate-800">
                 <p className="text-[10px] text-slate-500 leading-relaxed font-mono">Any message sent to the linked business number is autonomously parsed by the Gemini Pro Strategist and deployed as a multi-step revenue swarm.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
