import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface VisualLabProps {
  addLog: (msg: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
type ModelGrade = "flash" | "pro";
type ImageSize = "1K" | "2K" | "4K";

export const VisualLab: React.FC<VisualLabProps> = ({ addLog }) => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [modelGrade, setModelGrade] = useState<ModelGrade>("flash");
  const [imageSize, setImageSize] = useState<ImageSize>("1K");
  const [useSearch, setUseSearch] = useState(false);

  // Editing State
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [editMode, setEditMode] = useState(false);
  const [activeCrop, setActiveCrop] = useState<AspectRatio | "None">("None");
  const imgRef = useRef<HTMLImageElement>(null);

  const generateAsset = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    addLog(`INITIALIZING ${modelGrade.toUpperCase()} RENDER: "${prompt.substring(0, 30)}..."`, 'warn');
    
    try {
      if (modelGrade === 'pro') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          addLog("PRO RENDER REQUIRES PAID API KEY SELECTION.", "warn");
          await (window as any).aistudio.openSelectKey();
        }
      }

      // GUIDELINE: Always use process.env.API_KEY directly for @google/genai client initialization.
      if (!process.env.API_KEY && modelGrade === 'flash') {
        throw new Error("Google API Key missing in environment (process.env.API_KEY).");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const model = modelGrade === 'pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
      
      const config: any = {
        imageConfig: { 
          aspectRatio,
          ...(modelGrade === 'pro' && { imageSize })
        }
      };

      if (modelGrade === 'pro' && useSearch) {
        config.tools = [{ google_search: {} }];
      }

      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [{ text: `Professional, cinematic high-fidelity marketing asset, ${imageSize} resolution, futuristic aesthetic for AI-SaaS niche: ${prompt}` }]
        },
        config
      });

      const candidates = response.candidates || [];
      if (candidates.length === 0) throw new Error("No render candidates returned from the engine.");

      const parts = candidates[0].content.parts || [];
      let foundImage = false;
      
      for (const part of parts) {
        if (part.inlineData) {
          const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          setGeneratedImage(imageUrl);
          resetEdits(); // Reset filters for new image
          addLog(`${modelGrade.toUpperCase()} ASSET RENDERED AT ${imageSize} RESOLUTION.`, "success");
          foundImage = true;
          break;
        }
      }

      if (!foundImage) throw new Error("The engine failed to return image data. Check prompt safety or credits.");

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Visual engine error';
      addLog(`Render Failure: ${errorMsg}`, 'error');
      
      if (errorMsg.includes("Requested entity was not found")) {
        addLog("Project not found. Please re-select a paid API key.", "error");
        if (modelGrade === 'pro') await (window as any).aistudio.openSelectKey();
      }
    } finally {
      setGenerating(false);
    }
  };

  const resetEdits = () => {
    setBrightness(100);
    setContrast(100);
    setActiveCrop("None");
  };

  const handleDownload = () => {
    if (!imgRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    
    // Determine crop dimensions
    let sourceX = 0, sourceY = 0, sourceWidth = img.naturalWidth, sourceHeight = img.naturalHeight;
    
    if (activeCrop !== "None") {
      const [w, h] = activeCrop.split(':').map(Number);
      const targetRatio = w / h;
      const currentRatio = img.naturalWidth / img.naturalHeight;

      if (currentRatio > targetRatio) {
        sourceWidth = img.naturalHeight * targetRatio;
        sourceX = (img.naturalWidth - sourceWidth) / 2;
      } else {
        sourceHeight = img.naturalWidth / targetRatio;
        sourceY = (img.naturalHeight - sourceHeight) / 2;
      }
    }

    canvas.width = sourceWidth;
    canvas.height = sourceHeight;

    // Apply filters to context
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, sourceWidth, sourceHeight
    );

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `nexus_edited_${Date.now()}.png`;
    link.click();
    addLog("Edited asset exported to disk.", "success");
  };

  const ratios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];
  const sizes: ImageSize[] = ["1K", "2K", "4K"];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Visual <span className="text-blue-500">Lab</span></h2>
          <p className="text-slate-500 text-sm font-mono uppercase mt-2 tracking-widest">Phase 2 Asset Lab: Cinematic Thumbnail Generator</p>
        </div>
        
        <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
           {(["flash", "pro"] as ModelGrade[]).map(grade => (
             <button
               key={grade}
               onClick={() => {
                 setModelGrade(grade);
                 if (grade === 'flash') setUseSearch(false);
               }}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                 modelGrade === grade 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-500 hover:text-white'
               }`}
             >
               {grade} engine
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="glass p-10 rounded-[3.5rem] border border-slate-800 space-y-8">
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Thumbnail / Asset Concept</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe cinematic futuristic thumbnails. Ideal for Phase 2 faceless content channels."
                className="w-full h-40 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-lg focus:outline-none focus:border-blue-500/50 transition-all resize-none font-light placeholder:text-slate-700"
              />
            </div>

            {!editMode ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Aspect Ratio</label>
                    <div className="flex flex-wrap gap-2">
                      {ratios.map(r => (
                        <button
                          key={r}
                          onClick={() => setAspectRatio(r)}
                          className={`px-3 py-2 rounded-lg border text-[10px] font-black transition-all ${
                            aspectRatio === r 
                            ? 'bg-white text-black border-white' 
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center ml-1">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Render Grade</label>
                    </div>
                    <div className="flex gap-2">
                      {sizes.map(size => (
                        <button
                          key={size}
                          disabled={modelGrade === 'flash' && size !== '1K'}
                          onClick={() => setImageSize(size)}
                          className={`flex-1 py-2 rounded-lg border text-[10px] font-black transition-all ${
                            imageSize === size 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/10' 
                            : modelGrade === 'flash' && size !== '1K'
                              ? 'bg-black/50 border-slate-900 text-slate-800 cursor-not-allowed opacity-50'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-slate-800">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">World Grounding</p>
                      <p className="text-[9px] text-slate-500 font-mono">Reference live events for accurate news thumbnails.</p>
                   </div>
                   <button 
                    disabled={modelGrade !== 'pro'}
                    onClick={() => setUseSearch(!useSearch)}
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      modelGrade !== 'pro' ? 'bg-slate-900 opacity-50 cursor-not-allowed' :
                      useSearch ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                   >
                     <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${useSearch ? 'left-7' : 'left-1'}`}></div>
                   </button>
                </div>

                <button
                  onClick={generateAsset}
                  disabled={generating || !prompt.trim()}
                  className="w-full py-6 rounded-2xl font-black uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-4 bg-white text-black hover:bg-blue-600 hover:text-white shadow-2xl active:scale-95 disabled:bg-slate-900 disabled:text-slate-700"
                >
                  {generating ? 'Rendering Asset...' : 'Deploy Phase 2 Visual'}
                </button>
              </>
            ) : (
              // Edit Mode Toolbar
              <div className="space-y-8 animate-in slide-in-from-left-4">
                <div className="flex justify-between items-center">
                   <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">Asset Editing Console</h3>
                   <button onClick={() => setEditMode(false)} className="text-[10px] font-black uppercase text-slate-500 hover:text-white">Close Editor</button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Brightness</label>
                      <span className="text-[10px] font-mono text-white">{brightness}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={brightness} 
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contrast</label>
                      <span className="text-[10px] font-mono text-white">{contrast}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={contrast} 
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Reframing Overlays</label>
                    <div className="flex flex-wrap gap-2">
                      {["None", ...ratios].map(r => (
                        <button
                          key={r}
                          onClick={() => setActiveCrop(r as any)}
                          className={`px-3 py-2 rounded-lg border text-[10px] font-black transition-all ${
                            activeCrop === r 
                            ? 'bg-blue-600 text-white border-blue-500' 
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={resetEdits}
                    className="flex-1 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex-1 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
                  >
                    Export Final Master
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="glass p-8 rounded-[2rem] border border-slate-800 bg-blue-900/[0.02] space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Master Compliance
            </h4>
            <p className="text-slate-400 text-[10px] leading-relaxed font-mono">
              Generating Phase 2 content for high-CPM niches. Ensure all thumbnails follow platform safety guidelines to maximize organic reach and compound growth.
            </p>
          </div>
        </div>

        <div className="glass rounded-[3.5rem] border border-slate-800 flex flex-col items-center justify-center bg-black/40 overflow-hidden relative min-h-[500px] shadow-inner group">
          {generatedImage ? (
            <div className="w-full h-full relative flex flex-col items-center justify-center">
              <div 
                className={`relative overflow-hidden transition-all duration-500 ${activeCrop !== "None" ? 'shadow-[0_0_50px_rgba(59,130,246,0.3)]' : ''}`}
                style={{
                  aspectRatio: activeCrop !== "None" ? activeCrop.replace(':', '/') : 'auto',
                  maxHeight: '80%',
                  maxWidth: '90%'
                }}
              >
                <img 
                  ref={imgRef}
                  src={generatedImage} 
                  alt="Generated Asset" 
                  className="max-w-full max-h-full object-cover transition-all duration-300" 
                  style={{ 
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  }}
                />
              </div>

              <div className="absolute bottom-10 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 {!editMode && (
                   <button 
                    onClick={() => setEditMode(true)}
                    className="px-6 py-3 bg-slate-900/90 backdrop-blur-md text-white rounded-xl shadow-2xl hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest border border-slate-800"
                   >
                     Quick Refine
                   </button>
                 )}
                 <button 
                   onClick={handleDownload}
                   className="px-6 py-3 bg-white text-black rounded-xl shadow-2xl hover:bg-blue-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-transparent"
                 >
                   Export Master
                 </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-20">
              <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-800 group-hover:border-blue-500/30 transition-colors">
                <svg className="w-12 h-12 text-slate-800 group-hover:text-blue-500/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h4 className="text-slate-600 font-bold uppercase tracking-widest text-sm mb-2">Visual Lab Standby</h4>
              <p className="text-slate-700 font-mono text-[10px] uppercase max-w-xs mx-auto leading-relaxed">Neural manifest idle. Synchronize Concept Node to generate Phase 2 thumbnails or cinematic marketing assets.</p>
            </div>
          )}
          
          {generating && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-lg flex flex-col items-center justify-center animate-in fade-in z-20">
              <p className="text-white font-black uppercase text-xs tracking-[0.5em] animate-pulse">Rendering Pixel Stream...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
