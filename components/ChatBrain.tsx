import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { MemoryFragment } from '../types';

interface ChatBrainProps {
  memory: MemoryFragment[];
  addMemory: (content: string, category: MemoryFragment['category']) => void;
  addLog: (msg: string, level?: any) => void;
}

export const ChatBrain: React.FC<ChatBrainProps> = ({ memory, addMemory, addLog }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Neural Interface established. I remember our past objectives. How shall we scale the empire today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initChat = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    chatRef.current = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are the Nexus OS Neural Brain. You have persistent memory: ${JSON.stringify(memory.slice(0, 20))}. Your goal is to help the user manage their autonomous AI revenue streams. Be precise, sophisticated, and recall past preferences.`,
      },
    });
  };

  useEffect(() => {
    initChat();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      if (!chatRef.current) await initChat();
      
      const response: GenerateContentResponse = await chatRef.current.sendMessage({ message: userText });
      const modelText = response.text || "Neural path obstructed.";
      
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
      
      // Analyze for memory extraction
      if (userText.toLowerCase().includes("remember") || userText.toLowerCase().includes("prefer")) {
        addMemory(userText, 'preference');
      }

    } catch (err: any) {
      addLog(`Brain Error: ${err.message}`, 'error');
      setMessages(prev => [...prev, { role: 'model', text: "Critical sync error. Re-initializing pathways..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-700 h-[calc(100vh-250px)]">
      <div className="lg:col-span-2 glass rounded-[4rem] border border-cyan-500/20 flex flex-col overflow-hidden bg-black/40">
        <div className="p-8 border-b border-cyan-500/10 flex justify-between items-center bg-cyan-500/[0.02]">
           <div>
              <h2 className="text-2xl font-black italic uppercase text-white tracking-tight">Neural <span className="text-cyan-500">Dialogue</span></h2>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active Chat Instance: GEMINI-3-PRO</p>
           </div>
           <button onClick={() => setMessages([{ role: 'model', text: 'Pathways cleared. Standing by.' }])} className="text-[9px] font-black uppercase text-slate-600 hover:text-white transition-colors">Clear Stream</button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm leading-relaxed ${
                m.role === 'user' 
                ? 'bg-cyan-600/10 border border-cyan-500/30 text-white rounded-tr-none' 
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 rounded-tl-none italic font-light'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
               <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex gap-1">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-8 bg-black/40 border-t border-cyan-500/10 flex gap-4">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Issue high-level directive or ask for insights..."
            className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all font-mono text-sm"
          />
          <button type="submit" className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-500 hover:text-white transition-all shadow-xl">Transmit</button>
        </form>
      </div>

      <div className="space-y-8 overflow-y-auto custom-scrollbar pr-2">
         <div className="glass p-10 rounded-[3.5rem] border border-cyan-500/10 bg-cyan-500/[0.01]">
            <h3 className="text-[10px] font-black uppercase text-slate-600 mb-8 tracking-[0.2em] italic">Fragmented Memory</h3>
            <div className="space-y-6">
               {memory.length === 0 ? (
                 <p className="text-[10px] font-mono text-slate-800 uppercase text-center py-20">No fragments stored</p>
               ) : (
                 memory.map(f => (
                    <div key={f.id} className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-cyan-500/30 transition-all group">
                       <div className="flex justify-between items-center mb-2">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                            f.category === 'preference' ? 'bg-purple-500/10 text-purple-500' : 'bg-cyan-500/10 text-cyan-500'
                          }`}>{f.category}</span>
                          <span className="text-[8px] font-mono text-slate-700">{new Date(f.timestamp).toLocaleDateString()}</span>
                       </div>
                       <p className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors italic leading-relaxed truncate">{f.content}</p>
                    </div>
                 ))
               )}
            </div>
         </div>

         <div className="glass p-10 rounded-[3.5rem] border border-slate-800 bg-black/40">
            <h4 className="text-[11px] font-black text-white uppercase mb-4 italic">Neural Health</h4>
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Context Window</span>
                  <span className="text-[10px] font-mono text-cyan-400">1.2M / 2.0M</span>
               </div>
               <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[60%] shadow-[0_0_10px_#06b6d4]"></div>
               </div>
               <p className="text-[9px] font-mono text-slate-600 leading-relaxed italic">
                 The Neural Brain utilizes cross-referencing between standard Gemini context and local Storage Fragments to minimize latency and maximize recall.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};
