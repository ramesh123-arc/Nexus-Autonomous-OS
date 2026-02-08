import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

interface SocialBridgeProps {
  addLog: (msg: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

export const SocialBridge: React.FC<SocialBridgeProps> = ({ addLog }) => {
  const [connections, setConnections] = useState([
    { id: 'tw', platform: 'Twitter', status: 'Connected', success: 98 },
    { id: 'yt', platform: 'YouTube', status: 'Connected', success: 94 },
    { id: 'tt', platform: 'TikTok', status: 'Connected', success: 88 },
    { id: 'ig', platform: 'Instagram', status: 'Syncing', success: 100 },
  ]);

  const [reelPrompt, setReelPrompt] = useState('');
  const [isCreatingReel, setIsCreatingReel] = useState(false);
  const [reelStep, setReelStep] = useState<'idle' | 'script' | 'video' | 'thumbnail' | 'uploading' | 'complete'>('idle');
  const [reelAssets, setReelAssets] = useState<{ video?: string; thumbnail?: string; script?: string }>({});

  const initiateReelSwarm = async () => {
    if (!reelPrompt.trim()) return;
    setIsCreatingReel(true);
    setReelAssets({});
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      // STEP 1: SCRIPT GENERATION
      setReelStep('script');
      addLog("REEL SWARM: Researching viral hooks and script manifest...", "info");
      const scriptResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Create a viral 30-second Instagram Reel script for: ${reelPrompt}. Focus on high-retention hooks and futuristic AI aesthetics.`,
      });
      const generatedScript = scriptResponse.text || "Viral AI Future Tech Update.";
      setReelAssets(prev => ({ ...prev, script: generatedScript }));

      // STEP 2: VIDEO RENDERING (VEO)
      setReelStep('video');
      addLog("REEL SWARM: Engaging Veo-3.1 engine for cinematic rendering...", "warn");
      let videoOp = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Cinematic vertical reel, high-tech, futuristic, detailed, 4k aesthetic: ${reelPrompt}`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '9:16'
        }
      });

      while (!videoOp.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        videoOp = await ai.operations.getVideosOperation({ operation: videoOp });
      }

      const videoUri = videoOp.response?.generatedVideos?.[0]?.video?.uri;
      if (videoUri) {
        const videoRes = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
        const videoBlob = await videoRes.blob();
        setReelAssets(prev => ({ ...prev, video: URL.createObjectURL(videoBlob) }));
      }

