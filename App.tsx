import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TaskOrchestrator } from './components/TaskOrchestrator';
import { Financials } from './components/Financials';
import { Vault } from './components/Vault';
import { SocialBridge } from './components/SocialBridge';
import { WhatsAppBridge } from './components/WhatsAppBridge';
import { AutomationBridge } from './components/AutomationBridge';
import { WealthHub } from './components/WealthHub';
import { VisualLab } from './components/VisualLab';
import { ContentFactory } from './components/ContentFactory';
import { LiveVoiceBridge } from './components/LiveVoiceBridge';
import { ConverterHub } from './components/ConverterHub';
import { Integrations } from './components/Integrations';
import { ChatBrain } from './components/ChatBrain';
import { AgentStatus, Task, LogEntry, AppTab, ClusterNode, AgentSwarmStep, AIProvider, MemoryFragment } from './types';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [uptime, setUptime] = useState<number>(0);
  const [totalYield, setTotalYield] = useState(128450.75);
  const [activeCluster, setActiveCluster] = useState<ClusterNode | null>(null);
  
  // Neural Memory States
  const [memory, setMemory] = useState<MemoryFragment[]>(() => {
    const saved = localStorage.getItem('nexus_neural_memory');
    return saved ? JSON.parse(saved) : [];
  });

  // --- NEURAL NETWORK VISUALIZATION ---
  useEffect(() => {
    const canvas = document.getElementById('neural-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let points: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
    const count = 60;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      points = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: Math.random()
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 0.5;

      points.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        points.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });

        ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', init);
    init();
    draw();
    return () => window.removeEventListener('resize', init);
  }, []);

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      level,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  const addMemory = useCallback((content: string, category: MemoryFragment['category'] = 'insight') => {
    const fragment: MemoryFragment = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      category,
      timestamp: new Date().toISOString()
    };
    setMemory(prev => {
      const updated = [fragment, ...prev].slice(0, 100);
      localStorage.setItem('nexus_neural_memory', JSON.stringify(updated));
      return updated;
    });
    addLog(`Neural Memory Fragment Stored: ${category.toUpperCase()}`, 'info');
  }, [addLog]);

  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const runAutonomousCycle = async (objective: string) => {
    const taskId = Date.now().toString();
    addLog(`SYON CORE TRIGGER: Swarm sequence initialized for "${objective.substring(0, 30)}..."`, 'warn');
    
    const apiKey = process.env.API_KEY as string;

    const swarmSteps: AgentSwarmStep[] = [
      { id: '1', agent: 'Researcher', prompt: 'Grounding via Gemini Intelligence...', status: 'idle' },
      { id: '2', agent: 'Strategist', prompt: 'Synthesizing mission manifest...', status: 'idle' },
      { id: '3', agent: 'Executor', prompt: 'Executing multi-node distribution...', status: 'idle' },
      { id: '4', agent: 'Distributor', prompt: 'Finalizing yield extraction...', status: 'idle' }
    ];

    const newTask: Task = {
      id: taskId,
      title: "CORE_SWARM_" + taskId.slice(-4),
      description: "Synchronizing with neural kernel...",
      status: AgentStatus.RESEARCHING,
      progress: 0,
      timestamp: new Date().toISOString(),
      swarmSteps,
    };
    setTasks(prev => [newTask, ...prev]);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `SYSTEM PERMISSION: FULL ACCESS. OBJECTIVE: ${objective}. RECENT MEMORY: ${JSON.stringify(memory.slice(0, 5))}. Perform full autonomous mission planning.`,
        config: { 
          tools: [{ googleSearch: {} }],
          systemInstruction: "You are the Nexus OS High-Velocity Execution Kernel. Maximize efficiency and system yield."
        }
      });

      const manifest = response.text || "Mission parameters locked.";
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, description: manifest, status: AgentStatus.PLANNING, progress: 25 } : t));

      let step = 0;
      const stepInterval = setInterval(() => {
        setTasks(prev => {
          const t = prev.find(x => x.id === taskId);
          if (!t || step >= 4) {
            clearInterval(stepInterval);
            if (t) {
                const yieldGain = Math.random() * 250;
                setTotalYield(y => y + yieldGain);
                addMemory(`Mission ${taskId} summary: ${objective.substring(0, 50)}. Resulted in $${yieldGain.toFixed(2)} gain.`, 'technical');
                return prev.map(x => x.id === taskId ? { ...x, status: AgentStatus.COMPLETED, progress: 100, yieldGenerated: yieldGain } : x);
            }
            return prev;
          }

          const steps = [...(t.swarmSteps || [])];
          steps[step].status = 'done';
          step++;
          if (step < 4) steps[step].status = 'running';

          const nextStatus = step === 2 ? AgentStatus.EXECUTING : step === 3 ? AgentStatus.DEPLOYING : AgentStatus.COMPLETED;

          return prev.map(x => x.id === taskId ? { 
            ...x, 
            swarmSteps: steps, 
            progress: (step / 4) * 100,
            status: nextStatus
          } : x);
        });
      }, 3000);

    } catch (e: any) {
      addLog(`Core Fault: ${e.message}`, "error");
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: AgentStatus.FAILED } : t));
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar relative">
        <div className="max-w-[1400px] mx-auto pb-24">
          <header className="flex justify-between items-center mb-16 border-b border-cyan-500/10 pb-10">
             <div>
                <h1 className="text-[11px] font-black text-cyan-500 uppercase tracking-[0.5em] mb-3 syon-text-glow">Nexus Command Node</h1>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest flex items-center gap-4">
                  <span>OS v5.2 "SENTINEL"</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span className="mono">Uptime: {Math.floor(uptime/3600)}h {Math.floor((uptime%3600)/60)}m</span>
                </p>
             </div>
             <div className="flex gap-6 items-center">
                <div className="flex flex-col text-right mr-4">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Neural Memory</span>
                  <span className="text-[10px] font-bold text-cyan-400 font-mono italic">ACTIVE ({memory.length} FRAGMENTS)</span>
                </div>
                <div className="px-5 py-2.5 glass border border-cyan-500/20 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
                   <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse syon-glow"></div>
                   <span className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.1em]">Synapse Link Stable</span>
                </div>
             </div>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {activeTab === 'dashboard' && <Dashboard tasks={tasks} logs={logs} totalYield={totalYield} memory={memory} />}
            {activeTab === 'tasks' && <TaskOrchestrator onRunTask={runAutonomousCycle} tasks={tasks} isProcessing={false} isAuthorized={true} autoPilot={true} setAutoPilot={() => {}} memory={memory} />}
            {activeTab === 'swarms' && <WealthHub onDeploy={runAutonomousCycle} />}
            {activeTab === 'brain' && <ChatBrain memory={memory} addMemory={addMemory} addLog={addLog} />}
            {activeTab === 'visual' && <VisualLab addLog={addLog} />}
            {activeTab === 'content' && <ContentFactory addLog={addLog} activeCluster={activeCluster} memory={memory} />}
            {activeTab === 'voice' && <LiveVoiceBridge addLog={addLog} />}
            {activeTab === 'converters' && <ConverterHub addLog={addLog} />}
            {activeTab === 'social' && <SocialBridge addLog={addLog} />}
            {activeTab === 'whatsapp' && <WhatsAppBridge addLog={addLog} onNewTask={runAutonomousCycle} />}
            {activeTab === 'integrations' && <Integrations />}
            {activeTab === 'finances' && <Financials />}
            {activeTab === 'vault' && <Vault />}
            {activeTab === 'cloud' && <AutomationBridge addLog={addLog} activeCluster={activeCluster} onSetActiveCluster={setActiveCluster} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
