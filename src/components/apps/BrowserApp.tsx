import React, { useState } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, Search, Bookmark, ExternalLink } from 'lucide-react';

export const BrowserApp: React.FC = () => {
  const [url, setUrl] = useState('https://vyom.ai/docs');
  const [activeTab, setActiveTab] = useState('docs');

  return (
    <div id="browser-app-container" className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Tabs */}
      <div id="browser-tabs" className="flex items-center px-2 pt-2 bg-slate-950 border-b border-slate-800 gap-1">
        <button
          onClick={() => { setActiveTab('docs'); setUrl('https://vyom.ai/docs'); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium transition ${
            activeTab === 'docs' ? 'bg-slate-900 text-cyan-300 border-t border-x border-slate-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" /> Vyom Documentation
        </button>
        <button
          onClick={() => { setActiveTab('search'); setUrl('https://search.vyom.ai'); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium transition ${
            activeTab === 'search' ? 'bg-slate-900 text-cyan-300 border-t border-x border-slate-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-amber-400" /> Web Search
        </button>
      </div>

      {/* Address Bar */}
      <div id="browser-address-bar" className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-1 text-slate-400">
          <button className="p-1 rounded hover:bg-slate-800"><ArrowLeft className="w-3.5 h-3.5" /></button>
          <button className="p-1 rounded hover:bg-slate-800"><ArrowRight className="w-3.5 h-3.5" /></button>
          <button className="p-1 rounded hover:bg-slate-800"><RotateCw className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-200"
          />
        </div>
        <Bookmark className="w-4 h-4 text-slate-400 cursor-pointer hover:text-amber-400" />
      </div>

      {/* Page Content */}
      <div id="browser-web-content" className="flex-1 p-6 overflow-y-auto bg-slate-950/60 text-slate-200 select-text">
        {activeTab === 'docs' ? (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
              <h2 className="text-base font-bold text-cyan-300 mb-1">Vyom AI: Intelligent Computing Runtime</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vyom connects natural human speech and text commands with desktop application control, file discovery, and autonomous goal execution.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Command Architecture</h3>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <div>1. User Input (Hindi / Hinglish / English)</div>
                <div>2. Tokenization & Intent Classification (CommandEngine)</div>
                <div>3. Cognitive Logging & Intent Validation (Brain)</div>
                <div>4. Tool Resolution & Universal Launcher (ToolManager)</div>
                <div>5. Observation & Safety Verification (ObservationVerifier)</div>
              </div>

              <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] pt-2">Sample Multilingual Queries</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                <li>"Notepad kholo" (Hindi / Hinglish)</li>
                <li>"Open Calculator" (English)</li>
                <li>"Search file quarterly report"</li>
                <li>"System status kya hai?"</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto pt-8 text-center space-y-4">
            <div className="text-2xl font-bold text-cyan-400">Vyom Web Search</div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
              <Search className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="Search the web or ask Vyom..."
                className="w-full bg-transparent text-sm border-none outline-none text-slate-200"
              />
            </div>
            <div className="flex justify-center gap-3 text-xs text-slate-400">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">Trending: Autonomous AI</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">Multilingual LLM</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
