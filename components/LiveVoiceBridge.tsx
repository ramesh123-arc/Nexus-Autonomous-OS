import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface LiveVoiceBridgeProps {
  addLog: (msg: string, level?: 'info' | 'warn' | 'error' | 'success') => void;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VOICES = [
  { name: 'Zephyr', description: 'Fluid & Neutral' },
  { name: 'Puck', description: 'Energetic & Bright' },
  { name: 'Charon', description: 'Deep & Authoritative' },
  { name: 'Kore', description: 'Calm & Precise' },
  { name: 'Fenrir', description: 'Gravelly & Intense' }
];

export const LiveVoiceBridge: React.FC<LiveVoiceBridgeProps> = ({ addLog }) => {
  const [active, setActive] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [vadThreshold, setVadThreshold] = useState(15);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isMutedByVad, setIsMutedByVad] = useState(false);

  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextInRef.current) {
      audioContextInRef.current.close();
      audioContextInRef.current = null;
    }
    if (audioContextOutRef.current) {
      audioContextOutRef.current.close();
      audioContextOutRef.current = null;
    }
    analyserRef.current = null;
    setActive(false);
    setCurrentLevel(0);
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();
  }, []);

  const startSession = async () => {
    try {
      const apiKey = process.env.API_KEY || '';
      if (!apiKey) throw new Error("API Key Restricted.");

      addLog(`Initializing Live Audio Pathway: ${selectedVoice}...`, "warn");
      
      streamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true 
      });

      setActive(true);
      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const analyser = audioContextInRef.current.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const ai = new GoogleGenAI({ apiKey });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            addLog("Uplink Established.", "success");
            if (!audioContextInRef.current || !streamRef.current || !analyserRef.current) return;
            
            const sourceNode = audioContextInRef.current.createMediaStreamSource(streamRef.current);
            sourceNode.connect(analyserRef.current);
            
            const scriptProcessor = audioContextInRef.current.createScriptProcessor(4096, 1, 1);
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

            scriptProcessor.onaudioprocess = (e) => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const level = (sum / dataArray.length / 128) * 100;
              setCurrentLevel(level);
              
              if (level > vadThreshold) {
                setIsMutedByVad(false);
                const inputData = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
                
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ 
                    media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
                  });
                });
              } else {
                setIsMutedByVad(true);
              }
            };
            sourceNode.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioStr = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioStr && audioContextOutRef.current) {
              const buffer = await decodeAudioData(decode(audioStr), audioContextOutRef.current, 24000, 1);
              const source = audioContextOutRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextOutRef.current.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextOutRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              source.onended = () => sourcesRef.current.delete(source);
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => stopSession(),
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
          systemInstruction: 'You are Nexus OS. Direct, helpful, and sophisticated.',
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      addLog(`Uplink Failed: ${err.message}`, "error");
      stopSession();
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Vocal <span className="text-cyan-500">Bridge</span></h2>
          <p className="text-slate-500 text-[10px] font-mono uppercase mt-2 tracking-widest italic opacity-60">Neural Pulse & Synthesis Link</p>
        </div>
        <div className="flex gap-4">
           <div className="glass p-4 rounded-3xl border border-slate-800 space-y-2 min-w-[200px]">
              <div className="flex justify-between text-[8px] font-black uppercase text-slate-500">
                 <span>Sensitivity</span>
                 <span>{vadThreshold}%</span>
              </div>
              <input type="range" min="0" max="50" value={vadThreshold} onChange={(e) => setVadThreshold(Number(e.target.value))} className="w-full accent-cyan-500" />
           </div>
        </div>
      </div>

      <div className="glass rounded-[4rem] border border-cyan-500/10 h-[500px] flex flex-col items-center justify-center bg-black/40 relative overflow-hidden group">
         <div className={`w-64 h-64 rounded-full border-[12px] flex flex-col items-center justify-center cursor-pointer transition-all duration-700 relative z-10 ${
            active ? 'border-cyan-500/20 bg-cyan-500/10 shadow-[0_0_80px_rgba(6,182,212,0.2)] scale-105' : 'border-slate-800 bg-slate-900/40 hover:border-cyan-500/40'
         }`} onClick={active ? stopSession : startSession}>
            <svg className={`w-20 h-20 ${active ? (isMutedByVad ? 'text-slate-600' : 'text-cyan-400 animate-pulse') : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="absolute -bottom-10 text-[9px] font-black uppercase text-slate-500 tracking-[0.4em]">{active ? 'CONNECTED' : 'STANDBY'}</span>
            
            {active && (
              <div className="absolute inset-4 rounded-full border border-white/5 overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 bg-cyan-500/10 transition-all duration-75" style={{ height: `${currentLevel}%` }}></div>
              </div>
            )}
         </div>

         <div className="grid grid-cols-5 gap-4 mt-20 relative z-10">
            {VOICES.map(v => (
              <button key={v.name} onClick={() => setSelectedVoice(v.name)} disabled={active} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase border transition-all ${
                selectedVoice === v.name ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}>{v.name}</button>
            ))}
         </div>
      </div>
    </div>
  );
};