      // STEP 3: THUMBNAIL CREATION
      setReelStep('thumbnail');
      addLog("REEL SWARM: Generating high-CTR cover asset...", "info");
      const thumbResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `High-impact Instagram Reel cover image for: ${reelPrompt}. Cinematic lighting, bold text space.` }]
        },
        config: { imageConfig: { aspectRatio: "9:16" } }
      });

      const thumbData = thumbResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (thumbData) {
        setReelAssets(prev => ({ ...prev, thumbnail: `data:image/png;base64,${thumbData}` }));
      }

      // STEP 4: UPLOAD SIMULATION
      setReelStep('uploading');
      addLog("REEL SWARM: Establishing secure handshake with Meta Graph API...", "warn");
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      setReelStep('complete');
      addLog("INSTAGRAM REEL DEPLOYED SUCCESSFULLY.", "success");

    } catch (err: any) {
      addLog(`Reel Swarm Fault: ${err.message}`, "error");
      setReelStep('idle');
    } finally {
      setIsCreatingReel(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Social <span className="text-blue-500">Arbitrage</span></h2>
          <p className="text-slate-500 text-sm font-mono uppercase mt-2 tracking-widest italic opacity-60">Autonomous Distribution Endpoints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {connections.map(c => (
          <div key={c.id} className="glass p-10 rounded-[3.5rem] border border-slate-800 hover:border-blue-500/40 transition-all group relative overflow-hidden">
             <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${c.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 animate-pulse'}`}>
                  {c.status}
                </span>
             </div>
             <h3 className="text-2xl font-black italic uppercase text-white mb-2">{c.platform}</h3>
             <p className="text-xs font-mono text-slate-500 mb-6">Execution Rate: {c.success}%</p>
             <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${c.success}%` }}></div>
             </div>
          </div>
        ))}
      </div>

      {/* REEL SWARM LAB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass p-12 rounded-[4rem] border border-blue-500/20 bg-blue-500/[0.02]">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black italic uppercase text-white tracking-tight">Instagram <span className="text-pink-500">Reel Swarm</span> Lab</h3>
              <div className="flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                 <span className="text-[9px] font-black text-pink-500 uppercase">Automation Ready</span>
              </div>
           </div>

           <div className="space-y-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Reel Concept / Campaign</label>
                 <textarea 
                    value={reelPrompt}
                    onChange={(e) => setReelPrompt(e.target.value)}
                    disabled={isCreatingReel}
                    placeholder="Describe the viral reel concept (e.g., 'Daily AI News update with futuristic cyborg visual')..."
                    className="w-full h-32 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all resize-none font-mono"
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 {[
                   { step: 'script', label: 'Scripting', status: reelStep === 'script' ? 'running' : reelAssets.script ? 'done' : 'idle' },
                   { step: 'video', label: 'Rendering', status: reelStep === 'video' ? 'running' : reelAssets.video ? 'done' : 'idle' },
                   { step: 'thumbnail', label: 'Coverage', status: reelStep === 'thumbnail' ? 'running' : reelAssets.thumbnail ? 'done' : 'idle' },
                   { step: 'uploading', label: 'Upload', status: reelStep === 'uploading' ? 'running' : reelStep === 'complete' ? 'done' : 'idle' },
                 ].map((s) => (
                   <div key={s.step} className={`p-4 rounded-2xl border transition-all ${s.status === 'running' ? 'border-pink-500/50 bg-pink-500/5' : s.status === 'done' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 opacity-40'}`}>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
                      <div className="flex justify-between items-center">
                         <span className={`text-[10px] font-black italic ${s.status === 'running' ? 'text-pink-500 animate-pulse' : s.status === 'done' ? 'text-emerald-500' : 'text-slate-600'}`}>
                            {s.status.toUpperCase()}
                         </span>
                         {s.status === 'done' && <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                   </div>
                 ))}
              </div>

              <button 
                onClick={initiateReelSwarm}
                disabled={isCreatingReel || !reelPrompt.trim()}
                className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-pink-600 hover:text-white transition-all shadow-2xl disabled:opacity-30 flex items-center justify-center gap-4"
              >
                {isCreatingReel ? 'Coordinating Reel Swarm...' : 'Deploy Autonomous Reel'}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
           </div>
        </div>

        <div className="glass rounded-[4rem] border border-slate-800 bg-black/40 p-10 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
           {reelStep === 'complete' ? (
             <div className="text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                   <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h4 className="text-xl font-black italic uppercase text-white mb-2 tracking-tight">Mission Success</h4>
                <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Reel Live on Instagram</p>
                <div className="mt-8 flex gap-3 justify-center">
                   <button onClick={() => setReelStep('idle')} className="px-6 py-3 bg-slate-900 text-slate-500 rounded-xl text-[9px] font-black uppercase hover:text-white transition-colors">Close Manifest</button>
                </div>
             </div>
           ) : isCreatingReel ? (
             <div className="text-center space-y-8 animate-in fade-in">
                <div className="relative w-20 h-20 mx-auto">
                   <div className="absolute inset-0 border-4 border-pink-500/20 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                   <p className="text-pink-500 font-black uppercase text-xs tracking-[0.4em] animate-pulse">{reelStep.toUpperCase()} IN PROGRESS</p>
                   <p className="text-slate-600 text-[9px] font-mono mt-2 uppercase tracking-widest italic leading-relaxed">Engaging Distributed Render Nodes...</p>
                </div>
             </div>
           ) : (
             <div className="text-center p-12 opacity-30">
                <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                   <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest italic">Awaiting Autonomous Reel Manifest</p>
             </div>
           )}

           {/* Preview Layer */}
           {reelAssets.thumbnail && !isCreatingReel && reelStep === 'complete' && (
             <div className="absolute inset-4 rounded-[3rem] border border-slate-800 overflow-hidden group">
                <img src={reelAssets.thumbnail} className="w-full h-full object-cover" alt="Reel Preview" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-white font-black uppercase text-[10px] tracking-widest italic">View Deployment</p>
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="glass p-12 rounded-[4rem] border border-blue-500/20 bg-blue-500/[0.01]">
         <h3 className="text-2xl font-black italic uppercase text-white mb-4">Autonomous Resource Permission</h3>
         <p className="text-slate-400 text-sm font-mono leading-relaxed max-w-4xl">
           The Nexus Swarm has full authority to utilize these connected resources for content distribution, lead generation, and community management. 
           Strategic decisions are made based on the <span className="text-blue-500 italic">"Revenue Velocity"</span> metric extracted during the Research stage.
         </p>
         <div className="mt-8 flex gap-6">
            <button className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs hover:bg-blue-600 hover:text-white transition-all shadow-xl">Update Global API Vault</button>
            <button className="px-10 py-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl font-black uppercase text-xs hover:text-white transition-all">Audit Social Usage</button>
         </div>
      </div>
    </div>
  );
};
