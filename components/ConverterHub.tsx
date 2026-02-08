import React, { useState, useRef, useEffect } from 'react';

interface ConverterHubProps {
  addLog: (msg: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

interface ConversionTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  input: string;
  output: string;
  color: string;
  revenuePotential: string;
}

export const ConverterHub: React.FC<ConverterHubProps> = ({ addLog }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeTool, setActiveTool] = useState<ConversionTool | null>(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [credits, setCredits] = useState(50);
  const [referralTraffic, setReferralTraffic] = useState(1240);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools: ConversionTool[] = [
    { id: 'img-pdf', name: 'Image to PDF', description: 'Convert PNG/JPG assets into professional vector PDFs.', icon: '📄', input: 'image/*', output: '.pdf', color: 'from-blue-600 to-indigo-700', revenuePotential: 'High' },
    { id: 'excel-pdf', name: 'Excel to PDF', description: 'Format complex spreadsheets into high-fidelity PDF reports.', icon: '📊', input: '.xlsx,.xls,.csv', output: '.pdf', color: 'from-emerald-600 to-teal-700', revenuePotential: 'Premium' },
    { id: 'pdf-img', name: 'PDF to Image', description: 'Extract pages from PDF manifests as high-res PNG buffers.', icon: '🖼️', input: '.pdf', output: '.png', color: 'from-purple-600 to-pink-700', revenuePotential: 'High' },
    { id: 'csv-json', name: 'CSV to JSON', description: 'Transform raw data tables into neural-ready JSON structures.', icon: '🧬', input: '.csv', output: '.json', color: 'from-amber-600 to-orange-700', revenuePotential: 'Enterprise' },
    { id: 'ocr-text', name: 'AI OCR Extraction', description: 'Neural vision to extract editable text from flattened images.', icon: '👁️', input: 'image/*', output: '.txt', color: 'from-cyan-600 to-blue-700', revenuePotential: 'Critical' },
    { id: 'vid-gif', name: 'Video to GIF', description: 'Optimize MP4 snippets into lightweight GIF sequences.', icon: '🎞️', input: 'video/*', output: '.gif', color: 'from-red-600 to-rose-700', revenuePotential: 'Viral' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setReferralTraffic(prev => prev + Math.floor(Math.random() * 3));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (!isBulkMode && files.length > 1) {
        setSelectedFiles([files[0]]);
        addLog("Single file mode active. Only the first asset was loaded.", "warn");
      } else {
        setSelectedFiles(files);
        addLog(`${files.length} file buffer(s) synchronized to hub.`, "info");
      }
    }
  };

  const startConversion = async () => {
    if (selectedFiles.length === 0 || !activeTool) return;
    if (credits < selectedFiles.length) {
      addLog("Insufficient session credits for batch operation.", "error");
      return;
    }

    setConverting(true);
    setProgress(0);
    setResultUrls([]);
    addLog(`Spawning autonomous workers for ${activeTool.name} cycle...`, "warn");

    const steps = [
      "Securing WASM Buffer...",
      "Analyzing Manifest Content...",
      "Neural Layer Mapping...",
      "Executing Binary Rewrite...",
      "Optimizing Asset Package...",
      "Finalizing Meta-data Integrity..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setStatusText(steps[i]);
      // Simulate faster/slower based on bulk
      const delay = isBulkMode ? 400 + Math.random() * 600 : 800 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Generate simulated download links
    const newResults = selectedFiles.map(f => {
      const simulatedBlob = new Blob([`Nexus Converted Output for ${f.name} using ${activeTool.id}`], { type: 'application/octet-stream' });
      return URL.createObjectURL(simulatedBlob);
    });

    setResultUrls(newResults);
    setCredits(prev => prev - selectedFiles.length);
    setConverting(false);
    addLog(`${activeTool.name} batch processed successfully. ${selectedFiles.length} assets ready.`, "success");
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Service <span className="text-purple-500">Hub</span></h2>
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-emerald-500 uppercase font-mono tracking-tighter">SEO Redirects: {referralTraffic}</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm font-mono uppercase tracking-widest italic">Autonomous High-Fidelity Conversion Gateway</p>
        </div>

        <div className="flex gap-4">
          <div className="glass px-6 py-2 border border-slate-800 rounded-2xl text-right">
            <p className="text-[8px] font-black text-slate-600 uppercase">Session Balance</p>
            <p className="text-sm font-mono font-black text-white">{credits} <span className="text-purple-500">/ 50</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool);
                  setResultUrls([]);
                  setSelectedFiles([]);
                }}
                className={`glass p-8 rounded-[2.5rem] border transition-all text-left group relative overflow-hidden ${
                  activeTool?.id === tool.id 
                    ? 'border-purple-500 bg-purple-500/[0.05] shadow-[0_0_40px_rgba(168,85,247,0.1)]' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${tool.color} opacity-50`}></div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-4xl group-hover:scale-110 transition-transform">{tool.icon}</span>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Revenue Potential</span>
                    <p className={`text-xs font-mono font-bold ${
                      tool.revenuePotential === 'Critical' ? 'text-red-500' :
                      tool.revenuePotential === 'Enterprise' ? 'text-purple-500' : 'text-emerald-500'
                    }`}>{tool.revenuePotential}</p>
                  </div>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2 italic group-hover:text-purple-400 transition-colors">{tool.name}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-mono">{tool.description}</p>
                <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8px] font-black uppercase text-slate-600">Route via Google:</span>
                  <span className="text-[8px] font-mono text-white">/convert/{tool.id}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass p-10 rounded-[3rem] border border-slate-800 bg-black/40 min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-purple-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                Node Controller
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-slate-600 uppercase">Batch Mode</span>
                <button 
                  onClick={() => setIsBulkMode(!isBulkMode)}
                  className={`w-10 h-5 rounded-full transition-all relative ${isBulkMode ? 'bg-purple-600' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isBulkMode ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            {!activeTool ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-50">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                   <svg className="w-10 h-10 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest leading-relaxed">Neural manifest idle. Synchronize an acquisition node to begin.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-8 animate-in slide-in-from-right-4">
                <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-3xl">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">Active Logic Pipeline</h4>
                   <p className="text-xl font-black italic text-white uppercase">{activeTool.name}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asset Manifest Input</label>
                    {isBulkMode && <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest">Multi-Select Enabled</span>}
                  </div>
                  <div 
                    onClick={() => !converting && fileInputRef.current?.click()}
                    className={`w-full h-44 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden relative group ${
                      selectedFiles.length > 0 ? 'border-emerald-500/50 bg-emerald-500/5 shadow-inner' : 'border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/5'
                    }`}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept={activeTool.input} multiple={isBulkMode} onChange={handleFileSelect} />
                    {selectedFiles.length > 0 ? (
                      <div className="text-center p-6">
                        <div className="flex justify-center -space-x-4 mb-4">
                          {selectedFiles.slice(0, 3).map((_, i) => (
                            <div key={i} className="w-10 h-10 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center text-xl shadow-2xl">📄</div>
                          ))}
                          {selectedFiles.length > 3 && (
                            <div className="w-10 h-10 bg-purple-900 rounded-lg border border-purple-700 flex items-center justify-center text-[10px] font-bold text-white shadow-2xl">+{selectedFiles.length - 3}</div>
                          )}
                        </div>
                        <p className="text-xs font-bold text-white truncate max-w-[200px]">
                          {selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} Assets Synchronized`}
                        </p>
                        <p className="text-[8px] font-mono text-slate-500 uppercase mt-1">Ready for Neural Rewrite</p>
                      </div>
                    ) : (
                      <div className="text-center p-6 opacity-40 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                          <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Drop Local File Buffers</p>
                      </div>
                    )}
                  </div>
                </div>

                {converting ? (
                  <div className="space-y-6 pt-4 animate-in fade-in">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest animate-pulse">{statusText}</span>
                      <span className="text-[10px] font-mono text-white">{Math.floor(progress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="grid grid-cols-6 gap-1 px-2">
                       {[...Array(6)].map((_, i) => (
                         <div key={i} className={`h-1 bg-purple-600 rounded-full transition-all duration-500 ${progress > (i * 16.6) ? 'opacity-100' : 'opacity-10'}`}></div>
                       ))}
                    </div>
                  </div>
                ) : resultUrls.length > 0 ? (
                  <div className="space-y-4 pt-4 animate-in zoom-in">
                    <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-[2.5rem] text-center shadow-xl shadow-emerald-500/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-6">Autonomous Processing Complete</p>
                      <div className="space-y-3">
                        {resultUrls.length === 1 ? (
                          <a 
                            href={resultUrls[0]} 
                            download={`nexus_final_${selectedFiles[0].name.split('.')[0]}${activeTool.output}`}
                            className="w-full inline-block px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-600/20 active:scale-95"
                          >
                            Export Master Asset
                          </a>
                        ) : (
                          <button 
                            onClick={() => {
                              resultUrls.forEach((url, i) => {
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `nexus_final_${selectedFiles[i].name.split('.')[0]}${activeTool.output}`;
                                link.click();
                              });
                            }}
                            className="w-full inline-block px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-600/20 active:scale-95"
                          >
                            Export Zip Manifest ({selectedFiles.length})
                          </button>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setResultUrls([]);
                        setSelectedFiles([]);
                      }}
                      className="w-full py-4 text-[10px] font-black uppercase text-slate-600 hover:text-white transition-colors"
                    >
                      New Acquisition Cycle
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      disabled={selectedFiles.length === 0}
                      onClick={startConversion}
                      className={`w-full py-6 rounded-2xl font-black uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-4 ${
                        selectedFiles.length > 0 
                          ? 'bg-white text-black hover:bg-purple-600 hover:text-white shadow-2xl active:scale-95' 
                          : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800'
                      }`}
                    >
                      Deploy Neural Agent
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                    <p className="text-[8px] font-mono text-slate-700 text-center uppercase tracking-widest">Estimated Compute: {(selectedFiles.length * 0.4).toFixed(2)}s per node</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass p-8 rounded-[2rem] border border-slate-800 bg-purple-900/[0.02] space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Acquisition Insights
            </h4>
            <p className="text-slate-400 text-[10px] leading-relaxed font-mono">
              The Google SEO Redirect module is currently capturing high-intent search traffic for the <span className="text-white italic">"Enterprise Excel to PDF"</span> query. Converters are the #1 entry point for high-LTV AI consulting leads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
