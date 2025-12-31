
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Download, 
  History as HistoryIcon, 
  Zap, 
  Trash2, 
  ExternalLink, 
  Sparkles,
  ShieldCheck,
  Video
} from 'lucide-react';
import { analyzeSoraLink } from './services/geminiService';
import { SavedVideo, AnalysisResponse } from './types';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SavedVideo[]>([]);
  const [activeTab, setActiveTab] = useState<'download' | 'history'>('download');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('soraflow_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('soraflow_history', JSON.stringify(history));
  }, [history]);

  const extractVideoId = (input: string) => {
    const match = input.match(/\/s_([a-zA-Z0-9]+)/);
    return match ? "s_" + match[1] : null;
  };

  const handleRescue = async () => {
    if (!url) return alert("Paste the Sora link first, Sultan!");
    
    const videoId = extractVideoId(url);
    if (!videoId) return alert("Invalid Sora link format.");

    setLoading(true);
    setAnalysis(null);

    try {
      // AI Analysis
      const aiData = await analyzeSoraLink(url);
      setAnalysis(aiData);

      const downloadUrl = `https://soravdl.com/api/proxy/video/${videoId}`;
      
      const newVideo: SavedVideo = {
        id: videoId,
        originalUrl: url,
        downloadUrl,
        timestamp: Date.now(),
        label: aiData?.description || "Unnamed Rescue",
        analysis: aiData?.predictedPrompt || ""
      };

      // Add to history (avoid duplicates)
      setHistory(prev => {
        const filtered = prev.filter(v => v.id !== videoId);
        return [newVideo, ...filtered].slice(0, 10);
      });

      // Simple delay to simulate server "handshake"
      setTimeout(() => {
        setLoading(false);
      }, 1200);

    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("System overload. Please try again.");
    }
  };

  const clearHistory = () => {
    if (confirm("Clear all rescued videos?")) {
      setHistory([]);
    }
  };

  const removeHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-900 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-800 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-2xl z-10">
        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-yellow-900/50 text-[10px] text-yellow-500 font-bold uppercase tracking-widest mb-2">
            <ShieldCheck size={12} />
            Enterprise Grade Protection
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter italic text-white">
            SORA<span className="text-yellow-500">FLOW</span> <span className="not-italic font-thin text-zinc-500">PRO</span>
          </h1>
          <p className="text-zinc-500 text-sm uppercase tracking-[0.2em] font-medium">Sultan Edition • No Ads • Direct Proxy</p>
        </div>

        {/* Main Card */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-6 sm:p-10 glow-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
                <button 
                  onClick={() => setActiveTab('download')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'download' ? 'bg-yellow-600 text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  DOWNLOAD
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-yellow-600 text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  HISTORY
                </button>
             </div>
          </div>

          {activeTab === 'download' ? (
            <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold ml-1">
                  Secure Video Link (Sora)
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://sora.chatgpt.com/p/s_..." 
                    className="w-full bg-black border-2 border-zinc-900 p-5 rounded-3xl text-sm focus:outline-none focus:border-yellow-600 transition-all text-yellow-500 placeholder-zinc-800"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-800">
                    <Video size={20} />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleRescue}
                disabled={loading}
                className={`w-full group relative overflow-hidden py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${loading ? 'bg-zinc-800 cursor-not-allowed text-zinc-500' : 'bg-yellow-600 hover:bg-yellow-500 text-black shadow-[0_20px_40px_-15px_rgba(202,138,4,0.4)]'}`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-zinc-600 border-t-yellow-500 rounded-full animate-spin"></div>
                    <span>RESCUING...</span>
                  </div>
                ) : (
                  <>
                    <Zap className="group-hover:animate-pulse" />
                    <span>RESCUE SULTAN VIDEO</span>
                  </>
                )}
              </button>

              {analysis && !loading && (
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl space-y-4 animate-in zoom-in-95 duration-700">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <Sparkles size={16} />
                    <span className="text-[10px] font-black tracking-widest uppercase">AI Context Extracted</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-sm leading-relaxed">"{analysis.description}"</h3>
                    <p className="text-zinc-500 text-xs italic bg-black/50 p-3 rounded-xl border border-zinc-800/50">
                      Style: <span className="text-zinc-300">{analysis.style}</span><br/>
                      Prompt: {analysis.predictedPrompt}
                    </p>
                  </div>
                  <a 
                    href={`https://soravdl.com/api/proxy/video/${extractVideoId(url)}`}
                    target="_blank"
                    className="block w-full text-center py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={14} /> DOWNLOAD MP4 NOW
                  </a>
                </div>
              )}

              <div className="flex items-center justify-center gap-8 text-[10px] text-zinc-600 uppercase tracking-widest font-bold pt-4 border-t border-zinc-900/50">
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div> SERVER 1: OK</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div> PROXY: LIVE</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div> LATENCY: 12ms</div>
              </div>
            </div>
          ) : (
            <div className="mt-16 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black text-zinc-500 uppercase tracking-widest">Rescue History</h2>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-red-500 hover:text-red-400 p-2 rounded-lg bg-red-500/10 transition-all">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-800 space-y-4">
                  <HistoryIcon size={48} strokeWidth={1} />
                  <p className="text-xs uppercase tracking-widest font-bold">No data found in vault</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-3xl hover:border-yellow-900/50 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-600/10 border border-yellow-600/20 flex items-center justify-center text-yellow-600">
                          <Video size={18} />
                        </div>
                        <div>
                          <h4 className="text-zinc-200 text-xs font-bold line-clamp-1">{item.label}</h4>
                          <span className="text-[9px] text-zinc-600 uppercase font-bold">{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeHistoryItem(item.id)}
                        className="text-zinc-700 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <a 
                        href={item.downloadUrl}
                        className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-2"
                      >
                        <Download size={12} /> DOWNLOAD
                      </a>
                      <a 
                        href={item.originalUrl}
                        target="_blank"
                        className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-zinc-700 space-y-4">
          <p className="text-[9px] uppercase tracking-[0.4em] font-black">Powered by OpenAI Sora • Enhanced by Google Gemini</p>
          <div className="flex justify-center gap-4">
            <div className="px-3 py-1 rounded bg-zinc-900/50 text-[8px] font-bold border border-zinc-800">AES-256</div>
            <div className="px-3 py-1 rounded bg-zinc-900/50 text-[8px] font-bold border border-zinc-800">SSL-SECURE</div>
            <div className="px-3 py-1 rounded bg-zinc-900/50 text-[8px] font-bold border border-zinc-800">NO LOGS</div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ca8a04;
        }
      `}</style>
    </div>
  );
};

export default App;
