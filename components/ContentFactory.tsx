import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ClusterNode, MemoryFragment, LogEntry } from '../types';

interface ContentFactoryProps {
  // Fix: Updated addLog level parameter to include 'security' to match App.tsx
  addLog: (msg: string, level?: LogEntry['level']) => void;
  activeCluster: ClusterNode | null;
  // Fix: Added memory prop to match usage in App.tsx
  memory: MemoryFragment[];
}

export const ContentFactory: React.FC<ContentFactoryProps> = ({ addLog, activeCluster, memory }) => {
  const [prompt, setPrompt] = useState('');
  const [script, setScript] = useState('');
  const [generating, setGenerating] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [audioBase64Data, setAudioBase64Data] = useState<string | null>(null);
  const [status, setStatus] = useState('Standby');
  const [autoResearch, setAutoResearch] = useState(true);
  
  // Autopilot States
  const [autopilot, setAutopilot] = useState(false);
  const [pulseTime, setPulseTime] = useState('09:00');
  const [lastPulse, setLastPulse] = useState<string | null>(null);
  const [clusterLinked, setClusterLinked] = useState(false);

  useEffect(() => {
    if (!activeCluster) {
      setClusterLinked(false);
      return;
    }
    const checkStatus = async () => {
      try {
        const res = await fetch(`${activeCluster.url}/status`, {
          headers: { 'X-Nexus-Secret': activeCluster.secret || '' }
        });
        setClusterLinked(res.ok);
      } catch {
        setClusterLinked(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [activeCluster]);

  const performResearch = useCallback(async (customPrompt?: string) => {
    setIsResearching(true);
    setStatus('Grounding: Searching Trending Content...');
    addLog("Research Node Engaged: Scanning Google for High-Velocity Trends.", "info");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Inspect Google for the 3 most viral trending news topics in the last 24 hours related to: ${customPrompt || prompt || 'AI and Future Tech'}. Extract a viral script for a 30-second video.`,
        config: { tools: [{ googleSearch: {} }] }
      });

      const researchResult = response.text || "";
      addLog("Trend Analysis Complete. Optimizing Daily Manifest.", "success");
      setScript(researchResult);
      if (!prompt) setPrompt("Viral trending tech update.");
      return researchResult;
    } catch (err: any) {
      addLog(`Research Error: ${err.message}`, "error");
      return null;
    } finally {
      setIsResearching(false);
      setStatus('Ready');
    }
  }, [prompt, addLog]);

  const dispatchToCluster = async (vBase64: string, aBase64: string) => {
    if (!activeCluster) return;
    setStatus('Cluster: High-Velocity Dispatch...');
    addLog(`Dispatching to ${activeCluster.name}...`, "warn");

    try {
      const res = await fetch(`${activeCluster.url}/dispatch`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Nexus-Secret': activeCluster.secret || ''
        },
        body: JSON.stringify({
          video: vBase64,
          audio: aBase64,
          metadata: {
            title: `Nexus OS Autopilot: ${new Date().toLocaleDateString()}`,
            description: script || prompt,
            tags: ["AI", "Automation", "NexusOS", "FutureTech"]
          }
        })
      });

      if (res.ok) {
        addLog(`Autonomous Dispatch Successful. Remote node is executing social upload.`, "success");
      } else {
        throw new Error("Cluster rejected payload.");
      }
    } catch (err: any) {
      addLog(`Dispatch Error: ${err.message}`, "error");
    } finally {
      setStatus('Ready');
    }
  };

  const generateAssets = useCallback(async () => {
    setGenerating(true);
    setVideoUrl(null);
    setAudioUrl(null);
    
    let activeScript = script;
    if (autoResearch) {
      const res = await performResearch();
      if (res) activeScript = res;
    }

    setStatus('Initializing Production...');
    addLog(`DAILY CYCLE START: Rendering AI Video Assets...`, 'warn');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      // 1. Generate Video
      setStatus('Engine: Generating Video (Veo)...');
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Cinematic, highly engaging viral reel: ${prompt}. Trending high-tech aesthetic.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '9:16'
        }
      });

      while (!operation.done) {
        setStatus(`Engine: Processing Video Frames (${new Date().toLocaleTimeString()})...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      let vB64 = "";
      if (downloadLink) {
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await videoResponse.blob();
        setVideoUrl(URL.createObjectURL(videoBlob));
        
        // Internal B64 conversion
        vB64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(videoBlob);
        });
        setVideoBase64(vB64);
      }

      // 2. Generate TTS
      setStatus('Engine: Synthesizing Narration (TTS)...');
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: activeScript }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        },
      });

      const aB64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
      if (aB64) {
        setAudioBase64Data(aB64);
        const audioBlob = new Blob([Uint8Array.from(atob(aB64), c => c.charCodeAt(0))], { type: 'audio/pcm' });
        setAudioUrl(URL.createObjectURL(audioBlob));
      }

      setStatus('Ready');
      addLog("Daily Content Cycle Rendered.", "success");

      // Auto Dispatch
      if (autopilot && activeCluster && clusterLinked && vB64 && aB64) {
        await dispatchToCluster(vB64, aB64);
      }
    } catch (err: any) {
      addLog(`Pipeline Error: ${err.message}`, "error");
      setStatus('Error');
    } finally {
      setGenerating(false);
    }
  }, [autoResearch, autopilot, activeCluster, clusterLinked, performResearch, prompt, script, addLog]);

  useEffect(() => {
    if (!autopilot) return;
    const interval = setInterval(() => {
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (time === pulseTime && lastPulse !== now.toDateString()) {
        setLastPulse(now.toDateString());
        generateAssets();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [autopilot, pulseTime, lastPulse, generateAssets]);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Content <span className="text-rose-500">Factory</span></h2>
          <p className="text-slate-500 text-sm font-mono uppercase mt-2 tracking-widest italic">Autonomous 24h Production Cycle</p>
        </div>
        
        <div className="flex gap-4">
           <div className={`glass px-6 py-3 rounded-2xl border flex items-center gap-6 transition-all ${autopilot ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800'}`}>
              <div className="flex items-center gap-3 border-r border-slate-800 pr-4">
                 <div className={`w-2 h-2 rounded-full ${clusterLinked ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`}></div>
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Cluster: {clusterLinked ? 'SYNCED' : 'OFFLINE'}</span>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-500 uppercase">Daily Pulse</p>
                <input 
                  type="time" 
                  value={pulseTime}
                  onChange={(e) => setPulseTime(e.target.value)}
                  className="bg-transparent text-xs font-mono text-white focus:outline-none"
                />
              </div>
              <button 
                onClick={() => setAutopilot(!autopilot)}
                className={`w-12 h-6 rounded-full relative transition-all ${autopilot ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autopilot ? 'left-7' : 'left-1'}`}></div>
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="glass p-8 rounded-[3rem] border border-slate-800 space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Daily Manifest Target</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Daily AI Market Update, Viral Stoic Quotes..."
                  className="w-full h-24 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-sm text-white focus:border-rose-500 focus:outline-none transition-all resize-none font-mono"
                />
             </div>
             
             <button 
               onClick={generateAssets}
               disabled={generating || isResearching}
               className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-xl disabled:opacity-30"
             >
               {generating || isResearching ? 'Node Processing...' : 'Manual Trigger Daily Cycle'}
             </button>
          </div>

          <div className="glass p-8 rounded-[3rem] border border-slate-800 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest italic">Autonomous Architecture</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-500">TREND RESEARCHER</span>
                <span className={autoResearch ? 'text-emerald-500' : 'text-slate-700'}>{autoResearch ? 'ACTIVE' : 'OFF'}</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-500">PRIMARY RENDERER (VEO)</span>
                <span className="text-blue-500">READY</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-500">REMOTE CLUSTER DISPATCH</span>
                <span className={clusterLinked ? 'text-emerald-500' : 'text-red-500'}>{clusterLinked ? 'ESTABLISHED' : 'STANDBY'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-[4rem] border border-slate-800 flex flex-col items-center justify-center bg-black/40 overflow-hidden relative min-h-[500px]">
          {videoUrl ? (
            <div className="w-full h-full p-8 flex flex-col items-center gap-6">
              <video src={videoUrl} controls autoPlay loop className="h-[400px] w-auto rounded-[2rem] border-4 border-slate-800 shadow-2xl" />
              <div className="flex gap-4">
                 <button 
                    onClick={() => videoBase64 && audioBase64Data && dispatchToCluster(videoBase64, audioBase64Data)} 
                    disabled={!clusterLinked}
                    className="px-10 py-4 bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-rose-500 shadow-xl shadow-rose-600/20 active:scale-95 disabled:opacity-30"
                 >
                   Manual Push to Cluster
                 </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-20 opacity-30">
              <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest italic">Awaiting Next Pulse: {pulseTime}</p>
            </div>
          )}

          {(generating || isResearching) && (
            <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl z-50 flex flex-col items-center justify-center space-y-6">
               <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
               <div className="text-center">
                 <p className="text-rose-500 font-black uppercase text-xs tracking-[0.4em] animate-pulse">{status}</p>
                 <p className="text-slate-600 text-[9px] font-mono mt-2 uppercase tracking-widest">Engaged Core Infrastructure</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
